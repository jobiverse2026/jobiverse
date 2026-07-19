import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Role =
  | "candidate"
  | "employer"
  | "recruiter"
  | "admin"
  | "creator";

const roleRedirect: Record<Role, string> = {
  candidate: "/candidates/dashboard",
  employer: "/employers/dashboard",
  recruiter: "/recruiter",
  admin: "/admin",
  creator: "/earn-with-jobiverse/dashboard",
};


export async function loginWithRole(
  email: string,
  password: string,
  expectedRole: Role
) {

  const supabase = createBrowserSupabaseClient();

  const normalizedEmail = email.trim().toLowerCase();


  const {
    data,
    error,
  } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });


  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      throw new Error(
        "The email or password you entered is incorrect. Please try again or reset your password."
      );
    }

    throw new Error(error.message);
  }


  const user = data.user;


  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("users")
    .select("role,is_active")
    .eq("id", user.id)
    .maybeSingle();


  if (profileError) {
    if (profileError.message.toLowerCase().includes("jwt issued at future")) {
      await supabase.auth.signOut({ scope: "local" });
      throw new Error("Your device clock is out of sync. Sync Windows date and time, then log in again.");
    }
    throw new Error("User profile not found.");
  }

  if (!profile?.role) {
    await supabase.auth.signOut();
    throw new Error("User profile not found.");
  }

  if (profile.is_active === false) {
    await supabase.auth.signOut();
    throw new Error("This account is currently inactive. Contact JobiVerse support.");
  }


  const creatorAccess = expectedRole === "creator" && ["candidate", "creator"].includes(profile.role);
  if (!creatorAccess && profile.role !== expectedRole) {

    await supabase.auth.signOut();

    throw new Error(
      `Please login from ${profile.role} portal`
    );
  }


  return {
    user,
    redirect: roleRedirect[expectedRole],
  };
}
