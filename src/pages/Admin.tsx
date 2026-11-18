import { useMemo, useState } from 'react';
import { KPIS } from '../data/kpis';
import { PERIODO_LABEL } from '../data/tasks';
import { Bar, Section, tone } from '../components/ui';
import { useData } from '../lib/data';
import { addDays, fmtDayShort, isWeekend, range, today, uid, weekdayShort } from '../lib/dates';
import { computeStats, dayAderencia, fmtMoney, goalProgress, streak } from '../lib/metrics';
import { waLink } from '../lib/notify';
import { store } from '../lib/store';
import type { Periodo, Profile, Role, Task } from '../lib/types';
import Pdi from './Pdi';

type Aba = 'painel' | 'equipe' | 'checklist';

export default function Admin() {
  const [aba, setAba] = useState<Aba>('painel');
  return (
    <div className="page">
      <div className="seg">
        <button className={aba === 'painel' ? 'on' : ''} onClick={() => setAba('painel')}>📊 Painel</button>
        <button className={aba === 'equipe' ? 'on' : ''} onClick={() => setAba('equipe')}>👥 Equipe e acessos</button>
        <button className={aba === 'checklist' ? 'on' : ''} onClick={() => setAba('checklist')}>📝 Checklist</button>
      </div>
      {aba === 'painel' && <Painel />}
      {aba === 'equipe' && <Equipe />}
      {aba === 'checklist' && <ChecklistEditor />}
    </div>
  );
}

/* ---------------- Painel ---------------- */
function Painel() {
  const { profiles, tasks, logs, kpis, goals } = useData();
  const [dias, setDias] = useState(30);
  const [detalhe, setDetalhe] = useState<string | null>(null);
  const t = today();
  const from = addDays(t, -(dias - 1));
  const corretores = profiles.filter((p) => p.ativo && p.role === 'corretor').sort((a, b) => a.nome.localeCompare(b.nome));

  const linhas = useMemo(
    () =>
      corretores
        .map((p) => {
          const s = computeStats(p.id, from, t, tasks, logs, kpis);
          const gs = goals.filter((g) => g.user_id === p.id && g.status === 'ativa');
          const pdi = gs.length ? Math.round(gs.reduce((a, g) => a + goalProgress(g, tasks, logs, kpis).progresso, 0) / gs.length) : null;
          return { p, s, pdi, fogo: streak(p.id, tasks, logs), hoje: dayAderencia(p.id, t, tasks, logs) };
        })
        .sort((a, b) => b.s.pontos - a.s.pontos),
    [corretores, from, t, tasks, logs, kpis, goals],
  );

  const tot = linhas.reduce(
    (acc, l) => {
      KPIS.forEach((k) => (acc[k.key] = (acc[k.key] ?? 0) + l.s.kpi[k.key]));
      acc.vgv = (acc.vgv ?? 0) + l.s.kpi.vgv;
      acc.ader = (acc.ader ?? 0) + l.s.aderencia;
      return acc;
    },
    {} as Record<string, number>,
  );
  const aderMedia = linhas.length ? Math.round(tot.ader / linhas.length) : 0;

  // atividades mais "não feitas" e motivos
  const falhas = useMemo(() => {
    const ids = new Set(corretores.map((c) => c.id));
    const m = new Map<string, { n: number; motivos: Map<string, number> }>();
    for (const l of logs) {
      if (l.status !== 'nao_feito' || l.data < from || !ids.has(l.user_id)) continue;
      const e = m.get(l.task_id) ?? { n: 0, motivos: new Map() };
      e.n++;
      if (l.motivo) e.motivos.set(l.motivo, (e.motivos.get(l.motivo) ?? 0) + 1);
      m.set(l.task_id, e);
    }
    return [...m.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 5);
  }, [logs, from, corretores]);

  const ultimos = range(addDays(t, -20), t).filter((d) => !isWeekend(d)).slice(-14);

  if (detalhe) {
    const l = linhas.find((x) => x.p.id === detalhe);
    if (l) return <Detalhe linha={l} dias={dias} onBack={() => setDetalhe(null)} ultimos={ultimos} />;
  }

  const pendentesHoje = (p: Profile) => {
    const feitos = new Set(logs.filter((l) => l.user_id === p.id && l.data === t).map((l) => l.task_id));
    return tasks.filter((x) => x.ativo && !feitos.has(x.id) && x.hora <= new Date().toTimeString().slice(0, 5));
  };

  return (
    <>
      <div className="row between">
        <h2>Evolução da equipe</h2>
        <select value={dias} onChange={(e) => setDias(Number(e.target.value))}>
          <option value={7}>Últimos 7 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={90}>Últimos 90 dias</option>
        </select>
      </div>

      <div className="tiles">
        <div className="tile"><span>Aderência média</span><b className={tone(aderMedia)}>{aderMedia}%</b></div>
        <div className="tile"><span>VGV</span><b>{fmtMoney(tot.vgv ?? 0)}</b></div>
        <div className="tile"><span>Vendas</span><b>{tot.vendas ?? 0}</b></div>
        <div className="tile"><span>Captações</span><b>{tot.captacoes ?? 0}</b><small>{tot.exclusividades ?? 0} exclusivas</small></div>
        <div className="tile"><span>Visitas</span><b>{tot.visitas ?? 0}</b></div>
        <div className="tile"><span>Lead → visita</span><b>{tot.leads ? Math.round((tot.visitas / tot.leads) * 100) : 0}%</b></div>
      </div>

      <Section title="Ranking dos corretores">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Corretor</th><th>Hoje</th><th>Aderência</th><th>Pts</th><th>🔥</th>
                <th>Leads</th><th>Visitas</th><th>Capt.</th><th>Prop.</th><th>Vendas</th><th>VGV</th><th>PDI</th><th></th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l, i) => {
                const pend = pendentesHoje(l.p);
                const msg = `Oi ${l.p.nome.split(' ')[0]}! Passando para lembrar das atividades de hoje:\n` + pend.map((x) => `• ${x.titulo}`).join('\n') + `\n\nResolve no app com um toque 💪`;
                return (
                  <tr key={l.p.id}>
                    <td><button className="link" onClick={() => setDetalhe(l.p.id)}>{i + 1}. {l.p.nome}</button></td>
                    <td><span className={`dot ${tone(l.hoje)}`} />{l.hoje}%</td>
                    <td className="w-bar"><Bar value={l.s.aderencia} /><small>{l.s.aderencia}%</small></td>
                    <td>{l.s.pontos}</td>
                    <td>{l.fogo}</td>
                    <td>{l.s.kpi.leads}</td>
                    <td>{l.s.kpi.visitas}</td>
                    <td>{l.s.kpi.captacoes}</td>
                    <td>{l.s.kpi.propostas}</td>
                    <td>{l.s.kpi.vendas}</td>
                    <td>{fmtMoney(l.s.kpi.vgv)}</td>
                    <td>{l.pdi === null ? '—' : `${l.pdi}%`}</td>
                    <td>
                      {pend.length > 0 && (
                        <a className="btn small wa" href={waLink(l.p.telefone, msg)} target="_blank" rel="noreferrer" title="Cobrar pendências no WhatsApp">
                          💬 {pend.length}
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!linhas.length && <tr><td colSpan={13} className="muted">Nenhum corretor ativo. Libere acessos em "Equipe e acessos".</td></tr>}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Consistência diária (checklist %)">
        <div className="table-wrap">
          <table className="heat">
            <thead>
              <tr><th />{ultimos.map((d) => <th key={d}><small>{weekdayShort(d)}</small><br />{fmtDayShort(d)}</th>)}</tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.p.id}>
                  <th>{l.p.nome.split(' ')[0]}</th>
                  {ultimos.map((d) => {
                    const v = dayAderencia(l.p.id, d, tasks, logs);
                    return <td key={d} className={`h${Math.min(4, Math.floor(v / 25))}`} title={`${v}%`}>{v || ''}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Onde a equipe mais trava">
        {falhas.length === 0 && <p className="muted">Sem registros de "não fiz" no período.</p>}
        {falhas.map(([id, e]) => {
          const task = tasks.find((x) => x.id === id);
          return (
            <div key={id} className="falha">
              <div className="row between"><b>{task?.titulo ?? id}</b><span className="muted">{e.n}×</span></div>
              <small className="muted">{[...e.motivos.entries()].sort((a, b) => b[1] - a[1]).map(([m, n]) => `${m} (${n})`).join(' · ') || 'sem motivo informado'}</small>
            </div>
          );
        })}
      </Section>
    </>
  );
}

function Detalhe({ linha, dias, onBack, ultimos }: {
  linha: { p: Profile; s: ReturnType<typeof computeStats>; fogo: number }; dias: number; onBack: () => void; ultimos: string[];
}) {
  const { tasks, logs } = useData();
  const { p, s } = linha;
  const funil = [
    { k: 'Leads', v: s.kpi.leads },
    { k: 'Visitas', v: s.kpi.visitas },
    { k: 'Propostas', v: s.kpi.propostas },
    { k: 'Vendas', v: s.kpi.vendas },
  ];
  const max = Math.max(1, ...funil.map((f) => f.v));
  return (
    <>
      <button className="link" onClick={onBack}>← Voltar ao painel</button>
      <div className="hero slim">
        <div>
          <h2>{p.nome}</h2>
          <p className="muted small">Últimos {dias} dias · {s.pontos} pts · 🔥 {linha.fogo} dias seguidos</p>
        </div>
        <a className="btn small wa" href={waLink(p.telefone, `Oi ${p.nome.split(' ')[0]}! `)} target="_blank" rel="noreferrer">💬 WhatsApp</a>
      </div>
      <div className="tiles">
        <div className="tile"><span>Aderência</span><b className={tone(s.aderencia)}>{s.aderencia}%</b></div>
        <div className="tile"><span>Captações</span><b>{s.kpi.captacoes}</b><small>{s.kpi.exclusividades} exclusivas</small></div>
        <div className="tile"><span>VGV</span><b>{fmtMoney(s.kpi.vgv)}</b></div>
      </div>
      <Section title="Funil de vendas">
        <div className="funil">
          {funil.map((f, i) => (
            <div key={f.k} className="funil-row">
              <span>{f.k}</span>
              <div className="funil-bar" style={{ width: `${Math.max(6, (f.v / max) * 100)}%` }}>{f.v}</div>
              {i > 0 && <small className="muted">{funil[i - 1].v ? Math.round((f.v / funil[i - 1].v) * 100) : 0}%</small>}
            </div>
          ))}
        </div>
      </Section>
      <Section title="Últimos dias">
        <div className="mini-days">
          {ultimos.map((d) => {
            const v = dayAderencia(p.id, d, tasks, logs);
            return <div key={d} className={`h${Math.min(4, Math.floor(v / 25))}`} title={`${fmtDayShort(d)}: ${v}%`}><small>{fmtDayShort(d)}</small>{v}%</div>;
          })}
        </div>
      </Section>
      <Pdi userId={p.id} />
    </>
  );
}

/* ---------------- Equipe e acessos ---------------- */
const ROLE_LABEL: Record<Role, string> = { admin: 'Admin (tudo)', gestor: 'Gestor (vê a equipe)', corretor: 'Corretor' };

function Equipe() {
  const { me, profiles, saveProfile } = useData();
  const [nome, setNome] = useState('');
  const [tel, setTel] = useState('');
  const [role, setRole] = useState<Role>('corretor');
  const isAdmin = me.role === 'admin';
  const lista = [...profiles].sort((a, b) => Number(a.ativo) - Number(b.ativo) || a.nome.localeCompare(b.nome));
  const link = location.origin + location.pathname;

  return (
    <>
      <Section title="Como dar acesso">
        {store.mode === 'supabase' ? (
          <p className="muted">
            Envie o link do app para a pessoa: <code>{link}</code>. Ela se cadastra com e-mail e senha e aparece aqui como
            <b> aguardando liberação</b>. Ative o acesso e escolha o perfil: <b>Corretor</b> vê só o próprio painel, <b>Gestor</b> acompanha a equipe, <b>Admin</b> também edita acessos e o checklist.
          </p>
        ) : (
          <p className="muted">Modo demo: adicione pessoas abaixo. Com o Supabase configurado, cada um cria seu próprio login e você libera aqui.</p>
        )}
      </Section>

      {store.mode === 'demo' && isAdmin && (
        <div className="form inline">
          <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          <input placeholder="WhatsApp (55 + DDD + número)" value={tel} onChange={(e) => setTel(e.target.value)} />
          <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
          <button className="btn primary" disabled={!nome.trim()} onClick={() => {
            saveProfile({ id: uid(), nome: nome.trim(), email: '', telefone: tel, role, ativo: true });
            setNome(''); setTel('');
          }}>Adicionar</button>
        </div>
      )}

      <ul className="people">
        {lista.map((p) => (
          <li key={p.id} className={p.ativo ? '' : 'pending'}>
            <span className="avatar">{p.nome[0]}</span>
            <div className="grow">
              <b>{p.nome}</b>
              <small className="muted">{p.email || '—'}{!p.ativo && ' · aguardando liberação'}</small>
              <input className="tel" defaultValue={p.telefone ?? ''} placeholder="WhatsApp" disabled={!isAdmin}
                onBlur={(e) => e.target.value !== (p.telefone ?? '') && saveProfile({ ...p, telefone: e.target.value })} />
            </div>
            <select value={p.role} disabled={!isAdmin || p.id === me.id} onChange={(e) => saveProfile({ ...p, role: e.target.value as Role })}>
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
            <button className={`btn small ${p.ativo ? 'ghost' : 'primary'}`} disabled={!isAdmin || p.id === me.id}
              onClick={() => saveProfile({ ...p, ativo: !p.ativo })}>
              {p.ativo ? 'Bloquear' : 'Liberar'}
            </button>
          </li>
        ))}
      </ul>
      {!isAdmin && <p className="muted small">Somente o admin altera acessos.</p>}
    </>
  );
}

/* ---------------- Editor do checklist ---------------- */
function ChecklistEditor() {
  const { me, tasks, saveTasks, deleteTask } = useData();
  const isAdmin = me.role === 'admin';
  const upd = (t: Task, patch: Partial<Task>) => saveTasks([{ ...t, ...patch }]);
  return (
    <>
      <p className="muted small">Menos é mais: mantenha 8 a 12 atividades. O horário define quando o lembrete chega no celular.</p>
      <ul className="editor">
        {tasks.map((t) => (
          <li key={t.id} className={t.ativo ? '' : 'off'}>
            <div className="row">
              <input type="time" value={t.hora} disabled={!isAdmin} onChange={(e) => upd(t, { hora: e.target.value })} />
              <input className="grow" defaultValue={t.titulo} disabled={!isAdmin} onBlur={(e) => e.target.value !== t.titulo && upd(t, { titulo: e.target.value })} />
            </div>
            <textarea rows={2} defaultValue={t.dica} disabled={!isAdmin} onBlur={(e) => e.target.value !== t.dica && upd(t, { dica: e.target.value })} />
            <div className="row">
              <select value={t.periodo} disabled={!isAdmin} onChange={(e) => upd(t, { periodo: e.target.value as Periodo })}>
                {(Object.keys(PERIODO_LABEL) as Periodo[]).map((p) => <option key={p} value={p}>{PERIODO_LABEL[p]}</option>)}
              </select>
              <label className="small">Pontos <input type="number" min={0} max={50} value={t.pontos} disabled={!isAdmin} onChange={(e) => upd(t, { pontos: Number(e.target.value) })} style={{ width: 64 }} /></label>
              <label className="small"><input type="checkbox" checked={t.ativo} disabled={!isAdmin} onChange={(e) => upd(t, { ativo: e.target.checked })} /> ativa</label>
              {isAdmin && <button className="link small" onClick={() => confirm('Excluir atividade? O histórico dela deixa de contar.') && deleteTask(t.id)}>excluir</button>}
            </div>
          </li>
        ))}
      </ul>
      {isAdmin && (
        <button className="btn primary block" onClick={() => saveTasks([{
          id: 't' + uid(), titulo: 'Nova atividade', dica: 'Explique em uma frase por que isso gera negócio.',
          periodo: 'tarde', hora: '14:00', pontos: 5, ordem: (tasks.at(-1)?.ordem ?? 0) + 1, ativo: true,
        }])}>+ Adicionar atividade</button>
      )}
    </>
  );
}
