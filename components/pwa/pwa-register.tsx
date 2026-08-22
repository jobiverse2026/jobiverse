"use client";

import { useEffect, useState } from "react";
import { Download, RefreshCw, Share, Smartphone, X } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "jobiverse:pwa-install-dismissed";

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function PwaRegister() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;
    const hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).then((registration) => {
      registration.update().catch(() => undefined);
      if (registration.waiting) setUpdateReady(true);
      registration.addEventListener("updatefound", () => {
        registration.installing?.addEventListener("statechange", () => {
          if (registration.waiting && navigator.serviceWorker.controller) setUpdateReady(true);
        });
      });
    }).catch(() => undefined);

    const controllerChange = () => {
      if (!hadController || refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", controllerChange);

    const beforeInstall = (event: Event) => {
      event.preventDefault();
      const installEvent = event as InstallPromptEvent;
      setPrompt(installEvent);
      if (!isStandalone() && localStorage.getItem(DISMISSED_KEY) !== "1") setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", beforeInstall);

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const iosTimer = ios && !isStandalone() && localStorage.getItem(DISMISSED_KEY) !== "1"
      ? window.setTimeout(() => setShowInstall(true), 0)
      : undefined;

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      navigator.serviceWorker.removeEventListener("controllerchange", controllerChange);
      if (iosTimer !== undefined) window.clearTimeout(iosTimer);
    };
  }, []);

  const install = async () => {
    if (prompt) {
      await prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === "accepted") setShowInstall(false);
      setPrompt(null);
      return;
    }
    setShowIosHelp(true);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setShowInstall(false);
    setShowIosHelp(false);
  };

  const applyUpdate = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
  };

  return <>
    {updateReady && <div className="fixed bottom-4 left-4 z-[90] flex max-w-sm items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl print:hidden"><RefreshCw size={18}/><p className="text-sm font-semibold">JobiVerse update ready</p><button type="button" onClick={applyUpdate} className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white">Update</button></div>}
    {showInstall && <aside className="fixed inset-x-4 bottom-4 z-[89] mx-auto max-w-lg rounded-[1.75rem] border border-white/20 bg-zinc-950 p-5 text-white shadow-2xl print:hidden">
      <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-zinc-950"><Smartphone size={21}/></span><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-[.16em] text-zinc-500">Install JobiVerse</p><h2 className="mt-1 text-xl font-semibold">Use JobiVerse like an app</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Fast home-screen access, full-screen experience and automatic updates.</p></div><button type="button" onClick={dismiss} aria-label="Dismiss install prompt" className="rounded-full p-2 text-zinc-400 hover:bg-white/10"><X size={18}/></button></div>
      {showIosHelp ? <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-zinc-200"><p className="flex gap-2"><Share className="mt-1 shrink-0" size={16}/>On iPhone Safari, tap <strong>Share</strong>, then choose <strong>Add to Home Screen</strong> and confirm.</p></div> : <button type="button" onClick={install} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-zinc-950"><Download size={17}/>Install free app</button>}
    </aside>}
  </>;
}

