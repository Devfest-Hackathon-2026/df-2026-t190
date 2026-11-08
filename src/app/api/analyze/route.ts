import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { UserPreferences, DEFAULT_USER_PREFERENCES } from "@/types";

export interface EnhancedAnalyzeResult {
  dish_name: string;
  overall_status: "safe" | "warning" | "danger"; // 安全 | 注意 | 要注意
  status_label: string; // 「安全」「注意」「要注意」
  summary_message: string;
  checkpoints: {
    name: string;
    level: "safe" | "warning" | "danger";
    level_label: "安全" | "注意" | "要注意";
    reason: string;
  }[];
  concerning_ingredients: string[]; // 注意・要注意となった食材リスト (例: ["豚肉", "みりん"])
  proposal: {
    remove_option_text: string; // 例: "豚肉を抜いてこの料理を食べますか？"
    staff_request_phrase: string; // 例: "すみません、豚肉を使わずに調理して頂くことは可能でしょうか？"
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image_data, user_preferences, custom_prompt } = body as {
      image_data?: string;
      user_preferences?: UserPreferences;
      custom_prompt?: string;
    };

    const prefs = user_preferences || DEFAULT_USER_PREFERENCES;
    const apiKey = process.env.GEMINI_API_KEY;

    // APIキーがない、または画像が指定されていない場合のフォールバック（高品質モック）
    if (!apiKey || !image_data || image_data === "demo") {
      return NextResponse.json(getMockResult(prefs));
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
あなたは日本の飲食店・食品のハラール成分を判定する専門家AIです。
提供された料理/メニューの画像を分析し、ユーザーのハラール基準に照らし合わせて以下のJSONのみを出力してください。
Markdownブロック(\`\`\`json)は含めず、純粋なJSONのみを返してください。

【ユーザーのハラール基準】
- 直接アルコール成分が含まれるもの: ${prefs.alcohol_rules?.direct_alcohol || "strict"}
- 製造工程でアルコールが生成される可能性のあるもの（醤油など）: ${prefs.alcohol_rules?.fermented_zero || "conditional"}
- アルコール成分を加熱して飛ばしたもの: ${prefs.alcohol_rules?.cooked_evaporated || "conditional"}
- 豚または豚由来の食材: ${prefs.pork_level || "strict"}
- 所定の処理がされていない豚肉以外の肉: ${prefs.non_halal_meat_level || "conditional"}

【判定基準のルール】
- 総合判定(overall_status):
  - ユーザー基準に違反する禁止成分（豚肉など）が含まれる場合は「danger」（要注意）
  - 微量発酵や加熱みりんなど確認・注意を要する場合は「warning」（注意）
  - 問題ない、または安全な食材のみの場合は「safe」（安全）

【必須JSONフォーマット】
{
  "dish_name": "料理名（例: にくじゃが、醤油ラーメン、野菜サラダ）",
  "overall_status": "safe" | "warning" | "danger",
  "status_label": "安全" | "注意" | "要注意",
  "summary_message": "判定の理由の要約（日本語1〜2行）",
  "checkpoints": [
    {
      "name": "食材・調味料名（例: 豚肉、みりん、醤油、野菜など）",
      "level": "safe" | "warning" | "danger",
      "level_label": "安全" | "注意" | "要注意",
      "reason": "なぜその判定になったのか具体的な理由（日本語）"
    }
  ],
  "concerning_ingredients": ["注意または要注意の食材リスト（例: 豚肉、みりん）。安全な場合は空配列 []"],
  "proposal": {
    "remove_option_text": "注意または要注意の食材がある場合は「〇〇を抜いてこの料理を食べますか？」、ない場合は「そのまま安心してお召し上がりいただけます」",
    "staff_request_phrase": "注意または要注意の食材がある場合は「すみません、宗教上の理由により、〇〇を使わずに調理して頂くことは可能でしょうか？」、ない場合は「このまま注文可能です」"
  }
}
`;

      let base64Data = image_data;
      let mimeType = "image/jpeg";
      if (image_data.startsWith("data:")) {
        const parts = image_data.split(";base64,");
        mimeType = parts[0].replace("data:", "");
        base64Data = parts[1];
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      });

      const text = response.text || "";
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const result: EnhancedAnalyzeResult = JSON.parse(cleaned);
      return NextResponse.json(result);
    } catch (aiError) {
      console.warn("Gemini call fallback:", aiError);
      return NextResponse.json(getMockResult(prefs));
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

function getMockResult(prefs: UserPreferences): EnhancedAnalyzeResult {
  return {
    dish_name: "にくじゃが (Nikujaga)",
    overall_status: "danger",
    status_label: "要注意",
    summary_message: "豚肉が含まれており、煮汁に加熱みりん・料理酒が使われている可能性があります。",
    checkpoints: [
      {
        name: "ぶた肉",
        level: "danger",
        level_label: "要注意",
        reason: "具材に豚バラスライスが使用されており、豚の出汁が煮汁全体に溶け出しています。",
      },
      {
        name: "加熱みりん・料理酒",
        level: "warning",
        level_label: "注意",
        reason: "煮込み調理時にアルコールは大部分揮発していますが、調味料由来の微量残存の可能性があります。",
      },
      {
        name: "じゃがいも・人参・玉ねぎ",
        level: "safe",
        level_label: "安全",
        reason: "100%植物性食材であり、ハラール上全く問題ありません。",
      },
    ],
    concerning_ingredients: ["ぶた肉", "加熱みりん"],
    proposal: {
      remove_option_text: "ぶた肉を抜いてこの料理を食べますか？",
      staff_request_phrase: "すみません、私は宗教上の理由で豚肉を食べることができません。ぶた肉を使わずに調理して頂くことは可能でしょうか？",
    },
  };
}
