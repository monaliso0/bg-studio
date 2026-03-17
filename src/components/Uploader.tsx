"use client";

import { useCallback, useState } from "react";

interface Props {
  onFile?: (file: File) => void;
  onFiles?: (files: File[]) => void;
  multiple?: boolean;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

function UploadIcon() {
  return (
    <svg aria-hidden="true" focusable="false" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.33333 14.6667H6.66667V25.3333H25.3333V14.6667H22.6667V12H28V28H4V12H9.33333V14.6667Z" fill="#999999"/>
      <path d="M17.3334 9.10417L20.3907 12.1615L22.2761 10.276L16 4L9.724 10.276L11.6094 12.1615L14.6667 9.10417V23.2188H17.3334V9.10417Z" fill="#999999"/>
    </svg>
  );
}

export default function Uploader({ onFile, onFiles, multiple = false }: Props) {
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) return;
      const valid = Array.from(fileList).filter((f) => ACCEPTED.includes(f.type));
      if (!valid.length) return;

      if (multiple && onFiles) {
        onFiles(valid);
      } else if (onFile) {
        onFile(valid[0]);
      }
    },
    [multiple, onFile, onFiles]
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
      className={`flex flex-col items-center justify-center w-full h-full cursor-pointer relative transition-colors ${
        dragging ? "bg-black/5" : ""
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        multiple={multiple}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Center: icon + text */}
      <div className="flex flex-col items-center gap-5 pointer-events-none">
        <UploadIcon />
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-ink">
            {multiple ? "Solte as imagens aqui ou " : "Solte a imagem aqui ou "}
            <span className="underline">selecione</span>
          </p>
          <p className="text-xs text-muted tracking-[0.36px]">JPG, PNG ou WebP</p>
          {multiple && (
            <p className="text-xs text-black/30">Até 30 imagens · máx. 100 MB no total</p>
          )}
        </div>
      </div>

    </label>
  );
}
