"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Controls from "@/components/Controls";
import Uploader from "@/components/Uploader";
import { composeImage, type ComposeOptions, type ExportFormat } from "@/lib/compose";

type Stage = "idle" | "removing" | "done" | "error";

const DEFAULT_BG = "#FAFAFA";
const DEFAULT_RATIO: [number, number] = [1, 1];
const DEFAULT_PADDING = 10;
const DEFAULT_FORMAT: ExportFormat = "png";

export default function Home() {
  const [stage, setStage] = useState<Stage>("idle");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [composedUrl, setComposedUrl] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [bgColor, setBgColor] = useState(DEFAULT_BG);
  const [aspectRatio, setAspectRatio] = useState<[number, number]>(DEFAULT_RATIO);
  const [padding, setPadding] = useState(DEFAULT_PADDING);
  const [format, setFormat] = useState<ExportFormat>(DEFAULT_FORMAT);
  const [transparentBg, setTransparentBg] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const originalUrlRef = useRef<string | null>(null);

  // Create object URL for transparent preview
  useEffect(() => {
    if (!processedBlob) { setProcessedUrl(null); return; }
    const url = URL.createObjectURL(processedBlob);
    setProcessedUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [processedBlob]);

  // Recompose whenever settings or processed blob changes
  useEffect(() => {
    if (!processedBlob) return;
    const valid = /^#[0-9A-Fa-f]{6}$/.test(bgColor);
    if (!valid && !transparentBg) return;

    const options: ComposeOptions = { bgColor, aspectRatio, padding, format, transparent: transparentBg };
    composeImage(processedBlob, options).then(setComposedUrl);
  }, [processedBlob, bgColor, aspectRatio, padding, format, transparentBg]);

  const handleFile = useCallback(async (file: File) => {
    // Revoke previous object URL
    if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);

    const url = URL.createObjectURL(file);
    originalUrlRef.current = url;
    setOriginalUrl(url);
    setStage("removing");
    setErrorMsg("");
    setShowOriginal(false);

    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(file, {
        output: { format: "image/png", quality: 1 },
      });
      setProcessedBlob(blob);
      setStage("done");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to process image. Please try again.");
      setStage("error");
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!composedUrl) return;
    const a = document.createElement("a");
    a.href = composedUrl;
    a.download = transparentBg ? "product.png" : `product.${format}`;
    a.click();
  }, [composedUrl, format, transparentBg]);

  const handleReset = useCallback(() => {
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = null;
    }
    setStage("idle");
    setOriginalUrl(null);
    setProcessedBlob(null);
    setProcessedUrl(null);
    setComposedUrl(null);
    setShowOriginal(false);
    setErrorMsg("");
  }, []);

  const isProcessing = stage === "removing" || (stage === "done" && !composedUrl && !transparentBg);

  return (
    <div className="flex h-screen bg-[#eaeaea]">
      {/* Canvas */}
      <main className="flex-1 relative p-3 flex items-center justify-center overflow-hidden">
        {stage === "idle" && <Uploader onFile={handleFile} />}

        {stage === "removing" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-5 h-5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted">Removing background…</p>
            <p className="text-xs text-muted">This may take a moment on first use</p>
          </div>
        )}

        {(stage === "done" || stage === "error") && (
          <>
            {/* Preview toggle — absolute top-left */}
            {stage === "done" && originalUrl && (
              <div className="absolute top-3 left-3 z-10 bg-white p-1 flex">
                <button
                  onClick={() => setShowOriginal(false)}
                  className={`text-xs px-5 h-9 transition-colors ${
                    !showOriginal ? "bg-ink text-white" : "text-ink hover:bg-gray-50"
                  }`}
                >
                  Result
                </button>
                <button
                  onClick={() => setShowOriginal(true)}
                  className={`text-xs px-5 h-9 transition-colors ${
                    showOriginal ? "bg-ink text-white" : "text-ink hover:bg-gray-50"
                  }`}
                >
                  Original
                </button>
              </div>
            )}

            {stage === "error" ? (
              <div className="text-center">
                <p className="text-sm text-red-500 mb-3">{errorMsg}</p>
                <button
                  onClick={handleReset}
                  className="text-xs underline text-muted hover:text-ink"
                >
                  Try again
                </button>
              </div>
            ) : showOriginal && originalUrl ? (
              <img
                src={originalUrl}
                alt="Original"
                className="max-w-[640px] max-h-[640px]"
              />
            ) : isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-5 h-5 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-muted">Composing…</p>
              </div>
            ) : transparentBg && composedUrl ? (
              <img src={composedUrl} alt="Result (transparent)" className="checkered max-w-[640px] max-h-[640px] shadow-sm" />
            ) : composedUrl ? (
              <img src={composedUrl} alt="Result" className="max-w-[640px] max-h-[640px] shadow-sm" />
            ) : null}
          </>
        )}
      </main>

      {/* Sidebar */}
      <div className="w-[329px] shrink-0 p-3">
        <Controls
          bgColor={bgColor}
          aspectRatio={aspectRatio}
          padding={padding}
          format={format}
          transparentBg={transparentBg}
          hasResult={!!composedUrl}
          isProcessing={isProcessing}
          onBgColor={setBgColor}
          onAspectRatio={setAspectRatio}
          onPadding={setPadding}
          onFormat={setFormat}
          onTransparentBg={setTransparentBg}
          onDownload={handleDownload}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
