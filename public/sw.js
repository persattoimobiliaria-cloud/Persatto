/* Service worker Persatto: cache básico + ações de notificação (Feito / Não fiz) com 1 toque. */
const CACHE = 'persatto-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './index.html', './manifest.webmanifest', './icon.svg'])));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // Rede primeiro, cache como reserva (funciona offline com a última versão).
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html'))),
  );
});

self.addEventListener('notificationclick', (event) => {
  const n = event.notification;
  const data = n.data || {};
  n.close();
  const status = event.action === 'feito' ? 'feito' : event.action === 'nao' ? 'nao_feito' : '';
  const msg = { type: 'task-action', taskId: data.taskId, date: data.date, status };

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      if (list.length > 0) {
        const client = list[0];
        client.postMessage(msg);
        return 'focus' in client ? client.focus() : undefined;
      }
      const qs = new URLSearchParams({ task: data.taskId || '', data: data.date || '', acao: status }).toString();
      return self.clients.openWindow('./?' + qs);
    }),
  );
});

/* Pronto para Web Push (V2): o servidor envia {title, body, taskId, date}. */
self.addEventListener('push', (event) => {
  let p = {};
  try { p = event.data ? event.data.json() : {}; } catch (_) {}
  event.waitUntil(
    self.registration.showNotification(p.title || 'Persatto', {
      body: p.body || 'Você tem atividades pendentes hoje.',
      icon: './icon.svg',
      badge: './icon.svg',
      tag: p.taskId || 'persatto',
      data: { taskId: p.taskId, date: p.date },
      actions: p.taskId ? [{ action: 'feito', title: '✅ Feito' }, { action: 'nao', title: '❌ Não fiz' }] : [],
    }),
  );
});
