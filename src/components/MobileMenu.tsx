"use client";

import { ExportFormat, AspectRatioOption } from "@/lib/compose";
import { ASPECT_RATIOS } from "./Controls";
import { useFocusTrap } from "@/lib/useFocusTrap";

const FORMATS: ExportFormat[] = ["png", "jpg", "webp"];

function isRatioActive(current: AspectRatioOption, option: AspectRatioOption): boolean {
  if (option === "original") return current === "original";
  if (current === "original") return false;
  return current[0] === option[0] && current[1] === option[1];
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="white" />
    </svg>
  );
}

interface MobileMenuProps {
  bgColor: string;
  aspectRatio: AspectRatioOption;
  padding: number;
  format: ExportFormat;
  transparentBg: boolean;
  onBgColor: (v: string) => void;
  onAspectRatio: (v: AspectRatioOption) => void;
  onPadding: (v: number) => void;
  onFormat: (v: ExportFormat) => void;
  onClose: () => void;
}

export default function MobileMenu({
  bgColor,
  aspectRatio,
  padding,
  format,
  transparentBg,
  onBgColor,
  onAspectRatio,
  onPadding,
  onFormat,
  onClose,
}: MobileMenuProps) {
  const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(bgColor);
  const pickerValue = isValidHex ? bgColor : "#FAFAFA";
  const hexDisplay = bgColor.startsWith("#") ? bgColor.slice(1) : bgColor;

  const trapRef = useFocusTrap(true, onClose);

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-menu-title"
      className="fixed inset-0 z-50 bg-[#eaeaea] p-3"
    >
      <div className="bg-white w-full h-full flex flex-col overflow-hidden">

        {/* Header */}
        <div className="relative h-[80px] shrink-0">
          <p id="mobile-menu-title" className="absolute left-5 top-4 text-[20px] font-semibold text-black leading-normal">Menu</p>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="absolute top-0 right-0 w-14 h-14 bg-black flex items-center justify-center"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">

          {/* Background */}
          <section className={`px-6 py-8 flex flex-col gap-5 ${transparentBg ? "opacity-30 pointer-events-none" : ""}`}>
            <label htmlFor="mob-bg-color" className="text-[12px] uppercase tracking-[1.2px] text-black/60 font-normal">
              Background
            </label>
            <div className="flex items-center gap-2">
              <input
                id="mob-bg-color"
                type="color"
                value={pickerValue}
                onChange={(e) => onBgColor(e.target.value)}
                className="w-11 h-11 shrink-0 border border-[#e5e5e5] cursor-pointer"
              />
              <div className={`flex-1 min-w-0 flex items-center border h-11 px-3 gap-1 ${
                isValidHex || bgColor === "" ? "border-[#e5e5e5]" : "border-red-300"
              }`}>
                <span aria-hidden="true" className="text-[14px] text-black/60 select-none leading-none">#</span>
                <label htmlFor="mob-bg-hex" className="sr-only">Hex da cor de fundo</label>
                <input
                  id="mob-bg-hex"
                  type="text"
                  value={hexDisplay}
                  maxLength={6}
                  onChange={(e) => onBgColor("#" + e.target.value.replace("#", ""))}
                  placeholder="FAFAFA"
                  className="flex-1 text-[14px] outline-none min-w-0 leading-none"
                />
              </div>
            </div>
          </section>

          {/* Aspect Ratio */}
          <section className="px-6 py-8 border-t border-[#e5e5e5] flex flex-col gap-5">
            <p id="mob-aspect-label" className="text-[12px] uppercase tracking-[1.2px] text-black/60 font-normal">
              Aspect Ratio
            </p>
            <div role="group" aria-labelledby="mob-aspect-label" className="flex gap-2 flex-wrap">
              {ASPECT_RATIOS.map(({ label, value }) => {
                const active = isRatioActive(aspectRatio, value);
                return (
                  <button
                    key={label}
                    onClick={() => onAspectRatio(value)}
                    aria-pressed={active}
                    className={`text-[12px] px-6 h-11 border transition-colors ${
                      active
                        ? "border-black bg-black text-white"
                        : "border-[#e5e5e5] text-black"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Padding */}
          <section className="px-6 py-8 border-t border-[#e5e5e5] flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <label htmlFor="mob-padding" className="text-[12px] uppercase tracking-[1.2px] text-black/60 font-normal">Padding</label>
              <span aria-hidden="true" className="text-[14px] font-medium uppercase text-black">{padding}%</span>
            </div>
            <div className="flex flex-col">
              <input
                id="mob-padding"
                type="range"
                min={0}
                max={40}
                step={1}
                value={padding}
                aria-valuetext={`${padding}%`}
                onChange={(e) => onPadding(Number(e.target.value))}
                className="w-full mobile-range"
              />
              <div aria-hidden="true" className="flex justify-between">
                <span className="text-[12px] text-black/60 uppercase tracking-[1.2px]">0%</span>
                <span className="text-[12px] text-black/60 uppercase tracking-[1.2px]">40%</span>
              </div>
            </div>
          </section>

          {/* Export Format */}
          <section className={`px-6 py-8 border-t border-[#e5e5e5] flex flex-col gap-5 ${transparentBg ? "opacity-30 pointer-events-none" : ""}`}>
            <p id="mob-format-label" className="text-[12px] uppercase tracking-[1.2px] text-black/60 font-normal">
              Export Format
            </p>
            <div role="group" aria-labelledby="mob-format-label" className="flex gap-2 flex-wrap">
              {FORMATS.map((f) => (
                <button
                  key={f}
                  onClick={() => onFormat(f)}
                  aria-pressed={format === f}
                  className={`text-[12px] px-6 h-11 border uppercase tracking-wider transition-colors ${
                    format === f
                      ? "border-black bg-black text-white"
                      : "border-[#e5e5e5] text-black"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
