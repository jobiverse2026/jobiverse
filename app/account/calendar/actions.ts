"use server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/authorization";
export async function saveInterviewReminderPreferences(formData:FormData){const{supabase,user}=await requireRole(["employer","recruiter"]);const hours=formData.getAll("hours").map(Number).filter(value=>[1,2,6,12,24,48].includes(value));const{error}=await supabase.from("notification_preferences").upsert({user_id:user.id,interview_reminders_enabled:formData.get("enabled")==="on",interview_reminder_hours:hours.length?hours:[24,2],updated_at:new Date().toISOString()},{onConflict:"user_id"});if(error)throw new Error(error.message);revalidatePath("/account/calendar")}
