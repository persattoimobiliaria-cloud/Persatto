import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { DEFAULT_TASKS } from '../data/tasks';
import { addDays, today } from './dates';
import { store } from './store';
import type { KpiEntry, KpiKey, PdiGoal, Profile, Task, TaskLog, TaskStatus } from './types';

interface Ctx {
  me: Profile;
  isGestor: boolean;
  tasks: Task[];
  logs: TaskLog[];
  kpis: KpiEntry[];
  goals: PdiGoal[];
  profiles: Profile[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setTaskStatus: (taskId: string, status: TaskStatus | null, motivo?: string, data?: string) => Promise<void>;
  bumpKpi: (kpi: KpiKey, delta: number, data?: string) => Promise<void>;
  setKpi: (kpi: KpiKey, valor: number, data?: string) => Promise<void>;
  saveGoal: (g: PdiGoal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  saveTasks: (t: Task[]) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  saveProfile: (p: Profile) => Promise<void>;
}

const DataCtx = createContext<Ctx | null>(null);
export const useData = () => {
  const c = useContext(DataCtx);
  if (!c) throw new Error('useData fora do provider');
  return c;
};

const HIST_DAYS = 120;

export function DataProvider({ me, children }: { me: Profile; children: ReactNode }) {
  const isGestor = me.role === 'admin' || me.role === 'gestor';
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<TaskLog[]>([]);
  const [kpis, setKpis] = useState<KpiEntry[]>([]);
  const [goals, setGoals] = useState<PdiGoal[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([me]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const logsRef = useRef(logs);
  logsRef.current = logs;
  const kpisRef = useRef(kpis);
  kpisRef.current = kpis;

  const reload = useCallback(async () => {
    try {
      const since = addDays(today(), -HIST_DAYS);
      const own = isGestor ? undefined : { user_id: me.id };
      const [t, l, k, g, p] = await Promise.all([
        store.list('tasks'),
        store.list('task_logs', { eq: own, since }),
        store.list('kpi_entries', { eq: own, since }),
        store.list('pdi_goals', { eq: own }),
        isGestor ? store.list('profiles') : Promise.resolve([me]),
      ]);
      setTasks((t.length ? t : DEFAULT_TASKS).sort((a, b) => a.ordem - b.ordem));
      setLogs(l);
      setKpis(k);
      setGoals(g);
      setProfiles(p);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [me, isGestor]);

  useEffect(() => {
    reload();
  }, [reload]);

  const run = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
      reload();
    }
  };

  const setTaskStatus: Ctx['setTaskStatus'] = async (taskId, status, motivo, data = today()) => {
    const id = `${me.id}_${data}_${taskId}`;
    if (status === null) {
      setLogs((ls) => ls.filter((l) => l.id !== id));
      return run(() => store.remove('task_logs', id));
    }
    const row: TaskLog = { id, user_id: me.id, task_id: taskId, data, status, motivo: motivo ?? null };
    setLogs((ls) => [...ls.filter((l) => l.id !== id), row]);
    return run(() => store.upsert('task_logs', row));
  };

  const setKpi: Ctx['setKpi'] = async (kpi, valor, data = today()) => {
    const id = `${me.id}_${data}_${kpi}`;
    const row: KpiEntry = { id, user_id: me.id, data, kpi, valor: Math.max(0, valor) };
    setKpis((ks) => [...ks.filter((k) => k.id !== id), row]);
    return run(() => store.upsert('kpi_entries', row));
  };

  const bumpKpi: Ctx['bumpKpi'] = async (kpi, delta, data = today()) => {
    const id = `${me.id}_${data}_${kpi}`;
    const cur = kpisRef.current.find((k) => k.id === id)?.valor ?? 0;
    return setKpi(kpi, cur + delta, data);
  };

  const saveGoal: Ctx['saveGoal'] = async (g) => {
    setGoals((gs) => [...gs.filter((x) => x.id !== g.id), g]);
    return run(() => store.upsert('pdi_goals', g));
  };
  const deleteGoal: Ctx['deleteGoal'] = async (id) => {
    setGoals((gs) => gs.filter((x) => x.id !== id));
    return run(() => store.remove('pdi_goals', id));
  };
  const saveTasks: Ctx['saveTasks'] = async (t) => {
    setTasks((ts) => [...ts.filter((x) => !t.some((n) => n.id === x.id)), ...t].sort((a, b) => a.ordem - b.ordem));
    return run(() => store.upsert('tasks', t));
  };
  const deleteTask: Ctx['deleteTask'] = async (id) => {
    setTasks((ts) => ts.filter((x) => x.id !== id));
    return run(() => store.remove('tasks', id));
  };
  const saveProfile: Ctx['saveProfile'] = async (p) => {
    setProfiles((ps) => [...ps.filter((x) => x.id !== p.id), p]);
    return run(() => store.upsert('profiles', p));
  };

  return (
    <DataCtx.Provider
      value={{ me, isGestor, tasks, logs, kpis, goals, profiles, loading, error, reload, setTaskStatus, bumpKpi, setKpi, saveGoal, deleteGoal, saveTasks, deleteTask, saveProfile }}
    >
      {children}
    </DataCtx.Provider>
  );
}
