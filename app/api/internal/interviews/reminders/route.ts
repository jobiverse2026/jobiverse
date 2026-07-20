import { NextResponse } from "next/server";

import { sendTodayInterviewRemindersToAll } from "@/lib/hiring/interview-calendar";

function isAuthorized(request: Request) {
  const secret = process.env.EMAIL_WORKER_SECRET;
  if (!secret) return false;

  const authorization = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const workerSecret = request.headers.get("x-worker-secret");

  return authorization === secret || workerSecret === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendTodayInterviewRemindersToAll();
  return NextResponse.json({ ok: true, ...result });
}

export const POST = GET;
