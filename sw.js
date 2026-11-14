// Network first, so testers always get the newest version; cached copy only when offline.
var CACHE = "wure-v8";
var FILES = ["./", "index.html", "guide.html", "manifest.webmanifest", "config.js", "telemetry.js", "online.js", "icons/icon-192.png", "icons/icon-512.png",
  "sponsors/planet-auto-hub.png", "sponsors/nioro-farms.png", "sponsors/jollof-ventures.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) {
    var copy = r.clone();
    caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    return r;
  }).catch(function () { return caches.match(e.request); }));
});
