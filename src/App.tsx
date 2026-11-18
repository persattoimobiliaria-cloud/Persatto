import { useEffect, useRef, useState } from 'react';
import { DataProvider, useData } from './lib/data';
import { startScheduler } from './lib/notify';
import { store } from './lib/store';
import type { Profile, TaskStatus } from './lib/types';
import Login from './pages/Login';
import Hoje from './pages/Hoje';
import Dicas from './pages/Dicas';
import Pdi from './pages/Pdi';
import Admin from './pages/Admin';

type Tab = 'hoje' | 'dicas' | 'pdi' | 'admin';

export default function App() {
  const [me, setMe] = useState<Profile | null | undefined>(undefined);

  useEffect(() => {
    const load = () => store.currentUser().then(setMe).catch(() => setMe(null));
    load();
    return store.onAuthChange(load);
  }, []);

  if (me === undefined) return <div className="splash">Persatto</div>;
  if (!me) return <Login />;
  if (!me.ativo)
    return (
      <div className="login">
        <div className="card">
          <h2>Acesso aguardando liberação</h2>
          <p className="muted">Seu cadastro foi recebido. O gestor da Persatto precisa liberar seu acesso.</p>
          <button className="btn ghost" onClick={() => store.signOut()}>Sair</button>
        </div>
      </div>
    );
  return (
    <DataProvider me={me}>
      <Shell />
    </DataProvider>
  );
}

function Shell() {
  const { me, isGestor, tasks, logs, setTaskStatus, error } = useData();
  const [tab, setTab] = useState<Tab>(isGestor ? 'admin' : 'hoje');
  const stateRef = useRef({ tasks, logs, userId: me.id });
  stateRef.current = { tasks, logs, userId: me.id };

  // Lembretes no celular
  useEffect(() => startScheduler(() => stateRef.current), []);

  // Toques em "Feito"/"Não fiz" vindos da notificação
  useEffect(() => {
    const apply = (taskId?: string, date?: string, acao?: string) => {
      if (!taskId) return;
      setTab('hoje');
      if (acao === 'feito' || acao === 'nao_feito') setTaskStatus(taskId, acao as TaskStatus, undefined, date || undefined);
    };
    const qs = new URLSearchParams(location.search);
    if (qs.get('task')) {
      apply(qs.get('task')!, qs.get('data')!, qs.get('acao')!);
      history.replaceState(null, '', location.pathname);
    }
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === 'task-action') apply(e.data.taskId, e.data.date, e.data.status);
    };
    navigator.serviceWorker?.addEventListener('message', onMsg);
    return () => navigator.serviceWorker?.removeEventListener('message', onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'hoje', label: 'Hoje', icon: '✅' },
    { id: 'dicas', label: 'Dicas', icon: '💡' },
    { id: 'pdi', label: 'PDI', icon: '🎯' },
    ...(isGestor ? [{ id: 'admin' as Tab, label: 'Gestão', icon: '📊' }] : []),
  ];

  return (
    <div className={`app ${tab === 'admin' ? 'wide' : ''}`}>
      <header className="topbar">
        <div className="brand">
          <img src="./icon.svg" alt="" width={28} height={28} />
          <span>Persatto</span>
          {store.mode === 'demo' && <span className="pill">demo</span>}
        </div>
        <button className="link" onClick={() => store.signOut()}>{store.mode === 'demo' ? 'Trocar perfil' : 'Sair'}</button>
      </header>
      {error && <div className="alert">⚠️ {error}</div>}
      <main>
        {tab === 'hoje' && <Hoje />}
        {tab === 'dicas' && <Dicas />}
        {tab === 'pdi' && <Pdi />}
        {tab === 'admin' && isGestor && <Admin />}
      </main>
      <nav className="tabbar">
        {tabs.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            <span className="ico">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
