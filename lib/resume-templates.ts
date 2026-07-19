export type ResumeLayout = "classic" | "sidebar" | "minimal" | "bold" | "editorial" | "timeline" | "split" | "centered" | "compact" | "geometric";
export type ResumeTemplate = { id: string; name: string; family: string; audience: string; style: string; layout: ResumeLayout; headerStyle: number; bodyStyle: number; decorationStyle: number; accent: string; soft: string; dark: boolean; supportsPhoto: boolean; multiPage: boolean; price: number };

const headers = ["Command", "Portrait", "Monogram", "Editorial", "Floating", "Banner", "Offset", "Centered", "Vertical", "Spotlight"];
const bodies: Array<{ name: string; layout: ResumeLayout }> = [
  { name: "Classic", layout: "classic" }, { name: "Sidebar", layout: "sidebar" }, { name: "Air", layout: "minimal" },
  { name: "Impact", layout: "bold" }, { name: "Journal", layout: "editorial" }, { name: "Roadmap", layout: "timeline" },
  { name: "Dual", layout: "split" }, { name: "Calm", layout: "centered" }, { name: "Ledger", layout: "compact" }, { name: "Orbit", layout: "geometric" },
];
const treatments = ["Signature", "Gallery", "Studio", "Portfolio", "Prestige"];
const careers = [
  ["Executive", "Leadership & management"], ["Technology", "IT & engineering"], ["Graduate", "Students & freshers"],
  ["Creative", "Design & marketing"], ["Finance", "Banking & finance"], ["Healthcare", "Healthcare professionals"],
  ["Sales", "Sales & business development"], ["Academic", "Education & research"], ["Operations", "Operations & supply chain"], ["General", "All professionals"],
];
const palettes = [
  ["#18181b", "#f4f4f5"], ["#334155", "#f1f5f9"], ["#164e63", "#ecfeff"], ["#14532d", "#f0fdf4"], ["#7f1d1d", "#fef2f2"],
  ["#312e81", "#eef2ff"], ["#9a3412", "#fff7ed"], ["#57534e", "#fafaf9"], ["#9f1239", "#fff1f2"], ["#0f766e", "#f0fdfa"],
];
const priceTiers = [50, 100, 150, 200, 300, 400, 500] as const;

export const resumeTemplates: ResumeTemplate[] = headers.flatMap((header, headerStyle) => bodies.flatMap((body, bodyStyle) => treatments.map((treatment, decorationStyle) => {
  const index = headerStyle * 50 + bodyStyle * 5 + decorationStyle;
  const [family, audience] = careers[index % careers.length]; const [accent, soft] = palettes[(headerStyle + bodyStyle + decorationStyle) % palettes.length];
  const supportsPhoto = [1, 4, 6, 7, 9].includes(headerStyle);
  const multiPage = bodyStyle >= 4 || decorationStyle >= 3;
  const price = priceTiers[Math.min(priceTiers.length - 1, decorationStyle + (supportsPhoto ? 1 : 0) + (multiPage ? 1 : 0))];
  return { id: `jv-${headerStyle + 1}-${bodyStyle + 1}-${decorationStyle + 1}`, name: `${header} ${body.name} ${treatment}`, family, audience, style: `${header} header | ${body.name} body | ${treatment} treatment`, layout: body.layout, headerStyle, bodyStyle, decorationStyle, accent, soft, dark: (headerStyle + decorationStyle) % 3 === 0, supportsPhoto, multiPage, price };
})));

export function getResumeTemplate(id?: string) { return resumeTemplates.find((template) => template.id === id) ?? resumeTemplates[0]; }



