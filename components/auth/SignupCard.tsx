"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { confirmSignupUser, hasPendingEmployerTeamInvite, requiresEmailConfirmation } from "@/app/signup/actions";

type Role = "candidate" | "employer" | "recruiter" | "admin" | "creator";

const roleRedirect: Record<Role, string> = {
  candidate: "/candidates/dashboard",
  employer: "/employers/dashboard",
  recruiter: "/recruiter",
  admin: "/login/admin",
  creator: "/earn-with-jobiverse/dashboard",
};

function authErrorMessage(error: unknown) {
  if (!error) return "Unable to create account. Please try again.";
  if (error instanceof Error) {
    if (error.name === "AuthRetryableFetchError") {
      return "Signup service could not be reached right now. Please check Supabase Auth SMTP settings, Brevo sender verification, and internet connection, then try again.";
    }
    if (error.message) return error.message;
  }
  if (typeof error === "string" && error.trim()) return error;
  if (typeof error === "object") {
    const details = error as {
      name?: unknown;
      message?: unknown;
      error?: unknown;
      error_description?: unknown;
      status?: unknown;
      code?: unknown;
    };
    if (details.name === "AuthRetryableFetchError") {
      return "Signup service could not be reached right now. Please check Supabase Auth SMTP settings, Brevo sender verification, and internet connection, then try again.";
    }
    const message = details.message || details.error_description || details.error;
    if (typeof message === "string" && message.trim()) return message;
    const metadata = [details.status && `status ${details.status}`, details.code && `code ${details.code}`]
      .filter(Boolean)
      .join(", ");
    if (metadata) return `Authentication failed (${metadata}). Please check Supabase SMTP settings.`;
  }
  return "Authentication failed, but Supabase did not return a message. Please check Supabase Auth logs and SMTP settings.";
}

const signupConfirmationMessage =
  "If this email is new, a confirmation link has been sent. Please check inbox, spam and promotions. If you already have an account, log in or use Forgot password.";

function isSignupUserLookupIssue(message: string) {
  return /not found|user was not found|account was not found/i.test(message);
}

function logAuthIssue(label: string, error: unknown) {
  const payload =
    error instanceof Error
      ? { name: error.name, message: error.message }
      : typeof error === "object" && error
        ? JSON.parse(JSON.stringify(error))
        : error;
  console.warn(label, payload);
}

type Props = {
  role?: Role;
  referralCode?: string;
  nextPath?: string;
};

export default function SignupCard({ role = "candidate", referralCode, nextPath }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const safeNext = nextPath?.startsWith("/") && !nextPath.startsWith("//") && !nextPath.includes("\\") ? nextPath : null;
  const inviteSignup = Boolean(safeNext?.startsWith("/employer-invite/"));
  const privilegedRole = role === "admin";

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (role === "admin") {
      setSuccess("Admin self-signup is not open. You are not authorized for this portal unless JobiVerse has assigned admin access.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (role === "recruiter" && !inviteSignup) {
      setLoading(true);
      try {
        const invited = await hasPendingEmployerTeamInvite(normalizedEmail, "recruiter");
        if (!invited) {
          setError("You are not authorized for the recruiter portal yet. Ask your employer to add this exact email in Team seats first.");
          setLoading(false);
          return;
        }
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Unable to verify recruiter access. Please try again.");
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError("Password must contain at least 8 characters, including a letter and a number.");
      return;
    }

    setLoading(true);

    let signupResult;
    try {
      signupResult = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            role,
            full_name: fullName,
            referral_code: referralCode?.trim().toUpperCase() || undefined,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}${safeNext ? `&next=${encodeURIComponent(safeNext)}` : ""}`,
        },
      });
    } catch (reason) {
      setError(authErrorMessage(reason));
      setLoading(false);
      return;
    }

    const { data, error } = signupResult;

    if (error) {
      setError(authErrorMessage(error));
      logAuthIssue("Signup issue:", error);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Account was not created. Please check Supabase Authentication logs for the signup request.");
      setLoading(false);
      return;
    }

    const mustConfirmEmail = await requiresEmailConfirmation();
    if (mustConfirmEmail && data.session) {
      await supabase.auth.signOut().catch(() => null);
      setSuccess(signupConfirmationMessage);
      setLoading(false);
      return;
    }

    // If Supabase has "Confirm email" enabled, there's no session yet
    if (data.user && !data.session) {
      const confirmation = await confirmSignupUser(data.user.id, normalizedEmail, role);
      if (confirmation.error) {
        setError(isSignupUserLookupIssue(confirmation.error) ? signupConfirmationMessage : confirmation.error);
        setLoading(false);
        return;
      }
      setSuccess(confirmation.emailConfirmationRequired ? signupConfirmationMessage : "Account created successfully. You can log in now with the same email and password.");
      setLoading(false);
      return;
    }

    if ((role === "employer" || role === "recruiter") && data.session?.access_token) {
      await fetch("/api/team-invites/claim", {
        method: "POST",
        headers: {
          authorization: `Bearer ${data.session.access_token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ role }),
      }).catch(() => null);
    }

    // Email confirmation disabled - user is signed in immediately
    router.push(safeNext ?? roleRedirect[role]);
    router.refresh();
  };

  const handleGoogleAuth = async () => {
    if (role === "admin") {
      setError("You are not authorized for this portal unless JobiVerse or an employer has invited this email.");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}${safeNext ? `&next=${encodeURIComponent(safeNext)}` : ""}`,
      },
    });
  };

  const handleLinkedInAuth = async () => {
    if (role === "admin") {
      setError("You are not authorized for this portal unless JobiVerse or an employer has invited this email.");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}${safeNext ? `&next=${encodeURIComponent(safeNext)}` : ""}`,
      },
    });
  };

  const handleResendCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    setError(null);
    setSuccess(null);

    if (!normalizedEmail) {
      setError("Enter your email address first, then resend the confirmation code.");
      return;
    }

    setResending(true);
    let resendResult;
    try {
      resendResult = await supabase.auth.resend({
        type: "signup",
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        },
      });
    } catch (reason) {
      setError(authErrorMessage(reason));
      setResending(false);
      return;
    }
    const { error } = resendResult;
    setResending(false);

    if (error) {
      setError(authErrorMessage(error));
      logAuthIssue("Resend confirmation issue:", error);
      return;
    }

    setSuccess("Confirmation email sent again. Please check inbox and spam folder.");
  };

  return (
    <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.55}}>

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
          <span className="rounded-full bg-zinc-950 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-white">New workspace</span>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-[-.035em]">{role === "candidate" ? "Candidate Sign Up" : role === "employer" ? "Employer Sign Up" : role === "recruiter" ? "Recruiter Sign Up" : role === "creator" ? "Creator Sign Up" : "Admin Sign Up"}</h2>
          <p className="mt-2 text-sm text-zinc-500">
            {privilegedRole ? `Request a verified ${role} workspace` : `Join JobiVerse as ${role === "employer" ? "an employer" : role === "creator" ? "a creator" : "a candidate"}`}
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="relative">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              size={18}
            />
            <input
              placeholder="Full name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-12 outline-none transition focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/5"
            />
          </div>

          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              size={18}
            />
            <input
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-12 pr-12 outline-none transition focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/5"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-600" role="status">
              {success}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-zinc-950 font-semibold text-white shadow-xl shadow-black/20 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : privilegedRole ? "Request access" : "Create account"}
            <ArrowRight size={18} className="transition group-hover:translate-x-2" />
          </motion.button>
          {!privilegedRole && (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              className="w-full cursor-pointer rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending ? "Sending confirmation email..." : "Resend confirmation code"}
            </button>
          )}
        </form>

        <div className="flex items-center gap-3"><span className="h-px flex-1 bg-zinc-200"/><span className="text-[10px] font-bold uppercase tracking-[.16em] text-zinc-400">or continue securely</span><span className="h-px flex-1 bg-zinc-200"/></div>
        <div className="grid gap-3 sm:grid-cols-2"><button onClick={handleGoogleAuth} type="button" className="group flex min-h-14 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 px-4 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-lg"><span className="grid h-8 w-8 place-items-center rounded-full border border-zinc-100 bg-white text-base font-black text-blue-600 shadow-sm transition group-hover:scale-105">G</span><span>Google</span></button><button onClick={handleLinkedInAuth} type="button" className="group flex min-h-14 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 px-4 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#0a66c2] text-sm font-black text-white shadow-sm transition group-hover:scale-105">in</span><span>LinkedIn</span></button></div>
        {privilegedRole&&<p className="-mt-3 text-center text-[11px] leading-5 text-zinc-400">OAuth does not grant a new Admin or Recruiter role. Only an account already authorized by JobiVerse or an employer invite can enter this workspace.</p>}

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link
            href={`/login/${role}`}
            className="cursor-pointer font-semibold text-zinc-950"
          >
            Log in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
