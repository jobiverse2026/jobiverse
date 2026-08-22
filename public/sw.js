const CACHE_VERSION = "jobiverse-pwa-v2";
const OFFLINE_URL = "/offline";
const APP_SHELL = [OFFLINE_URL, "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  const cacheableStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/images/branding/") ||
    url.pathname === "/icon-192.png" ||
    url.pathname === "/icon-512.png" ||
    url.pathname === "/manifest.webmanifest";

  if (!cacheableStaticAsset) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fresh = fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      });
      return cached || fresh;
    }),
  );
});


self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data?.json() ?? {}; } catch { data = { body: event.data?.text() }; }
  event.waitUntil(self.registration.showNotification(data.title || "JobiVerse", {
    body: data.body || "You have a new update.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "jobiverse-update",
    data: { href: data.href || "/dashboard" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const href = new URL(event.notification.data?.href || "/dashboard", self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (windowClients) => {
    for (const client of windowClients) {
      if (client.url === href && "focus" in client) return client.focus();
    }
    return self.clients.openWindow(href);
  }));
});