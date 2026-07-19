import Link from "next/link";
import { BadgeCheck, BriefcaseBusiness, ExternalLink, Globe2, MapPin, Sparkles } from "lucide-react";

type ProfileLike = {
  headline?: string | null;
  current_location?: string | null;
  total_experience?: string | number | null;
  relevant_experience_years?: string | number | null;
  primary_skills?: string | null;
  preferred_roles?: string | null;
  role_level?: string | null;
  industry?: string | null;
  functional_area?: string | null;
  work_mode?: string | null;
  open_to_work?: boolean | null;
  profile_completion?: number | null;
};

type PassportLike = {
  headline?: string | null;
  summary?: string | null;
  visibility?: string | null;
  public_slug?: string | null;
  open_to_opportunities?: boolean | null;
};

type UserLike = {
  full_name?: string | null;
  avatar_url?: string | null;
};

type ItemLike = {
  id?: string;
  item_type?: string | null;
  title?: string | null;
  issuer?: string | null;
  description?: string | null;
  evidence_url?: string | null;
  verification_status?: string | null;
};

function splitList(value?: string | null) {
  return (value ?? "")
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function experienceLabel(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "Not added";
  const raw = String(value).trim();
  return raw.toLowerCase().includes("year") ? raw : `${raw} years`;
}

export function JobiVerseCard({
  person,
  profile,
  passport,
  items = [],
  editable = false,
  compact = false,
}: {
  person?: UserLike | null;
  profile?: ProfileLike | null;
  passport?: PassportLike | null;
  items?: ItemLike[] | null;
  editable?: boolean;
  compact?: boolean;
}) {
  const name = person?.full_name ?? "JobiVerse Member";
  const headline = passport?.headline || profile?.headline || profile?.preferred_roles || "Professional on JobiVerse";
  const skills = splitList(profile?.primary_skills);
  const roles = splitList(profile?.preferred_roles);
  const publicHref = passport?.visibility === "public" && passport.public_slug ? `/p/${passport.public_slug}` : null;
  const open = Boolean(profile?.open_to_work || passport?.open_to_opportunities);
  const verifiedCount = (items ?? []).filter((item) => item.verification_status === "verified").length;

  return (
    <article className={`relative overflow-hidden rounded-[2.25rem] border border-zinc-200 bg-white p-6 shadow-[0_28px_90px_-55px_rgba(0,0,0,.6)] ${compact ? "" : "sm:p-8"}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(0,0,0,.09),transparent_15rem),radial-gradient(circle_at_92%_10%,rgba(113,113,122,.18),transparent_16rem)]" />
      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-zinc-950 text-xl font-bold text-white">
              {person?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={person.avatar_url} alt={name} className="h-full w-full object-cover" />
              ) : (
                name.split(" ").map((word) => word[0]).join("").slice(0, 2)
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">JobiVerse Card</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-[-.03em]">{name}</h3>
              <p className="mt-1 text-sm font-medium text-zinc-500">{headline}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {open && <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">Open to work</span>}
            {verifiedCount > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-bold text-white"><BadgeCheck size={13} /> {verifiedCount} verified</span>}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Mini icon={BriefcaseBusiness} label="Experience" value={experienceLabel(profile?.total_experience)} />
          <Mini icon={Sparkles} label="Role level" value={profile?.role_level || roles[0] || "Not added"} />
          <Mini icon={MapPin} label="Location" value={profile?.current_location || "Not added"} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(skills.length ? skills : ["Add top skills"]).map((skill) => (
            <span key={skill} className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700">{skill}</span>
          ))}
        </div>

        {!compact && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Detail label="Industry" value={profile?.industry} />
            <Detail label="Function" value={profile?.functional_area} />
            <Detail label="Work mode" value={profile?.work_mode} />
            <Detail label="Completion" value={profile?.profile_completion == null ? null : `${profile.profile_completion}%`} />
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {editable && (
            <Link href="/career-passport" className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">
              Edit JobiVerse Card
            </Link>
          )}
          {publicHref && (
            <Link href={publicHref} target="_blank" className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800">
              View public card <ExternalLink size={15} />
            </Link>
          )}
          {!publicHref && editable && (
            <span className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
              <Globe2 size={14} /> Make it public to share outside JobiVerse
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function Mini({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <div className="rounded-2xl bg-zinc-50 p-4"><Icon size={16} className="text-zinc-400" /><p className="mt-3 text-[10px] font-bold uppercase tracking-[.14em] text-zinc-400">{label}</p><p className="mt-1 text-sm font-semibold text-zinc-800">{value}</p></div>;
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return <div className="rounded-2xl border border-zinc-100 p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-zinc-400">{label}</p><p className="mt-1 text-sm font-semibold text-zinc-800">{value || "Not added"}</p></div>;
}
