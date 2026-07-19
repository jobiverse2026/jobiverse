import { notFound } from "next/navigation";
import ResumeTemplateCatalog from "@/components/candidate/ResumeTemplateCatalog";

export default function DevelopmentResumePreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <main className="min-h-screen bg-[#f5f5f3] px-6 pb-24 pt-32"><div className="mx-auto max-w-7xl"><h1 className="text-4xl font-semibold">Resume Design QA</h1><ResumeTemplateCatalog /></div></main>;
}
