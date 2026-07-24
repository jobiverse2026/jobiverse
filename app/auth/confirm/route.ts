import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getEmployerCompanyAccess } from "@/lib/employer-team/access";
import { adminSupabase } from "@/lib/supabase/admin";

type Role = "candidate" | "employer" | "recruiter" | "admin" | "creator";
type EmailOtpType = "signup" | "email_change" | "recovery" | "invite" | "magiclink";

const roleRedirect: Record<Role, string> = {
  candidate: "/candidates/dashboard",
  employer: "/employers/dashboard",
  recruiter: "/recruiter",
  admin: "/admin",
  creator: "/earn-with-jobiverse/dashboard",
};

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function validOtpType(value: string | null): EmailOtpType {
  return ["signup", "email_change", "recovery", "invite", "magiclink"].includes(value ?? "") ? (value as EmailOtpType) : "signup";
}

function validRole(value: unknown): Role {
  return typeof value === "string" && value in roleRedirect ? (value as Role) : "candidate";
}

function freshAuthRedirect(origin: string, path: string) {
  const target = new URL(path, origin);
  target.searchParams.set("auth_fresh", "1");
  return target.toString();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? url.origin).replace(/\/$/, "");
  const tokenHash = text(url.searchParams.get("token_hash"));
  const type = validOtpType(url.searchParams.get("type"));
  const supabase = await createServerSupabaseClient();

  if (!tokenHash) return NextResponse.redirect(`${origin}/login/candidate?error=oauth_failed`);

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error || !data.user) return NextResponse.redirect(`${origin}/login/candidate?verified=1`);

  const { data: profile } = await supabase.from("users").select("role").eq("id", data.user.id).maybeSingle();
  const role = validRole(profile?.role ?? data.user.user_metadata?.role);

  if (type === "recovery") return NextResponse.redirect(`${origin}/reset-password?role=${role}`);

  if (role === "employer") {
    try {
      await getEmployerCompanyAccess(data.user.id);
    } catch {
      return NextResponse.redirect(freshAuthRedirect(origin, "/employers/company?onboarding=1"));
    }
  }

  if (role === "recruiter") {
    const { count, error } = await adminSupabase
      .from("employer_team_members")
      .select("id", { count: "exact", head: true })
      .eq("user_id", data.user.id)
      .eq("role", "recruiter")
      .eq("status", "active");

    if (error || !count) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login/recruiter?error=recruiter_access_required`);
    }
  }

  return NextResponse.redirect(freshAuthRedirect(origin, roleRedirect[role]));
}
