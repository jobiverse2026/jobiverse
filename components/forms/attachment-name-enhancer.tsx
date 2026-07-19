"use client";

import { useEffect } from "react";

export function AttachmentNameEnhancer(){useEffect(()=>{const handler=(event:Event)=>{const input=event.target;if(!(input instanceof HTMLInputElement)||input.type!=="file")return;const label=input.closest("label");if(!label)return;let display=label.parentElement?.querySelector<HTMLElement>(`[data-file-name-for="${input.name}"]`);if(!display){display=document.createElement("p");display.dataset.fileNameFor=input.name;display.className="mt-2 text-xs font-semibold text-emerald-700";label.insertAdjacentElement("afterend",display);}const files=Array.from(input.files??[]);display.textContent=files.length?`Selected: ${files.map(file=>file.name).join(", ")}`:"No file selected";};document.addEventListener("change",handler);return()=>document.removeEventListener("change",handler)},[]);return null}
