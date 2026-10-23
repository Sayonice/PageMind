// src/pages/Feed.jsx

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listarResenhas,
  listarLivrosDestaque,
  buscarRecomendacoes,
  curtirResenha,
  excluirResenha,
} from '../services/api';
import { tempoRelativo, iniciais, corAvatar, estrelas } from '../utils/formatacao';
import { traduzirGenero } from '../utils/generos';
import { useAuth } from '../context/useAuth';
import Comentarios from '../components/Comentarios';
import './Feed.css';

export default function Feed() {
  const { usuario } = useAuth();
  const [resenhas, setResenhas] = useState([]);
  const [livrosDestaque, setLivrosDestaque] = useState([]);
  const [recomendacoes, setRecomendacoes] = useState([]);
  const [generosRecomendacao, setGenerosRecomendacao] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [generoAtivo, setGeneroAtivo] = useState('Todos');

  useEffect(() => {
    Promise.all([listarResenhas(), listarLivrosDestaque(), buscarRecomendacoes()])
      .then(([resenhasCarregadas, livrosCarregados, recomendacoesCarregadas]) => {
        setResenhas(resenhasCarregadas);
        setLivrosDestaque(livrosCarregados);
        setRecomendacoes(recomendacoesCarregadas.livros);
        setGenerosRecomendacao(recomendacoesCarregadas.baseado_em_generos);
      })
      .catch((erroCapturado) => setErro(erroCapturado.message))
      .finally(() => setCarregando(false));
  }, []);

  // Traduz o gênero de cada resenha (cobre inclusive as que já estavam
  // salvas em inglês, de antes da tradução existir).
  const resenhasTraduzidas = useMemo(
    () => resenhas.map((r) => ({ ...r, genero: traduzirGenero(r.genero) })),
    [resenhas]
  );

  // Gêneros disponíveis: calculados a partir das resenhas que já temos,
  // então a lista de filtros nunca fica desatualizada com os dados reais.
  const generos = useMemo(() => {
    const encontrados = new Set(
      resenhasTraduzidas.map((r) => r.genero).filter(Boolean)
    );
    return ['Todos', ...encontrados];
  }, [resenhasTraduzidas]);

  const resenhasFiltradas =
    generoAtivo === 'Todos'
      ? resenhasTraduzidas
      : resenhasTraduzidas.filter((r) => r.genero === generoAtivo);

  async function handleCurtir(idResenha) {
    try {
      const resultado = await curtirResenha(idResenha);
      setResenhas((atual) =>
        atual.map((r) =>
          r.id_resenha === idResenha
            ? {
                ...r,
                curtida_usuario: resultado.curtiu,
                total_curtidas: resultado.total_curtidas,
              }
            : r
        )
      );
    } catch {
      // Falha silenciosa é aceitável aqui: o botão simplesmente não muda
      // de estado, e a pessoa pode tentar de novo.
    }
  }

  async function handleExcluir(idResenha) {
    const confirmou = window.confirm(
      'Excluir esta resenha? Essa ação não pode ser desfeita.'
    );
    if (!confirmou) return;

    try {
      await excluirResenha(idResenha);
      setResenhas((atual) => atual.filter((r) => r.id_resenha !== idResenha));
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    }
  }

  if (carregando) return <p>Carregando resenhas...</p>;
  if (erro) return <p className="mensagem-erro">{erro}</p>;

  return (
    <div className="pagina-feed">
      {recomendacoes.length > 0 && (
        <section className="secao-recomendacoes">
          <h2>Recomendados pra você</h2>
          <p className="subtitulo-recomendacoes">
            {generosRecomendacao.length > 0
              ? `Baseado no seu gosto por ${generosRecomendacao
                  .map(traduzirGenero)
                  .join(', ')}.`
              : 'Livros bem avaliados pela comunidade pra você começar por aqui.'}
          </p>
          <div className="grade-livros-destaque">
            {recomendacoes.map((livro) => (
              <Link
                key={livro.id_livro}
                to={`/livro/${livro.id_livro}`}
                className="card-livro-destaque"
              >
                {livro.imagem_capa && (
                  <img src={livro.imagem_capa} alt={`Capa de ${livro.titulo}`} />
                )}
                <strong>{livro.titulo}</strong>
                <p>{livro.autor}</p>
                <p className="card-livro-destaque-nota">
                  <span className="estrelas">{estrelas(livro.nota_media)}</span>{' '}
                  ({livro.total_resenhas})
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {livrosDestaque.length > 0 && (
        <section className="secao-destaque">
          <h2>Livros em destaque</h2>
          <div className="grade-livros-destaque">
            {livrosDestaque.map((livro) => (
              <Link
                key={livro.id_livro}
                to={`/livro/${livro.id_livro}`}
                className="card-livro-destaque"
              >
                {livro.imagem_capa && (
                  <img src={livro.imagem_capa} alt={`Capa de ${livro.titulo}`} />
                )}
                <strong>{livro.titulo}</strong>
                <p>{livro.autor}</p>
                <p className="card-livro-destaque-nota">
                  <span className="estrelas">{estrelas(livro.nota_media)}</span>{' '}
                  ({livro.total_resenhas})
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="secao-resenhas">
        <div className="cabecalho-resenhas">
          <div>
            <span className="rotulo-comunidade">Comunidade</span>
            <h1>Resenhas</h1>
            <p>{resenhas.length} resenhas publicadas pela comunidade PageMind.</p>
          </div>
          <Link to="/nova-resenha" className="botao-primario">
            + Escrever resenha
          </Link>
        </div>

        <div className="filtros-genero">
          {generos.map((genero) => (
            <button
              key={genero}
              type="button"
              className={genero === generoAtivo ? 'filtro-ativo' : ''}
              onClick={() => setGeneroAtivo(genero)}
            >
              {genero}
            </button>
          ))}
        </div>

        {resenhasFiltradas.length === 0 ? (
          <p>Nenhuma resenha encontrada nesse gênero ainda.</p>
        ) : (
          <ul className="lista-resenhas">
            {resenhasFiltradas.map((resenha) => (
              <li key={resenha.id_resenha} className="card-resenha">
                <Link to={`/livro/${resenha.id_livro}`}>
                  {resenha.imagem_capa && (
                    <img src={resenha.imagem_capa} alt={`Capa de ${resenha.titulo_livro}`} />
                  )}
                </Link>

                <div className="card-resenha-conteudo">
                  <div className="card-resenha-cabecalho">
                    <p className="card-resenha-livro">
                      <Link to={`/livro/${resenha.id_livro}`} className="link-livro-resenha">
                        <strong>{resenha.titulo_livro}</strong>
                      </Link>{' '}
                      — {resenha.autor_livro}
                    </p>
                    <span className="card-resenha-tempo">
                      {tempoRelativo(resenha.data)}
                    </span>
                  </div>

                  <p className="estrelas">{estrelas(resenha.nota)}</p>

                  <h2>{resenha.titulo_resenha}</h2>
                  <p className="card-resenha-texto">{resenha.texto}</p>

                  <div className="card-resenha-autor">
                    <span
                      className="avatar"
                      style={{ backgroundColor: corAvatar(resenha.nome_usuario) }}
                    >
                      {iniciais(resenha.nome_usuario)}
                    </span>
                    {resenha.nome_usuario}
                  </div>

                  <div className="card-resenha-acoes">
                    <button
                      type="button"
                      className={resenha.curtida_usuario ? 'botao-curtir ativo' : 'botao-curtir'}
                      onClick={() => handleCurtir(resenha.id_resenha)}
                    >
                      {resenha.curtida_usuario ? '❤️' : '🤍'} {resenha.total_curtidas}
                    </button>

                    {usuario?.tipo === 'professor' && (
                      <button
                        type="button"
                        className="botao-excluir"
                        onClick={() => handleExcluir(resenha.id_resenha)}
                      >
                        🗑️ Excluir
                      </button>
                    )}
                  </div>

                  <Comentarios
                    idResenha={resenha.id_resenha}
                    totalInicial={resenha.total_comentarios}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}