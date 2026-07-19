"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Highlighter, IndentDecrease, IndentIncrease, Italic, List, ListOrdered, Plus, Redo2, RemoveFormatting, Save, Strikethrough, Underline, Undo2 } from "lucide-react";
import { getResumeTemplate } from "@/lib/resume-templates";
import RichResumeDocument from "@/components/candidate/RichResumeDocument";
import type { ResumeContent } from "@/components/candidate/ResumeDocument";

export default function WordStyleResumeEditor({ templateId, data }: { templateId: string; data: ResumeContent }) {
  const router = useRouter(); const canvas = useRef<HTMLDivElement>(null); const [savedHtml, setSavedHtml] = useState<string | null>(null); const [ready, setReady] = useState(false); const [pageCount, setPageCount] = useState(1);
  const template = getResumeTemplate(templateId);
  useEffect(() => { setSavedHtml(window.localStorage.getItem(`jobiverse-cv-${template.id}`)); setPageCount(template.multiPage ? 2 : 1); setReady(true); }, [template.id, template.multiPage]);
  function command(name: string, value?: string) { document.execCommand(name, false, value); canvas.current?.querySelector<HTMLElement>("article")?.focus(); }
  function save() { const article = canvas.current?.querySelector("article"); if (!article) return; window.localStorage.setItem(`jobiverse-cv-${template.id}`, article.innerHTML); router.push(`/candidates/resume-builder?template=${template.id}&edited=1`); }
  function reset() { window.localStorage.removeItem(`jobiverse-cv-${template.id}`); setSavedHtml(null); }
  if (!ready) return null;
  return <div className="grid gap-5 xl:grid-cols-[auto_1fr]">
    <aside className="sticky top-28 z-30 h-fit rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-xl xl:w-64"><p className="text-xs font-bold uppercase tracking-[.18em] text-zinc-400">Document tools</p><h2 className="mt-2 text-xl font-semibold">Edit like a document</h2><p className="mt-2 text-xs leading-5 text-zinc-500">Select text, then use the formatting tools. Headings and paragraphs can be rewritten directly on the CV.</p><button onClick={() => setPageCount((count) => Math.min(count + 1, 6))} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold"><Plus size={17}/> Add page</button><button onClick={save} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white"><Save size={17}/> Save & return</button><button onClick={reset} className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold">Reset saved edits</button></aside>
    <section className="min-w-0 overflow-hidden rounded-[2rem] bg-zinc-200 shadow-inner">
      <div className="sticky top-24 z-20 flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <Tool label="Undo" icon={<Undo2/>} run={()=>command("undo")}/><Tool label="Redo" icon={<Redo2/>} run={()=>command("redo")}/><Divider/><Tool label="Bold" icon={<Bold/>} run={()=>command("bold")}/><Tool label="Italic" icon={<Italic/>} run={()=>command("italic")}/><Tool label="Underline" icon={<Underline/>} run={()=>command("underline")}/><Tool label="Strike" icon={<Strikethrough/>} run={()=>command("strikeThrough")}/><Divider/>
        <select defaultValue="" onChange={(e)=>command("fontName",e.target.value)} className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-xs"><option value="" disabled>Font</option><option>Arial</option><option>Helvetica</option><option>Verdana</option><option>Georgia</option><option>Garamond</option><option>Times New Roman</option></select>
        <select defaultValue="" onChange={(e)=>command("fontSize",e.target.value)} className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-xs"><option value="" disabled>Size</option><option value="1">8 pt</option><option value="2">10 pt</option><option value="3">12 pt</option><option value="4">14 pt</option><option value="5">18 pt</option><option value="6">24 pt</option><option value="7">32 pt</option></select>
        <label className="flex h-9 items-center gap-1 rounded-lg border border-zinc-200 px-2 text-xs">Text <input type="color" onChange={(e)=>command("foreColor",e.target.value)} className="h-6 w-6"/></label><label className="flex h-9 items-center gap-1 rounded-lg border border-zinc-200 px-2 text-xs"><Highlighter size={15}/> <input type="color" defaultValue="#fff59d" onChange={(e)=>command("hiliteColor",e.target.value)} className="h-6 w-6"/></label><Divider/>
        <Tool label="Left" icon={<AlignLeft/>} run={()=>command("justifyLeft")}/><Tool label="Center" icon={<AlignCenter/>} run={()=>command("justifyCenter")}/><Tool label="Right" icon={<AlignRight/>} run={()=>command("justifyRight")}/><Tool label="Justify" icon={<AlignJustify/>} run={()=>command("justifyFull")}/><Tool label="Bullets" icon={<List/>} run={()=>command("insertUnorderedList")}/><Tool label="Numbering" icon={<ListOrdered/>} run={()=>command("insertOrderedList")}/><Tool label="Outdent" icon={<IndentDecrease/>} run={()=>command("outdent")}/><Tool label="Indent" icon={<IndentIncrease/>} run={()=>command("indent")}/><Tool label="Clear formatting" icon={<RemoveFormatting/>} run={()=>command("removeFormat")}/>
      </div>
      <div ref={canvas} className="overflow-auto p-6"><div className="mx-auto h-[1120px] w-[794px] overflow-hidden bg-white shadow-2xl"><div className="origin-top-left scale-[3.2]"><RichResumeDocument template={template} data={data} editable customHtml={savedHtml} totalPages={pageCount}/></div></div>{Array.from({length:pageCount-1},(_,index)=><div key={index} className="mx-auto mt-6 h-[1120px] w-[794px] overflow-hidden bg-white shadow-2xl"><div className="origin-top-left scale-[3.2]"><RichResumeDocument template={template} data={data} page={index+2} totalPages={pageCount} editable/></div></div>)}</div>
    </section>
  </div>;
}

function Tool({label,icon,run}:{label:string;icon:React.ReactNode;run:()=>void}){return <button type="button" title={label} aria-label={label} onMouseDown={(event)=>{event.preventDefault();run();}} className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 [&_svg]:h-4 [&_svg]:w-4">{icon}</button>}
function Divider(){return <span className="mx-1 h-7 w-px bg-zinc-200"/>}
