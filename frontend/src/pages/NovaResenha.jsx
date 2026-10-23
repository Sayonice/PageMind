// src/pages/NovaResenha.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarLivros } from '../services/googleBooks';
import { criarResenha } from '../services/api';
import '../styles/formularios.css';
import './NovaResenha.css';

export default function NovaResenha() {
  // --- Estado da busca de livro ---
  const [termoBusca, setTermoBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [livroSelecionado, setLivroSelecionado] = useState(null);

  // --- Estado do formulário de resenha ---
  const [tituloResenha, setTituloResenha] = useState('');
  const [nota, setNota] = useState(5);
  const [texto, setTexto] = useState('');

  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const navigate = useNavigate();

  async function handleBuscar(evento) {
    evento.preventDefault();
    setErro('');
    setBuscando(true);

    try {
      const livros = await buscarLivros(termoBusca);
      setResultados(livros);
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setBuscando(false);
    }
  }

  function handleTrocarLivro() {
    // Volta pra etapa de busca, caso o usuário tenha escolhido o livro errado
    setLivroSelecionado(null);
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      await criarResenha({
        livro: livroSelecionado,
        resenha: { titulo: tituloResenha, nota: Number(nota), texto },
      });
      navigate('/feed');
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setEnviando(false);
    }
  }

  // --- Etapa 1: buscar e escolher o livro ---
  if (!livroSelecionado) {
    return (
      <div className="pagina-nova-resenha">
        <h1>Nova resenha</h1>

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

        {erro && <p className="mensagem-erro">{erro}</p>}

        <ul className="lista-resultados-livro">
          {resultados.map((livro) => (
            <li key={livro.google_books_id}>
              <button
                type="button"
                className="card-livro-resultado"
                onClick={() => setLivroSelecionado(livro)}
              >
                {livro.imagem_capa && (
                  <img src={livro.imagem_capa} alt={`Capa de ${livro.titulo}`} />
                )}
                <div>
                  <strong>{livro.titulo}</strong>
                  <p>{livro.autor}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // --- Etapa 2: escrever a resenha sobre o livro escolhido ---
  return (
    <div className="pagina-nova-resenha">
      <h1>Resenhando: {livroSelecionado.titulo}</h1>

      <div className="livro-escolhido">
        {livroSelecionado.imagem_capa && (
          <img src={livroSelecionado.imagem_capa} alt={`Capa de ${livroSelecionado.titulo}`} />
        )}
        <div>
          <strong>{livroSelecionado.titulo}</strong>
          <p>{livroSelecionado.autor}</p>
        </div>
        <button type="button" onClick={handleTrocarLivro}>
          Trocar livro
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          Título da resenha
          <input
            type="text"
            value={tituloResenha}
            onChange={(e) => setTituloResenha(e.target.value)}
            required
          />
        </label>

        <label>
          Nota (1 a 5)
          <input
            type="number"
            min={1}
            max={5}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            required
          />
        </label>

        <label>
          Sua resenha
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={8}
            required
          />
        </label>

        {erro && <p className="mensagem-erro">{erro}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? 'Publicando...' : 'Publicar resenha'}
        </button>
      </form>
    </div>
  );
}
