// src/pages/Cadastro.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cadastrarUsuario } from '../services/api';
import '../styles/formularios.css';
import './AuthPages.css';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('aluno');
  // Por enquanto fixo em 1 (Firjan SENAI, do database.sql).
  // Quando houver mais de uma instituição, isso vira um <select> dinâmico.
  const [idInstituicao] = useState(1);

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await cadastrarUsuario({
        nome,
        email,
        senha,
        tipo,
        id_instituicao: idInstituicao,
      });
      setSucesso(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="pagina-auth">
      <div className="pagina-auth-painel">
        <span className="pagina-auth-marca">PageMind</span>
        <p className="pagina-auth-frase">Leia do seu jeito. Resenhe do seu jeito.</p>
      </div>

      <div className="pagina-auth-conteudo">
        <h1>Criar conta no PageMind</h1>

        <form onSubmit={handleSubmit}>
          <label>
            Nome completo
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </label>

          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Senha (mín. 8 caracteres)
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              minLength={8}
              required
            />
          </label>

          <label>
            Eu sou
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="aluno">Aluno</option>
              <option value="professor">Professor</option>
            </select>
          </label>

          {erro && <p className="mensagem-erro">{erro}</p>}
          {sucesso && <p className="mensagem-sucesso">Cadastro realizado! Redirecionando...</p>}

          <button type="submit" disabled={carregando}>
            {carregando ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
