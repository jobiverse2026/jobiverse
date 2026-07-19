"use client";

import { useActionState, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Building2, Check, GraduationCap, LoaderCircle, Sparkles, UserRoundCheck } from "lucide-react";
import { createMarketplaceService, type CreateServiceState } from "./actions";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { creatorServiceGroups } from "@/lib/marketplace/creator-service-options";

type Audience = "professional" | "student" | "employer";
type ServiceOption = { title: string; description: string };

const serviceGroups = creatorServiceGroups.map((group) => ({
  ...group,
  icon: group.audience === "professional" ? UserRoundCheck : group.audience === "student" ? GraduationCap : Building2,
}));

const initialState: CreateServiceState = {};
const fieldClass = "mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/5";

export function ServiceForm() {
  const [state, action, pending] = useActionState(createMarketplaceService, initialState);
  const [selected, setSelected] = useState<Array<{ audience: Audience; service: ServiceOption }>>([]);
  const [showForms, setShowForms] = useState(false);

  const choose = (audience: Audience, service: ServiceOption) => {
    const key = `${audience}:${service.title}`;
    setSelected((current) =>
      current.some((item) => `${item.audience}:${item.service.title}` === key)
        ? current.filter((item) => `${item.audience}:${item.service.title}` !== key)
        : [...current, { audience, service }],
    );
    setShowForms(false);
  };

  const continueToForms = () => {
    setShowForms(true);
    setTimeout(() => document.getElementById("service-details")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const searchServices = (value: string) => {
    const query = value.trim().toLowerCase();
    document.querySelectorAll<HTMLButtonElement>('button[type="button"]').forEach((button) => {
      if (!button.querySelector("h4")) return;
      button.hidden = Boolean(query) && !button.textContent?.toLowerCase().includes(query);
    });
  };

  return (
    <div className={`space-y-8 ${showForms ? "" : "[&>#service-details]:hidden"}`}>
      <div className="rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-sm">
        <label className="text-xs font-bold uppercase tracking-[.16em] text-zinc-400">Search creator services</label>
        <input type="search" onChange={(event) => searchServices(event.target.value)} className="mt-3 min-h-14 w-full rounded-2xl bg-zinc-100 px-5 text-sm outline-none focus:ring-2 focus:ring-zinc-950" placeholder="Search CV templates, resume writing, mock interviews, hiring consultation..." />
      </div>

      {state.success && <div role="status" className="sticky top-28 z-40 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800 shadow-lg">{state.success}</div>}

      {selected.length > 0 && !showForms && (
        <div className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-zinc-950 p-3 pl-5 text-white shadow-2xl">
          <p className="text-sm font-semibold">{selected.length} service{selected.length === 1 ? "" : "s"} selected</p>
          <button type="button" onClick={continueToForms} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black">Next: Fill Forms <ArrowRight size={16} /></button>
        </div>
      )}

      {selected.some((item) => item.service.title === "Editable CV Template") && <TemplateUploadPanel />}

      <section className="rounded-[2.5rem] border border-zinc-200 bg-white p-7 shadow-sm sm:p-10">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Step 1 | Choose your services</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em]">What would you like to offer?</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-500">Select multiple services from any section. A separate blank listing form will open for every selection.</p>
        </div>
        {selected.length > 0 && <p className="mt-5 inline-flex rounded-full bg-zinc-950 px-4 py-2 text-xs font-semibold text-white">{selected.length} service{selected.length === 1 ? "" : "s"} selected</p>}
        <div className="mt-9 space-y-8">
          {serviceGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.audience}>
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white"><Icon size={21} /></span>
                  <div><h3 className="text-xl font-semibold">{group.label}</h3><p className="mt-1 text-sm text-zinc-500">{group.description}</p></div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.services.map((service) => {
                    const active = selected.some((item) => item.audience === group.audience && item.service.title === service.title);
                    return (
                      <button type="button" key={service.title} onClick={() => choose(group.audience, service)} className={`relative rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${active ? "border-zinc-950 bg-zinc-950 text-white shadow-xl" : "border-zinc-200 bg-zinc-50"}`}>
                        <div className="flex items-start justify-between gap-3"><h4 className="font-semibold">{service.title}</h4>{active && <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-black"><Check size={14} /></span>}</div>
                        <p className={`mt-2 text-xs leading-5 ${active ? "text-zinc-400" : "text-zinc-500"}`}>{service.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selected.length ? (
        <section id="service-details" className="scroll-mt-32 space-y-6">
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Step 2 | Listing details</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.035em]">Complete each selected service.</h2><p className="mt-2 text-sm text-zinc-500">Every form is blank and publishes as an independent marketplace listing.</p></div>
          {selected.map((item, index) => (
            <form key={`${item.audience}:${item.service.title}`} action={action} className="grid gap-6 rounded-[2.5rem] border border-zinc-200 bg-white p-7 shadow-sm sm:p-10">
              <input type="hidden" name="audience" value={item.audience} />
              <input type="hidden" name="category" value={item.service.title} />
              <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-zinc-400">Service {index + 1} of {selected.length}</p><h3 className="mt-2 text-2xl font-semibold">{item.service.title}</h3></div><button type="button" onClick={() => choose(item.audience, item.service)} className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600">Remove selection</button></div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold sm:col-span-2">Listing title<input className={fieldClass} name="title" placeholder="Enter your own listing title" required maxLength={100} /></label>
                <label className="text-sm font-semibold sm:col-span-2">Card description<input className={fieldClass} name="shortDescription" placeholder="Write a clear one-line summary for customers" required minLength={35} maxLength={240} /></label>
                <label className="text-sm font-semibold sm:col-span-2">Complete service details<textarea className={`${fieldClass} min-h-40 resize-y`} name="description" placeholder="Explain what is included, your process, required information and what the customer will receive." required minLength={120} maxLength={4000} /></label>
                <label className="text-sm font-semibold sm:col-span-2">Why are you fit for this service?<textarea className={`${fieldClass} min-h-28 resize-y`} name="fitReason" placeholder="Tell customers why you are the right person for this service: strengths, outcomes, process quality or specialization." required minLength={60} maxLength={1200} /></label>
                <label className="text-sm font-semibold sm:col-span-2">Relevant experience in this service / field<textarea className={`${fieldClass} min-h-28 resize-y`} name="relevantExperience" placeholder="Mention your hands-on experience, years, roles, industries, projects, hiring exposure or client work relevant to this service." required minLength={40} maxLength={1200} /></label>
                <label className="text-sm font-semibold">Your price (₹)<input className={fieldClass} name="price" type="number" min="0" max="1000000" step="1" placeholder="Enter price" required /></label>
                <label className="text-sm font-semibold">Delivery time (days)<input className={fieldClass} name="deliveryDays" type="number" min="1" max="90" placeholder="Enter days" required /></label>
                <label className="text-sm font-semibold sm:col-span-2">Delivery mode<select className={fieldClass} name="deliveryMode" defaultValue=""><option value="" disabled>Select delivery mode</option><option value="online">Online</option><option value="call">Video / voice call</option><option value="document">Document delivery</option><option value="hybrid">Hybrid</option></select></label>
              </div>
              {state.error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{state.error}</p>}
              <div className="flex flex-col justify-between gap-4 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center"><p className="flex items-center gap-2 text-sm text-zinc-500"><Sparkles size={16} /> This service becomes live immediately after publishing.</p><button disabled={pending} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-black via-zinc-800 to-black px-6 py-4 font-semibold text-white disabled:opacity-60">{pending ? <><LoaderCircle className="animate-spin" size={18} /> Publishing...</> : <>Publish this service <ArrowRight size={18} /></>}</button></div>
            </form>
          ))}
        </section>
      ) : <div className="rounded-[2rem] border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-500">Select one or more services above to open their blank listing forms.</div>}
    </div>
  );
}

function TemplateUploadPanel() {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [target, setTarget] = useState<HTMLFormElement | null>(null);
  useEffect(() => { const input = document.querySelector<HTMLInputElement>('input[name="category"][value="Editable CV Template"]'); setTarget(input?.closest("form") ?? null); }, []);
  const upload = async (file?: File) => {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["docx", "pptx"].includes(extension)) { setMessage("Please choose an editable DOCX or PPTX file."); return; }
    if (file.size > 10 * 1024 * 1024) { setMessage("File must be smaller than 10 MB."); return; }
    setUploading(true); setMessage("");
    const supabase = createBrowserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMessage("Please log in again before uploading."); setUploading(false); return; }
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("creator-templates").upload(path, file, { contentType: file.type, upsert: false });
    setMessage(error ? error.message : `${file.name} uploaded successfully.`);
    setUploading(false);
  };
  if (!target) return null;
  return createPortal(<section className="rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50 p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-zinc-400">Editable template file</p><h4 className="mt-2 text-lg font-semibold">Upload your DOCX or PPTX template</h4><p className="mt-1 text-xs leading-5 text-zinc-500">Original editable file | Maximum 10 MB | Delivered securely after purchase</p></div><label className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"><input className="sr-only" type="file" accept=".docx,.pptx" disabled={uploading} onChange={(event) => upload(event.target.files?.[0])} />{uploading ? "Uploading..." : "Upload template"}</label></div>{message && <p className={`mt-3 rounded-xl p-3 text-sm font-medium ${message.includes("successfully") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{message}</p>}<label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950"><input name="templateRightsAccepted" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-zinc-950" /><span>I confirm this is my original work or I am authorized to sell it. I accept the <a href="/creator-template-terms" target="_blank" rel="noreferrer" className="font-bold underline">Creator Template Terms</a>.</span></label></section>, target);
}
