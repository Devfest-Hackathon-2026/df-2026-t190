import { NextRequest, NextResponse } from "next/server";
import { UserPreferences, DEFAULT_USER_PREFERENCES, EnhancedAnalyzeResult, ToleranceLevel } from "@/types";
import { buildAnalyzePrompt } from "@/lib/analyze/prompt";
import { getMockResult } from "@/lib/analyze/mock";

/** Gemini の応答を待つ上限。超えたら打ち切って 504 を返す（無期限に「分析中」のままにしない） */
const GEMINI_TIMEOUT_MS = 30_000;

/** 明示的なデモ実行を表す image_data の値（モックを返す） */
const DEMO_IMAGE_DATA = "demo";

/**
 * image_data（data URL 文字列）の長さ上限。
 * フロント（page.tsx の resizeImage）は長辺 800px・JPEG 品質 0.8 に縮小して送るため、通常は数百KB。
 * 縮小に失敗したときはカメラ画像（最大 4K 程度の JPEG）がそのまま届くので、それも通る値にしている。
 */
const MAX_IMAGE_DATA_LENGTH = 10 * 1024 * 1024;

/** リクエスト本文全体の上限。画像に加えて設定・自由記述が載る分の余裕を持たせる */
const MAX_REQUEST_BODY_BYTES = MAX_IMAGE_DATA_LENGTH + 1024 * 1024;

/** 受け付ける画像の data URL。Gemini にそのまま渡せる形式だけに絞る */
const IMAGE_DATA_URL_PATTERN = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/;

const TOLERANCE_LEVELS: readonly ToleranceLevel[] = ["strict", "conditional", "allow"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** strict | conditional | allow 以外は既定値に落とす */
function toToleranceLevel<T extends ToleranceLevel | undefined>(value: unknown, fallback: T): ToleranceLevel | T {
  return TOLERANCE_LEVELS.find((level) => level === value) ?? fallback;
}

/**
 * クライアントから届いた設定を検証する。
 * user_preferences 自体が無ければ従来どおり既定設定をそのまま使い、
 * 個々の値が不正なら既定値に落とす（プロンプト側の既定値と同じ値）。
 */
function sanitizePreferences(raw: unknown): UserPreferences {
  if (!isRecord(raw)) return DEFAULT_USER_PREFERENCES;

  const defaults = DEFAULT_USER_PREFERENCES;
  const alcohol = isRecord(raw.alcohol_rules) ? raw.alcohol_rules : {};
  return {
    alcohol_rules: {
      direct_alcohol: toToleranceLevel(alcohol.direct_alcohol, defaults.alcohol_rules.direct_alcohol),
      fermented_zero: toToleranceLevel(alcohol.fermented_zero, defaults.alcohol_rules.fermented_zero),
      cooked_evaporated: toToleranceLevel(alcohol.cooked_evaporated, defaults.alcohol_rules.cooked_evaporated),
    },
    pork_level: toToleranceLevel(raw.pork_level, defaults.pork_level),
    non_halal_meat_level: toToleranceLevel(raw.non_halal_meat_level, defaults.non_halal_meat_level),
    gelatin_level: toToleranceLevel(raw.gelatin_level, defaults.gelatin_level),
    custom_notes: typeof raw.custom_notes === "string" ? raw.custom_notes : "",
  };
}

export async function POST(req: NextRequest) {
  // 本文を読む前に Content-Length で巨大なリクエストを弾く
  if (Number(req.headers.get("content-length")) > MAX_REQUEST_BODY_BYTES) {
    return NextResponse.json({ error: "画像のサイズが大きすぎます" }, { status: 413 });
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "リクエストが JSON ではありません" }, { status: 400 });
    }
    if (!isRecord(body)) {
      return NextResponse.json({ error: "リクエストの形式が正しくありません" }, { status: 400 });
    }

    const { image_data, user_preferences } = body;
    const custom_prompt = typeof body.custom_prompt === "string" ? body.custom_prompt : undefined;
    const prefs = sanitizePreferences(user_preferences);

    // 画像がない、または明示的なデモ実行の場合はモックを返す
    if (!image_data || image_data === DEMO_IMAGE_DATA) {
      return NextResponse.json(getMockResult(prefs, custom_prompt));
    }

    if (typeof image_data !== "string") {
      return NextResponse.json({ error: "image_data は文字列で指定してください" }, { status: 400 });
    }
    // Content-Length が無いリクエストもあるため、本文を読んだ後にも長さを確かめる
    if (image_data.length > MAX_IMAGE_DATA_LENGTH) {
      return NextResponse.json({ error: "画像のサイズが大きすぎます" }, { status: 413 });
    }
    const imageMatch = IMAGE_DATA_URL_PATTERN.exec(image_data);
    if (!imageMatch) {
      return NextResponse.json(
        { error: "image_data は JPEG・PNG・WebP の data URL（base64）で指定してください" },
        { status: 400 }
      );
    }
    const [, mimeType, base64Data] = imageMatch;

    // .env.local は Next.js が自動で読み込むため、ここでは process.env だけを見る
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // 本番で別料理のモックを本物の判定のように見せないよう、明示的なエラーにする
      if (process.env.NODE_ENV === "production") {
        console.error("GEMINI_API_KEY が設定されていないため AI 解析を実行できません");
        return NextResponse.json({ error: "AI解析の設定が完了していません" }, { status: 503 });
      }
      console.warn("GEMINI_API_KEY が未設定のため、開発用のモックを返します");
      return NextResponse.json(getMockResult(prefs, custom_prompt));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
    try {
      const prompt = buildAnalyzePrompt(prefs, custom_prompt);

      // 高速・高精度・混雑知らずの Google Gemini 3.5 Flash Lite（公式推奨モデル）
      const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";

      const res = await fetch(apiUrl, {
        method: "POST",
        // キーを URL に載せるとログやエラーメッセージに残りやすいため、ヘッダで渡す
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error("Gemini API Error status:", res.status, errBody);
        throw new Error(`Gemini API error ${res.status}: ${errBody}`);
      }

      const responseData = await res.json();
      const parts = responseData.candidates?.[0]?.content?.parts || [];
      const validPart =
        parts.find((p: { text?: string; thought?: boolean }) => p.text && !p.thought) ||
        parts[parts.length - 1];

      const rawText = validPart?.text || "";
      const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const result: EnhancedAnalyzeResult = JSON.parse(cleaned);

      console.log("=== AI Analysis Succeeded ===");
      console.log("Recognized Dish:", result.dish_name);
      console.log("Checkpoints count:", result.checkpoints?.length);
      console.log("==============================");

      return NextResponse.json(result);
    } catch (aiError) {
      if (controller.signal.aborted) {
        console.error(`Gemini API が ${GEMINI_TIMEOUT_MS}ms 以内に応答しなかったため打ち切りました`);
        return NextResponse.json({ error: "AI解析がタイムアウトしました" }, { status: 504 });
      }
      console.error("=== Gemini API Call Failed ===");
      console.error(aiError);
      console.error("===============================");
      // 失敗を別料理のモックで隠さない。フロントは !res.ok で再撮影を促すアラートを出す
      return NextResponse.json({ error: "AI解析に失敗しました" }, { status: 502 });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
