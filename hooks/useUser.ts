"use client";

import { useAuthContext } from "@/contexts/AuthContext";


export function useUser() {

  const {
    user,
    session,
    profile,
    loading,
    refreshProfile,
  } = useAuthContext();


  return {
    user,
    session,
    profile,
    role: profile?.role ?? null,
    loading,
    isAuthenticated: !!user,
    refreshProfile,
  };

}