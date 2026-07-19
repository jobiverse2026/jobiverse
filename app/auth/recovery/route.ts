import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const allowedRoles = new Set(["candidate", "employer", "recruiter", "admin", "creator"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? url.origin).replace(/\/$/, "");
  const code = url.searchParams.get("code");
  const requestedRole = allowedRoles.has(url.searchParams.get("role") ?? "") ? url.searchParams.get("role")! : "candidate";
  if (!code) return NextResponse.redirect(`${origin}/forgot-password?role=${requestedRole}&error=invalid_link`);

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/forgot-password?role=${requestedRole}&error=expired_link`);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/forgot-password?role=${requestedRole}&error=invalid_link`);
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  const actualRole = profile?.role && allowedRoles.has(profile.role) ? profile.role : requestedRole;
  return NextResponse.redirect(`${origin}/reset-password?role=${actualRole}`);
}
