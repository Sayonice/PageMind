// src/components/Comentarios.jsx

import { useState } from 'react';
import { listarComentarios, comentar } from '../services/api';
import { tempoRelativo, iniciais, corAvatar } from '../utils/formatacao';
import './Comentarios.css';

export default function Comentarios({ idResenha, totalInicial }) {
  const [aberto, setAberto] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [totalComentarios, setTotalComentarios] = useState(totalInicial);
  const [carregando, setCarregando] = useState(false);

  const [novoComentario, setNovoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function handleAbrir() {
    const abrindoAgora = !aberto;
    setAberto(abrindoAgora);

    // Só busca na primeira vez que abre, evitando requisições repetidas
    // toda vez que a pessoa fecha e abre de novo.
    if (abrindoAgora && comentarios.length === 0 && totalComentarios > 0) {
      setCarregando(true);
      try {
        const lista = await listarComentarios(idResenha);
        setComentarios(lista);
      } catch (erroCapturado) {
        setErro(erroCapturado.message);
      } finally {
        setCarregando(false);
      }
    }
  }

  async function handleEnviar(evento) {
    evento.preventDefault();
    if (novoComentario.trim() === '') return;

    setErro('');
    setEnviando(true);

    try {
      await comentar({ idResenha, texto: novoComentario.trim() });
      // Recarrega a lista pra pegar o comentário com o nome do autor
      // já vindo certo do back-end, em vez de montar isso na mão aqui.
      const listaAtualizada = await listarComentarios(idResenha);
      setComentarios(listaAtualizada);
      setTotalComentarios(listaAtualizada.length);
      setNovoComentario('');
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="comentarios">
      <button type="button" className="comentarios-toggle" onClick={handleAbrir}>
        💬 {totalComentarios > 0 ? `${totalComentarios} comentários` : 'Comentar'}
      </button>

      {aberto && (
        <div className="comentarios-corpo">
          {carregando && <p>Carregando comentários...</p>}

          {!carregando && comentarios.length > 0 && (
            <ul className="lista-comentarios">
              {comentarios.map((c) => (
                <li key={c.id_comentario}>
                  <span
                    className="avatar avatar-pequeno"
                    style={{ backgroundColor: corAvatar(c.nome_usuario) }}
                  >
                    {iniciais(c.nome_usuario)}
                  </span>
                  <div>
                    <p className="comentario-cabecalho">
                      <strong>{c.nome_usuario}</strong>
                      <span>{tempoRelativo(c.data)}</span>
                    </p>
                    <p className="comentario-texto">{c.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleEnviar} className="form-comentario">
            <input
              type="text"
              placeholder="Escreva um comentário..."
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
            />
            <button type="submit" disabled={enviando || novoComentario.trim() === ''}>
              {enviando ? '...' : 'Enviar'}
            </button>
          </form>

          {erro && <p className="mensagem-erro">{erro}</p>}
        </div>
      )}
    </div>
  );
}