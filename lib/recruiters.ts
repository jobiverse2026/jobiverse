import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getRecruiters() {

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("users")
    .select("id,email,role")
    .eq("role", "recruiter")
    .order("email");


  console.log("ONLY RECRUITERS:", data);
  console.log("ERROR:", error);


  if (error) {
    return [];
  }

  return data ?? [];
}