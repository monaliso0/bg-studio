"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth, useClerk } from "@clerk/nextjs";
import Controls from "@/components/Controls";
import { Toggle } from "@/components/Controls";
import Uploader from "@/components/Uploader";
import MobileMenu from "@/components/MobileMenu";
import MultiCanvas from "@/components/MultiCanvas";
import AccountArea from "@/components/AccountArea";
import { composeImage, type ComposeOptions, type ExportFormat, type AspectRatioOption } from "@/lib/compose";
import { type MultiItem } from "@/lib/types";
import { getImageDimensions, refineMask } from "@/lib/imageUtils";
import { useFocusTrap } from "@/lib/useFocusTrap";

type Mode = "single" | "multi";
type SingleStage = "idle" | "removing" | "done" | "error";

const DEFAULT_BG = "#FAFAFA";
const DEFAULT_RATIO: AspectRatioOption = "original";
const DEFAULT_PADDING = 10;
const DEFAULT_FORMAT: ExportFormat = "png";
const MAX_MULTI_FILES = 30;
const MAX_MULTI_MB = 100;
const CONCURRENT_LIMIT = 2;

function OneBackLogo() {
  return (
    <svg aria-hidden="true" focusable="false" width="124" height="44" viewBox="0 0 88 31" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M31.6134 31H0V0H31.6134V31ZM1.58067 15.5V29.45H30.0327V15.5H1.58067Z" fill="black"/>
      <path d="M39.0994 19.0898C38.6189 19.0898 38.2016 19.1849 37.8475 19.375C37.5019 19.5651 37.2195 19.8214 37.0003 20.1438C36.7811 20.4579 36.6167 20.8175 36.5071 21.2226C36.406 21.6277 36.3554 22.041 36.3554 22.4626C36.3554 22.8842 36.406 23.2975 36.5071 23.7026C36.6167 24.1077 36.7811 24.4714 37.0003 24.7938C37.2195 25.1079 37.5019 25.3601 37.8475 25.5502C38.2016 25.7403 38.6189 25.8354 39.0994 25.8354C39.58 25.8354 39.993 25.7403 40.3387 25.5502C40.6927 25.3601 40.9794 25.1079 41.1986 24.7938C41.4177 24.4714 41.5779 24.1077 41.6791 23.7026C41.7887 23.2975 41.8435 22.8842 41.8435 22.4626C41.8435 22.041 41.7887 21.6277 41.6791 21.2226C41.5779 20.8175 41.4177 20.4579 41.1986 20.1438C40.9794 19.8214 40.6927 19.5651 40.3387 19.375C39.993 19.1849 39.58 19.0898 39.0994 19.0898ZM39.0994 17.825C39.7739 17.825 40.3766 17.949 40.9077 18.197C41.4473 18.445 41.9025 18.7798 42.2734 19.2014C42.6443 19.623 42.9268 20.1149 43.1207 20.677C43.323 21.2391 43.4241 21.8343 43.4241 22.4626C43.4241 23.0991 43.323 23.6985 43.1207 24.2606C42.9268 24.8227 42.6443 25.3146 42.2734 25.7362C41.9025 26.1578 41.4473 26.4926 40.9077 26.7406C40.3766 26.9803 39.7739 27.1002 39.0994 27.1002C38.425 27.1002 37.818 26.9803 37.2785 26.7406C36.7474 26.4926 36.2964 26.1578 35.9254 25.7362C35.5545 25.3146 35.2679 24.8227 35.0656 24.2606C34.8717 23.6985 34.7747 23.0991 34.7747 22.4626C34.7747 21.8343 34.8717 21.2391 35.0656 20.677C35.2679 20.1149 35.5545 19.623 35.9254 19.2014C36.2964 18.7798 36.7474 18.445 37.2785 18.197C37.818 17.949 38.425 17.825 39.0994 17.825Z" fill="black"/>
      <path d="M44.6604 20.4786H46.0261V21.421L46.0514 21.4458C46.2706 21.0903 46.5572 20.8134 46.9113 20.615C47.2654 20.4083 47.6574 20.305 48.0873 20.305C48.8039 20.305 49.3687 20.4869 49.7818 20.8506C50.1949 21.2143 50.4014 21.7599 50.4014 22.4874V26.8894H48.9598V22.8594C48.943 22.3551 48.8334 21.9914 48.6311 21.7682C48.4287 21.5367 48.1126 21.421 47.6827 21.421C47.4382 21.421 47.219 21.4665 47.0251 21.5574C46.8312 21.6401 46.6668 21.7599 46.5319 21.917C46.3971 22.0658 46.2917 22.2435 46.2158 22.4502C46.1399 22.6569 46.102 22.8759 46.102 23.1074V26.8894H44.6604V20.4786Z" fill="black"/>
      <path d="M56.4107 23.1198C56.3939 22.8966 56.3433 22.6817 56.259 22.475C56.1831 22.2683 56.0735 22.0906 55.9302 21.9418C55.7953 21.7847 55.6267 21.6607 55.4244 21.5698C55.2305 21.4706 55.0113 21.421 54.7668 21.421C54.5139 21.421 54.2821 21.4665 54.0713 21.5574C53.869 21.6401 53.692 21.7599 53.5402 21.917C53.3969 22.0658 53.2789 22.2435 53.1862 22.4502C53.1019 22.6569 53.0555 22.8801 53.0471 23.1198H56.4107ZM53.0471 24.0498C53.0471 24.2978 53.0808 24.5375 53.1482 24.769C53.2241 25.0005 53.3337 25.203 53.477 25.3766C53.6203 25.5502 53.8016 25.6907 54.0207 25.7982C54.2399 25.8974 54.5013 25.947 54.8048 25.947C55.2263 25.947 55.5635 25.8602 55.8164 25.6866C56.0777 25.5047 56.2716 25.2361 56.3981 24.8806H57.7638C57.6879 25.2278 57.5572 25.5378 57.3718 25.8106C57.1863 26.0834 56.9629 26.3149 56.7016 26.505C56.4402 26.6869 56.1452 26.8233 55.8164 26.9142C55.496 27.0134 55.1588 27.063 54.8048 27.063C54.2905 27.063 53.8353 26.9803 53.4391 26.815C53.0428 26.6497 52.7056 26.4182 52.4274 26.1206C52.1577 25.823 51.9511 25.4675 51.8078 25.0542C51.6729 24.6409 51.6055 24.1862 51.6055 23.6902C51.6055 23.2355 51.6771 22.8057 51.8205 22.4006C51.9722 21.9873 52.183 21.6277 52.4527 21.3218C52.7309 21.0077 53.0639 20.7597 53.4517 20.5778C53.8395 20.3959 54.2779 20.305 54.7668 20.305C55.2811 20.305 55.7405 20.4125 56.1452 20.6274C56.5582 20.8341 56.8997 21.111 57.1694 21.4582C57.4392 21.8054 57.6331 22.2063 57.7511 22.661C57.8776 23.1074 57.9113 23.5703 57.8523 24.0498H53.0471Z" fill="black"/>
      <path d="M60.7312 21.7434H63.3108C63.6902 21.7434 64.0063 21.6401 64.2592 21.4334C64.5121 21.2185 64.6386 20.9126 64.6386 20.5158C64.6386 20.0694 64.5248 19.7553 64.2972 19.5734C64.0696 19.3915 63.7408 19.3006 63.3108 19.3006H60.7312V21.7434ZM59.1505 18.0358H63.5385C64.3478 18.0358 64.9969 18.2177 65.4858 18.5814C65.9748 18.9451 66.2193 19.4949 66.2193 20.2306C66.2193 20.677 66.1055 21.0614 65.8778 21.3838C65.6587 21.6979 65.3425 21.9418 64.9294 22.1154V22.1402C65.4858 22.2559 65.9073 22.5163 66.194 22.9214C66.4806 23.3182 66.6239 23.8183 66.6239 24.4218C66.6239 24.769 66.5607 25.0955 66.4342 25.4014C66.3078 25.699 66.1097 25.9594 65.8399 26.1826C65.5701 26.3975 65.2245 26.5711 64.803 26.7034C64.3815 26.8274 63.8799 26.8894 63.2982 26.8894H59.1505V18.0358ZM60.7312 25.6246H63.5258C64.0063 25.6246 64.3773 25.5047 64.6386 25.265C64.9084 25.017 65.0432 24.6698 65.0432 24.2234C65.0432 23.7853 64.9084 23.4505 64.6386 23.219C64.3773 22.9793 64.0063 22.8594 63.5258 22.8594H60.7312V25.6246Z" fill="black"/>
      <path d="M73.3272 25.4634C73.3272 25.637 73.3483 25.761 73.3905 25.8354C73.441 25.9098 73.5338 25.947 73.6687 25.947C73.7108 25.947 73.7614 25.947 73.8204 25.947C73.8794 25.947 73.9469 25.9387 74.0227 25.9222V26.9018C73.9722 26.9183 73.9047 26.9349 73.8204 26.9514C73.7445 26.9762 73.6644 26.9969 73.5801 27.0134C73.4958 27.0299 73.4115 27.0423 73.3272 27.0506C73.2429 27.0589 73.1713 27.063 73.1123 27.063C72.8172 27.063 72.5727 27.0051 72.3788 26.8894C72.1849 26.7737 72.0585 26.5711 71.9995 26.2818C71.7128 26.5546 71.3588 26.753 70.9373 26.877C70.5242 27.001 70.1238 27.063 69.736 27.063C69.4409 27.063 69.1585 27.0217 68.8887 26.939C68.619 26.8646 68.3787 26.753 68.1679 26.6042C67.9656 26.4471 67.8012 26.2529 67.6748 26.0214C67.5567 25.7817 67.4977 25.5047 67.4977 25.1906C67.4977 24.7938 67.5694 24.4714 67.7127 24.2234C67.8644 23.9754 68.0583 23.7811 68.2944 23.6406C68.5389 23.5001 68.8086 23.4009 69.1037 23.343C69.4072 23.2769 69.7107 23.2273 70.0142 23.1942C70.2755 23.1446 70.5242 23.1115 70.7602 23.095C70.9963 23.0702 71.2028 23.033 71.3799 22.9834C71.5653 22.9338 71.7086 22.8594 71.8098 22.7602C71.9194 22.6527 71.9742 22.4957 71.9742 22.289C71.9742 22.1071 71.9278 21.9583 71.8351 21.8426C71.7508 21.7269 71.6412 21.6401 71.5063 21.5822C71.3799 21.5161 71.2365 21.4747 71.0764 21.4582C70.9162 21.4334 70.7644 21.421 70.6211 21.421C70.2165 21.421 69.8835 21.5037 69.6221 21.669C69.3608 21.8343 69.2133 22.0906 69.1796 22.4378H67.738C67.7633 22.0245 67.8644 21.6814 68.0415 21.4086C68.2185 21.1358 68.4419 20.9167 68.7117 20.7514C68.9899 20.5861 69.3018 20.4703 69.6474 20.4042C69.9931 20.3381 70.3472 20.305 70.7097 20.305C71.03 20.305 71.3461 20.3381 71.6581 20.4042C71.97 20.4703 72.2482 20.5778 72.4926 20.7266C72.7456 20.8754 72.9479 21.0697 73.0996 21.3094C73.2514 21.5409 73.3272 21.8261 73.3272 22.165V25.4634ZM71.8857 23.6778C71.6665 23.8183 71.3967 23.9051 71.0764 23.9382C70.756 23.963 70.4357 24.0043 70.1153 24.0622C69.9636 24.087 69.816 24.1242 69.6727 24.1738C69.5294 24.2151 69.403 24.2771 69.2934 24.3598C69.1838 24.4342 69.0953 24.5375 69.0278 24.6698C68.9688 24.7938 68.9393 24.9467 68.9393 25.1286C68.9393 25.2857 68.9857 25.4179 69.0784 25.5254C69.1711 25.6329 69.2807 25.7197 69.4072 25.7858C69.5421 25.8437 69.6854 25.885 69.8371 25.9098C69.9973 25.9346 70.1406 25.947 70.2671 25.947C70.4272 25.947 70.6001 25.9263 70.7855 25.885C70.971 25.8437 71.1438 25.7734 71.304 25.6742C71.4726 25.575 71.6117 25.451 71.7213 25.3022C71.8309 25.1451 71.8857 24.955 71.8857 24.7318V23.6778Z" fill="black"/>
      <path d="M79.2916 22.6238C79.2326 22.227 79.0682 21.9294 78.7984 21.731C78.5371 21.5243 78.2041 21.421 77.7994 21.421C77.614 21.421 77.4159 21.4541 77.2051 21.5202C76.9944 21.5781 76.8005 21.6938 76.6234 21.8674C76.4464 22.0327 76.2989 22.2683 76.1808 22.5742C76.0628 22.8718 76.0038 23.2645 76.0038 23.7522C76.0038 24.0167 76.0333 24.2813 76.0923 24.5458C76.1598 24.8103 76.2609 25.0459 76.3958 25.2526C76.5391 25.4593 76.7204 25.6287 76.9396 25.761C77.1587 25.885 77.4243 25.947 77.7362 25.947C78.1577 25.947 78.5034 25.8189 78.7731 25.5626C79.0513 25.3063 79.2242 24.9467 79.2916 24.4838H80.7332C80.5983 25.3187 80.2737 25.9594 79.7595 26.4058C79.2537 26.8439 78.5792 27.063 77.7362 27.063C77.222 27.063 76.7667 26.9803 76.3705 26.815C75.9827 26.6414 75.654 26.4099 75.3842 26.1206C75.1144 25.823 74.9079 25.4717 74.7646 25.0666C74.6297 24.6615 74.5622 24.2234 74.5622 23.7522C74.5622 23.2727 74.6297 22.8222 74.7646 22.4006C74.8994 21.979 75.1018 21.6153 75.3715 21.3094C75.6413 20.9953 75.9743 20.7514 76.3705 20.5778C76.7752 20.3959 77.2473 20.305 77.7868 20.305C78.1662 20.305 78.5244 20.3546 78.8617 20.4538C79.2073 20.5447 79.5108 20.6853 79.7721 20.8754C80.0419 21.0655 80.2611 21.3053 80.4297 21.5946C80.5983 21.8839 80.6994 22.227 80.7332 22.6238H79.2916Z" fill="black"/>
      <path d="M81.9429 18.0358H83.3844V23.0702L85.9894 20.4786H87.7597L85.2559 22.8346L88 26.8894H86.2423L84.2443 23.777L83.3844 24.5954V26.8894H81.9429V18.0358Z" fill="black"/>
    </svg>
  );
}

function TuneIcon() {
  return (
    <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" fill="black"/>
    </svg>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("single");

  // ── Single mode state ──────────────────────────────────────────
  const [singleStage, setSingleStage] = useState<SingleStage>("idle");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [composedUrl, setComposedUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Multi mode state ───────────────────────────────────────────
  const [multiItems, setMultiItems] = useState<MultiItem[]>([]);

  // ── Shared settings ────────────────────────────────────────────
  const [bgColor, setBgColor] = useState(DEFAULT_BG);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>(DEFAULT_RATIO);
  const [padding, setPadding] = useState(DEFAULT_PADDING);
  const [format, setFormat] = useState<ExportFormat>(DEFAULT_FORMAT);
  const [transparentBg, setTransparentBg] = useState(false);

  // ── Mobile ─────────────────────────────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // ── Auth & download gating ─────────────────────────────────────
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const upgradeModalTriggerRef = useRef<HTMLElement | null>(null);
  const upgradeTrapRef = useFocusTrap(showUpgradeModal, () => closeUpgradeModal());
  const [downloadRefresh, setDownloadRefresh] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<"monthly" | "annual" | null>(null);
  const [subscribedSuccess, setSubscribedSuccess] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────
  const originalUrlRef = useRef<string | null>(null);
  const multiItemsRef = useRef<MultiItem[]>([]);
  const activeProcessingRef = useRef<Set<string>>(new Set());
  const settingsRef = useRef({ bgColor, aspectRatio, padding, format, transparentBg });

  // ── Fetch subscription status on sign-in ──────────────────────
  useEffect(() => {
    if (!isSignedIn) { setIsSubscribed(false); return; }
    fetch("/api/check-download")
      .then((r) => r.json())
      .then((d) => setIsSubscribed(!!d.subscribed))
      .catch(() => null);
  }, [isSignedIn, downloadRefresh]);

  // ── Detect post-checkout redirect ─────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("subscribed") !== "true") return;
    window.history.replaceState({}, "", "/editor");
    setSubscribedSuccess(true);
    setTimeout(() => setSubscribedSuccess(false), 6000);
    // Poll until webhook updates subscription status (up to ~10s)
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      fetch("/api/check-download")
        .then((r) => r.json())
        .then((d) => {
          if (d.subscribed) {
            setIsSubscribed(true);
            clearInterval(poll);
          }
        })
        .catch(() => null);
      if (attempts >= 5) clearInterval(poll);
    }, 2000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => { multiItemsRef.current = multiItems; }, [multiItems]);
  useEffect(() => {
    settingsRef.current = { bgColor, aspectRatio, padding, format, transparentBg };
  }, [bgColor, aspectRatio, padding, format, transparentBg]);

  // ── Single: object URL for transparent preview ─────────────────
  useEffect(() => {
    if (!processedBlob) { setProcessedUrl(null); return; }
    const url = URL.createObjectURL(processedBlob);
    setProcessedUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [processedBlob]);

  // ── Single: recompose when settings or blob changes ────────────
  useEffect(() => {
    if (!processedBlob) return;
    const valid = /^#[0-9A-Fa-f]{6}$/.test(bgColor);
    if (!valid && !transparentBg) return;
    const options: ComposeOptions = { bgColor, aspectRatio, padding, format, transparent: transparentBg };
    composeImage(processedBlob, options).then(setComposedUrl);
  }, [processedBlob, bgColor, aspectRatio, padding, format, transparentBg]);

  // ── Multi: recompose all done items when settings change ────────
  useEffect(() => {
    if (mode !== "multi") return;
    const doneItems = multiItemsRef.current.filter((i) => i.stage === "done" && i.processedBlob);
    if (doneItems.length === 0) return;
    const options: ComposeOptions = { bgColor, aspectRatio, padding, format, transparent: transparentBg };
    doneItems.forEach(async (item) => {
      const url = await composeImage(item.processedBlob!, options);
      setMultiItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, composedUrl: url } : i))
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgColor, aspectRatio, padding, format, transparentBg]);

  // ── Multi: queue processor ─────────────────────────────────────
  const processMultiItem = useCallback(async (id: string) => {
    const item = multiItemsRef.current.find((i) => i.id === id);
    if (!item) return;

    activeProcessingRef.current.add(id);
    setMultiItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, stage: "removing" } : i))
    );

    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const raw = await removeBackground(item.file, {
        output: { format: "image/png", quality: 1 },
      });
      const blob = await refineMask(raw, item.file);
      const options = settingsRef.current;
      const composed = await composeImage(blob, {
        bgColor: options.bgColor,
        aspectRatio: options.aspectRatio,
        padding: options.padding,
        format: options.format,
        transparent: options.transparentBg,
      });
      setMultiItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, stage: "done", processedBlob: blob, composedUrl: composed } : i
        )
      );
    } catch {
      setMultiItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, stage: "error" } : i))
      );
    } finally {
      activeProcessingRef.current.delete(id);
      startNextMultiItems();
    }
  }, []);

  const startNextMultiItems = useCallback(() => {
    const items = multiItemsRef.current;
    const slots = CONCURRENT_LIMIT - activeProcessingRef.current.size;
    if (slots <= 0) return;
    const queued = items.filter(
      (i) => i.stage === "queued" && !activeProcessingRef.current.has(i.id)
    );
    queued.slice(0, slots).forEach((i) => processMultiItem(i.id));
  }, [processMultiItem]);

  // ── Handlers: Single ───────────────────────────────────────────
  const handleSingleFile = useCallback(async (file: File) => {
    if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);

    // Show skeleton immediately, load dimensions in background
    const url = URL.createObjectURL(file);
    originalUrlRef.current = url;
    setOriginalUrl(url);
    setOriginalDimensions(null);
    setSingleStage("removing");
    setErrorMsg("");

    getImageDimensions(file).then(setOriginalDimensions);

    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const raw = await removeBackground(file, {
        output: { format: "image/png", quality: 1 },
      });
      const blob = await refineMask(raw, file);
      setProcessedBlob(blob);
      setSingleStage("done");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to process image. Please try again.");
      setSingleStage("error");
    }
  }, []);

  const triggerFileDownload = useCallback((url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  }, []);

  const withDownloadGate = useCallback(async (onAllowed: () => Promise<void>) => {
    if (!isSignedIn) {
      openSignIn({ afterSignOutUrl: window.location.href });
      return;
    }
    const res = await fetch("/api/check-download", { method: "POST" });
    if (res.status === 403) {
      openUpgradeModal();
      return;
    }
    if (!res.ok) return;
    await onAllowed();
    setDownloadRefresh((n) => n + 1);
  }, [isSignedIn, openSignIn]);

  const handleSingleDownload = useCallback(() => {
    if (!composedUrl) return;
    withDownloadGate(async () => {
      triggerFileDownload(composedUrl, transparentBg ? "product.png" : `product.${format}`);
    });
  }, [composedUrl, format, transparentBg, withDownloadGate, triggerFileDownload]);

  const handleSingleReset = useCallback(() => {
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = null;
    }
    setSingleStage("idle");
    setOriginalUrl(null);
    setOriginalDimensions(null);
    setProcessedBlob(null);
    setProcessedUrl(null);
    setComposedUrl(null);
    setErrorMsg("");
  }, []);

  // ── Handlers: Multi ────────────────────────────────────────────
  const handleMultiFiles = useCallback(async (files: File[]) => {
    const totalMB = files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024);
    const limited = files.slice(0, MAX_MULTI_FILES);

    if (totalMB > MAX_MULTI_MB) {
      alert(`Total file size exceeds ${MAX_MULTI_MB}MB. Please select fewer or smaller images.`);
      return;
    }

    // Show skeletons immediately with 1:1 ratio — no waiting
    const newItems: MultiItem[] = limited.map((file) => ({
      id: crypto.randomUUID(),
      file,
      naturalWidth: 1,
      naturalHeight: 1,
      stage: "queued",
      processedBlob: null,
      composedUrl: null,
    }));

    multiItemsRef.current = newItems;
    setMultiItems(newItems);
    startNextMultiItems();

    // Load actual dimensions in background to correct skeleton aspect ratios
    limited.forEach((file, i) => {
      const itemId = newItems[i].id;
      getImageDimensions(file).then(({ width, height }) => {
        setMultiItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, naturalWidth: width, naturalHeight: height } : item
          )
        );
      });
    });
  }, [startNextMultiItems]);

  const handleCheckout = useCallback(async (plan: "monthly" | "annual") => {
    if (!isSignedIn) {
      openSignIn({ afterSignOutUrl: window.location.href });
      return;
    }
    setCheckoutLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, origin: window.location.origin }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setCheckoutLoading(null);
    }
  }, [isSignedIn, openSignIn]);

  const handleMultiDownload = useCallback(async () => {
    if (!isSignedIn) {
      openSignIn({ afterSignOutUrl: window.location.href });
      return;
    }
    if (!isSubscribed) {
      openUpgradeModal();
      return;
    }
    const doneItems = multiItemsRef.current.filter((i) => i.composedUrl);
    if (doneItems.length === 0) return;

    const ext = transparentBg ? "png" : format;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    await Promise.all(
      doneItems.map(async (item, index) => {
        const res = await fetch(item.composedUrl!);
        const blob = await res.blob();
        zip.file(`product-${String(index + 1).padStart(2, "0")}.${ext}`, blob);
      })
    );

    const zipBlob = await zip.generateAsync({ type: "blob" });
    triggerFileDownload(URL.createObjectURL(zipBlob), "oneback-images.zip");
  }, [isSignedIn, isSubscribed, openSignIn, format, transparentBg, triggerFileDownload]);

  const handleMultiReset = useCallback(() => {
    setMultiItems([]);
    activeProcessingRef.current.clear();
  }, []);

  const openUpgradeModal = useCallback(() => {
    upgradeModalTriggerRef.current = document.activeElement as HTMLElement;
    setShowUpgradeModal(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setShowUpgradeModal(false);
    setTimeout(() => (upgradeModalTriggerRef.current as HTMLElement)?.focus(), 0);
  }, []);

  const handleMultiRetry = useCallback((id: string) => {
    multiItemsRef.current = multiItemsRef.current.map((i) =>
      i.id === id ? { ...i, stage: "queued" } : i
    );
    setMultiItems([...multiItemsRef.current]);
    startNextMultiItems();
  }, [startNextMultiItems]);

  // ── Derived state ──────────────────────────────────────────────
  const singleIsProcessing =
    singleStage === "removing" ||
    (singleStage === "done" && !composedUrl && !transparentBg);

  const multiHasContent = multiItems.length > 0;
  const multiAllDone = multiItems.length > 0 && multiItems.every((i) => i.stage === "done" || i.stage === "error");
  const multiDoneCount = multiItems.filter((i) => i.composedUrl).length;

  // Shared controls props
  const controlsProps = {
    bgColor,
    aspectRatio,
    padding,
    format,
    transparentBg,
    onBgColor: setBgColor,
    onAspectRatio: setAspectRatio,
    onPadding: setPadding,
    onFormat: setFormat,
  };

  const showSingleActions = singleStage === "done" || singleStage === "error";
  const showMultiActions = multiHasContent;

  return (
    <>
      {/* ─── MOBILE LAYOUT (hidden on md+) ─── */}
      <div className="flex flex-col md:hidden h-[100dvh] bg-[#F1F1F1] relative overflow-hidden">

        {/* Logo — top-left */}
        <Link href="/" className="absolute top-3 left-3 z-10 w-[124px] h-11">
          <OneBackLogo />
        </Link>

        {/* Menu button — top-right */}
        <button
          ref={menuButtonRef}
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir configurações"
          className="absolute top-3 right-3 z-10 w-14 h-14 bg-white flex items-center justify-center"
        >
          <TuneIcon />
        </button>

        {/* Canvas area — Single only on mobile */}
        <div className="flex-1 min-h-0 flex items-center justify-center p-3 overflow-hidden">
          {singleStage === "idle" && <Uploader onFile={handleSingleFile} />}

          {singleStage === "removing" && (
            <div className="w-full max-w-[320px] flex flex-col items-center gap-4">
              {originalDimensions ? (
                <div
                  className="w-full skeleton-shimmer"
                  style={{ aspectRatio: `${originalDimensions.width} / ${originalDimensions.height}` }}
                />
              ) : (
                <div className="skeleton-shimmer w-full aspect-square" />
              )}
            </div>
          )}

          {(singleStage === "done" || singleStage === "error") && (
            <>
              {singleStage === "error" ? (
                <div role="alert" className="flex flex-col items-center gap-4 text-center">
                  <p className="text-sm text-black/60">Não foi possível processar a imagem.</p>
                  <button
                    onClick={handleSingleReset}
                    className="text-xs bg-black text-white px-6 h-9 hover:bg-gray-900 transition-colors"
                  >
                    Tentar com outra imagem
                  </button>
                </div>
              ) : singleIsProcessing ? (
                <div className="w-full max-w-[320px]">
                  {originalDimensions && (
                    <div
                      className="w-full skeleton-shimmer"
                      style={{ aspectRatio: `${originalDimensions.width} / ${originalDimensions.height}` }}
                    />
                  )}
                </div>
              ) : transparentBg && composedUrl ? (
                <img src={composedUrl} alt="Result" className="checkered max-w-full max-h-full object-contain shadow-sm" />
              ) : composedUrl ? (
                <img src={composedUrl} alt="Result" className="max-w-full max-h-full object-contain shadow-sm" />
              ) : null}
            </>
          )}
        </div>

        {/* Bottom actions bar — only when done */}
        {singleStage === "done" && (
          <div className="bg-white p-6 flex flex-col gap-5 border-t border-[#e5e5e5] shrink-0">
            <div className="flex items-center justify-between">
              <p className="text-sm text-black">Export without background</p>
              <Toggle value={transparentBg} onChange={setTransparentBg} label="Exportar sem fundo" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSingleReset}
                className="flex-1 h-14 text-sm border-2 border-black text-black hover:bg-gray-50 transition-colors"
              >
                Start over
              </button>
              <button
                onClick={handleSingleDownload}
                disabled={!composedUrl || singleIsProcessing}
                className="flex-1 h-14 text-sm bg-black text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-900 transition-colors"
              >
                {isSignedIn ? "Download" : "Login para baixar"}
              </button>
            </div>
          </div>
        )}

        {/* Slide-in menu overlay */}
        {mobileMenuOpen && (
          <MobileMenu
            {...controlsProps}
            onClose={() => {
              setMobileMenuOpen(false);
              setTimeout(() => menuButtonRef.current?.focus(), 0);
            }}
          />
        )}
      </div>

      {/* ─── DESKTOP LAYOUT (hidden on mobile) ─── */}
      <div className="hidden md:flex h-screen bg-[#F1F1F1]">

        {/* Canvas */}
        <main id="main-content" className="flex-1 relative overflow-hidden">

          {/* Logo — always visible */}
          <Link href="/" aria-label="OneBack — página inicial" className="absolute top-3 left-3 z-10 w-[124px] h-11">
            <OneBackLogo />
          </Link>

          {/* Single / Multi tabs — centered top */}
          <div role="group" aria-label="Modo de processamento" className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white p-1 flex">
            <button
              onClick={() => setMode("single")}
              aria-pressed={mode === "single"}
              className={`text-xs px-5 h-9 transition-colors ${
                mode === "single" ? "bg-black text-white" : "text-black hover:bg-gray-50"
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setMode("multi")}
              aria-pressed={mode === "multi"}
              className={`text-xs px-5 h-9 transition-colors ${
                mode === "multi" ? "bg-black text-white" : "text-black hover:bg-gray-50"
              }`}
            >
              Multi
            </button>
          </div>

          {/* ── SINGLE MODE ── */}
          {mode === "single" && (
            <div className="w-full h-full flex items-center justify-center p-6">
              {singleStage === "idle" && <Uploader onFile={handleSingleFile} />}

              {singleStage === "removing" && (
                <div
                  className="skeleton-shimmer shadow-sm"
                  style={{
                    aspectRatio: originalDimensions
                      ? `${originalDimensions.width} / ${originalDimensions.height}`
                      : "1 / 1",
                    maxWidth: "640px",
                    maxHeight: "640px",
                    width: "100%",
                  }}
                />
              )}

              {(singleStage === "done" || singleStage === "error") && (
                <>
                  {singleStage === "error" ? (
                    <div className="flex flex-col items-center gap-4 text-center">
                      <p className="text-sm text-black/60">Não foi possível processar a imagem.</p>
                      <button
                        onClick={handleSingleReset}
                        className="text-xs bg-black text-white px-6 h-9 hover:bg-gray-900 transition-colors"
                      >
                        Tentar com outra imagem
                      </button>
                    </div>
                  ) : singleIsProcessing ? (
                    <div
                      className="skeleton-shimmer shadow-sm"
                      style={{
                        aspectRatio: originalDimensions
                          ? `${originalDimensions.width} / ${originalDimensions.height}`
                          : "1 / 1",
                        maxWidth: "640px",
                        maxHeight: "640px",
                        width: "100%",
                      }}
                    />
                  ) : transparentBg && composedUrl ? (
                    <img src={composedUrl} alt="Result" className="checkered max-w-[640px] max-h-[640px] shadow-sm object-contain" />
                  ) : composedUrl ? (
                    <img src={composedUrl} alt="Result" className="max-w-[640px] max-h-[640px] shadow-sm object-contain" />
                  ) : null}
                </>
              )}
            </div>
          )}

          {/* ── MULTI MODE ── */}
          {mode === "multi" && (
            <>
              {!multiHasContent ? (
                <div className="w-full h-full flex items-center justify-center p-6">
                  <Uploader multiple onFiles={handleMultiFiles} />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-6 text-xs text-black/60 pointer-events-none">
                    <span>1 — Faça upload</span>
                    <span className="text-black/20">→</span>
                    <span>2 — Ajuste o fundo</span>
                    <span className="text-black/20">→</span>
                    <span>3 — Baixe o .zip</span>
                  </div>
                </div>
              ) : (
                <MultiCanvas
                  items={multiItems}
                  aspectRatio={aspectRatio}
                  transparentBg={transparentBg}
                  onRetry={handleMultiRetry}
                />
              )}
            </>
          )}
        </main>

        {/* Sidebar */}
        <div className="w-[329px] shrink-0 p-3 flex flex-col gap-[10px]">
          <AccountArea refreshSignal={downloadRefresh} />

          {/* Controls */}
          <Controls
            bgColor={bgColor}
            aspectRatio={aspectRatio}
            padding={padding}
            format={format}
            transparentBg={transparentBg}
            hasResult={mode === "single" ? !!composedUrl : multiDoneCount > 0}
            isProcessing={mode === "single" ? singleIsProcessing : !multiAllDone}
            showActions={mode === "single" ? showSingleActions : showMultiActions}
            onBgColor={setBgColor}
            onAspectRatio={setAspectRatio}
            onPadding={setPadding}
            onFormat={setFormat}
            onTransparentBg={setTransparentBg}
            onDownload={mode === "single" ? handleSingleDownload : handleMultiDownload}
            onReset={mode === "single" ? handleSingleReset : handleMultiReset}
          />
        </div>
      </div>

      {/* ─── SUBSCRIBED SUCCESS BANNER ─── */}
      {subscribedSuccess && (
        <div role="status" aria-live="polite" className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black text-white text-sm px-6 py-3 shadow-lg">
          Assinatura Pro ativada! Bem-vindo ao Pro.
        </div>
      )}

      {/* ─── UPGRADE MODAL ─── */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
          onClick={closeUpgradeModal}
        >
          <div
            ref={upgradeTrapRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-modal-title"
            className="bg-white w-full max-w-sm p-8 flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <p id="upgrade-modal-title" className="text-base font-medium text-black leading-snug">
                {mode === "multi"
                  ? "Modo Multi requer assinatura Pro"
                  : "Você atingiu o limite mensal"}
              </p>
              <p className="text-sm text-black/60 leading-relaxed">
                {mode === "multi"
                  ? "O download de imagens em lote está disponível apenas para assinantes Pro. Assine para desbloquear o modo Multi e downloads ilimitados."
                  : "Usuários gratuitos podem baixar até 10 imagens por mês. Assine o plano Pro para downloads ilimitados e acesso ao modo Multi."}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleCheckout("monthly")}
                disabled={checkoutLoading !== null}
                aria-busy={checkoutLoading === "monthly"}
                className="w-full h-12 bg-black text-white text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                {checkoutLoading === "monthly" ? "Redirecionando..." : "Pro Mensal — R$ 29/mês"}
              </button>
              <button
                onClick={() => handleCheckout("annual")}
                disabled={checkoutLoading !== null}
                aria-busy={checkoutLoading === "annual"}
                className="w-full h-12 bg-black text-white text-sm hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                {checkoutLoading === "annual" ? "Redirecionando..." : "Pro Anual — R$ 249/ano · 31% off"}
              </button>
              <button
                onClick={closeUpgradeModal}
                className="w-full h-12 border border-[#e5e5e5] text-sm text-black hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
