"use client";

import {
  FieldError,
  UseFormRegisterReturn,
} from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  placeholder?: string;
  registration?: UseFormRegisterReturn;
  error?: FieldError;
};

export default function InputField({
  label,
  type = "text",
  placeholder,
  registration,
  error,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">

      <label className="text-sm font-semibold text-zinc-800">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        {...registration}
        className={`
          h-14
          w-full
          rounded-2xl
          border
          bg-white
          px-5
          text-black
          outline-none
          transition
          focus:ring-4
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
              : "border-zinc-300 focus:border-black focus:ring-black/5"
          }
        `}
      />

      {error && (
        <p className="text-sm text-red-500">
          {error.message}
        </p>
      )}

    </div>
  );
}