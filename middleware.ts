import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        },
      },
    },
  );
  const { data: verifiedToken } = await supabase.auth.getClaims();
  const requiredRole = matchedRoute ? roleRoutes[matchedRoute] : null;

  if (!verifiedToken?.claims?.sub) {
    const loginUrl = new URL(requiredRole ? `/login/${requiredRole}` : "/login", request.url);
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  // Protected pages and layouts perform the authoritative database-backed role check.
  // Middleware verifies the signed session without a redundant role query.

  return response;
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
