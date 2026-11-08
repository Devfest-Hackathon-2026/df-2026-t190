"use client";

import React, { useState } from "react";
import {
  Camera,
  Bell,
  ChevronRight,
  ArrowLeft,
  Heart,
  Zap,
  RotateCcw,
  Sparkles,
  Check,
  X,
  Sliders,
  AlertTriangle,
  QrCode,
  Scan,
} from "lucide-react";

type ActiveTab = "home" | "scan" | "detail" | "setting";

export default function HalalScanApp() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>("home");

  // 設定状態
  const [alcoholDirect, setAlcoholDirect] = useState<"strict" | "allow">("strict");
  const [alcoholCooked, setAlcoholCooked] = useState<"strict" | "allow">("strict");
  const [porkPolicy, setPorkPolicy] = useState<"strict" | "allow">("strict");

  // スキャン・解析ステート
  const [isScanning, setIsScanning] = useState(false);
  const [staffResponse, setStaffResponse] = useState<"yes" | "no" | null>(null);

  return (
    <div className="min-h-screen bg-[#24C27A] flex items-center justify-center p-0 sm:p-6 font-sans antialiased">
      {/* スマホ本体コンテナ (375px〜400px幅のモダンiPhone比率) */}
      <div className="w-full max-w-[390px] h-[844px] bg-white rounded-none sm:rounded-[48px] shadow-2xl flex flex-col justify-between overflow-hidden relative border-0 sm:border-[10px] sm:border-slate-900">
        
        {/* ========================================================================= */}
        {/* 画面1: ホーム画面 (Nutrional Today 風 Halal Today)                        */}
        {/* ========================================================================= */}
        {currentTab === "home" && (
          <div className="flex-1 flex flex-col overflow-y-auto bg-[#F8FAF9]">
            {/* 上部エメラルド曲面ヘッダー */}
            <div className="bg-[#24C27A] pt-10 pb-8 px-6 rounded-b-[40px] text-white space-y-4 shadow-sm relative">
              {/* トップバー: アバター & 通知 */}
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-lg overflow-hidden shadow-sm">
                  <span className="text-xl">🧕</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert("通知はありません")}
                  className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold flex items-center gap-1.5 hover:bg-white/30 transition-all border border-white/20"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Notification</span>
                  <span className="w-2 h-2 rounded-full bg-amber-300" />
                </button>
              </div>

              {/* タイトル */}
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">Halal Today</h1>
                <p className="text-xs text-white/80 mt-0.5 font-medium">あなたの信仰に寄り添うスマート食選び</p>
              </div>

              {/* ヘッダー内フローティングカード */}
              <div className="bg-white rounded-3xl p-4 text-slate-800 shadow-lg space-y-3">
                <div className="grid grid-cols-2 gap-3 divide-x divide-slate-100">
                  {/* 左: アルコール */}
                  <div className="space-y-1.5 pr-2">
                    <p className="text-[11px] font-bold text-slate-400">アルコール基準</p>
                    <p className="text-sm font-black text-slate-800">厳格 (Strict)</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#24C27A] h-full w-4/5 rounded-full" />
                    </div>
                  </div>

                  {/* 右: 豚肉 */}
                  <div className="space-y-1.5 pl-3">
                    <p className="text-[11px] font-bold text-slate-400">豚肉・エキス</p>
                    <p className="text-sm font-black text-rose-500">避ける (Avoid)</p>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full w-full rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-100 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-semibold">基準のカスタマイズ</span>
                  <button
                    type="button"
                    onClick={() => setCurrentTab("setting")}
                    className="text-[#24C27A] font-bold hover:underline flex items-center"
                  >
                    More detail <ChevronRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* コンテンツエリア */}
            <div className="p-5 space-y-5">
              {/* プロモーション/AI免責カード */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100/80 flex items-center justify-between">
                <div className="space-y-1 max-w-[200px]">
                  <p className="text-xs font-extrabold text-slate-800 leading-snug">
                    AIは間違えることがあります
                  </p>
                  <p className="text-[11px] text-[#24C27A] font-bold hover:underline cursor-pointer">
                    安全な確認方法を見る
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] flex items-center justify-center text-2xl shadow-inner">
                  🥗
                </div>
              </div>

              {/* Suggestion Meal */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-black text-slate-800">Suggestion Meal</h2>
                  <span className="text-[11px] text-slate-400 font-semibold">安心メニュー</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* カード 1 */}
                  <div
                    onClick={() => {
                      setCurrentTab("detail");
                    }}
                    className="bg-white rounded-3xl p-3.5 shadow-sm border border-slate-100/80 space-y-2.5 cursor-pointer hover:shadow-md transition-all active:scale-98"
                  >
                    <div className="aspect-square rounded-2xl bg-[#E8F8F0] flex items-center justify-center text-4xl overflow-hidden relative">
                      🍲
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black">
                        要確認
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 line-clamp-1">にくじゃが (Nikujaga)</p>
                      <p className="text-[10px] text-slate-400 font-medium">豚肉・みりん含有</p>
                    </div>
                  </div>

                  {/* カード 2 */}
                  <div className="bg-white rounded-3xl p-3.5 shadow-sm border border-slate-100/80 space-y-2.5">
                    <div className="aspect-square rounded-2xl bg-[#E8F8F0] flex items-center justify-center text-4xl overflow-hidden relative">
                      🍣
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#24C27A] text-white text-[9px] font-black">
                        Safe
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 line-clamp-1">海鮮丼 (Seafood Bowl)</p>
                      <p className="text-[10px] text-slate-400 font-medium">アルコールなし醤油</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 画面2: カメラスキャン画面 (Doritos スキャン画面完全再現)                  */}
        {/* ========================================================================= */}
        {currentTab === "scan" && (
          <div className="flex-1 flex flex-col justify-between bg-slate-900 relative text-white overflow-hidden">
            {/* リアルなカメラ背景画像 (料理・パッケージ) */}
            <div className="absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                alt="スキャン対象"
                className="w-full h-full object-cover brightness-75 scale-105"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* 上部ヘッダー (戻る & Flash off) */}
            <div className="relative z-10 pt-10 px-6 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentTab("home")}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                className="px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-xs font-bold flex items-center gap-1.5 hover:bg-black/60 transition-all border border-white/20"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Flash off</span>
              </button>
            </div>

            {/* 中央: スキャニング枠 & レーザー */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center px-8">
              <div className="w-[260px] h-[260px] relative flex items-center justify-center">
                {/* 4隅の太いホワイト角丸枠 [  ] */}
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-2xl" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-2xl" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-2xl" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-2xl" />

                {/* スキャン中のグリーングロー光線 */}
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#24C27A] to-transparent shadow-[0_0_15px_#24C27A] animate-pulse" />
              </div>
            </div>

            {/* 下部: 検出されたアイテムカード (画像再現！) */}
            <div className="relative z-10 p-5 pb-6 space-y-3">
              <div
                onClick={() => setCurrentTab("detail")}
                className="bg-white rounded-3xl p-4 shadow-2xl flex items-center justify-between text-slate-800 cursor-pointer active:scale-98 transition-all hover:shadow-emerald-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#E8F8F0] flex items-center justify-center text-3xl shadow-inner shrink-0">
                    🍲
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">
                      にくじゃが (Nikujaga)
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Simmered Beef/Pork & Potato</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                        ★ 4.3
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 text-[10px] font-black border border-rose-200">
                        Not fit
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-[#E8F8F0] text-[#24C27A] flex items-center justify-center">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 画面3: 詳細・判定結果 ＆ 店員交渉画面 (右側のスマホ完全再現)             */}
        {/* ========================================================================= */}
        {currentTab === "detail" && (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto bg-white">
            <div className="p-6 space-y-5">
              {/* トップバー */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentTab("home")}
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              {/* 料理メインサムネイル */}
              <div className="text-center space-y-2">
                <div className="w-32 h-32 mx-auto rounded-3xl bg-[#E8F8F0] flex items-center justify-center text-6xl shadow-md border-4 border-white">
                  🍲
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-900">
                    にくじゃが (Nikujaga)
                  </h1>
                  <p className="text-xs text-slate-400 font-medium">Traditional Simmered Dish - 250g</p>
                  <p className="text-xs font-bold text-amber-500 mt-1">★ 4.3 (Halal Check)</p>
                </div>
              </div>

              {/* 判定バッジ: Not fit with your criteria */}
              <div className="bg-[#FFF1F2] border border-rose-200 rounded-2xl py-3 px-4 flex items-center justify-between text-rose-600">
                <span className="text-xs font-extrabold tracking-tight">
                  Not fit with your criteria
                </span>
                <span className="text-sm">👎</span>
              </div>

              {/* Negatives (懸念成分) */}
              <div className="space-y-3">
                <h2 className="text-xs font-black text-slate-900 tracking-wider uppercase">
                  Negatives (要注意)
                </h2>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>ぶた肉 (Pork Meat & Broth)</span>
                      <span className="text-rose-500">高リスク</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full w-[85%] rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>加熱みりん (Cooked Mirin)</span>
                      <span className="text-amber-500">残存の可能性</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-[50%] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Positives (安全成分) */}
              <div className="space-y-3 pt-1">
                <h2 className="text-xs font-black text-slate-900 tracking-wider uppercase">
                  Positives (安心成分)
                </h2>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>じゃがいも・人参 (Vegetables)</span>
                      <span className="text-[#24C27A]">100% Halal</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#24C27A] h-full w-full rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 店員への提案カードエリア */}
              <div className="border-2 border-[#24C27A] bg-[#F0FDF4] rounded-3xl p-5 space-y-4 shadow-sm">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#24C27A] bg-white px-2.5 py-1 rounded-full border border-[#24C27A]/30">
                    店員さんに見せる画面
                  </span>
                  <p className="text-base font-black text-slate-900 pt-1 leading-snug">
                    「ぶた肉を使わずに調理して頂けますか？」
                  </p>
                  <p className="text-[11px] text-slate-500">
                    (Could you cook this without using pork?)
                  </p>
                </div>

                {/* 店員さん用回答ボタン */}
                <div className="space-y-2 pt-1">
                  <p className="text-center text-[10px] font-bold text-slate-400">
                    店員さん、当てはまる方をタップしてください：
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStaffResponse("yes")}
                      className={`py-3 rounded-full font-black text-xs text-white shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1 ${
                        staffResponse === "yes" ? "bg-sky-600 ring-4 ring-sky-200" : "bg-sky-500 hover:bg-sky-600"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>はい (Yes)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStaffResponse("yes")}
                      className={`py-3 rounded-full font-black text-xs text-white shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1 ${
                        staffResponse === "yes" ? "bg-[#24C27A] ring-4 ring-emerald-200" : "bg-[#24C27A] hover:bg-[#1EA866]"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>はい (Yes)</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStaffResponse("no")}
                    className={`w-full py-2.5 rounded-full font-bold text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all ${
                      staffResponse === "no" ? "ring-4 ring-rose-200 bg-rose-50 text-rose-700" : ""
                    }`}
                  >
                    ごめんなさい、できません (No)
                  </button>
                </div>

                {/* リアクション */}
                {staffResponse === "yes" && (
                  <div className="p-3 bg-white rounded-2xl text-center text-xs font-black text-[#24C27A] border border-[#24C27A] shadow-xs">
                    🎉 ありがとうございます！安心して注文できます！
                  </div>
                )}
                {staffResponse === "no" && (
                  <div className="p-3 bg-white rounded-2xl text-center text-xs font-black text-rose-600 border border-rose-300 shadow-xs">
                    💡 承知しました。別の安心メニューを選びましょう！
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 画面4: 設定画面 (Setting)                                                 */}
        {/* ========================================================================= */}
        {currentTab === "setting" && (
          <div className="flex-1 flex flex-col justify-between p-6 bg-[#F8FAF9] overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentTab("home")}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="text-xl font-extrabold text-slate-900">ユーザー設定</h1>
              </div>

              {/* アルコール設定 */}
              <div className="bg-white rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-800">直接アルコール含有</p>
                    <p className="text-[11px] text-slate-400">酒粕、洋酒入りスイーツ等</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlcoholDirect(alcoholDirect === "strict" ? "allow" : "strict")}
                    className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                      alcoholDirect === "strict"
                        ? "bg-rose-500 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {alcoholDirect === "strict" ? "避ける (Strict)" : "気にしない"}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-800">加熱揮発アルコール</p>
                    <p className="text-[11px] text-slate-400">みりん、料理酒等の焼き・煮込み</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlcoholCooked(alcoholCooked === "strict" ? "allow" : "strict")}
                    className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                      alcoholCooked === "strict"
                        ? "bg-amber-500 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {alcoholCooked === "strict" ? "要確認 (Check)" : "気にしない"}
                  </button>
                </div>
              </div>

              {/* 豚肉設定 */}
              <div className="bg-white rounded-3xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-800">豚肉・豚骨エキス</p>
                    <p className="text-[11px] text-slate-400">豚由来成分全般</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPorkPolicy(porkPolicy === "strict" ? "allow" : "strict")}
                    className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                      porkPolicy === "strict"
                        ? "bg-rose-500 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {porkPolicy === "strict" ? "厳格に避ける" : "気にしない"}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentTab("home")}
              className="w-full py-3.5 rounded-full bg-[#24C27A] text-white font-extrabold text-sm shadow-md"
            >
              設定を保存
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ボトムナビゲーションバー (中央スキャンボタンが丸く浮き出た神デザイン！)     */}
        {/* ========================================================================= */}
        <nav className="bg-white border-t border-slate-100 px-8 py-3 flex justify-between items-center z-30 shadow-lg relative">
          {/* Home */}
          <button
            type="button"
            onClick={() => setCurrentTab("home")}
            className={`flex flex-col items-center gap-1 transition-all ${
              currentTab === "home" ? "text-[#24C27A] font-black" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="text-xs font-extrabold">Home</span>
            {currentTab === "home" && <span className="w-1.5 h-1.5 rounded-full bg-[#24C27A]" />}
          </button>

          {/* 中央: 浮き出た丸いスキャンボタン */}
          <button
            type="button"
            onClick={() => setCurrentTab("scan")}
            className="flex flex-col items-center -mt-6 group active:scale-95 transition-all"
          >
            <div className="w-14 h-14 rounded-full bg-[#24C27A] text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 border-white group-hover:scale-105 transition-all">
              <Scan className="w-6 h-6" />
            </div>
          </button>

          {/* Setting */}
          <button
            type="button"
            onClick={() => setCurrentTab("setting")}
            className={`flex flex-col items-center gap-1 transition-all ${
              currentTab === "setting" ? "text-[#24C27A] font-black" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="text-xs font-extrabold">Setting</span>
            {currentTab === "setting" && <span className="w-1.5 h-1.5 rounded-full bg-[#24C27A]" />}
          </button>
        </nav>

      </div>
    </div>
  );
}
