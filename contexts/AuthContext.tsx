"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { User, Session } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";


type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role:
    | "admin"
    | "recruiter"
    | "candidate"
    | "employer"
    | "creator"
    | null;
  created_at?: string;
  updated_at?: string;
};

function isStaleRefreshTokenError(error: unknown) {
  const message =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : typeof error === "object" && error
        ? JSON.stringify(error)
        : String(error ?? "");

  return /invalid refresh token|refresh token not found|AuthRetryableFetchError/i.test(message);
}

function clearSupabaseBrowserSession() {
  try {
    Object.keys(window.localStorage).forEach((key) => {
      if (key.startsWith("sb-") || key.includes("supabase")) {
        window.localStorage.removeItem(key);
      }
    });

    Object.keys(window.sessionStorage).forEach((key) => {
      if (key.startsWith("sb-") || key.includes("supabase")) {
        window.sessionStorage.removeItem(key);
      }
    });

    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0]?.trim();
      if (!name || (!name.startsWith("sb-") && !name.includes("supabase"))) return;
      document.cookie = `${name}=; Max-Age=0; path=/`;
    });
  } catch {
    // Ignore browser storage errors; the user can still continue by clearing site data manually.
  }
}

const browserSessionKey = "jobiverse-browser-session";
const lastBrowserExitKey = "jobiverse-last-browser-exit";
const restoredSessionGraceMs = 5000;


interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);


export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createBrowserSupabaseClient();


  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);



  const fetchProfile = async (
    currentUser: User | null
  ) => {

    if (!currentUser) {
      setProfile(null);
      return;
    }


    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id,
        email,
        full_name,
        avatar_url,
        role,
        created_at,
        updated_at
        `
      )
      .eq("id", currentUser.id)
      .maybeSingle();



    if (error) {
      if (error.message.toLowerCase().includes("jwt issued at future")) {
        await supabase.auth.signOut({ scope: "local" });
        setSession(null);
        setUser(null);
        setProfile(null);
        return;
      }
      console.error(
        "Profile fetch error:",
        error.message
      );

      setProfile(null);
      return;
    }


    setProfile(data ?? null);
  };



  const refreshProfile = async () => {

    const {
      data: {
        user: currentUser,
      },
    } = await supabase.auth.getUser();


    await fetchProfile(currentUser);
  };



  useEffect(() => {

    let mounted = true;

    const handleRejectedAuthRefresh = (event: PromiseRejectionEvent) => {
      if (!isStaleRefreshTokenError(event.reason)) return;
      event.preventDefault();
      clearSupabaseBrowserSession();
      if (!mounted) return;
      setSession(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
    };

    window.addEventListener("unhandledrejection", handleRejectedAuthRefresh);

    const rememberBrowserExit = () => {
      try {
        window.localStorage.setItem(lastBrowserExitKey, String(Date.now()));
      } catch {
        // Ignore storage errors.
      }
    };

    window.addEventListener("pagehide", rememberBrowserExit);



    const initializeAuth = async () => {

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.warn("Discarding an invalid local session:", error.message);
        clearSupabaseBrowserSession();
        await supabase.auth.signOut({ scope: "local" });
      }



      if (!mounted) return;



      let validSession = error ? null : session;
      const hasActiveBrowserSession = sessionStorage.getItem(browserSessionKey) === "active";
      const isPasswordRecovery = window.location.pathname === "/reset-password";
      const isAuthCallback =
        window.location.pathname.includes("/auth/callback") ||
        window.location.search.includes("code=") ||
        window.location.search.includes("auth_fresh=1");
      const lastBrowserExit = Number(window.localStorage.getItem(lastBrowserExitKey) ?? 0);
      const looksLikeReopenedAfterClose =
        Boolean(validSession) &&
        lastBrowserExit > 0 &&
        Date.now() - lastBrowserExit > restoredSessionGraceMs &&
        !isPasswordRecovery &&
        !isAuthCallback;

      if (validSession && (!hasActiveBrowserSession || looksLikeReopenedAfterClose) && !isPasswordRecovery && !isAuthCallback) {
        clearSupabaseBrowserSession();
        await supabase.auth.signOut({ scope: "local" });
        validSession = null;
      }

      if (!isPasswordRecovery) sessionStorage.setItem(browserSessionKey, "active");
      window.localStorage.removeItem(lastBrowserExitKey);
      setSession(validSession);

      const currentUser = validSession?.user ?? null;

      setUser(currentUser);



      await fetchProfile(currentUser);



      if (mounted) {
        setLoading(false);
      }

    };



    initializeAuth();



    const {
      data: {
        subscription,
      },
    } = supabase.auth.onAuthStateChange(
      (
        event,
        session
      ) => {


        if (!mounted) return;



        setSession(session);


        const currentUser =
          session?.user ?? null;



        setUser(currentUser);



        // Keep the auth callback synchronous. Supabase may hold its auth lock
        // while notifying listeners, so profile I/O is deferred to avoid
        // blocking sign-in completion and the post-login redirect.
        setTimeout(() => {
          if (mounted) void fetchProfile(currentUser);
        }, 0);

      }
    );



    return () => {

      mounted = false;

      window.removeEventListener("unhandledrejection", handleRejectedAuthRefresh);
      window.removeEventListener("pagehide", rememberBrowserExit);

      subscription.unsubscribe();

    };


  }, []);



  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}



export function useAuthContext() {

  const context =
    useContext(AuthContext);



  if (!context) {

    throw new Error(
      "useAuthContext must be used inside AuthProvider"
    );

  }


  return context;

}
