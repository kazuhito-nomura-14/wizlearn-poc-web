// オフライン用の service worker。ビルド時に tool/build_web.py が build/web/flutter_service_worker.js として書き出す。
// 方針：ネットワーク優先（オンラインのときは常に最新）。成功した応答を保存し、オフラインのときだけ保存分を使う。
// 初回の読み込みを邪魔しないよう、まとめての先読みは、ページが読み込まれてしばらくしてからの合図（precache）で行う。
'use strict';

const CACHE_NAME = '__CACHE_NAME__';
const PRECACHE = __PRECACHE_LIST__;
const SCOPE = self.registration.scope;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n.startsWith('wizlearn-') && n !== CACHE_NAME).map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'precache') {
    event.waitUntil(precacheAll());
  }
});

async function precacheAll() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(
    PRECACHE.map(async (path) => {
      const url = new URL(path, SCOPE).href;
      if (await cache.match(url)) return;
      const res = await fetch(url, { cache: 'reload' });
      if (res.ok) await cache.put(url, res);
    }),
  );
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !req.url.startsWith(SCOPE)) return;
  event.respondWith(networkFirst(req));
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(req);
    if (res.ok && res.status === 200) cache.put(req, res.clone());
    return res;
  } catch (e) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const root = (await cache.match(SCOPE)) || (await cache.match(new URL('index.html', SCOPE).href));
      if (root) return root;
    }
    throw e;
  }
}
