import type { KpiKey, MetricKey } from '../lib/types';

export const KPIS: { key: KpiKey; label: string; curto: string; emoji: string }[] = [
  { key: 'leads', label: 'Leads atendidos', curto: 'Leads', emoji: '📲' },
  { key: 'visitas', label: 'Visitas realizadas', curto: 'Visitas', emoji: '🏠' },
  { key: 'captacoes', label: 'Captações', curto: 'Captações', emoji: '🔑' },
  { key: 'exclusividades', label: 'Captações com exclusividade', curto: 'Exclusivas', emoji: '⭐' },
  { key: 'propostas', label: 'Propostas', curto: 'Propostas', emoji: '📝' },
  { key: 'vendas', label: 'Vendas / locações fechadas', curto: 'Vendas', emoji: '🤝' },
];

export const METRICAS: Record<MetricKey, { label: string; unidade: 'qtd' | '%' | 'R$' }> = {
  leads: { label: 'Leads atendidos', unidade: 'qtd' },
  visitas: { label: 'Visitas realizadas', unidade: 'qtd' },
  captacoes: { label: 'Captações', unidade: 'qtd' },
  exclusividades: { label: 'Captações com exclusividade', unidade: 'qtd' },
  propostas: { label: 'Propostas', unidade: 'qtd' },
  vendas: { label: 'Vendas / locações', unidade: 'qtd' },
  vgv: { label: 'VGV (valor geral de vendas)', unidade: 'R$' },
  aderencia: { label: 'Aderência ao checklist', unidade: '%' },
  conv_lead_visita: { label: 'Conversão lead → visita', unidade: '%' },
  conv_visita_proposta: { label: 'Conversão visita → proposta', unidade: '%' },
  conv_proposta_venda: { label: 'Conversão proposta → venda', unidade: '%' },
};
