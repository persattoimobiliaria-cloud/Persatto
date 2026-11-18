import { useState } from 'react';
import { GATILHOS, GRAVACAO, OBJECOES } from '../data/dicas';
import { copy } from '../components/ui';

type Aba = 'objecoes' | 'gravacao' | 'gatilhos';

export default function Dicas() {
  const [aba, setAba] = useState<Aba>('objecoes');
  const [publico, setPublico] = useState<'cliente' | 'proprietario'>('cliente');
  const [aberta, setAberta] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);

  const doCopy = (id: string, t: string) => {
    copy(t);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 1500);
  };

  return (
    <div className="page">
      <div className="seg">
        <button className={aba === 'objecoes' ? 'on' : ''} onClick={() => setAba('objecoes')}>🧠 Objeções</button>
        <button className={aba === 'gravacao' ? 'on' : ''} onClick={() => setAba('gravacao')}>🎥 Gravação</button>
        <button className={aba === 'gatilhos' ? 'on' : ''} onClick={() => setAba('gatilhos')}>⚡ Gatilhos</button>
      </div>

      {aba === 'objecoes' && (
        <>
          <div className="seg small">
            <button className={publico === 'cliente' ? 'on' : ''} onClick={() => setPublico('cliente')}>Clientes</button>
            <button className={publico === 'proprietario' ? 'on' : ''} onClick={() => setPublico('proprietario')}>Proprietários</button>
          </div>
          <p className="muted small">Toque na objeção para ver a resposta. Copie e adapte com suas palavras.</p>
          <ul className="cards">
            {OBJECOES.filter((o) => o.publico === publico).map((o) => (
              <li key={o.id} className={`acc ${aberta === o.id ? 'open' : ''}`}>
                <button className="acc-head" onClick={() => setAberta(aberta === o.id ? null : o.id)}>
                  <span className="grow">{o.objecao}</span>
                  <span className="tag">{o.gatilho}</span>
                </button>
                {aberta === o.id && (
                  <div className="acc-body">
                    <p>{o.resposta}</p>
                    <div className="row">
                      <button className="btn small" onClick={() => doCopy(o.id, o.resposta)}>{copiado === o.id ? '✓ Copiado' : '📋 Copiar'}</button>
                      <a className="btn small wa" href={`https://wa.me/?text=${encodeURIComponent(o.resposta)}`} target="_blank" rel="noreferrer">WhatsApp</a>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {aba === 'gravacao' && (
        <ul className="cards">
          {GRAVACAO.map((g) => (
            <li key={g.id} className="tip-card">
              <span className="tag">{g.tag}</span>
              <h4>{g.titulo}</h4>
              <p>{g.resumo}</p>
              {g.passos && (
                <ol>
                  {g.passos.map((p) => <li key={p}>{p}</li>)}
                </ol>
              )}
            </li>
          ))}
        </ul>
      )}

      {aba === 'gatilhos' && (
        <>
          <p className="muted small">Use com ética: gatilho só funciona se for verdade.</p>
          <ul className="cards grid2">
            {GATILHOS.map((g) => (
              <li key={g.nome} className="tip-card">
                <h4>{g.nome}</h4>
                <p>{g.uso}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
