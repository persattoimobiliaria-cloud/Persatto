-- Persatto Corretor — schema Supabase
-- Rode no Supabase: SQL Editor > New query > cole tudo > Run.
-- O PRIMEIRO usuário a se cadastrar vira ADMIN automaticamente; os demais entram como corretor aguardando liberação.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  email text not null default '',
  telefone text,
  role text not null default 'corretor' check (role in ('admin','gestor','corretor')),
  ativo boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id text primary key,
  titulo text not null,
  dica text not null default '',
  periodo text not null check (periodo in ('manha','tarde','noite')),
  hora text not null default '09:00',
  pontos int not null default 5,
  ordem int not null default 0,
  ativo boolean not null default true
);

create table if not exists public.task_logs (
  id text primary key,                       -- user_data_task
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id text not null,
  data date not null,
  status text not null check (status in ('feito','nao_feito')),
  motivo text,
  updated_at timestamptz not null default now()
);
create index if not exists task_logs_user_data on public.task_logs (user_id, data);

create table if not exists public.kpi_entries (
  id text primary key,                       -- user_data_kpi
  user_id uuid not null references public.profiles(id) on delete cascade,
  data date not null,
  kpi text not null check (kpi in ('leads','visitas','captacoes','exclusividades','propostas','vendas','vgv')),
  valor numeric not null default 0
);
create index if not exists kpi_entries_user_data on public.kpi_entries (user_id, data);

create table if not exists public.pdi_goals (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  tema text not null,
  especifica text not null,
  metrica text not null,
  meta numeric not null,
  atingivel text not null default '',
  relevante text not null default '',
  inicio date not null,
  prazo date not null,
  acoes jsonb not null default '[]',
  status text not null default 'ativa' check (status in ('ativa','concluida','cancelada')),
  created_at timestamptz not null default now()
);

-- ---------- funções de papel ----------
create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid() and ativo
$$;
create or replace function public.is_gestor() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.my_role() in ('admin','gestor'), false)
$$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.my_role() = 'admin', false)
$$;
create or replace function public.is_ativo() returns boolean
language sql stable security definer set search_path = public as $$
  select public.my_role() is not null
$$;

-- ---------- perfil automático no cadastro ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare primeiro boolean;
begin
  select not exists (select 1 from public.profiles) into primeiro;
  insert into public.profiles (id, nome, email, telefone, role, ativo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'telefone',
    case when primeiro then 'admin' else 'corretor' end,
    primeiro
  );
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- corretor não pode se promover nem se liberar
create or replace function public.guard_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() and (new.role <> old.role or new.ativo <> old.ativo) then
    raise exception 'Somente o admin altera perfil de acesso';
  end if;
  return new;
end $$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile();

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.task_logs enable row level security;
alter table public.kpi_entries enable row level security;
alter table public.pdi_goals enable row level security;

drop policy if exists p_profiles_sel on public.profiles;
create policy p_profiles_sel on public.profiles for select using (id = auth.uid() or public.is_gestor());
drop policy if exists p_profiles_upd on public.profiles;
create policy p_profiles_upd on public.profiles for update using (id = auth.uid() or public.is_admin());

drop policy if exists p_tasks_sel on public.tasks;
create policy p_tasks_sel on public.tasks for select using (auth.uid() is not null);
drop policy if exists p_tasks_all on public.tasks;
create policy p_tasks_all on public.tasks for all using (public.is_admin()) with check (public.is_admin());

-- registros diários: o próprio corretor (ativo) grava; gestores leem todos
drop policy if exists p_logs_sel on public.task_logs;
create policy p_logs_sel on public.task_logs for select using (user_id = auth.uid() or public.is_gestor());
drop policy if exists p_logs_ins on public.task_logs;
create policy p_logs_ins on public.task_logs for insert with check (user_id = auth.uid() and public.is_ativo());
drop policy if exists p_logs_upd on public.task_logs;
create policy p_logs_upd on public.task_logs for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists p_logs_del on public.task_logs;
create policy p_logs_del on public.task_logs for delete using (user_id = auth.uid());

drop policy if exists p_kpi_sel on public.kpi_entries;
create policy p_kpi_sel on public.kpi_entries for select using (user_id = auth.uid() or public.is_gestor());
drop policy if exists p_kpi_ins on public.kpi_entries;
create policy p_kpi_ins on public.kpi_entries for insert with check (user_id = auth.uid() and public.is_ativo());
drop policy if exists p_kpi_upd on public.kpi_entries;
create policy p_kpi_upd on public.kpi_entries for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists p_kpi_del on public.kpi_entries;
create policy p_kpi_del on public.kpi_entries for delete using (user_id = auth.uid());

-- PDI: corretor edita o seu; gestor/admin edita o de qualquer um (PDI é construído junto)
drop policy if exists p_pdi_sel on public.pdi_goals;
create policy p_pdi_sel on public.pdi_goals for select using (user_id = auth.uid() or public.is_gestor());
drop policy if exists p_pdi_all on public.pdi_goals;
create policy p_pdi_all on public.pdi_goals for all
  using (user_id = auth.uid() or public.is_gestor())
  with check ((user_id = auth.uid() and public.is_ativo()) or public.is_gestor());

-- ---------- checklist padrão ----------
insert into public.tasks (id, ordem, periodo, hora, pontos, titulo, dica) values
 ('t01',1,'manha','08:30',5,'Preparação: agenda, funil e 3 metas do dia','Veja no CRM em que etapa as vendas estão travando. Revise a lista dos 100+ e as indicações recebidas.'),
 ('t02',2,'manha','09:00',10,'Prospecção ativa: novos contatos','Prioridade máxima. Indicados, grupos, portais e bairros. Registre cada lead novo no CRM na hora.'),
 ('t03',3,'manha','09:30',5,'Enviar captações nos grupos de corretores','Meta: 3x ao dia (manhã, meio do dia e fim da tarde).'),
 ('t04',4,'manha','10:00',10,'Responder leads em até 1 hora e qualificar','Momento, prazo, financiamento e necessidade. Toda conversa qualificada termina com visita ou avaliação agendada.'),
 ('t05',5,'manha','11:00',5,'Stories da manhã: bastidor + agenda','Meta: 5 a 10 stories por dia útil. Ideias prontas em Dicas > Gravação.'),
 ('t06',6,'tarde','14:00',10,'Visita ou avaliação com roteiro','Prepare documentação, chaves e roteiro: abertura, pontos fortes e objeções. Envie proposta quando couber.'),
 ('t07',7,'tarde','15:30',10,'Follow-up de leads e propostas','É onde mais se perde venda. Nunca termine a conversa sem o próximo passo combinado, com data e hora.'),
 ('t08',8,'tarde','16:30',5,'Stories da tarde: imóvel/região + enquete','Dica rápida respondendo dúvida real e prova social (chave entregue, proposta enviada), sem expor cliente.'),
 ('t09',9,'noite','18:00',10,'Atualizar o CRM e revisar o funil','O que avançou e onde travou. Registre o resultado de cada visita no mesmo dia.'),
 ('t10',10,'noite','18:30',5,'Agenda de amanhã + lançar os números','Prepare o dia seguinte, confira as metas e toque nos contadores. Leva 1 minuto.')
on conflict (id) do nothing;
