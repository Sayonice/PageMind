import { useState } from 'react';
import { listarComentarios, comentar } from '../services/api';
import { tempoRelativo, iniciais, corAvatar } from '../utils/formatacao';
import { IconeComentario } from './Icones';
import './Comentarios.css';

function rotuloTotal(total) {
  if (total === 0) return 'Comentar';
  return total === 1 ? '1 comentário' : `${total} comentários`;
}

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

    if (abrindoAgora && comentarios.length === 0 && totalComentarios > 0) {
      setCarregando(true);
      try {
        setComentarios(await listarComentarios(idResenha));
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
        <IconeComentario tamanho={16} />
        {rotuloTotal(totalComentarios)}
      </button>

      {aberto && (
        <div className="comentarios-corpo">
          {carregando && <p className="comentarios-status">Carregando comentários...</p>}

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
              placeholder="Escreva um comentário"
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
            />
            <button type="submit" disabled={enviando || novoComentario.trim() === ''}>
              {enviando ? 'Enviando...' : 'Enviar'}
            </button>
          </form>

          {erro && <p className="mensagem-erro">{erro}</p>}
        </div>
      )}
    </div>
  );
}
