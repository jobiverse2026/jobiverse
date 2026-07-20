"use client";

import Link from "next/link";
import { Archive, Bell, CheckCheck, Inbox, Undo2 } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { formatIndiaDateTime } from "@/lib/format/date-time";
import { defaultNotificationPreferences, notificationCategory, type NotificationPreferences } from "@/lib/notifications/preferences";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  href: string | null;
  read_at: string | null;
  archived_at: string | null;
  created_at: string;
};

type View = "all" | "unread" | "archived";

export function NotificationBell({ userId }: { userId: string }) {
  const instanceId = useId().replaceAll(":", "");
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [view, setView] = useState<View>("all");
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultNotificationPreferences);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const [{data},{data:preferenceRow}] = await Promise.all([supabase.from("notifications").select("id,title,message,type,href,read_at,archived_at,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),supabase.from("notification_preferences").select("*").eq("user_id",userId).maybeSingle()]);
    setItems((data as Notification[] | null) ?? []);
    setPreferences({...defaultNotificationPreferences,...(preferenceRow??{})} as NotificationPreferences);
  }, [supabase, userId]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => { void load(); }, 0);
    const channel = supabase
      .channel(`notifications:${userId}:${instanceId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, load)
      .subscribe();
    return () => { window.clearTimeout(initialLoad); void supabase.removeChannel(channel); };
  }, [instanceId, load, supabase, userId]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [open]);

  const allowedItems=items.filter(item=>preferences[`in_app_${notificationCategory(item.type)}`]);
  const activeItems = allowedItems.filter((item) => !item.archived_at);
  const unread = activeItems.filter((item) => !item.read_at).length;
  const visibleItems = view === "archived" ? allowedItems.filter((item) => item.archived_at) : view === "unread" ? activeItems.filter((item) => !item.read_at) : activeItems;
  async function markAllRead() {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", userId).is("read_at", null).is("archived_at", null);
    await load();
  }

  async function archiveRead() {
    await supabase.from("notifications").update({ archived_at: new Date().toISOString() }).eq("user_id", userId).not("read_at", "is", null).is("archived_at", null);
    await load();
  }

  async function toggleArchive(item: Notification) {
    await supabase.from("notifications").update({ archived_at: item.archived_at ? null : new Date().toISOString(), read_at: item.read_at ?? new Date().toISOString() }).eq("id", item.id).eq("user_id", userId);
    await load();
  }

  return <div ref={rootRef} onMouseLeave={() => setOpen(false)} className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-xl text-zinc-700 transition hover:bg-zinc-100">
      <Bell size={19}/>{unread > 0 && <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-zinc-950 px-1 text-[9px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>}
    </button>
    {open && <div className="absolute right-0 top-10 z-[120] w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-2xl">
      <div className="border-b border-zinc-100 px-5 py-4"><div className="flex items-center justify-between"><div><p className="font-semibold">Notifications</p><p className="text-xs text-zinc-400">{unread} unread</p></div><div className="flex gap-3">{unread > 0 && <button onClick={markAllRead} className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-zinc-600"><CheckCheck size={14}/> Read all</button>}{activeItems.some(item=>item.read_at)&&<button onClick={archiveRead} className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-zinc-600"><Archive size={14}/> Archive read</button>}</div></div><div className="mt-4 grid grid-cols-3 rounded-xl bg-zinc-100 p-1">{(["all","unread","archived"] as View[]).map(tab=><button key={tab} onClick={()=>setView(tab)} className={`cursor-pointer rounded-lg py-2 text-[11px] font-bold capitalize transition ${view===tab?"bg-white text-zinc-950 shadow-sm":"text-zinc-500"}`}>{tab}</button>)}</div></div>
      <div className="max-h-[430px] overflow-y-auto">{visibleItems.length ? visibleItems.map((item) => <div key={item.id} className={`group relative border-b border-zinc-100 transition hover:bg-zinc-50 ${item.read_at ? "bg-white" : "bg-violet-50/45"}`}><Link href={item.href ?? "#"} onClick={async () => { setOpen(false); if (!item.read_at) await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", item.id); }} className="block px-5 py-4 pr-12"><div className="flex gap-3">{!item.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-600"/>}<div><p className="text-sm font-semibold text-zinc-900">{item.title}</p><p className="mt-1 text-xs leading-5 text-zinc-500">{item.message}</p><p className="mt-2 text-[10px] text-zinc-400">{formatIndiaDateTime(item.created_at)}</p></div></div></Link><button type="button" onClick={()=>void toggleArchive(item)} aria-label={item.archived_at?"Restore notification":"Archive notification"} title={item.archived_at?"Restore":"Archive"} className="absolute right-3 top-4 grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-zinc-400 opacity-0 transition hover:bg-white hover:text-zinc-900 group-hover:opacity-100 focus:opacity-100">{item.archived_at?<Undo2 size={15}/>:<Archive size={15}/>}</button></div>) : <div className="px-6 py-12 text-center">{view==="archived"?<Archive className="mx-auto text-zinc-300"/>:view==="unread"?<Inbox className="mx-auto text-zinc-300"/>:<Bell className="mx-auto text-zinc-300"/>}<p className="mt-3 text-sm font-semibold">{view==="archived"?"No archived notifications":view==="unread"?"Nothing unread":"You are all caught up"}</p><p className="mt-1 text-xs text-zinc-400">{view==="archived"?"Archived updates will appear here.":"New updates will appear here."}</p></div>}</div>
    </div>}
  </div>;
}
