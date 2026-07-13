const CACHE = "kraftwerk-v10";
const MUSCLE_IMAGES = ["a", "b", "c"].flatMap((day) =>
  Array.from({ length: 9 }, (_, index) => `/muscle-groups/${day}-${index + 1}.png`)
);
const STATIC = ["/", "/grundidee", "/manifest.webmanifest", ...MUSCLE_IMAGES];

async function precacheAppShell() {
  const cache = await caches.open(CACHE);
  await cache.addAll(STATIC);
  const pages = await Promise.all(["/", "/grundidee"].map((path) => fetch(path)));
  const assetUrls = new Set();
  for (const response of pages) {
    const html = await response.text();
    for (const match of html.matchAll(/(?:src|href)=["']([^"']*\/_next\/static\/[^"']+)["']/g)) {
      assetUrls.add(new URL(match[1], self.location.origin).pathname);
    }
  }
  await Promise.all([...assetUrls].map(async (url) => {
    try { await cache.add(url); } catch { /* A non-critical chunk may change during deployment. */ }
  }));
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheAppShell());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) void caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(async () => (await caches.match(event.request)) ?? (await caches.match("/")) ?? Response.error())
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((response) => {
        if (response.ok) void caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
        return response;
      });
      if (cached) {
        event.waitUntil(network.catch(() => undefined));
        return cached;
      }
      return network.catch(() => Response.error());
    })
  );
});
