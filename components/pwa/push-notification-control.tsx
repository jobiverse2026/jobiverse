"use client";

import { useEffect, useState } from "react";
import { BellRing, CheckCircle2, Loader2, Smartphone } from "lucide-react";

type State = "loading" | "unsupported" | "needs-install" | "disabled" | "enabled";

function applicationServerKey(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const raw = atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

export function PushNotificationControl() {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { void (async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return setState("unsupported");
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    if (ios && !standalone) return setState("needs-install");
    const registration = await navigator.serviceWorker.ready;
    setState((await registration.pushManager.getSubscription()) ? "enabled" : "disabled");
  })(); }, []);

  async function enable() {
    setBusy(true); setMessage("");
    try {
      if (await Notification.requestPermission() !== "granted") throw new Error("Notification permission was not allowed.");
      const keyResponse = await fetch("/api/push/public-key", { cache: "no-store" });
      const keyData = await keyResponse.json();
      if (!keyResponse.ok) throw new Error(keyData.error ?? "Push notifications are unavailable.");
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing ?? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: applicationServerKey(keyData.publicKey) });
      const response = await fetch("/api/push/subscriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subscription.toJSON()) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save this device.");
      setState("enabled"); setMessage("This device is connected.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not enable notifications."); }
    finally { setBusy(false); }
  }

  async function disable() {
    setBusy(true); setMessage("");
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/subscriptions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: subscription.endpoint }) });
        await subscription.unsubscribe();
      }
      setState("disabled"); setMessage("Push notifications disabled on this device.");
    } catch { setMessage("Could not disconnect this device. Please try again."); }
    finally { setBusy(false); }
  }

  async function test() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/push/test", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Test notification failed.");
      setMessage("Test sent. Check your device notification tray.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Test notification failed."); }
    finally { setBusy(false); }
  }

  return <section className="mt-7 rounded-[2rem] border border-violet-200 bg-white p-6 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-2xl"><div className="flex items-center gap-2 text-violet-700"><Smartphone size={19}/><p className="text-xs font-bold uppercase tracking-[.16em]">PWA Phase 2</p></div><h2 className="mt-3 text-xl font-bold text-zinc-950">Device push notifications</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Receive important hiring, message, order and account updates when JobiVerse is closed.</p></div>
      <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap">{state === "enabled" ? <><button type="button" disabled={busy} onClick={test} className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50 sm:w-auto">{busy?<><Loader2 className="animate-spin" size={17}/>Sending...</>:"Send test"}</button><button type="button" disabled={busy} onClick={disable} className="min-h-12 w-full cursor-pointer rounded-xl bg-zinc-100 px-5 py-3 text-sm font-bold text-zinc-700 disabled:opacity-50 sm:w-auto">Disable</button></> : state === "disabled" ? <button type="button" disabled={busy} onClick={enable} className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50 sm:w-auto">{busy?<><Loader2 className="animate-spin" size={17}/>Enabling...</>:<><BellRing size={17}/>Enable on this device</>}</button> : null}</div></div>
    {state === "enabled" && <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-700"><CheckCircle2 size={17}/>Enabled on this device</p>}
    {state === "needs-install" && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">On iPhone, first open JobiVerse from the Home Screen app, then enable notifications here.</p>}
    {state === "unsupported" && <p className="mt-5 rounded-xl bg-zinc-100 p-4 text-sm text-zinc-600">Push notifications are not supported by this browser or device.</p>}
    {message && <p className="mt-4 text-sm font-semibold text-zinc-700" role="status">{message}</p>}
  </section>;
}
