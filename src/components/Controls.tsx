"use client";

import { ExportFormat, AspectRatioOption } from "@/lib/compose";

export const ASPECT_RATIOS: { label: string; value: AspectRatioOption }[] = [
  { label: "Original", value: "original" },
  { label: "1:1", value: [1, 1] },
  { label: "4:3", value: [4, 3] },
  { label: "3:4", value: [3, 4] },
  { label: "16:9", value: [16, 9] },
  { label: "9:16", value: [9, 16] },
];

const FORMATS: ExportFormat[] = ["png", "jpg", "webp"];

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 shrink-0 transition-colors overflow-hidden ${value ? "bg-ink" : "bg-border"}`}
    >
      <span
        className={`absolute top-[2px] w-4 h-4 bg-white transition-all ${value ? "left-[22px]" : "left-[2px]"}`}
      />
    </button>
  );
}

function isRatioActive(current: AspectRatioOption, option: AspectRatioOption): boolean {
  if (option === "original") return current === "original";
  if (current === "original") return false;
  return current[0] === option[0] && current[1] === option[1];
}

interface Props {
  bgColor: string;
  aspectRatio: AspectRatioOption;
  padding: number;
  format: ExportFormat;
  transparentBg: boolean;
  hasResult: boolean;
  isProcessing: boolean;
  showActions: boolean;
  onBgColor: (v: string) => void;
  onAspectRatio: (v: AspectRatioOption) => void;
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
  showActions,
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
          <label htmlFor="ctrl-bg-color" className="block text-xs uppercase tracking-[0.1em] text-black/60 mb-5">
            Background
          </label>
          <div className="flex items-center gap-2">
            <input
              id="ctrl-bg-color"
              type="color"
              value={pickerValue}
              onChange={(e) => onBgColor(e.target.value)}
              className="w-9 h-9 shrink-0 border border-border cursor-pointer"
            />
            <div className={`flex-1 min-w-0 flex items-center border h-9 px-3 gap-1 ${
              isValidHex || bgColor === "" ? "border-border" : "border-red-300"
            }`}>
              <span aria-hidden="true" className="text-sm text-black/60 select-none">#</span>
              <label htmlFor="ctrl-bg-hex" className="sr-only">Hex da cor de fundo</label>
              <input
                id="ctrl-bg-hex"
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
          <p id="ctrl-aspect-label" className="text-xs uppercase tracking-[0.1em] text-black/60 mb-5">
            Aspect Ratio
          </p>
          <div role="group" aria-labelledby="ctrl-aspect-label" className="flex gap-2 flex-wrap">
            {ASPECT_RATIOS.map(({ label, value }) => {
              const active = isRatioActive(aspectRatio, value);
              return (
                <button
                  key={label}
                  onClick={() => onAspectRatio(value)}
                  aria-pressed={active}
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
            <label htmlFor="ctrl-padding" className="text-xs uppercase tracking-[0.1em] text-black/60">Padding</label>
            <span aria-hidden="true" className="text-sm font-medium uppercase">{padding}%</span>
          </div>
          <input
            id="ctrl-padding"
            type="range"
            min={0}
            max={40}
            step={1}
            value={padding}
            aria-valuetext={`${padding}%`}
            onChange={(e) => onPadding(Number(e.target.value))}
            className="w-full"
          />
          <div aria-hidden="true" className="flex justify-between mt-1">
            <span className="text-xs text-black/60 uppercase tracking-[0.1em]">0%</span>
            <span className="text-xs text-black/60 uppercase tracking-[0.1em]">40%</span>
          </div>
        </section>

        {/* Export Format */}
        <section className={`px-6 py-8 border-t border-border ${transparentBg ? "opacity-30 pointer-events-none" : ""}`}>
          <p id="ctrl-format-label" className="text-xs uppercase tracking-[0.1em] text-black/60 mb-5">
            Export Format
          </p>
          <div role="group" aria-labelledby="ctrl-format-label" className="flex gap-2 flex-wrap">
            {FORMATS.map((f) => (
              <button
                key={f}
                onClick={() => onFormat(f)}
                aria-pressed={format === f}
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
      {showActions && <div className="p-6 border-t border-border flex flex-col gap-5">
        {/* Transparent PNG toggle */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink">Export without background</p>
          <Toggle value={transparentBg} onChange={onTransparentBg} label="Exportar sem fundo" />
        </div>
        <div className="flex gap-2">
          {hasResult && (
            <button
              onClick={onReset}
              className="flex-1 h-12 text-sm border-2 border-ink text-ink hover:bg-gray-50 transition-colors"
            >
              Start over
            </button>
          )}
          <button
            onClick={onDownload}
            disabled={!hasResult || isProcessing}
            className="flex-1 h-12 text-sm bg-ink text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-900 transition-colors"
          >
            Download all
          </button>
        </div>
      </div>}
    </aside>
  );
}
