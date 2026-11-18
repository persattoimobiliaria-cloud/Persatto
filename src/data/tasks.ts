import type { Task } from '../lib/types';

/** Checklist padrão — curto de propósito: 10 ações que resumem os 7 blocos da rotina Persatto. O admin edita em "Admin > Checklist". */
export const DEFAULT_TASKS: Task[] = [
  { id: 't01', ordem: 1, periodo: 'manha', hora: '08:30', pontos: 5, ativo: true,
    titulo: "Preparação: agenda, funil e 3 metas do dia", dica: "Veja no CRM em que etapa as vendas estão travando. Revise a lista dos 100+ e as indicações recebidas." },
  { id: 't02', ordem: 2, periodo: 'manha', hora: '09:00', pontos: 10, ativo: true,
    titulo: "Prospecção ativa: novos contatos", dica: "Prioridade máxima. Indicados, grupos, portais e bairros. Registre cada lead novo no CRM na hora." },
  { id: 't03', ordem: 3, periodo: 'manha', hora: '09:30', pontos: 5, ativo: true,
    titulo: "Enviar captações nos grupos de corretores", dica: "Meta: 3x ao dia (manhã, meio do dia e fim da tarde)." },
  { id: 't04', ordem: 4, periodo: 'manha', hora: '10:00', pontos: 10, ativo: true,
    titulo: "Responder leads em até 1 hora e qualificar", dica: "Momento, prazo, financiamento e necessidade. Toda conversa qualificada termina com visita ou avaliação agendada." },
  { id: 't05', ordem: 5, periodo: 'manha', hora: '11:00', pontos: 5, ativo: true,
    titulo: "Stories da manhã: bastidor + agenda", dica: "Meta: 5 a 10 stories por dia útil. Ideias prontas em Dicas > Gravação." },
  { id: 't06', ordem: 6, periodo: 'tarde', hora: '14:00', pontos: 10, ativo: true,
    titulo: "Visita ou avaliação com roteiro", dica: "Prepare documentação, chaves e roteiro: abertura, pontos fortes e objeções. Envie proposta quando couber." },
  { id: 't07', ordem: 7, periodo: 'tarde', hora: '15:30', pontos: 10, ativo: true,
    titulo: "Follow-up de leads e propostas", dica: "É onde mais se perde venda. Nunca termine a conversa sem o próximo passo combinado, com data e hora." },
  { id: 't08', ordem: 8, periodo: 'tarde', hora: '16:30', pontos: 5, ativo: true,
    titulo: "Stories da tarde: imóvel/região + enquete", dica: "Dica rápida respondendo dúvida real e prova social (chave entregue, proposta enviada), sem expor cliente." },
  { id: 't09', ordem: 9, periodo: 'noite', hora: '18:00', pontos: 10, ativo: true,
    titulo: "Atualizar o CRM e revisar o funil", dica: "O que avançou e onde travou. Registre o resultado de cada visita no mesmo dia." },
  { id: 't10', ordem: 10, periodo: 'noite', hora: '18:30', pontos: 5, ativo: true,
    titulo: "Agenda de amanhã + lançar os números", dica: "Prepare o dia seguinte, confira as metas e toque nos contadores. Leva 1 minuto." },
];

export const PERIODO_LABEL: Record<Task['periodo'], string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Fim do dia',
};

export const MOTIVOS = ['Sem tempo', 'Sem lead / cliente', 'Cliente não respondeu', 'Outro'];
