import "server-only";

import { adminSupabase } from "@/lib/supabase/admin";

export type EmployerCompanyAccess = {
  company: {
    id: string;
    owner_id: string;
    company_name: string;
    recruiter_seat_limit: number;
    employer_seat_limit: number;
    recruiter_seat_allowance?: number;
  };
  isMasterEmployer: boolean;
};

export function scopeEmployerRequirementQuery(
  query: any,
  access: EmployerCompanyAccess,
  userId: string
) {
  const companyScoped = query.eq("company_id", access.company.id);
  return access.isMasterEmployer ? companyScoped : companyScoped.eq("employer_id", userId);
}

export function scopeEmployerJoinedRequirementQuery(
  query: any,
  access: EmployerCompanyAccess,
  userId: string
) {
  const companyScoped = query.eq("requirements.company_id", access.company.id);
  return access.isMasterEmployer ? companyScoped : companyScoped.eq("requirements.employer_id", userId);
}

export async function getEmployerCompanyAccess(userId: string): Promise<EmployerCompanyAccess> {
  const { data: ownedCompany, error: ownedError } = await adminSupabase
    .from("companies")
    .select("id,owner_id,company_name,recruiter_seat_limit,employer_seat_limit")
    .eq("owner_id", userId)
    .maybeSingle();

  if (ownedError) throw new Error(ownedError.message);
  if (ownedCompany) {
    return { company: normalizeCompany(ownedCompany), isMasterEmployer: true };
  }

  const { data: membership, error: memberError } = await adminSupabase
    .from("employer_team_members")
    .select("company_id,employer_id,role,status,recruiter_seat_limit,companies(id,owner_id,company_name,recruiter_seat_limit,employer_seat_limit)")
    .eq("user_id", userId)
    .eq("role", "employer")
    .eq("status", "active")
    .maybeSingle();

  if (memberError) throw new Error(memberError.message);

  const relatedCompany = Array.isArray((membership as any)?.companies)
    ? (membership as any).companies[0]
    : (membership as any)?.companies;

  if (relatedCompany) {
    return { company: normalizeCompany(relatedCompany, Number((membership as any)?.recruiter_seat_limit ?? 0)), isMasterEmployer: false };
  }

  throw new Error("You do not have an active employer workspace. Ask the company master employer or JobiVerse admin to assign access.");
}

function normalizeCompany(company: any, recruiterSeatAllowance?: number) {
  return {
    id: company.id,
    owner_id: company.owner_id,
    company_name: company.company_name,
    recruiter_seat_limit: Number(company.recruiter_seat_limit ?? 0),
    employer_seat_limit: Number(company.employer_seat_limit ?? 0),
    recruiter_seat_allowance: recruiterSeatAllowance,
  };
}
