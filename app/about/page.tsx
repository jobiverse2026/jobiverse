import Link from "next/link";
import { ArrowRight, BrainCircuit, Building2, Compass, Mail, MapPin, Phone, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { PageSectionIndex } from "@/components/common/page-section-index";
import { InstagramIcon, LinkedInIcon, WhatsAppIcon } from "@/components/common/social-icons";

const principles = [
  { title: "Human understanding", text: "We begin with the person, the role and the business-not merely a keyword match.", icon: UsersRound },
  { title: "Responsible technology", text: "Technology should make hiring clearer and faster while keeping important decisions human.", icon: BrainCircuit },
  { title: "Long-term outcomes", text: "A successful placement should strengthen a company and move a professional's career forward.", icon: ShieldCheck },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f6f6f3] text-zinc-950">
      <PageHeader
        eyebrow="About JobiVerse"
        title="We Are Building India's Hiring & Career Universe."
        description="JobiVerse is one universe supporting every side of work-from students beginning their journey and experienced professionals growing their careers, to creators earning through expertise, recruiters working smarter and employer-clients building exceptional teams."
      />
      <PageSectionIndex items={[{label:"Our story",href:"#our-story"},{label:"Mission & vision",href:"#mission-vision"},{label:"How we work",href:"#principles"},{label:"Contact us",href:"#contact"}]}/>

      <section id="our-story" className="mx-auto max-w-[1450px] px-5 py-20 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Our story</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">One universe for every working journey.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">From a student preparing for a first opportunity to an experienced leader making a strategic move; from an expert creating income to a company hiring its dream team-JobiVerse is designed to connect every journey.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-[2rem] border border-zinc-200 bg-white p-8"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-black text-white"><Building2 size={22}/></span><h3 className="mt-7 text-xl font-semibold">Where we are today</h3><p className="mt-3 leading-7 text-zinc-600">A premium recruitment partner helping Indian startups, SMEs and enterprises hire IT, Non-IT and leadership talent through a success-driven approach.</p></article>
            <article className="rounded-[2rem] border border-zinc-200 bg-zinc-950 p-8 text-white"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-black"><Sparkles size={22}/></span><h3 className="mt-7 text-xl font-semibold">Where we are going</h3><p className="mt-3 leading-7 text-zinc-400">An integrated HR technology platform where companies hire intelligently, candidates build careers and experts create valuable career services.</p></article>
          </div>
        </div>
      </section>

      <section id="mission-vision" className="bg-zinc-950 py-24 text-white">
        <div className="mx-auto grid max-w-[1450px] gap-5 px-5 sm:px-8 lg:grid-cols-2">
          <article className="rounded-[2.5rem] border border-white/10 bg-white/[.05] p-8 sm:p-10"><Compass className="text-zinc-400" size={28}/><p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Our mission</p><h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Simplify hiring. Strengthen careers.</h2><p className="mt-5 max-w-xl leading-7 text-zinc-400">Help businesses find suitable talent faster while giving professionals at every stage better opportunities, guidance and tools.</p></article>
          <article className="rounded-[2.5rem] border border-white/10 bg-white/[.05] p-8 sm:p-10"><Sparkles className="text-zinc-400" size={28}/><p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Our vision</p><h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">India's most trusted hiring ecosystem.</h2><p className="mt-5 max-w-xl leading-7 text-zinc-400">A transparent platform where employers, candidates, recruiters and career experts can succeed through human expertise and intelligent technology.</p></article>
        </div>
      </section>

      <section id="principles" className="mx-auto max-w-[1450px] px-5 py-24 sm:px-8">
        <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">How we work</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-6xl">More than filling vacancies.</h2><p className="mt-5 text-lg leading-8 text-zinc-600">We focus on understanding requirements, recognizing human potential and creating relationships that last beyond a joining date.</p></div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">{principles.map(({title,text,icon:Icon},index)=><article key={title} className="rounded-[2rem] border border-zinc-200 bg-white p-8"><div className="flex items-center justify-between"><Icon size={23}/><span className="text-xs font-bold text-zinc-300">0{index+1}</span></div><h3 className="mt-8 text-xl font-semibold">{title}</h3><p className="mt-3 leading-7 text-zinc-600">{text}</p></article>)}</div>
      </section>

      <section id="contact" className="mx-auto max-w-[1450px] px-5 pb-24 sm:px-8">
        <div className="overflow-hidden rounded-[3rem] bg-white shadow-[0_30px_100px_-55px_rgba(0,0,0,.5)] ring-1 ring-zinc-200">
          <div className="grid lg:grid-cols-[1.05fr_.95fr]">
            <div className="p-8 sm:p-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-400">Contact JobiVerse</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] sm:text-5xl">Let's build the right next step.</h2><p className="mt-5 max-w-xl leading-7 text-zinc-600">Hiring talent, exploring opportunities or discussing the JobiVerse ecosystem? Reach our team directly.</p><Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-4 font-semibold text-white">Open contact page <ArrowRight size={18}/></Link></div>
            <div className="bg-zinc-950 p-8 text-white sm:p-12"><div className="space-y-5"><ContactLink href="mailto:jobiverse@outlook.com" icon={Mail} label="Email" value="jobiverse@outlook.com"/><ContactLink href="tel:+917738832231" icon={Phone} label="Phone" value="+91 77388 32231"/><ContactLink href="https://maps.google.com/?q=Mumbai,India" icon={MapPin} label="Office" value="Mumbai, India"/></div><div className="mt-9 flex justify-center gap-3"><Link aria-label="JobiVerse on LinkedIn" href="https://www.linkedin.com/in/jobiverse" target="_blank" className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[.06] transition hover:bg-white/15"><LinkedInIcon className="h-5 w-5"/></Link><Link aria-label="JobiVerse on Instagram" href="https://www.instagram.com/jobiverse__/" target="_blank" className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[.06] transition hover:bg-white/15"><InstagramIcon className="h-5 w-5"/></Link><Link aria-label="Chat with JobiVerse on WhatsApp" href="https://wa.me/917738832231" target="_blank" className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[.06] transition hover:bg-white/15"><WhatsAppIcon className="h-5 w-5"/></Link><Link aria-label="Email JobiVerse" href="mailto:jobiverse@outlook.com" className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[.06] transition hover:bg-white/15"><Mail className="h-5 w-5"/></Link></div></div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ContactLink({href,icon:Icon,label,value}:{href:string;icon:React.ElementType;label:string;value:string}) {
  return <Link href={href} target={href.startsWith("http") ? "_blank" : undefined} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[.05] p-4 transition hover:bg-white/10"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-black"><Icon size={19}/></span><span><span className="block text-xs uppercase tracking-[.16em] text-zinc-500">{label}</span><span className="mt-1 block font-semibold">{value}</span></span></Link>;
}
