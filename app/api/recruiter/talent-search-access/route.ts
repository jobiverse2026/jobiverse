import { NextResponse } from "next/server";

import { getEmployerTalentSearchAccess } from "@/components/talent/TalentSearchExperience";
import { requireRole } from "@/lib/auth/authorization";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, profile } = await requireRole(["recruiter"]);
    const access = await getEmployerTalentSearchAccess(user.id, profile.email ?? user.email ?? "");
    return NextResponse.json({ allowed: access.allowed });
  } catch {
    return NextResponse.json({ allowed: false }, { status: 200 });
  }
}
