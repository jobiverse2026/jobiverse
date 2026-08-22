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

type AccessResult = {
  authenticated?: boolean;
  role?: string | null;
  isActive?: boolean;
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (process.env.MAINTENANCE_MODE === "true" && !pathname.startsWith("/maintenance")) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  const matchedRoute = Object.keys(roleRoutes).find((path) => pathname.startsWith(path));
  const requiresAuthentication = authenticatedRoutes.some((path) => pathname.startsWith(path));
  if (!matchedRoute && !requiresAuthentication) return NextResponse.next();

  const accessResponse = await fetch(new URL("/api/internal/route-access", request.url), {
    headers: { cookie: request.headers.get("cookie") ?? "" },
    cache: "no-store",
  });

  if (!accessResponse.ok) return NextResponse.redirect(new URL("/login", request.url));

  const access = await accessResponse.json() as AccessResult;
  const requiredRole = matchedRoute ? roleRoutes[matchedRoute] : null;

  if (!access.authenticated) {
    const loginUrl = new URL(requiredRole ? `/login/${requiredRole}` : "/login", request.url);
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const hasCreatorAccess = requiredRole === "creator" && ["candidate", "creator"].includes(access.role ?? "");
  if (access.isActive === false || (requiredRole && !hasCreatorAccess && access.role !== requiredRole)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();
  const getSetCookie = (accessResponse.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
  const refreshedCookies = getSetCookie?.call(accessResponse.headers) ?? [];
  for (const cookie of refreshedCookies) response.headers.append("set-cookie", cookie);
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|sitemap.xml|robots.txt|images).*)",
  ],
};
