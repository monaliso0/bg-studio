"use client";

import { ExportFormat } from "@/lib/compose";

export const ASPECT_RATIOS: { label: string; value: [number, number] }[] = [
  { label: "1:1", value: [1, 1] },
  { label: "4:3", value: [4, 3] },
  { label: "3:4", value: [3, 4] },
  { label: "16:9", value: [16, 9] },
  { label: "9:16", value: [9, 16] },
];

const FORMATS: ExportFormat[] = ["png", "jpg", "webp"];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 shrink-0 transition-colors overflow-hidden ${value ? "bg-ink" : "bg-border"}`}
    >
      <span
        className={`absolute top-[2px] w-4 h-4 bg-white transition-all ${value ? "left-[22px]" : "left-[2px]"}`}
      />
    </button>
  );
}

interface Props {
  bgColor: string;
  aspectRatio: [number, number];
  padding: number;
  format: ExportFormat;
  transparentBg: boolean;
  hasResult: boolean;
  isProcessing: boolean;
  onBgColor: (v: string) => void;
  onAspectRatio: (v: [number, number]) => void;
  onPadding: (v: number) => void;
  onFormat: (v: ExportFormat) => void;
  onTransparentBg: (v: boolean) => void;
  onDownload: () => void;
  onReset: () => void;
}

export default function Controls({
  bgColor,
  aspectRatio,
  padding,
  format,
  transparentBg,
  hasResult,
  isProcessing,
  onBgColor,
  onAspectRatio,
  onPadding,
  onFormat,
  onTransparentBg,
  onDownload,
  onReset,
}: Props) {
  const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(bgColor);
  const pickerValue = isValidHex ? bgColor : "#FAFAFA";
  const hexDisplay = bgColor.startsWith("#") ? bgColor.slice(1) : bgColor;

  return (
    <aside className="bg-white h-full flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">

        {/* Background Color */}
        <section className={`px-6 py-8 ${transparentBg ? "opacity-30 pointer-events-none" : ""}`}>
          <label className="block text-xs uppercase tracking-[0.1em] text-black/50 mb-5">
            Background
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={pickerValue}
              onChange={(e) => onBgColor(e.target.value)}
              className="w-9 h-9 shrink-0 border border-border cursor-pointer"
            />
            <div className={`flex-1 flex items-center border h-9 px-3 gap-1 ${
              isValidHex || bgColor === "" ? "border-border" : "border-red-300"
            }`}>
              <span className="text-sm text-black/50 select-none">#</span>
              <input
                type="text"
                value={hexDisplay}
                maxLength={6}
                onChange={(e) => onBgColor("#" + e.target.value.replace("#", ""))}
                placeholder="FAFAFA"
                className="flex-1 text-sm outline-none min-w-0"
              />
            </div>
          </div>
        </section>

        {/* Aspect Ratio */}
        <section className="px-6 py-8 border-t border-border">
          <label className="block text-xs uppercase tracking-[0.1em] text-black/50 mb-5">
            Aspect Ratio
          </label>
          <div className="flex gap-2 flex-wrap">
            {ASPECT_RATIOS.map(({ label, value }) => {
              const active = aspectRatio[0] === value[0] && aspectRatio[1] === value[1];
              return (
                <button
                  key={label}
                  onClick={() => onAspectRatio(value)}
                  className={`text-xs px-3 h-7 border transition-colors ${
                    active
                      ? "border-ink bg-ink text-white"
                      : "border-border text-ink hover:border-ink"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Padding */}
        <section className="px-6 py-8 border-t border-border">
          <div className="flex justify-between items-center mb-5">
            <label className="text-xs uppercase tracking-[0.1em] text-black/50">Padding</label>
            <span className="text-sm font-medium uppercase">{padding}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={padding}
            onChange={(e) => onPadding(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-black/50 uppercase tracking-[0.1em]">0%</span>
            <span className="text-xs text-black/50 uppercase tracking-[0.1em]">40%</span>
          </div>
        </section>

        {/* Export Format */}
        <section className={`px-6 py-8 border-t border-border ${transparentBg ? "opacity-30 pointer-events-none" : ""}`}>
          <label className="block text-xs uppercase tracking-[0.1em] text-black/50 mb-5">
            Export Format
          </label>
          <div className="flex gap-2 flex-wrap">
            {FORMATS.map((f) => (
              <button
                key={f}
                onClick={() => onFormat(f)}
                className={`text-xs px-3 h-7 border uppercase tracking-wider transition-colors ${
                  format === f
                    ? "border-ink bg-ink text-white"
                    : "border-border text-ink hover:border-ink"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </section>


      </div>

      {/* Actions */}
      <div className="p-5 border-t border-border flex flex-col gap-1">
        {/* Transparent PNG toggle */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-ink">Export without background</p>
          <Toggle value={transparentBg} onChange={onTransparentBg} />
        </div>
        <button
          onClick={onDownload}
          disabled={!hasResult || isProcessing}
          className="w-full h-12 text-sm bg-ink text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-900 transition-colors"
        >
          Download
        </button>
        {hasResult && (
          <button
            onClick={onReset}
            className="w-full h-12 text-sm text-ink hover:text-muted transition-colors"
          >
            Start over
          </button>
        )}
      </div>
    </aside>
  );
}
