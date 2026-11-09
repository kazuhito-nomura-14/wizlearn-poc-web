// オフライン用の service worker。ビルド時に tool/build_web.py が build/web/flutter_service_worker.js として書き出す。
// 方針：ネットワーク優先（オンラインのときは常に最新）。成功した応答を保存し、オフラインのときだけ保存分を使う。
// 初回の読み込みを邪魔しないよう、まとめての先読みは、ページが読み込まれてしばらくしてからの合図（precache）で行う。
'use strict';

const CACHE_NAME = 'wizlearn-20261110004547';
const PRECACHE = ["./", "assets/AssetManifest.bin", "assets/AssetManifest.bin.json", "assets/FontManifest.json", "assets/assets/audio/se/.gitkeep", "assets/assets/audio/se/correct.wav", "assets/assets/audio/se/fanfare.wav", "assets/assets/audio/se/gauge.wav", "assets/assets/audio/se/spell.wav", "assets/assets/audio/se/wrong.wav", "assets/assets/data/.gitkeep", "assets/assets/data/kuku_readings.json", "assets/assets/data/lines.json", "assets/assets/data/monsters.json", "assets/assets/data/spells.json", "assets/assets/data/teachers.json", "assets/assets/fonts/Fredoka-SemiBold.ttf", "assets/assets/fonts/NotoSansJP-Bold.ttf", "assets/assets/fonts/NotoSansJP-Regular.ttf", "assets/assets/fonts/OFL-Fredoka.txt", "assets/assets/fonts/OFL-ZenMaruGothic.txt", "assets/assets/fonts/OFL.txt", "assets/assets/fonts/ZenMaruGothic-Bold.ttf", "assets/assets/images/characters/.gitkeep", "assets/assets/images/characters/boy.png", "assets/assets/images/characters/girl.png", "assets/assets/images/characters/monster_basilisk.png", "assets/assets/images/characters/monster_basilisk_happy.png", "assets/assets/images/characters/monster_basilisk_surprised.png", "assets/assets/images/characters/monster_basilisk_worried.png", "assets/assets/images/characters/monster_cerberus.png", "assets/assets/images/characters/monster_cerberus_happy.png", "assets/assets/images/characters/monster_cerberus_surprised.png", "assets/assets/images/characters/monster_cerberus_worried.png", "assets/assets/images/characters/monster_dragon.png", "assets/assets/images/characters/monster_dragon_happy.png", "assets/assets/images/characters/monster_dragon_surprised.png", "assets/assets/images/characters/monster_dragon_worried.png", "assets/assets/images/characters/player_boy.png", "assets/assets/images/characters/player_boy_happy.png", "assets/assets/images/characters/player_boy_surprised.png", "assets/assets/images/characters/player_boy_worried.png", "assets/assets/images/characters/player_girl.png", "assets/assets/images/characters/player_girl_happy.png", "assets/assets/images/characters/player_girl_surprised.png", "assets/assets/images/characters/player_girl_worried.png", "assets/assets/images/characters/principal_dunbar.png", "assets/assets/images/characters/principal_dunbar_happy.png", "assets/assets/images/characters/principal_dunbar_surprised.png", "assets/assets/images/characters/principal_dunbar_worried.png", "assets/assets/images/characters/teacher_big_rob.png", "assets/assets/images/characters/teacher_big_rob_happy.png", "assets/assets/images/characters/teacher_big_rob_surprised.png", "assets/assets/images/characters/teacher_big_rob_worried.png", "assets/assets/images/characters/teacher_howie.png", "assets/assets/images/characters/teacher_howie_happy.png", "assets/assets/images/characters/teacher_howie_surprised.png", "assets/assets/images/characters/teacher_howie_worried.png", "assets/assets/images/characters/teacher_maggie.png", "assets/assets/images/characters/teacher_maggie_happy.png", "assets/assets/images/characters/teacher_maggie_surprised.png", "assets/assets/images/characters/teacher_maggie_worried.png", "assets/assets/images/characters/teacher_pam.png", "assets/assets/images/characters/teacher_pam_happy.png", "assets/assets/images/characters/teacher_pam_surprised.png", "assets/assets/images/characters/teacher_pam_worried.png", "assets/assets/images/characters/teacher_phil.png", "assets/assets/images/characters/teacher_phil_happy.png", "assets/assets/images/characters/teacher_phil_surprised.png", "assets/assets/images/characters/teacher_phil_worried.png", "assets/assets/images/characters/teacher_poppy.png", "assets/assets/images/characters/teacher_poppy_happy.png", "assets/assets/images/characters/teacher_poppy_surprised.png", "assets/assets/images/characters/teacher_poppy_worried.png", "assets/assets/images/characters/teacher_remy.png", "assets/assets/images/characters/teacher_remy_happy.png", "assets/assets/images/characters/teacher_remy_surprised.png", "assets/assets/images/characters/teacher_remy_worried.png", "assets/assets/images/characters/teacher_rhonda.png", "assets/assets/images/characters/teacher_rhonda_happy.png", "assets/assets/images/characters/teacher_rhonda_surprised.png", "assets/assets/images/characters/teacher_rhonda_worried.png", "assets/assets/images/characters/teacher_sybil.png", "assets/assets/images/characters/teacher_sybil_happy.png", "assets/assets/images/characters/teacher_sybil_surprised.png", "assets/assets/images/characters/teacher_sybil_worried.png", "assets/assets/images/monsters/.gitkeep", "assets/assets/images/monsters/basilisk.png", "assets/assets/images/monsters/basilisk_happy.png", "assets/assets/images/monsters/basilisk_kira.png", "assets/assets/images/monsters/basilisk_surprised.png", "assets/assets/images/monsters/basilisk_worried.png", "assets/assets/images/monsters/cerberus.png", "assets/assets/images/monsters/cerberus_happy.png", "assets/assets/images/monsters/cerberus_kira.png", "assets/assets/images/monsters/cerberus_surprised.png", "assets/assets/images/monsters/cerberus_worried.png", "assets/assets/images/monsters/dragon.png", "assets/assets/images/monsters/dragon_happy.png", "assets/assets/images/monsters/dragon_kira.png", "assets/assets/images/monsters/dragon_surprised.png", "assets/assets/images/monsters/dragon_worried.png", "assets/fonts/MaterialIcons-Regular.otf", "assets/packages/cupertino_icons/assets/CupertinoIcons.ttf", "assets/packages/material_ui/shaders/ink_sparkle.frag", "assets/shaders/ink_sparkle.frag", "assets/shaders/stretch_effect.frag", "canvaskit/canvaskit.js", "canvaskit/canvaskit.wasm", "canvaskit/chromium/canvaskit.js", "canvaskit/chromium/canvaskit.wasm", "drift_worker.js", "favicon.png", "flutter.js", "flutter_bootstrap.js", "icons/Icon-192.png", "icons/Icon-512.png", "icons/Icon-maskable-192.png", "icons/Icon-maskable-512.png", "index.html", "main.dart.js", "manifest.json", "offline_sw.js", "sqlite3.wasm", "version.json"];
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
