import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const cacheRoot = path.join(projectRoot, ".open-next", "cache");
const assetsRoot = path.join(projectRoot, ".open-next", "assets");

// Only routes that are intentionally public may bypass the Worker. Never add
// dashboards, account pages, admin pages, or authenticated feature routes here.
const publicRoutes = new Set([
  "/",
  "/about",
  "/ai",
  "/candidates",
  "/career-services",
  "/choose-your-world",
  "/choose-your-world/employers",
  "/contact",
  "/creator-template-terms",
  "/earn-with-jobiverse",
  "/employers",
  "/employers/demo",
  "/employers/premium-hub",
  "/forgot-password",
  "/guides",
  "/industries",
  "/jobs/compare",
  "/login",
  "/login/admin",
  "/login/candidate",
  "/login/creator",
  "/login/employer",
  "/login/recruiter",
  "/login/student",
  "/maintenance",
  "/marketplace/offers",
  "/offline",
  "/pricing",
  "/privacy-policy",
  "/refund-policy",
  "/reset-password",
  "/resources",
  "/services",
  "/students",
  "/terms",
  "/why-jobiverse",
]);

const publicPrefixes = ["/guides/", "/jobs/in/", "/jobs/role/", "/jobs/sector/"];

function isPublicRoute(route) {
  return publicRoutes.has(route) || publicPrefixes.some((prefix) => route.startsWith(prefix));
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(fullPath)));
    else files.push(fullPath);
  }
  return files;
}

const cacheFiles = (await listFiles(cacheRoot)).filter((file) => file.endsWith(".cache"));
let written = 0;

for (const cacheFile of cacheFiles) {
  let entry;
  try {
    entry = JSON.parse(await readFile(cacheFile, "utf8"));
  } catch {
    continue;
  }
  if (entry?.type !== "app" || typeof entry.html !== "string") continue;

  const relativeToCache = path.relative(cacheRoot, cacheFile);
  const [, ...routeParts] = relativeToCache.split(path.sep);
  if (routeParts.length === 0) continue;
  const cacheName = routeParts.pop();
  const routeName = cacheName.slice(0, -".cache".length);
  const route = routeName === "index" ? "/" : `/${[...routeParts, routeName].join("/")}`;
  if (!isPublicRoute(route)) continue;

  const outputFile =
    route === "/"
      ? path.join(assetsRoot, "index.html")
      : path.join(assetsRoot, `${route.slice(1)}.html`);
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, entry.html, "utf8");
  written += 1;
}

if (written === 0) throw new Error("No allowlisted public pages were materialized");
console.log(`Materialized ${written} allowlisted public pages as Cloudflare static assets.`);
