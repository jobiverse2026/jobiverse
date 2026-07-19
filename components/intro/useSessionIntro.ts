"use client";

import { useCallback, useEffect, useState } from "react";

const SESSION_KEY = "jobiverse:intro-seen";

export function useSessionIntro() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const forceIntro = new URLSearchParams(window.location.search).get("intro") === "1";
    const hasSeenIntro = window.sessionStorage.getItem(SESSION_KEY) === "true";
    if (forceIntro || !hasSeenIntro) {
      setShowIntro(true);
      document.documentElement.style.overflow = "hidden";
      document.documentElement.classList.add("jv-intro-active");
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.classList.remove("jv-intro-active");
    };
  }, []);

  const completeIntro = useCallback(() => {
    window.sessionStorage.setItem(SESSION_KEY, "true");
    document.documentElement.style.overflow = "";
    setShowIntro(false);
    window.setTimeout(() => {
      document.documentElement.classList.remove("jv-intro-active");
    }, 760);
  }, []);

  return { showIntro, completeIntro };
}
