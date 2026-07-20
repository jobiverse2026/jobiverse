import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const roleRoutes: Record<string, string> = {
  "/earn-with-jobiverse/dashboard": "creator",
  "/admin": "admin",
  "/recruiter": "recruiter",
  "/candidates/applications": "candidate",
  "/candidates/dashboard": "candidate",
  "/candidates/jobs": "candidate",
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

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const maintenanceMode = process.env.MAINTENANCE_MODE === "true";

  if (maintenanceMode && !pathname.startsWith("/maintenance")) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  const matchedRoute = Object.keys(roleRoutes).find((path) =>
    pathname.startsWith(path)
  );

  if (!matchedRoute) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const requiredRole = roleRoutes[matchedRoute];

  if (!user) {
    const loginRole = requiredRole === "creator" ? "creator" : requiredRole;
    const loginUrl = new URL(`/login/${loginRole}`, request.url);
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  const hasCreatorAccess = requiredRole === "creator" && ["candidate", "creator"].includes(userRow?.role ?? "");
  if (userRow?.is_active === false || (!hasCreatorAccess && userRow?.role !== requiredRole)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|sitemap.xml|robots.txt|images).*)",
  ],
};
