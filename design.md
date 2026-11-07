# Halal Friendly App - システム・デザイン仕様書 (design.md)

DevFest Hackathon 2026 - チーム提出用リポジトリ仕様書

---

## 1. プロダクト概要

イスラム教徒（ムスリム）やハラール食を求める訪日外国人・居住者が、日本の飲食店やコンビニ食品を安心して選べるように支援するスマートフォン向けWebアプリケーション。

特に日本の食文化で複雑な **「アルコールの3区分（直接含有 / 発酵由来 / 加熱揮発）」** や **「豚肉・ゼラチン」** の個人の許容基準に合わせ、料理写真から成分をAI解析し、**「代替案の提案」** と **「店員に直接見せる交渉カード」** を提供します。

---

## 2. デザインシステム (Hallmark 準拠)

本プロジェクトは **Hallmark** デザインスキルの厳格な基準（The Floor）に準拠します。AI特有の安易な紫グラデーションや絵文字の乱用を排し、信頼感と温かみのあるモバイルファーストUIを構築します。

### カラーパレット（セマンティック・トークン）
- **Primary / 安心 (Safe)**: エメラルドグリーン `#059669` / `#10B981` (ハラール伝統の親しみやすさと安心感)
- **Warning / 要確認 (Caution)**: アンバーゴールド `#D97706` / `#F59E0B` (加熱みりん等、確認を促す注意色)
- **Danger / 非推奨 (Avoid)**: バーントローズ `#E11D48` / `#BE123C` (豚肉含有等の明確な非推奨)
- **Neutral / 背景・文字**: スレートグレー系（`#0F172A`, `#334155`, `#F8FAFC`）
- **Surface / カード**: `#FFFFFF`（高コントラスト、視認性の高いカードUI）

### タイポグラフィ & モバイルUIルール
- 基本フォント: システム標準サンセリフ（iOS / Android 最適化）
- モバイル表示幅: `max-w-md`（スマートフォン実機表示に完全最適化、片手操作配慮）
- ボタン & タップ領域: 最小 48px のタップ高さを保証
- アクセシビリティ: `:focus-visible` の明示、高コントラスト比、簡潔で分かりやすい文言

---

## 3. 画面設計（4つの画面フロー）

### ① 設定画面 (`/settings`) - ハラール基準のパーソナライズ
個人の信仰・信条・宗派（学派）に合わせた精緻な許容度を設定。
- **アルコール基準（3細分化・3段階選択）**:
  1. *直接含有食品*: 酒粕、洋酒入りスイーツ等（`避ける` / `場合による` / `気にしない`）
  2. *発酵由来・残存0%*: 醤油、味噌等の発酵過程で生じるもの（`避ける` / `場合による` / `気にしない`）
  3. *加熱揮発*: みりん、料理酒等の煮込み・焼き調理（`避ける` / `場合による` / `気にしない`）
- **その他の基準**:
  - 豚肉・豚由来エキス許容度（`避ける` / `場合による` / `気にしない`）
  - ゼラチン・動物性油脂許容度（`避ける` / `場合による` / `気にしない`）
- **ハラール基準の補足テキスト（自由記述欄）**:
  - テキストエリア（例:「乳化剤やショートニングもできれば避けたい」「魚介類メインならOK」など）
- **「設定を保存」ボタン**

### ② ホーム画面 (`/`) - 撮影・アップロード
ワンタップで直感的に料理やメニュー、原材料表示を解析へ進める。
- カメラ撮影プレビュー
- 「写真を撮影する」ボタン（ネイティブカメラ起動）
- 「アルバムから選択」ボタン（画像アップロード）
- 「解析する」ボタン

### ③ 解析・判断材料画面 (`/analyze/result`) - 精緻な根拠の提示
ユーザーの個人設定に照らし合わせた判定結果を透明性高く表示。
- **総合適合性ステータスバナー**:
  - `安心 (Safe)` / `要確認 (Warning)` / `非推奨 (Danger)`
- **チェックポイント詳細リスト**:
  - 各成分のリスクレベルと根拠（例:「調理用アルコール（みりん）の加熱揮発（低リスク）」、「豚骨エキスの含有（高リスク）」）
- **「次へ（提案・店員向けフレーズを確認）」ボタン**

### ④ 提案・フレーズ画面 (`/proposals`) - 実践的なコミュニケーション支援
「食べられない」で終わらせず、外食を楽しめる代替策と店員への伝達をサポート。
- **AIからの代替提案エリア**:
  - 「〇〇を××に変更して食べますか？」形式の選択カード
  - 例:「豚骨スープを【魚介塩スープ】に変更して注文しますか？」
  - 例:「チャーシューを【煮卵・のり】に変更して注文しますか？」
- **店員に見せる交渉カード（大文字・スワイプ切替）**:
  - *変更依頼カード*: 「すみません、私は宗教上の理由で豚肉を食べられません。〇〇を××に変更していただけますか？」
  - *メニュー相談カード*: 「すみません、私は豚肉・アルコールを避けています。このお店で食べられそうなメニューはありますか？」
  - *全画面拡大表示ボタン*: スマホ画面を店員に向けた時にひと目で読めるフルスクリーンモード

---

## 4. API定義

### ① ユーザー設定 API
`GET /api/user/preferences`
`POST /api/user/preferences`

**リクエスト / レスポンス Body (JSON):**
```json
{
  "alcohol_rules": {
    "direct_alcohol": "strict",
    "fermented_zero": "strict",
    "cooked_evaporated": "allow"
  },
  "pork_level": "strict",
  "gelatin_level": "conditional",
  "custom_notes": "乳化剤やショートニングもできれば避けたいです。魚介類や野菜メインのメニューを好みます。"
}
```
*値の定義: `strict` (避ける), `conditional` (場合によっては気にしない), `allow` (気にしない)*

### ② 画像解析 API
`POST /api/analyze`

**リクエスト Body (JSON):**
```json
{
  "image_data": "data:image/jpeg;base64,..."
}
```

**レスポンス Body (JSON):**
```json
{
  "overall_status": "warning",
  "summary_message": "豚由来のエキスと、煮切りみりん（加熱調理アルコール）が使用されている可能性があります",
  "checkpoints": [
    {
      "category": "alcohol_cooked_evaporated",
      "title": "調理用アルコール（みりん・料理酒）",
      "detail": "タレの製造・調理時に使用されていますが、加熱によりアルコール成分は揮発しています。",
      "risk_level": "warning"
    },
    {
      "category": "pork",
      "title": "豚骨・豚由来エキス",
      "detail": "スープのベースに豚骨が使用されています。",
      "risk_level": "danger"
    }
  ],
  "ai_proposals": [
    {
      "proposal_text": "豚骨スープを【魚介塩スープ】に変更して食べますか？",
      "target_item": "スープ",
      "replacement": "魚介塩スープ"
    },
    {
      "proposal_text": "チャーシューを【のり・煮卵】に変更して食べますか？",
      "target_item": "チャーシュー",
      "replacement": "のり・煮卵"
    }
  ],
  "staff_communication_cards": [
    {
      "card_type": "replacement_request",
      "title": "変更のお願い",
      "message": "すみません、私は宗教上の理由で豚肉を食べられません。チャーシューを他の具材（のりや煮卵など）に変更していただくことは可能でしょうか？"
    },
    {
      "card_type": "menu_inquiry",
      "title": "おすすめの確認",
      "message": "すみません、私は肉類（豚肉・アルコール等）を食べることができません。このお店の中で、私が食べられそうなメニューはありますでしょうか？"
    }
  ]
}
```

---

## 5. データベース設計 (Schema)

### ① `user_preferences` (ユーザー個別基準テーブル)
| カラム名 | データ型 | NULL | 説明 |
| :--- | :--- | :--- | :--- |
| `preference_id` | STRING (PK) | NO | 設定ID (UUID) |
| `user_id` | STRING (FK) | NO | ユーザーID |
| `direct_alcohol_policy` | STRING | NO | アルコール含有食品の基準 (`strict` / `conditional` / `allow`) |
| `fermented_zero_policy` | STRING | NO | 発酵由来・残存0%（醤油等）の基準 (`strict` / `conditional` / `allow`) |
| `cooked_evaporated_policy` | STRING | NO | 加熱揮発（みりん等）の基準 (`strict` / `conditional` / `allow`) |
| `pork_policy` | STRING | NO | 豚肉・エキスの基準 (`strict` / `conditional` / `allow`) |
| `gelatin_policy` | STRING | NO | ゼラチンの基準 (`strict` / `conditional` / `allow`) |
| `custom_guideline_notes` | TEXT | YES | ユーザー入力の補足記述テキスト（任意記述） |
| `updated_at` | TIMESTAMP | NO | 最終更新日時 |

### ② `analysis_history` (解析・判定履歴テーブル)
| カラム名 | データ型 | NULL | 説明 |
| :--- | :--- | :--- | :--- |
| `analysis_id` | STRING (PK) | NO | 解析履歴ID (UUID) |
| `user_id` | STRING (FK) | NO | ユーザーID |
| `image_url` | STRING | YES | 料理・メニューの画像パス/URL |
| `overall_status` | STRING | NO | 総合判定 (`safe` / `warning` / `danger`) |
| `summary_message` | TEXT | YES | 判定サマリー |
| `checkpoints` | JSON | NO | 成分ごとの判定詳細リスト |
| `ai_proposals` | JSON | YES | 「〇〇を××に変更して食べますか？」提案データ |
| `staff_cards` | JSON | YES | 店員向け提示カード文面データ |
| `created_at` | TIMESTAMP | NO | 判定実施日時 |
