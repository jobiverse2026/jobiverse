"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function updateUniversalProfile(formData:FormData){const fullName=z.string().trim().min(2).max(100).parse(formData.get("fullName"));const avatar=formData.get("avatar");const supabase=await createServerSupabaseClient();const{data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Please log in.");let avatarUrl:string|undefined;if(avatar instanceof File&&avatar.size>0){if(avatar.size>5*1024*1024)throw new Error("Profile photo must be under 5 MB.");const ext=avatar.name.split(".").pop()?.toLowerCase();if(!ext||!["png","jpg","jpeg","webp"].includes(ext))throw new Error("Upload PNG, JPG or WEBP.");const path=`${user.id}/avatar-${randomUUID()}.${ext}`;const{error}=await supabase.storage.from("user-avatars").upload(path,avatar);if(error)throw new Error(error.message);const{data}=supabase.storage.from("user-avatars").getPublicUrl(path);avatarUrl=data.publicUrl;}const updates:Record<string,string>={full_name:fullName};if(avatarUrl)updates.avatar_url=avatarUrl;const{error}=await supabase.from("users").update(updates).eq("id",user.id);if(error)throw new Error(error.message);revalidatePath("/account/profile");revalidatePath("/messages");redirect("/account/profile?success=profile_saved")}
