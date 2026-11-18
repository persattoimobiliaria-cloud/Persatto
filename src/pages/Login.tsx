import { useEffect, useState } from 'react';
import { store, resetDemo } from '../lib/store';
import type { Profile } from '../lib/types';

export default function Login() {
  if (store.mode === 'demo') return <DemoLogin />;
  return <RealLogin />;
}

function DemoLogin() {
  const [users, setUsers] = useState<Profile[]>([]);
  useEffect(() => {
    store.list('profiles').then(setUsers);
  }, []);
  return (
    <div className="login">
      <div className="card">
        <img src="./icon.svg" alt="" width={56} height={56} />
        <h1>Persatto Corretor</h1>
        <p className="muted">Modo demonstração — escolha um perfil para testar. Os dados ficam só neste navegador.</p>
        <div className="stack">
          {users.map((u) => (
            <button key={u.id} className="btn user" onClick={() => store.demoLoginAs!(u.id)}>
              <span className="avatar">{u.nome[0]}</span>
              <span className="grow">
                <b>{u.nome}</b>
                <small>{u.role === 'corretor' ? 'Corretor' : 'Gestor / admin'}</small>
              </span>
              <span>→</span>
            </button>
          ))}
        </div>
        <button className="link small" onClick={resetDemo}>Restaurar dados de exemplo</button>
      </div>
    </div>
  );
}

function RealLogin() {
  const [modo, setModo] = useState<'entrar' | 'cadastrar'>('entrar');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (modo === 'entrar') await store.signIn(email, senha);
      else {
        await store.signUp(nome, email, senha, telefone);
        setMsg('Cadastro enviado! Confirme seu e-mail (se solicitado) e aguarde a liberação do gestor.');
      }
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <form className="card" onSubmit={submit}>
        <img src="./icon.svg" alt="" width={56} height={56} />
        <h1>Persatto Corretor</h1>
        {modo === 'cadastrar' && (
          <>
            <input placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            <input placeholder="WhatsApp (com DDD)" value={telefone} onChange={(e) => setTelefone(e.target.value)} inputMode="tel" />
          </>
        )}
        <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} />
        <button className="btn primary" disabled={busy}>{modo === 'entrar' ? 'Entrar' : 'Criar acesso'}</button>
        {msg && <p className="muted">{msg}</p>}
        <button type="button" className="link small" onClick={() => setModo(modo === 'entrar' ? 'cadastrar' : 'entrar')}>
          {modo === 'entrar' ? 'Primeiro acesso? Cadastre-se' : 'Já tenho acesso'}
        </button>
      </form>
    </div>
  );
}
