import type { Task } from '../lib/types';

/** Checklist padrão — curto de propósito: 10 hábitos que geram negócio. O admin edita em "Admin > Checklist". */
export const DEFAULT_TASKS: Task[] = [
  { id: 't01', ordem: 1, periodo: 'manha', hora: '08:30', pontos: 5, ativo: true,
    titulo: 'Planejar o dia (3 prioridades)', dica: 'Abra a agenda e escolha as 3 ações que mais aproximam você de uma venda hoje.' },
  { id: 't02', ordem: 2, periodo: 'manha', hora: '09:00', pontos: 10, ativo: true,
    titulo: 'Responder leads novos em até 5 min', dica: 'Lead respondido em 5 min tem muito mais chance de virar visita. Ligue antes de mandar texto.' },
  { id: 't03', ordem: 3, periodo: 'manha', hora: '09:30', pontos: 10, ativo: true,
    titulo: 'Follow-up com 5 clientes', dica: 'Mande algo útil: um imóvel novo, uma foto, uma notícia do bairro. Nada de "e aí, pensou?".' },
  { id: 't04', ordem: 4, periodo: 'manha', hora: '10:30', pontos: 5, ativo: true,
    titulo: 'Postar 1 story ou vídeo', dica: 'Bastidor de visita, imóvel novo ou dica do bairro. Veja ideias em "Dicas > Gravação".' },
  { id: 't05', ordem: 5, periodo: 'tarde', hora: '13:30', pontos: 10, ativo: true,
    titulo: 'Prospectar 3 proprietários', dica: 'Captação é estoque. Ligue para indicações, placas de "vende-se" e antigos clientes.' },
  { id: 't06', ordem: 6, periodo: 'tarde', hora: '15:00', pontos: 10, ativo: true,
    titulo: 'Fazer 1 visita ou apresentação', dica: 'Confirme a visita 2h antes e leve a ficha do imóvel com 3 diferenciais.' },
  { id: 't07', ordem: 7, periodo: 'tarde', hora: '16:30', pontos: 5, ativo: true,
    titulo: 'Atualizar anúncios e fotos', dica: 'Anúncio com foto boa e preço atualizado recebe mais contatos. Revise 2 por dia.' },
  { id: 't08', ordem: 8, periodo: 'noite', hora: '18:00', pontos: 10, ativo: true,
    titulo: 'Registrar atendimentos no CRM', dica: 'O que não está no CRM não existe. Anote próximo passo e data de cada cliente.' },
  { id: 't09', ordem: 9, periodo: 'noite', hora: '18:30', pontos: 5, ativo: true,
    titulo: 'Dar retorno aos proprietários', dica: 'Proprietário informado renova exclusividade. Conte visitas e feedbacks da semana.' },
  { id: 't10', ordem: 10, periodo: 'noite', hora: '19:00', pontos: 5, ativo: true,
    titulo: 'Lançar os números do dia', dica: 'Toque nos contadores de leads, visitas, captações e propostas. Leva 10 segundos.' },
];

export const PERIODO_LABEL: Record<Task['periodo'], string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Fim do dia',
};

export const MOTIVOS = ['Sem tempo', 'Sem lead / cliente', 'Cliente não respondeu', 'Outro'];
