# Persatto Corretor — onde paramos e próximos passos

_Atualizado em 18/11/2026._

## Já feito (V1)
- App web instalável (PWA) com: **Hoje** (checklist de 1 toque, motivos de "não fiz", contadores de KPIs, resumo via WhatsApp), **Dicas** (objeções de clientes/proprietários com gatilhos mentais, roteiros de gravação), **PDI** (metas SMART ligadas a temas, ações e KPIs) e **Gestão** (painel da equipe, ranking, consistência diária, onde trava, detalhe por corretor, acessos e editor do checklist).
- Paleta Persatto (verde `#23332D`, areia `#DFCEBC`, bronze `#B59D82`, off-white `#FAF9F6`) e checklist baseado nos 7 blocos da rotina do modelo de referência.
- Perfis de acesso: admin, gestor, corretor. Banco Supabase com regras de segurança em `supabase/schema.sql`.
- Link de teste (modo demo, privado na conta do Claude): https://claude.ai/artifact/EVTZJVg3UKg4csZaeYJY72
- Ambiente de nuvem "Persatto" criado (instala as dependências automaticamente).

## Para colocar no ar com a equipe (próxima sessão)
1. Criar conta grátis no **Supabase** e um projeto → rodar `supabase/schema.sql` no SQL Editor.
2. Criar conta na **Vercel** (entrar com o GitHub) → importar este repositório.
3. Configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` na Vercel.
4. Primeiro cadastro vira admin; liberar os corretores em *Gestão → Equipe e acessos*.
5. (Opcional) Domínio próprio, ex.: app.persatto.com.br.

## Material pendente do cliente
- Layout oficial / logo em alta (SVG ou PNG), fontes da marca.
- Metas reais por corretor e horários da rotina da equipe.
- Lista de corretores (nome + WhatsApp).

## Ideias para a V2
- Lembretes com o app fechado (Web Push via Supabase Edge Function + chaves VAPID; o `public/sw.js` já trata o evento `push`).
- Mensagens automáticas pelo WhatsApp Business.
- Ciclo de 15 dias com feedback do gestor (como no modelo de referência).
- "Mesa de Negócios": anotações rápidas de demandas, captações e problemas.
- Integração com o CRM (Apresenta.me) para preencher KPIs automaticamente.
