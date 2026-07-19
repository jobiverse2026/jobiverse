"use server";
import {revalidatePath} from "next/cache";
import {z} from "zod";
import {requireRole} from "@/lib/auth/authorization";
import {redirect} from "next/navigation";

const schema=z.object({days:z.array(z.coerce.number().int().min(0).max(6)).min(1,"Select at least one working day."),start:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),end:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),notice:z.coerce.number().int().min(1).max(168),capacity:z.coerce.number().int().min(1).max(20),accepting:z.boolean()});
export async function saveCreatorAvailability(formData:FormData){const parsed=schema.parse({days:formData.getAll("days"),start:formData.get("startTime"),end:formData.get("endTime"),notice:formData.get("minimumNoticeHours"),capacity:formData.get("maximumDailyBookings"),accepting:formData.get("isAcceptingBookings")==="on"});if(parsed.start>=parsed.end)throw new Error("End time must be later than start time.");const{supabase,user}=await requireRole(["candidate","creator"]);const{error}=await supabase.from("creator_availability").upsert({creator_id:user.id,available_days:[...new Set(parsed.days)].sort(),start_time:parsed.start,end_time:parsed.end,minimum_notice_hours:parsed.notice,maximum_daily_bookings:parsed.capacity,timezone:"Asia/Kolkata",is_accepting_bookings:parsed.accepting},{onConflict:"creator_id"});if(error)throw new Error(error.message);revalidatePath("/earn-with-jobiverse/dashboard/availability");redirect("/earn-with-jobiverse/dashboard/availability?saved=1");}


