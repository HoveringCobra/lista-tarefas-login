import { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

const USUARIO = 'admin';
const SENHA = '1234';

function Login({ autenticar }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navegar = useNavigate();

  function entrar(evento) {
    evento.preventDefault();
    if (usuario === USUARIO && senha === SENHA) {
      autenticar();
      navegar('/tarefas', { replace: true });
    } else {
      setErro('Usuário ou senha incorretos.');
    }
  }

  return <main className="card login">
    <h1>Entrar</h1><p>Acesse sua lista de tarefas</p>
    <form onSubmit={entrar}>
      <label htmlFor="usuario">Usuário</label>
      <input id="usuario" value={usuario} onChange={e => setUsuario(e.target.value)} required />
      <label htmlFor="senha">Senha</label>
      <input id="senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
      {erro && <p role="alert" className="erro">{erro}</p>}
      <button type="submit">Entrar</button>
    </form>
    <small>Para testar: admin / 1234</small>
  </main>;
}

function Tarefas({ sair }) {
  const [tarefas, setTarefas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tarefas')) || []; }
    catch { return []; }
  });
  const [texto, setTexto] = useState('');

  function salvar(novas) {
    setTarefas(novas);
    localStorage.setItem('tarefas', JSON.stringify(novas));
  }
  function adicionar(evento) {
    evento.preventDefault();
    if (!texto.trim()) return;
    salvar([...tarefas, { id: crypto.randomUUID(), texto: texto.trim(), concluida: false }]);
    setTexto('');
  }
  function remover(id) { salvar(tarefas.filter(t => t.id !== id)); }
  function alternar(id) { salvar(tarefas.map(t => t.id === id ? { ...t, concluida: !t.concluida } : t)); }
  function editar(id) {
    const atual = tarefas.find(t => t.id === id);
    const novoTexto = window.prompt('Atualize a tarefa:', atual.texto);
    if (novoTexto?.trim()) salvar(tarefas.map(t => t.id === id ? { ...t, texto: novoTexto.trim() } : t));
  }

  return <main className="card">
    <header><div><h1>Minhas tarefas</h1><p>Organize suas atividades</p></div><button className="secundario" onClick={sair}>Sair</button></header>
    <form className="adicionar" onSubmit={adicionar}>
      <input aria-label="Nova tarefa" placeholder="Digite uma tarefa..." value={texto} onChange={e => setTexto(e.target.value)} />
      <button type="submit">Adicionar</button>
    </form>
    {tarefas.length === 0 ? <p className="vazio">Nenhuma tarefa cadastrada.</p> : <ul>{tarefas.map(t =>
      <li key={t.id}>
        <label className={t.concluida ? 'concluida' : ''}><input type="checkbox" checked={t.concluida} onChange={() => alternar(t.id)} />{t.texto}</label>
        <div className="acoes"><button className="secundario" onClick={() => editar(t.id)}>Editar</button><button className="perigo" onClick={() => remover(t.id)}>Excluir</button></div>
      </li>
    )}</ul>}
  </main>;
}

export default function App() {
  const [autenticado, setAutenticado] = useState(() => sessionStorage.getItem('autenticado') === 'sim');
  function autenticar() { sessionStorage.setItem('autenticado', 'sim'); setAutenticado(true); }
  function sair() { sessionStorage.removeItem('autenticado'); setAutenticado(false); }
  return <Routes>
    <Route path="/login" element={autenticado ? <Navigate to="/tarefas" replace /> : <Login autenticar={autenticar} />} />
    <Route path="/tarefas" element={autenticado ? <Tarefas sair={sair} /> : <Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to={autenticado ? '/tarefas' : '/login'} replace />} />
  </Routes>;
}
