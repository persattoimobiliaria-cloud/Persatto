import type { MetricKey } from '../lib/types';

/** Temas do PDI ligados a ações e KPIs da imobiliária. Ao escolher um tema o formulário SMART já vem preenchido. */
export const TEMAS_PDI: {
  tema: string;
  emoji: string;
  metrica: MetricKey;
  metaSugerida: number;
  especifica: string;
  relevante: string;
  acoes: string[];
}[] = [
  { tema: 'Prospecção e captação', emoji: '🔑', metrica: 'captacoes', metaSugerida: 6,
    especifica: 'Captar novos imóveis no meu bairro de atuação',
    relevante: 'Estoque próprio gera comissão dupla e leads para a carteira',
    acoes: ['Ligar para 3 proprietários por dia', 'Mapear placas de "vende-se" 1x por semana', 'Pedir 1 indicação a cada cliente atendido'] },
  { tema: 'Exclusividade', emoji: '⭐', metrica: 'exclusividades', metaSugerida: 3,
    especifica: 'Aumentar captações com contrato de exclusividade',
    relevante: 'Imóvel exclusivo vende mais rápido e protege a comissão',
    acoes: ['Usar o roteiro de objeção "Não quero exclusividade"', 'Montar apresentação de plano de marketing', 'Enviar relatório quinzenal a todos os proprietários'] },
  { tema: 'Atendimento e conversão', emoji: '📲', metrica: 'conv_lead_visita', metaSugerida: 25,
    especifica: 'Transformar mais leads em visitas agendadas',
    relevante: 'Lead que não vira visita é custo de marketing perdido',
    acoes: ['Responder todo lead em até 1 hora', 'Ligar antes de enviar mensagem', 'Oferecer 2 horários de visita na primeira conversa'] },
  { tema: 'Negociação e fechamento', emoji: '🤝', metrica: 'conv_visita_proposta', metaSugerida: 20,
    especifica: 'Converter mais visitas em propostas formais',
    relevante: 'Proposta é o passo que mais aproxima a venda',
    acoes: ['Estudar 2 objeções por semana em "Dicas"', 'Fazer pergunta de fechamento ao final de toda visita', 'Simular financiamento antes da visita'] },
  { tema: 'Resultado financeiro (VGV)', emoji: '💰', metrica: 'vgv', metaSugerida: 1500000,
    especifica: 'Atingir meu VGV do período',
    relevante: 'VGV é o principal indicador de resultado da imobiliária',
    acoes: ['Priorizar clientes com crédito aprovado', 'Follow-up semanal com todas as propostas abertas', 'Revisar funil com o gestor toda segunda'] },
  { tema: 'Disciplina e rotina', emoji: '✅', metrica: 'aderencia', metaSugerida: 85,
    especifica: 'Cumprir o checklist diário com consistência',
    relevante: 'Rotina consistente é o que gera previsibilidade de vendas',
    acoes: ['Ativar os lembretes no celular', 'Planejar o dia toda manhã às 8h30', 'Lançar os números antes de sair'] },
  { tema: 'Marketing pessoal e conteúdo', emoji: '🎥', metrica: 'leads', metaSugerida: 40,
    especifica: 'Gerar leads próprios com conteúdo nas redes',
    relevante: 'Corretor com audiência depende menos de portal',
    acoes: ['Postar 1 vídeo de imóvel por dia útil', 'Gravar 1 "3 coisas sobre o bairro" por semana', 'Responder todos os comentários e directs no mesmo dia'] },
];
