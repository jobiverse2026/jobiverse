"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, FileCheck2, UploadCloud } from "lucide-react";

type Props = {
  name?: string;
  label: string;
  buttonLabel?: string;
  accept: string;
  hint: string;
  maxSizeMb?: number;
  pdfOnly?: boolean;
  existingMessage?: string;
  existingUrl?: string | null;
  onFileSelect?: (file: File | null) => void;
};

export default function FileUploadField({ name, label, buttonLabel = "Upload File", accept, hint, maxSizeMb = 5, pdfOnly = false, existingMessage, existingUrl, onFileSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl ?? null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  function select(file?: File) {
    setError(null);
    if (!file) return;
    if (pdfOnly && file.type !== "application/pdf") {
      setError("Please choose a PDF file.");
      if (inputRef.current) inputRef.current.value = "";
      onFileSelect?.(null);
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File size must be ${maxSizeMb} MB or less.`);
      if (inputRef.current) inputRef.current.value = "";
      onFileSelect?.(null);
      return;
    }
    setFileName(file.name);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    setPreviewUrl(objectUrlRef.current);
    onFileSelect?.(file);
  }

  function drop(file?: File) {
    if (!file) return;
    select(file);
    if (inputRef.current) {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      inputRef.current.files = transfer.files;
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center transition hover:border-zinc-500 hover:bg-white" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); drop(event.dataTransfer.files?.[0]); }}>
      <input ref={inputRef} name={name} type="file" accept={accept} onChange={(event) => select(event.target.files?.[0])} className="sr-only" />
      <UploadCloud className="mx-auto text-zinc-400" size={28} />
      <p className="mt-3 font-semibold text-zinc-900">{label}</p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
      <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-black via-zinc-800 to-zinc-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">
        <UploadCloud size={16} />{fileName ? "Choose Another File" : buttonLabel}
      </button>
      {previewUrl && <a href={previewUrl} target="_blank" rel="noreferrer" className="ml-2 mt-5 inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:border-zinc-500"><ExternalLink size={16} />View File</a>}
      {fileName && <p className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-emerald-600"><FileCheck2 size={16} />{fileName}</p>}
      {!fileName && existingMessage && <p className="mt-3 text-xs text-emerald-600">{existingMessage}</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[.15em] text-zinc-400">Drag and drop also supported</p>
    </div>
  );
}
