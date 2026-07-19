"use client";

import { Download } from "lucide-react";

export function PrintReceiptButton(){
  return <button type="button" onClick={()=>window.print()} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white print:hidden"><Download size={17}/> Download / Print receipt</button>;
}
