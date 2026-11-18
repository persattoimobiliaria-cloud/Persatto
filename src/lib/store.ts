import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Profile, TableName, Tables } from './types';
import { seedDemo } from './seed';

/**
 * Camada de dados única. Com VITE_SUPABASE_URL/ANON_KEY usa o Supabase (multiusuário, login real).
 * Sem elas, roda em MODO DEMO com dados salvos no navegador.
 */
export interface Query {
  eq?: Record<string, string | boolean>;
  since?: string; // filtra coluna `data` >= since
}

export interface Store {
  mode: 'demo' | 'supabase';
  list<T extends TableName>(table: T, q?: Query): Promise<Tables[T][]>;
  upsert<T extends TableName>(table: T, rows: Tables[T] | Tables[T][]): Promise<void>;
  remove(table: TableName, id: string): Promise<void>;
  // autenticação
  currentUser(): Promise<Profile | null>;
  signIn(email: string, senha: string): Promise<void>;
  signUp(nome: string, email: string, senha: string, telefone?: string): Promise<void>;
  signOut(): Promise<void>;
  demoLoginAs?(id: string): Promise<void>;
  onAuthChange(cb: () => void): () => void;
}

/* ---------------- MODO DEMO (localStorage) ---------------- */
const LS_PREFIX = 'persatto:';
const SESSION_KEY = LS_PREFIX + 'session';

function readTable<T>(t: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(LS_PREFIX + t) || '[]') as T[];
  } catch {
    return [];
  }
}
function writeTable(t: string, rows: unknown[]) {
  try {
    localStorage.setItem(LS_PREFIX + t, JSON.stringify(rows));
  } catch {
    /* armazenamento indisponível — segue só em memória */
  }
}

function createDemoStore(): Store {
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());
  try {
    if (!localStorage.getItem(LS_PREFIX + 'seeded-v2')) {
      const seed = seedDemo();
      (Object.keys(seed) as TableName[]).forEach((t) => writeTable(t, seed[t]));
      localStorage.setItem(LS_PREFIX + 'seeded-v2', '1');
    }
  } catch {
    /* ignore */
  }

  return {
    mode: 'demo',
    async list(table, q) {
      let rows = readTable<Record<string, unknown>>(table);
      if (q?.eq) rows = rows.filter((r) => Object.entries(q.eq!).every(([k, v]) => r[k] === v));
      if (q?.since) rows = rows.filter((r) => String(r.data ?? '') >= q.since!);
      return rows as never;
    },
    async upsert(table, rowsIn) {
      const rows = Array.isArray(rowsIn) ? rowsIn : [rowsIn];
      const all = readTable<{ id: string }>(table);
      for (const r of rows as { id: string }[]) {
        const i = all.findIndex((x) => x.id === r.id);
        if (i >= 0) all[i] = { ...all[i], ...r };
        else all.push(r);
      }
      writeTable(table, all);
    },
    async remove(table, id) {
      writeTable(table, readTable<{ id: string }>(table).filter((r) => r.id !== id));
    },
    async currentUser() {
      let id: string | null = null;
      try {
        id = localStorage.getItem(SESSION_KEY);
      } catch {
        /* ignore */
      }
      return readTable<Profile>('profiles').find((p) => p.id === id) ?? null;
    },
    async signIn() {
      throw new Error('No modo demo, escolha um perfil na lista.');
    },
    async signUp(nome, email, _senha, telefone) {
      const p: Profile = { id: 'u' + Date.now().toString(36), nome, email, telefone, role: 'corretor', ativo: true };
      writeTable('profiles', [...readTable('profiles'), p]);
      localStorage.setItem(SESSION_KEY, p.id);
      notify();
    },
    async demoLoginAs(id) {
      localStorage.setItem(SESSION_KEY, id);
      notify();
    },
    async signOut() {
      localStorage.removeItem(SESSION_KEY);
      notify();
    },
    onAuthChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };
}

export function resetDemo() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(LS_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
  location.reload();
}

/* ---------------- SUPABASE ---------------- */
function createSupabaseStore(sb: SupabaseClient): Store {
  return {
    mode: 'supabase',
    async list(table, q) {
      let query = sb.from(table).select('*');
      if (q?.eq) for (const [k, v] of Object.entries(q.eq)) query = query.eq(k, v);
      if (q?.since) query = query.gte('data', q.since);
      const { data, error } = await query.limit(10000);
      if (error) throw error;
      return (data ?? []) as never;
    },
    async upsert(table, rows) {
      const { error } = await sb.from(table).upsert(rows as never);
      if (error) throw error;
    },
    async remove(table, id) {
      const { error } = await sb.from(table).delete().eq('id', id);
      if (error) throw error;
    },
    async currentUser() {
      const { data } = await sb.auth.getUser();
      if (!data.user) return null;
      const { data: p } = await sb.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
      return (p as Profile) ?? null;
    },
    async signIn(email, senha) {
      const { error } = await sb.auth.signInWithPassword({ email, password: senha });
      if (error) throw new Error(error.message === 'Invalid login credentials' ? 'E-mail ou senha inválidos.' : error.message);
    },
    async signUp(nome, email, senha, telefone) {
      const { error } = await sb.auth.signUp({ email, password: senha, options: { data: { nome, telefone } } });
      if (error) throw error;
    },
    async signOut() {
      await sb.auth.signOut();
    },
    onAuthChange(cb) {
      const { data } = sb.auth.onAuthStateChange(() => cb());
      return () => data.subscription.unsubscribe();
    },
  };
}

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const store: Store = url && key ? createSupabaseStore(createClient(url, key)) : createDemoStore();
