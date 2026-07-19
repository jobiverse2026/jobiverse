import { BadgeCheck, MapPin } from "lucide-react";
import { saveBuyerBillingProfile } from "@/actions/buyer-billing";

export type BuyerBillingProfile={billing_name:string;address_line:string;city:string;state:string;pincode:string;gstin:string|null};

export function BillingProfileCard({profile,compact=false}:{profile:BuyerBillingProfile|null;compact?:boolean}){
  return <section className={`rounded-[2rem] border border-zinc-200 bg-white ${compact?"p-6":"p-7 sm:p-8"}`}>
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-zinc-400">Buyer details</p><h2 className="mt-2 text-xl font-semibold">Billing profile</h2></div>{profile&&<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><BadgeCheck size={13}/>Ready</span>}</div>
    <p className="mt-3 text-sm leading-6 text-zinc-500">Required for receipts. GSTIN is optional for individual customers.</p>
    <form action={saveBuyerBillingProfile} className="mt-6 grid gap-4 sm:grid-cols-2">
      <Field label="Billing / legal name" name="billingName" defaultValue={profile?.billing_name} span required/>
      <Field label="Address" name="addressLine" defaultValue={profile?.address_line} span required/>
      <Field label="City" name="city" defaultValue={profile?.city} required/>
      <Field label="State" name="state" defaultValue={profile?.state} required/>
      <Field label="Pincode" name="pincode" defaultValue={profile?.pincode} required inputMode="numeric" maxLength={6}/>
      <Field label="GSTIN (optional for Indian buyers)" name="gstin" defaultValue={profile?.gstin??""} maxLength={15}/>
      <button className="cursor-pointer rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white sm:col-span-2">{profile?"Update billing details":"Save billing details"}</button>
    </form>
  </section>;
}

function Field({label,name,defaultValue="",span=false,...props}:{label:string;name:string;defaultValue?:string;span?:boolean;required?:boolean;inputMode?:"numeric";maxLength?:number}){return <label className={`text-sm font-semibold text-zinc-700 ${span?"sm:col-span-2":""}`}>{label}<input name={name} defaultValue={defaultValue} className="mt-2 h-12 w-full rounded-xl border border-zinc-200 px-4 font-normal outline-none focus:border-zinc-500" {...props}/></label>}
