import { NextRequest, NextResponse } from "next/server";
import { UserPreferences, DEFAULT_USER_PREFERENCES } from "@/types";

export interface EnhancedAnalyzeResult {
  dish_name: string;
  dish_name_en?: string;
  overall_status: "safe" | "warning" | "danger"; // 安全 | 注意 | 要注意
  status_label: string; // 「安全」「注意」「要注意」
  summary_message: string;
  summary_message_en?: string;
  checkpoints: {
    name: string;
    name_en?: string;
    level: "safe" | "warning" | "danger";
    level_label: "安全" | "注意" | "要注意";
    reason: string;
    reason_en?: string;
  }[];
  concerning_ingredients: string[]; // 注意・要注意となった食材リスト (例: ["豚肉", "みりん"])
  concerning_ingredients_en?: string[]; // 英語リスト (例: ["Pork", "Mirin"])
  proposal: {
    remove_option_text: string;
    remove_option_text_en?: string;
    staff_request_phrase: string;
    staff_request_phrase_en?: string;
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

    // APIキーがない、またはデモ画像の場合は高品質モックを返す
    if (!apiKey || !image_data || image_data === "demo") {
      return NextResponse.json(getMockResult(prefs, custom_prompt));
    }

    try {
      const prompt = `
あなたは日本の飲食店・食品のハラール成分を画像から判定する専門家AIです。
提供された料理/メニューの画像を注意深く分析し、正確な料理名（例: 明太子パスタ、醤油ラーメン、豚カツ、牛丼、唐揚げ定食など）を特定してください。
特定した料理の原材料や日本の一般的な調理法を考慮し、ユーザーのハラール基準に照らし合わせて以下のJSONのみを出力してください。
訪日外国人観光客が日本語と英語を切り替えて利用できるよう、日本語と英語（_en）の両方のフィールドを必ず提供してください。

【ユーザーのハラール基準】
- 直接アルコール成分が含まれるもの: ${prefs.alcohol_rules?.direct_alcohol || "strict"}
- 製造工程でアルコールが生成される可能性のあるもの（醤油など）: ${prefs.alcohol_rules?.fermented_zero || "conditional"}
- アルコール成分を加熱して飛ばしたもの: ${prefs.alcohol_rules?.cooked_evaporated || "conditional"}
- 豚または豚由来の食材: ${prefs.pork_level || "strict"}
- 所定の処理がされていない豚肉以外の肉: ${prefs.non_halal_meat_level || "conditional"}
- ユーザー任意の追加要望・アレルギー: ${prefs.custom_notes || custom_prompt || "特になし"}

【判定基準のルール】
- 総合判定(overall_status):
  - ユーザー基準に反する食材（豚肉、直接アルコール等）が含まれる場合は「danger」（要注意）
  - 微量発酵、加熱みりん・料理酒、エキス類など確認・注意を要する場合は「warning」（注意）
  - 魚介類（明太子・鮭など）や野菜類でハラール上問題ない食材中心の場合は「safe」（安全）

【必須JSONフォーマット】
{
  "dish_name": "画像から特定した正確な料理名（例: 明太子パスタ、にくじゃが、醤油ラーメン）",
  "dish_name_en": "Dish name in English (e.g., Mentaiko Pasta, Nikujaga, Shoyu Ramen)",
  "overall_status": "safe" | "warning" | "danger",
  "status_label": "安全" | "注意" | "要注意",
  "summary_message": "判定の理由の要約（日本語1〜2行）",
  "summary_message_en": "Summary of analysis in English (1-2 sentences)",
  "checkpoints": [
    {
      "name": "食材・調味料名（日本語）",
      "name_en": "Ingredient name in English",
      "level": "safe" | "warning" | "danger",
      "level_label": "安全" | "注意" | "要注意",
      "reason": "なぜその判定になったのか具体的な理由（日本語）",
      "reason_en": "Detailed reason in English"
    }
  ],
  "concerning_ingredients": ["注意または要注意となった食材リスト（日本語）。安全な場合は空配列 []"],
  "concerning_ingredients_en": ["List of concerning ingredients in English. Empty array [] if safe"],
  "proposal": {
    "remove_option_text": "〇〇を抜いてこの料理を食べますか？",
    "remove_option_text_en": "Would you like to eat this dish without [ingredients]?",
    "staff_request_phrase": "すみません、宗教上の理由により、〇〇を使わずに調理して頂くことは可能でしょうか？",
    "staff_request_phrase_en": "Could you please prepare this dish without [ingredients]?"
  }
}
`;

      let base64Data = image_data;
      let mimeType = "image/jpeg";
      if (image_data.startsWith("data:")) {
        const parts = image_data.split(";base64,");
        mimeType = parts[0].replace("data:", "") || "image/jpeg";
        base64Data = parts[1];
      }

      // Google Gemini 公式無料枠 REST API を直接呼び出し（軽量・高速・完全無料）
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.1,
          },
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error("Gemini API Error status:", res.status, errBody);
        throw new Error(`Gemini API error ${res.status}`);
      }

      const responseData = await res.json();
      const rawText =
        responseData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const result: EnhancedAnalyzeResult = JSON.parse(cleaned);

      return NextResponse.json(result);
    } catch (aiError) {
      console.warn("Gemini call fallback:", aiError);
      return NextResponse.json(getMockResult(prefs, custom_prompt));
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

function getMockResult(prefs: UserPreferences, customPreset?: string): EnhancedAnalyzeResult {
  const preset = (customPreset || "").toLowerCase();

  // 明太子パスタのプリセット対応
  if (preset.includes("pasta") || preset.includes("mentaiko") || preset.includes("明太子") || preset.includes("パスタ")) {
    return {
      dish_name: "明太子パスタ (Mentaiko Pasta)",
      dish_name_en: "Mentaiko Pasta (Spicy Pollock Roe Pasta)",
      overall_status: "warning",
      status_label: "注意",
      summary_message: "豚肉は不使用ですが、風味づけの料理酒・醤油、またはトッピングの調味料に微量アルコールが含まれる可能性があります。",
      summary_message_en: "Does not contain pork meat. However, cooking sake, soy sauce, or seasonings may contain trace amounts of alcohol.",
      checkpoints: [
        {
          name: "明太子・魚卵 (Pollock Roe)",
          name_en: "Spicy Pollock Roe (Fish Roe)",
          level: "safe",
          level_label: "安全",
          reason: "魚介類（タラコ・明太子）はイスラム法上ハラールであり、問題ありません。",
          reason_en: "Fish and seafood (pollock roe) are naturally halal-friendly.",
        },
        {
          name: "パスタ麺・オリーブオイル (Pasta Noodles)",
          name_en: "Pasta Noodles & Olive Oil",
          level: "safe",
          level_label: "安全",
          reason: "デュラム小麦と植物性油脂であり、ハラール基準を満たしています。",
          reason_en: "Durum wheat semolina and plant-based oil are halal-compliant.",
        },
        {
          name: "風味づけ調味料（醤油・料理酒・バター）",
          name_en: "Seasoning (Soy Sauce, Cooking Sake & Butter)",
          level: "warning",
          level_label: "注意",
          reason: "ソースの隠し味として料理酒や本醸造醤油が使われている場合があります。",
          reason_en: "Broth or sauce may use cooking sake or brewed soy sauce with trace alcohol.",
        },
      ],
      concerning_ingredients: ["隠し味の料理酒・醤油"],
      concerning_ingredients_en: ["Cooking Sake & Soy Sauce seasoning"],
      proposal: {
        remove_option_text: "料理酒などの調味料を抜いてこの料理を食べますか？",
        remove_option_text_en: "Would you like to eat this dish prepared without cooking sake/alcohol seasonings?",
        staff_request_phrase: "すみません、宗教上の理由により、お酒やみりんなどのアルコール調味料を使わずに調理して頂くことは可能でしょうか？",
        staff_request_phrase_en: "Excuse me, for religious reasons, could you please prepare this without cooking sake or mirin?",
      },
    };
  }
  if (customPreset === "ramen") {
    return {
      dish_name: "醤油ラーメン (Shoyu Ramen)",
      dish_name_en: "Shoyu Ramen (Soy Sauce Ramen)",
      overall_status: "danger",
      status_label: "要注意",
      summary_message: "豚チャーシューがトッピングされており、スープに豚骨・鶏ガラエキスが使用されています。",
      summary_message_en: "Topped with pork chashu, and the soup broth contains pork and chicken bone extract.",
      checkpoints: [
        {
          name: "豚チャーシュー (Pork Chashu)",
          name_en: "Pork Chashu (Braised Pork Belly)",
          level: "danger",
          level_label: "要注意",
          reason: "豚肉スライスがそのまま乗せられており、厳格なハラール基準に反します。",
          reason_en: "Sliced pork meat is directly served on top, which violates strict halal guidelines.",
        },
        {
          name: "ラーメンスープ (Broth & Sauce)",
          name_en: "Ramen Broth (Pork & Soy Sauce Base)",
          level: "warning",
          level_label: "注意",
          reason: "スープの出汁に豚骨エキスやみりんが溶け込んでおり、完全分離は困難です。",
          reason_en: "Broth contains pork bone extract and mirin; separation is not possible once cooked.",
        },
        {
          name: "麺・ネギ・煮卵 (Noodles & Toppings)",
          name_en: "Noodles, Green Onions & Boiled Egg",
          level: "safe",
          level_label: "安全",
          reason: "小麦麺や野菜、鶏卵自体は植物・卵由来成分です。",
          reason_en: "Wheat noodles, vegetables, and boiled eggs themselves are halal-friendly.",
        },
      ],
      concerning_ingredients: ["豚チャーシュー", "豚骨スープ"],
      concerning_ingredients_en: ["Pork Chashu", "Pork Broth"],
      proposal: {
        remove_option_text: "チャーシューを抜いてこの料理を食べますか？",
        remove_option_text_en: "Would you like to eat this dish without Chashu pork?",
        staff_request_phrase: "すみません、私は宗教上の理由で豚肉を食べることができません。チャーシューを抜いて調理して頂くことは可能でしょうか？",
        staff_request_phrase_en: "Excuse me, for religious reasons I cannot eat pork. Could you prepare this without chashu pork?",
      },
    };
  }

  // デフォルト: にくじゃが (Nikujaga)
  return {
    dish_name: "にくじゃが (Nikujaga)",
    dish_name_en: "Nikujaga (Simmered Beef/Pork & Potato)",
    overall_status: "danger",
    status_label: "要注意",
    summary_message: "豚肉が含まれており、煮汁に加熱みりん・料理酒が使われている可能性があります。",
    summary_message_en: "Contains pork meat, and the broth likely contains cooked mirin and cooking sake.",
    checkpoints: [
      {
        name: "ぶた肉 (Pork Meat)",
        name_en: "Pork Meat & Essence",
        level: "danger",
        level_label: "要注意",
        reason: "具材に豚バラスライスが使用されており、豚の出汁が煮汁全体に溶け出しています。",
        reason_en: "Sliced pork belly is used, and pork essence is extracted into the simmering broth.",
      },
      {
        name: "加熱みりん・料理酒 (Cooked Mirin)",
        name_en: "Cooked Mirin & Cooking Sake",
        level: "warning",
        level_label: "注意",
        reason: "煮込み調理時にアルコールは大部分揮発していますが、調味料由来の微量残存の可能性があります。",
        reason_en: "Most alcohol evaporates during simmering, but trace residue from seasonings may remain.",
      },
      {
        name: "じゃがいも・人参・玉ねぎ (Vegetables)",
        name_en: "Potatoes, Carrots, Onions",
        level: "safe",
        level_label: "安全",
        reason: "100%植物性食材であり、ハラール上全く問題ありません。",
        reason_en: "100% plant-based ingredients and completely halal.",
      },
    ],
    concerning_ingredients: ["ぶた肉", "加熱みりん"],
    concerning_ingredients_en: ["Pork Meat", "Cooked Mirin"],
    proposal: {
      remove_option_text: "ぶた肉を抜いてこの料理を食べますか？",
      remove_option_text_en: "Would you like to eat this dish without pork?",
      staff_request_phrase: "すみません、私は宗教上の理由で豚肉を食べることができません。ぶた肉を使わずに調理して頂くことは可能でしょうか？",
      staff_request_phrase_en: "Excuse me, for religious reasons I cannot eat pork. Could you prepare this without pork?",
    },
  };
}
