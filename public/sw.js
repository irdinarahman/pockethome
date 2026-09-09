const CACHE_NAME = "pocket-home-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Network-first: always try the live server first (so a new deploy is picked
// up immediately), only falling back to cache when actually offline. This
// avoids ever serving an old index.html that points at deleted hashed asset
// filenames from a previous build.
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    // Let cross-origin requests (Supabase API, OneSignal, etc.) go straight
    // through untouched — this worker should only ever manage our own
    // static assets, never third-party API calls with live data.
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
