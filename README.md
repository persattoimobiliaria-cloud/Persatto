# Persatto Corretor — V1

App (PWA, instalável no celular) para a equipe de corretores da **Persatto Imobiliária**:

| Tela | Para quem | O que faz |
|---|---|---|
| **Hoje** | Corretor | Checklist diário curto (10 hábitos). Card "Agora" com a próxima atividade e botões grandes **✅ Feito / ❌ Não fiz**. Motivo opcional com 1 toque. Contadores de KPIs (leads, visitas, captações, exclusivas, propostas, vendas + VGV). Pontos, sequência 🔥 e resumo do dia para o gestor via WhatsApp. |
| **Lembretes** | Corretor | Notificação no celular no horário de cada atividade, com os botões **Feito / Não fiz** direto na notificação (Android/desktop; no iPhone o toque abre o app na atividade). |
| **Dicas** | Corretor | Respostas para objeções de **clientes** e **proprietários** com o gatilho mental usado (copiar / enviar no WhatsApp), ideias e roteiros de **gravação de imóveis**, guia rápido de gatilhos. |
| **PDI** | Corretor e gestor | Metas **SMART** por tema (captação, exclusividade, conversão, negociação, VGV, rotina, conteúdo). O tema já sugere KPI, meta e ações. O progresso é calculado automaticamente pelos números lançados. |
| **Gestão** | Gestor / admin | Painel da equipe (7/30/90 dias): aderência, VGV, vendas, captações, conversões, ranking, mapa de consistência diária, onde a equipe mais trava (com motivos), detalhe por corretor com funil e PDI, botão para cobrar pendências no WhatsApp. **Equipe e acessos** (liberar/bloquear, perfis) e **editor do checklist**. |

## Perfis de acesso
- **Corretor** — vê e lança só os próprios dados.
- **Gestor** — acompanha todos os corretores e monta PDIs.
- **Admin** — tudo do gestor + libera acessos, define perfis e edita o checklist.

## Rodar
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/ (site estático)
```
Sem configuração o app abre em **modo demo** (dados de exemplo salvos no navegador; escolha um perfil para testar).

## Colocar no ar com vários usuários (Supabase)
1. Crie um projeto grátis em supabase.com.
2. Em **SQL Editor**, rode `supabase/schema.sql` (tabelas, regras de acesso e checklist padrão).
3. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (Project Settings → API).
4. `npm run build` e publique a pasta `dist/` (Vercel, Netlify, GitHub Pages…). Defina as mesmas variáveis no provedor.
5. **O primeiro cadastro vira admin.** Os demais se cadastram pelo link e você libera em *Gestão → Equipe e acessos*.

## Identidade visual
As cores ficam em variáveis no topo de `src/styles.css` (`--brand`, `--accent`…) e o ícone em `public/icon.svg` — basta trocar quando chegar o layout oficial.

## Próximos passos (V2)
- Web Push com o app fechado (Supabase Edge Function + chaves VAPID; o service worker já trata o evento `push`).
- Mensagens automáticas via WhatsApp Business API.
- Integração com o CRM para preencher KPIs automaticamente.
