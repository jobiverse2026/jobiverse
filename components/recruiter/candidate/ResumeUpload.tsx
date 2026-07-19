"use client";

import FileUploadField from "@/components/common/FileUploadField";

export default function ResumeUpload({ onFileSelect }: { onFileSelect: (file: File | null) => void }) {
  return <FileUploadField label="Candidate Resume" buttonLabel="Upload Resume" accept="application/pdf,.pdf" hint="PDF only | Maximum 5 MB" pdfOnly onFileSelect={onFileSelect} />;
}




