"use client";

import React, { useState, useRef } from "react";
import {
  Camera,
  ImageIcon,
  AlertTriangle,
  User,
  CreditCard,
  Zap,
  Check,
  X,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Volume2,
} from "lucide-react";

type Screen = "home" | "camera" | "settings" | "result" | "proposal";

export default function HalalApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");

  // 設定状態
  const [alcoholPolicy, setAlcoholPolicy] = useState<"avoid" | "conditional" | "allow">("avoid");
  const [fermentedPolicy, setFermentedPolicy] = useState<"avoid" | "conditional" | "allow">("avoid");

  // カメラ・画像
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [staffReaction, setStaffReaction] = useState<"yes" | "no" | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 画像アップロード処理
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // サンプル画像（にくじゃが）
  const loadDemoNikujaga = () => {
    setCapturedImage("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80");
  };

  // 解析実行
  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setCurrentScreen("result");
      setStaffReaction(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#D5E1D2] flex flex-col items-center justify-center p-0 sm:p-4 select-none">
      
      {/* 画面切り替えデバッグバー（上部） */}
      <div className="w-full max-w-md mb-2 hidden sm:flex items-center justify-between px-3 text-[11px] text-slate-600 bg-white/70 backdrop-blur-xs py-1.5 rounded-full border border-white/50">
        <span className="font-bold text-[#556E4A]">画面切替:</span>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentScreen("home")}
            className={`px-2 py-0.5 rounded-full ${currentScreen === "home" ? "bg-[#556E4A] text-white font-bold" : "hover:bg-black/5"}`}
          >
            ①ホーム
          </button>
          <button
            onClick={() => setCurrentScreen("camera")}
            className={`px-2 py-0.5 rounded-full ${currentScreen === "camera" ? "bg-[#556E4A] text-white font-bold" : "hover:bg-black/5"}`}
          >
            ②カメラ
          </button>
          <button
            onClick={() => setCurrentScreen("settings")}
            className={`px-2 py-0.5 rounded-full ${currentScreen === "settings" ? "bg-[#556E4A] text-white font-bold" : "hover:bg-black/5"}`}
          >
            ③設定
          </button>
          <button
            onClick={() => setCurrentScreen("result")}
            className={`px-2 py-0.5 rounded-full ${currentScreen === "result" ? "bg-[#556E4A] text-white font-bold" : "hover:bg-black/5"}`}
          >
            ④解析結果
          </button>
          <button
            onClick={() => setCurrentScreen("proposal")}
            className={`px-2 py-0.5 rounded-full ${currentScreen === "proposal" ? "bg-[#556E4A] text-white font-bold" : "hover:bg-black/5"}`}
          >
            ⑤提案
          </button>
        </div>
      </div>

      {/* スマホ本体フレーム */}
      <div className={`w-full max-w-md min-h-screen sm:min-h-[820px] sm:max-h-[860px] sm:rounded-[44px] shadow-2xl flex flex-col justify-between overflow-hidden relative border-0 sm:border-8 sm:border-slate-800 transition-colors duration-300 ${
        currentScreen === "camera" ? "bg-black" : "bg-[#DCE8D8]"
      }`}>

        {/* Dynamic Island / 上部ノッチ & ステータスバー */}
        <div className={`pt-3 px-7 flex justify-between items-center text-xs font-semibold z-30 shrink-0 ${
          currentScreen === "camera" ? "text-white" : "text-slate-800"
        }`}>
          <span>9:41</span>
          <div className="w-24 h-4 bg-black rounded-full mx-auto hidden sm:block shadow-xs" />
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px]">5G</span>
            <div className={`w-5 h-2.5 border rounded-xs p-0.5 flex items-center ${currentScreen === "camera" ? "border-white" : "border-slate-800"}`}>
              <div className={`h-full w-full rounded-2xs ${currentScreen === "camera" ? "bg-white" : "bg-slate-800"}`} />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 画面1: ホーム画面                                                         */}
        {/* ========================================================================= */}
        {currentScreen === "home" && (
          <div className="flex-1 flex flex-col justify-between p-5 space-y-4 overflow-y-auto">
            {/* 上部アラートピル */}
            <div className="bg-white/95 rounded-full py-2 px-4 shadow-xs flex items-center justify-center gap-1.5 mx-auto max-w-xs">
              <AlertTriangle className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
              <span className="text-xs font-bold text-slate-800">
                AIは間違えることがあります。
              </span>
            </div>

            {/* 中央メインカード */}
            <div className="bg-white rounded-3xl p-6 shadow-xs text-center space-y-5 my-auto">
              <h1 className="text-lg font-black text-slate-800 tracking-tight leading-snug">
                料理の写真を撮って<br />ハラール判定
              </h1>

              {/* 可愛いカメラのイラスト */}
              <div className="w-28 h-24 mx-auto relative flex items-center justify-center">
                {/* トイカメラ本体 */}
                <div className="w-24 h-18 bg-[#F49A67] rounded-2xl border-3 border-slate-800 shadow-sm relative flex items-center justify-center">
                  {/* シャッターボタン */}
                  <div className="absolute -top-3 right-4 w-6 h-3 bg-[#EE7A38] rounded-t-md border-2 border-slate-800" />
                  {/* フラッシュ */}
                  <div className="absolute top-2 left-3 w-3 h-3 rounded-full bg-amber-300 border border-slate-800" />
                  {/* レンズ */}
                  <div className="w-12 h-12 rounded-full bg-[#5BA8D4] border-3 border-slate-800 flex items-center justify-center shadow-inner">
                    <div className="w-6 h-6 rounded-full bg-[#357EA8] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white opacity-80" />
                    </div>
                  </div>
                </div>
              </div>

              {/* [ カメラを起動する ] ボタン */}
              <button
                type="button"
                onClick={() => setCurrentScreen("camera")}
                className="w-full py-3.5 px-6 rounded-full text-white font-black text-sm shadow-md transition-all active:scale-98 hover:brightness-105"
                style={{ backgroundColor: "#556E4A" }}
              >
                カメラを起動する
              </button>
            </div>

            {/* 下部サマリーカード */}
            <div className="bg-white rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-black text-slate-700 tracking-wide">
                  現在のハラール基準
                </h2>
                <button
                  type="button"
                  onClick={() => setCurrentScreen("settings")}
                  className="text-[11px] text-[#556E4A] font-bold hover:underline"
                >
                  設定へ ＞
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">直接アルコール:</span>
                  <span className="px-3 py-1 rounded-xl text-xs font-black bg-[#F7D8B5] text-[#8C4E15]">
                    {alcoholPolicy === "avoid" ? "避ける" : alcoholPolicy === "conditional" ? "場合による" : "気にしない"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">発酵由来:</span>
                  <span className="px-3 py-1 rounded-xl text-xs font-black bg-[#F7D8B5] text-[#8C4E15]">
                    {fermentedPolicy === "avoid" ? "避ける" : fermentedPolicy === "conditional" ? "場合による" : "気にしない"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 画面2: カメラ画面（完全な黒背景のカメラビュー）                            */}
        {/* ========================================================================= */}
        {currentScreen === "camera" && (
          <div className="flex-1 flex flex-col justify-between p-6 bg-black text-white relative">
            {/* 上部ツールバー */}
            <div className="flex justify-between items-center z-20">
              <button
                type="button"
                onClick={() => setCurrentScreen("home")}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-yellow-300">
                <Zap className="w-4 h-4" />
              </div>
            </div>

            {/* 中央ファインダー枠 [  ] */}
            <div className="my-auto w-full aspect-square max-w-[280px] mx-auto relative flex items-center justify-center">
              {/* 四隅の繊細な白いL字枠 */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-white rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-white rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-white rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-white rounded-br-lg" />

              {/* 撮影画像プレビュー（もしあれば） */}
              {capturedImage ? (
                <div className="relative w-full h-full p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={capturedImage} alt="撮影画像" className="w-full h-full object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => setCapturedImage(null)}
                    className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-2 opacity-60">
                  <Camera className="w-12 h-12 mx-auto text-white" />
                  <p className="text-xs text-white">料理を枠内に収めてください</p>
                </div>
              )}
            </div>

            {/* 下部アクションエリア */}
            <div className="space-y-4 z-20">
              {/* 大きな白いシャッターボタン */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    loadDemoNikujaga();
                  }}
                  className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-95 transition-all"
                  title="シャッターを押す（デモ画像撮影）"
                >
                  <div className="w-full h-full rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* [ アルバムから選択 ] ボタン（半透明ピル形状） */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-6 rounded-full bg-white/20 border border-white/30 text-white font-bold text-xs backdrop-blur-md hover:bg-white/30 transition-all flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>アルバムから選択</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFile}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* [ 解析する ] ボタン */}
              <button
                type="button"
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="w-full py-3.5 px-6 rounded-full text-white font-black text-sm shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#556E4A" }}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>解析中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>解析する</span>
                  </>
                )}
              </button>

              {/* 最下部注意アラート */}
              <p className="text-center text-[11px] text-amber-300 font-semibold flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>AIは間違えることがあります。</span>
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 画面3: ユーザーの設定画面                                                 */}
        {/* ========================================================================= */}
        {currentScreen === "settings" && (
          <div className="flex-1 flex flex-col justify-between p-5 space-y-4 overflow-y-auto">
            {/* タイトル */}
            <h1 className="text-center text-lg font-black text-slate-800 pt-1">
              ユーザーの設定
            </h1>

            <div className="space-y-4 my-auto">
              {/* カード1: ① アルコールが入っている食品 */}
              <div className="bg-white rounded-3xl p-5 shadow-xs space-y-3">
                <h2 className="text-xs font-black text-slate-800">
                  ① アルコールが入っている食品
                </h2>

                {/* アルコール禁止イラスト */}
                <div className="text-center py-1">
                  <div className="w-16 h-16 mx-auto relative flex items-center justify-center">
                    <span className="text-3xl">🍷🍺</span>
                    <div className="absolute inset-0 border-3 border-rose-500 rounded-full flex items-center justify-center">
                      <div className="w-full h-0.5 bg-rose-500 rotate-45 transform" />
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 mt-1">アルコール</p>
                </div>

                {/* 3段階スイッチ */}
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setAlcoholPolicy("avoid")}
                    className={`py-2 rounded-xl text-center transition-all ${
                      alcoholPolicy === "avoid"
                        ? "bg-[#556E4A] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    避ける
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlcoholPolicy("conditional")}
                    className={`py-2 rounded-xl text-center transition-all ${
                      alcoholPolicy === "conditional"
                        ? "bg-[#556E4A] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    場合によっては<br className="sm:hidden" />気にしない
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlcoholPolicy("allow")}
                    className={`py-2 rounded-xl text-center transition-all ${
                      alcoholPolicy === "allow"
                        ? "bg-[#556E4A] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    気にしない
                  </button>
                </div>
              </div>

              {/* カード2: ② 製造過程で発生・残存0%の食品 */}
              <div className="bg-white rounded-3xl p-5 shadow-xs space-y-3">
                <h2 className="text-xs font-black text-slate-800">
                  ② 製造過程で発生・残存0%の食品
                </h2>

                {/* 醤油醸造イラスト */}
                <div className="text-center py-1">
                  <span className="text-4xl">🏭🥢</span>
                  <p className="text-[11px] font-bold text-slate-500 mt-1">発酵調味料（醤油・味噌）</p>
                </div>

                {/* 3段階スイッチ */}
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setFermentedPolicy("avoid")}
                    className={`py-2 rounded-xl text-center transition-all ${
                      fermentedPolicy === "avoid"
                        ? "bg-[#556E4A] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    避ける
                  </button>
                  <button
                    type="button"
                    onClick={() => setFermentedPolicy("conditional")}
                    className={`py-2 rounded-xl text-center transition-all ${
                      fermentedPolicy === "conditional"
                        ? "bg-[#556E4A] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    場合によっては<br className="sm:hidden" />気にしない
                  </button>
                  <button
                    type="button"
                    onClick={() => setFermentedPolicy("allow")}
                    className={`py-2 rounded-xl text-center transition-all ${
                      fermentedPolicy === "allow"
                        ? "bg-[#556E4A] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    気にしない
                  </button>
                </div>
              </div>
            </div>

            {/* ホームへ戻るボタン */}
            <button
              type="button"
              onClick={() => setCurrentScreen("home")}
              className="w-full py-3 rounded-full text-white font-black text-xs shadow-md"
              style={{ backgroundColor: "#556E4A" }}
            >
              設定を保存して戻る
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 画面4: 解析結果画面（料理名：にくじゃが）                                  */}
        {/* ========================================================================= */}
        {currentScreen === "result" && (
          <div className="flex-1 flex flex-col justify-between p-5 space-y-4 overflow-y-auto">
            {/* タイトル */}
            <h1 className="text-center text-lg font-black text-slate-800 pt-1">
              解析結果
            </h1>

            {/* 料理名：にくじゃが */}
            <div className="text-center py-1">
              <h2 className="text-xl font-black text-slate-900 tracking-wide">
                料理名：にくじゃが
              </h2>
            </div>

            <div className="space-y-3.5 my-auto">
              {/* カード1: 含まれている（ぶた肉 ✕ ⚠️、しょうゆ） */}
              <div className="bg-white rounded-3xl p-5 shadow-xs space-y-4">
                <span className="text-xs font-black text-slate-500 block border-b border-slate-100 pb-2">
                  含まれている
                </span>

                <div className="space-y-3">
                  {/* ぶた肉 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-xl shrink-0">
                        🐷
                      </div>
                      <span className="text-sm font-black text-slate-800">ぶた肉</span>
                    </div>
                    {/* 右側の ✕ ⚠️ */}
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center">
                        ✕
                      </span>
                      <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-500" />
                    </div>
                  </div>

                  {/* しょう油 */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl shrink-0">
                        🍶
                      </div>
                      <span className="text-sm font-black text-slate-800">しょう油</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        微量残存
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* カード2: 入っている可能性（加熱みりんなど） */}
              <div className="bg-white rounded-3xl p-4 shadow-xs space-y-1.5">
                <span className="text-xs font-black text-slate-500 block">
                  入っている可能性
                </span>
                <p className="text-xs text-slate-700 font-bold leading-relaxed">
                  調理時にみりんや料理酒（アルコール成分）が使われている可能性があります。
                </p>
              </div>

              {/* 次へ進む（あなたへの提案へ） */}
              <button
                type="button"
                onClick={() => setCurrentScreen("proposal")}
                className="w-full py-3.5 px-6 rounded-full text-white font-black text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#556E4A" }}
              >
                <span>あなたへの提案を見る</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 下部アラートピル */}
            <div className="bg-white/95 rounded-full py-2 px-4 shadow-xs flex items-center justify-center gap-1.5 mx-auto max-w-xs">
              <AlertTriangle className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
              <span className="text-xs font-bold text-slate-800">
                AIは間違えることがあります。
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 画面5: あなたへの提案 ＆ 店員への提案画面                                 */}
        {/* ========================================================================= */}
        {currentScreen === "proposal" && (
          <div className="flex-1 flex flex-col justify-between p-5 space-y-4 overflow-y-auto">
            {/* 上部カード: あなたへの提案 */}
            <div className="bg-white rounded-3xl p-5 shadow-xs text-center space-y-3">
              <h2 className="text-base font-black text-slate-800">
                あなたへの提案
              </h2>

              <div className="space-y-1.5 py-1">
                <p className="text-sm font-black text-slate-800">
                  ぶた肉を避けて食べますか？
                </p>
                <p className="text-xs font-bold text-slate-400">or</p>
                <p className="text-sm font-bold text-slate-600">
                  別の料理を選択する
                </p>
              </div>
            </div>

            {/* 下部カード: 店員への提案（手書きメモの「はい」「ごめんなさい」ボタン！） */}
            <div className="bg-white rounded-3xl p-5 shadow-xs text-center space-y-4">
              <h2 className="text-base font-black text-slate-800">
                店員への提案
              </h2>

              <p className="text-base sm:text-lg font-black text-slate-900 leading-snug px-2">
                ぶた肉を使わずに調理して頂けますか？
              </p>

              {/* 店員さん用ボタン群 */}
              <div className="space-y-2.5 pt-1">
                <p className="text-[11px] font-bold text-slate-400">
                  店員さん、当てはまる方をタップしてください：
                </p>

                {/* 上段: [ はい ] [ はい ] */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStaffReaction("yes")}
                    className={`py-3.5 px-4 rounded-full font-black text-sm text-white shadow-sm transition-all active:scale-95 ${
                      staffReaction === "yes" ? "ring-4 ring-sky-300 scale-102" : ""
                    }`}
                    style={{ backgroundColor: "#0EA5E9" }}
                  >
                    はい
                  </button>

                  <button
                    type="button"
                    onClick={() => setStaffReaction("yes")}
                    className={`py-3.5 px-4 rounded-full font-black text-sm text-white shadow-sm transition-all active:scale-95 ${
                      staffReaction === "yes" ? "ring-4 ring-emerald-300 scale-102" : ""
                    }`}
                    style={{ backgroundColor: "#22C55E" }}
                  >
                    はい
                  </button>
                </div>

                {/* 下段: [ ごめんなさい、できません ] */}
                <button
                  type="button"
                  onClick={() => setStaffReaction("no")}
                  className={`w-full py-3 px-4 rounded-full font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-98 ${
                    staffReaction === "no" ? "ring-4 ring-rose-200 bg-rose-100 text-rose-800" : ""
                  }`}
                >
                  ごめんなさい、できません
                </button>
              </div>

              {/* タップ後のリアクション演出 */}
              {staffReaction === "yes" && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-black text-emerald-800 animate-fadeIn">
                  🎉 ありがとうございます！調理をお願いしましょう！
                </div>
              )}
              {staffReaction === "no" && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-black text-rose-800 animate-fadeIn">
                  💡 承知しました。別のハラール対応メニューを探しましょう。
                </div>
              )}
            </div>

            {/* ホームに戻る */}
            <button
              type="button"
              onClick={() => setCurrentScreen("home")}
              className="w-full py-2.5 rounded-full text-slate-500 font-bold text-xs hover:text-slate-800 transition-all"
            >
              ホームに戻る
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ボトムナビゲーションバー（白背景、角丸、3つのアイコン）                     */}
        {/* ========================================================================= */}
        {currentScreen !== "camera" && (
          <nav className="bg-white rounded-t-3xl border-t border-slate-100/80 px-8 py-3 flex justify-between items-center z-20 shadow-md">
            {/* 左: ユーザー設定 */}
            <button
              type="button"
              onClick={() => setCurrentScreen("settings")}
              className={`flex flex-col items-center gap-1 transition-all ${
                currentScreen === "settings" ? "text-[#556E4A] font-black scale-105" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px]">ユーザー設定</span>
            </button>

            {/* 中央: カメラ */}
            <button
              type="button"
              onClick={() => setCurrentScreen("camera")}
              className="flex flex-col items-center gap-1 -mt-4 transition-all hover:scale-105 active:scale-95"
            >
              <div
                className="w-13 h-13 rounded-full flex items-center justify-center text-white shadow-lg border-3 border-white"
                style={{ backgroundColor: "#556E4A" }}
              >
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                カメラ
              </span>
            </button>

            {/* 右: カード */}
            <button
              type="button"
              onClick={() => setCurrentScreen("proposal")}
              className={`flex flex-col items-center gap-1 transition-all ${
                currentScreen === "proposal" ? "text-[#556E4A] font-black scale-105" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-[10px]">カード</span>
            </button>
          </nav>
        )}

      </div>
    </div>
  );
}
