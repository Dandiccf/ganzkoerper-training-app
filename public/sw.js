const CACHE = "kraftwerk-v2";
const MUSCLE_IMAGES = ["a", "b", "c"].flatMap((day) =>
  Array.from({ length: 9 }, (_, index) => `/muscle-groups/${day}-${index + 1}.png`)
);
const STATIC = ["/", "/manifest.webmanifest", "/cover.png", ...MUSCLE_IMAGES];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          if (event.request.mode === "navigate") return (await caches.match("/")) ?? Response.error();
          return Response.error();
        });
    })
  );
});
