import { useEffect, useMemo, useState } from 'react';
import { listarBiblioteca, atualizarStatusBiblioteca } from '../services/api';
import { buscarLivros } from '../services/googleBooks';
import { traduzirGenero } from '../utils/generos';
import './Biblioteca.css';

const ABAS = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'lendo', rotulo: 'Lendo' },
  { valor: 'quero_ler', rotulo: 'Quero ler' },
  { valor: 'lido', rotulo: 'Lido' },
];

const ROTULO_STATUS = {
  quero_ler: 'Quero ler',
  lendo: 'Lendo',
  lido: 'Lido',
};

export default function Biblioteca() {
  const [livros, setLivros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('todos');

  const [mostrarBusca, setMostrarBusca] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  function carregar() {
    listarBiblioteca()
      .then(setLivros)
      .catch((erroCapturado) => setErro(erroCapturado.message))
      .finally(() => setCarregando(false));
  }

  const contagens = useMemo(() => {
    const base = { todos: livros.length, quero_ler: 0, lendo: 0, lido: 0 };
    livros.forEach((livro) => {
      base[livro.status] = (base[livro.status] || 0) + 1;
    });
    return base;
  }, [livros]);

  const livrosFiltrados =
    abaAtiva === 'todos' ? livros : livros.filter((livro) => livro.status === abaAtiva);

  async function handleBuscar(evento) {
    evento.preventDefault();
    setErro('');
    setBuscando(true);
    try {
      setResultados(await buscarLivros(termoBusca));
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setBuscando(false);
    }
  }

  async function handleAdicionar(livro, status) {
    try {
      await atualizarStatusBiblioteca({
        livro,
        status,
        paginaAtual: status === 'lido' ? livro.paginas || 0 : 0,
      });
      setMostrarBusca(false);
      setTermoBusca('');
      setResultados([]);
      carregar();
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    }
  }

  async function handleMudarStatus(livro, novoStatus) {
    try {
      await atualizarStatusBiblioteca({
        livro,
        status: novoStatus,
        paginaAtual: novoStatus === 'lido' ? livro.paginas || 0 : livro.pagina_atual,
      });
      carregar();
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    }
  }

  if (carregando) return <p>Carregando sua biblioteca...</p>;

  const resumo = [
    `${livros.length} ${livros.length === 1 ? 'livro' : 'livros'}`,
    `${contagens.lendo} em andamento`,
    `${contagens.lido} ${contagens.lido === 1 ? 'concluído' : 'concluídos'}`,
  ].join(' · ');

  return (
    <div className="pagina-biblioteca">
      <div className="cabecalho-biblioteca">
        <div>
          <span className="rotulo-secao">Biblioteca pessoal</span>
          <h1 className="titulo-pagina">Minha lista</h1>
          <p className="subtitulo-pagina">{resumo}</p>
        </div>
        <button
          type="button"
          className="botao-primario"
          onClick={() => setMostrarBusca((aberto) => !aberto)}
        >
          {mostrarBusca ? 'Fechar' : '+ Adicionar livro'}
        </button>
      </div>

      {mostrarBusca && (
        <div className="painel painel-busca-biblioteca">
          <form onSubmit={handleBuscar}>
            <label>
              Buscar livro
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Título ou autor"
              />
            </label>
            <button type="submit" disabled={buscando}>
              {buscando ? 'Buscando...' : 'Buscar'}
            </button>
          </form>

          <ul className="lista-resultados-livro">
            {resultados.map((livro) => (
              <li key={livro.google_books_id} className="card-resultado-biblioteca">
                {livro.imagem_capa && (
                  <img src={livro.imagem_capa} alt={`Capa de ${livro.titulo}`} />
                )}
                <div className="card-resultado-info">
                  <strong>{livro.titulo}</strong>
                  <p>{livro.autor}</p>
                </div>
                <div className="card-resultado-acoes">
                  {Object.entries(ROTULO_STATUS).map(([status, rotulo]) => (
                    <button
                      key={status}
                      type="button"
                      className="botao-acao"
                      onClick={() => handleAdicionar(livro, status)}
                    >
                      {rotulo}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {erro && <p className="mensagem-erro">{erro}</p>}

      <div className="chips chips-biblioteca">
        {ABAS.map((aba) => (
          <button
            key={aba.valor}
            type="button"
            className={abaAtiva === aba.valor ? 'chip chip-ativo' : 'chip'}
            onClick={() => setAbaAtiva(aba.valor)}
          >
            {aba.rotulo} {contagens[aba.valor] || 0}
          </button>
        ))}
      </div>

      {livrosFiltrados.length === 0 ? (
        <p className="biblioteca-vazia">Nenhum livro aqui ainda.</p>
      ) : (
        <div className="grade-biblioteca">
          {livrosFiltrados.map((livro) => {
            const progresso =
              livro.paginas && livro.status === 'lendo'
                ? Math.min(100, Math.round((livro.pagina_atual / livro.paginas) * 100))
                : null;

            return (
              <div key={livro.id_livro} className="card-biblioteca">
                <div className="card-biblioteca-capa">
                  <span className={`selo-status selo-${livro.status}`}>
                    {ROTULO_STATUS[livro.status]}
                  </span>
                  {livro.imagem_capa ? (
                    <img src={livro.imagem_capa} alt={`Capa de ${livro.titulo}`} />
                  ) : (
                    <div className="card-biblioteca-sem-capa" />
                  )}
                </div>

                <strong>{livro.titulo}</strong>
                <span className="card-biblioteca-autor">{livro.autor}</span>
                {livro.genero && (
                  <span className="card-biblioteca-genero">{traduzirGenero(livro.genero)}</span>
                )}

                {progresso !== null && (
                  <>
                    <div className="barra-progresso">
                      <div className="barra-progresso-preenchida" style={{ width: `${progresso}%` }} />
                    </div>
                    <span className="texto-progresso">{progresso}% lido</span>
                  </>
                )}

                <select
                  value={livro.status}
                  onChange={(e) => handleMudarStatus(livro, e.target.value)}
                  className="seletor-status"
                  aria-label={`Status de ${livro.titulo}`}
                >
                  {Object.entries(ROTULO_STATUS).map(([status, rotulo]) => (
                    <option key={status} value={status}>
                      {rotulo}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
