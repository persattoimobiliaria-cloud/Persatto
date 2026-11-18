import { nowHHMM, today } from './dates';
import type { Task, TaskLog } from './types';

/**
 * Lembretes no celular (V1): notificações locais do navegador com botões "✅ Feito" e "❌ Não fiz".
 * Disparam no horário de cada atividade enquanto o app estiver aberto ou em segundo plano recente.
 * Para envio com o app fechado, a V2 usa Web Push (o service worker já trata o evento `push`).
 */
const SENT_KEY = 'persatto:notified';

export async function registerSW(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('./sw.js');
  } catch {
    return null;
  }
}

export const notifSupported = () => typeof Notification !== 'undefined' && 'serviceWorker' in navigator;
export const notifEnabled = () => notifSupported() && Notification.permission === 'granted';

export async function enableNotifications(): Promise<boolean> {
  if (!notifSupported()) return false;
  const p = await Notification.requestPermission();
  if (p === 'granted') {
    await show({ title: 'Lembretes ativados ✅', body: 'Você vai receber cada atividade no horário certo. Resolva com um toque.' });
    return true;
  }
  return false;
}

async function show(o: { title: string; body: string; taskId?: string; date?: string }) {
  const reg = await navigator.serviceWorker.ready;
  const opts: NotificationOptions & { actions?: { action: string; title: string }[] } = {
    body: o.body,
    icon: './icon.svg',
    badge: './icon.svg',
    tag: o.taskId ?? 'persatto',
    data: { taskId: o.taskId, date: o.date },
  };
  if (o.taskId) opts.actions = [{ action: 'feito', title: '✅ Feito' }, { action: 'nao', title: '❌ Não fiz' }];
  await reg.showNotification(o.title, opts);
}

function sentSet(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(SENT_KEY) || '{}');
    return new Set(raw[today()] ?? []);
  } catch {
    return new Set();
  }
}
function markSent(id: string) {
  try {
    const s = sentSet();
    s.add(id);
    localStorage.setItem(SENT_KEY, JSON.stringify({ [today()]: [...s] }));
  } catch {
    /* ignore */
  }
}

/** Verifica a cada minuto quais atividades já passaram do horário e ainda não foram resolvidas. */
export function startScheduler(getState: () => { tasks: Task[]; logs: TaskLog[]; userId: string } | null) {
  const tick = async () => {
    if (!notifEnabled()) return;
    const st = getState();
    if (!st) return;
    const d = today();
    const now = nowHHMM();
    const sent = sentSet();
    const resolvidos = new Set(st.logs.filter((l) => l.user_id === st.userId && l.data === d).map((l) => l.task_id));
    const devidas = st.tasks.filter((t) => t.ativo && t.hora <= now && !resolvidos.has(t.id) && !sent.has(t.id));
    // só a mais recente para não inundar o celular
    const t = devidas.sort((a, b) => b.hora.localeCompare(a.hora))[0];
    if (t) {
      await show({ title: `⏰ ${t.titulo}`, body: t.dica, taskId: t.id, date: d });
      devidas.forEach((x) => markSent(x.id));
    }
    if (now >= '19:30' && !sent.has('resumo')) {
      const pend = st.tasks.filter((x) => x.ativo && !resolvidos.has(x.id)).length;
      if (pend > 0) await show({ title: 'Fechamento do dia', body: `Faltam ${pend} atividade(s). Toque para resolver em 30 segundos.` });
      markSent('resumo');
    }
  };
  tick();
  const id = window.setInterval(tick, 60_000);
  return () => window.clearInterval(id);
}

/** Link de WhatsApp com mensagem pronta. */
export function waLink(telefone: string | null | undefined, texto: string) {
  const num = (telefone ?? '').replace(/\D/g, '');
  return `https://wa.me/${num}?text=${encodeURIComponent(texto)}`;
}
