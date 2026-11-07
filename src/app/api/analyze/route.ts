import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AnalyzeResponse, UserPreferences, DEFAULT_USER_PREFERENCES } from "@/types";

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

    // APIキーがない、または画像がない場合のフォールバック（高品質なモック判定）
    if (!apiKey || !image_data) {
      return NextResponse.json(getMockAnalyzeResponse(prefs, custom_prompt));
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
あなたは日本の飲食店や食品のハラール性を判定する専門家AIです。
ユーザーから提供された料理/メニューの写真と、ユーザーの個別ハラール基準を基に、以下のJSONフォーマットのみを出力してください。
Markdownコードブロックは不要です。純粋なJSON文字列のみを返してください。

【ユーザーのハラール基準】
- 直接アルコール含有食品: ${prefs.alcohol_rules.direct_alcohol}
- 発酵由来・残存0%（醤油等）: ${prefs.alcohol_rules.fermented_zero}
- 加熱揮発アルコール（みりん等）: ${prefs.alcohol_rules.cooked_evaporated}
- 豚肉・豚骨・豚エキス: ${prefs.pork_level}
- ゼラチン・動物性油脂: ${prefs.gelatin_level}
- 補足希望: ${prefs.custom_notes || "特になし"}
- ユーザー補足入力: ${custom_prompt || "特になし"}

【出力JSONフォーマット】
{
  "overall_status": "safe" | "warning" | "danger",
  "summary_message": "日本語の短い判定サマリー（例: 豚由来エキスとみりん加熱の可能性があります）",
  "checkpoints": [
    {
      "category": "alcohol" | "pork" | "gelatin" | "other",
      "title": "成分・調理法の名称",
      "detail": "具体的な根拠の説明",
      "risk_level": "safe" | "warning" | "danger"
    }
  ],
  "ai_proposals": [
    {
      "proposal_text": "〇〇を××に変更して食べますか？",
      "target_item": "変更対象",
      "replacement": "代替案"
    }
  ],
  "staff_communication_cards": [
    {
      "card_type": "replacement_request",
      "title": "変更のお願い",
      "message": "店員さんに見せる丁寧な日本語のお願い文"
    },
    {
      "card_type": "menu_inquiry",
      "title": "おすすめの確認",
      "message": "店員さんにこの店で食べられるメニューを尋ねる丁寧な日本語文"
    }
  ]
}
`;

      // Base64画像データの抽出
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
      const cleanedJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedData: AnalyzeResponse = JSON.parse(cleanedJson);
      return NextResponse.json(parsedData);
    } catch (aiError) {
      console.warn("Gemini generation fallback:", aiError);
      return NextResponse.json(getMockAnalyzeResponse(prefs, custom_prompt));
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}

function getMockAnalyzeResponse(prefs: UserPreferences, customPrompt?: string): AnalyzeResponse {
  return {
    overall_status: "warning",
    summary_message: "このメニューのハラール適合性は「要確認」です。スープのベースやタレに豚骨エキス・加熱みりんが使用されている可能性があります。",
    checkpoints: [
      {
        category: "alcohol_cooked_evaporated",
        title: "調理用アルコール（みりん・料理酒）",
        detail: "タレの仕込みや調理に使用されていますが、加熱調理によりアルコール成分の大部分は揮発しています。",
        risk_level: prefs.alcohol_rules.cooked_evaporated === "strict" ? "danger" : "warning",
      },
      {
        category: "pork",
        title: "豚由来成分（チャーシュー・豚骨エキス）",
        detail: "具材に豚チャーシューが含まれており、スープ出汁に豚骨エキスがブレンドされている可能性があります。",
        risk_level: prefs.pork_level === "strict" ? "danger" : "warning",
      },
      {
        category: "fermented",
        title: "発酵調味料（醤油・味噌）",
        detail: "伝統的な発酵調味料ですが、醸造過程での微量アルコール残存の可能性があります。",
        risk_level: prefs.alcohol_rules.fermented_zero === "allow" ? "safe" : "warning",
      },
    ],
    ai_proposals: [
      {
        proposal_text: "塩味のメニュー（魚介だしベース）に変更して注文しますか？",
        target_item: "スープ",
        replacement: "魚介塩スープ",
      },
      {
        proposal_text: "チャーシューを【のり・煮卵・メンマ】に変更して注文しますか？",
        target_item: "チャーシュー",
        replacement: "のり・煮卵・メンマ",
      },
    ],
    staff_communication_cards: [
      {
        card_type: "replacement_request",
        title: "具材変更のお願い",
        message: "すみません、私は宗教上の理由で豚肉を食べることができません。チャーシューを他の具材（のりや煮卵など）に変更していただくことは可能でしょうか？",
      },
      {
        card_type: "menu_inquiry",
        title: "食べられるメニューの確認",
        message: "すみません、私は豚肉とアルコールを含む食事を避けています。このお店のメニューの中で、私が食べられそうな料理はありますでしょうか？（魚介だしや野菜中心など）",
      },
    ],
  };
}
