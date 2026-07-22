import Link from "next/link";
import { ArrowRight, Building2, GraduationCap, Palette, Sparkles, UsersRound } from "lucide-react";

const worlds = [
  {
    title: "Talent World",
    eyebrow: "Professionals & experienced talent",
    description: "Create your profile, build your JobiVerse Card, explore active jobs, save roles and apply with a stronger career identity.",
    href: "/signup?role=candidate",
    action: "Sign up as talent",
    icon: UsersRound,
    points: ["JobiVerse Card", "Active jobs", "Career score", "Resume and interview services"],
  },
  {
    title: "Student World",
    eyebrow: "Students, freshers & recent graduates",
    description: "Start your first-career journey with resume support, projects, interview readiness, internships and practical job guidance.",
    href: "/signup?role=candidate",
    action: "Sign up as student",
    icon: GraduationCap,
    points: ["First job support", "Campus readiness", "Project guidance", "Fresher services"],
  },
  {
    title: "Employer World",
    eyebrow: "Companies & hiring teams",
    description: "See employer-only portal benefits, access model, seat pricing, hiring support, Talent Search and workspace plans.",
    href: "/choose-your-world/employers",
    action: "View employer benefits & pricing",
    icon: Building2,
    points: ["Employer workspace", "Team seats", "Hiring reports", "Talent Search add-on"],
    featured: true,
  },
  {
    title: "Creator World",
    eyebrow: "Experts, mentors & template creators",
    description: "Publish career services, upload editable CV templates, receive orders, deliver work and earn through JobiVerse.",
    href: "/signup?role=creator",
    action: "Sign up as creator",
    icon: Palette,
    points: ["Service listings", "Template uploads", "Orders", "Payout tracking"],
  },
];

export default function ChooseYourWorldPage() {
  return (
    <main className="min-h-screen bg-[#f6f6f3] px-5 pb-24 pt-32 sm:px-8">
      <div className="mx-auto max-w-[1450px]">
        <section className="relative overflow-hidden rounded-[3rem] bg-zinc-950 p-8 text-white shadow-[0_35px_100px_-45px_rgba(0,0,0,.7)] sm:p-14 lg:p-20">
          <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute left-8 top-8 h-24 w-24 rounded-full border border-white/10" />
          <Sparkles className="relative h-9 w-9" />
          <p className="relative mt-7 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Choose your world</p>
          <h1 className="relative mt-4 max-w-5xl text-4xl font-semibold leading-[.95] tracking-[-.055em] sm:text-6xl lg:text-7xl">
            Start from the side of JobiVerse that fits you.
          </h1>
          <p className="relative mt-6 max-w-3xl text-lg leading-8 text-zinc-400">
            JobiVerse is not one door. It is a work universe for people building careers, companies building teams and experts building income.
          </p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {worlds.map(({ title, eyebrow, description, href, action, icon: Icon, points, featured }) => (
            <Link
              key={title}
              href={href}
              className={`group flex min-h-[430px] flex-col justify-between overflow-hidden rounded-[2.5rem] border p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl ${
                featured ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-950"
              }`}
            >
              <span>
                <span className="flex items-start justify-between gap-4">
                  <span className={`grid h-14 w-14 place-items-center rounded-2xl ${featured ? "bg-white text-zinc-950" : "bg-zinc-950 text-white"}`}>
                    <Icon size={24} />
                  </span>
                  <ArrowRight className={`transition group-hover:translate-x-1 ${featured ? "text-white/45 group-hover:text-white" : "text-zinc-300 group-hover:text-zinc-950"}`} />
                </span>
                <span className={`mt-8 block text-[10px] font-bold uppercase tracking-[.18em] ${featured ? "text-zinc-500" : "text-zinc-400"}`}>{eyebrow}</span>
                <strong className="mt-3 block text-3xl tracking-[-.04em]">{title}</strong>
                <span className={`mt-4 block text-sm leading-7 ${featured ? "text-zinc-400" : "text-zinc-600"}`}>{description}</span>
                <span className="mt-6 grid gap-2">
                  {points.map((point) => (
                    <span key={point} className={`rounded-2xl px-4 py-3 text-xs font-semibold ${featured ? "bg-white/10 text-zinc-300" : "bg-zinc-50 text-zinc-600"}`}>
                      {point}
                    </span>
                  ))}
                </span>
              </span>
              <span className={`mt-8 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold ${featured ? "bg-white text-zinc-950" : "bg-zinc-950 text-white"}`}>
                {action} <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
