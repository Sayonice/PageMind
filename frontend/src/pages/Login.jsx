import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import CampoAuth from '../components/CampoAuth';
import LayoutAuth from '../components/LayoutAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await login({ email, senha });
      navigate('/feed');
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <LayoutAuth frase="Bem-vindo de volta.">
      <h1>Entrar</h1>
      <p className="pagina-auth-subtitulo">Use suas credenciais institucionais para acessar.</p>

      <form onSubmit={handleSubmit}>
        <CampoAuth
          rotulo="E-mail institucional"
          icone="envelope"
          type="email"
          placeholder="nome@aluno.senai.br"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <CampoAuth
          rotulo="Senha"
          icone="cadeado"
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        {erro && <p className="mensagem-erro">{erro}</p>}

        <button type="submit" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="pagina-auth-troca">
        Não tem uma conta? <Link to="/cadastro">Cadastrar-se</Link>
      </p>
    </LayoutAuth>
  );
}
