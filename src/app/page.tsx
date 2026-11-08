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

// =========================================================================
// 多言語翻訳辞書 (日本語 / 英語)
// =========================================================================
const translations = {
  JP: {
    // 共通
    langToggleText: "JP / EN",
    homeNav: "ホーム",
    scanNav: "スキャン",
    settingsNav: "設定",
    back: "戻る",
    savedToast: "設定を保存しました",

    // ホーム画面
    appName: "TabeCan",
    appTagline: "日本旅行中の食事レパートリーを増やそう！",
    criteriaTitle: "現在のハラール基準",
    editCriteria: "変更する",
    porkTitle: "豚または豚由来の食材",
    nonHalalMeatTitle: "未処理の豚以外の肉",
    directAlcoholTitle: "アルコール直接含有",
    cookedAlcoholTitle: "加熱揮発アルコール",
    levelAvoid: "避ける",
    levelConditional: "場合により可",
    levelAllow: "気にしない",
    aiDisclaimerTitle: "AIは間違えることがあります",
    aiDisclaimerDesc: "食べ物を選ぶ際の参考にしてください",
    scanCardSubtitle: "写真を撮るだけ！",
    scanCardTitle: "料理・メニューをスキャン",
    scanCardAction: "カメラを起動する",
    trySampleTitle: "ワンタップでAI判定を試す",
    sampleNikujagaTitle: "🍲 にくじゃが",
    sampleNikujagaDesc: "豚肉・みりん判定テスト",
    sampleRamenTitle: "🍜 醤油ラーメン",
    sampleRamenDesc: "チャーシュー・出汁テスト",

    // カメラ画面
    cameraPreparing: "カメラを準備中...",
    cameraErrorPermission:
      "カメラへのアクセスが拒否されました。設定でカメラを許可するか、下のアルバムから選択をお試しください。",
    cameraFallbackGuide:
      "カメラを起動できませんでした。下の「アルバムから選択」または「サンプル料理」をお試しください。",
    restartCamera: "カメラを再起動",
    flashOn: "Flash on",
    flashOff: "Flash off",
    cameraGuide: "料理やメニュー全体を枠内に収めてください",
    selectFromAlbum: "アルバムから選択",
    trySample: "サンプル料理で試す",
    takePhoto: "写真を撮影",

    // 解析中画面
    analyzingTitle: "AIが料理を分析中...",
    analyzingDesc:
      "豚肉・アルコール・調味料などを照合し、あなたの信仰基準に合致するか判定しています。",

    // 解析結果画面
    resultHeader: "AI解析結果",
    statusHighCaution: "要注意",
    statusCaution: "注意",
    statusSafe: "安全",
    statusDangerSummary: "基準に合わない食材が含まれている可能性があります",
    statusWarningSummary: "調味料や製法などの確認が推奨されます",
    statusSafeSummary: "設定基準に照らし合わせて安全と判断されました",
    checkpointsHeader: "成分チェックポイント",
    nextToProposal: "次へ: 食事の提案・選択肢を見る",

    // 提案画面
    proposalHeader: "あなたへのご提案",
    proposalBadge: "Suggestion for You",
    proposalWarningTitle: "このメニューはそのままでは難しい可能性があります",
    proposalSafeTitle: "このメニューは安心してお召し上がりいただけます！",
    proposalWarningDesc: "以下の2つの選択肢から選ぶことができます。",
    proposalSafeDesc: "楽しい日本での食事をお楽しみください。",
    option1Badge: "選択肢 1",
    option1Action: "を抜いて、この料理を食べる",
    option1Desc:
      "お店の方にお願いして、対象の食材を除いて調理してもらえるか確認します。",
    option2Badge: "選択肢 2",
    recommendedBadge: "おすすめ",
    option2Action: "他の食べ物を見る（もう一度スキャン）",
    option2Desc: "カメラ画面に戻り、別の料理やメニューを撮影して判定します。",

    // 店員さんに見せる画面
    staffCardTitle: "店員さんに見せる画面",
    fullScreen: "大画面で表示",
    staffPrompt: "店員さん、当てはまる方をタップしてください：",
    yesButton: "はい (Yes)",
    noButton: "できません (No)",
    reactionYes: "🎉 ありがとうございます！安心してご注文いただけます。",
    reactionNo: "承知しました。別の安全なメニューを探しましょう！",
    scanOtherDish: "他の料理をスキャンする",
    staffFullscreenBadge: "店員さんにお見せください",

    // 設定画面
    settingsHeader: "ハラール基準の設定",
    settingsSub: "あなたの信仰や考え方に合わせて許容リスクを設定します",
    item1Title: "アルコール成分が含まれるもの",
    item1Desc: "酒粕、洋酒入りスイーツ、アルコール飲料など",
    item2Title: "製造工程で、アルコールが生成される可能性のあるもの（醤油など）",
    item2Desc: "醤油・味噌などの醸造発酵で自然発生する微量アルコール",
    item3Title: "アルコール成分を加熱して飛ばしたもの",
    item3Desc: "みりん、料理酒などを使った煮込みや焼き料理",
    item4Title: "豚または豚由来の食材",
    item4Desc: "豚肉、豚骨スープ、豚ゼラチン、ラードなど",
    item5Title: "所定の処理がされていない豚肉以外の肉",
    item5Desc: "イスラム法に基づきハラール処理されていない牛肉・鶏肉など",
    radioAvoid: "避ける",
    radioConditional: "場合によっては\n気にしない",
    radioAllow: "気にしない",
    saveSettings: "設定を保存",
  },
  EN: {
    // 共通
    langToggleText: "EN / JP",
    homeNav: "Home",
    scanNav: "Scan",
    settingsNav: "Settings",
    back: "Back",
    savedToast: "Settings saved successfully",

    // ホーム画面
    appName: "TabeCan",
    appTagline: "Expand your meal choices while traveling in Japan!",
    criteriaTitle: "Your Halal Criteria",
    editCriteria: "Edit",
    porkTitle: "Pork & pork-derived ingredients",
    nonHalalMeatTitle: "Non-Halal meat (Beef, Chicken, etc.)",
    directAlcoholTitle: "Direct alcohol content",
    cookedAlcoholTitle: "Cooked / Evaporated alcohol",
    levelAvoid: "Avoid",
    levelConditional: "Conditional",
    levelAllow: "Allow",
    aiDisclaimerTitle: "AI may make mistakes",
    aiDisclaimerDesc: "Please use this as a reference when choosing food.",
    scanCardSubtitle: "Just snap a photo!",
    scanCardTitle: "Scan Food or Menu",
    scanCardAction: "Launch Camera",
    trySampleTitle: "Try sample dishes with one tap",
    sampleNikujagaTitle: "🍲 Nikujaga",
    sampleNikujagaDesc: "Pork & Mirin check test",
    sampleRamenTitle: "🍜 Shoyu Ramen",
    sampleRamenDesc: "Chashu & Broth check test",

    // カメラ画面
    cameraPreparing: "Preparing camera...",
    cameraErrorPermission:
      "Camera access was denied. Please allow camera in settings or choose a photo from album.",
    cameraFallbackGuide:
      "Could not launch camera. Please try selecting a photo from album or sample dishes below.",
    restartCamera: "Restart Camera",
    flashOn: "Flash on",
    flashOff: "Flash off",
    cameraGuide: "Position food or menu within the frame",
    selectFromAlbum: "Select from Album",
    trySample: "Try Sample",
    takePhoto: "Take Photo",

    // 解析中画面
    analyzingTitle: "AI is analyzing your dish...",
    analyzingDesc:
      "Checking pork, alcohol, and seasoning against your personal dietary criteria.",

    // 解析結果画面
    resultHeader: "AI Analysis Result",
    statusHighCaution: "High Caution",
    statusCaution: "Caution",
    statusSafe: "Safe",
    statusDangerSummary: "May contain ingredients not suitable for your criteria",
    statusWarningSummary: "Verification of seasonings or preparation is recommended",
    statusSafeSummary: "Judged safe based on your selected criteria",
    checkpointsHeader: "Ingredient Checkpoints",
    nextToProposal: "Next: View meal suggestions & options",

    // 提案画面
    proposalHeader: "Suggestions for You",
    proposalBadge: "Suggestion for You",
    proposalWarningTitle: "This menu might be difficult to eat as-is",
    proposalSafeTitle: "You can enjoy this dish with confidence!",
    proposalWarningDesc: "You can choose from the two options below.",
    proposalSafeDesc: "Have a wonderful dining experience in Japan.",
    option1Badge: "Option 1",
    option1Action: "Eat this dish without ",
    option1Desc:
      "Ask restaurant staff if they can prepare the dish without the target ingredients.",
    option2Badge: "Option 2",
    recommendedBadge: "Recommended",
    option2Action: "Find other dishes (Scan again)",
    option2Desc: "Return to camera and scan another dish or menu.",

    // 店員さんに見せる画面
    staffCardTitle: "Show this to restaurant staff",
    fullScreen: "Full Screen",
    staffPrompt: "Restaurant staff: please tap an answer:",
    yesButton: "Yes (はい)",
    noButton: "No (できません)",
    reactionYes: "🎉 Thank you! You can order with confidence.",
    reactionNo: "Understood. Let's find another safe menu option!",
    scanOtherDish: "Scan another dish",
    staffFullscreenBadge: "Please show this to staff",

    // 設定画面
    settingsHeader: "Halal Criteria Settings",
    settingsSub: "Customize acceptable risk levels according to your faith and preference",
    item1Title: "Products containing alcohol",
    item1Desc: "Sake lees, Western liquor sweets, alcoholic beverages, etc.",
    item2Title: "Naturally produced alcohol (Soy sauce, etc.)",
    item2Desc: "Trace alcohol naturally produced in fermented seasonings like soy sauce or miso",
    item3Title: "Alcohol evaporated through cooking",
    item3Desc: "Simmered or grilled dishes using mirin, cooking sake, etc.",
    item4Title: "Pork & pork-derived ingredients",
    item4Desc: "Pork meat, tonkotsu broth, pork gelatin, lard, etc.",
    item5Title: "Non-Halal slaughtered meat",
    item5Desc: "Beef or chicken not slaughtered according to Islamic guidelines (Zabiha)",
    radioAvoid: "Avoid",
    radioConditional: "Conditional",
    radioAllow: "Allow",
    saveSettings: "Save Settings",
  },
};

export default function HalalScanApp() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>("home");
  const [lang, setLang] = useState<"JP" | "EN">("JP");

  // 現在の言語リソース
  const t = translations[lang];

  // 言語切り替えトグル関数
  const toggleLanguage = () => {
    setLang((prev) => (prev === "JP" ? "EN" : "JP"));
  };

  // =========================================================================
  // ユーザー設定状態（5項目：各 strict/conditional/allow）
  // =========================================================================
  const [alcoholDirect, setAlcoholDirect] = useState<ToleranceLevel>("strict");
  const [alcoholFermented, setAlcoholFermented] = useState<ToleranceLevel>("conditional");
  const [alcoholCooked, setAlcoholCooked] = useState<ToleranceLevel>("conditional");
  const [porkPolicy, setPorkPolicy] = useState<ToleranceLevel>("strict");
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
        throw new Error("Device does not support camera API");
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
        err instanceof Error ? err.message : "Camera launch failed";
      setCameraError(
        errorMessage.includes("Permission") || errorMessage.includes("NotAllowed")
          ? t.cameraErrorPermission
          : t.cameraFallbackGuide
      );
      setIsCameraActive(false);
    }
  }, [stopCamera, t.cameraFallbackGuide, t.cameraErrorPermission]);

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
        dish_name: lang === "JP" ? "にくじゃが (Nikujaga)" : "Nikujaga (Simmered Beef/Pork & Potato)",
        overall_status: porkPolicy === "strict" ? "danger" : "warning",
        status_label: porkPolicy === "strict" ? t.statusHighCaution : t.statusCaution,
        summary_message:
          lang === "JP"
            ? "豚肉が含まれており、煮汁に加熱みりん・料理酒が使われている可能性があります。"
            : "Contains pork meat, and the broth likely contains cooked mirin and cooking sake.",
        checkpoints: [
          {
            name: t.porkTitle,
            level: porkPolicy === "strict" ? "danger" : "safe",
            level_label: porkPolicy === "strict" ? "要注意" : "安全",
            reason:
              lang === "JP"
                ? "具材に豚バラスライスが使用されており、豚の出汁が煮汁全体に溶け出しています。"
                : "Sliced pork belly is used, and pork essence is extracted into the simmering broth.",
          },
          {
            name: t.cookedAlcoholTitle,
            level: alcoholCooked === "strict" ? "warning" : "safe",
            level_label: alcoholCooked === "strict" ? "注意" : "安全",
            reason:
              lang === "JP"
                ? "煮込み調理時にアルコールは大部分揮発していますが、調味料由来の微量残存の可能性があります。"
                : "Most alcohol evaporates during cooking, but trace residues from seasoning may remain.",
          },
          {
            name: lang === "JP" ? "じゃがいも・人参・玉ねぎ" : "Potatoes, Carrots, Onions",
            level: "safe",
            level_label: "安全",
            reason:
              lang === "JP"
                ? "100%植物性食材であり、ハラール上全く問題ありません。"
                : "100% plant-based ingredients and completely halal.",
          },
        ],
        concerning_ingredients: lang === "JP" ? ["ぶた肉", "加熱みりん"] : ["Pork", "Mirin"],
        proposal: {
          remove_option_text:
            lang === "JP"
              ? "ぶた肉を抜いてこの料理を食べますか？"
              : "Eat this dish without pork?",
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
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mb-1 transition-all ${
              value === "strict" ? "border-white" : "border-rose-400"
            }`}
          >
            {value === "strict" && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="text-[11px] font-black tracking-tight leading-tight">
            {t.radioAvoid}
          </span>
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
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mb-1 transition-all ${
              value === "conditional" ? "border-white" : "border-amber-400"
            }`}
          >
            {value === "conditional" && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="text-[10px] font-black tracking-tight leading-tight whitespace-pre-line">
            {t.radioConditional}
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
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mb-1 transition-all ${
              value === "allow" ? "border-white" : "border-slate-400"
            }`}
          >
            {value === "allow" && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className="text-[11px] font-black tracking-tight leading-tight">
            {t.radioAllow}
          </span>
        </button>
      </div>
    );
  };

  // レベル別ラベルヘルパー
  const getLevelLabel = (level: ToleranceLevel) => {
    if (level === "strict") return t.levelAvoid;
    if (level === "conditional") return t.levelConditional;
    return t.levelAllow;
  };

  // 全画面店員見せモーダル (バイリンガル表示)
  if (isFullscreenStaffView && analysisResult) {
    const ingredientListText =
      analysisResult.concerning_ingredients.join("・") ||
      (lang === "JP" ? "該当の食材" : "these ingredients");

    return (
      <div className="fixed inset-0 z-50 bg-[#24C27A] text-white flex flex-col justify-between p-8 font-sans">
        <div className="flex justify-between items-center">
          <span className="px-4 py-1.5 rounded-full bg-white/20 text-xs font-black tracking-widest uppercase backdrop-blur-md">
            {t.staffFullscreenBadge}
          </span>
          <button
            type="button"
            onClick={() => setIsFullscreenStaffView(false)}
            className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all"
            aria-label="Close"
          >
            <Minimize2 className="w-6 h-6" />
          </button>
        </div>

        {/* 店員さん向け日本語大文字 ＋ 訪日客向け英語 */}
        <div className="my-auto space-y-6 text-center">
          <p className="text-3xl font-black leading-snug tracking-tight">
            「{ingredientListText}を使わずに調理して頂くことは可能でしょうか？」
          </p>
          <p className="text-lg text-white/90 font-medium">
            (Could you please prepare this dish without {ingredientListText}?)
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-center text-xs text-white/80 font-bold">
            {t.staffPrompt}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setStaffResponse("yes");
                setIsFullscreenStaffView(false);
              }}
              className="py-5 rounded-3xl bg-white text-[#24C27A] font-black text-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-6 h-6 stroke-[3]" />
              <span>{t.yesButton}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setStaffResponse("no");
                setIsFullscreenStaffView(false);
              }}
              className="py-5 rounded-3xl bg-white/20 text-white border-2 border-white font-black text-base shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <span>{t.noButton}</span>
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
            <span>{t.savedToast}</span>
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
                {/* 言語切り替えボタン */}
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="px-3.5 py-1.5 rounded-full bg-white/25 backdrop-blur-md text-xs font-black flex items-center gap-1.5 hover:bg-white/35 transition-all border border-white/30 text-white shadow-xs cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-white" />
                  <span>{t.langToggleText}</span>
                </button>
              </div>

              <div className="pt-1">
                <h1 className="text-2xl font-black tracking-tight">{t.appName}</h1>
                <p className="text-xs text-white/90 mt-0.5 font-bold">{t.appTagline}</p>
              </div>
            </div>

            {/* コンテンツエリア */}
            <div className="p-5 space-y-4">
              {/* あなたのハラール基準サマリーカード */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800">{t.criteriaTitle}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentTab("setting")}
                    className="text-xs font-bold text-[#24C27A] flex items-center gap-0.5 hover:underline cursor-pointer"
                  >
                    <span>{t.editCriteria}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 5項目の状態バッジ一覧 */}
                <div className="space-y-2 pt-1 text-xs">
                  {/* 豚肉 */}
                  <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50">
                    <span className="font-bold text-slate-700">{t.porkTitle}</span>
                    <span
                      className={`px-2.5 py-1 rounded-full font-black text-[10px] ${
                        porkPolicy === "strict"
                          ? "bg-rose-100 text-rose-600"
                          : porkPolicy === "conditional"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {getLevelLabel(porkPolicy)}
                    </span>
                  </div>

                  {/* 非認証肉 */}
                  <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50">
                    <span className="font-bold text-slate-700">{t.nonHalalMeatTitle}</span>
                    <span
                      className={`px-2.5 py-1 rounded-full font-black text-[10px] ${
                        nonHalalMeatPolicy === "strict"
                          ? "bg-rose-100 text-rose-600"
                          : nonHalalMeatPolicy === "conditional"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {getLevelLabel(nonHalalMeatPolicy)}
                    </span>
                  </div>

                  {/* 直接アルコール */}
                  <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50">
                    <span className="font-bold text-slate-700">{t.directAlcoholTitle}</span>
                    <span
                      className={`px-2.5 py-1 rounded-full font-black text-[10px] ${
                        alcoholDirect === "strict"
                          ? "bg-rose-100 text-rose-600"
                          : alcoholDirect === "conditional"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {getLevelLabel(alcoholDirect)}
                    </span>
                  </div>

                  {/* 加熱みりん */}
                  <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50">
                    <span className="font-bold text-slate-700">{t.cookedAlcoholTitle}</span>
                    <span
                      className={`px-2.5 py-1 rounded-full font-black text-[10px] ${
                        alcoholCooked === "strict"
                          ? "bg-rose-100 text-rose-600"
                          : alcoholCooked === "conditional"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {getLevelLabel(alcoholCooked)}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI免責カード */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="space-y-1 max-w-[220px]">
                  <p className="text-xs font-black text-slate-800 leading-snug flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{t.aiDisclaimerTitle}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {t.aiDisclaimerDesc}
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
                  <p className="text-xs font-bold text-white/80">{t.scanCardSubtitle}</p>
                  <h3 className="text-base font-black">{t.scanCardTitle}</h3>
                  <p className="text-[11px] text-white/90 font-medium pt-1 flex items-center gap-1">
                    <span>{t.scanCardAction}</span>
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
                  <span>{t.trySampleTitle}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSampleRun("nikujaga")}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-[#E8F8F0] hover:text-[#24C27A] text-left transition-all border border-slate-100 cursor-pointer"
                  >
                    <p className="text-xs font-black text-slate-800">{t.sampleNikujagaTitle}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t.sampleNikujagaDesc}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSampleRun("ramen")}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-[#E8F8F0] hover:text-[#24C27A] text-left transition-all border border-slate-100 cursor-pointer"
                  >
                    <p className="text-xs font-black text-slate-800">{t.sampleRamenTitle}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t.sampleRamenDesc}</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 画面2: 本格カメラ画面 (Live Video & スキャンUI)                           */}
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
                    <p className="text-sm font-bold text-white">{t.cameraPreparing}</p>
                    <p className="text-xs text-amber-300 leading-relaxed">
                      {cameraError || t.cameraFallbackGuide}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 rounded-full bg-[#24C27A] text-white text-xs font-bold hover:bg-[#1EA866] transition-all cursor-pointer"
                  >
                    {t.restartCamera}
                  </button>
                </div>
              )}
            </div>

            {/* 上部ヘッダーバー: 戻る & 言語切替 & フラッシュ */}
            <div className="relative z-20 pt-10 px-6 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentTab("home")}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-all border border-white/20 cursor-pointer"
                aria-label={t.back}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-xs font-black flex items-center gap-1 hover:bg-black/60 transition-all border border-white/20 text-white cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-white" />
                  <span>{lang}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFlashOn(!flashOn)}
                  className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-xs font-bold flex items-center gap-1.5 hover:bg-black/60 transition-all border border-white/20 text-white cursor-pointer"
                >
                  {flashOn ? (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>{t.flashOn}</span>
                    </>
                  ) : (
                    <>
                      <ZapOff className="w-3.5 h-3.5 text-white/80" />
                      <span>{t.flashOff}</span>
                    </>
                  )}
                </button>
              </div>
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
              <p className="text-[11px] text-white/80 font-bold mt-4 drop-shadow-md text-center">
                {t.cameraGuide}
              </p>
            </div>

            {/* 下部: カメラシャッター & アルバム選択コントロールバー */}
            <div className="relative z-20 p-6 pb-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-around">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex flex-col items-center justify-center text-white border border-white/30 hover:bg-white/30 transition-all active:scale-95 cursor-pointer"
                title={t.selectFromAlbum}
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 group active:scale-90 transition-all shadow-xl cursor-pointer"
                aria-label={t.takePhoto}
              >
                <div className="w-full h-full rounded-full bg-[#24C27A] group-hover:bg-[#1EA866] transition-all flex items-center justify-center">
                  <Camera className="w-7 h-7 text-white stroke-[2.2]" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSampleRun("nikujaga")}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex flex-col items-center justify-center text-white border border-white/30 hover:bg-white/30 transition-all active:scale-95 cursor-pointer"
                title={t.trySample}
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
                <h2 className="text-xl font-black tracking-tight">{t.analyzingTitle}</h2>
                <p className="text-xs text-white/80 font-medium max-w-[260px] leading-relaxed">
                  {t.analyzingDesc}
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
                  className="w-9 h-9 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-sm font-black text-slate-900">{t.resultHeader}</h2>
                {/* 言語切替ボタン */}
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Globe className="w-3 h-3 text-[#24C27A]" />
                  <span>{lang}</span>
                </button>
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
                        {lang === "JP" ? "判定: " : "Status: "}
                        {t.statusHighCaution}
                      </p>
                      <p className="text-xs font-bold leading-tight mt-0.5 text-rose-800">
                        {t.statusDangerSummary}
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
                        {lang === "JP" ? "判定: " : "Status: "}
                        {t.statusCaution}
                      </p>
                      <p className="text-xs font-bold leading-tight mt-0.5 text-amber-900">
                        {t.statusWarningSummary}
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
                        {lang === "JP" ? "判定: " : "Status: "}
                        {t.statusSafe}
                      </p>
                      <p className="text-xs font-bold leading-tight mt-0.5 text-emerald-900">
                        {t.statusSafeSummary}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* チェックポイント（理由付き詳細） */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {t.checkpointsHeader} ({analysisResult.checkpoints.length})
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
                          {cp.level === "danger"
                            ? t.statusHighCaution
                            : cp.level === "warning"
                            ? t.statusCaution
                            : t.statusSafe}
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
                  className="w-full py-3.5 rounded-full bg-[#24C27A] text-white font-extrabold text-sm shadow-md hover:bg-[#1EA866] transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <span>{t.nextToProposal}</span>
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
                  className="w-9 h-9 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-sm font-black text-slate-900">{t.proposalHeader}</h2>
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Globe className="w-3 h-3 text-[#24C27A]" />
                  <span>{lang}</span>
                </button>
              </div>

              {/* 案内メッセージカード */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-2 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#24C27A] bg-[#E8F8F0] px-3 py-1 rounded-full">
                  {t.proposalBadge}
                </span>
                <h1 className="text-base font-black text-slate-900 pt-1">
                  {analysisResult.concerning_ingredients.length > 0
                    ? t.proposalWarningTitle
                    : t.proposalSafeTitle}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {analysisResult.concerning_ingredients.length > 0
                    ? t.proposalWarningDesc
                    : t.proposalSafeDesc}
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
                          {t.option1Badge}
                        </span>
                        <h3 className="text-sm font-black text-slate-900 leading-snug">
                          {lang === "JP"
                            ? `${analysisResult.concerning_ingredients.join("・")}${t.option1Action}`
                            : `${t.option1Action}${analysisResult.concerning_ingredients.join(", ")}`}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-1">{t.option1Desc}</p>
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
                        {analysisResult.concerning_ingredients.length > 0
                          ? t.option2Badge
                          : t.recommendedBadge}
                      </span>
                      <h3 className="text-sm font-black text-slate-900 leading-snug">
                        {t.option2Action}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1">{t.option2Desc}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 選択肢1が選ばれた時の「お店の方に見せるフレーズ」画面 */}
              {isShowingStaffCard && analysisResult.concerning_ingredients.length > 0 && (
                <div className="border-2 border-[#24C27A] bg-white rounded-3xl p-5 space-y-4 shadow-md animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#24C27A] bg-[#E8F8F0] px-2.5 py-1 rounded-full">
                      {t.staffCardTitle}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFullscreenStaffView(true)}
                      className="text-xs font-bold text-[#24C27A] flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>{t.fullScreen}</span>
                    </button>
                  </div>

                  <div className="space-y-1 text-center py-1">
                    <p className="text-base font-black text-slate-900 leading-snug">
                      「{analysisResult.concerning_ingredients.join("・")}を使わずに調理して頂くことは可能でしょうか？」
                    </p>
                    <p className="text-[11px] text-slate-500">
                      (Could you please prepare this dish without{" "}
                      {analysisResult.concerning_ingredients.join(", ")}?)
                    </p>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <p className="text-center text-[10px] font-bold text-slate-400">
                      {t.staffPrompt}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setStaffResponse("yes")}
                        className={`py-3 rounded-full font-black text-xs text-white shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer ${
                          staffResponse === "yes"
                            ? "bg-[#24C27A] ring-4 ring-emerald-200"
                            : "bg-[#24C27A] hover:bg-[#1EA866]"
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>{t.yesButton}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStaffResponse("no")}
                        className={`py-3 rounded-full font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 cursor-pointer ${
                          staffResponse === "no"
                            ? "ring-4 ring-rose-200 bg-rose-50 text-rose-700"
                            : ""
                        }`}
                      >
                        {t.noButton}
                      </button>
                    </div>

                    {staffResponse === "yes" && (
                      <div className="p-3 bg-[#E8F8F0] rounded-2xl text-center text-xs font-black text-[#24C27A] border border-[#24C27A] shadow-xs mt-2">
                        {t.reactionYes}
                      </div>
                    )}
                    {staffResponse === "no" && (
                      <div className="p-3 bg-rose-50 rounded-2xl text-center text-xs font-black text-rose-600 border border-rose-300 shadow-xs mt-2 space-y-2">
                        <p>{t.reactionNo}</p>
                        <button
                          type="button"
                          onClick={() => setCurrentTab("camera")}
                          className="px-4 py-1.5 rounded-full bg-rose-600 text-white text-[11px] font-bold cursor-pointer"
                        >
                          {t.scanOtherDish}
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
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentTab("home")}
                    className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-xs border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h1 className="text-lg font-black text-slate-900">{t.settingsHeader}</h1>
                    <p className="text-[11px] text-slate-500 font-medium">{t.settingsSub}</p>
                  </div>
                </div>

                {/* 言語切替 */}
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="px-2.5 py-1 rounded-full bg-white text-xs font-bold text-slate-700 shadow-xs border border-slate-200 hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Globe className="w-3.5 h-3.5 text-[#24C27A]" />
                  <span>{lang}</span>
                </button>
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
                      <h3 className="text-xs font-black text-slate-800">{t.item1Title}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.item1Desc}</p>
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
                      <h3 className="text-xs font-black text-slate-800">{t.item2Title}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.item2Desc}</p>
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
                      <h3 className="text-xs font-black text-slate-800">{t.item3Title}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.item3Desc}</p>
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
                      <h3 className="text-xs font-black text-slate-800">{t.item4Title}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.item4Desc}</p>
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
                      <h3 className="text-xs font-black text-slate-800">{t.item5Title}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.item5Desc}</p>
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
                className="w-full py-3.5 rounded-full bg-[#24C27A] text-white font-extrabold text-sm shadow-md hover:bg-[#1EA866] transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{t.saveSettings}</span>
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
            className={`p-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              currentTab === "home"
                ? "text-[#24C27A] scale-110"
                : "text-slate-400 hover:text-slate-600"
            }`}
            aria-label={t.homeNav}
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
            className="flex flex-col items-center -mt-7 group active:scale-95 transition-all cursor-pointer"
            aria-label={t.scanNav}
          >
            <div className="w-14 h-14 rounded-full bg-[#24C27A] text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 border-4 border-white group-hover:scale-105 transition-all">
              <Scan className="w-6 h-6 stroke-[2.5]" />
            </div>
          </button>

          {/* Setting アイコン */}
          <button
            type="button"
            onClick={() => setCurrentTab("setting")}
            className={`p-2 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              currentTab === "setting"
                ? "text-[#24C27A] scale-110"
                : "text-slate-400 hover:text-slate-600"
            }`}
            aria-label={t.settingsNav}
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
