import { NextRequest, NextResponse } from "next/server";
import { UserPreferences, DEFAULT_USER_PREFERENCES, EnhancedAnalyzeResult } from "@/types";
import { buildAnalyzePrompt } from "@/lib/analyze/prompt";
import { getMockResult } from "@/lib/analyze/mock";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image_data, user_preferences, custom_prompt } = body as {
      image_data?: string;
      user_preferences?: UserPreferences;
      custom_prompt?: string;
    };

    const prefs = user_preferences || DEFAULT_USER_PREFERENCES;

    // 画像がない、または明示的なデモ実行の場合はモックを返す
    if (!image_data || image_data === "demo") {
      return NextResponse.json(getMockResult(prefs, custom_prompt));
    }

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

    try {
      const prompt = buildAnalyzePrompt(prefs, custom_prompt);

      let base64Data = image_data;
      let mimeType = "image/jpeg";
      if (image_data.startsWith("data:")) {
        const parts = image_data.split(";base64,");
        mimeType = parts[0].replace("data:", "") || "image/jpeg";
        base64Data = parts[1];
      }

      // 高速・高精度・混雑知らずの Google Gemini 3.5 Flash Lite（公式推奨モデル）
      const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";

      const res = await fetch(apiUrl, {
        method: "POST",
        // キーを URL に載せるとログやエラーメッセージに残りやすいため、ヘッダで渡す
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
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
      console.error("=== Gemini API Call Failed ===");
      console.error(aiError);
      console.error("===============================");
      // 失敗を別料理のモックで隠さない。フロントは !res.ok で再撮影を促すアラートを出す
      return NextResponse.json({ error: "AI解析に失敗しました" }, { status: 502 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
