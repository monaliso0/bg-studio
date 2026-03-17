"use client";

import { MultiItemStage } from "@/lib/types";
import { AspectRatioOption } from "@/lib/compose";

interface Props {
  stage: MultiItemStage;
  naturalWidth: number;
  naturalHeight: number;
  composedUrl: string | null;
  transparentBg: boolean;
  aspectRatio: AspectRatioOption;
  onRetry?: () => void;
}

export default function ImageCard({
  stage,
  naturalWidth,
  naturalHeight,
  composedUrl,
  transparentBg,
  aspectRatio,
  onRetry,
}: Props) {
  // The aspect ratio to display in the card
  const displayRatio =
    aspectRatio === "original"
      ? `${naturalWidth} / ${naturalHeight}`
      : `${aspectRatio[0]} / ${aspectRatio[1]}`;

  if (stage === "done" && composedUrl) {
    return (
      <div style={{ aspectRatio: displayRatio }} className="w-full overflow-hidden bg-white">
        <img
          src={composedUrl}
          alt=""
          className={`w-full h-full object-contain ${transparentBg ? "checkered" : ""}`}
        />
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div
        role="alert"
        style={{ aspectRatio: `${naturalWidth} / ${naturalHeight}` }}
        className="w-full bg-[#f5f5f5] flex flex-col items-center justify-center gap-3"
      >
        <p className="text-xs text-black/40">Erro ao processar</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs text-black border border-black/20 px-3 h-7 hover:bg-black hover:text-white transition-colors"
          >
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  // Skeleton: always at the file's natural aspect ratio while loading/queued
  return (
    <div
      style={{ aspectRatio: `${naturalWidth} / ${naturalHeight}` }}
      className="w-full skeleton-shimmer"
    />
  );
}
