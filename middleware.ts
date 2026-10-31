import { NextResponse, type NextRequest } from "next/server";

const roleRoutes: Record<string, string> = {
  "/earn-with-jobiverse/dashboard": "creator",
  "/admin": "admin",
  "/recruiter": "recruiter",
  "/candidates/applications": "candidate",
  "/candidates/dashboard": "candidate",
  "/candidates/jobs": "candidate",
  "/candidates/interview-prep": "candidate",
  "/candidates/profile": "candidate",
  "/candidates/resume": "candidate",
  "/candidates/resume-analysis": "candidate",
  "/candidates/resume-builder": "candidate",
  "/candidates/resume-checkout": "candidate",
  "/candidates/resume-templates": "candidate",
  "/candidates/saved-jobs": "candidate",
  "/employers/billing": "employer",
  "/employers/candidates": "employer",
  "/employers/company": "employer",
  "/employers/dashboard": "employer",
  "/employers/external-applicants": "employer",
  "/employers/reports": "employer",
  "/employers/requirements": "employer",
  "/employers/talent-search": "employer",
  "/employers/team": "employer",
};

const authenticatedRoutes = ["/hiring/applications"] as const;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (process.env.MAINTENANCE_MODE === "true" && !pathname.startsWith("/maintenance")) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  const matchedRoute = Object.keys(roleRoutes).find((path) => pathname.startsWith(path));
  const requiresAuthentication = authenticatedRoutes.some((path) => pathname.startsWith(path));
  if (!matchedRoute && !requiresAuthentication) return NextResponse.next();

  const requiredRole = matchedRoute ? roleRoutes[matchedRoute] : null;
  const hasSessionCookie = request.cookies
    .getAll()
    .some(({ name, value }) => name.startsWith("sb-") && name.includes("auth-token") && value.length > 0);

  if (!hasSessionCookie) {
    const loginUrl = new URL(requiredRole ? `/login/${requiredRole}` : "/login", request.url);
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  // Keep middleware CPU-light on Cloudflare's free tier. Protected pages and
  // layouts perform the authoritative, database-backed user and role checks.

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/recruiter/:path*",
    "/candidates/:path*",
    "/employers/:path*",
    "/earn-with-jobiverse/dashboard/:path*",
    "/hiring/applications/:path*",
  ],
};
