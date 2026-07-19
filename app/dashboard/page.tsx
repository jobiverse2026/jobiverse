import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardGatewayPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "employer") redirect("/employers/dashboard");
  if (profile?.role === "candidate") redirect("/candidates/dashboard");
  if (profile?.role === "recruiter") redirect("/recruiter");
  if (profile?.role === "admin") redirect("/admin");
  if (profile?.role === "creator") redirect("/earn-with-jobiverse/dashboard");

  redirect("/");
}
