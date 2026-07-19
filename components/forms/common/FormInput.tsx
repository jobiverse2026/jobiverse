"use client";

import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface FormInputProps {
  label: string;
  placeholder?: string;
  type?: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
}

export default function FormInput({
  label,
  placeholder,
  type = "text",
  registration,
  error,
}: FormInputProps) {
  return (
    <div className="flex flex-col">

      <label className="mb-2 text-sm font-semibold text-zinc-700">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        {...registration}
        className={`
          h-14
          rounded-2xl
          border
          px-5
          outline-none
          transition-all
          ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-zinc-300 focus:border-black"
          }
        `}
      />

      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error.message}
        </p>
      )}

    </div>
  );
}