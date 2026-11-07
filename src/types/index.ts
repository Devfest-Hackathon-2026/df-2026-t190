/**
 * Halal Friendly App - 共通TypeScript型定義
 * DevFest Hackathon 2026
 */

// 許容度の3段階基準
export type ToleranceLevel = 'strict' | 'conditional' | 'allow';

// 総合判定ステータス
export type OverallStatus = 'safe' | 'warning' | 'danger';

// アルコール3区分のルール設定
export interface AlcoholRules {
  /** 直接アルコール含有食品（酒粕、洋酒スイーツ等） */
  direct_alcohol: ToleranceLevel;
  /** 発酵由来・残存0%（醤油、味噌等） */
  fermented_zero: ToleranceLevel;
  /** 加熱揮発アルコール（みりん、料理酒等の焼き・煮込み） */
  cooked_evaporated: ToleranceLevel;
}

// ユーザー個別基準設定
export interface UserPreferences {
  alcohol_rules: AlcoholRules;
  /** 豚肉・豚骨・豚由来エキスの許容レベル */
  pork_level: ToleranceLevel;
  /** ゼラチン・動物性油脂の許容レベル */
  gelatin_level: ToleranceLevel;
  /** ユーザーによる自由記述の補足基準 */
  custom_notes: string;
}

// デフォルトの初期設定（厳格寄りだが実用的なプリセット）
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  alcohol_rules: {
    direct_alcohol: 'strict',      // 直接含有は避ける
    fermented_zero: 'conditional', // 醤油等は場合により許容
    cooked_evaporated: 'conditional', // みりん加熱は要確認
  },
  pork_level: 'strict',            // 豚肉は厳格に避ける
  gelatin_level: 'conditional',    // ゼラチンは要確認
  custom_notes: '乳化剤やショートニングもできれば避けたいです。魚介類や野菜メインのメニューを好みます。',
};

// 成分ごとのチェックポイント詳細
export interface CheckpointDetail {
  category: string;
  title: string;
  detail: string;
  risk_level: OverallStatus;
}

// AIからの変更提案
export interface AIProposal {
  proposal_text: string;
  target_item: string;
  replacement: string;
}

// 店員に見せる交渉カード
export interface StaffCommunicationCard {
  card_type: 'replacement_request' | 'menu_inquiry';
  title: string;
  message: string;
}

// 解析リクエスト
export interface AnalyzeRequest {
  image_data: string; // Base64形式の画像データ
  user_preferences?: UserPreferences;
}

// 解析レスポンス
export interface AnalyzeResponse {
  overall_status: OverallStatus;
  summary_message: string;
  checkpoints: CheckpointDetail[];
  ai_proposals: AIProposal[];
  staff_communication_cards: StaffCommunicationCard[];
}

// データベースエンティティ型
export interface UserPreferenceEntity {
  preference_id: string;
  user_id: string;
  allow_direct_alcohol: ToleranceLevel;
  allow_fermented_zero: ToleranceLevel;
  allow_cooked_evaporated: ToleranceLevel;
  pork_policy: ToleranceLevel;
  gelatin_policy: ToleranceLevel;
  custom_guideline_notes: string;
  updated_at: string;
}

export interface AnalysisHistoryEntity {
  analysis_id: string;
  user_id: string;
  image_url?: string;
  overall_status: OverallStatus;
  summary_message: string;
  checkpoints: CheckpointDetail[];
  ai_proposals: AIProposal[];
  staff_cards: StaffCommunicationCard[];
  created_at: string;
}
