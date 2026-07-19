"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, LoaderCircle, Save } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function ChangePasswordForm({email,role}:{email:string;role:string}){
  const[currentPassword,setCurrentPassword]=useState("");
  const[newPassword,setNewPassword]=useState("");
  const[confirmPassword,setConfirmPassword]=useState("");
  const[visible,setVisible]=useState(false);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");
  const[success,setSuccess]=useState("");

  async function submit(event:React.FormEvent){
    event.preventDefault();setError("");setSuccess("");
    if(newPassword!==confirmPassword){setError("New passwords do not match.");return}
    if(newPassword.length<8||!/[A-Za-z]/.test(newPassword)||!/[0-9]/.test(newPassword)){setError("Use at least 8 characters with a letter and a number.");return}
    if(currentPassword===newPassword){setError("Choose a password different from your current password.");return}
    setLoading(true);
    const supabase=createBrowserSupabaseClient();
    const{error:verifyError}=await supabase.auth.signInWithPassword({email,password:currentPassword});
    if(verifyError){setError("Current password is incorrect. OAuth-only accounts can use Forgot Password to create a password.");setLoading(false);return}
    const{error:updateError}=await supabase.auth.updateUser({password:newPassword});
    if(updateError){setError(updateError.message);setLoading(false);return}
    setCurrentPassword("");setNewPassword("");setConfirmPassword("");
    setSuccess("Password changed successfully. Your current session remains active.");
    setLoading(false);
  }

  const inputClass="mt-2 h-14 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 outline-none transition focus:border-zinc-950 focus:bg-white focus:ring-4 focus:ring-zinc-950/5";
  return <form onSubmit={submit} className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm sm:p-9"><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Change password</p><h2 className="mt-3 text-3xl font-semibold">Choose a new secure password.</h2><div className="mt-7 space-y-5"><label className="block text-sm font-semibold">Current password<input type={visible?"text":"password"} value={currentPassword} onChange={event=>setCurrentPassword(event.target.value)} required autoComplete="current-password" className={inputClass}/></label><label className="block text-sm font-semibold">New password<input type={visible?"text":"password"} value={newPassword} onChange={event=>setNewPassword(event.target.value)} required autoComplete="new-password" className={inputClass}/></label><label className="block text-sm font-semibold">Confirm new password<input type={visible?"text":"password"} value={confirmPassword} onChange={event=>setConfirmPassword(event.target.value)} required autoComplete="new-password" className={inputClass}/></label><button type="button" onClick={()=>setVisible(value=>!value)} className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-zinc-600">{visible?<EyeOff size={17}/>:<Eye size={17}/>} {visible?"Hide passwords":"Show passwords"}</button></div>{error&&<p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</p>}{success&&<p role="status" className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{success}</p>}<button disabled={loading} className="mt-7 inline-flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-black via-zinc-800 to-black px-6 font-semibold text-white shadow-xl transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">{loading?<LoaderCircle className="animate-spin" size={18}/>:<Save size={18}/>} {loading?"Updating securely...":"Verify & Change Password"}</button><p className="mt-5 text-center text-xs text-zinc-400">OAuth-only account? <Link href={`/forgot-password?role=${role}`} className="font-semibold text-zinc-700 underline">Use Forgot Password</Link></p></form>;
}
