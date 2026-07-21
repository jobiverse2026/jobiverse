"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { loginWithRoleAction } from "@/app/login/actions";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";


type Role = "candidate" | "employer" | "recruiter" | "admin" | "creator";

const roleLabel: Record<Role, string> = {
  candidate: "Candidate portal",
  employer: "Employer workspace",
  recruiter: "Recruiter desk",
  admin: "Admin command centre",
  creator: "Creator studio",
};

const urlErrorMessage: Record<string, string> = {
  wrong_role: "You are not authorized for this portal. Please use the correct JobiVerse login for your account.",
  profile_missing: "Your account exists, but portal access is not assigned yet. Please contact JobiVerse support.",
  oauth_failed: "Secure sign-in could not be completed. Please try again.",
  creator_required: "Creator studio access is available only for creator-enabled candidate accounts.",
};

type Props = {
  role?: Role;
};

export default function LoginCard({ role = "candidate" }: Props) {
  const supabase = createBrowserSupabaseClient();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const verified = searchParams.get("verified") === "1";
  const visibleError = error ?? (urlError ? urlErrorMessage[urlError] ?? "Access could not be completed. Please try again." : null);

  const oauthCallbackUrl = () => {
    const params = new URLSearchParams({ role });
    const requestedNext = searchParams.get("next");
    if (requestedNext?.startsWith("/") && !requestedNext.startsWith("//") && !requestedNext.includes("\\")) params.set("next", requestedNext);
    return `${window.location.origin}/auth/callback?${params.toString()}`;
  };


  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  setError(null);
  setLoading(true);

  try {

    sessionStorage.setItem("jobiverse-browser-session", "active");

    const result = await loginWithRoleAction(
        email,
        password,
        role,
        searchParams.get("next") ?? undefined
      );

    if("error" in result && result.error)throw new Error(result.error);
    if(!result.redirect)throw new Error("Unable to open your dashboard. Please try again.");
    await new Promise((resolve) => window.setTimeout(resolve, 150));
    window.location.replace(result.redirect);


  } catch (error: unknown) {

    setError(error instanceof Error ? error.message : "Unable to log in. Please try again.");

  } finally {

    setLoading(false);

  }
};

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: oauthCallbackUrl(),
      },
    });
  };

  const handleLinkedInLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: {
        redirectTo: oauthCallbackUrl(),
      },
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm"
          >
            <Image
              src="/images/branding/jobiverse-logo.svg"
              alt="JobiVerse"
              width={48}
              height={48}
              priority
            />
          </motion.div>
          <span className="rounded-full bg-zinc-950 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-white">Secure access</span>
        </div>

        <div className="text-center">
          <span className="mb-4 inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
            {roleLabel[role]}
          </span>
          <h2 className="text-3xl font-semibold tracking-[-.035em]">Welcome back</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Login to your JobiVerse account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              size={18}
            />
            <input
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trimStart())}
              required
              className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-12 outline-none transition focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/5"
            />
          </div>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-12 pr-12 outline-none transition focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/5"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {visibleError && (
            <p className="text-sm text-red-600" role="alert">
              {visibleError}
            </p>
          )}
          {!visibleError && verified && (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800" role="status">
              Email verified successfully. Please log in once to open your JobiVerse dashboard.
            </p>
          )}

          <div className="flex justify-between text-sm">
            <label className="flex cursor-pointer gap-2 text-zinc-500">
              <input type="checkbox" className="cursor-pointer" />
              Remember me
            </label>

            <Link
    href={`/forgot-password?role=${role}`}
              className="cursor-pointer font-medium text-zinc-950 underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-zinc-950 font-semibold text-white shadow-xl shadow-black/20 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Continue"}
            <ArrowRight size={18} className="transition group-hover:translate-x-2" />
          </motion.button>
        </form>

        <div className="flex items-center gap-3"><span className="h-px flex-1 bg-zinc-200"/><span className="text-[10px] font-bold uppercase tracking-[.16em] text-zinc-400">or continue securely</span><span className="h-px flex-1 bg-zinc-200"/></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="group flex min-h-14 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 px-4 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-lg"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full border border-zinc-100 bg-white text-base font-black text-blue-600 shadow-sm transition group-hover:scale-105">G</span>Google
          </button>

          <button
            onClick={handleLinkedInLogin}
            type="button"
            className="group flex min-h-14 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 px-4 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0a66c2] text-sm font-black text-white shadow-sm transition group-hover:scale-105">in</span>LinkedIn
          </button>
        </div>

        {(role === "candidate" || role === "employer" || role === "recruiter" || role === "creator") && <p className="text-center text-sm text-zinc-500">
          New to JobiVerse?{" "}
          <Link
            href={`/signup?role=${role}`}
            className="cursor-pointer font-semibold text-zinc-950"
          >
            Create account
          </Link>
        </p>}
      </div>
    </motion.div>
  );
}
