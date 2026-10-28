import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cadastrarUsuario } from '../services/api';
import CampoAuth from '../components/CampoAuth';
import LayoutAuth from '../components/LayoutAuth';

const ID_INSTITUICAO_PADRAO = 1;

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('aluno');
  const [aceitouTermos, setAceitouTermos] = useState(false);

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
        id_instituicao: ID_INSTITUICAO_PADRAO,
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
    <LayoutAuth frase="Leia do seu jeito. Resenhe do seu jeito.">
      <h1>Criar conta</h1>
      <p className="pagina-auth-subtitulo">Preencha os dados abaixo para se cadastrar.</p>

      <form onSubmit={handleSubmit}>
        <CampoAuth
          rotulo="Nome completo"
          placeholder="Ex: Maria Aparecida da Silva"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

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
          placeholder="Mínimo 8 caracteres"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          minLength={8}
          required
        />

        <label className="campo-auth">
          <span className="campo-auth-rotulo">Eu sou</span>
          <span className="campo-auth-caixa">
            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="aluno">Aluno</option>
              <option value="professor">Professor</option>
            </select>
          </span>
        </label>

        <label className="auth-termos">
          <input
            type="checkbox"
            checked={aceitouTermos}
            onChange={(e) => setAceitouTermos(e.target.checked)}
          />
          <span>
            Li e concordo com os Termos de Uso e a Política de Privacidade da plataforma
            institucional.
          </span>
        </label>

        {erro && <p className="mensagem-erro">{erro}</p>}
        {sucesso && <p className="mensagem-sucesso">Cadastro realizado! Redirecionando...</p>}

        <button type="submit" disabled={carregando || !aceitouTermos}>
          {carregando ? 'Criando conta...' : 'Criar minha conta'}
        </button>
      </form>

      <p className="pagina-auth-troca">
        Já tem uma conta? <Link to="/login">Entrar</Link>
      </p>
    </LayoutAuth>
  );
}
