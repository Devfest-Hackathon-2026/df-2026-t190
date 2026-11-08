"use client";

import React, { useState, useRef } from "react";
import {
  Camera,
  ImageIcon,
  AlertTriangle,
  Smile,
  CreditCard,
  Check,
  X,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Volume2,
} from "lucide-react";

// アクセントカラー
const ACCENT_COLOR = "#9BAD50";

type Language = "JP" | "EN";
type TabType = "home" | "camera" | "settings" | "cards";
type FlowStep = "camera_input" | "result" | "proposal_user" | "proposal_staff";

export default function App() {
  const [lang, setLang] = useState<Language>("JP");
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [flowStep, setFlowStep] = useState<FlowStep>("camera_input");

  // 設定状態
  const [alcoholDirect, setAlcoholDirect] = useState<"avoid" | "conditional" | "allow">("avoid");
  const [alcoholFermented, setAlcoholFermented] = useState<"avoid" | "conditional" | "allow">("avoid");

  // 解析状態
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [staffResponse, setStaffResponse] = useState<"yes" | "no" | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 画像選択ハンドラ
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

  // サンプル画像（にくじゃが）セット
  const loadDemoNikujaga = () => {
    setSelectedImage("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80");
  };

  // 解析実行
  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setFlowStep("result");
      setStaffResponse(null);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F7F8F4] flex justify-center py-0 sm:py-6">
      {/* スマホ画面コンテナ */}
      <div className="w-full max-w-md bg-white min-h-screen sm:min-h-[844px] sm:rounded-[36px] shadow-xl flex flex-col justify-between overflow-hidden relative border-0 sm:border sm:border-[#9BAD50]/20">
        
        {/* ================= ヘッダー ================= */}
        <header className="px-5 pt-4 pb-3 flex justify-between items-center border-b border-slate-100 bg-white sticky top-0 z-20">
          <div className="flex items-center space-x-1.5">
            <span className="text-xl font-black tracking-tight text-[#9BAD50]">🍽️ POY</span>
          </div>

          {/* 言語切り替えボタン [EN / JP] */}
          <button
            type="button"
            onClick={() => setLang(lang === "JP" ? "EN" : "JP")}
            className="px-3 py-1 rounded-full text-xs font-bold border border-[#9BAD50] text-[#9BAD50] hover:bg-[#9BAD50] hover:text-white transition-all flex items-center gap-1 shadow-2xs"
          >
            <span>{lang === "JP" ? "EN / JP" : "JP / EN"}</span>
          </button>
        </header>

        {/* ================= メインコンテンツ ================= */}
        <main className="flex-1 flex flex-col overflow-y-auto p-5">

          {/* ---------------- 1. ホーム画面 ---------------- */}
          {activeTab === "home" && (
            <div className="flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4 pt-2">
                {/* AI注意警告（手書きメモ配置） */}
                <div className="border border-[#9BAD50]/40 bg-[#FAFBF7] rounded-xl p-4 flex items-start gap-3 shadow-2xs">
                  <AlertTriangle className="w-5 h-5 text-[#9BAD50] shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {lang === "JP"
                      ? "⚠️ AIは間違えることがあります。"
                      : "⚠️ AI may make mistakes."}
                  </p>
                </div>

                {/* メインウェルカムメッセージ */}
                <div className="bg-white border border-[#9BAD50]/30 rounded-2xl p-6 text-center space-y-3 shadow-xs">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#FAFBF7] border border-[#9BAD50]/30 flex items-center justify-center text-[#9BAD50]">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">
                      {lang === "JP" ? "料理の写真を撮ってハラール判定" : "Take a food photo for Halal check"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === "JP"
                        ? "下の「カメラ」ボタンから撮影を始めましょう"
                        : "Tap the Camera button below to start"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("camera");
                      setFlowStep("camera_input");
                    }}
                    className="w-full py-3 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-98"
                    style={{ backgroundColor: ACCENT_COLOR }}
                  >
                    {lang === "JP" ? "カメラを起動する" : "Launch Camera"}
                  </button>
                </div>
              </div>

              {/* クイックサマリー表示 */}
              <div className="border border-[#9BAD50]/20 rounded-2xl p-4 bg-[#FAFBF7] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">
                    {lang === "JP" ? "現在のハラール設定" : "Current Settings"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("settings")}
                    className="text-[11px] text-[#9BAD50] font-bold hover:underline"
                  >
                    {lang === "JP" ? "変更 >" : "Edit >"}
                  </button>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>① 直接アルコール:</span>
                    <span className="font-semibold text-[#9BAD50]">
                      {alcoholDirect === "avoid" ? "避ける" : alcoholDirect === "conditional" ? "場合による" : "気にしない"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>② 発酵由来（残存0%）:</span>
                    <span className="font-semibold text-[#9BAD50]">
                      {alcoholFermented === "avoid" ? "避ける" : alcoholFermented === "conditional" ? "場合による" : "気にしない"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- 2. カメラ画面 ＆ 解析フロー ---------------- */}
          {activeTab === "camera" && (
            <div className="flex-1 flex flex-col">
              
              {/* STEP A: カメラ撮影 & アルバム選択 */}
              {flowStep === "camera_input" && (
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    {/* ファインダー枠 [ 📷 ] */}
                    <div className="border-2 border-dashed border-[#9BAD50] rounded-3xl aspect-4/3 bg-[#FAFBF7] p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                      {selectedImage ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedImage}
                            alt="選択された料理"
                            className="w-full h-full object-cover rounded-2xl"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-1.5 text-xs hover:bg-black/80"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center space-y-3">
                          {/* 手書きワイヤーフレームのカメラ枠線デザイン [ 📷 ] */}
                          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#9BAD50]" />
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#9BAD50]" />
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#9BAD50]" />
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#9BAD50]" />
                            <button
                              type="button"
                              onClick={() => cameraInputRef.current?.click()}
                              className="w-16 h-16 rounded-full bg-[#FAFBF7] border-2 border-[#9BAD50] flex items-center justify-center text-[#9BAD50] shadow-sm hover:scale-105 active:scale-95 transition-all"
                            >
                              <Camera className="w-8 h-8" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {lang === "JP" ? "枠に合わせて撮影" : "Align dish inside frame"}
                          </p>
                          <button
                            type="button"
                            onClick={loadDemoNikujaga}
                            className="text-[11px] text-[#9BAD50] underline font-bold"
                          >
                            {lang === "JP" ? "サンプル写真（にくじゃが）を使う" : "Use sample photo (Nikujaga)"}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* [🖼️ アルバムから選択] ボタン（ピル形状） */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-full border border-[#9BAD50] bg-white text-[#5C6B38] font-bold text-xs flex items-center justify-center gap-2 shadow-2xs hover:bg-[#FAFBF7] transition-all"
                    >
                      <ImageIcon className="w-4 h-4 text-[#9BAD50]" />
                      <span>{lang === "JP" ? "アルバムから選択" : "Choose from Album"}</span>
                    </button>

                    {/* [ 解析する ] ボタン */}
                    <button
                      type="button"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                      style={{ backgroundColor: ACCENT_COLOR }}
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{lang === "JP" ? "解析中..." : "Analyzing..."}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{lang === "JP" ? "解析する" : "Analyze"}</span>
                        </>
                      )}
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

                  {/* AI注意警告（下部配置） */}
                  <div className="border border-[#9BAD50]/40 bg-[#FAFBF7] rounded-xl p-3 flex items-center gap-2.5 shadow-2xs">
                    <AlertTriangle className="w-4 h-4 text-[#9BAD50] shrink-0" />
                    <p className="text-[11px] text-slate-700 font-medium">
                      {lang === "JP"
                        ? "AIは間違えることがあります。"
                        : "AI may make mistakes."}
                    </p>
                  </div>
                </div>
              )}

              {/* STEP B: 解析結果画面（料理名：にくじゃが） */}
              {flowStep === "result" && (
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <button
                        type="button"
                        onClick={() => setFlowStep("camera_input")}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <h2 className="text-base font-black text-slate-900">
                        {lang === "JP" ? "解析結果" : "Analysis Result"}
                      </h2>
                    </div>

                    {/* 料理名カード */}
                    <div className="border border-[#9BAD50]/40 bg-[#FAFBF7] rounded-2xl p-4 text-center">
                      <p className="text-xs text-slate-500 font-medium">
                        {lang === "JP" ? "料理名" : "Dish Name"}
                      </p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">
                        {lang === "JP" ? "にくじゃが" : "Nikujaga (Simmered Beef/Pork & Potatoes)"}
                      </p>
                    </div>

                    {/* 成分リスト */}
                    <div className="border border-[#9BAD50]/30 rounded-2xl p-4 bg-white space-y-3 shadow-xs">
                      <p className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
                        {lang === "JP" ? "検出された成分（入っている可能性）" : "Detected Ingredients"}
                      </p>

                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/70 border border-rose-200">
                          <span className="flex items-center gap-2 text-xs font-bold text-rose-800">
                            <span className="text-base">🐷</span> {lang === "JP" ? "ぶた肉" : "Pork"}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                            {lang === "JP" ? "入っている可能性: 高" : "High Risk"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 border border-amber-200">
                          <span className="flex items-center gap-2 text-xs font-bold text-amber-800">
                            <span className="text-base">💧</span> {lang === "JP" ? "しょう油（加熱みりん）" : "Soy Sauce / Mirin"}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                            {lang === "JP" ? "入っている可能性: 中" : "Moderate Risk"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 次へのボタン（手書きメモの「あなたへの提案」へ遷移） */}
                    <button
                      type="button"
                      onClick={() => setFlowStep("proposal_user")}
                      className="w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                      style={{ backgroundColor: ACCENT_COLOR }}
                    >
                      <span>{lang === "JP" ? "あなたへの提案を見る" : "View Proposals for You"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* AI注意警告 */}
                  <div className="border border-[#9BAD50]/40 bg-[#FAFBF7] rounded-xl p-3 flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-[#9BAD50] shrink-0" />
                    <p className="text-[11px] text-slate-700 font-medium">
                      {lang === "JP" ? "AIは間違えることがあります。" : "AI may make mistakes."}
                    </p>
                  </div>
                </div>
              )}

              {/* STEP C: あなたへの提案画面 */}
              {flowStep === "proposal_user" && (
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <button
                        type="button"
                        onClick={() => setFlowStep("result")}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <h2 className="text-base font-black text-slate-900">
                        {lang === "JP" ? "あなたへの提案" : "Proposals for You"}
                      </h2>
                    </div>

                    {/* 提案カード 1 */}
                    <button
                      type="button"
                      onClick={() => setFlowStep("proposal_staff")}
                      className="w-full text-left p-4 rounded-2xl border-2 border-[#9BAD50] bg-[#FAFBF7] hover:bg-[#F4F6EA] transition-all space-y-1 shadow-xs group"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#5C6B38]">
                          {lang === "JP" ? "選択肢 A（店員へ交渉）" : "Option A"}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#9BAD50] group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-sm font-black text-slate-900">
                        {lang === "JP" ? "ぶた肉を避けて食べますか？" : "Eat without pork?"}
                      </p>
                      <p className="text-[11px] text-slate-500 pt-1">
                        👉 {lang === "JP" ? "店員さんにお願いするカードを表示します" : "Show communication card for staff"}
                      </p>
                    </button>

                    <div className="text-center font-bold text-xs text-slate-400">
                      {lang === "JP" ? "— or —" : "— or —"}
                    </div>

                    {/* 提案カード 2 */}
                    <button
                      type="button"
                      onClick={() => {
                        alert(lang === "JP" ? "別の料理（魚料理や野菜天ぷらなど）を検索します" : "Searching for other dishes...");
                      }}
                      className="w-full text-left p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all space-y-1 shadow-2xs"
                    >
                      <span className="text-xs font-bold text-slate-500">
                        {lang === "JP" ? "選択肢 B" : "Option B"}
                      </span>
                      <p className="text-sm font-bold text-slate-800">
                        {lang === "JP" ? "別の料理を選択する" : "Choose another dish"}
                      </p>
                      <p className="text-[11px] text-slate-400 pt-1">
                        {lang === "JP" ? "ハラール対応しやすいメニューを探します" : "Find safer Halal-friendly alternatives"}
                      </p>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFlowStep("camera_input")}
                    className="w-full py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    {lang === "JP" ? "撮影し直す" : "Take Another Photo"}
                  </button>
                </div>
              )}

              {/* STEP D: 店員への提案画面（手書きメモの「はい」「ごめんなさい」ボタン付き！） */}
              {flowStep === "proposal_staff" && (
                <div className="flex-1 flex flex-col justify-between space-y-5 bg-white">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFlowStep("proposal_user")}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <h2 className="text-base font-black text-slate-900">
                          {lang === "JP" ? "店員への提案" : "Message for Staff"}
                        </h2>
                      </div>
                      <span className="text-[10px] bg-[#FAFBF7] border border-[#9BAD50]/40 text-[#5C6B38] font-bold px-2 py-0.5 rounded-full">
                        {lang === "JP" ? "店員さんに見せる画面" : "Show to Staff"}
                      </span>
                    </div>

                    {/* 店員さんに見せる超特大メッセージ枠 */}
                    <div className="border-2 border-[#9BAD50] rounded-3xl p-6 bg-[#FAFBF7] text-center space-y-4 shadow-sm">
                      <div className="w-12 h-12 mx-auto rounded-full bg-[#9BAD50] text-white flex items-center justify-center">
                        <Volume2 className="w-6 h-6" />
                      </div>
                      <p className="text-lg sm:text-xl font-black text-slate-900 leading-relaxed tracking-wide">
                        {lang === "JP"
                          ? "ぶた肉を使わずに調理して頂けますか？"
                          : "Could you please prepare this without using pork?"}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {lang === "JP"
                          ? "（宗教上の理由により豚肉・アルコールを避けています）"
                          : "(Due to religious reasons, I cannot eat pork or alcohol)"}
                      </p>
                    </div>

                    {/* 店員さんの回答ボタンエリア（手書きメモ再現！） */}
                    <div className="space-y-2 pt-2">
                      <p className="text-center text-xs font-bold text-slate-600">
                        👇 店員さん、こちらをタップしてください：
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {/* [ はい ] ボタン */}
                        <button
                          type="button"
                          onClick={() => setStaffResponse("yes")}
                          className={`py-4 px-3 rounded-2xl border-2 font-black text-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                            staffResponse === "yes"
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-md"
                              : "bg-white border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          <Check className="w-5 h-5" />
                          <span>{lang === "JP" ? "はい" : "Yes, we can"}</span>
                        </button>

                        {/* [ ごめんなさい できません ] ボタン */}
                        <button
                          type="button"
                          onClick={() => setStaffResponse("no")}
                          className={`py-4 px-3 rounded-2xl border-2 font-black text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                            staffResponse === "no"
                              ? "bg-rose-600 border-rose-600 text-white shadow-md"
                              : "bg-white border-rose-400 text-rose-700 hover:bg-rose-50"
                          }`}
                        >
                          <X className="w-5 h-5" />
                          <span>{lang === "JP" ? "ごめんなさい できません" : "Sorry, we cannot"}</span>
                        </button>
                      </div>
                    </div>

                    {/* 店員さんのタップ後のリアクションメッセージ */}
                    {staffResponse === "yes" && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800 animate-fadeIn">
                        🎉 {lang === "JP" ? "ありがとうございます！注文をお願いしましょう！" : "Thank you! You can proceed with this order!"}
                      </div>
                    )}
                    {staffResponse === "no" && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center text-xs font-bold text-rose-800 animate-fadeIn">
                        💡 {lang === "JP" ? "承知しました。別のハラール対応メニューを探しましょう。" : "Understood. Let's find another Halal-friendly option."}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("home");
                      setFlowStep("camera_input");
                    }}
                    className="w-full py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    {lang === "JP" ? "ホームに戻る" : "Back to Home"}
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ---------------- 3. ユーザーの設定画面 ---------------- */}
          {activeTab === "settings" && (
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <h2 className="text-base font-black text-slate-900">
                    {lang === "JP" ? "ユーザーの設定（ハラール規則）" : "User Halal Settings"}
                  </h2>
                </div>

                {/* ① アルコールが入っている食品 */}
                <div className="border border-[#9BAD50]/30 rounded-2xl p-4 bg-[#FAFBF7] space-y-2.5">
                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    ① {lang === "JP" ? "アルコールが入っている食品" : "Food containing direct alcohol"}
                  </p>
                  <p className="text-[11px] text-slate-500">（酒粕、洋酒入りスイーツなど）</p>

                  <div className="space-y-1.5 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-2 rounded-xl hover:bg-white transition-all">
                      <input
                        type="radio"
                        name="alcohol_direct"
                        checked={alcoholDirect === "avoid"}
                        onChange={() => setAlcoholDirect("avoid")}
                        className="accent-[#9BAD50] w-4 h-4"
                      />
                      <span>○ {lang === "JP" ? "避ける" : "Avoid"}</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-2 rounded-xl hover:bg-white transition-all">
                      <input
                        type="radio"
                        name="alcohol_direct"
                        checked={alcoholDirect === "conditional"}
                        onChange={() => setAlcoholDirect("conditional")}
                        className="accent-[#9BAD50] w-4 h-4"
                      />
                      <span>○ {lang === "JP" ? "場合によっては気にしない" : "Conditional"}</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-2 rounded-xl hover:bg-white transition-all">
                      <input
                        type="radio"
                        name="alcohol_direct"
                        checked={alcoholDirect === "allow"}
                        onChange={() => setAlcoholDirect("allow")}
                        className="accent-[#9BAD50] w-4 h-4"
                      />
                      <span>○ {lang === "JP" ? "気にしない" : "Allow"}</span>
                    </label>
                  </div>
                </div>

                {/* ② 製造過程で発生・残存0%の食品 */}
                <div className="border border-[#9BAD50]/30 rounded-2xl p-4 bg-[#FAFBF7] space-y-2.5">
                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    ② {lang === "JP" ? "製造過程で発生・残存0%の食品" : "Fermented food with 0% residue"}
                  </p>
                  <p className="text-[11px] text-slate-500">（醤油、味噌などの発酵調味料）</p>

                  <div className="space-y-1.5 pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-2 rounded-xl hover:bg-white transition-all">
                      <input
                        type="radio"
                        name="alcohol_fermented"
                        checked={alcoholFermented === "avoid"}
                        onChange={() => setAlcoholFermented("avoid")}
                        className="accent-[#9BAD50] w-4 h-4"
                      />
                      <span>○ {lang === "JP" ? "避ける" : "Avoid"}</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-2 rounded-xl hover:bg-white transition-all">
                      <input
                        type="radio"
                        name="alcohol_fermented"
                        checked={alcoholFermented === "conditional"}
                        onChange={() => setAlcoholFermented("conditional")}
                        className="accent-[#9BAD50] w-4 h-4"
                      />
                      <span>○ {lang === "JP" ? "場合によっては気にしない" : "Conditional"}</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-2 rounded-xl hover:bg-white transition-all">
                      <input
                        type="radio"
                        name="alcohol_fermented"
                        checked={alcoholFermented === "allow"}
                        onChange={() => setAlcoholFermented("allow")}
                        className="accent-[#9BAD50] w-4 h-4"
                      />
                      <span>○ {lang === "JP" ? "気にしない" : "Allow"}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 保存して戻る */}
              <button
                type="button"
                onClick={() => setActiveTab("home")}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-md transition-all active:scale-98"
                style={{ backgroundColor: ACCENT_COLOR }}
              >
                {lang === "JP" ? "設定を保存して戻る" : "Save and Return"}
              </button>
            </div>
          )}

          {/* ---------------- 4. カード一覧画面（ボトムタブの「カード」） ---------------- */}
          {activeTab === "cards" && (
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h2 className="text-base font-black text-slate-900">
                    {lang === "JP" ? "店員に見せるカード一覧" : "Staff Communication Cards"}
                  </h2>
                  <p className="text-xs text-slate-500">外食時にワンタップで見せられるカードです</p>
                </div>

                <div className="space-y-3">
                  <div
                    onClick={() => {
                      setActiveTab("camera");
                      setFlowStep("proposal_staff");
                    }}
                    className="border-2 border-[#9BAD50] rounded-2xl p-4 bg-[#FAFBF7] cursor-pointer hover:bg-[#F4F6EA] transition-all space-y-2 shadow-xs"
                  >
                    <span className="text-[10px] font-bold text-white bg-[#9BAD50] px-2 py-0.5 rounded-full">
                      変更依頼
                    </span>
                    <p className="text-sm font-black text-slate-900">
                      「ぶた肉を使わずに調理して頂けますか？」
                    </p>
                    <p className="text-[11px] text-slate-500">
                      👉 タップして回答ボタン付きの大画面を表示
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setActiveTab("camera");
                      setFlowStep("proposal_staff");
                    }}
                    className="border border-[#9BAD50]/40 rounded-2xl p-4 bg-white cursor-pointer hover:bg-[#FAFBF7] transition-all space-y-2 shadow-2xs"
                  >
                    <span className="text-[10px] font-bold text-[#5C6B38] bg-[#F4F6EA] px-2 py-0.5 rounded-full">
                      メニュー相談
                    </span>
                    <p className="text-sm font-bold text-slate-800">
                      「豚肉やアルコールを避けています。食べられる料理はありますか？」
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-[#9BAD50]/30 bg-[#FAFBF7] rounded-xl p-3 text-center text-xs text-[#5C6B38]">
                💡 店員さんにスマホ画面を向けて見せてください
              </div>
            </div>
          )}

        </main>

        {/* ================= ボトムナビゲーションバー（手書きメモの3タブ） ================= */}
        <nav className="border-t border-slate-100 bg-white/95 backdrop-blur-md px-6 py-2.5 flex justify-between items-center z-20">
          {/* 左: ユーザーの設定 */}
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === "settings" ? "text-[#9BAD50] font-bold scale-105" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Smile className="w-5 h-5" />
            <span className="text-[10px]">
              {lang === "JP" ? "ユーザー設定" : "Settings"}
            </span>
          </button>

          {/* 中央: カメラ */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("camera");
              setFlowStep("camera_input");
            }}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === "camera" ? "text-[#9BAD50] font-bold scale-105" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <div className={`p-2 rounded-full ${activeTab === "camera" ? "bg-[#9BAD50] text-white shadow-md" : "bg-slate-100 text-slate-500"}`}>
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[10px]">
              {lang === "JP" ? "カメラ" : "Camera"}
            </span>
          </button>

          {/* 右: カード */}
          <button
            type="button"
            onClick={() => setActiveTab("cards")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === "cards" ? "text-[#9BAD50] font-bold scale-105" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px]">
              {lang === "JP" ? "カード" : "Cards"}
            </span>
          </button>
        </nav>

      </div>
    </div>
  );
}
