import { useState } from 'react';
import { METRICAS } from '../data/kpis';
import { TEMAS_PDI } from '../data/pdi';
import { Bar, Section } from '../components/ui';
import { useData } from '../lib/data';
import { addDays, fmtDate, today, uid } from '../lib/dates';
import { fmtMetric, goalProgress } from '../lib/metrics';
import type { MetricKey, PdiGoal } from '../lib/types';

/** PDI do usuário logado (ou de um corretor, quando aberto pelo gestor). */
export default function Pdi({ userId }: { userId?: string }) {
  const { me, goals, tasks, logs, kpis, saveGoal, deleteGoal, profiles, isGestor } = useData();
  const alvo = userId ?? me.id;
  const pessoa = profiles.find((p) => p.id === alvo) ?? me;
  const [editando, setEditando] = useState<PdiGoal | null>(null);
  const meus = goals.filter((g) => g.user_id === alvo).sort((a, b) => a.prazo.localeCompare(b.prazo));
  const ativas = meus.filter((g) => g.status === 'ativa');
  const outras = meus.filter((g) => g.status !== 'ativa');
  const podeEditar = alvo === me.id || isGestor;

  if (editando) return <GoalForm inicial={editando} onCancel={() => setEditando(null)} onSave={async (g) => { await saveGoal(g); setEditando(null); }} />;

  const nova = (): PdiGoal => ({
    id: uid(), user_id: alvo, tema: '', especifica: '', metrica: 'captacoes', meta: 0, atingivel: '', relevante: '',
    inicio: today(), prazo: addDays(today(), 90), acoes: [], status: 'ativa',
  });

  return (
    <div className="page">
      {!userId && (
        <div className="hero slim">
          <div>
            <h2>Meu PDI</h2>
            <p className="muted small">Plano de Desenvolvimento Individual · metas SMART medidas pelos seus números reais.</p>
          </div>
        </div>
      )}
      {userId && <h3>PDI de {pessoa.nome}</h3>}

      {ativas.length === 0 && (
        <div className="empty">
          <p>Nenhuma meta ativa ainda.</p>
          <p className="muted small">Escolha um tema e o app sugere a meta, o KPI e as ações.</p>
        </div>
      )}

      {ativas.map((g) => (
        <GoalCard key={g.id} g={g} editable={podeEditar} onEdit={() => setEditando(g)}
          onToggle={(aid) => saveGoal({ ...g, acoes: g.acoes.map((a) => (a.id === aid ? { ...a, feito: !a.feito } : a)) })}
          onStatus={(s) => saveGoal({ ...g, status: s })}
          prog={goalProgress(g, tasks, logs, kpis)} />
      ))}

      {podeEditar && <button className="btn primary block" onClick={() => setEditando(nova())}>+ Nova meta SMART</button>}

      {outras.length > 0 && (
        <Section title="Histórico">
          {outras.map((g) => {
            const p = goalProgress(g, tasks, logs, kpis);
            return (
              <div key={g.id} className="hist">
                <span>{g.status === 'concluida' ? '🏆' : '⏸️'} {g.especifica}</span>
                <span className="muted small">{p.progresso}% · {fmtDate(g.prazo)}</span>
                {podeEditar && <button className="link small" onClick={() => deleteGoal(g.id)}>excluir</button>}
              </div>
            );
          })}
        </Section>
      )}
    </div>
  );
}

function GoalCard({ g, prog, editable, onEdit, onToggle, onStatus }: {
  g: PdiGoal; prog: ReturnType<typeof goalProgress>; editable: boolean;
  onEdit: () => void; onToggle: (id: string) => void; onStatus: (s: PdiGoal['status']) => void;
}) {
  const tema = TEMAS_PDI.find((t) => t.tema === g.tema);
  const total = Math.max(1, (new Date(g.prazo).getTime() - new Date(g.inicio).getTime()) / 864e5);
  const passados = Math.max(0, Math.min(total, (Date.now() - new Date(g.inicio).getTime()) / 864e5));
  const esperado = Math.round((passados / total) * 100);
  const noRitmo = g.metrica === 'aderencia' || g.metrica.startsWith('conv_') ? prog.progresso >= 100 : prog.progresso >= esperado;
  const diasRest = Math.max(0, Math.ceil(total - passados));
  return (
    <div className="goal">
      <div className="goal-head">
        <span className="tag">{tema?.emoji ?? '🎯'} {g.tema || 'Meta'}</span>
        <span className={`status ${noRitmo ? 'ok' : 'warn'}`}>{noRitmo ? 'No ritmo' : 'Atenção'}</span>
      </div>
      <h4>{g.especifica}</h4>
      <div className="goal-num">
        <b>{fmtMetric(prog.atual, g.metrica)}</b>
        <span className="muted"> de {fmtMetric(g.meta, g.metrica)} · {METRICAS[g.metrica].label}</span>
      </div>
      <Bar value={prog.progresso} />
      <p className="muted small">{prog.progresso}% atingido · faltam {diasRest} dias (prazo {fmtDate(g.prazo)})</p>
      <dl className="smart">
        <div><dt>R</dt><dd>{g.relevante || '—'}</dd></div>
        <div><dt>A</dt><dd>{g.atingivel || '—'}</dd></div>
      </dl>
      {g.acoes.length > 0 && (
        <ul className="acoes">
          {g.acoes.map((a) => (
            <li key={a.id}>
              <label>
                <input type="checkbox" checked={a.feito} disabled={!editable} onChange={() => onToggle(a.id)} />
                <span className={a.feito ? 'riscado' : ''}>{a.texto}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      {editable && (
        <div className="row end">
          <button className="link small" onClick={() => onStatus('cancelada')}>Pausar</button>
          <button className="link small" onClick={() => onStatus('concluida')}>Concluir</button>
          <button className="btn small" onClick={onEdit}>Editar</button>
        </div>
      )}
    </div>
  );
}

function GoalForm({ inicial, onSave, onCancel }: { inicial: PdiGoal; onSave: (g: PdiGoal) => void; onCancel: () => void }) {
  const [g, setG] = useState<PdiGoal>(inicial);
  const [novaAcao, setNovaAcao] = useState('');
  const set = <K extends keyof PdiGoal>(k: K, v: PdiGoal[K]) => setG((x) => ({ ...x, [k]: v }));

  const escolherTema = (nome: string) => {
    const t = TEMAS_PDI.find((x) => x.tema === nome);
    if (!t) return set('tema', nome);
    setG((x) => ({
      ...x, tema: t.tema, metrica: t.metrica, meta: x.meta || t.metaSugerida,
      especifica: x.especifica || t.especifica, relevante: x.relevante || t.relevante,
      acoes: x.acoes.length ? x.acoes : t.acoes.map((a) => ({ id: uid(), texto: a, feito: false })),
    }));
  };

  const addAcao = () => {
    if (!novaAcao.trim()) return;
    set('acoes', [...g.acoes, { id: uid(), texto: novaAcao.trim(), feito: false }]);
    setNovaAcao('');
  };

  const valido = g.tema && g.especifica && g.meta > 0 && g.prazo > g.inicio;
  const un = METRICAS[g.metrica].unidade;

  return (
    <div className="page">
      <h2>{inicial.especifica ? 'Editar meta' : 'Nova meta SMART'}</h2>
      <p className="muted small">1. Escolha o tema</p>
      <div className="temas">
        {TEMAS_PDI.map((t) => (
          <button key={t.tema} className={`tema ${g.tema === t.tema ? 'on' : ''}`} onClick={() => escolherTema(t.tema)}>
            <span>{t.emoji}</span>{t.tema}
          </button>
        ))}
      </div>

      {g.tema && (
        <div className="form">
          <label><b>S</b> · Específica — o que exatamente?
            <input value={g.especifica} onChange={(e) => set('especifica', e.target.value)} />
          </label>
          <div className="row2">
            <label><b>M</b> · KPI medido
              <select value={g.metrica} onChange={(e) => set('metrica', e.target.value as MetricKey)}>
                {(Object.keys(METRICAS) as MetricKey[]).map((k) => <option key={k} value={k}>{METRICAS[k].label}</option>)}
              </select>
            </label>
            <label>Meta ({un})
              <input type="number" inputMode="numeric" min={0} value={g.meta || ''} onChange={(e) => set('meta', Number(e.target.value))} />
            </label>
          </div>
          <label><b>A</b> · Atingível — com que recursos/apoio?
            <input value={g.atingivel} onChange={(e) => set('atingivel', e.target.value)} placeholder="ex.: treino de objeções com o gestor" />
          </label>
          <label><b>R</b> · Relevante — por que importa?
            <input value={g.relevante} onChange={(e) => set('relevante', e.target.value)} />
          </label>
          <div className="row2">
            <label><b>T</b> · Início<input type="date" value={g.inicio} onChange={(e) => set('inicio', e.target.value)} /></label>
            <label>Prazo<input type="date" value={g.prazo} onChange={(e) => set('prazo', e.target.value)} /></label>
          </div>
          <p className="muted small">Ações (o que você vai fazer para chegar lá)</p>
          <ul className="acoes edit">
            {g.acoes.map((a) => (
              <li key={a.id}>
                <span className="grow">{a.texto}</span>
                <button className="link small" onClick={() => set('acoes', g.acoes.filter((x) => x.id !== a.id))}>remover</button>
              </li>
            ))}
          </ul>
          <div className="row">
            <input className="grow" value={novaAcao} onChange={(e) => setNovaAcao(e.target.value)} placeholder="Nova ação" onKeyDown={(e) => e.key === 'Enter' && addAcao()} />
            <button className="btn small" onClick={addAcao}>Adicionar</button>
          </div>
        </div>
      )}

      <div className="row end sticky">
        <button className="btn ghost" onClick={onCancel}>Cancelar</button>
        <button className="btn primary" disabled={!valido} onClick={() => onSave(g)}>Salvar meta</button>
      </div>
    </div>
  );
}
