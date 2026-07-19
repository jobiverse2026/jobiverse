"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import { useSearchParams } from "next/navigation";

function ForgotPasswordContent() {
  const supabase = createBrowserSupabaseClient();
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role");
  const role = ["candidate", "employer", "recruiter", "admin", "creator"].includes(requestedRole ?? "") ? requestedRole : "candidate";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/recovery?role=${role}`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Password reset link has been sent to your email."
    );

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">

      <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-xl">

        <div className="mb-8 flex justify-center">
          <Logo />
        </div>


        <h1 className="text-center text-3xl font-bold text-zinc-900">
          Forgot Password?
        </h1>


        <p className="mt-3 text-center text-sm text-zinc-500">
          Enter your email and we will send you a reset link.
        </p>


        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email Address
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
            />

          </div>


          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}


          {message && (
            <div className="rounded-xl bg-green-50 p-3 text-sm text-green-600">
              {message}
            </div>
          )}


        <Button
  type="submit"
  disabled={loading}
  className="w-full rounded-xl"
>
  {loading
    ? "Sending..."
    : "Send Reset Link"}
</Button>


        </form>


        <div className="mt-6 text-center text-sm">

          <Link
            href={`/login/${role}`}
            className="font-medium hover:underline"
          >
            Back to Login
          </Link>

        </div>


      </div>

    </main>
  );
}

export default function ForgotPasswordPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-zinc-50"><div className="h-96 w-full max-w-md animate-pulse rounded-3xl bg-white shadow-xl"/></main>}><ForgotPasswordContent/></Suspense>;
}
