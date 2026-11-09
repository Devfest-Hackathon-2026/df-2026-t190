"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  ArrowLeft,
  RotateCcw,
  Check,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Scan,
  Globe,
  Home,
  Settings,
  Moon,
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
  FileText,
  SwitchCamera,
  Sparkles,
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
    levelAvoid: "❌ 避ける",
    levelConditional: "🔺 場合により可",
    levelAllow: "◯ 気にしない",
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

    // 提案画面・指差しカード
    proposalHeader: "あなたへのご提案",
    proposalBadge: "Suggestion for You",
    proposalWarningTitle: "このメニューはそのままでは難しい可能性があります",
    proposalSafeTitle: "このメニューは安心してお召し上がりいただけます！",
    proposalWarningDesc: "以下の選択肢から選ぶことができます。",
    proposalSafeDesc: "楽しい日本での食事をお楽しみください。",
    substituteOptionBadge: "✨ AIからの提案",
    substituteActionPrefix: "代わりに【",
    substituteActionSuffix: "】で味付け・調理してもらう",
    substituteDescFallback: "お店で準備してもらいやすい安全な食材・調味料に変更して美味しく楽しめます。",
    option1Badge: "食材抜き",
    option1Action: "を抜いて、この料理を食べる",
    option1Desc:
      "店員さん向けの指差しカードを表示して、食材を除いて調理してもらえるか確認します。",
    option2Badge: "選択肢 B",
    recommendedBadge: "おすすめ",
    option2Action: "他の食べ物を見る（カメラに戻る）",
    option2Desc: "カメラ画面に戻り、別の料理やメニューを撮影して判定します。",

    // 店員さんに見せる指差しカード
    staffCardTitle: "店員さんに見せる指差しカード",
    fullScreen: "大画面で表示",
    yesButton: "はい",
    noButton: "ごめんなさい。対応できません",
    reactionYes: "🎉 ありがとうございます！安心してご注文いただけます。",
    reactionNo: "承知いたしました。他の食べ物を見るため、カメラ画面に戻ります...",
    scanOtherDish: "他の食べ物を見る（カメラに戻る）",
    staffFullscreenBadge: "店員さんにお見せください",
    closeCard: "画面を閉じる",

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
    customNotesTitle: "その他の自由記述（任意）",
    customNotesBadge: "任意",
    customNotesDesc: "アレルギーや特に避けたい調味料・食材などがあれば自由にご記入ください",
    customNotesPlaceholder: "例: 甲殻類アレルギーがあります。乳化剤やショートニングもできれば避けたいです。",
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
    levelAvoid: "❌ Avoid",
    levelConditional: "🔺 Conditional",
    levelAllow: "◯ Allow",
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

    // 提案画面・指差しカード
    proposalHeader: "Suggestions for You",
    proposalBadge: "Suggestion for You",
    proposalWarningTitle: "This menu might be difficult to eat as-is",
    proposalSafeTitle: "You can enjoy this dish with confidence!",
    proposalWarningDesc: "You can choose from the options below.",
    proposalSafeDesc: "Have a wonderful dining experience in Japan.",
    substituteOptionBadge: "✨ AI Suggestion",
    substituteActionPrefix: "Substitute with [",
    substituteActionSuffix: "] instead",
    substituteDescFallback: "Enjoy safely by asking the restaurant to use available halal seasonings.",
    option1Badge: "Remove Ingredients",
    option1Action: "Eat this dish without ",
    option1Desc:
      "Open the staff communication card to ask if they can prepare it without these ingredients.",
    option2Badge: "Option B",
    recommendedBadge: "Recommended",
    option2Action: "Find other dishes (Return to Camera)",
    option2Desc: "Return to camera and scan another dish or menu.",

    // 店員さんに見せる指差しカード
    staffCardTitle: "Staff Pointing Card",
    fullScreen: "Full Screen",
    yesButton: "はい (Yes)",
    noButton: "ごめんなさい。対応できません (No)",
    reactionYes: "🎉 Thank you! You can order with confidence.",
    reactionNo: "Understood. Returning to camera to find other dishes...",
    scanOtherDish: "Find other dishes (Return to Camera)",
    staffFullscreenBadge: "Please show this to staff",
    closeCard: "Close",

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
    customNotesTitle: "Additional Notes (Optional)",
    customNotesBadge: "Optional",
    customNotesDesc: "Enter any allergies or specific dietary preferences/restrictions",
    customNotesPlaceholder: "e.g. Shellfish allergy. Prefer to avoid emulsifiers and shortening if possible.",
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
  // 6. 任意の自由記述欄
  const [customNotes, setCustomNotes] = useState("");

  // 保存完了トースト表示
  const [showSavedToast, setShowSavedToast] = useState(false);

  // カメラ関連の参照と状態
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  // 解析・判定ステート
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<EnhancedAnalyzeResult | null>(null);

  // 提案・店員交渉ステート
  const [isShowingStaffCard, setIsShowingStaffCard] = useState(false);
  const [staffResponse, setStaffResponse] = useState<"yes" | "no" | null>(null);
  const [isFullscreenStaffView, setIsFullscreenStaffView] = useState(false);
  const [staffCardMode, setStaffCardMode] = useState<"substitute" | "remove">("substitute");

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

  // カメラ起動処理 (外カメラ / 内カメラ対応)
  const startCamera = useCallback(
    async (targetMode?: "environment" | "user") => {
      const mode = targetMode || facingMode;
      setCameraError(null);
      stopCamera();

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Device does not support camera API");
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: mode },
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
    },
    [facingMode, stopCamera, t.cameraFallbackGuide, t.cameraErrorPermission]
  );

  // 外カメラ / 内カメラの切り替えハンドラー
  const toggleCameraFacing = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

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

  // 画像を軽量化・高速解析用にリサイズする関数
  const resizeImage = (dataUrl: string, maxDim = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // 写真のキャプチャ実行
  const capturePhoto = async () => {
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
    const optimized = await resizeImage(dataUrl, 800);
    runAnalysis(optimized);
  };

  // アルバム写真アップロード
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      stopCamera();
      setCapturedImage(dataUrl);
      const optimized = await resizeImage(dataUrl, 800);
      runAnalysis(optimized);
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
        custom_notes: customNotes,
      },
      custom_prompt: customNotes || demoPreset || undefined,
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
      console.error("AI Analysis failed:", err);
      alert(
        lang === "JP"
          ? "AI通信が一時的に混み合っています。恐れ入りますが、もう一度撮影してください。"
          : "Temporary AI connection issue. Please snap the photo again."
      );
      setCurrentTab("camera");
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

  // 店員さんが「ごめんなさい。対応できません」をタップした時の処理
  const handleStaffDecline = () => {
    setStaffResponse("no");
    // 1.5秒後に自動的に指差しカードを閉じてカメラ画面に戻る
    setTimeout(() => {
      setIsFullscreenStaffView(false);
      setStaffResponse(null);
      setCurrentTab("camera");
    }, 1500);
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
        {/* 1. 避ける (赤基調 ❌) */}
        <button
          type="button"
          onClick={() => onChange("strict")}
          className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl text-center transition-all cursor-pointer border ${
            value === "strict"
              ? "bg-rose-500 text-white border-rose-500 shadow-sm ring-2 ring-rose-200"
              : "bg-rose-50/50 text-rose-700 border-rose-200/80 hover:bg-rose-100/60"
          }`}
        >
          <span className="text-base font-black leading-none mb-1">❌</span>
          <span className="text-[11px] font-black tracking-tight leading-tight">
            {t.radioAvoid}
          </span>
        </button>

        {/* 2. 場合によっては気にしない (黄色基調 🔺) */}
        <button
          type="button"
          onClick={() => onChange("conditional")}
          className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl text-center transition-all cursor-pointer border ${
            value === "conditional"
              ? "bg-amber-500 text-white border-amber-500 shadow-sm ring-2 ring-amber-200"
              : "bg-amber-50/50 text-amber-800 border-amber-200/80 hover:bg-amber-100/60"
          }`}
        >
          <span className="text-base font-black leading-none mb-1">🔺</span>
          <span className="text-[10px] font-black tracking-tight leading-tight whitespace-pre-line">
            {t.radioConditional}
          </span>
        </button>

        {/* 3. 気にしない (グレー基調 ◯) */}
        <button
          type="button"
          onClick={() => onChange("allow")}
          className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl text-center transition-all cursor-pointer border ${
            value === "allow"
              ? "bg-slate-600 text-white border-slate-600 shadow-sm ring-2 ring-slate-200"
              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
          }`}
        >
          <span className="text-base font-black leading-none mb-1">◯</span>
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

  // 日英自動翻訳フォールバック
  const getDishName = (item?: EnhancedAnalyzeResult | null) => {
    if (!item) return "";
    if (lang === "JP") return item.dish_name;
    if (item.dish_name_en) return item.dish_name_en;
    if (item.dish_name.includes("にくじゃが")) return "Nikujaga (Simmered Beef/Pork & Potato)";
    if (item.dish_name.includes("ラーメン")) return "Shoyu Ramen (Soy Sauce Ramen)";
    if (item.dish_name.includes("サラダ")) return "Fresh Green Salad";
    return item.dish_name;
  };

  const getSummaryMessage = (item?: EnhancedAnalyzeResult | null) => {
    if (!item) return "";
    if (lang === "JP") return item.summary_message;
    if (item.summary_message_en) return item.summary_message_en;
    if (item.summary_message.includes("豚肉") || item.summary_message.includes("みりん")) {
      return "Contains pork meat, and the broth likely contains cooked mirin and cooking sake.";
    }
    return item.summary_message;
  };

  const getCheckpointName = (name: string, name_en?: string) => {
    if (lang === "JP") return name;
    if (name_en) return name_en;
    if (name.includes("ぶた") || name.includes("豚")) return "Pork Meat & Essence";
    if (name.includes("みりん") || name.includes("酒")) return "Cooked Mirin & Cooking Sake";
    if (name.includes("じゃがいも") || name.includes("人参") || name.includes("野菜") || name.includes("玉ねぎ")) {
      return "Potatoes, Carrots & Onions";
    }
    if (name.includes("チャーシュー")) return "Pork Chashu";
    if (name.includes("スープ") || name.includes("出汁")) return "Broth & Soup";
    if (name.includes("麺")) return "Wheat Noodles & Vegetables";
    return name;
  };

  const getCheckpointReason = (reason: string, reason_en?: string) => {
    if (lang === "JP") return reason;
    if (reason_en) return reason_en;
    if (reason.includes("豚バラ") || reason.includes("豚の出汁") || reason.includes("豚肉")) {
      return "Sliced pork belly is used, and pork essence is extracted into the broth.";
    }
    if (reason.includes("アルコール") || reason.includes("揮発") || reason.includes("調味料")) {
      return "Most alcohol evaporates during simmering, but trace residue from seasonings may remain.";
    }
    if (reason.includes("100%植物性") || reason.includes("ハラール上全く問題")) {
      return "100% plant-based ingredients and completely halal-friendly.";
    }
    return reason;
  };

  // 括弧書きや長文説明を取り除くクリーンアップヘルパー
  const cleanIngredientName = (name: string): string => {
    return name
      .replace(/（[^）]*）/g, "")
      .replace(/\([^)]*\)/g, "")
      .trim();
  };

  // 調味料代替交渉用の「変更元の調味料・食材名」を取得（例: "醤油", "みりん・料理酒", "タレ"）
  const getTargetIngredientText = (item?: EnhancedAnalyzeResult | null, targetLang?: "JP" | "EN"): string => {
    if (!item) return "";
    const activeLang = targetLang || lang;

    // AIが明示的に target_ingredient を返している場合
    if (item.substitute_proposal?.target_ingredient) {
      if (activeLang === "EN" && item.substitute_proposal.target_ingredient_en) {
        return item.substitute_proposal.target_ingredient_en;
      }
      return item.substitute_proposal.target_ingredient;
    }

    // ない場合: concerning_ingredients から調味料系を優先抽出
    const seasonKeywords = ["醤油", "みりん", "酒", "タレ", "ドレッシング", "ソース", "つゆ", "スープ"];
    const matched = item.concerning_ingredients.filter((ing) =>
      seasonKeywords.some((kw) => ing.includes(kw))
    );
    const targetList = matched.length > 0 ? matched : item.concerning_ingredients;
    const cleaned = targetList.slice(0, 2).map(cleanIngredientName).filter(Boolean);

    if (activeLang === "JP") {
      return cleaned.join("・") || "該当の調味料";
    }

    const enMapped = cleaned.map((ing) => {
      if (ing.includes("醤油")) return "Soy sauce";
      if (ing.includes("みりん") || ing.includes("酒")) return "Mirin / Cooking sake";
      if (ing.includes("タレ") || ing.includes("つゆ")) return "Sauce / Broth";
      if (ing.includes("ドレッシング")) return "Dressing";
      if (ing.includes("豚")) return "Pork seasoning";
      return ing;
    });
    return enMapped.join(", ") || "these seasonings";
  };

  // 食材抜き交渉用の簡潔な食材リスト（長文や括弧を除去して最大2〜3品）
  const getConciseConcerningIngredientsText = (item?: EnhancedAnalyzeResult | null, targetLang?: "JP" | "EN"): string => {
    if (!item) return "";
    const activeLang = targetLang || lang;

    const cleaned = item.concerning_ingredients
      .slice(0, 3)
      .map(cleanIngredientName)
      .filter(Boolean);

    if (activeLang === "JP") {
      return cleaned.join("・") || "該当の食材";
    }

    if (item.concerning_ingredients_en && item.concerning_ingredients_en.length > 0) {
      return item.concerning_ingredients_en.slice(0, 3).map(cleanIngredientName).join(", ");
    }

    const enMapped = cleaned.map((ing) => {
      if (ing.includes("豚") || ing.includes("ぶた")) return "Pork";
      if (ing.includes("みりん") || ing.includes("酒")) return "Cooking sake/Mirin";
      if (ing.includes("スープ")) return "Pork Broth";
      if (ing.includes("醤油")) return "Soy sauce";
      return ing;
    });
    return enMapped.join(", ") || "these ingredients";
  };

  const getConcerningIngredientsText = (item?: EnhancedAnalyzeResult | null) => {
    return getConciseConcerningIngredientsText(item);
  };

  const getSubstituteItemsText = (item?: EnhancedAnalyzeResult | null) => {
    if (!item || !item.substitute_proposal) return "";
    if (lang === "JP") {
      return item.substitute_proposal.substitute_items.join("・") || "塩・オリーブオイルなど";
    }
    if (item.substitute_proposal.substitute_items_en && item.substitute_proposal.substitute_items_en.length > 0) {
      return item.substitute_proposal.substitute_items_en.join(", ");
    }
    return item.substitute_proposal.substitute_items.join(", ") || "Halal Seasonings";
  };

  const getSubstituteAdvice = (item?: EnhancedAnalyzeResult | null) => {
    if (!item || !item.substitute_proposal) return t.substituteDescFallback;
    if (lang === "JP") {
      return item.substitute_proposal.advice || t.substituteDescFallback;
    }
    return item.substitute_proposal.advice_en || item.substitute_proposal.advice || t.substituteDescFallback;
  };

  // 統一された多言語切り替えピルボタン
  const LanguageToggle = ({ light = false }: { light?: boolean }) => (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-black shadow-xs transition-all cursor-pointer active:scale-95 ${
        light
          ? "bg-white/25 backdrop-blur-md text-white border border-white/30 hover:bg-white/35"
          : "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50"
      }`}
      aria-label="Toggle language"
    >
      <Globe className={`w-3.5 h-3.5 ${light ? "text-white" : "text-[#24C27A]"}`} />
      <span className={lang === "JP" ? (light ? "text-white font-black" : "text-[#24C27A] font-black") : (light ? "text-white/60 font-medium" : "text-slate-400 font-medium")}>JP</span>
      <span className={light ? "text-white/40" : "text-slate-300"}>/</span>
      <span className={lang === "EN" ? (light ? "text-white font-black" : "text-[#24C27A] font-black") : (light ? "text-white/60 font-medium" : "text-slate-400 font-medium")}>EN</span>
    </button>
  );

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

        {/* 店員さんに見せる指差しカード (スマホ枠内オーバーレイ) */}
        {isFullscreenStaffView && analysisResult && (
          <div className="absolute inset-0 z-40 bg-[#24C27A] text-white flex flex-col justify-between pt-14 px-6 pb-8 overflow-y-auto animate-fadeIn">
            {/* トップバー: バッジ & 言語切替 & 閉じるボタン */}
            <div className="flex justify-between items-center">
              <span className="px-3.5 py-1.5 rounded-full bg-white/20 text-xs font-black tracking-wider uppercase backdrop-blur-md">
                {t.staffFullscreenBadge}
              </span>
              <div className="flex items-center gap-2">
                <LanguageToggle light />
                <button
                  type="button"
                  onClick={() => {
                    setIsFullscreenStaffView(false);
                    setStaffResponse(null);
                  }}
                  className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all cursor-pointer active:scale-95"
                  aria-label="Close"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 代替提案がある場合、カード上部でワンタップ切り替え可能 */}
            {analysisResult.substitute_proposal?.has_substitute && (
              <div className="flex bg-black/15 p-1 rounded-2xl backdrop-blur-md mt-2">
                <button
                  type="button"
                  onClick={() => setStaffCardMode("substitute")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    staffCardMode === "substitute"
                      ? "bg-white text-[#24C27A] shadow-sm"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  ✨ {lang === "JP" ? "代替調味料でお願い" : "With Substitute"}
                </button>
                <button
                  type="button"
                  onClick={() => setStaffCardMode("remove")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    staffCardMode === "remove"
                      ? "bg-white text-[#24C27A] shadow-sm"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {lang === "JP" ? "食材を抜いてお願い" : "Without Ingredients"}
                </button>
              </div>
            )}

            {/* 店員さん向け特大フレーズ (JPモードは日本語のみ、ENモードは日英対訳) */}
            <div className="my-auto space-y-5 text-center bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl">
              <div className="space-y-1">
                <p className="text-xs font-bold text-white/80">
                  {lang === "JP" ? "店員さんにお見せください" : "Please show this screen to staff"}
                </p>
                <p className="text-base text-white/95 font-medium">すみません、宗教上の理由により、</p>
              </div>

              {/* メイン質問文: 代替調味料モードか、食材抜きモードかで切り替え */}
              {staffCardMode === "substitute" && analysisResult.substitute_proposal?.has_substitute ? (
                <>
                  <p className="text-xl sm:text-2xl font-black leading-snug tracking-tight text-white drop-shadow-sm">
                    「
                    <span className="line-through decoration-rose-300/80 decoration-2 opacity-90">
                      {getTargetIngredientText(analysisResult)}
                    </span>
                    」の代わりに、
                    <br />
                    「
                    <span className="underline decoration-amber-300 decoration-4 underline-offset-4 font-black text-amber-200">
                      {getSubstituteItemsText(analysisResult)}
                    </span>
                    」で味付け・調理して頂くことは可能でしょうか？
                  </p>

                  {lang === "EN" && (
                    <p className="text-xs text-white/90 font-medium border-t border-white/20 pt-3 leading-relaxed">
                      (Could you please season/prepare this with{" "}
                      <span className="font-bold underline text-amber-200">
                        {getSubstituteItemsText(analysisResult)}
                      </span>{" "}
                      instead of{" "}
                      <span className="line-through opacity-80">
                        {getTargetIngredientText(analysisResult, "EN")}
                      </span>
                      ?)
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-xl sm:text-2xl font-black leading-snug tracking-tight text-white drop-shadow-sm">
                    「
                    <span className="underline decoration-amber-300 decoration-4 underline-offset-4">
                      {getConciseConcerningIngredientsText(analysisResult)}
                    </span>
                    」を使わずに調理して頂くことは可能でしょうか？
                  </p>

                  {lang === "EN" && (
                    <p className="text-xs text-white/90 font-medium border-t border-white/20 pt-3 leading-relaxed">
                      (Could you please prepare this dish without{" "}
                      <span className="font-bold underline">
                        {getConciseConcerningIngredientsText(analysisResult, "EN")}
                      </span>
                      ?)
                    </p>
                  )}
                </>
              )}
            </div>

            {/* 店員さん用指差し回答ボタン (はい / ごめんなさいできません) */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* はい */}
                <button
                  type="button"
                  onClick={() => setStaffResponse("yes")}
                  className={`py-5 rounded-3xl font-black text-lg shadow-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer border-2 ${
                    staffResponse === "yes"
                      ? "bg-white text-[#24C27A] border-white ring-4 ring-emerald-300"
                      : "bg-white text-[#24C27A] border-white hover:bg-emerald-50"
                  }`}
                >
                  <Check className="w-7 h-7 stroke-[3]" />
                  <span className="text-base font-black">{t.yesButton}</span>
                </button>

                {/* ごめんなさい。対応できません */}
                <button
                  type="button"
                  onClick={handleStaffDecline}
                  className={`py-5 rounded-3xl font-black shadow-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer border-2 ${
                    staffResponse === "no"
                      ? "bg-rose-600 text-white border-rose-300 ring-4 ring-rose-200"
                      : "bg-white/20 text-white border-white/40 hover:bg-white/30"
                  }`}
                >
                  <XCircle className="w-7 h-7 stroke-[2.5]" />
                  <span className="text-xs font-black text-center leading-tight px-1">
                    {t.noButton}
                  </span>
                </button>
              </div>

              {/* 回答後のリアクション案内 */}
              {staffResponse === "yes" && (
                <div className="p-4 bg-white rounded-3xl text-center space-y-2.5 shadow-2xl animate-fadeIn">
                  <p className="text-sm font-black text-[#24C27A]">
                    {t.reactionYes}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFullscreenStaffView(false);
                      setStaffResponse(null);
                    }}
                    className="w-full py-2.5 rounded-full bg-[#24C27A] text-white text-xs font-black hover:bg-[#1EA866] transition-all cursor-pointer"
                  >
                    {t.closeCard}
                  </button>
                </div>
              )}

              {staffResponse === "no" && (
                <div className="p-4 bg-white rounded-3xl text-center space-y-3 shadow-2xl animate-fadeIn">
                  <p className="text-xs font-bold text-slate-700">
                    {t.reactionNo}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFullscreenStaffView(false);
                      setStaffResponse(null);
                      setCurrentTab("camera");
                    }}
                    className="w-full py-3.5 rounded-full bg-[#24C27A] text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t.scanOtherDish}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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
            <div className="bg-[#24C27A] pt-14 pb-7 px-6 rounded-b-[36px] text-white space-y-4 shadow-sm relative">
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white shadow-sm">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                {/* 言語切り替えトグル */}
                <LanguageToggle light />
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
                    onClick={() => startCamera()}
                    className="px-4 py-2 rounded-full bg-[#24C27A] text-white text-xs font-bold hover:bg-[#1EA866] transition-all cursor-pointer"
                  >
                    {t.restartCamera}
                  </button>
                </div>
              )}
            </div>

            {/* 上部ヘッダーバー: 戻る & 言語切替 & カメラ切り替え(外/内) */}
            <div className="relative z-20 pt-14 px-6 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentTab("home")}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-all border border-white/20 cursor-pointer active:scale-95 shadow-md"
                aria-label={t.back}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {/* 言語切り替えトグル */}
                <LanguageToggle light />

                {/* 外カメラ/内カメラ切り替えボタン */}
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-all border border-white/20 cursor-pointer active:scale-95 shadow-md"
                  title={lang === "JP" ? "カメラ切り替え (外/内)" : "Switch Camera (Back/Front)"}
                  aria-label="Switch Camera"
                >
                  <SwitchCamera className="w-5 h-5 text-white" />
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
            <div className="relative z-20 px-8 pb-10 pt-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between">
              {/* アルバムから選択 */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex flex-col items-center justify-center text-white border border-white/30 hover:bg-white/30 transition-all active:scale-95 cursor-pointer shadow-md"
                title={t.selectFromAlbum}
                aria-label={t.selectFromAlbum}
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              {/* 本格シャッターボタン (中央配置) */}
              <button
                type="button"
                onClick={capturePhoto}
                className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 group active:scale-90 transition-all shadow-xl cursor-pointer"
                aria-label={t.takePhoto}
              >
                <div className="w-full h-full rounded-full bg-[#24C27A] group-hover:bg-[#1EA866] transition-all flex items-center justify-center shadow-inner">
                  <Camera className="w-7 h-7 text-white stroke-[2.2]" />
                </div>
              </button>

              {/* 右側スペーサー（中央のシャッターを美しくセンター配置するためのバランス要素） */}
              <div className="w-12 h-12 opacity-0 pointer-events-none" />
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
            <div className="pt-14 px-6 pb-6 space-y-5">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentTab("camera")}
                  className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                  aria-label={t.back}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-base font-black text-slate-900">{t.resultHeader}</h2>
                {/* 言語切替トグル */}
                <LanguageToggle />
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
                  <h1 className="text-lg font-black text-slate-900">
                    {getDishName(analysisResult)}
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                    {getSummaryMessage(analysisResult)}
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
                        <span className="text-xs font-black text-slate-900">
                          {getCheckpointName(cp.name, cp.name_en)}
                        </span>
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
                        {getCheckpointReason(cp.reason, cp.reason_en)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ユーザーへの提案セクション (注意/要注意の食材抜き提案 or 他の食べ物を見る) */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#24C27A]" />
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    {t.proposalHeader}
                  </h3>
                </div>

                {/* 注意・要注意の食材がある場合: ユーザーが選べる2つのボタンを表示 */}
                {analysisResult.concerning_ingredients.length > 0 ? (
                  <div className="space-y-3">
                    {/* ボタン1: AIからの提案（代替調味料への変更）※調味料代替が可能な場合 */}
                    {analysisResult.substitute_proposal?.has_substitute && (
                      <button
                        type="button"
                        onClick={() => {
                          setStaffCardMode("substitute");
                          setIsFullscreenStaffView(true);
                        }}
                        className="w-full p-4 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-md hover:shadow-lg transition-all active:scale-98 flex items-start gap-3.5 text-left cursor-pointer group border-2 border-amber-300/40"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-5 h-5 text-amber-100" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black uppercase text-amber-200 tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                              {t.substituteOptionBadge}
                            </span>
                            <span className="text-[9px] font-bold text-amber-100 bg-black/25 px-1.5 py-0.5 rounded-full">
                              {t.recommendedBadge}
                            </span>
                          </div>
                          <h4 className="text-sm font-black leading-snug mt-1.5 break-words">
                            {lang === "JP"
                              ? `「${getTargetIngredientText(analysisResult)}」の代わりに【${getSubstituteItemsText(analysisResult)}】で味付けしてもらう`
                              : `Substitute [${getTargetIngredientText(analysisResult, "EN")}] with [${getSubstituteItemsText(analysisResult)}]`}
                          </h4>
                          <p className="text-[11px] text-amber-100/95 mt-1 leading-relaxed break-words">
                            {getSubstituteAdvice(analysisResult)}
                          </p>
                          <p className="text-[10px] font-bold text-amber-200 mt-2 flex items-center gap-1">
                            <span>{lang === "JP" ? "店員さん指差しカードを表示" : "Open Staff Pointing Card"}</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </p>
                        </div>
                      </button>
                    )}

                    {/* ボタン2: （食べられない食べ物）を抜いてこの料理を食べる */}
                    <button
                      type="button"
                      onClick={() => {
                        setStaffCardMode("remove");
                        setIsFullscreenStaffView(true);
                      }}
                      className="w-full p-4 rounded-3xl bg-gradient-to-br from-[#24C27A] to-[#1EA866] text-white shadow-md hover:shadow-lg transition-all active:scale-98 flex items-start gap-3.5 text-left cursor-pointer group border-2 border-emerald-300/40"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 mt-0.5">
                        <Utensils className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase text-white/90 tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                            {t.option1Badge}
                          </span>
                        </div>
                        <h4 className="text-sm font-black leading-snug mt-1.5 break-words">
                          {lang === "JP"
                            ? `「${getConciseConcerningIngredientsText(analysisResult)}」を抜いてこの料理を食べる`
                            : `Eat this dish without ${getConciseConcerningIngredientsText(analysisResult, "EN")}`}
                        </h4>
                        <p className="text-[11px] text-white/90 mt-1 leading-relaxed break-words">
                          {t.option1Desc}
                        </p>
                        <p className="text-[10px] font-bold text-white mt-2 flex items-center gap-1">
                          <span>{lang === "JP" ? "店員さん指差しカードを表示" : "Open Staff Pointing Card"}</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </p>
                      </div>
                    </button>

                    {/* 調味料代替ができない料理（ラーメンなど）の場合、カメラに戻る選択肢を表示 */}
                    {!analysisResult.substitute_proposal?.has_substitute && (
                      <button
                        type="button"
                        onClick={() => setCurrentTab("camera")}
                        className="w-full p-4 rounded-3xl bg-white border border-slate-200 text-slate-700 shadow-xs hover:bg-slate-50 transition-all active:scale-98 flex items-center justify-between text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                            <RotateCcw className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                              {t.option2Badge}
                            </span>
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                              {t.option2Action}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {t.option2Desc}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </button>
                    )}
                  </div>
                ) : (
                  /* 安全な場合 */
                  <div className="space-y-2.5">
                    <div className="p-4 rounded-3xl bg-[#F0FDF4] border border-emerald-200 text-emerald-800 text-xs font-bold leading-relaxed">
                      {lang === "JP"
                        ? "このメニューはハラール基準を満たしています。安心してお召し上がりください！"
                        : "This dish meets your halal criteria. Enjoy your meal with confidence!"}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentTab("camera")}
                      className="w-full py-3.5 rounded-full bg-[#24C27A] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{t.option2Action}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 画面5: ユーザーへの提案画面 (食材抜き提案 or 他の食べ物を見る)            */}
        {/* ========================================================================= */}
        {currentTab === "proposal" && analysisResult && (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto bg-[#F8FAF9]">
            <div className="pt-14 px-6 pb-6 space-y-5">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentTab("result")}
                  className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                  aria-label={t.back}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-base font-black text-slate-900">{t.proposalHeader}</h2>
                <LanguageToggle />
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

              {/* ユーザーが選べる2つの選択肢 */}
              <div className="space-y-3">
                {/* 選択肢1: AI特別提案 (代替調味料・食材で調理) */}
                {analysisResult.substitute_proposal?.has_substitute && (
                  <div
                    onClick={() => {
                      setStaffCardMode("substitute");
                      setIsFullscreenStaffView(true);
                    }}
                    className="rounded-3xl p-5 border-2 border-amber-300 bg-amber-50/60 hover:border-amber-500 transition-all cursor-pointer shadow-sm active:scale-98"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full tracking-wider">
                            {t.substituteOptionBadge}
                          </span>
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-200/50 px-1.5 py-0.5 rounded-full">
                            {t.recommendedBadge}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 leading-snug mt-1.5 break-words">
                          {lang === "JP"
                            ? `「${getTargetIngredientText(analysisResult)}」の代わりに【${getSubstituteItemsText(analysisResult)}】で味付けしてもらう`
                            : `Substitute [${getTargetIngredientText(analysisResult, "EN")}] with [${getSubstituteItemsText(analysisResult)}]`}
                        </h3>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed break-words">
                          {getSubstituteAdvice(analysisResult)}
                        </p>
                        <p className="text-[10px] font-bold text-amber-700 mt-2 flex items-center gap-1">
                          <span>{lang === "JP" ? "店員さん指差しカードを表示 ＞" : "Open Staff Pointing Card ＞"}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 選択肢2: （食べられない食べ物）を抜いてこの料理を食べる */}
                {analysisResult.concerning_ingredients.length > 0 && (
                  <div
                    onClick={() => {
                      setStaffCardMode("remove");
                      setIsFullscreenStaffView(true);
                    }}
                    className="rounded-3xl p-5 border-2 border-emerald-200 bg-emerald-50/40 hover:border-[#24C27A] transition-all cursor-pointer shadow-sm active:scale-98"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#24C27A] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black uppercase text-[#24C27A] bg-emerald-100 px-2 py-0.5 rounded-full tracking-wider">
                          {t.option1Badge}
                        </span>
                        <h3 className="text-sm font-black text-slate-900 leading-snug mt-1.5 break-words">
                          {lang === "JP"
                            ? `「${getConciseConcerningIngredientsText(analysisResult)}」を抜いてこの料理を食べる`
                            : `Eat this dish without ${getConciseConcerningIngredientsText(analysisResult, "EN")}`}
                        </h3>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed break-words">{t.option1Desc}</p>
                        <p className="text-[10px] font-bold text-[#24C27A] mt-2 flex items-center gap-1">
                          <span>{lang === "JP" ? "店員さん指差しカードを表示 ＞" : "Open Staff Pointing Card ＞"}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                      「{getConciseConcerningIngredientsText(analysisResult)}を使わずに調理して頂くことは可能でしょうか？」
                    </p>
                    {lang === "EN" && (
                      <p className="text-[11px] text-slate-500">
                        (Could you please prepare this dish without{" "}
                        {getConciseConcerningIngredientsText(analysisResult, "EN")}?)
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-100">
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
          <div className="flex-1 flex flex-col justify-between pt-14 px-6 pb-6 bg-[#F8FAF9] overflow-y-auto">
            <div className="space-y-4">
              {/* ヘッダー */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentTab("home")}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-xs border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
                    aria-label={t.back}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-base font-black text-slate-900">{t.settingsHeader}</h1>
                    <p className="text-[11px] text-slate-500 font-medium">{t.settingsSub}</p>
                  </div>
                </div>

                {/* 言語切替トグル */}
                <LanguageToggle />
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

                {/* 項目6: その他の自由記述欄（任意） */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-[#24C27A]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-800">
                          {t.customNotesTitle}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {t.customNotesBadge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {t.customNotesDesc}
                      </p>
                    </div>
                  </div>

                  <textarea
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder={t.customNotesPlaceholder}
                    rows={3}
                    className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#24C27A]/40 focus:border-[#24C27A] text-slate-800 placeholder:text-slate-400 resize-none transition-all"
                  />
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
