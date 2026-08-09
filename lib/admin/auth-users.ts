import "server-only";
import type { User } from "@supabase/supabase-js";
import { adminSupabase } from "@/lib/supabase/admin";

export async function listAllAuthUsers() {
  const users: User[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(error.message);
    users.push(...data.users);
    if (data.users.length < 1000) break;
  }
  return users;
}

export function signupProvider(user: User) {
  const provider = user.app_metadata?.provider;
  return typeof provider === "string" && provider.trim() ? provider : user.identities?.[0]?.provider || "email";
}
