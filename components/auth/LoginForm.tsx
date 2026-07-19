"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithRole } from "@/lib/auth/login";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";

type Role = "candidate" | "employer" | "recruiter" | "admin";

const roleLabels: Record<Role, string> = {
  candidate: "Candidate",
  employer: "Employer",
  recruiter: "Recruiter",
  admin: "Admin",
};

export function LoginForm({ role }: { role: Role }) {
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  setLoading(true);
  setError(null);


  try {

    const result = await loginWithRole(
      email,
      password,
      role
    );


    router.push(result.redirect);
    router.refresh();


  } catch(error:any){

    setError(error.message);

  } finally {

    setLoading(false);

  }
};

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
      },
    });
  };

  return (
    <div className="mx-auto max-w-md space-y-6 p-8">
      <h1 className="text-2xl font-semibold">{roleLabels[role]} login</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value.trimStart())}
          className="w-full rounded-xl border px-4 py-2.5"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border px-4 py-2.5"
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black py-2.5 text-white disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-zinc-400">OR</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full rounded-xl border py-2.5 font-medium hover:bg-zinc-50"
      >
        Continue with Google
      </button>

      <p className="text-center text-sm text-zinc-500">
  Forgot password?{" "}
  <Link
    href={`/forgot-password?role=${role}`}
    className="underline hover:text-black transition-colors"
  >
    Reset here
  </Link>
</p>
    </div>
  );
}
