"use client";

import { useCallback, useState } from "react";

interface Props {
  onFile: (file: File) => void;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export default function Uploader({ onFile }: Props) {
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const file = files[0];
      if (!ACCEPTED.includes(file.type)) return;
      onFile(file);
    },
    [onFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <label
      className={`flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors ${
        dragging ? "bg-gray-50" : ""
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <svg
        className="w-8 h-8 mb-4 text-muted"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 16V8m0 0-3 3m3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 15v3a2 2 0 002 2h14a2 2 0 002-2v-3" strokeLinecap="round" />
      </svg>
      <p className="text-sm text-ink">Drop image here or <span className="underline">browse</span></p>
      <p className="text-xs text-muted mt-1">JPG, PNG or WebP</p>
    </label>
  );
}
