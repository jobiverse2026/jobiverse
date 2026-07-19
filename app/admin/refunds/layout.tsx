import { RefreshCw } from "lucide-react";
import { requireRole } from "@/lib/auth/authorization";
import { syncRefundStatus } from "./actions";

export default async function RefundsLayout({children}:{children:React.ReactNode}){
  const{supabase}=await requireRole(["admin"]);
  const{data:pending}=await supabase.from("marketplace_refund_requests").select("id,amount,gateway_refund_id").eq("status","gateway_pending").not("gateway_refund_id","is",null).order("requested_at",{ascending:false});
  return <>{pending?.length?<section className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-6"><div className="flex items-center gap-3"><RefreshCw className="text-amber-700"/><div><h2 className="font-bold text-amber-900">Razorpay confirmation pending</h2><p className="text-sm text-amber-700">Localhost cannot receive public webhooks. Sync the latest gateway status manually.</p></div></div><div className="mt-4 flex flex-wrap gap-2">{pending.map(item=><form key={item.id} action={syncRefundStatus}><input type="hidden" name="requestId" value={item.id}/><button className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white"><RefreshCw size={15}/>Sync ₹{Number(item.amount).toLocaleString("en-IN")}</button></form>)}</div></section>:null}{children}</>;
}
