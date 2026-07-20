import Link from "next/link";
import { ArrowLeft, PencilLine } from "lucide-react";

import { getRequirement } from "@/actions/requirements";
import RequirementForm from "@/components/employer/requirements/RequirementForm";

export const dynamic = "force-dynamic";

export default async function EditRequirementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const requirement = await getRequirement(id);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f5f3] px-5 pb-24 pt-36 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(255,255,255,.95),transparent_28%),radial-gradient(circle_at_88%_24%,rgba(161,161,170,.18),transparent_24%)]" />
      <div className="relative mx-auto max-w-7xl">
        <Link href={`/employers/requirements/${id}`} className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm backdrop-blur-xl transition hover:-translate-x-1 hover:border-black/20">
          <ArrowLeft size={16} /> Back to requirement
        </Link>

        <section className="mb-10 overflow-hidden rounded-[2.5rem] border border-white/80 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-700 p-8 text-white shadow-[0_35px_100px_-45px_rgba(0,0,0,.65)] md:p-12">
          <PencilLine />
          <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Edit hiring mandate</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">Refine requirement details.</h1>
          <p className="mt-5 max-w-3xl text-zinc-300">
            Update the role brief, skills, location, priority and hiring details. Publishing, JobiVerse hiring support and recruiter assignment remain available from the requirement detail page.
          </p>
        </section>

        <RequirementForm mode="edit" requirementId={id} initialValues={requirement} />
      </div>
    </main>
  );
}
