export interface Dica {
  id: string;
  titulo: string;
  resumo: string;
  passos?: string[];
  tag?: string;
}

/** Ideias de gravação de imóveis — formatos curtos e prontos para usar. */
export const GRAVACAO: Dica[] = [
  { id: 'g1', tag: 'Roteiro 30s', titulo: 'Tour em 3 atos',
    resumo: 'Gancho, diferenciais e chamada. Funciona em reels, stories e status.',
    passos: ['0–3s: comece pela melhor vista ou ambiente + frase-gancho ("Olha essa varanda…")', '3–25s: mostre 3 diferenciais, um por cena', '25–30s: preço/bairro + "Me chama para agendar a visita"'] },
  { id: 'g2', tag: 'Formato', titulo: 'POV: chegando em casa',
    resumo: 'Grave em primeira pessoa: abrir o portão, entrar, largar a chave, abrir a janela. Gera desejo.',
    passos: ['Celular na altura do peito', 'Movimentos lentos e contínuos', 'Termine na vista ou na área de lazer'] },
  { id: 'g3', tag: 'Formato', titulo: 'Quanto custa morar aqui?',
    resumo: 'Mostre o imóvel e coloque na tela: valor, condomínio, IPTU e parcela estimada. Atrai leads qualificados.' },
  { id: 'g4', tag: 'Formato', titulo: '3 coisas que ninguém te conta sobre o bairro',
    resumo: 'Vídeo de autoridade: padaria, parque, escola, trânsito. Posiciona você como especialista local.' },
  { id: 'g5', tag: 'Checklist', titulo: 'Antes de apertar o REC',
    resumo: 'Imóvel preparado dobra a qualidade do vídeo.',
    passos: ['Abrir cortinas e acender todas as luzes', 'Tirar objetos pessoais, ímãs de geladeira e lixo', 'Camas arrumadas, tampas de vaso abaixadas', 'Limpar a lente do celular', 'Gravar entre 9h–11h ou 15h–17h (luz natural)'] },
  { id: 'g6', tag: 'Técnica', titulo: 'Vertical ou horizontal?',
    resumo: 'Vertical (9:16) para Instagram, TikTok e WhatsApp. Horizontal (16:9) para portais e YouTube. Grave os dois se puder.' },
  { id: 'g7', tag: 'Técnica', titulo: 'Movimento que vende',
    resumo: 'Ande devagar, cotovelos colados ao corpo, use o modo 0,5x em ambientes pequenos e nunca dê zoom digital.' },
  { id: 'g8', tag: 'Formato', titulo: 'Depoimento do proprietário',
    resumo: '20s do dono contando o que mais vai sentir falta da casa. Gera emoção e confiança.' },
  { id: 'g9', tag: 'Formato', titulo: 'Antes x depois / bastidor',
    resumo: 'Mostre a preparação do imóvel, a sessão de fotos ou a entrega de chaves. Bastidor humaniza seu perfil.' },
];

export interface Objecao {
  id: string;
  publico: 'cliente' | 'proprietario';
  objecao: string;
  gatilho: string;
  resposta: string;
}

/** Gatilhos mentais aplicados às objeções mais comuns. Respostas curtas para copiar e adaptar. */
export const OBJECOES: Objecao[] = [
  // Clientes (compradores / locatários)
  { id: 'o1', publico: 'cliente', objecao: '"Está caro."', gatilho: 'Ancoragem + valor',
    resposta: 'Entendo. Comparado aos imóveis do mesmo padrão no bairro, o m² dele está abaixo da média. O que pesa mais pra você hoje: o valor total ou a parcela mensal?' },
  { id: 'o2', publico: 'cliente', objecao: '"Vou pensar."', gatilho: 'Compromisso e coerência',
    resposta: 'Claro! Pra eu te ajudar a pensar: de 0 a 10, quanto esse imóvel atende o que você procura? O que falta para ser 10?' },
  { id: 'o3', publico: 'cliente', objecao: '"Preciso falar com meu marido/minha esposa."', gatilho: 'Compromisso',
    resposta: 'Perfeito, a decisão tem que ser dos dois. Qual o melhor horário para fazermos uma visita juntos ainda esta semana?' },
  { id: 'o4', publico: 'cliente', objecao: '"Vou esperar os juros caírem."', gatilho: 'Custo da espera (urgência)',
    resposta: 'Faz sentido avaliar. Só lembrando: cada mês esperando é um aluguel pago que não volta, e quando os juros caem a procura e os preços sobem. Posso simular os dois cenários pra você?' },
  { id: 'o5', publico: 'cliente', objecao: '"Achei outro mais barato."', gatilho: 'Comparação + autoridade',
    resposta: 'Ótimo que você está pesquisando! Me manda o link que eu faço uma comparação lado a lado: metragem, vaga, condomínio e documentação. Às vezes o barato tem um custo escondido.' },
  { id: 'o6', publico: 'cliente', objecao: '"Só estou olhando."', gatilho: 'Reciprocidade',
    resposta: 'Sem problema nenhum! Posso te mandar uma seleção com 3 opções no seu perfil, sem compromisso? Assim você compara com calma.' },
  { id: 'o7', publico: 'cliente', objecao: '"Tem outro interessado? Duvido."', gatilho: 'Escassez (verdadeira)',
    resposta: 'Esse imóvel teve X visitas esta semana. Não quero te pressionar, só te avisar: se gostou, uma proposta segura sua prioridade na negociação.' },
  // Proprietários
  { id: 'p1', publico: 'proprietario', objecao: '"Não quero dar exclusividade."', gatilho: 'Autoridade + prova',
    resposta: 'Com exclusividade eu invisto em fotos profissionais, vídeo e anúncio destacado — e te mando relatório quinzenal de visitas. Que tal 90 dias? Se eu não entregar, você não renova.' },
  { id: 'p2', publico: 'proprietario', objecao: '"Outro corretor avaliou por mais."', gatilho: 'Prova social + dados',
    resposta: 'Pode ser. Te mostro os imóveis parecidos que realmente venderam na região e por quanto. Preço acima do mercado gera poucas visitas e o imóvel "queima" nos portais.' },
  { id: 'p3', publico: 'proprietario', objecao: '"A comissão é alta."', gatilho: 'Valor percebido',
    resposta: 'Entendo. A comissão inclui marketing, filtro de curiosos, negociação e toda a segurança documental. Um bom negociador costuma preservar mais do que a comissão no preço final.' },
  { id: 'p4', publico: 'proprietario', objecao: '"Vou vender sozinho."', gatilho: 'Segurança / aversão à perda',
    resposta: 'É um direito seu. Só fique atento: visitas sem filtro, golpes e erros de documentação são comuns. Posso te ajudar ao menos com a avaliação e a análise do comprador?' },
  { id: 'p5', publico: 'proprietario', objecao: '"Não vou baixar o preço."', gatilho: 'Dados + consistência',
    resposta: 'Combinamos que o objetivo é vender em até X meses. Em 30 dias tivemos Y visitas e nenhuma proposta — o mercado está dizendo algo. Que tal um ajuste pequeno por 15 dias e medimos o resultado?' },
  { id: 'p6', publico: 'proprietario', objecao: '"Não quero placa nem fotos."', gatilho: 'Exclusividade + discrição',
    resposta: 'Respeito totalmente. Podemos trabalhar de forma discreta: divulgação só para minha carteira de compradores qualificados e visitas agendadas com cadastro prévio.' },
];

export const GATILHOS = [
  { nome: 'Escassez', uso: 'Poucas unidades, imóvel com muita procura — sempre verdadeiro.' },
  { nome: 'Urgência', uso: 'Condição com prazo: taxa, desconto, data de reajuste.' },
  { nome: 'Prova social', uso: 'Vendas recentes, depoimentos, número de visitas.' },
  { nome: 'Autoridade', uso: 'Dados de mercado, anos de experiência, especialista no bairro.' },
  { nome: 'Reciprocidade', uso: 'Entregue valor antes: avaliação, seleção de imóveis, simulação.' },
  { nome: 'Ancoragem', uso: 'Mostre primeiro uma referência mais alta ou o m² da região.' },
  { nome: 'Compromisso', uso: 'Pequenos "sins" levam ao grande sim: visita, proposta, contrato.' },
  { nome: 'Afinidade', uso: 'Escute, ache pontos em comum, chame pelo nome.' },
];
