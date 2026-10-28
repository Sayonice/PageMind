import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  buscarDashboardProfessor,
  listarAlunos,
  listarResenhasInstituicao,
  excluirResenha,
} from '../services/api';
import { iniciais, corAvatar, estrelas, tempoRelativo } from '../utils/formatacao';
import { useAuth } from '../context/useAuth';
import { IconeCoracao, IconeComentario, IconeLixeira } from '../components/Icones';
import './PainelProfessor.css';

const ABAS = [
  { valor: 'visao_geral', rotulo: 'Visão geral' },
  { valor: 'alunos', rotulo: 'Alunos' },
  { valor: 'moderacao', rotulo: 'Moderação de resenhas' },
];

export default function PainelProfessor() {
  const { usuario } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState('visao_geral');

  const [dashboard, setDashboard] = useState(null);
  const [alunos, setAlunos] = useState(null);
  const [resenhas, setResenhas] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    buscarDashboardProfessor()
      .then(setDashboard)
      .catch((erroCapturado) => setErro(erroCapturado.message))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    if (abaAtiva === 'alunos' && alunos === null) {
      listarAlunos().then(setAlunos).catch((e) => setErro(e.message));
    }
    if (abaAtiva === 'moderacao' && resenhas === null) {
      listarResenhasInstituicao().then(setResenhas).catch((e) => setErro(e.message));
    }
  }, [abaAtiva, alunos, resenhas]);

  async function handleExcluir(idResenha) {
    if (!window.confirm('Excluir esta resenha? Essa ação não pode ser desfeita.')) return;

    try {
      await excluirResenha(idResenha);
      setResenhas((atual) => atual.filter((r) => r.id_resenha !== idResenha));
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    }
  }

  if (usuario?.tipo !== 'professor') return <Navigate to="/feed" replace />;

  if (carregando) return <p>Carregando painel...</p>;
  if (erro && !dashboard) return <p className="mensagem-erro">{erro}</p>;

  return (
    <div className="pagina-painel-professor">
      <span className="rotulo-secao">Instituição</span>
      <h1>Painel do professor</h1>
      <p className="subtitulo-painel">Visão da sua instituição no PageMind.</p>

      <div className="chips abas-painel">
        {ABAS.map((aba) => (
          <button
            key={aba.valor}
            type="button"
            className={abaAtiva === aba.valor ? 'chip chip-ativo' : 'chip'}
            onClick={() => setAbaAtiva(aba.valor)}
          >
            {aba.rotulo}
          </button>
        ))}
      </div>

      {erro && <p className="mensagem-erro">{erro}</p>}

      {abaAtiva === 'visao_geral' && (
        <>
          <div className="grade-cartoes-painel">
            <div className="cartao-estatistica">
              <strong>{dashboard.resumo.total_alunos}</strong>
              <p>Alunos ativos</p>
            </div>
            <div className="cartao-estatistica">
              <strong>{dashboard.resumo.total_resenhas}</strong>
              <p>Resenhas publicadas</p>
            </div>
            <div className="cartao-estatistica">
              <strong>{dashboard.resumo.total_livros}</strong>
              <p>Livros avaliados</p>
            </div>
            <div className="cartao-estatistica">
              <strong>{dashboard.resumo.nota_media ?? '-'}</strong>
              <p>Nota média geral</p>
            </div>
          </div>

          <div className="colunas-painel">
            <section className="painel">
              <h2>Alunos mais ativos</h2>
              {dashboard.alunos_ativos.length === 0 ? (
                <p>Nenhum aluno com atividade ainda.</p>
              ) : (
                <ul className="lista-ranking">
                  {dashboard.alunos_ativos.map((aluno) => (
                    <li key={aluno.id_usuario} className="item-ranking">
                      <span className="avatar" style={{ backgroundColor: corAvatar(aluno.nome) }}>
                        {iniciais(aluno.nome)}
                      </span>
                      <div>
                        <strong>{aluno.nome}</strong>
                        <p>
                          {aluno.total_resenhas}{' '}
                          {aluno.total_resenhas === 1 ? 'resenha' : 'resenhas'} ·{' '}
                          {aluno.livros_lidos} livros lidos
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="painel">
              <h2>Livros mais avaliados</h2>
              {dashboard.livros_mais_avaliados.length === 0 ? (
                <p>Nenhum livro avaliado ainda.</p>
              ) : (
                <ul className="lista-ranking">
                  {dashboard.livros_mais_avaliados.map((livro) => (
                    <li key={livro.id_livro} className="item-ranking">
                      <Link to={`/livro/${livro.id_livro}`}>
                        {livro.imagem_capa && (
                          <img
                            src={livro.imagem_capa}
                            alt={`Capa de ${livro.titulo}`}
                            className="capa-ranking"
                          />
                        )}
                      </Link>
                      <div>
                        <Link to={`/livro/${livro.id_livro}`} className="link-sem-estilo">
                          <strong>{livro.titulo}</strong>
                        </Link>
                        <p>{livro.autor}</p>
                        <p className="estrelas">
                          {estrelas(livro.nota_media)} ({livro.total_resenhas})
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}

      {abaAtiva === 'alunos' && (
        <section className="painel">
          {alunos === null ? (
            <p>Carregando alunos...</p>
          ) : alunos.length === 0 ? (
            <p>Nenhum aluno cadastrado nessa instituição ainda.</p>
          ) : (
            <div className="tabela-rolagem">
              <table className="tabela-alunos">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th>E-mail</th>
                    <th>Resenhas</th>
                    <th>Livros lidos</th>
                    <th>Curtidas recebidas</th>
                  </tr>
                </thead>
                <tbody>
                  {alunos.map((aluno) => (
                    <tr key={aluno.id_usuario}>
                      <td>
                        <div className="celula-aluno">
                          <span
                            className="avatar avatar-pequeno"
                            style={{ backgroundColor: corAvatar(aluno.nome) }}
                          >
                            {iniciais(aluno.nome)}
                          </span>
                          {aluno.nome}
                        </div>
                      </td>
                      <td>{aluno.email}</td>
                      <td>{aluno.total_resenhas}</td>
                      <td>{aluno.livros_lidos}</td>
                      <td>{aluno.curtidas_recebidas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {abaAtiva === 'moderacao' && (
        <section>
          {resenhas === null ? (
            <p>Carregando resenhas...</p>
          ) : resenhas.length === 0 ? (
            <p>Nenhuma resenha publicada por essa instituição ainda.</p>
          ) : (
            <ul className="lista-moderacao">
              {resenhas.map((resenha) => (
                <li key={resenha.id_resenha} className="painel card-moderacao">
                  {resenha.imagem_capa && (
                    <img src={resenha.imagem_capa} alt={`Capa de ${resenha.titulo_livro}`} />
                  )}
                  <div className="card-moderacao-conteudo">
                    <div className="card-moderacao-cabecalho">
                      <p className="card-moderacao-meta">
                        <strong>{resenha.nome_usuario}</strong> · {resenha.titulo_livro} ·{' '}
                        {tempoRelativo(resenha.data)}
                      </p>
                      <button
                        type="button"
                        className="botao-acao botao-excluir"
                        onClick={() => handleExcluir(resenha.id_resenha)}
                      >
                        <IconeLixeira tamanho={16} />
                        Excluir
                      </button>
                    </div>
                    <p className="estrelas">{estrelas(resenha.nota)}</p>
                    <h3>{resenha.titulo_resenha}</h3>
                    <p className="card-moderacao-texto">{resenha.texto}</p>
                    <p className="card-moderacao-engajamento">
                      <span>
                        <IconeCoracao tamanho={14} />
                        {resenha.total_curtidas}
                      </span>
                      <span>
                        <IconeComentario tamanho={14} />
                        {resenha.total_comentarios}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
