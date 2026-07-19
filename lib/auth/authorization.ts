import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/auth";

export async function requireRole(allowedRoles: readonly UserRole[]) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, email, full_name, role, is_active")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile?.role ||
    profile.is_active === false ||
    !allowedRoles.includes(profile.role as UserRole)
  ) {
    throw new Error("Forbidden");
  }

  return { supabase, user, profile };
}
