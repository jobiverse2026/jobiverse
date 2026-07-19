import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const roleRoutes: Record<string, string> = {
  "/earn-with-jobiverse/dashboard": "creator",
  "/admin": "admin",
  "/recruiter": "recruiter",
  "/candidates": "candidate",
  "/employers": "employer",
};

export async function proxy(request: NextRequest) {
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

  const matchedRoute = Object.keys(roleRoutes).find((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (matchedRoute) {
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
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/recruiter/:path*",
    "/candidates/dashboard/:path*",
    "/employers/dashboard/:path*",
    "/employers/company/:path*",
    "/employers/requirements/:path*",
    "/employers/billing/:path*",
    "/earn-with-jobiverse/dashboard/:path*",
  ],
};
