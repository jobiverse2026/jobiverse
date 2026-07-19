import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Download,
  Flag,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { MarkMessagesRead } from "@/components/marketplace/mark-messages-read";
import { MarkSupportRead } from "@/components/messages/mark-support-read";
import { adminSupabase } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  reportMessage,
  sendEnhancedMessage,
} from "@/app/marketplace/orders/[id]/messages/actions";
import { sendSupportMessage } from "./support/actions";

type SearchParams = Promise<{
  chat?: string | string[];
  order?: string | string[];
  q?: string | string[];
}>;

export default async function MessagesInboxPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const selected = await searchParams;
  const selectedChat = Array.isArray(selected.chat) ? selected.chat[0] : selected.chat;
  const selectedOrderId = Array.isArray(selected.order)
    ? selected.order[0]
    : selected.order;
  const query = (Array.isArray(selected.q) ? selected.q[0] : selected.q)?.trim().toLowerCase() ?? "";
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login/candidate?next=/messages");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role === "admin") redirect("/admin/support");

  const { data: allOrders } = await supabase
    .from("marketplace_orders")
    .select(
      "id,customer_id,provider_id,service_id,status,service_title,updated_at",
    )
    .or(`customer_id.eq.${user.id},provider_id.eq.${user.id}`)
    .order("updated_at", { ascending: false })
    .limit(100);
  const orderIds = (allOrders ?? []).map((order) => order.id);
  const { data: allMessages } = orderIds.length
    ? await supabase
        .from("marketplace_order_messages")
        .select(
          "id,order_id,sender_id,message,attachment_url,attachment_name,read_at,created_at",
        )
        .in("order_id", orderIds)
        .order("created_at", { ascending: false })
    : { data: [] };
  const activeOrderIds = new Set((allMessages ?? []).map((item) => item.order_id));
  const orders = (allOrders ?? []).filter((order) => activeOrderIds.has(order.id));
  const counterpartIds = [
    ...new Set(
      orders
        .map((order) =>
          order.customer_id === user.id ? order.provider_id : order.customer_id,
        )
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const serviceIds = [
    ...new Set(
      orders
        .map((order) => order.service_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const [
    { data: people },
    { data: legacyPeople },
    { data: services },
    supportResult,
  ] =
    await Promise.all([
      counterpartIds.length
        ? adminSupabase
            .from("users")
            .select("id,full_name,email,avatar_url")
            .in("id", counterpartIds)
        : Promise.resolve({ data: [] }),
      counterpartIds.length
        ? adminSupabase
            .from("profiles")
            .select("auth_user_id,full_name,email,avatar_url")
            .in("auth_user_id", counterpartIds)
        : Promise.resolve({ data: [] }),
      serviceIds.length
        ? supabase.from("marketplace_services").select("id,title").in("id", serviceIds)
        : Promise.resolve({ data: [] }),
      supabase
        .from("support_conversations")
        .select("id,status,unread_for_user,updated_at")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);
  let supportConversation = supportResult.data;
  if (!supportConversation) {
    const { data: conversationId } = await supabase.rpc(
      "get_or_create_support_conversation",
    );
    const resolvedId = Array.isArray(conversationId)
      ? conversationId[0]
      : conversationId;
    if (resolvedId) {
      const { data } = await supabase
        .from("support_conversations")
        .select("id,status,unread_for_user,updated_at")
        .eq("id", resolvedId)
        .maybeSingle();
      supportConversation = data;
    }
  }
  const { data: supportMessages } = supportConversation
    ? await supabase
        .from("support_messages")
        .select(
          "id,sender_id,message,attachment_url,attachment_name,created_at",
        )
        .eq("conversation_id", supportConversation.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const peopleMap = new Map(
    (legacyPeople ?? []).map((person) => [
      person.auth_user_id,
      {
        id: person.auth_user_id,
        full_name: person.full_name,
        email: person.email,
        avatar_url: person.avatar_url,
      },
    ]),
  );
  for (const person of people ?? []) {
    const legacy = peopleMap.get(person.id);
    peopleMap.set(person.id, {
      ...legacy,
      ...person,
      full_name: person.full_name || legacy?.full_name,
      email: person.email || legacy?.email,
      avatar_url: person.avatar_url || legacy?.avatar_url,
    });
  }
  const serviceMap = new Map(
    (services ?? []).map((service) => [service.id, service.title]),
  );
  const visibleOrders = query
    ? orders.filter((order) => {
        const person = peopleMap.get(
          order.customer_id === user.id ? order.provider_id : order.customer_id,
        );
        const service =
          (order.service_id && serviceMap.get(order.service_id)) ||
          order.service_title ||
          "";
        return `${person?.full_name ?? ""} ${person?.email ?? ""} ${service}`
          .toLowerCase()
          .includes(query);
      })
    : orders;
  const selectedOrder = selectedOrderId
    ? orders.find((order) => order.id === selectedOrderId)
    : null;
  const showSupport = selectedChat === "support";
  const selectedPerson = selectedOrder
    ? peopleMap.get(
        selectedOrder.customer_id === user.id
          ? selectedOrder.provider_id
          : selectedOrder.customer_id,
      )
    : null;
  const selectedIsJobiVerse = Boolean(selectedOrder && !selectedOrder.provider_id);
  const selectedName = selectedIsJobiVerse
    ? "JobiVerse"
    : selectedPerson?.full_name || selectedPerson?.email || "Platform member";
  const selectedMessages = selectedOrder
    ? (allMessages ?? [])
        .filter((message) => message.order_id === selectedOrder.id)
        .reverse()
    : [];
  const attachmentLinks = new Map<string, string>();
  const visibleMessages = showSupport ? supportMessages ?? [] : selectedMessages;
  for (const message of visibleMessages) {
    if (!message.attachment_url) continue;
    const bucket = showSupport ? "support-attachments" : "marketplace-messages";
    const { data } = await supabase.storage
      .from(bucket)
      .createSignedUrl(message.attachment_url, 3600);
    if (data?.signedUrl) attachmentLinks.set(message.id, data.signedUrl);
  }

  return (
    <main className="min-h-screen bg-[#efefec] px-3 pb-24 pt-28 sm:px-6 sm:pt-32">
      {showSupport && supportConversation && (
        <MarkSupportRead conversationId={supportConversation.id} />
      )}
      {selectedOrder && <MarkMessagesRead orderId={selectedOrder.id} />}
      <section className="mx-auto grid h-[calc(100vh-9rem)] min-h-[650px] max-w-[1500px] overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_35px_100px_-45px_rgba(0,0,0,.45)] lg:grid-cols-[390px_1fr]">
        <aside
          className={`${showSupport || selectedOrder ? "hidden lg:flex" : "flex"} min-h-0 flex-col border-r border-zinc-200 bg-[#fafaf8]`}
        >
          <div className="border-b border-zinc-200 px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-zinc-400">
                  JobiVerse connect
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">Messages</h1>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-950 text-white">
                <MessageCircle size={20} />
              </span>
            </div>
            <form className="mt-5 flex h-11 items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 text-zinc-400">
              <Search size={17} />
              <input
                name="q"
                defaultValue={query}
                placeholder="Search conversations"
                className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none"
              />
            </form>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <ConversationLink
              href="/messages?chat=support"
              active={showSupport}
              name="JobiVerse"
              subtitle={supportMessages?.[0]?.message ?? "Direct support from JobiVerse"}
              time={supportMessages?.[0]?.created_at}
              unread={supportConversation?.unread_for_user ?? 0}
              official
            />
            <div className="my-3 flex items-center gap-3 px-3">
              <span className="h-px flex-1 bg-zinc-200" />
              <span className="text-[9px] font-bold uppercase tracking-[.16em] text-zinc-400">
                Service conversations
              </span>
              <span className="h-px flex-1 bg-zinc-200" />
            </div>
            {visibleOrders.map((order) => {
              const messages = (allMessages ?? []).filter(
                (message) => message.order_id === order.id,
              );
              const last = messages[0];
              const unread = messages.filter(
                (message) => message.sender_id !== user.id && !message.read_at,
              ).length;
              const person = peopleMap.get(
                order.customer_id === user.id ? order.provider_id : order.customer_id,
              );
              const isJobiVerse = !order.provider_id;
              return (
                <ConversationLink
                  key={order.id}
                  href={`/messages?order=${order.id}`}
                  active={selectedOrder?.id === order.id}
                  name={isJobiVerse ? "JobiVerse" : person?.full_name || person?.email || "Platform member"}
                  avatar={person?.avatar_url}
                  official={isJobiVerse}
                  subtitle={last.message}
                  label={
                    (order.service_id && serviceMap.get(order.service_id)) ||
                    order.service_title ||
                    "Service order"
                  }
                  time={last.created_at}
                  unread={unread}
                />
              );
            })}
          </div>
        </aside>

        <section
          className={`${showSupport || selectedOrder ? "flex" : "hidden lg:flex"} min-h-0 flex-col bg-[#f3f1ec]`}
        >
          {showSupport ? (
            <ChatPanel
              userId={user.id}
              title="JobiVerse"
              subtitle="Official support | Typically replies soon"
              messages={supportMessages ?? []}
              attachmentLinks={attachmentLinks}
              official
              composer={
                supportConversation?.status === "open" ? (
                  <SupportComposer conversationId={supportConversation.id} />
                ) : null
              }
            />
          ) : selectedOrder ? (
            <ChatPanel
              userId={user.id}
              title={selectedName}
              subtitle={
                (selectedOrder.service_id && serviceMap.get(selectedOrder.service_id)) ||
                selectedOrder.service_title ||
                "Service conversation"
              }
              avatar={selectedPerson?.avatar_url}
              official={selectedIsJobiVerse}
              messages={selectedMessages}
              attachmentLinks={attachmentLinks}
              reportOrderId={selectedOrder.id}
              composer={
                !["cancelled", "refunded"].includes(selectedOrder.status) ? (
                  <OrderComposer orderId={selectedOrder.id} />
                ) : null
              }
            />
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center">
              <div>
                <div className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] bg-zinc-950 text-white shadow-xl">
                  <MessageCircle size={38} />
                </div>
                <h2 className="mt-7 text-3xl font-semibold tracking-tight">Your conversations, together.</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
                  Select a person from the left to open their conversation without leaving your inbox.
                </p>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function ConversationLink({
  href,
  active,
  name,
  subtitle,
  label,
  time,
  unread,
  avatar,
  official,
}: {
  href: string;
  active: boolean;
  name: string;
  subtitle: string;
  label?: string;
  time?: string;
  unread: number;
  avatar?: string | null;
  official?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`mb-1 flex gap-3 rounded-2xl p-3.5 transition ${
        active ? "bg-zinc-950 text-white shadow-lg" : "hover:bg-white"
      }`}
    >
      <Avatar url={avatar} name={name} official={official} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-bold">{name}</p>
          {time && (
            <time className={`shrink-0 text-[9px] ${active ? "text-white/50" : "text-zinc-400"}`}>
              {new Date(time).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })}
            </time>
          )}
        </div>
        {label && <p className={`mt-0.5 truncate text-[10px] font-semibold ${active ? "text-white/55" : "text-zinc-400"}`}>{label}</p>}
        <div className="mt-1 flex items-center gap-2">
          <p className={`min-w-0 flex-1 truncate text-xs ${unread ? "font-semibold" : active ? "text-white/60" : "text-zinc-500"}`}>
            {subtitle}
          </p>
          {unread > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-white">
              {unread}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

type Message = {
  id: string;
  sender_id: string;
  message: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  read_at?: string | null;
  created_at: string;
};

function ChatPanel({
  userId,
  title,
  subtitle,
  avatar,
  official,
  messages,
  attachmentLinks,
  reportOrderId,
  composer,
}: {
  userId: string;
  title: string;
  subtitle: string;
  avatar?: string | null;
  official?: boolean;
  messages: Message[];
  attachmentLinks: Map<string, string>;
  reportOrderId?: string;
  composer: React.ReactNode;
}) {
  return (
    <>
      <header className="flex h-[88px] items-center gap-4 border-b border-black/10 bg-white/90 px-5 backdrop-blur sm:px-7">
        <Link href="/messages" className="rounded-xl px-2 py-2 text-sm font-bold lg:hidden">
          Back
        </Link>
        <Avatar url={avatar} name={title} official={official} compact />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-bold">{title}</h2>
            {official && <ShieldCheck size={15} className="text-emerald-600" />}
          </div>
          <p className="truncate text-xs text-zinc-500">{subtitle}</p>
        </div>
        <button aria-label="Conversation options" className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl hover:bg-zinc-100">
          <MoreHorizontal size={20} />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,.055)_1px,transparent_0)] bg-[size:22px_22px] p-5 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-3">
          <p className="mx-auto mb-6 w-fit rounded-full bg-white/80 px-4 py-2 text-[9px] font-bold uppercase tracking-[.14em] text-zinc-400 shadow-sm">
            Private JobiVerse conversation
          </p>
          {messages.length ? (
            messages.map((message) => {
              const mine = message.sender_id === userId;
              return (
                <article
                  key={message.id}
                  className={`group w-fit max-w-[88%] rounded-[1.35rem] px-4 py-3 shadow-sm sm:max-w-[72%] ${
                    mine
                      ? "ml-auto rounded-br-md bg-zinc-950 text-white"
                      : "rounded-bl-md border border-black/5 bg-white text-zinc-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-6">{message.message}</p>
                  {attachmentLinks.has(message.id) && (
                    <a
                      href={attachmentLinks.get(message.id)}
                      target="_blank"
                      rel="noreferrer"
                      className={`mt-3 flex items-center gap-3 rounded-xl p-3 text-xs font-semibold ${mine ? "bg-white/10" : "bg-zinc-100"}`}
                    >
                      <Download size={15} />
                      <span className="truncate">{message.attachment_name ?? "View attachment"}</span>
                    </a>
                  )}
                  <div className="mt-2 flex items-center justify-end gap-2 text-[9px] opacity-45">
                    {reportOrderId && !mine && (
                      <details className="relative">
                        <summary className="cursor-pointer list-none"><Flag size={11} /></summary>
                        <form action={reportMessage} className="absolute bottom-5 right-0 z-10 flex w-72 gap-2 rounded-xl bg-white p-2 shadow-xl">
                          <input type="hidden" name="orderId" value={reportOrderId} />
                          <input type="hidden" name="messageId" value={message.id} />
                          <input name="reason" required minLength={5} placeholder="Report reason" className="min-w-0 flex-1 rounded-lg border px-2 text-xs text-zinc-950" />
                          <button className="cursor-pointer rounded-lg bg-red-600 px-3 text-white">Send</button>
                        </form>
                      </details>
                    )}
                    <time>{new Date(message.created_at).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" })}</time>
                    {mine && <span>{message.read_at ? "Read" : "Sent"}</span>}
                  </div>
                </article>
              );
            })
          ) : (
            <p className="py-24 text-center text-sm text-zinc-400">Start this conversation with a message.</p>
          )}
        </div>
      </div>
      <footer className="border-t border-black/10 bg-white p-4 sm:p-5">{composer}</footer>
    </>
  );
}

function SupportComposer({ conversationId }: { conversationId: string }) {
  return (
    <form action={sendSupportMessage} className="mx-auto flex max-w-4xl items-end gap-3">
      <input type="hidden" name="conversationId" value={conversationId} />
      <AttachmentButton name="attachment" />
      <textarea name="message" maxLength={3000} rows={1} placeholder="Message JobiVerse" className="max-h-32 min-h-12 min-w-0 flex-1 resize-y rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-zinc-500" />
      <SendButton />
    </form>
  );
}

function OrderComposer({ orderId }: { orderId: string }) {
  return (
    <form action={sendEnhancedMessage} className="mx-auto flex max-w-4xl items-end gap-3">
      <input type="hidden" name="orderId" value={orderId} />
      <AttachmentButton name="attachment" />
      <textarea name="message" maxLength={2000} rows={1} placeholder="Write a message" className="max-h-32 min-h-12 min-w-0 flex-1 resize-y rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-zinc-500" />
      <SendButton />
    </form>
  );
}

function AttachmentButton({ name }: { name: string }) {
  return (
    <label className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-2xl border border-zinc-200 transition hover:bg-zinc-100">
      <Paperclip size={19} />
      <input name={name} type="file" accept=".pdf,.docx,.zip,.png,.jpg,.jpeg,.txt" className="sr-only" />
    </label>
  );
}

function SendButton() {
  return (
    <button aria-label="Send message" className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-2xl bg-zinc-950 text-white shadow-lg transition hover:-translate-y-0.5">
      <Send size={18} />
    </button>
  );
}

function Avatar({
  url,
  name,
  official,
  compact,
}: {
  url?: string | null;
  name: string;
  official?: boolean;
  compact?: boolean;
}) {
  const size = compact ? "h-11 w-11" : "h-12 w-12";
  if (official) {
    return (
      <div className={`grid ${size} shrink-0 place-items-center rounded-full bg-white p-1 shadow-sm`}>
        <Image src="/images/branding/jobiverse-logo.svg" alt="JobiVerse" width={44} height={44} />
      </div>
    );
  }
  return url ? (
    <Image src={url} alt={name} width={48} height={48} unoptimized className={`${size} shrink-0 rounded-full object-cover`} />
  ) : (
    <div className={`grid ${size} shrink-0 place-items-center rounded-full bg-zinc-200 text-zinc-500`}>
      <UserRound size={20} />
    </div>
  );
}




