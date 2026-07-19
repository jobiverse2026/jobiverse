"use client";

import { Suspense, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function ResetPasswordContent() {
 
    const supabase = createBrowserSupabaseClient();
const router = useRouter();
const searchParams = useSearchParams();
const requestedRole = searchParams.get("role");
const role = ["candidate", "employer", "recruiter", "admin", "creator"].includes(requestedRole ?? "") ? requestedRole : "candidate";

const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState("");

useEffect(() => {
  const checkSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError(
        "Invalid or expired reset link. Please request a new one."
      );
    }
  };

  checkSession();
}, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError("Password must contain at least 8 characters, including a letter and a number.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage("Password updated successfully.");

await supabase.auth.signOut();

router.replace(`/login/${role}?password_updated=1`);

router.refresh();

setLoading(false);
  }


  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">

      <div className="w-full max-w-md rounded-3xl border bg-white p-8 shadow-xl">

        <div className="mb-8 flex justify-center">
          <Logo />
        </div>


        <h1 className="text-center text-3xl font-bold">
          Reset Password
        </h1>


        <p className="mt-3 text-center text-sm text-zinc-500">
          Create your new password.
        </p>


        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          <input
            type="password"
            required
            placeholder="New Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
          />


          <input
            type="password"
            required
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            className="w-full rounded-xl border px-4 py-3"
          />


          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}


          {message && (
            <p className="text-sm text-green-600">
              {message}
            </p>
          )}


          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl"
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </Button>


        </form>

      </div>

    </main>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-zinc-50"><div className="h-96 w-full max-w-md animate-pulse rounded-3xl bg-white shadow-xl"/></main>}><ResetPasswordContent/></Suspense>;
}
