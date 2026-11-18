import { useState } from 'react';
import { GRAVACAO, OBJECOES } from '../data/dicas';
import { KPIS } from '../data/kpis';
import { MOTIVOS, PERIODO_LABEL } from '../data/tasks';
import { Ring, Section } from '../components/ui';
import { useData } from '../lib/data';
import { fmtDate, greeting, nowHHMM, today } from '../lib/dates';
import { dayAderencia, fmtMoney, streak } from '../lib/metrics';
import { enableNotifications, notifEnabled, notifSupported, waLink } from '../lib/notify';
import type { Periodo, Task } from '../lib/types';

export default function Hoje() {
  const { me, tasks, logs, kpis, setTaskStatus, bumpKpi, setKpi, profiles } = useData();
  const [aberta, setAberta] = useState<string | null>(null);
  const [motivoDe, setMotivoDe] = useState<string | null>(null);
  const [notif, setNotif] = useState(notifEnabled());
  const d = today();
  const ativos = tasks.filter((t) => t.ativo);
  const meusLogs = logs.filter((l) => l.user_id === me.id && l.data === d);
  const statusOf = (id: string) => meusLogs.find((l) => l.task_id === id);
  const pct = dayAderencia(me.id, d, tasks, logs);
  const pontos = meusLogs.filter((l) => l.status === 'feito').reduce((s, l) => s + (tasks.find((t) => t.id === l.task_id)?.pontos ?? 0), 0);
  const fogo = streak(me.id, tasks, logs);
  const pendentes = ativos.filter((t) => !statusOf(t.id));
  const now = nowHHMM();
  const proxima = pendentes.find((t) => t.hora <= now) ?? pendentes[0];
  const kv = (k: string) => kpis.find((e) => e.user_id === me.id && e.data === d && e.kpi === k)?.valor ?? 0;

  const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 864e5);
  const dicaGrav = GRAVACAO[doy % GRAVACAO.length];
  const obj = OBJECOES[doy % OBJECOES.length];

  const gestor = profiles.find((p) => p.role !== 'corretor' && p.telefone);
  const resumo = `Resumo ${fmtDate(d)} — ${me.nome}\n✅ ${pct}% do checklist (${pontos} pts)\n` +
    KPIS.map((k) => `${k.emoji} ${k.curto}: ${kv(k.key)}`).join('\n') +
    (pendentes.length ? `\n⏳ Pendentes: ${pendentes.map((t) => t.titulo).join(', ')}` : '');

  const marcar = (t: Task, s: 'feito' | 'nao_feito') => {
    const atual = statusOf(t.id)?.status;
    if (atual === s) {
      setTaskStatus(t.id, null);
      setMotivoDe(null);
      return;
    }
    setTaskStatus(t.id, s);
    setMotivoDe(s === 'nao_feito' ? t.id : null);
    if (navigator.vibrate) navigator.vibrate(15);
  };

  return (
    <div className="page">
      <div className="hero">
        <div>
          <p className="muted small">{fmtDate(d)}</p>
          <h2>{greeting()}, {me.nome.split(' ')[0]}!</h2>
          <div className="chips">
            <span className="chip">⭐ {pontos} pts hoje</span>
            <span className="chip">🔥 {fogo} {fogo === 1 ? 'dia' : 'dias'} seguidos</span>
          </div>
        </div>
        <Ring value={pct} />
      </div>

      {notifSupported() && !notif && (
        <button className="banner" onClick={async () => setNotif(await enableNotifications())}>
          🔔 <b>Ative os lembretes no celular</b>
          <span>Cada atividade chega no horário com os botões "Feito" e "Não fiz".</span>
        </button>
      )}

      {proxima ? (
        <div className="next">
          <p className="eyebrow">Agora · {proxima.hora}</p>
          <h3>{proxima.titulo}</h3>
          <p className="muted">{proxima.dica}</p>
          <div className="row">
            <button className="btn big ok" onClick={() => marcar(proxima, 'feito')}>✅ Feito</button>
            <button className="btn big bad" onClick={() => marcar(proxima, 'nao_feito')}>❌ Não fiz</button>
          </div>
        </div>
      ) : (
        <div className="next done">
          <h3>🎉 Checklist do dia resolvido!</h3>
          <p className="muted">Lance seus números abaixo e compartilhe o resumo com o gestor.</p>
        </div>
      )}

      {(['manha', 'tarde', 'noite'] as Periodo[]).map((p) => {
        const lista = ativos.filter((t) => t.periodo === p);
        if (!lista.length) return null;
        const feitos = lista.filter((t) => statusOf(t.id)?.status === 'feito').length;
        return (
          <Section key={p} title={PERIODO_LABEL[p]} right={<span className="muted small">{feitos}/{lista.length}</span>}>
            <ul className="tasks">
              {lista.map((t) => {
                const s = statusOf(t.id);
                return (
                  <li key={t.id} className={`task ${s?.status ?? ''}`}>
                    <div className="task-main">
                      <button className="task-title" onClick={() => setAberta(aberta === t.id ? null : t.id)}>
                        <span className="hora">{t.hora}</span>
                        <span className="grow">{t.titulo}</span>
                        <span className="pts">+{t.pontos}</span>
                      </button>
                      <div className="task-actions">
                        <button aria-label="Feito" className={`tap ok ${s?.status === 'feito' ? 'on' : ''}`} onClick={() => marcar(t, 'feito')}>✓</button>
                        <button aria-label="Não fiz" className={`tap bad ${s?.status === 'nao_feito' ? 'on' : ''}`} onClick={() => marcar(t, 'nao_feito')}>✕</button>
                      </div>
                    </div>
                    {aberta === t.id && <p className="task-tip">💡 {t.dica}</p>}
                    {motivoDe === t.id && (
                      <div className="motivos">
                        <span className="muted small">Por quê? (opcional)</span>
                        {MOTIVOS.map((m) => (
                          <button key={m} className={`chip-btn ${s?.motivo === m ? 'on' : ''}`} onClick={() => { setTaskStatus(t.id, 'nao_feito', m); setMotivoDe(null); }}>{m}</button>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Section>
        );
      })}

      <Section title="Números de hoje" right={<span className="muted small">toque no +</span>}>
        <div className="counters">
          {KPIS.map((k) => (
            <div key={k.key} className="counter">
              <span className="c-emoji">{k.emoji}</span>
              <span className="c-label">{k.curto}</span>
              <div className="c-row">
                <button onClick={() => bumpKpi(k.key, -1)} disabled={kv(k.key) === 0} aria-label={`Diminuir ${k.curto}`}>−</button>
                <b>{kv(k.key)}</b>
                <button className="plus" onClick={() => bumpKpi(k.key, 1)} aria-label={`Somar ${k.curto}`}>+</button>
              </div>
            </div>
          ))}
        </div>
        {kv('vendas') > 0 && (
          <label className="vgv">
            💰 VGV fechado hoje (R$)
            <input type="number" inputMode="numeric" min={0} step={1000} defaultValue={kv('vgv') || ''} placeholder="ex.: 650000"
              onBlur={(e) => setKpi('vgv', Number(e.target.value) || 0)} />
            {kv('vgv') > 0 && <small className="muted">{fmtMoney(kv('vgv'))}</small>}
          </label>
        )}
        <a className="btn wa" href={waLink(gestor?.telefone, resumo)} target="_blank" rel="noreferrer">
          📤 Enviar resumo do dia no WhatsApp
        </a>
      </Section>

      <Section title="Dica do dia">
        <div className="tip-card">
          <span className="tag">🎥 {dicaGrav.tag}</span>
          <h4>{dicaGrav.titulo}</h4>
          <p>{dicaGrav.resumo}</p>
        </div>
        <div className="tip-card">
          <span className="tag">🧠 {obj.gatilho}</span>
          <h4>{obj.publico === 'cliente' ? 'Cliente' : 'Proprietário'}: {obj.objecao}</h4>
          <p>{obj.resposta}</p>
        </div>
      </Section>
    </div>
  );
}
