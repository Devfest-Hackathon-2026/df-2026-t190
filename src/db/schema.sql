-- Halal Friendly App Database Schema
-- DevFest Hackathon 2026

-- 1. ユーザー個別基準テーブル
CREATE TABLE IF NOT EXISTS user_preferences (
  preference_id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  allow_direct_alcohol VARCHAR(16) NOT NULL DEFAULT 'strict',      -- strict / conditional / allow
  allow_fermented_zero VARCHAR(16) NOT NULL DEFAULT 'conditional', -- strict / conditional / allow
  allow_cooked_evaporated VARCHAR(16) NOT NULL DEFAULT 'conditional', -- strict / conditional / allow
  pork_policy VARCHAR(16) NOT NULL DEFAULT 'strict',              -- strict / conditional / allow
  gelatin_policy VARCHAR(16) NOT NULL DEFAULT 'conditional',      -- strict / conditional / allow
  custom_guideline_notes TEXT,                                    -- 自由記述補足テキスト
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. 解析・判定履歴テーブル
CREATE TABLE IF NOT EXISTS analysis_history (
  analysis_id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  image_url TEXT,
  overall_status VARCHAR(16) NOT NULL,                            -- safe / warning / danger
  summary_message TEXT,
  checkpoints JSON NOT NULL,                                      -- 成分ごとの判定詳細リスト
  ai_proposals JSON,                                              -- AI代替提案データ
  staff_cards JSON,                                               -- 店員向け提示カード文面
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id ON analysis_history(user_id);
