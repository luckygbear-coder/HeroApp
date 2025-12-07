// 很簡單的快取設定：把首頁 / 語錄 / icon 等基本檔案存起來
const CACHE_NAME = "bear-adventure-v3";

const URLS_TO_CACHE = [
  "./",
  "index.html",
  "quotes.html",
  "diary.html",
  "style.css",
  "script.js",
  "icons/bear-tarot-192.png",
  "icons/bear-tarot-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // 先看快取，有就用；沒有就去網路抓
      return response || fetch(event.request);
    })
  );
});
// 很簡單的快取設定：把首頁 / 語錄 / icon 等基本檔案存起來
const CACHE_NAME = "bear-tarot-v1";   // 建議改成跟塔羅相關，方便之後版本管理

const URLS_TO_CACHE = [
  "./",
  "index.html",
  "quotes.html",          // 這兩個檔案要真的存在，沒有就先刪掉
  "diary.html",
  "style.css",
  "script.js",            // 如果專案沒有 script.js，也要刪掉這行
  "icons/bear-tarot-192.png",
  "icons/bear-tarot-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // 先看快取，有就用；沒有就去網路抓
      return response || fetch(event.request);
    })
  );
});
