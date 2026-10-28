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
import { IconeCoracao, IconeLixeira } from '../components/Icones';
import './Feed.css';

const ORDENACOES = [
  { valor: 'recentes', rotulo: 'Mais recentes' },
  { valor: 'curtidas', rotulo: 'Mais curtidas' },
];

function GradeLivros({ livros }) {
  return (
    <div className="grade-livros-destaque">
      {livros.map((livro) => (
        <Link key={livro.id_livro} to={`/livro/${livro.id_livro}`} className="card-livro">
          {livro.imagem_capa ? (
            <img src={livro.imagem_capa} alt={`Capa de ${livro.titulo}`} />
          ) : (
            <div className="card-livro-sem-capa" />
          )}
          <strong>{livro.titulo}</strong>
          <span className="card-livro-autor">{livro.autor}</span>
          <span className="estrelas">
            {estrelas(livro.nota_media)}{' '}
            <span className="card-livro-total">({livro.total_resenhas})</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function Feed() {
  const { usuario } = useAuth();
  const [resenhas, setResenhas] = useState([]);
  const [livrosDestaque, setLivrosDestaque] = useState([]);
  const [recomendacoes, setRecomendacoes] = useState([]);
  const [generosRecomendacao, setGenerosRecomendacao] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState('');
  const [erroAcao, setErroAcao] = useState('');

  const [generoAtivo, setGeneroAtivo] = useState('Todos');
  const [ordem, setOrdem] = useState('recentes');

  useEffect(() => {
    Promise.all([listarResenhas(), listarLivrosDestaque(), buscarRecomendacoes()])
      .then(([resenhasCarregadas, livrosCarregados, recomendacoesCarregadas]) => {
        setResenhas(resenhasCarregadas);
        setLivrosDestaque(livrosCarregados);
        setRecomendacoes(recomendacoesCarregadas.livros);
        setGenerosRecomendacao(recomendacoesCarregadas.baseado_em_generos);
      })
      .catch((erroCapturado) => setErroCarregamento(erroCapturado.message))
      .finally(() => setCarregando(false));
  }, []);

  const resenhasTraduzidas = useMemo(
    () => resenhas.map((r) => ({ ...r, genero: traduzirGenero(r.genero) })),
    [resenhas]
  );

  const generos = useMemo(() => {
    const encontrados = new Set(resenhasTraduzidas.map((r) => r.genero).filter(Boolean));
    return ['Todos', ...encontrados];
  }, [resenhasTraduzidas]);

  const resenhasExibidas = useMemo(() => {
    const filtradas =
      generoAtivo === 'Todos'
        ? resenhasTraduzidas
        : resenhasTraduzidas.filter((r) => r.genero === generoAtivo);

    if (ordem === 'curtidas') {
      return [...filtradas].sort((a, b) => b.total_curtidas - a.total_curtidas);
    }
    return filtradas;
  }, [resenhasTraduzidas, generoAtivo, ordem]);

  async function handleCurtir(idResenha) {
    setErroAcao('');
    try {
      const resultado = await curtirResenha(idResenha);
      setResenhas((atual) =>
        atual.map((r) =>
          r.id_resenha === idResenha
            ? { ...r, curtida_usuario: resultado.curtiu, total_curtidas: resultado.total_curtidas }
            : r
        )
      );
    } catch (erroCapturado) {
      setErroAcao(erroCapturado.message);
    }
  }

  async function handleExcluir(idResenha) {
    if (!window.confirm('Excluir esta resenha? Essa ação não pode ser desfeita.')) return;

    setErroAcao('');
    try {
      await excluirResenha(idResenha);
      setResenhas((atual) => atual.filter((r) => r.id_resenha !== idResenha));
    } catch (erroCapturado) {
      setErroAcao(erroCapturado.message);
    }
  }

  if (carregando) return <p>Carregando resenhas...</p>;
  if (erroCarregamento) return <p className="mensagem-erro">{erroCarregamento}</p>;

  const totalResenhas = resenhas.length;

  return (
    <div className="pagina-feed">
      {recomendacoes.length > 0 && (
        <section>
          <h2>Recomendados pra você</h2>
          <p className="subtitulo-secao">
            {generosRecomendacao.length > 0
              ? `Baseado no seu gosto por ${generosRecomendacao.map(traduzirGenero).join(', ')}.`
              : 'Livros bem avaliados pela comunidade pra você começar por aqui.'}
          </p>
          <GradeLivros livros={recomendacoes} />
        </section>
      )}

      {livrosDestaque.length > 0 && (
        <section>
          <h2>Livros em destaque</h2>
          <GradeLivros livros={livrosDestaque} />
        </section>
      )}

      <section>
        <div className="cabecalho-resenhas">
          <div>
            <span className="rotulo-secao">Comunidade</span>
            <h1>Resenhas</h1>
            <p>
              {totalResenhas} {totalResenhas === 1 ? 'resenha publicada' : 'resenhas publicadas'}{' '}
              pela comunidade PageMind.
            </p>
          </div>
          <Link to="/nova-resenha" className="botao-primario">
            + Escrever resenha
          </Link>
        </div>

        <div className="chips">
          {generos.map((genero) => (
            <button
              key={genero}
              type="button"
              className={genero === generoAtivo ? 'chip chip-ativo' : 'chip'}
              onClick={() => setGeneroAtivo(genero)}
            >
              {genero}
            </button>
          ))}
        </div>

        <div className="abas-ordenacao">
          {ORDENACOES.map((opcao) => (
            <button
              key={opcao.valor}
              type="button"
              className={opcao.valor === ordem ? 'aba-ativa' : ''}
              onClick={() => setOrdem(opcao.valor)}
            >
              {opcao.rotulo}
            </button>
          ))}
        </div>

        {erroAcao && <p className="mensagem-erro">{erroAcao}</p>}

        {resenhasExibidas.length === 0 ? (
          <p className="feed-vazio">Nenhuma resenha encontrada nesse gênero ainda.</p>
        ) : (
          <ul className="lista-resenhas">
            {resenhasExibidas.map((resenha) => (
              <li key={resenha.id_resenha} className="card-resenha">
                <Link to={`/livro/${resenha.id_livro}`} className="card-resenha-capa">
                  {resenha.imagem_capa && (
                    <img src={resenha.imagem_capa} alt={`Capa de ${resenha.titulo_livro}`} />
                  )}
                </Link>

                <div className="card-resenha-conteudo">
                  <div className="card-resenha-cabecalho">
                    <p className="card-resenha-livro">
                      <Link to={`/livro/${resenha.id_livro}`}>{resenha.titulo_livro}</Link>
                      {' — '}
                      <span>{resenha.autor_livro}</span>
                    </p>
                    <span className="card-resenha-tempo">{tempoRelativo(resenha.data)}</span>
                  </div>

                  <span className="estrelas">{estrelas(resenha.nota)}</span>

                  <h2>{resenha.titulo_resenha}</h2>
                  <p className="card-resenha-texto">{resenha.texto}</p>

                  <div className="card-resenha-rodape">
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
                        className={
                          resenha.curtida_usuario
                            ? 'botao-acao botao-curtir ativo'
                            : 'botao-acao botao-curtir'
                        }
                        onClick={() => handleCurtir(resenha.id_resenha)}
                      >
                        <IconeCoracao tamanho={16} preenchido={Boolean(resenha.curtida_usuario)} />
                        {resenha.total_curtidas}
                      </button>

                      {usuario?.tipo === 'professor' && (
                        <button
                          type="button"
                          className="botao-acao botao-excluir"
                          onClick={() => handleExcluir(resenha.id_resenha)}
                        >
                          <IconeLixeira tamanho={16} />
                          Excluir
                        </button>
                      )}
                    </div>
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
