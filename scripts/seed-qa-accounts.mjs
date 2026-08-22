import crypto from "node:crypto";
import fs from "node:fs";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(process.cwd());
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw new Error("Supabase admin environment is not configured.");
const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
const password=`JvQA!${crypto.randomBytes(12).toString("base64url")}9a`;
const domain="jobiverse.in";
const accounts=[
  {key:"STUDENT",email:`qa.student@${domain}`,role:"candidate",name:"QA Student",student:true},
  {key:"CANDIDATE",email:`qa.candidate@${domain}`,role:"candidate",name:"QA Professional"},
  {key:"EMPLOYER",email:`qa.employer@${domain}`,role:"employer",name:"QA Employer"},
  {key:"RECRUITER",email:`qa.recruiter@${domain}`,role:"recruiter",name:"QA Recruiter"},
  {key:"CREATOR",email:`qa.creator@${domain}`,role:"creator",name:"QA Creator"},
  {key:"ADMIN",email:`qa.admin@${domain}`,role:"admin",name:"QA Admin"},
];
const listed=[];for(let page=1;page<=10;page++){const{data,error}=await supabase.auth.admin.listUsers({page,perPage:1000});if(error)throw error;listed.push(...data.users);if(data.users.length<1000)break}
for(const account of accounts){let user=listed.find(item=>item.email?.toLowerCase()===account.email);if(user){const{data,error}=await supabase.auth.admin.updateUserById(user.id,{password,email_confirm:true,user_metadata:{role:account.role,full_name:account.name,career_stage:account.student?"student":undefined,qa_account:true}});if(error)throw error;user=data.user}else{const{data,error}=await supabase.auth.admin.createUser({email:account.email,password,email_confirm:true,user_metadata:{role:account.role,full_name:account.name,career_stage:account.student?"student":undefined,qa_account:true}});if(error)throw error;user=data.user}
  const{error:profileError}=await supabase.from("users").upsert({id:user.id,email:account.email,full_name:account.name,role:account.role,is_active:true},{onConflict:"id"});if(profileError)throw profileError;
  if(account.role==="candidate"){const{error}=await supabase.from("candidate_profiles").upsert({user_id:user.id,career_stage:account.student?"student":"professional",profile_completion:account.student?35:45},{onConflict:"user_id"});if(error&&!/column .* does not exist/i.test(error.message))throw error}
}
const employer=listed.find(item=>item.email?.toLowerCase()===`qa.employer@${domain}`)??(await supabase.auth.admin.listUsers({page:1,perPage:1000})).data.users.find(item=>item.email?.toLowerCase()===`qa.employer@${domain}`);
const recruiter=listed.find(item=>item.email?.toLowerCase()===`qa.recruiter@${domain}`)??(await supabase.auth.admin.listUsers({page:1,perPage:1000})).data.users.find(item=>item.email?.toLowerCase()===`qa.recruiter@${domain}`);
if(!employer||!recruiter)throw new Error("QA employer or recruiter was not created.");
const{data:company,error:companyError}=await supabase.from("companies").upsert({owner_id:employer.id,company_name:"JobiVerse QA Company",company_email:employer.email,industry:"Technology",location:"Mumbai",city:"Mumbai",state:"Maharashtra",country:"India",recruiter_seat_limit:5,employer_seat_limit:2},{onConflict:"owner_id"}).select("id").single();if(companyError)throw companyError;
const{error:memberError}=await supabase.from("employer_team_members").upsert({company_id:company.id,employer_id:employer.id,user_id:recruiter.id,email:recruiter.email,role:"recruiter",status:"active"},{onConflict:"company_id,user_id"});if(memberError)throw memberError;
const envPath=".env.local";let env=fs.existsSync(envPath)?fs.readFileSync(envPath,"utf8"):"";for(const account of accounts){const values={[`TEST_${account.key}_EMAIL`]:account.email,[`TEST_${account.key}_PASSWORD`]:password};for(const[name,value]of Object.entries(values)){const line=`${name}=${value}`;const regex=new RegExp(`^${name}=.*$`,`m`);env=regex.test(env)?env.replace(regex,line):`${env.trimEnd()}\n${line}\n`}}fs.writeFileSync(envPath,env);
const credentialPath="qa-credentials.local.txt";fs.writeFileSync(credentialPath,["JOBIVERSE QA ACCOUNTS","====================","All accounts share one password.","",...accounts.map(a=>`${a.name}: ${a.email}`),"",`Password: ${password}`,"","Testing only. Never use these accounts for real users, payments or production operations."].join("\n"));
const ignorePath=".gitignore";let ignore=fs.readFileSync(ignorePath,"utf8");if(!ignore.includes("qa-credentials.local.txt"))fs.appendFileSync(ignorePath,"\n# Local QA credentials\nqa-credentials.local.txt\n");
process.stdout.write(`Seeded ${accounts.length} isolated QA accounts and saved local credentials.\n`);
