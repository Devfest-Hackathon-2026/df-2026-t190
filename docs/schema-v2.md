# 判定スキーマ v2 の設計

この文書は、決勝（2026-11-27）に向けてこれから実装する設計である。書いた時点のコードは v1 のままで、v2 はまだ1行も実装していない。文中の行番号は `24d13db` 時点のもの。

## 1. 目的

このアプリはハラールを認定しない。
v2 では、Gemini は写真から見えたこと（料理名、材料、分からない点）だけを返す。
本人の基準に照らした判定は、チームが書いた規則に沿ってコードが行う。

## 2. v1 の課題

| 課題 | 困ること | 該当ファイルと行 |
|---|---|---|
| 総合判定と材料ごとの判定を Gemini が決めている | 判定の規則がプロンプトの文章の中にあり、コードのテストで確かめられない | `src/types/index.ts` 114, 121 / `src/lib/analyze/prompt.ts` 39-43 |
| 本人の設定が `strict` などの英単語のままプロンプトに入る | 単語の意味を Gemini が解釈する。設定を変えたら結果がどう変わるかを、コードの側で保証できない | `src/lib/analyze/prompt.ts` 31-37 |
| JSON の形を Gemini に強制していない | `responseMimeType` だけで `responseSchema` が無い。コードフェンスを取り除いてから、`isAnalyzeResult` で最低限の形だけを見ている。`proposal` の中身や `_en` の項目は確かめていない | `src/app/api/analyze/route.ts` 202-205, 217, 84-108 |
| 日本語と英語を項目ごとに2つずつ持つ | `name` と `name_en` のような組が11組ある。言語を1つ足すと、型とプロンプトと検証を全部書き換えることになる。訳も Gemini 任せ | `src/types/index.ts` 112-144 |
| 結果を「安全」と表示している | 認定していないのに、アプリが安全を保証したように読める | `src/types/index.ts` 115, 122 / `src/app/page.tsx` 96, 99 |
| Gemini に店員向けの文（`staff_request_phrase`）を作らせているが、画面では使っていない | 店員カードは画面側の決まった文型に材料名を入れている。使わない文を毎回生成している | `src/types/index.ts` 131, 143 / `src/app/page.tsx` 914-956 |
| 使っていない型と DB スキーマが残っている | DB に保存しているように読める。実際の設定は画面の状態だけで、再読み込みで消える（Issue #4） | `src/types/index.ts` 48-108 / `src/db/schema.sql` 5-28 / `src/app/page.tsx` 286-290 |

## 3. v2 の設計

全体の流れは次のとおり。

```text
写真 --> /api/analyze --> Gemini --> Observation（観察だけ）
                                          │
本人の設定（UserPolicy、端末に保存） --> judge(observation, policy) --> 判定と店員への質問
```

`judge` は純粋関数なので、ブラウザで動かす。サーバーが受け取るのは写真だけになり、本人の設定はサーバーへ送らない。

### Observation（Gemini の出力）

Gemini が返すのはこの形だけにする。判定（安全か、避けるべきか）は含めない。

```ts
type Confidence = "high" | "medium" | "low";

type IngredientCategory =
  | "pork_meat"
  | "pork_derived"
  | "alcohol_drink"
  | "fermented_seasoning"
  | "cooked_alcohol"
  | "non_zabiha_meat"
  | "non_fish_seafood"
  | "fish"
  | "plant"
  | "egg_dairy";

type UnknownPoint = "broth_base" | "marinade" | "shared_fryer" | "shared_utensils";

type Substitute = "salt" | "plant_oil" | "lemon" | "pepper";

interface Observation {
  schema_version: "2";
  image_quality: "ok" | "blurry" | "not_food" | "multiple_dishes";
  dish: { name_ja: string; confidence: Confidence };
  ingredients: {
    name_ja: string;
    category: IngredientCategory;
    evidence: "visible" | "menu_text" | "typical_recipe";
    confidence: Confidence;
  }[];
  unknowns: UnknownPoint[];
  substitution: { possible: boolean; substitutes: Substitute[] };
}
```

材料の分類（`category`）の中身。

| category | 中身 | 例 | 本人の設定 |
|---|---|---|---|
| `pork_meat` | 豚肉そのもの | チャーシュー、ベーコン | なし（常に避ける） |
| `pork_derived` | 豚から作った材料 | 豚骨スープ、ラード、ゼラチン | 選べる |
| `alcohol_drink` | 酒そのものと、加熱せずに酒が残るもの | 酒類、洋酒を使った菓子 | なし（常に避ける） |
| `fermented_seasoning` | 作る途中でアルコールができる調味料 | 醤油、味噌 | 選べる |
| `cooked_alcohol` | 加熱して使う酒 | みりん、料理酒 | 選べる |
| `non_zabiha_meat` | 決められた方法で処理していない、豚以外の肉 | 鶏肉、牛肉 | 選べる |
| `non_fish_seafood` | 魚以外の海産物 | エビ、イカ、貝 | 選べる |
| `fish` | 魚 | 鮭、明太子 | 判定に使わない |
| `plant` | 野菜、穀物、植物油 | 米、ねぎ | 判定に使わない |
| `egg_dairy` | 卵と乳製品 | 卵、チーズ | 判定に使わない |

写真から肉の処理方法は分からない。鶏肉や牛肉は、見えたらすべて `non_zabiha_meat` に入れる。

`evidence` は、その材料を何から推定したかを表す。`visible` は写真に写っている、`menu_text` はメニューの文字に書いてある、`typical_recipe` は一般的な作り方から推定した、の意味。`unknowns` には、写真からは分からない点（スープのだし、下味、揚げ油や調理器具を豚肉と共用しているか）を入れる。

Gemini に渡す `responseSchema`。列挙値をここで固定するので、決めた値以外は返ってこない。

```json
{
  "type": "OBJECT",
  "properties": {
    "schema_version": { "type": "STRING", "enum": ["2"] },
    "image_quality": { "type": "STRING", "enum": ["ok", "blurry", "not_food", "multiple_dishes"] },
    "dish": {
      "type": "OBJECT",
      "properties": {
        "name_ja": { "type": "STRING" },
        "confidence": { "type": "STRING", "enum": ["high", "medium", "low"] }
      },
      "required": ["name_ja", "confidence"]
    },
    "ingredients": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "name_ja": { "type": "STRING" },
          "category": {
            "type": "STRING",
            "enum": [
              "pork_meat", "pork_derived", "alcohol_drink", "fermented_seasoning", "cooked_alcohol",
              "non_zabiha_meat", "non_fish_seafood", "fish", "plant", "egg_dairy"
            ]
          },
          "evidence": { "type": "STRING", "enum": ["visible", "menu_text", "typical_recipe"] },
          "confidence": { "type": "STRING", "enum": ["high", "medium", "low"] }
        },
        "required": ["name_ja", "category", "evidence", "confidence"]
      }
    },
    "unknowns": {
      "type": "ARRAY",
      "items": { "type": "STRING", "enum": ["broth_base", "marinade", "shared_fryer", "shared_utensils"] }
    },
    "substitution": {
      "type": "OBJECT",
      "properties": {
        "possible": { "type": "BOOLEAN" },
        "substitutes": {
          "type": "ARRAY",
          "items": { "type": "STRING", "enum": ["salt", "plant_oil", "lemon", "pepper"] }
        }
      },
      "required": ["possible", "substitutes"]
    }
  },
  "required": ["schema_version", "image_quality", "dish", "ingredients", "unknowns", "substitution"]
}
```

`responseSchema` を使っても、API の側で同じ列挙値に沿って検証する。外れていたら v1 と同じく 502 を返す。

### UserPolicy（本人の設定）

```ts
type PolicyItem =
  | "fermented_seasoning"
  | "cooked_alcohol"
  | "pork_derived"
  | "non_zabiha_meat"
  | "non_fish_seafood"
  | "shared_equipment";

type Choice = "avoid" | "ask" | "not_applicable"; // 避ける / 確認したい / 気にしない

interface UserPolicy {
  version: 2;
  choices: Record<PolicyItem, Choice>;
}

const DEFAULT_POLICY: UserPolicy = {
  version: 2,
  choices: {
    fermented_seasoning: "ask",
    cooked_alcohol: "ask",
    pork_derived: "ask",
    non_zabiha_meat: "ask",
    non_fish_seafood: "ask",
    shared_equipment: "ask",
  },
};
```

- 保存先はブラウザの localStorage。サーバーには送らない。
- `pork_meat` と `alcohol_drink` は設定項目に入れない。誰がどう設定しても常に避ける。
- 既定値はすべて `ask`。既定のままだと、醤油を使う料理の多くが `ask_staff`（店員に確認）になる。本人が設定を変えるまでは、確認を多めに出す側に倒している。

v1 の設定との対応は次のとおり。v1 は設定を保存していない（画面の状態だけ）ので、端末に残った値を移し替える処理は要らない。この表は、v1 の項目が v2 のどこに行くかを示すためのもの。

| v1 の項目 | v2 の項目 |
|---|---|
| `alcohol_rules.direct_alcohol` | なし。`alcohol_drink` は常に避ける |
| `alcohol_rules.fermented_zero` | `fermented_seasoning` |
| `alcohol_rules.cooked_evaporated` | `cooked_alcohol` |
| `pork_level` | 豚肉そのもの（`pork_meat`）は常に避ける。豚由来の材料は `pork_derived` |
| `non_halal_meat_level` | `non_zabiha_meat` |
| `gelatin_level` | なし。v1 の画面に項目が無く（`src/app/page.tsx` 476-485 で送っていない）、プロンプトにも入っていない。豚のゼラチンは `pork_derived` で扱う |
| （なし） | `non_fish_seafood`、`shared_equipment` は v2 で新しく足す |

値は `strict` を `avoid`、`conditional` を `ask`、`allow` を `not_applicable` に置き換える。

### judge(observation, policy)

判定する純粋関数。同じ入力なら必ず同じ結果を返す。

```ts
type Overall = "no_concern_estimated" | "ask_staff" | "likely_avoid" | "undetermined";

type StaffQuestionId =
  | "ask_pork"
  | "ask_alcohol"
  | "ask_fermented_seasoning"
  | "ask_meat"
  | "ask_seafood"
  | "ask_broth"
  | "ask_marinade"
  | "ask_shared_equipment"
  | "request_substitute";

interface Judgement {
  overall: Overall;
  questions_for_staff: StaffQuestionId[];
}
```

規則は上から順に見て、最初に当てはまったものを使う。

| 順 | 条件 | overall |
|---|---|---|
| 1 | `image_quality` が `ok` 以外 | `undetermined`（撮り直しを促す） |
| 2 | 常に避ける項目か、`avoid` にした項目に当たる材料があり、その `confidence` が `medium` 以上 | `likely_avoid` |
| 3 | `ask` にした項目に当たる材料がある。または `avoid` の項目に当たる材料の `confidence` が `low`。または `unknowns` に、関係する項目が `not_applicable` 以外のものがある | `ask_staff` |
| 4 | 上のどれでもない | `no_concern_estimated` |

`unknowns` の値と、関係する項目の対応は次のとおり。`broth_base` は `pork_derived` と `non_zabiha_meat`、`marinade` は `fermented_seasoning` と `cooked_alcohol`、`shared_fryer` と `shared_utensils` は `shared_equipment` である。

確信度が低い材料を `no_concern_estimated` に落とさないため、3番目の条件に `low` を入れた。豚肉らしきものが写っていて自信が無いときは、店員に確認する側に回す。

疑似コードは次のとおり。`QUESTION_BY_CATEGORY` などは、項目から質問 ID や関係する項目を引く対応表である。

```ts
const ALWAYS_AVOID = new Set(["pork_meat", "alcohol_drink"]);
const SEASONING = new Set(["fermented_seasoning", "cooked_alcohol"]);

function choiceFor(item: string, policy: UserPolicy): Choice {
  if (ALWAYS_AVOID.has(item)) return "avoid";
  return policy.choices[item as PolicyItem] ?? "not_applicable"; // fish, plant, egg_dairy
}

export function judge(obs: Observation, policy: UserPolicy): Judgement {
  if (obs.image_quality !== "ok") return { overall: "undetermined", questions_for_staff: [] };

  let avoid = false;
  let ask = false;
  const questions = new Set<StaffQuestionId>();
  const hitCategories: string[] = [];

  for (const ing of obs.ingredients) {
    const choice = choiceFor(ing.category, policy);
    if (choice === "not_applicable") continue;
    if (choice === "avoid" && ing.confidence !== "low") avoid = true;
    else ask = true;
    hitCategories.push(ing.category);
    questions.add(QUESTION_BY_CATEGORY[ing.category]);
  }

  for (const u of obs.unknowns) {
    if (ITEMS_BY_UNKNOWN[u].every((item) => choiceFor(item, policy) === "not_applicable")) continue;
    ask = true;
    questions.add(QUESTION_BY_UNKNOWN[u]);
  }

  // 置き換えのお願いは、当たった材料が調味料だけのときに限る
  if (obs.substitution.possible && hitCategories.length > 0 && hitCategories.every((c) => SEASONING.has(c))) {
    questions.add("request_substitute");
  }

  const overall = avoid ? "likely_avoid" : ask ? "ask_staff" : "no_concern_estimated";
  return { overall, questions_for_staff: [...questions] };
}
```

### 文言

Gemini には文章を作らせない。画面に出す文はすべてコードの辞書から引く。

店員カードは `StaffQuestionId` ごとに決まった日本語の文型を持つ。どのカードも、v1 と同じく「すみません、宗教上の理由により、」で始める（`src/app/page.tsx` 914）。文型の例を3つ挙げる。

| StaffQuestionId | 店員カードの文 |
|---|---|
| `ask_pork` | この料理に、豚肉や豚から作ったもの（ラード、豚骨のだし、ゼラチンなど）は入っていますか？ |
| `ask_alcohol` | この料理に、お酒やみりん、料理酒は入っていますか？ |
| `request_substitute` | 〈醤油〉の代わりに〈塩〉で味付けしていただくことはできますか？ |

〈 〉の中には、Observation の材料名（`name_ja`）と、`substitutes` の値を辞書で日本語にしたものを入れる。残りの文型は、当事者と店員に聞いてから決める。

本人向けの表示も、項目ごとの辞書で出す。

```ts
const ITEM_LABELS = {
  ja: { pork_derived: "豚由来の材料（豚骨、ラード、ゼラチンなど）", cooked_alcohol: "加熱して使うお酒（みりん、料理酒）" /* ... */ },
  en: { pork_derived: "Pork-derived ingredients (pork broth, lard, gelatin)", cooked_alcohol: "Alcohol used in cooking (mirin, cooking sake)" /* ... */ },
};
```

`no_concern_estimated` の表示には「安全」も「ハラール」も使わない。「写真からは、設定に当たる材料は見つかりませんでした」のように、何を根拠にした結果かを書く。

材料名そのものは日本語（`name_ja`）だけを持つ。言語を増やすときは、`ITEM_LABELS` などの辞書に1言語ぶん足せばよく、型と Gemini の出力は変えない。

## 4. この設計にした理由

### 判定の規則をコードに置く理由

- テストが書ける。規則がプロンプトの中にあると、Gemini を呼ばないと確かめられない。`judge` なら入力を作って結果を比べるだけで済む。
- 設定の効き方をコードで決められる。v1 では `strict` という単語の意味を Gemini が解釈していた。v2 では「`avoid` なら `likely_avoid`」とコードに書いてあるので、設定を変えたときの動きを読めば分かる。
- アプリが認定しない。Gemini は見えたものを報告し、それを本人の基準に当てるのは本人が選んだ設定とチームが書いた規則になる。どの規則で判定したかを、利用者にも審査員にも示せる。

### 置き換え候補を列挙値にする理由

v1 のプロンプトは、肉を代わりに提案することを文章で禁止している（`src/lib/analyze/prompt.ts` 16-18）。文章での禁止は守られる保証が無い。v2 では `substitutes` を塩、植物油、レモン、胡椒の4つに限った。`responseSchema` とコードの検証の両方で、これ以外の値は通らない。肉を提案する経路が型の上で存在しない。

### 設定を端末だけに置く理由

「豚肉を避ける」「アルコールを避ける」といった設定は、本人の宗教を推し量れる情報である。宗教は信条に含まれ、個人情報保護法の要配慮個人情報（第2条第3項）に当たりうる。サーバーに持てば、取得の同意や、漏えいしたときの報告まで考える必要が出てくる。

そこで設定は端末にだけ置き、サーバーには送らない。写真も保存しない。サーバーに個人の情報を残さないので DB は作らないと決め、使っていない `src/db/schema.sql` と関連する型は片付ける（Issue #4）。

## 5. 確かめ方

### 単体テスト（Issue #6）

同じ Observation に対して、設定だけを変えて `overall` が変わることを確かめる。例として照り焼きチキン（鶏肉 `non_zabiha_meat`/high、醤油 `fermented_seasoning`/high、みりん `cooked_alcohol`/medium、`unknowns` は空）を使う。

| 設定 | 期待する overall |
|---|---|
| すべて `ask`（既定） | `ask_staff` |
| `non_zabiha_meat` を `avoid` | `likely_avoid` |
| すべて `not_applicable` | `no_concern_estimated` |

ほかに次も確かめる。

- `image_quality` が `blurry` なら、設定にかかわらず `undetermined`。
- `pork_meat` の材料（confidence が medium 以上）があれば、すべて `not_applicable` にしても `likely_avoid`。
- 同じ材料でも confidence が `low` なら `ask_staff`。
- 豚肉が当たった料理では、`substitution.possible` が true でも `request_substitute` を出さない。

### 評価

正解の材料を付けた料理写真で、Observation と `judge` を通して評価する。主な指標は見逃し率とする。

見逃し率 = 正解に `pork_meat`、`pork_derived`、`alcohol_drink` のどれかを含む写真のうち、既定の設定で `no_concern_estimated` になった枚数 ÷ 正解にそれらを含む写真の枚数

`ask_staff` は見逃しに数えない。店員に確認すれば本人が気づけるからである。写真の枚数と合格ラインは、写真を集め始める前にこの文書へ書き足す。

## 6. 移行の順番

決勝（11/27）までに次の順で進める。

1. `Observation`、`UserPolicy`、`judge` の型と関数を書き、5章の単体テストを通す（Issue #6）。
2. Gemini の呼び出しを Observation と `responseSchema` に切り替える（Issue #3）。Vertex AI への移行（Issue #2）と一緒に、この形で通るかを確かめる。
3. 画面を `judge` の結果と辞書の文言に切り替える。設定を localStorage に保存する（Issue #4）。
4. 使わなくなった v1 の型と `src/db/schema.sql` を消す（Issue #4）。
5. 正解付きの写真で評価する。

### まだ決めていないこと

- 項目の分け方と文言。ムスリムの当事者と飲食店の店員に話を聞いて確かめる。たとえば `fermented_seasoning` に酢を入れるか、店員カードの文が現場で通じるか。
- 今の分類に収まらない材料の扱い。チーズの凝固剤（レンネット）や乳化剤など。
- v1 の自由記述欄（`custom_notes`）の扱い。v2 の Gemini は設定を受け取らないので、今の形では判定に使えない。残すか消すかは未定。
- 評価に使う写真の枚数と合格ライン。
