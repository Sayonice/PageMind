import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { buscarDetalhesLivro, curtirResenha, excluirResenha } from '../services/api';
import { buscarDetalhesGoogleBooks } from '../services/googleBooks';
import { tempoRelativo, iniciais, corAvatar, estrelas } from '../utils/formatacao';
import { traduzirGenero } from '../utils/generos';
import { useAuth } from '../context/useAuth';
import { IconeSeta, IconeCoracao, IconeLixeira } from '../components/Icones';
import Comentarios from '../components/Comentarios';
import './LivroDetalhe.css';

export default function LivroDetalhe() {
  const { id } = useParams();
  return <ConteudoLivro key={id} id={id} />;
}

function ConteudoLivro({ id }) {
  const { usuario } = useAuth();

  const [livro, setLivro] = useState(null);
  const [resenhas, setResenhas] = useState([]);
  const [extras, setExtras] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    buscarDetalhesLivro(id)
      .then((resposta) => {
        setLivro(resposta.livro);
        setResenhas(resposta.resenhas);

        buscarDetalhesGoogleBooks({
          googleBooksId: resposta.livro.google_books_id,
          titulo: resposta.livro.titulo,
          autor: resposta.livro.autor,
        })
          .then(setExtras)
          .catch(() => {});
      })
      .catch((erroCapturado) => setErro(erroCapturado.message))
      .finally(() => setCarregando(false));
  }, [id]);

  async function handleCurtir(idResenha) {
    try {
      const resultado = await curtirResenha(idResenha);
      setResenhas((atual) =>
        atual.map((r) =>
          r.id_resenha === idResenha
            ? { ...r, curtida_usuario: resultado.curtiu, total_curtidas: resultado.total_curtidas }
            : r
        )
      );
    } catch {
      setErro('Não foi possível curtir a resenha.');
    }
  }

  async function handleExcluir(idResenha) {
    if (!window.confirm('Excluir esta resenha? Essa ação não pode ser desfeita.')) return;

    try {
      await excluirResenha(idResenha);
      setResenhas((atual) => atual.filter((r) => r.id_resenha !== idResenha));
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    }
  }

  if (carregando) return <p>Carregando livro...</p>;
  if (!livro) return <p className="mensagem-erro">{erro}</p>;

  const capa = extras?.capaGrande || livro.imagem_capa;

  return (
    <div className="pagina-livro-detalhe">
      <Link to="/feed" className="link-voltar">
        <IconeSeta tamanho={16} />
        Voltar ao feed
      </Link>

      <section className="painel cabecalho-livro-detalhe">
        {capa && <img src={capa} alt={`Capa de ${livro.titulo}`} className="capa-livro-detalhe" />}

        <div className="info-livro-detalhe">
          <h1>{livro.titulo}</h1>
          <p className="autor-livro-detalhe">{livro.autor}</p>

          <div className="metadados-livro-detalhe">
            {livro.genero && (
              <span className="etiqueta-genero">{traduzirGenero(livro.genero)}</span>
            )}
            {livro.paginas && <span>{livro.paginas} páginas</span>}
            {extras?.editora && <span>{extras.editora}</span>}
            {extras?.dataPublicacao && <span>{extras.dataPublicacao}</span>}
          </div>

          <div className="resumo-avaliacao-livro">
            {livro.nota_media !== null ? (
              <>
                <span className="estrelas">{estrelas(livro.nota_media)}</span>
                <strong>{livro.nota_media}</strong>
              </>
            ) : (
              <span>Sem avaliações ainda</span>
            )}
            <span className="total-resenhas-livro">
              {livro.total_resenhas} {livro.total_resenhas === 1 ? 'resenha' : 'resenhas'}
            </span>
          </div>

          {extras?.sinopse && <p className="sinopse-livro-detalhe">{extras.sinopse}</p>}

          <Link to="/nova-resenha" className="botao-primario">
            Escrever resenha
          </Link>
        </div>
      </section>

      <section className="secao-resenhas-livro">
        <h2>Resenhas desse livro</h2>
        {erro && <p className="mensagem-erro">{erro}</p>}

        {resenhas.length === 0 ? (
          <p>Ninguém resenhou esse livro ainda. Seja a primeira pessoa!</p>
        ) : (
          <ul className="lista-resenhas-livro">
            {resenhas.map((resenha) => (
              <li key={resenha.id_resenha} className="painel card-resenha-livro">
                <div className="card-resenha-livro-cabecalho">
                  <div className="card-resenha-livro-autor">
                    <span className="avatar" style={{ backgroundColor: corAvatar(resenha.nome_usuario) }}>
                      {iniciais(resenha.nome_usuario)}
                    </span>
                    <div>
                      <strong>{resenha.nome_usuario}</strong>
                      <p className="estrelas">{estrelas(resenha.nota)}</p>
                    </div>
                  </div>
                  <span className="card-resenha-livro-tempo">{tempoRelativo(resenha.data)}</span>
                </div>

                <h3>{resenha.titulo_resenha}</h3>
                <p className="card-resenha-livro-texto">{resenha.texto}</p>

                <div className="card-resenha-livro-acoes">
                  <button
                    type="button"
                    className={resenha.curtida_usuario ? 'botao-acao botao-curtir ativo' : 'botao-acao botao-curtir'}
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

                <Comentarios idResenha={resenha.id_resenha} totalInicial={resenha.total_comentarios} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
