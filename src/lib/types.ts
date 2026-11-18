export type Role = 'admin' | 'gestor' | 'corretor';

export interface Profile {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  role: Role;
  ativo: boolean;
}

export type Periodo = 'manha' | 'tarde' | 'noite';

export interface Task {
  id: string;
  titulo: string;
  dica: string;
  periodo: Periodo;
  hora: string; // "HH:MM" horário do lembrete
  pontos: number;
  ordem: number;
  ativo: boolean;
}

export type TaskStatus = 'feito' | 'nao_feito';

export interface TaskLog {
  id: string; // `${user_id}_${data}_${task_id}`
  user_id: string;
  task_id: string;
  data: string; // YYYY-MM-DD
  status: TaskStatus;
  motivo?: string | null;
}

export type KpiKey = 'leads' | 'visitas' | 'captacoes' | 'exclusividades' | 'propostas' | 'vendas' | 'vgv';

export interface KpiEntry {
  id: string; // `${user_id}_${data}_${kpi}`
  user_id: string;
  data: string;
  kpi: KpiKey;
  valor: number;
}

export interface PdiAcao {
  id: string;
  texto: string;
  feito: boolean;
}

export type MetricKey = KpiKey | 'aderencia' | 'conv_lead_visita' | 'conv_visita_proposta' | 'conv_proposta_venda';

export interface PdiGoal {
  id: string;
  user_id: string;
  tema: string;
  especifica: string; // S - o que exatamente
  metrica: MetricKey; // M - KPI
  meta: number; // M - valor alvo
  atingivel: string; // A - como (recursos/apoio)
  relevante: string; // R - por que importa
  inicio: string; // YYYY-MM-DD
  prazo: string; // T - YYYY-MM-DD
  acoes: PdiAcao[];
  status: 'ativa' | 'concluida' | 'cancelada';
}

export interface Tables {
  profiles: Profile;
  tasks: Task;
  task_logs: TaskLog;
  kpi_entries: KpiEntry;
  pdi_goals: PdiGoal;
}
export type TableName = keyof Tables;
