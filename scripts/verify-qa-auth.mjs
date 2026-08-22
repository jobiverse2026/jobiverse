import nextEnv from "@next/env";
import {createClient} from "@supabase/supabase-js";
const{loadEnvConfig}=nextEnv;loadEnvConfig(process.cwd());
const roles=["STUDENT","CANDIDATE","EMPLOYER","RECRUITER","CREATOR","ADMIN"];
for(const role of roles){const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,{auth:{persistSession:false,autoRefreshToken:false}});const{data,error}=await client.auth.signInWithPassword({email:process.env[`TEST_${role}_EMAIL`],password:process.env[`TEST_${role}_PASSWORD`]});let dbRole=null;if(data.user){const{data:profile}=await client.from("users").select("role,is_active").eq("id",data.user.id).maybeSingle();dbRole=profile?.role??null;await client.auth.signOut()}process.stdout.write(`${role.toLowerCase()}: ${error?`FAIL ${error.message}`:`PASS role=${dbRole}`}\n`)}
