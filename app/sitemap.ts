import type { MetadataRoute } from "next";
import { marketplaceServices } from "@/lib/marketplace/service-catalog";
import { JOB_SECTORS } from "@/lib/jobs/sectors";
import { JOB_CITY_LANDINGS, JOB_ROLE_LANDINGS } from "@/lib/jobs/seo-landings";
import { adminSupabase } from "@/lib/supabase/admin";

export const revalidate = 3600;

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const base=(process.env.NEXT_PUBLIC_SITE_URL??"https://www.jobiverse.in").replace(/\/$/,"");
  const pages=[["",1,"daily"],["/jobs",1,"daily"],["/services",.9,"weekly"],["/pricing",.8,"weekly"],["/employers",.9,"weekly"],["/candidates",.9,"weekly"],["/students",.9,"weekly"],["/career-services",.8,"weekly"],["/earn-with-jobiverse",.8,"weekly"],["/marketplace",.9,"daily"],["/why-jobiverse",.8,"monthly"],["/about",.7,"monthly"],["/industries",.7,"monthly"],["/resources",.7,"weekly"],["/contact",.7,"monthly"],["/privacy-policy",.3,"yearly"],["/refund-policy",.3,"yearly"],["/terms",.3,"yearly"]] as const;
  const now=new Date();
  const {data:directJobs}=await adminSupabase.from("requirements").select("id,published_at,updated_at").eq("is_public",true).not("status","in",'("Closed","Cancelled")').limit(5000);
  return[
    ...pages.map(([path,priority,changeFrequency])=>({url:`${base}${path}`,lastModified:now,changeFrequency,priority})),
    ...JOB_SECTORS.map(sector=>({url:`${base}/jobs/sector/${sector.value}`,lastModified:now,changeFrequency:"daily" as const,priority:.8})),
    ...JOB_CITY_LANDINGS.map(item=>({url:`${base}/jobs/in/${item.slug}`,lastModified:now,changeFrequency:"daily" as const,priority:.8})),
    ...JOB_ROLE_LANDINGS.map(item=>({url:`${base}/jobs/role/${item.slug}`,lastModified:now,changeFrequency:"daily" as const,priority:.8})),
    ...(directJobs??[]).map(job=>({url:`${base}/jobs/${job.id}`,lastModified:new Date(job.updated_at||job.published_at||now),changeFrequency:"daily" as const,priority:.9})),
    ...marketplaceServices.map(service=>({url:`${base}/marketplace/services/${service.slug}`,lastModified:now,changeFrequency:"weekly" as const,priority:.7}))
  ];
}
