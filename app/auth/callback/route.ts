import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { claimPendingEmployerTeamInvite } from "@/lib/employer-team/invitations";
import { getEmployerCompanyAccess } from "@/lib/employer-team/access";
import { adminSupabase } from "@/lib/supabase/admin";

type Role = "candidate" | "employer" | "recruiter" | "admin" | "creator";

const roleRedirect: Record<Role, string> = {
  candidate: "/candidates/dashboard",
  employer: "/employers/dashboard",
  recruiter: "/recruiter",
  admin: "/admin",
  creator: "/earn-with-jobiverse/dashboard",
};

function validRole(value: string | null): Role {
  return value && value in roleRedirect ? value as Role : "candidate";
}

function safeInternalPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : null;
}

function freshAuthRedirect(origin: string, path: string) {
  const target = new URL(path, origin);
  target.searchParams.set("auth_fresh", "1");
  return target.toString();
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function oauthProfile(user: User) {
  const metadata = user.user_metadata ?? {};
  const identityData =
    user.identities
      ?.map((identity) => identity.identity_data ?? {})
      .find((data) => text(data.full_name) || text(data.name) || text(data.picture) || text(data.avatar_url)) ?? {};

  const name =
    text(identityData.full_name) ||
    text(identityData.name) ||
    text(metadata.full_name) ||
    text(metadata.name) ||
    text(metadata.user_name);

  const avatarUrl =
    text(identityData.picture) ||
    text(identityData.avatar_url) ||
    text(metadata.picture) ||
    text(metadata.avatar_url);

  return { name, avatarUrl };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? url.origin).replace(/\/$/, "");
  const code = url.searchParams.get("code");
  const requestedRole = validRole(url.searchParams.get("role"));
  const flow = url.searchParams.get("flow");
  const requestedNext = safeInternalPath(url.searchParams.get("next"));
  const supabase = await createServerSupabaseClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(`${origin}/login/${requestedRole}?verified=1`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login/${requestedRole}`);

  if ((requestedRole === "employer" || requestedRole === "recruiter") && user.email) {
    try {
      await claimPendingEmployerTeamInvite({ userId: user.id, email: user.email, expectedRole: requestedRole });
    } catch {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login/${requestedRole}?error=wrong_role`);
    }
  }

  const { data: profile, error: profileError } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profileError || !profile || !(profile.role in roleRedirect)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login/${requestedRole}?error=profile_missing`);
  }
  const actualRole = profile.role as Role;

  const provider = text(user.app_metadata?.provider);
  if (code && provider && provider !== "email") {
    const { name, avatarUrl } = oauthProfile(user);
    const updates: Record<string, string> = {};
    if (name) updates.full_name = name;
    if (avatarUrl) updates.avatar_url = avatarUrl;
    if (Object.keys(updates).length) {
      await supabase.from("users").update(updates).eq("id", user.id);
    }
  }

  if (flow === "recovery") {
    return NextResponse.redirect(`${origin}/reset-password?role=${actualRole}`);
  }

  const creatorAccess = requestedRole === "creator" && ["candidate", "creator"].includes(actualRole);
  if (!creatorAccess && actualRole !== requestedRole) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login/${requestedRole}?error=wrong_role`);
  }

  if (actualRole === "employer") {
    try {
      await getEmployerCompanyAccess(user.id);
    } catch {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login/employer?error=employer_access_required`);
    }
  }

  if (actualRole === "recruiter") {
    const { count, error } = await adminSupabase
      .from("employer_team_members")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("role", "recruiter")
      .eq("status", "active");

    if (error || !count) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login/recruiter?error=recruiter_access_required`);
    }
  }

  return NextResponse.redirect(freshAuthRedirect(origin, requestedNext ?? roleRedirect[actualRole]));
}
