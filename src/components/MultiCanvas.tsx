"use client";

import { MultiItem } from "@/lib/types";
import { AspectRatioOption } from "@/lib/compose";
import ImageCard from "./ImageCard";

const COLUMNS = 3;

interface Props {
  items: MultiItem[];
  aspectRatio: AspectRatioOption;
  transparentBg: boolean;
  onRetry?: (id: string) => void;
}

export default function MultiCanvas({ items, aspectRatio, transparentBg, onRetry }: Props) {
  // Distribute items across 3 columns in round-robin order
  const columns: MultiItem[][] = [[], [], []];
  items.forEach((item, i) => columns[i % COLUMNS].push(item));

  const doneCount = items.filter((i) => i.stage === "done").length;

  return (
    <div className="w-full h-full overflow-y-auto pt-[80px] pb-8 px-8">
      <div className="relative">
        {/* Image counter */}
        {items.length > 0 && (
          <p className="absolute right-0 -top-7 text-sm text-black/50 leading-none">
            {doneCount < items.length
              ? `${doneCount} / ${items.length} imagens`
              : `${items.length} ${items.length === 1 ? "imagem" : "imagens"}`}
          </p>
        )}

        {/* 3-column masonry grid */}
        <div className="flex gap-[10px] items-start">
          {columns.map((col, ci) => (
            <div key={ci} className="flex-1 flex flex-col gap-[10px]">
              {col.map((item) => (
                <ImageCard
                  key={item.id}
                  stage={item.stage}
                  naturalWidth={item.naturalWidth}
                  naturalHeight={item.naturalHeight}
                  composedUrl={item.composedUrl}
                  transparentBg={transparentBg}
                  aspectRatio={aspectRatio}
                  onRetry={onRetry ? () => onRetry(item.id) : undefined}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
