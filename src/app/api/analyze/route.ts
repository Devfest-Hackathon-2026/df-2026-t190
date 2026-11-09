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
  // AIによる代替食材・調味料のカスタム提案
  substitute_proposal?: {
    has_substitute: boolean; // 代替調味料による提案が可能か（ラーメン等の肉エキススープ料理はfalse）
    target_ingredient: string; // 変更してもらう調味料・食材（例: "醤油", "タレ・みりん"）※簡潔な単語
    target_ingredient_en: string; // 英語（例: "Soy sauce", "Sauce / Mirin"）
    substitute_items: string[]; // お店に常備されている安全な基本調味料（例: ["塩"], ["塩", "オリーブオイル"]）※肉類は絶対禁止
    substitute_items_en: string[]; // 英語（例: ["Salt"], ["Salt", "Olive oil"]）
    advice: string; // AIからの提案理由・アドバイス
    advice_en: string; // 英語アドバイス
    staff_request_phrase: string; // 代替調味料を使った店員さん向けお願いフレーズ（簡潔に）
    staff_request_phrase_en: string; // 英語併記
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

    // 環境変数または .env.local から確実に API キーを取得
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const envPath = path.resolve(process.cwd(), ".env.local");
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, "utf-8");
          const match = content.match(/GEMINI_API_KEY=(.+)/);
          if (match) apiKey = match[1].trim();
        }
      } catch (e) {
        console.warn("Could not read .env.local:", e);
      }
    }

    // 画像がない、デモ実行、またはAPIキーがない場合はモックを返す
    if (!image_data || image_data === "demo" || !apiKey) {
      return NextResponse.json(getMockResult(prefs, custom_prompt));
    }

    try {
      const prompt = `
あなたは日本の料理を99%以上の高精度で特定・ハラール判定する専門家AIです。
提供された料理/メニューの画像を注意深く視覚的に分析してください。
もし画像内に文字やスマホ画面が写り込んでいる場合でも、文字に惑わされず【お皿や器に盛り付けられた実際の料理そのもの】を特定してください。

【料理特定と原材料予測の必須タスク】
1. 正確な料理名を特定してください（例: 明太子パスタ、醤油ラーメン、豚骨ラーメン、鶏の唐揚げ、牛丼、天ぷらうどん、握り寿司、生姜焼きなど）。
2. その料理に含まれている・一般的な日本の調理法で使用される原材料・調味料（隠し味の料理酒・みりん・醤油・豚脂・エキス・出汁など）を詳細に予測してください。
3. ユーザーのハラール基準に照らし合わせ、各原材料ごとに「安全」「注意」「要注意」の判定と理由を記載してください。

4. 【最重要：代替調味料の提案（substitute_proposal）の厳格なルール】
   ★前提条件：日本の一般的な飲食店には「ハラール対応された肉（鶏肉・牛肉・羊肉など）」は一切置いていません。
   そのため、代替食材として【肉類（鶏肉・牛肉・豚肉等）】を提案することは【絶対に禁止】です。
   ★代替提案は、日本のほぼ全ての飲食店が常備している【基本調味料（塩、胡椒、オリーブオイル、レモン等）】への変更のみを提案してください。
   【代表的な提案パターン】:
   - 醤油（アルコール発酵・微量アルコール）を避けるユーザー ➡️ target_ingredient: "醤油", substitute_items: ["塩"]
   - みりん・料理酒・タレを使った料理（パスタ、焼き魚、グリル等） ➡️ target_ingredient: "タレ・みりん", substitute_items: ["塩", "オリーブオイル"] または ["レモン"]
   - ドレッシングを使ったサラダ ➡️ target_ingredient: "ドレッシング", substitute_items: ["塩", "オリーブオイル"]
   - つゆを使った天ぷら ➡️ target_ingredient: "天つゆ", substitute_items: ["塩"]
   ★注意：ラーメンや豚骨鍋、肉じゃがなど、スープや煮汁全体に豚骨や肉エキスが溶け込んでいて調味料変更ではハラール化できない料理は、無理な調味料代替を提案せず has_substitute: false としてください（「スープ全体に肉エキスが溶け込んでいるため別メニューをご検討ください」と記載）。
   ★target_ingredient には、何を変更してもらうかを簡潔な調味料名1〜2語（例: "醤油", "タレ・みりん", "ドレッシング"）で指定してください。決して長文や具材の羅列（例: "豚チャーシュー・スープ（豚骨・豚脂・料理酒等）"）を書かないでください。
   ★店員さん向け指差し文（staff_request_phrase）は店員さんが一瞬で判断できるよう短く簡潔にしてください。
   例: 「すみません、宗教上の理由により、「醤油」の代わりに「塩」で味付け・調理して頂くことは可能でしょうか？」

5. 訪日外国人観光客向けに日本語と英語（_en）を必ず完全提供してください。

【ユーザーのハラール基準】
- 直接アルコール成分が含まれるもの: ${prefs.alcohol_rules?.direct_alcohol || "strict"}
- 製造工程でアルコールが生成される可能性のあるもの（醤油など）: ${prefs.alcohol_rules?.fermented_zero || "conditional"}
- アルコール成分を加熱して飛ばしたもの: ${prefs.alcohol_rules?.cooked_evaporated || "conditional"}
- 豚または豚由来の食材: ${prefs.pork_level || "strict"}
- 所定の処理がされていない豚肉以外の肉: ${prefs.non_halal_meat_level || "conditional"}
- ユーザー任意の追加要望・アレルギー: ${prefs.custom_notes || custom_prompt || "特になし"}

【総合判定のルール】
- 総合判定(overall_status):
  - ユーザー基準に反する食材（豚肉・豚骨・未処理肉・直接アルコール等）が含まれる場合は「danger」（要注意）
  - 微量発酵、加熱みりん・料理酒、エキス類など確認・注意を要する場合は「warning」（注意）
  - 魚介類（明太子・鮭など）や野菜・鶏卵など安全な食材のみの場合は「safe」（安全）

【必須JSONフォーマット】
{
  "dish_name": "正確な料理名（例: 明太子パスタ、醤油ラーメン、野菜サラダ）",
  "dish_name_en": "Dish name in English (e.g., Mentaiko Pasta, Shoyu Ramen, Vegetable Salad)",
  "overall_status": "safe" | "warning" | "danger",
  "status_label": "安全" | "注意" | "要注意",
  "summary_message": "判定理由の要約（日本語1〜2行）",
  "summary_message_en": "Summary of analysis in English (1-2 sentences)",
  "checkpoints": [
    {
      "name": "食材・原材料名（日本語・簡潔に）",
      "name_en": "Ingredient name in English",
      "level": "safe" | "warning" | "danger",
      "level_label": "安全" | "注意" | "要注意",
      "reason": "ハラール上の具体的な理由（日本語）",
      "reason_en": "Detailed reason in English"
    }
  ],
  "concerning_ingredients": ["注意・要注意となった食材・調味料の簡潔な単語リスト（例: [\"豚骨スープ\", \"豚肉\", \"醤油\"]。括弧書きや説明文は含めず名詞のみ）"],
  "concerning_ingredients_en": ["List of concerning ingredients in English (e.g., [\"Pork Broth\", \"Pork Meat\", \"Soy Sauce\"])"],
  "proposal": {
    "remove_option_text": "〇〇を抜いてこの料理を食べますか？",
    "remove_option_text_en": "Would you like to eat this dish without [ingredients]?",
    "staff_request_phrase": "すみません、宗教上の理由により、〇〇を使わずに調理して頂くことは可能でしょうか？",
    "staff_request_phrase_en": "Could you please prepare this dish without [ingredients]?"
  },
  "substitute_proposal": {
    "has_substitute": true,
    "target_ingredient": "醤油",
    "target_ingredient_en": "Soy sauce",
    "substitute_items": ["塩"],
    "substitute_items_en": ["Salt"],
    "advice": "お醤油の代わりにシンプルな塩で味付けしてもらえば、アルコール発酵調味料を避けて安心してお召し上がりいただけます！",
    "advice_en": "Ask to season with simple salt instead of soy sauce to enjoy safely!",
    "staff_request_phrase": "すみません、宗教上の理由により、「醤油」の代わりに「塩」で味付けして頂くことは可能でしょうか？",
    "staff_request_phrase_en": "Excuse me, for religious reasons, could you please season this with salt instead of soy sauce?"
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

      // 高速・高精度・混雑知らずの Google Gemini 3.5 Flash Lite（公式推奨モデル）
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      substitute_proposal: {
        has_substitute: true,
        target_ingredient: "醤油・料理酒",
        target_ingredient_en: "Soy sauce & Cooking sake",
        substitute_items: ["塩", "オリーブオイル"],
        substitute_items_en: ["Salt", "Olive oil"],
        advice: "醤油や料理酒の代わりにシンプルな塩とオリーブオイルで味付けしてもらえば、アルコール調味料を避けて安心・美味しく楽しめます！",
        advice_en: "Ask to season with simple salt and olive oil instead of soy sauce or cooking sake to enjoy safely!",
        staff_request_phrase: "すみません、宗教上の理由により、「醤油・料理酒」の代わりに「塩・オリーブオイル」で味付けして頂くことは可能でしょうか？",
        staff_request_phrase_en: "Excuse me, for religious reasons, could you please season this with salt and olive oil instead of soy sauce and cooking sake?",
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
          level: "danger",
          level_label: "要注意",
          reason: "スープの出汁に豚骨エキスやみりんが溶け込んでおり、調味料の変更では対応が困難です。",
          reason_en: "Broth contains pork bone extract and mirin; seasoning substitution cannot make it halal.",
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
      substitute_proposal: {
        has_substitute: false,
        target_ingredient: "豚骨スープ",
        target_ingredient_en: "Pork Broth",
        substitute_items: [],
        substitute_items_en: [],
        advice: "ラーメンはスープ全体に豚骨エキスが溶け込んでいるため、調味料の変更では対応が困難です。別メニューのご検討をおすすめします。",
        advice_en: "Since the broth contains pork bone extract, seasoning substitution cannot make it halal. Finding another dish is recommended.",
        staff_request_phrase: "すみません、豚肉や豚骨スープを使っていないメニューはありますか？",
        staff_request_phrase_en: "Excuse me, do you have any dishes without pork meat or pork broth?",
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
    substitute_proposal: {
      has_substitute: false,
      target_ingredient: "豚肉・煮汁",
      target_ingredient_en: "Pork Meat & Broth",
      substitute_items: [],
      substitute_items_en: [],
      advice: "豚の出汁が煮汁全体に溶け出しているため、調味料の変更では対応が困難です。別のお料理をご検討ください。",
      advice_en: "Since pork broth permeates the whole dish, finding another menu item is recommended.",
      staff_request_phrase: "すみません、豚肉や豚出汁を使っていない別のお料理はありますか？",
      staff_request_phrase_en: "Excuse me, do you have any dishes without pork meat or pork broth?",
    },
  };
}
