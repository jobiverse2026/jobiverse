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
  const displayedSkills = skills.length ? skills.slice(0, compact ? 3 : 5) : ["Add top skills"];

  return (
    <article className={`relative overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white text-zinc-950 shadow-[0_28px_85px_-60px_rgba(0,0,0,.55)] ${compact ? "p-3" : "p-4 sm:p-5"}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(24,24,27,.07),transparent_14rem)]" />
      <div className="relative z-10">
        <div className={`relative overflow-hidden rounded-[1.6rem] bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,.2),transparent_11rem),linear-gradient(135deg,#18181b,#3f3f46_58%,#f4f4f5)] ${compact ? "p-4" : "p-5"} text-white`}>
          <div className="pointer-events-none absolute -right-7 -top-8 h-32 w-32 rounded-full border border-white/15" />
          <div className="pointer-events-none absolute right-4 top-1/2 grid h-20 w-20 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-white/[.08] sm:h-24 sm:w-24">
            <img src="/images/branding/jobiverse-logo.svg?v=transparent-2" alt="" className="h-14 w-14 object-contain opacity-20 grayscale invert sm:h-16 sm:w-16" />
          </div>
          <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`${compact ? "h-11 w-11 text-sm" : "h-13 w-13 text-base"} grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white/15 font-bold text-white shadow-inner backdrop-blur`}>
              {person?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={person.avatar_url} alt={name} className="h-full w-full object-cover" />
              ) : (
                name.split(" ").map((word) => word[0]).join("").slice(0, 2)
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/55">JobiVerse Card</p>
              <h3 className={`${compact ? "text-lg" : "text-2xl"} mt-1 truncate font-semibold tracking-[-.035em]`}>{name}</h3>
              <p className={`${compact ? "line-clamp-1 text-xs" : "line-clamp-2 text-sm"} mt-1 max-w-[22rem] font-medium leading-5 text-white/70`}>{headline}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {open && <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-emerald-800 shadow-sm">Open to work</span>}
            {verifiedCount > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-zinc-950"><BadgeCheck size={12} />{verifiedCount}</span>}
          </div>
          </div>
        </div>

        <div className={`mt-5 grid gap-2 ${compact ? "grid-cols-1" : "sm:grid-cols-3"}`}>
          <Mini icon={BriefcaseBusiness} label="Experience" value={experienceLabel(profile?.total_experience)} />
          <Mini icon={Sparkles} label="Role level" value={profile?.role_level || roles[0] || "Not added"} />
          {!compact && <Mini icon={MapPin} label="Location" value={profile?.current_location || "Not added"} />}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {displayedSkills.map((skill) => (
            <span key={skill} className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold text-zinc-700">{skill}</span>
          ))}
        </div>

        {!compact && (
          <div className="mt-5 grid gap-2 sm:grid-cols-4">
            <Detail label="Industry" value={profile?.industry} />
            <Detail label="Function" value={profile?.functional_area} />
            <Detail label="Work mode" value={profile?.work_mode} />
            <Detail label="Completion" value={profile?.profile_completion == null ? null : `${profile.profile_completion}%`} />
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {editable && (
            <Link href="/career-passport" className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white">
              Edit JobiVerse Card
            </Link>
          )}
          {publicHref && (
            <Link href={publicHref} target="_blank" className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold text-zinc-950">
              View public card <ExternalLink size={15} />
            </Link>
          )}
          {!publicHref && editable && (
            <span className="inline-flex items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2.5 text-[11px] font-semibold text-amber-200">
              <Globe2 size={14} /> Make it public to share outside JobiVerse
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function Mini({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3"><Icon size={14} className="text-zinc-500" /><p className="mt-2 text-[9px] font-bold uppercase tracking-[.14em] text-zinc-500">{label}</p><p className="mt-1 truncate text-xs font-semibold text-zinc-950">{value}</p></div>;
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm"><p className="text-[9px] font-bold uppercase tracking-[.14em] text-zinc-500">{label}</p><p className="mt-1 truncate text-xs font-semibold text-zinc-950">{value || "Not added"}</p></div>;
}
