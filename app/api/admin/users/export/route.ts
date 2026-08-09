import { requireRole } from "@/lib/auth/authorization";
import { listAllAuthUsers, signupProvider } from "@/lib/admin/auth-users";
import { adminSupabase } from "@/lib/supabase/admin";

export async function GET() {
  await requireRole(["admin"]);
  const [users, { data: profiles }] = await Promise.all([listAllAuthUsers(), adminSupabase.from("users").select("id,full_name,email,role,is_active")]);
  const map = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const rows = [["Name", "Email", "Role", "Signup source", "Email verified", "Active", "Registered at", "Last sign in"]];
  for (const user of users) {
    const profile = map.get(user.id);
    rows.push([profile?.full_name || String(user.user_metadata?.full_name ?? ""), user.email || profile?.email || "", profile?.role || String(user.user_metadata?.role ?? "unassigned"), signupProvider(user), user.email_confirmed_at ? "Yes" : "No", profile?.is_active === false || user.banned_until ? "No" : "Yes", user.created_at, user.last_sign_in_at || ""]);
  }
  const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="jobiverse-users-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
