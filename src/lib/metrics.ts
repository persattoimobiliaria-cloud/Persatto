import { isWeekend, range, today } from './dates';
import type { KpiEntry, KpiKey, MetricKey, PdiGoal, Task, TaskLog } from './types';

export interface Stats {
  aderencia: number; // 0-100
  feitos: number;
  naoFeitos: number;
  pontos: number;
  dias: number;
  kpi: Record<KpiKey, number>;
  conv_lead_visita: number;
  conv_visita_proposta: number;
  conv_proposta_venda: number;
}

const emptyKpi = (): Record<KpiKey, number> => ({ leads: 0, visitas: 0, captacoes: 0, exclusividades: 0, propostas: 0, vendas: 0, vgv: 0 });
const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

/** Dias úteis do período que contam para aderência (hoje só conta se já houver algum registro). */
function diasContados(from: string, to: string, logs: TaskLog[]): string[] {
  const t = today();
  const end = to > t ? t : to;
  return range(from, end).filter((d) => (d < t ? !isWeekend(d) : logs.some((l) => l.data === d)));
}

export function computeStats(userId: string, from: string, to: string, tasks: Task[], logs: TaskLog[], kpis: KpiEntry[]): Stats {
  const ativos = tasks.filter((t) => t.ativo);
  const pts = new Map(tasks.map((t) => [t.id, t.pontos]));
  const ul = logs.filter((l) => l.user_id === userId && l.data >= from && l.data <= to);
  const dias = diasContados(from, to, ul);
  const feitos = ul.filter((l) => l.status === 'feito');
  const k = emptyKpi();
  for (const e of kpis) if (e.user_id === userId && e.data >= from && e.data <= to) k[e.kpi] += e.valor;
  return {
    aderencia: pct(feitos.length, dias.length * ativos.length),
    feitos: feitos.length,
    naoFeitos: ul.filter((l) => l.status === 'nao_feito').length,
    pontos: feitos.reduce((s, l) => s + (pts.get(l.task_id) ?? 0), 0),
    dias: dias.length,
    kpi: k,
    conv_lead_visita: pct(k.visitas, k.leads),
    conv_visita_proposta: pct(k.propostas, k.visitas),
    conv_proposta_venda: pct(k.vendas, k.propostas),
  };
}

/** Aderência de um único dia (0-100). */
export function dayAderencia(userId: string, data: string, tasks: Task[], logs: TaskLog[]): number {
  const n = tasks.filter((t) => t.ativo).length;
  const f = logs.filter((l) => l.user_id === userId && l.data === data && l.status === 'feito').length;
  return n ? Math.round((f / n) * 100) : 0;
}

/** Dias úteis seguidos com aderência >= 70%. */
export function streak(userId: string, tasks: Task[], logs: TaskLog[]): number {
  let n = 0;
  const t = today();
  if (dayAderencia(userId, t, tasks, logs) >= 70) n++;
  const dias = range('2000-01-01', t).slice(-120).reverse().slice(1);
  for (const d of dias) {
    if (isWeekend(d)) continue;
    if (dayAderencia(userId, d, tasks, logs) >= 70) n++;
    else break;
  }
  return n;
}

export function metricValue(s: Stats, m: MetricKey): number {
  if (m === 'aderencia' || m === 'conv_lead_visita' || m === 'conv_visita_proposta' || m === 'conv_proposta_venda') return s[m];
  return s.kpi[m];
}

export function goalProgress(g: PdiGoal, tasks: Task[], logs: TaskLog[], kpis: KpiEntry[]) {
  const s = computeStats(g.user_id, g.inicio, g.prazo, tasks, logs, kpis);
  const atual = metricValue(s, g.metrica);
  const progresso = g.meta > 0 ? Math.min(100, Math.round((atual / g.meta) * 100)) : 0;
  const acoesFeitas = g.acoes.filter((a) => a.feito).length;
  return { atual, progresso, acoesFeitas, acoesTotal: g.acoes.length };
}

export const fmtMoney = (v: number) =>
  v >= 1_000_000 ? `R$ ${(v / 1_000_000).toFixed(1).replace('.', ',')} mi` : v >= 1000 ? `R$ ${Math.round(v / 1000)} mil` : `R$ ${v}`;

export function fmtMetric(v: number, m: MetricKey): string {
  if (m === 'vgv') return fmtMoney(v);
  if (m === 'aderencia' || m.startsWith('conv_')) return `${String(v).replace('.', ',')}%`;
  return String(v);
}
