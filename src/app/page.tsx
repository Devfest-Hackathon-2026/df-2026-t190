"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Settings,
  ChevronRight,
  ChevronDown,
  Camera,
  ImageIcon,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Utensils,
  Maximize2,
  Sparkles,
  RotateCcw,
  Check,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import {
  UserPreferences,
  DEFAULT_USER_PREFERENCES,
  ToleranceLevel,
  AnalyzeResponse,
} from "@/types";

// アクセントカラー定数
const THEME_COLOR = "#9BAD50";

type ViewScreen = "home" | "settings" | "result" | "proposals" | "fullscreen_card";

export default function HalalCheckApp() {
  const [currentScreen, setCurrentScreen] = useState<ViewScreen>("home");
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  const [selectedCardForFullscreen, setSelectedCardForFullscreen] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // ローカルストレージから設定を復元
  useEffect(() => {
    const saved = localStorage.getItem("halal_user_preferences");
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // 設定の保存
  const handleSavePreferences = () => {
    localStorage.setItem("halal_user_preferences", JSON.stringify(preferences));
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      setCurrentScreen("home");
    }, 800);
  };

  // 画像アップロード処理
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // デモ用デフォルト画像（醤油ラーメン）
  const loadDemoImage = () => {
    setSelectedImage("https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80");
  };

  // 解析実行
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_data: selectedImage || "demo",
          user_preferences: preferences,
          custom_prompt: customNote,
        }),
      });
      const data: AnalyzeResponse = await res.json();
      setAnalysisResult(data);
      setCurrentScreen("result");
    } catch (err) {
      console.error(err);
      alert("解析中にエラーが発生しました");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 3段階セレクターコンポーネント
  const ToleranceSelector = ({
    value,
    onChange,
    labels = { strict: "避ける", conditional: "場合により可", allow: "気にしない" },
  }: {
    value: ToleranceLevel;
    onChange: (val: ToleranceLevel) => void;
    labels?: { strict: string; conditional: string; allow: string };
  }) => {
    return (
      <div className="grid grid-cols-3 gap-2 p-1 bg-[#F4F6EA] rounded-xl text-xs font-medium">
        <button
          type="button"
          onClick={() => onChange("strict")}
          className={`py-2 px-1 rounded-lg transition-all text-center ${
            value === "strict"
              ? "bg-white text-[#2C3518] shadow-sm font-bold border border-[#9BAD50]/30"
              : "text-[#5C6B38] hover:text-[#2C3518]"
          }`}
        >
          {labels.strict}
        </button>
        <button
          type="button"
          onClick={() => onChange("conditional")}
          className={`py-2 px-1 rounded-lg transition-all text-center ${
            value === "conditional"
              ? "bg-white text-[#2C3518] shadow-sm font-bold border border-[#9BAD50]/30"
              : "text-[#5C6B38] hover:text-[#2C3518]"
          }`}
        >
          {labels.conditional}
        </button>
        <button
          type="button"
          onClick={() => onChange("allow")}
          className={`py-2 px-1 rounded-lg transition-all text-center ${
            value === "allow"
              ? "bg-white text-[#2C3518] shadow-sm font-bold border border-[#9BAD50]/30"
              : "text-[#5C6B38] hover:text-[#2C3518]"
          }`}
        >
          {labels.allow}
        </button>
      </div>
    );
  };

  // ラベル表示用ヘルパー
  const getBadgeClass = (level: ToleranceLevel) => {
    switch (level) {
      case "strict":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "conditional":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "allow":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  const getBadgeLabel = (level: ToleranceLevel) => {
    switch (level) {
      case "strict":
        return "避ける";
      case "conditional":
        return "要確認";
      case "allow":
        return "気にしない";
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F4E8] flex justify-center py-0 sm:py-6">
      {/* モバイルフレーム（スマホ実機サイズ） */}
      <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[844px] sm:h-auto sm:rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative border-0 sm:border-8 sm:border-slate-800">
        
        {/* iOS風ステータスバー */}
        <div className="pt-3 px-7 flex justify-between items-center text-xs text-slate-800 font-semibold select-none z-10 bg-white/80 backdrop-blur-sm">
          <span>9:41</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-5 h-2.5 border border-slate-700 rounded-sm p-0.5 flex items-center">
              <div className="h-full w-full bg-slate-800 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* 画面コンテンツエリア */}
        <div className="flex-1 flex flex-col overflow-y-auto">

          {/* ========================================================= */}
          {/* SCREEN 1: ホーム画面                                      */}
          {/* ========================================================= */}
          {currentScreen === "home" && (
            <div className="flex-1 flex flex-col p-5 space-y-5">
              {/* ヘッダー */}
              <div className="flex justify-between items-center pt-1">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-full bg-[#F4F6EA] flex items-center justify-center text-[#9BAD50]">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                      Halal Check
                    </h1>
                    <p className="text-[10px] text-slate-400">信仰に寄り添う、安心の食選び</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentScreen("settings")}
                  className="w-9 h-9 rounded-full bg-[#F4F6EA] flex items-center justify-center text-[#9BAD50] hover:bg-[#E8EDD5] transition-all"
                  aria-label="設定"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              {/* Your Halal Summary カード */}
              <div className="bg-[#FAFBF7] border border-[#9BAD50]/30 rounded-2xl p-4 shadow-xs relative">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-bold text-sm text-[#5C6B38] tracking-wide">
                    Your Halal Summary
                  </h2>
                  <button
                    type="button"
                    onClick={() => setCurrentScreen("settings")}
                    className="text-xs text-[#9BAD50] font-semibold flex items-center hover:underline"
                  >
                    Edit <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-[#9BAD50]/10">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span>🐷</span> 豚肉・エキス:
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeClass(preferences.pork_level)}`}>
                      {getBadgeLabel(preferences.pork_level)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-[#9BAD50]/10">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span>🍶</span> 加熱みりん・料理酒:
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeClass(preferences.alcohol_rules.cooked_evaporated)}`}>
                      {getBadgeLabel(preferences.alcohol_rules.cooked_evaporated)}
                    </span>
                  </div>

                  {showFullSummary && (
                    <div className="space-y-2 pt-1 animate-fadeIn">
                      <div className="flex items-center justify-between py-1 border-b border-[#9BAD50]/10">
                        <span className="flex items-center gap-2 text-slate-700">
                          <span>🍷</span> 直接アルコール含有:
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeClass(preferences.alcohol_rules.direct_alcohol)}`}>
                          {getBadgeLabel(preferences.alcohol_rules.direct_alcohol)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-[#9BAD50]/10">
                        <span className="flex items-center gap-2 text-slate-700">
                          <span>🥢</span> 発酵調味料（醤油・味噌）:
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeClass(preferences.alcohol_rules.fermented_zero)}`}>
                          {getBadgeLabel(preferences.alcohol_rules.fermented_zero)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-[#9BAD50]/10">
                        <span className="flex items-center gap-2 text-slate-700">
                          <span>🥣</span> ゼラチン・動物性油脂:
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeClass(preferences.gelatin_level)}`}>
                          {getBadgeLabel(preferences.gelatin_level)}
                        </span>
                      </div>
                      {preferences.custom_notes && (
                        <div className="bg-white/80 p-2.5 rounded-xl border border-[#9BAD50]/20 text-[11px] text-slate-600">
                          <span className="font-semibold text-[#5C6B38]">補足条件:</span> {preferences.custom_notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowFullSummary(!showFullSummary)}
                  className="w-full mt-2 text-center text-[11px] text-[#9BAD50] font-semibold flex items-center justify-center gap-0.5 pt-1"
                >
                  {showFullSummary ? "閉じる" : "もっと見る"}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFullSummary ? "rotate-180" : ""}`} />
                </button>
              </div>

              {/* 写真プレビュー / アップロードエリア */}
              <div className="space-y-3">
                {selectedImage ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-[#9BAD50] shadow-sm aspect-4/3 bg-slate-100 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedImage}
                      alt="プレビュー"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-all text-xs"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-dashed border-[#9BAD50]/50 bg-[#FAFBF7] p-6 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#F4F6EA] flex items-center justify-center text-[#9BAD50]">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">料理やメニューを撮影</p>
                      <p className="text-[11px] text-slate-400">原材料表示や看板でもOKです</p>
                    </div>
                    <button
                      type="button"
                      onClick={loadDemoImage}
                      className="text-[11px] text-[#9BAD50] underline font-medium pt-1"
                    >
                      サンプル（醤油ラーメン）を試す
                    </button>
                  </div>
                )}

                {/* 撮影 & アルバム 2分割ボタン */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center py-4 px-3 bg-[#FAFBF7] border border-[#9BAD50]/40 rounded-2xl hover:bg-[#F4F6EA] active:scale-98 transition-all"
                  >
                    <Camera className="w-6 h-6 text-[#9BAD50] mb-1.5" />
                    <span className="text-xs font-bold text-[#5C6B38]">カメラで撮影</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center py-4 px-3 bg-[#FAFBF7] border border-[#9BAD50]/40 rounded-2xl hover:bg-[#F4F6EA] active:scale-98 transition-all"
                  >
                    <ImageIcon className="w-6 h-6 text-[#9BAD50] mb-1.5" />
                    <span className="text-xs font-bold text-[#5C6B38]">アルバムから選択</span>
                  </button>

                  {/* 隠しインプット */}
                  <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* 補足情報入力 */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  補足情報（任意）
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="例: 豚骨ラーメン、醤油ベース など"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAFBF7] border border-[#9BAD50]/30 rounded-xl focus:outline-none focus:border-[#9BAD50] placeholder-slate-400 text-slate-800"
                />
              </div>

              {/* 解析するボタン */}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all active:scale-99 flex items-center justify-center gap-2"
                style={{ backgroundColor: THEME_COLOR }}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Gemini AIが解析中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>解析する</span>
                  </>
                )}
              </button>

              {/* AI免責アラート */}
              <div className="bg-[#FAFBF7] border border-[#9BAD50]/20 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-[#5C6B38]">
                <AlertTriangle className="w-4 h-4 text-[#9BAD50] shrink-0" />
                <span>AIは、不正確な情報を表示することがあります。</span>
              </div>

              {/* 下部モスクのグラフィック装飾 */}
              <div className="mt-auto pt-6 pb-2 text-center opacity-30 select-none">
                <svg className="w-32 h-10 mx-auto text-[#9BAD50]" viewBox="0 0 100 40" fill="currentColor">
                  <path d="M50 5 C45 15, 35 20, 35 35 L65 35 C65 20, 55 15, 50 5 Z M20 20 L25 20 L25 35 L20 35 Z M75 20 L80 20 L80 35 L75 35 Z M10 38 Q50 32 90 38 L90 40 L10 40 Z" />
                </svg>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 2: 設定画面                                        */}
          {/* ========================================================= */}
          {currentScreen === "settings" && (
            <div className="flex-1 flex flex-col p-5 space-y-5">
              {/* ヘッダー */}
              <div className="flex items-center space-x-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentScreen("home")}
                  className="w-8 h-8 rounded-full bg-[#F4F6EA] flex items-center justify-center text-[#9BAD50]"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="font-bold text-base text-slate-900">ハラール基準の設定</h1>
              </div>

              <div className="bg-[#FAFBF7] border border-[#9BAD50]/20 rounded-xl p-3 text-[11px] text-slate-600 leading-relaxed">
                あなたの信仰や考え方に合わせて、許容できるリスクのレベルを設定します。（後からいつでも変更できます）
              </div>

              <div className="space-y-4">
                {/* 項目1: アルコール3区分 */}
                <div className="border border-[#9BAD50]/20 rounded-2xl p-4 bg-white space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                    <HelpCircle className="w-4 h-4 text-[#9BAD50]" />
                    <span>アルコールの扱い（3区分）</span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <p className="text-[11px] text-slate-700 mb-1 font-medium">① アルコール直接含有（酒粕・洋酒スイーツ等）</p>
                      <ToleranceSelector
                        value={preferences.alcohol_rules.direct_alcohol}
                        onChange={(val) =>
                          setPreferences({
                            ...preferences,
                            alcohol_rules: { ...preferences.alcohol_rules, direct_alcohol: val },
                          })
                        }
                        labels={{ strict: "避ける", conditional: "場合による", allow: "気にしない" }}
                      />
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-700 mb-1 font-medium">② 発酵由来・残存0%（醤油・味噌等）</p>
                      <ToleranceSelector
                        value={preferences.alcohol_rules.fermented_zero}
                        onChange={(val) =>
                          setPreferences({
                            ...preferences,
                            alcohol_rules: { ...preferences.alcohol_rules, fermented_zero: val },
                          })
                        }
                        labels={{ strict: "避ける", conditional: "場合による", allow: "気にしない" }}
                      />
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-700 mb-1 font-medium">③ 調理時加熱揮発（みりん・料理酒等の加熱料理）</p>
                      <ToleranceSelector
                        value={preferences.alcohol_rules.cooked_evaporated}
                        onChange={(val) =>
                          setPreferences({
                            ...preferences,
                            alcohol_rules: { ...preferences.alcohol_rules, cooked_evaporated: val },
                          })
                        }
                        labels={{ strict: "避ける", conditional: "場合による", allow: "気にしない" }}
                      />
                    </div>
                  </div>
                </div>

                {/* 項目2: 豚由来成分 */}
                <div className="border border-[#9BAD50]/20 rounded-2xl p-4 bg-white space-y-2">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>🐷</span> 豚由来成分（肉・豚骨・エキス）
                  </p>
                  <p className="text-[11px] text-slate-500">豚骨スープやゼラチン、エキス等の許容度</p>
                  <ToleranceSelector
                    value={preferences.pork_level}
                    onChange={(val) => setPreferences({ ...preferences, pork_level: val })}
                    labels={{ strict: "避ける", conditional: "場合による", allow: "気にしない" }}
                  />
                </div>

                {/* 項目3: ゼラチン */}
                <div className="border border-[#9BAD50]/20 rounded-2xl p-4 bg-white space-y-2">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>🥣</span> ゼラチン・動物性油脂
                  </p>
                  <p className="text-[11px] text-slate-500">デザートや加工食品に含まれるゼラチン</p>
                  <ToleranceSelector
                    value={preferences.gelatin_level}
                    onChange={(val) => setPreferences({ ...preferences, gelatin_level: val })}
                    labels={{ strict: "避ける", conditional: "場合による", allow: "気にしない" }}
                  />
                </div>

                {/* 項目4: 補足記述欄 */}
                <div className="border border-[#9BAD50]/20 rounded-2xl p-4 bg-white space-y-2">
                  <p className="text-xs font-bold text-slate-800">
                    ハラール基準の補足記述（任意）
                  </p>
                  <textarea
                    rows={3}
                    value={preferences.custom_notes}
                    onChange={(e) => setPreferences({ ...preferences, custom_notes: e.target.value })}
                    placeholder="例: 乳化剤もできるだけ避けたい、シーフード中心ならOK、ハナフィー学派に近い基準 など"
                    className="w-full p-2.5 text-xs bg-[#FAFBF7] border border-[#9BAD50]/30 rounded-xl focus:outline-none focus:border-[#9BAD50] text-slate-800"
                  />
                </div>
              </div>

              {/* 保存ボタン */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                  style={{ backgroundColor: THEME_COLOR }}
                >
                  <Check className="w-4 h-4" />
                  <span>設定を保存</span>
                </button>
              </div>

              {/* トースト */}
              {saveToast && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full text-xs shadow-lg animate-fadeIn flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#9BAD50]" />
                  <span>設定を保存しました！</span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 3: 解析・判断材料画面                              */}
          {/* ========================================================= */}
          {currentScreen === "result" && analysisResult && (
            <div className="flex-1 flex flex-col p-5 space-y-5">
              {/* ヘッダー */}
              <div className="flex items-center space-x-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentScreen("home")}
                  className="w-8 h-8 rounded-full bg-[#F4F6EA] flex items-center justify-center text-[#9BAD50]"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="font-bold text-base text-slate-900">解析結果</h1>
              </div>

              {/* 写真サムネイル */}
              {selectedImage && (
                <div className="rounded-2xl overflow-hidden aspect-16/9 bg-slate-100 border border-[#9BAD50]/30 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedImage} alt="解析対象料理" className="w-full h-full object-cover" />
                </div>
              )}

              {/* 総合ステータスバナー */}
              <div className="bg-[#FAFBF7] border-2 border-[#9BAD50] rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#9BAD50] flex items-center justify-center text-white shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">総合判定</p>
                  <p className="text-sm font-bold text-slate-900">
                    このメニューのハラール適合性は「<span className="text-[#5C6B38]">要確認</span>」です
                  </p>
                </div>
              </div>

              {/* チェックポイント詳細 */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#9BAD50]" />
                  <span>チェックポイント</span>
                </h2>

                <div className="space-y-2.5">
                  {analysisResult.checkpoints.map((cp, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-[#9BAD50]/20 rounded-xl p-3 space-y-1 shadow-2xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800">{cp.title}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                            cp.risk_level === "safe"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : cp.risk_level === "warning"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {cp.risk_level === "safe" ? "安心" : cp.risk_level === "warning" ? "要確認" : "非推奨"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{cp.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 次へボタン */}
              <div className="pt-2 mt-auto">
                <button
                  type="button"
                  onClick={() => setCurrentScreen("proposals")}
                  className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                  style={{ backgroundColor: THEME_COLOR }}
                >
                  <span>次へ（提案・フレーズを確認）</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 4: 提案・フレーズ画面                              */}
          {/* ========================================================= */}
          {currentScreen === "proposals" && analysisResult && (
            <div className="flex-1 flex flex-col p-5 space-y-5">
              {/* ヘッダー */}
              <div className="flex items-center space-x-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentScreen("result")}
                  className="w-8 h-8 rounded-full bg-[#F4F6EA] flex items-center justify-center text-[#9BAD50]"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="font-bold text-base text-slate-900">あなたへの提案</h1>
              </div>

              {/* サマリーアラート */}
              <div className="bg-[#FAFBF7] border border-[#9BAD50]/30 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#9BAD50] text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-snug">
                  このメニューはそのままでの飲食は難しい可能性があります
                </p>
              </div>

              {/* 代替案のご提案 */}
              <div className="space-y-2.5">
                <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-[#9BAD50]" />
                  <span>代替案のご提案</span>
                </h2>
                <div className="bg-[#FAFBF7] border border-[#9BAD50]/20 rounded-2xl p-3.5 space-y-2">
                  <p className="text-[11px] text-slate-500">以下のような選択肢を注文時に提案できます：</p>
                  <div className="space-y-1.5">
                    {analysisResult.ai_proposals.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-[#9BAD50] shrink-0 mt-0.5" />
                        <span>{item.proposal_text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* お店の方に見せるフレーズ */}
              <div className="space-y-2.5">
                <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#9BAD50]" />
                  <span>お店の方に見せるフレーズ</span>
                </h2>

                <div className="space-y-3">
                  {analysisResult.staff_communication_cards.map((card, idx) => (
                    <div
                      key={idx}
                      className="bg-white border-2 border-[#9BAD50]/40 rounded-2xl p-4 space-y-2.5 relative shadow-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-[#5C6B38] bg-[#F4F6EA] px-2.5 py-0.5 rounded-full">
                          {card.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCardForFullscreen(card.message);
                            setCurrentScreen("fullscreen_card");
                          }}
                          className="text-[11px] text-[#9BAD50] flex items-center gap-1 font-semibold hover:underline"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>大きく表示</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-800 leading-relaxed font-medium bg-[#FAFBF7] p-3 rounded-xl border border-[#9BAD50]/15">
                        「{card.message}」
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ホームへ戻るボタン */}
              <div className="pt-2 mt-auto">
                <button
                  type="button"
                  onClick={() => setCurrentScreen("home")}
                  className="w-full py-3 px-4 rounded-xl border border-[#9BAD50] text-[#5C6B38] font-bold text-xs hover:bg-[#F4F6EA] transition-all"
                >
                  トップに戻る
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 5: 店員提示用 フルスクリーンカード                 */}
          {/* ========================================================= */}
          {currentScreen === "fullscreen_card" && (
            <div className="flex-1 flex flex-col p-6 bg-white justify-between animate-fadeIn">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">店員さんにお見せください</span>
                <button
                  type="button"
                  onClick={() => setCurrentScreen("proposals")}
                  className="text-xs font-bold text-[#9BAD50] px-3 py-1 bg-[#F4F6EA] rounded-full"
                >
                  閉じる ✕
                </button>
              </div>

              <div className="my-auto py-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#F4F6EA] flex items-center justify-center text-[#9BAD50]">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 leading-relaxed tracking-wide px-2">
                  {selectedCardForFullscreen}
                </p>
              </div>

              <div className="text-center text-[11px] text-slate-400">
                タップして前の画面に戻る
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
