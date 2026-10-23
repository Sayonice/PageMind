// src/pages/Perfil.jsx

import { useEffect, useState } from 'react';
import { buscarPerfil, atualizarPerfil } from '../services/api';
import { iniciais, corAvatar, estrelas, tempoRelativo } from '../utils/formatacao';
import { traduzirGenero } from '../utils/generos';
import './Perfil.css';

export default function Perfil() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [editando, setEditando] = useState(false);
  const [nomeEdit, setNomeEdit] = useState('');
  const [bioEdit, setBioEdit] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  function carregar() {
    setCarregando(true);
    buscarPerfil()
      .then((resposta) => {
        setDados(resposta);
        setNomeEdit(resposta.usuario.nome);
        setBioEdit(resposta.usuario.bio || '');
      })
      .catch((erroCapturado) => setErro(erroCapturado.message))
      .finally(() => setCarregando(false));
  }

  async function handleSalvar(evento) {
    evento.preventDefault();
    setSalvando(true);
    setErro('');
    try {
      await atualizarPerfil({ nome: nomeEdit, bio: bioEdit });
      setEditando(false);
      carregar();
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <p>Carregando perfil...</p>;
  if (erro && !dados) return <p className="mensagem-erro">{erro}</p>;

  const { usuario, estatisticas, minhas_resenhas: minhasResenhas } = dados;

  return (
    <div className="pagina-perfil">
      <div className="cabecalho-perfil">
        <span className="avatar avatar-grande" style={{ backgroundColor: corAvatar(usuario.nome) }}>
          {iniciais(usuario.nome)}
        </span>

        <div className="info-perfil">
          <h1>{usuario.nome}</h1>
          <p className="perfil-contato">
            {usuario.email}
            {usuario.instituicao && ` · ${usuario.instituicao}`}
          </p>
          {usuario.bio && !editando && <p className="perfil-bio">{usuario.bio}</p>}
        </div>

        <button type="button" onClick={() => setEditando((v) => !v)}>
          {editando ? 'Cancelar' : 'Editar perfil'}
        </button>
      </div>

      {editando && (
        <form onSubmit={handleSalvar} className="form-editar-perfil">
          <label>
            Nome
            <input
              type="text"
              value={nomeEdit}
              onChange={(e) => setNomeEdit(e.target.value)}
              required
            />
          </label>
          <label>
            Bio
            <textarea value={bioEdit} onChange={(e) => setBioEdit(e.target.value)} rows={3} />
          </label>
          {erro && <p className="mensagem-erro">{erro}</p>}
          <button type="submit" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      )}

      <div className="grade-cartoes-perfil">
        <div className="cartao-estatistica">
          <strong>{estatisticas.livros_lidos}</strong>
          <p>Livros lidos</p>
        </div>
        <div className="cartao-estatistica">
          <strong>{estatisticas.resenhas_publicadas}</strong>
          <p>Resenhas</p>
        </div>
        <div className="cartao-estatistica">
          <strong>{estatisticas.curtidas_recebidas}</strong>
          <p>Curtidas recebidas</p>
        </div>
      </div>

      {estatisticas.generos_favoritos.length > 0 && (
        <section className="secao-perfil">
          <h2>Gêneros favoritos</h2>
          <div className="barras-generos">
            {estatisticas.generos_favoritos.map((item) => (
              <div key={item.genero} className="linha-barra-genero">
                <span className="rotulo-barra-genero">{traduzirGenero(item.genero)}</span>
                <div className="barra-genero">
                  <div className="barra-genero-preenchida" style={{ width: `${item.percentual}%` }} />
                </div>
                <span className="percentual-barra-genero">{item.percentual}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="secao-perfil">
        <h2>Minhas resenhas</h2>
        {minhasResenhas.length === 0 ? (
          <p>Você ainda não publicou nenhuma resenha.</p>
        ) : (
          <ul className="lista-resenhas-perfil">
            {minhasResenhas.map((resenha) => (
              <li key={resenha.id_resenha} className="card-resenha-perfil">
                {resenha.imagem_capa && (
                  <img src={resenha.imagem_capa} alt={`Capa de ${resenha.livro_titulo}`} />
                )}
                <div>
                  <div className="card-resenha-perfil-cabecalho">
                    <strong>{resenha.titulo}</strong>
                    <span>{tempoRelativo(resenha.data)}</span>
                  </div>
                  <p className="estrelas">{estrelas(resenha.nota)}</p>
                  <p className="card-resenha-perfil-livro">{resenha.livro_titulo}</p>
                  <p className="card-resenha-perfil-texto">{resenha.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
