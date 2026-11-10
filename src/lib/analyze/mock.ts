import { EnhancedAnalyzeResult, UserPreferences } from "@/types";

export function getMockResult(prefs: UserPreferences, customPreset?: string): EnhancedAnalyzeResult {
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
        substitute_items: ["塩", "植物由来の油"],
        substitute_items_en: ["Salt", "Plant-based oil"],
        advice: "醤油や料理酒の代わりにシンプルな塩と植物由来の油で味付けしてもらえば、アルコール調味料や動物性油脂を避けて安心・美味しく楽しめます！",
        advice_en: "Ask to season with simple salt and plant-based oil instead of soy sauce or cooking sake to enjoy safely!",
        staff_request_phrase: "すみません、宗教上の理由により、「醤油・料理酒」の代わりに「塩・植物由来の油」で味付けして頂くことは可能でしょうか？",
        staff_request_phrase_en: "Excuse me, for religious reasons, could you please season this with salt and plant-based oil instead of soy sauce and cooking sake?",
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
