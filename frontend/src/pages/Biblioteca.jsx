// src/pages/Biblioteca.jsx

import { useEffect, useMemo, useState } from 'react';
import { listarBiblioteca, atualizarStatusBiblioteca } from '../services/api';
import { buscarLivros } from '../services/googleBooks';
import { traduzirGenero } from '../utils/generos';
import './Biblioteca.css';

const ABAS = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'quero_ler', rotulo: 'Quero ler' },
  { valor: 'lendo', rotulo: 'Lendo' },
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
    setCarregando(true);
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
      const encontrados = await buscarLivros(termoBusca);
      setResultados(encontrados);
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

  return (
    <div className="pagina-biblioteca">
      <div className="cabecalho-biblioteca">
        <div>
          <h1>Minha biblioteca</h1>
          <p>Acompanhe o que você já leu, está lendo ou quer ler.</p>
        </div>
        <button
          type="button"
          className="botao-primario"
          onClick={() => setMostrarBusca((v) => !v)}
        >
          {mostrarBusca ? 'Fechar' : '+ Adicionar livro'}
        </button>
      </div>

      {mostrarBusca && (
        <div className="painel-busca-biblioteca">
          <form onSubmit={handleBuscar}>
            <label>
              Buscar livro
              <input
                type="text"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                placeholder="Título ou autor..."
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
                  <button type="button" onClick={() => handleAdicionar(livro, 'quero_ler')}>
                    Quero ler
                  </button>
                  <button type="button" onClick={() => handleAdicionar(livro, 'lendo')}>
                    Lendo
                  </button>
                  <button type="button" onClick={() => handleAdicionar(livro, 'lido')}>
                    Lido
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {erro && <p className="mensagem-erro">{erro}</p>}

      <div className="abas-biblioteca">
        {ABAS.map((aba) => (
          <button
            key={aba.valor}
            type="button"
            className={abaAtiva === aba.valor ? 'aba-ativa' : ''}
            onClick={() => setAbaAtiva(aba.valor)}
          >
            {aba.rotulo} ({contagens[aba.valor] || 0})
          </button>
        ))}
      </div>

      {livrosFiltrados.length === 0 ? (
        <p>Nenhum livro aqui ainda.</p>
      ) : (
        <div className="grade-biblioteca">
          {livrosFiltrados.map((livro) => {
            const progresso =
              livro.paginas && livro.status === 'lendo'
                ? Math.min(100, Math.round((livro.pagina_atual / livro.paginas) * 100))
                : null;

            return (
              <div key={livro.id_livro} className="card-biblioteca">
                <span className={`selo-status selo-${livro.status}`}>
                  {ROTULO_STATUS[livro.status]}
                </span>

                {livro.imagem_capa && (
                  <img src={livro.imagem_capa} alt={`Capa de ${livro.titulo}`} />
                )}

                <strong>{livro.titulo}</strong>
                <p className="card-biblioteca-autor">{livro.autor}</p>
                {livro.genero && (
                  <p className="card-biblioteca-genero">{traduzirGenero(livro.genero)}</p>
                )}

                {progresso !== null && (
                  <>
                    <div className="barra-progresso">
                      <div
                        className="barra-progresso-preenchida"
                        style={{ width: `${progresso}%` }}
                      />
                    </div>
                    <span className="texto-progresso">{progresso}% lido</span>
                  </>
                )}

                <select
                  value={livro.status}
                  onChange={(e) => handleMudarStatus(livro, e.target.value)}
                  className="seletor-status"
                >
                  <option value="quero_ler">Quero ler</option>
                  <option value="lendo">Lendo</option>
                  <option value="lido">Lido</option>
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
