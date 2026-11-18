import { DEFAULT_TASKS } from '../data/tasks';
import { addDays, isWeekend, range, today } from './dates';
import type { KpiEntry, PdiGoal, Profile, TaskLog } from './types';

/** Dados fictícios para o modo demo: 1 gestor + 4 corretores com 3 semanas de histórico. */
export function seedDemo() {
  const profiles: Profile[] = [
    { id: 'admin', nome: 'Gestor Persatto', email: 'gestor@persatto.demo', role: 'admin', ativo: true, telefone: '' },
    { id: 'c1', nome: 'Ana Souza', email: 'ana@persatto.demo', role: 'corretor', ativo: true, telefone: '5511999990001' },
    { id: 'c2', nome: 'Bruno Lima', email: 'bruno@persatto.demo', role: 'corretor', ativo: true, telefone: '5511999990002' },
    { id: 'c3', nome: 'Carla Mendes', email: 'carla@persatto.demo', role: 'corretor', ativo: true, telefone: '5511999990003' },
    { id: 'c4', nome: 'Diego Rocha', email: 'diego@persatto.demo', role: 'corretor', ativo: true, telefone: '5511999990004' },
  ];
  const disciplina: Record<string, number> = { c1: 0.9, c2: 0.65, c3: 0.8, c4: 0.45 };

  // gerador determinístico para o demo ficar estável
  let s = 42;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);

  const t = today();
  const dias = range(addDays(t, -45), addDays(t, -1)).filter((d) => !isWeekend(d));
  const task_logs: TaskLog[] = [];
  const kpi_entries: KpiEntry[] = [];

  for (const p of profiles.filter((x) => x.role === 'corretor')) {
    const disc = disciplina[p.id];
    for (const d of dias) {
      for (const task of DEFAULT_TASKS) {
        const r = rnd();
        if (r < disc) task_logs.push({ id: `${p.id}_${d}_${task.id}`, user_id: p.id, task_id: task.id, data: d, status: 'feito' });
        else if (r < disc + 0.15)
          task_logs.push({ id: `${p.id}_${d}_${task.id}`, user_id: p.id, task_id: task.id, data: d, status: 'nao_feito', motivo: ['Sem tempo', 'Cliente não respondeu', 'Sem lead / cliente'][Math.floor(rnd() * 3)] });
      }
      const leads = Math.round(2 + rnd() * 6 * disc);
      const visitas = Math.round(rnd() * 2.4 * disc);
      const vals: Partial<Record<KpiEntry['kpi'], number>> = {
        leads,
        visitas,
        captacoes: rnd() < 0.35 * disc ? 1 : 0,
        exclusividades: rnd() < 0.12 * disc ? 1 : 0,
        propostas: rnd() < 0.3 * disc ? 1 : 0,
        vendas: rnd() < 0.07 * disc ? 1 : 0,
      };
      if (vals.vendas) vals.vgv = Math.round((350 + rnd() * 900) * 1000);
      for (const [kpi, valor] of Object.entries(vals)) {
        if (valor) kpi_entries.push({ id: `${p.id}_${d}_${kpi}`, user_id: p.id, data: d, kpi: kpi as KpiEntry['kpi'], valor });
      }
    }
  }

  const pdi_goals: PdiGoal[] = [
    { id: 'g-c1', user_id: 'c1', tema: 'Exclusividade', especifica: 'Aumentar captações com contrato de exclusividade', metrica: 'exclusividades', meta: 4,
      atingivel: 'Apoio do gestor na apresentação de marketing', relevante: 'Imóvel exclusivo vende mais rápido', inicio: addDays(t, -21), prazo: addDays(t, 40), status: 'ativa',
      acoes: [{ id: 'a1', texto: 'Usar roteiro "Não quero exclusividade"', feito: true }, { id: 'a2', texto: 'Enviar relatório quinzenal aos proprietários', feito: false }] },
    { id: 'g-c4', user_id: 'c4', tema: 'Disciplina e rotina', especifica: 'Cumprir o checklist diário com consistência', metrica: 'aderencia', meta: 80,
      atingivel: 'Lembretes no celular + check-in diário com o gestor', relevante: 'Rotina gera previsibilidade de vendas', inicio: addDays(t, -21), prazo: addDays(t, 30), status: 'ativa',
      acoes: [{ id: 'a3', texto: 'Ativar os lembretes no celular', feito: false }, { id: 'a4', texto: 'Planejar o dia às 8h30', feito: false }] },
  ];

  return { profiles, tasks: DEFAULT_TASKS, task_logs, kpi_entries, pdi_goals };
}
