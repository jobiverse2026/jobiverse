"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { getEmployerCompanyAccess } from "@/lib/employer-team/access";
import { companySchema } from "@/validation/company";

export async function getCompany() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Development ke liye temporarily
  if (!user) {
    return null;
  }

  let access;
  try {
    access = await getEmployerCompanyAccess(user.id);
  } catch {
    return null;
  }

  const { data, error } = await adminSupabase
    .from("companies")
    .select("*")
    .eq("id", access.company.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createCompany(values: unknown) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const parsed = companySchema.parse(values);
  const access = await getEmployerCompanyAccess(user.id).catch(() => null);
  if (access && !access.isMasterEmployer) throw new Error("Only the master employer can edit the company profile.");

  const { data, error } = await supabase
    .from("companies")
    .insert({
      owner_id: user.id,
      ...parsed,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateCompany(values: unknown) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const parsed = companySchema.parse(values);
  const access = await getEmployerCompanyAccess(user.id).catch(() => null);
  if (access && !access.isMasterEmployer) throw new Error("Only the master employer can edit the company profile.");

  // Check if company already exists
  const { data: existingCompany } = await supabase
    .from("companies")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  // First time -> Create
  if (!existingCompany) {
    const { data, error } = await supabase
      .from("companies")
      .insert({
        owner_id: user.id,
        ...parsed,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Existing -> Update
  const { data, error } = await supabase
    .from("companies")
    .update({
      ...parsed,
      updated_at: new Date().toISOString(),
    })
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
