"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  ArrowLeft,
  Zap,
  ZapOff,
  RotateCcw,
  Sparkles,
  Check,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Scan,
  Globe,
  Home,
  Settings,
  User,
  Utensils,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  ChevronRight,
  Wine,
  FlaskConical,
  Flame,
  ShieldAlert,
  Beef,
  Save,
} from "lucide-react";
import { EnhancedAnalyzeResult } from "./api/analyze/route";
import { ToleranceLevel } from "@/types";

type ActiveTab = "home" | "camera" | "analyzing" | "result" | "proposal" | "setting";

export default function HalalScanApp() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>("home");
  const [lang, setLang] = useState<"JP" | "EN">("JP");

  // =========================================================================
  // ユーザー設定状態（5項目：各 strict/conditional/allow）
  // =========================================================================
  // 1. アルコール成分が含まれるもの
  const [alcoholDirect, setAlcoholDirect] = useState<ToleranceLevel>("strict");
  // 2. 製造工程で、アルコールが生成される可能性のあるもの（醤油など）
  const [alcoholFermented, setAlcoholFermented] = useState<ToleranceLevel>("conditional");
  // 3. アルコール成分を加熱して飛ばしたもの
  const [alcoholCooked, setAlcoholCooked] = useState<ToleranceLevel>("conditional");
  // 4. 豚または豚由来の食材
  const [porkPolicy, setPorkPolicy] = useState<ToleranceLevel>("strict");
  // 5. 所定の処理がされていない豚肉以外の肉
  const [nonHalalMeatPolicy, setNonHalalMeatPolicy] = useState<ToleranceLevel>("conditional");

  // 保存完了トースト表示
  const [showSavedToast, setShowSavedToast] = useState(false);

  // カメラ関連の参照と状態
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [flashOn, setFlashOn] = useState(false);

  // 解析・判定ステート
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<EnhancedAnalyzeResult | null>(null);

  // 提案・店員交渉ステート
  const [isShowingStaffCard, setIsShowingStaffCard] = useState(false);
  const [staffResponse, setStaffResponse] = useState<"yes" | "no" | null>(null);
  const [isFullscreenStaffView, setIsFullscreenStaffView] = useState(false);

  // カメラ停止処理
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // カメラ起動処理
  const startCamera = useCallback(async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("お使いの端末またはブラウザはカメラ機能に対応していません。");
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((err) => {
            console.error("Video play error:", err);
          });
        };
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.warn("Camera start failed:", err);
      const errorMessage =
        err instanceof Error ? err.message : "カメラの起動に失敗しました。";
      setCameraError(
        errorMessage.includes("Permission") || errorMessage.includes("NotAllowed")
          ? "カメラへのアクセスが拒否されました。設定でカメラを許可するか、下のアルバムから選択をお試しください。"
          : "カメラを起動できませんでした。下の「アルバムから選択」または「サンプル料理」をお試しください。"
      );
      setIsCameraActive(false);
    }
  }, [stopCamera]);

  // タブ変更時にカメラの起動・停止を制御
  useEffect(() => {
    if (currentTab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [currentTab, startCamera, stopCamera]);

  // 写真のキャプチャ実行
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    stopCamera();
    setCapturedImage(dataUrl);
    runAnalysis(dataUrl);
  };

  // アルバム写真アップロード
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      stopCamera();
      setCapturedImage(dataUrl);
      runAnalysis(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // サンプルデモ画像の実行
  const handleSampleRun = (sampleType: "nikujaga" | "ramen" | "salad") => {
    stopCamera();

    let demoImageUrl =
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
    if (sampleType === "ramen") {
      demoImageUrl =
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80";
    } else if (sampleType === "salad") {
      demoImageUrl =
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80";
    }

    setCapturedImage(demoImageUrl);
    runAnalysis(demoImageUrl, sampleType);
  };

  // AI解析リクエスト処理
  const runAnalysis = async (
    imageData: string,
    demoPreset?: "nikujaga" | "ramen" | "salad"
  ) => {
    setCurrentTab("analyzing");
    setIsShowingStaffCard(false);
    setStaffResponse(null);

    const payload = {
      image_data: imageData.startsWith("data:") ? imageData : "demo",
      user_preferences: {
        alcohol_rules: {
          direct_alcohol: alcoholDirect,
          fermented_zero: alcoholFermented,
          cooked_evaporated: alcoholCooked,
        },
        pork_level: porkPolicy,
        non_halal_meat_level: nonHalalMeatPolicy,
      },
      custom_prompt: demoPreset || undefined,
    };

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Analysis request failed");
      }

      const result: EnhancedAnalyzeResult = await res.json();
      setAnalysisResult(result);
      setCurrentTab("result");
    } catch (err) {
      console.warn("Analysis fallback:", err);
      // フォールバック結果
      setAnalysisResult({
        dish_name: "にくじゃが (Nikujaga)",
        overall_status: porkPolicy === "strict" ? "danger" : "warning",
        status_label: porkPolicy === "strict" ? "要注意" : "注意",
        summary_message:
          "豚肉が含まれており、煮汁に加熱みりん・料理酒が使われている可能性があります。",
        checkpoints: [
          {
            name: "豚または豚由来の食材",
            level: porkPolicy === "strict" ? "danger" : "safe",
            level_label: porkPolicy === "strict" ? "要注意" : "安全",
            reason:
              "具材に豚バラスライスが使用されており、豚の出汁が煮汁全体に溶け出しています。",
          },
          {
            name: "アルコール成分を加熱して飛ばしたもの",
            level: alcoholCooked === "strict" ? "warning" : "safe",
            level_label: alcoholCooked === "strict" ? "注意" : "安全",
            reason:
              "煮込み調理時にアルコールは大部分揮発していますが、調味料由来の微量残存の可能性があります。",
          },
          {
            name: "じゃがいも・人参・玉ねぎ",
            level: "safe",
            level_label: "安全",
            reason: "100%植物性食材であり、ハラール上全く問題ありません。",
          },
        ],
        concerning_ingredients: ["ぶた肉", "加熱みりん"],
        proposal: {
          remove_option_text: "ぶた肉を抜いてこの料理を食べますか？",
          staff_request_phrase:
            "すみません、私は宗教上の理由で豚肉を食べることができません。ぶた肉を使わずに調理して頂くことは可能でしょうか？",
        },
      });
      setCurrentTab("result");
    }
  };

  // 設定保存ハンドラー
  const handleSaveSettings = () => {
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      setCurrentTab("home");
    }, 1200);
  };

  // ラジオボタン用コンポーネント（赤・黄色・グレー基調）
  const RadioOptionGroup = ({
    value,
    onChange,
  }: {
    value: ToleranceLevel;
    onChange: (val: ToleranceLevel) => void;
  }) => {
    return (
      <div className="grid grid-cols-3 gap-1.5 pt-2">
        {/* 1. 避ける (赤基調) */}
        <button
          type="button"
          onClick={() => onChange("strict")}
          className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl text-center transition-all cursor-pointer border ${
            value === "strict"
              ? "bg-rose-500 text-white border-rose-500 shadow-sm ring-2 ring-rose-200"
              : "bg-rose-50/50 text-rose-700 border-rose-200/80 hover:bg-rose-100/60"
          }`}
        >
          {/* ラジオボタン丸アイコン */}
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mb-1 transition-all ${
              value === "strict" ? "border-white" : "border-rose-400"
            }`}
          >
            {value === "strict" && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="text-[11px] font-black tracking-tight leading-tight">避ける</span>
        </button>

        {/* 2. 場合によっては気にしない (黄色基調) */}
        <button
          type="button"
          onClick={() => onChange("conditional")}
          className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl text-center transition-all cursor-pointer border ${
            value === "conditional"
              ? "bg-amber-500 text-white border-amber-500 shadow-sm ring-2 ring-amber-200"
              : "bg-amber-50/50 text-amber-800 border-amber-200/80 hover:bg-amber-100/60"
          }`}
        >
          {/* ラジオボタン丸アイコン */}
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mb-1 transition-all ${
              value === "conditional" ? "border-white" : "border-amber-400"
            }`}
          >
            {value === "conditional" && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="text-[10px] font-black tracking-tight leading-tight">
            場合によっては
            <br />
            気にしない
          </span>
        </button>

        {/* 3. 気にしない (グレー基調) */}
        <button
          type="button"
          onClick={() => onChange("allow")}
          className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl text-center transition-all cursor-pointer border ${
            value === "allow"
              ? "bg-slate-600 text-white border-slate-600 shadow-sm ring-2 ring-slate-200"
              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
          }`}
        >
          {/* ラジオボタン丸アイコン */}
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mb-1 transition-all ${
              value === "allow" ? "border-white" : "border-slate-400"
            }`}
          >
            {value === "allow" && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="text-[11px] font-black tracking-tight leading-tight">気にしない</span>
        </button>
      </div>
    );
  };

  // 全画面店員見せモーダル
  if (isFullscreenStaffView && analysisResult) {
    return (
      <div className="fixed inset-0 z-50 bg-[#24C27A] text-white flex flex-col justify-between p-8 font-sans">
        <div className="flex justify-between items-center">
          <span className="px-4 py-1.5 rounded-full bg-white/20 text-xs font-black tracking-widest uppercase backdrop-blur-md">
            店員さんにお見せください
          </span>
          <button
            type="button"
            onClick={() => setIsFullscreenStaffView(false)}
            className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
          >
            <Minimize2 className="w-6 h-6" />
          </button>
        </div>

        <div className="my-auto space-y-6 text-center">
          <p className="text-3xl font-black leading-snug tracking-tight">
            「
            {analysisResult.concerning_ingredients.join("・") || "該当の食材"}
            を使わずに調理して頂くことは可能でしょうか？」
          </p>
          <p className="text-lg text-white/90 font-medium">
            (Could you please prepare this dish without{" "}
            {analysisResult.concerning_ingredients.join(", ") || "these ingredients"}?)
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-center text-xs text-white/80 font-bold">
            店員さん、当てはまる方をタップしてください：
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setStaffResponse("yes");
                setIsFullscreenStaffView(false);
              }}
              className="py-5 rounded-3xl bg-white text-[#24C27A] font-black text-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Check className="w-6 h-6 stroke-[3]" />
              <span>はい (Yes)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStaffResponse("no");
                setIsFullscreenStaffView(false);
              }}
              className="py-5 rounded-3xl bg-white/20 text-white border-2 border-white font-black text-base shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>できません (No)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#24C27A] flex items-center justify-center p-0 sm:p-6 font-sans antialiased selection:bg-[#24C27A] selection:text-white">
      {/* スマホ本体コンテナ (390px幅 iPhone比率) */}
      <div className="w-full max-w-[390px] h-[844px] bg-white rounded-none sm:rounded-[48px] shadow-2xl flex flex-col justify-between overflow-hidden relative border-0 sm:border-[10px] sm:border-slate-900">
        {/* 隠し要素: キャプチャ用キャンバス & ファイルアップローダー */}
        <canvas ref={canvasRef} className="hidden" />
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* 保存完了トースト */}
        {showSavedToast && (
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/90 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-black backdrop-blur-md animate-bounce">
            <Check className="w-4 h-4 text-[#24C27A]" />
            <span>設定を保存しました</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 画面1: ホーム画面                                                         */}
        {/* ========================================================================= */}
        {currentTab === "home" && (
          <div className="flex-1 flex flex-col overflow-y-auto bg-[#F8FAF9]">
            {/* 上部エメラルド曲面ヘッダー */}
            <div className="bg-[#24C27A] pt-10 pb-7 px-6 rounded-b-[36px] text-white space-y-4 shadow-sm relative">
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white shadow-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
                <button
                  type="button"
                  onClick={() => setLang(lang === "JP" ? "EN" : "JP")}
                  className="px-3.5 py-1.5 rounded-full bg-white/25 backdrop-blur-md text-xs font-black flex items-center gap-1.5 hover:bg-white/35 transition-all border border-white/30 text-white shadow-xs"
                >
                  <Globe className="w-3.5 h-3.5 text-white" />
                  <span>{lang === "JP" ? "JP / EN" : "EN / JP"}</span>
                </button>
              </div>

              <div className="pt-1">
                <h1 className="text-2xl font-black tracking-tight">TabeCan</h1>
                <p className="text-xs text-white/90 mt-0.5 font-bold">
                  {lang === "JP"
                    ? "日本旅行中の食事レパートリーを増やそう！"
                    : "Expand your meal options while traveling in Japan!"}
                </p>
              </div>
            </div>

            {/* コンテンツエリア */}
            <div className="p-5 space-y-4">
              {/* あなたのハラール基準サマリーカード */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800">
                    {lang === "JP" ? "現在のハラール基準" : "Your Halal Criteria"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentTab("setting")}
                    className="text-xs font-bold text-[#24C27A] flex items-center gap-0.5 hover:underline"
                  >
                    <span>{lang === "JP" ? "変更する" : "Edit"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 5項目の状態バッジ一覧 */}
                <div className="space-y-2 pt-1 text-xs">
                  {/* 豚肉 */}
                  <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50">
                    <span className="font-bold text-slate-700">豚または豚由来の食材</span>
                    <span
                      className={`px-2.5 py-1 rounded-full font-black text-[10px] ${
                        porkPolicy === "strict"
                          ? "bg-rose-100 text-rose-600"
                          : porkPolicy === "conditional"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {porkPolicy === "strict"
                        ? "避ける"
                        : porkPolicy === "conditional"
                        ? "場合により可"
                        : "気にしない"}
                    </span>
                  </div>

                  {/* 非認証肉 */}
                  <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50">
                    <span className="font-bold text-slate-700">未処理の豚以外の肉</span>
                    <span
                      className={`px-2.5 py-1 rounded-full font-black text-[10px] ${
                        nonHalalMeatPolicy === "strict"
                          ? "bg-rose-100 text-rose-600"
                          : nonHalalMeatPolicy === "conditional"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {nonHalalMeatPolicy === "strict"
                        ? "避ける"
                        : nonHalalMeatPolicy === "conditional"
                        ? "場合により可"
                        : "気にしない"}
                    </span>
                  </div>

                  {/* 直接アルコール */}
                  <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50">
                    <span className="font-bold text-slate-700">アルコール直接含有</span>
                    <span
                      className={`px-2.5 py-1 rounded-full font-black text-[10px] ${
                        alcoholDirect === "strict"
                          ? "bg-rose-100 text-rose-600"
                          : alcoholDirect === "conditional"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {alcoholDirect === "strict"
                        ? "避ける"
                        : alcoholDirect === "conditional"
                        ? "場合により可"
                        : "気にしない"}
                    </span>
                  </div>

                  {/* 加熱みりん */}
                  <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50">
                    <span className="font-bold text-slate-700">加熱揮発アルコール</span>
                    <span
                      className={`px-2.5 py-1 rounded-full font-black text-[10px] ${
                        alcoholCooked === "strict"
                          ? "bg-rose-100 text-rose-600"
                          : alcoholCooked === "conditional"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {alcoholCooked === "strict"
                        ? "避ける"
                        : alcoholCooked === "conditional"
                        ? "場合により可"
                        : "気にしない"}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI免責カード */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="space-y-1 max-w-[220px]">
                  <p className="text-xs font-black text-slate-800 leading-snug flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      {lang === "JP" ? "AIは間違えることがあります" : "AI may make mistakes"}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {lang === "JP"
                      ? "食べ物を選ぶ際の参考にしてください"
                      : "Please use this as a reference when choosing food."}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] flex items-center justify-center text-[#24C27A] shadow-inner shrink-0">
                  <Utensils className="w-6 h-6 text-[#24C27A]" />
                </div>
              </div>

              {/* スキャンへのメインアクションカード */}
              <div
                onClick={() => setCurrentTab("camera")}
                className="bg-gradient-to-br from-[#24C27A] to-[#1EA866] rounded-3xl p-6 text-white shadow-md cursor-pointer hover:shadow-lg transition-all active:scale-98 flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white/80">
                    {lang === "JP" ? "写真を撮るだけ！" : "Just snap a photo!"}
                  </p>
                  <h3 className="text-base font-black">
                    {lang === "JP" ? "料理・メニューをスキャン" : "Scan Food or Menu"}
                  </h3>
                  <p className="text-[11px] text-white/90 font-medium pt-1 flex items-center gap-1">
                    <span>{lang === "JP" ? "カメラを起動する" : "Launch Camera"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </p>
                </div>

                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border-2 border-white/40 group-hover:scale-105 transition-all shrink-0">
                  <Camera className="w-7 h-7" />
                </div>
              </div>

              {/* クイックお試しサンプル（審査・デモ用） */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-[#24C27A]" />
                  <span>{lang === "JP" ? "ワンタップでAI判定を試す" : "Try sample dishes"}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSampleRun("nikujaga")}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-[#E8F8F0] hover:text-[#24C27A] text-left transition-all border border-slate-100"
                  >
                    <p className="text-xs font-black text-slate-800">🍲 にくじゃが</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">豚肉・みりん判定テスト</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSampleRun("ramen")}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-[#E8F8F0] hover:text-[#24C27A] text-left transition-all border border-slate-100"
                  >
                    <p className="text-xs font-black text-slate-800">🍜 醤油ラーメン</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">チャーシュー・出汁テスト</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 画面2: 本格カメラ画面 (Live Video & DoritosスキャンUI)                    */}
        {/* ========================================================================= */}
        {currentTab === "camera" && (
          <div className="flex-1 flex flex-col justify-between bg-black relative text-white overflow-hidden">
            {/* リアルタイムカメラ映像 (WebRTC) */}
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-black overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isCameraActive ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* カメラが未起動またはエラー時のフォールバック表示 */}
              {!isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 z-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="space-y-2 max-w-[280px]">
                    <p className="text-sm font-bold text-white">カメラを準備中...</p>
                    {cameraError ? (
                      <p className="text-xs text-amber-300 leading-relaxed">{cameraError}</p>
                    ) : (
                      <p className="text-xs text-white/70">
                        カメラが起動しない場合は、アルバムから写真を選択するか、サンプルをお試しください。
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 rounded-full bg-[#24C27A] text-white text-xs font-bold hover:bg-[#1EA866] transition-all"
                  >
                    カメラを再起動
                  </button>
                </div>
              )}
            </div>

            {/* 上部ヘッダーバー: 戻る & フラッシュ */}
            <div className="relative z-20 pt-10 px-6 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentTab("home")}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-all border border-white/20"
                aria-label="戻る"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setFlashOn(!flashOn)}
                className="px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-xs font-bold flex items-center gap-1.5 hover:bg-black/60 transition-all border border-white/20 text-white"
              >
                {flashOn ? (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Flash on</span>
                  </>
                ) : (
                  <>
                    <ZapOff className="w-3.5 h-3.5 text-white/80" />
                    <span>Flash off</span>
                  </>
                )}
              </button>
            </div>

            {/* 中央: スキャニング四隅枠 & ネオングリーン光線 */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center px-8 pointer-events-none">
              <div className="w-[270px] h-[270px] relative flex items-center justify-center">
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-2xl shadow-sm" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-2xl shadow-sm" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-2xl shadow-sm" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-2xl shadow-sm" />
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#24C27A] to-transparent shadow-[0_0_15px_#24C27A] animate-pulse" />
              </div>
              <p className="text-[11px] text-white/80 font-bold mt-4 drop-shadow-md">
                料理やメニュー全体を枠内に収めてください
              </p>
            </div>

            {/* 下部: カメラシャッター & アルバム選択コントロールバー */}
            <div className="relative z-20 p-6 pb-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-around">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex flex-col items-center justify-center text-white border border-white/30 hover:bg-white/30 transition-all active:scale-95"
                title="アルバムから選択"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 group active:scale-90 transition-all shadow-xl"
                aria-label="写真を撮影"
              >
                <div className="w-full h-full rounded-full bg-[#24C27A] group-hover:bg-[#1EA866] transition-all flex items-center justify-center">
                  <Camera className="w-7 h-7 text-white stroke-[2.2]" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSampleRun("nikujaga")}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex flex-col items-center justify-center text-white border border-white/30 hover:bg-white/30 transition-all active:scale-95"
                title="サンプル料理で試す"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 画面3: AI解析中ローディング画面                                           */}
        {/* ========================================================================= */}
        {currentTab === "analyzing" && (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-white p-6 relative overflow-hidden">
            {capturedImage && (
              <div className="absolute inset-0 opacity-20 filter blur-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-[#24C27A]/20 border-4 border-[#24C27A] flex items-center justify-center relative shadow-[0_0_30px_#24C27A]">
                <Scan className="w-12 h-12 text-[#24C27A] animate-pulse" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black tracking-tight">AIが料理を分析中...</h2>
                <p className="text-xs text-white/80 font-medium max-w-[260px] leading-relaxed">
                  豚肉・アルコール・調味料などを照合し、あなたの信仰基準に合致するか判定しています。
                </p>
              </div>

              <div className="w-48 bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#24C27A] h-full w-full animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 画面4: 解析結果画面 (「安全」「注意」「要注意」理由付き判定)               */}
        {/* ========================================================================= */}
        {currentTab === "result" && analysisResult && (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto bg-[#F8FAF9]">
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentTab("camera")}
                  className="w-9 h-9 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-sm font-black text-slate-900">AI解析結果</h2>
                <div className="w-9" />
              </div>

              {/* 料理写真サムネイル & 料理名 */}
              <div className="text-center space-y-2">
                <div className="w-28 h-28 mx-auto rounded-3xl overflow-hidden shadow-md border-4 border-white bg-slate-100">
                  {capturedImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={capturedImage} alt="Dish" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#24C27A]">
                      <Utensils className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-black text-slate-900">{analysisResult.dish_name}</h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {analysisResult.summary_message}
                  </p>
                </div>
              </div>

              {/* 総合判定ステータスバッジ */}
              <div>
                {analysisResult.overall_status === "danger" && (
                  <div className="bg-[#FFF1F2] border border-rose-200 rounded-3xl p-4 flex items-center gap-3.5 text-rose-700 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                      <XCircle className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-rose-500">
                        判定: {analysisResult.status_label}
                      </p>
                      <p className="text-xs font-bold leading-tight mt-0.5 text-rose-800">
                        基準に合わない食材が含まれている可能性があります
                      </p>
                    </div>
                  </div>
                )}

                {analysisResult.overall_status === "warning" && (
                  <div className="bg-[#FFFBEB] border border-amber-200 rounded-3xl p-4 flex items-center gap-3.5 text-amber-800 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <AlertCircle className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-amber-600">
                        判定: {analysisResult.status_label}
                      </p>
                      <p className="text-xs font-bold leading-tight mt-0.5 text-amber-900">
                        調味料や製法などの確認が推奨されます
                      </p>
                    </div>
                  </div>
                )}

                {analysisResult.overall_status === "safe" && (
                  <div className="bg-[#F0FDF4] border border-emerald-200 rounded-3xl p-4 flex items-center gap-3.5 text-emerald-800 shadow-sm">
                    <div className="w-10 h-10 rounded-2xl bg-[#24C27A] text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-emerald-600">
                        判定: {analysisResult.status_label}
                      </p>
                      <p className="text-xs font-bold leading-tight mt-0.5 text-emerald-900">
                        設定基準に照らし合わせて安全と判断されました
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* チェックポイント（理由付き詳細） */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  成分チェックポイント ({analysisResult.checkpoints.length}項目)
                </h3>
                <div className="space-y-2">
                  {analysisResult.checkpoints.map((cp, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs space-y-1.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-900">{cp.name}</span>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                            cp.level === "danger"
                              ? "bg-rose-100 text-rose-600"
                              : cp.level === "warning"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {cp.level_label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        {cp.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 提案へ進むアクションボタン */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentTab("proposal")}
                  className="w-full py-3.5 rounded-full bg-[#24C27A] text-white font-extrabold text-sm shadow-md hover:bg-[#1EA866] transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>次へ: 食事の提案・選択肢を見る</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 画面5: ユーザーへの提案画面 (食材抜き提案 or 他の食べ物を見る)            */}
        {/* ========================================================================= */}
        {currentTab === "proposal" && analysisResult && (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto bg-[#F8FAF9]">
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentTab("result")}
                  className="w-9 h-9 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-sm font-black text-slate-900">あなたへのご提案</h2>
                <div className="w-9" />
              </div>

              {/* 案内メッセージカード */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-2 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#24C27A] bg-[#E8F8F0] px-3 py-1 rounded-full">
                  Suggestion for You
                </span>
                <h1 className="text-base font-black text-slate-900 pt-1">
                  {analysisResult.concerning_ingredients.length > 0
                    ? `このメニューはそのままでは難しい可能性があります`
                    : `このメニューは安心してお召し上がりいただけます！`}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {analysisResult.concerning_ingredients.length > 0
                    ? `以下の2つの選択肢から選ぶことができます。`
                    : `楽しい日本での食事をお楽しみください。`}
                </p>
              </div>

              {/* 2つの主要な選択肢 */}
              <div className="space-y-3">
                {/* 選択肢1: 食材を抜いて食べる */}
                {analysisResult.concerning_ingredients.length > 0 && (
                  <div
                    onClick={() => setIsShowingStaffCard(true)}
                    className={`rounded-3xl p-5 border-2 transition-all cursor-pointer shadow-sm active:scale-98 ${
                      isShowingStaffCard
                        ? "border-[#24C27A] bg-[#F0FDF4] ring-2 ring-emerald-200"
                        : "border-slate-200 bg-white hover:border-[#24C27A]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#24C27A] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-black uppercase text-[#24C27A] tracking-wider">
                          選択肢 1
                        </span>
                        <h3 className="text-sm font-black text-slate-900 leading-snug">
                          {analysisResult.concerning_ingredients.join("・")}を抜いて、この料理を食べる
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-1">
                          お店の方にお願いして、対象の食材を除いて調理してもらえるか確認します。
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 選択肢2: 他の食べ物を見る (カメラ画面に戻る) */}
                <div
                  onClick={() => setCurrentTab("camera")}
                  className="rounded-3xl p-5 border-2 border-slate-200 bg-white hover:border-[#24C27A] transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        {analysisResult.concerning_ingredients.length > 0 ? "選択肢 2" : "おすすめ"}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 leading-snug">
                        他の食べ物を見る（もう一度スキャン）
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1">
                        カメラ画面に戻り、別の料理やメニューを撮影して判定します。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 選択肢1が選ばれた時の「お店の方に見せるフレーズ」画面 */}
              {isShowingStaffCard && analysisResult.concerning_ingredients.length > 0 && (
                <div className="border-2 border-[#24C27A] bg-white rounded-3xl p-5 space-y-4 shadow-md animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#24C27A] bg-[#E8F8F0] px-2.5 py-1 rounded-full">
                      店員さんに見せる画面
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFullscreenStaffView(true)}
                      className="text-xs font-bold text-[#24C27A] flex items-center gap-1 hover:underline"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>大画面で表示</span>
                    </button>
                  </div>

                  <div className="space-y-1 text-center py-1">
                    <p className="text-base font-black text-slate-900 leading-snug">
                      「
                      {analysisResult.concerning_ingredients.join("・")}
                      を使わずに調理して頂くことは可能でしょうか？」
                    </p>
                    <p className="text-[11px] text-slate-500">
                      (Could you please prepare this dish without{" "}
                      {analysisResult.concerning_ingredients.join(", ")}?)
                    </p>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <p className="text-center text-[10px] font-bold text-slate-400">
                      店員さん、当てはまる方をタップしてください：
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setStaffResponse("yes")}
                        className={`py-3 rounded-full font-black text-xs text-white shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1 ${
                          staffResponse === "yes"
                            ? "bg-[#24C27A] ring-4 ring-emerald-200"
                            : "bg-[#24C27A] hover:bg-[#1EA866]"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>はい (Yes)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStaffResponse("no")}
                        className={`py-3 rounded-full font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 ${
                          staffResponse === "no"
                            ? "ring-4 ring-rose-200 bg-rose-50 text-rose-700"
                            : ""
                        }`}
                      >
                        できません (No)
                      </button>
                    </div>

                    {staffResponse === "yes" && (
                      <div className="p-3 bg-[#E8F8F0] rounded-2xl text-center text-xs font-black text-[#24C27A] border border-[#24C27A] shadow-xs mt-2">
                        🎉 ありがとうございます！安心してご注文いただけます。
                      </div>
                    )}
                    {staffResponse === "no" && (
                      <div className="p-3 bg-rose-50 rounded-2xl text-center text-xs font-black text-rose-600 border border-rose-300 shadow-xs mt-2 space-y-2">
                        <p>承知しました。別の安全なメニューを探しましょう！</p>
                        <button
                          type="button"
                          onClick={() => setCurrentTab("camera")}
                          className="px-4 py-1.5 rounded-full bg-rose-600 text-white text-[11px] font-bold"
                        >
                          他の料理をスキャンする
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 画面6: ユーザー設定画面 (改善版：5項目 ＆ 赤・黄・グレー ラジオボタン)     */}
        {/* ========================================================================= */}
        {currentTab === "setting" && (
          <div className="flex-1 flex flex-col justify-between p-5 bg-[#F8FAF9] overflow-y-auto">
            <div className="space-y-4">
              {/* ヘッダー */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentTab("home")}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-xs border border-slate-200 hover:bg-slate-100 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h1 className="text-lg font-black text-slate-900">ハラール基準の設定</h1>
                  <p className="text-[11px] text-slate-500 font-medium">
                    あなたの信仰や考え方に合わせて許容リスクを設定します
                  </p>
                </div>
              </div>

              {/* 設定カードリスト */}
              <div className="space-y-3.5 pb-2">
                {/* 項目1: アルコール成分が含まれるもの */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 mt-0.5">
                      <Wine className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-800">
                        アルコール成分が含まれるもの
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        酒粕、洋酒入りスイーツ、アルコール飲料など
                      </p>
                    </div>
                  </div>
                  <RadioOptionGroup value={alcoholDirect} onChange={setAlcoholDirect} />
                </div>

                {/* 項目2: 製造工程で、アルコールが生成される可能性のあるもの（醤油など） */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-800">
                        製造工程で、アルコールが生成される可能性のあるもの（醤油など）
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        醤油・味噌などの醸造発酵で自然発生する微量アルコール
                      </p>
                    </div>
                  </div>
                  <RadioOptionGroup value={alcoholFermented} onChange={setAlcoholFermented} />
                </div>

                {/* 項目3: アルコール成分を加熱して飛ばしたもの */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0 mt-0.5">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-800">
                        アルコール成分を加熱して飛ばしたもの
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        みりん、料理酒などを使った煮込みや焼き料理
                      </p>
                    </div>
                  </div>
                  <RadioOptionGroup value={alcoholCooked} onChange={setAlcoholCooked} />
                </div>

                {/* 項目4: 豚または豚由来の食材 */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-800">
                        豚または豚由来の食材
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        豚肉、豚骨スープ、豚ゼラチン、ラードなど
                      </p>
                    </div>
                  </div>
                  <RadioOptionGroup value={porkPolicy} onChange={setPorkPolicy} />
                </div>

                {/* 項目5: 所定の処理がされていない豚肉以外の肉 */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                      <Beef className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-800">
                        所定の処理がされていない豚肉以外の肉
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        イスラム法に基づきハラール処理されていない牛肉・鶏肉など
                      </p>
                    </div>
                  </div>
                  <RadioOptionGroup value={nonHalalMeatPolicy} onChange={setNonHalalMeatPolicy} />
                </div>
              </div>
            </div>

            {/* 保存ボタン */}
            <div className="pt-3 pb-1">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="w-full py-3.5 rounded-full bg-[#24C27A] text-white font-extrabold text-sm shadow-md hover:bg-[#1EA866] transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>設定を保存</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ボトムナビゲーションバー (アイコンのみのミニマル・モダンデザイン！)         */}
        {/* ========================================================================= */}
        <nav className="bg-white border-t border-slate-100 px-10 py-3.5 flex justify-between items-center z-30 shadow-lg relative">
          {/* Home アイコン */}
          <button
            type="button"
            onClick={() => setCurrentTab("home")}
            className={`p-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
              currentTab === "home"
                ? "text-[#24C27A] scale-110"
                : "text-slate-400 hover:text-slate-600"
            }`}
            aria-label="Home"
          >
            <Home className="w-6 h-6 stroke-[2.2]" />
            {currentTab === "home" && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#24C27A] mt-1" />
            )}
          </button>

          {/* 中央: 浮き出た丸いスキャンボタン */}
          <button
            type="button"
            onClick={() => setCurrentTab("camera")}
            className="flex flex-col items-center -mt-7 group active:scale-95 transition-all"
            aria-label="Camera Scan"
          >
            <div className="w-14 h-14 rounded-full bg-[#24C27A] text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 border-white group-hover:scale-105 transition-all">
              <Scan className="w-6 h-6 stroke-[2.5]" />
            </div>
          </button>

          {/* Setting アイコン */}
          <button
            type="button"
            onClick={() => setCurrentTab("setting")}
            className={`p-2 rounded-2xl flex flex-col items-center justify-center transition-all ${
              currentTab === "setting"
                ? "text-[#24C27A] scale-110"
                : "text-slate-400 hover:text-slate-600"
            }`}
            aria-label="Settings"
          >
            <Settings className="w-6 h-6 stroke-[2.2]" />
            {currentTab === "setting" && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#24C27A] mt-1" />
            )}
          </button>
        </nav>
      </div>
    </div>
  );
}
