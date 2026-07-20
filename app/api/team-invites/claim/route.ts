import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { claimPendingEmployerTeamInvite, type EmployerTeamRole } from "@/lib/employer-team/invitations";

function validRole(value: unknown): EmployerTeamRole | undefined {
  return value === "employer" || value === "recruiter" ? value : undefined;
}

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await adminSupabase.auth.getUser(token);
  if (error || !data.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let expectedRole: EmployerTeamRole | undefined;
  try {
    const body = await request.json();
    expectedRole = validRole(body?.role);
  } catch {
    expectedRole = undefined;
  }

  try {
    const claimed = await claimPendingEmployerTeamInvite({
      userId: data.user.id,
      email: data.user.email,
      expectedRole,
    });

    return NextResponse.json({ claimed: Boolean(claimed), role: claimed?.role ?? null });
  } catch (reason) {
    return NextResponse.json(
      { error: reason instanceof Error ? reason.message : "Unable to activate invited access." },
      { status: 400 }
    );
  }
}
