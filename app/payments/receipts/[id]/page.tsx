import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getResumeTemplate } from "@/lib/resume-templates";
import { PrintReceiptButton } from "@/components/payments/print-receipt-button";
import { JOBIVERSE_COMPANY } from "@/lib/company-details";

const JOBIVERSE_GSTIN=JOBIVERSE_COMPANY.gstin;

export default async function PaymentReceiptPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const supabase=await createServerSupabaseClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)redirect(`/login/candidate?next=/payments/receipts/${id}`);
  const {data:profile}=await supabase.from("users").select("role").eq("id",user.id).maybeSingle();
  const isAdmin=profile?.role==="admin";
  const {data:attempt}=await supabase.from("payment_attempts").select("id,user_id,target_type,target_id,local_order_id,amount,gateway_order_id,gateway_payment_id,status,created_at").eq("id",id).maybeSingle();
  if(!attempt||(!isAdmin&&attempt.user_id!==user.id)||!["captured","refunded"].includes(attempt.status))notFound();
  const [{data:customer},{data:order},{data:billingProfile}]=await Promise.all([
    supabase.from("users").select("full_name,email").eq("id",attempt.user_id).maybeSingle(),
    attempt.local_order_id?supabase.from("marketplace_orders").select("service_title,marketplace_services(title)").eq("id",attempt.local_order_id).maybeSingle():Promise.resolve({data:null}),
    supabase.from("buyer_billing_profiles").select("billing_name,address_line,city,state,pincode,gstin").eq("user_id",attempt.user_id).maybeSingle(),
  ]);
  const service=order?(Array.isArray(order.marketplace_services)?order.marketplace_services[0]:order.marketplace_services):null;
  const description=attempt.target_type==="resume_download"?`${getResumeTemplate(attempt.target_id).name} premium CV template`:service?.title??order?.service_title??"JobiVerse marketplace service";
  const receiptNumber=`JV-RCP-${new Date(attempt.created_at).getFullYear()}-${attempt.id.slice(0,8).toUpperCase()}`;
  return <main className="min-h-screen bg-[#f5f5f3] px-5 pb-24 pt-36 print:bg-white print:p-0 sm:px-8"><div className="mx-auto max-w-4xl">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden"><Link href={isAdmin?"/admin/finance":"/account/billing"} className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600"><ArrowLeft size={16}/> {isAdmin?"Back to Finance":"Back to Billing & Purchases"}</Link><div className="flex flex-wrap gap-2">{!isAdmin&&attempt.local_order_id&&<Link href={`/marketplace/orders/${attempt.local_order_id}/refund`} className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700">Request refund</Link>}<PrintReceiptButton/></div></div>
    <article className="overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-white shadow-xl print:rounded-none print:border-0 print:shadow-none">
      <header className="flex flex-wrap items-start justify-between gap-6 bg-zinc-950 p-8 text-white sm:p-12 print:bg-white print:px-0 print:text-zinc-950"><div className="flex items-center gap-4"><div className="rounded-2xl bg-white p-2"><Image src="/images/branding/jobiverse-logo.svg" alt="JobiVerse" width={54} height={54}/></div><div><h1 className="text-2xl font-bold">JobiVerse</h1><p className="mt-1 text-sm text-zinc-400">India&apos;s Hiring & Career Platform</p><p className="mt-1 text-xs text-zinc-400">GSTIN: {JOBIVERSE_GSTIN}</p></div></div><div className="text-right"><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Payment Receipt</p><p className="mt-2 font-mono text-sm">{receiptNumber}</p></div></header>
      <div className="p-8 sm:p-12 print:px-0"><div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-5 text-emerald-800"><BadgeCheck/><div><p className="font-bold">Payment successfully received</p><p className="mt-1 text-sm">Verified through Razorpay</p></div></div>
        <section className="mt-8 grid gap-6 sm:grid-cols-2"><Block label="Received from"><p className="font-semibold">{billingProfile?.billing_name??customer?.full_name??"JobiVerse customer"}</p><p className="mt-1 text-sm text-zinc-500">{customer?.email}</p>{billingProfile&&<><p className="mt-2 text-sm leading-5 text-zinc-500">{billingProfile.address_line}<br/>{billingProfile.city}, {billingProfile.state} - {billingProfile.pincode}</p>{billingProfile.gstin&&<p className="mt-2 text-xs font-semibold text-zinc-600">Buyer GSTIN: {billingProfile.gstin}</p>}</>}</Block><Block label="Receipt date"><p className="font-semibold">{new Date(attempt.created_at).toLocaleString("en-IN",{dateStyle:"long",timeStyle:"short"})}</p></Block></section>
        <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-200"><div className="grid grid-cols-[1fr_auto] gap-4 bg-zinc-50 px-5 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500"><span>Description</span><span>Amount</span></div><div className="grid grid-cols-[1fr_auto] gap-4 px-5 py-6"><div><p className="font-semibold">{description}</p><p className="mt-2 text-xs text-zinc-500">{attempt.target_type.replaceAll("_"," ")}</p></div><p className="font-bold">{money(attempt.amount)}</p></div><div className="flex justify-between border-t border-zinc-200 bg-zinc-950 px-5 py-5 text-white print:bg-zinc-100 print:text-zinc-950"><span className="font-semibold">Total paid</span><span className="text-xl font-bold">{money(attempt.amount)}</span></div></section>
        <section className="mt-8 grid gap-4 sm:grid-cols-2"><Value label="Razorpay payment ID" value={attempt.gateway_payment_id??"Verified"}/><Value label="Razorpay order ID" value={attempt.gateway_order_id??"-"}/></section>
        <div className="mt-8 rounded-2xl bg-zinc-50 p-5 text-sm leading-6 text-zinc-600"><p className="font-semibold text-zinc-900">Payment receipt - not a GST tax invoice</p><p className="mt-1">GSTIN is shown for supplier identification. No GST has been separately charged on this receipt. A tax invoice requires the applicable tax rate, tax amount, place of supply and all other statutory particulars.</p></div>
        <footer className="mt-10 border-t border-zinc-200 pt-6 text-xs leading-5 text-zinc-500"><p>JobiVerse | Mumbai, India | GSTIN {JOBIVERSE_GSTIN}</p><p>jobiverse@outlook.com | +91 77388 32231</p><p className="mt-1">This computer-generated payment receipt does not require a signature.</p></footer>
      </div>
    </article>
  </div></main>;
}

function money(value:number|string){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:2}).format(Number(value)||0)}
function Block({label,children}:{label:string;children:React.ReactNode}){return <div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">{label}</p>{children}</div>}
function Value({label,value}:{label:string;value:string}){return <div className="rounded-2xl bg-zinc-50 p-4"><p className="text-xs font-bold uppercase text-zinc-400">{label}</p><p className="mt-2 break-all font-mono text-xs text-zinc-700">{value}</p></div>}







