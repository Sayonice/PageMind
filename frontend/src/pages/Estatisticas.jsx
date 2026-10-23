// src/pages/Estatisticas.jsx

import { useEffect, useState } from 'react';
import { buscarEstatisticas } from '../services/api';
import { estrelas } from '../utils/formatacao';
import { traduzirGenero } from '../utils/generos';
import './Estatisticas.css';

const CARTOES = [
  { chave: 'livros_lidos', rotulo: 'Livros lidos', icone: '📚' },
  { chave: 'paginas_lidas', rotulo: 'Páginas lidas', icone: '📖' },
  { chave: 'resenhas_publicadas', rotulo: 'Resenhas publicadas', icone: '✍️' },
  { chave: 'generos_explorados', rotulo: 'Gêneros explorados', icone: '🧭' },
];

export default function Estatisticas() {
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    buscarEstatisticas()
      .then(setDados)
      .catch((erroCapturado) => setErro(erroCapturado.message))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <p>Carregando estatísticas...</p>;
  if (erro) return <p className="mensagem-erro">{erro}</p>;

  return (
    <div className="pagina-estatisticas">
      <h1>Estatísticas de leitura</h1>
      <p className="subtitulo-estatisticas">Um resumo da sua jornada de leitura no PageMind.</p>

      <div className="grade-cartoes-estatisticas">
        {CARTOES.map((cartao) => (
          <div key={cartao.chave} className="cartao-estatistica">
            <span className="cartao-estatistica-icone">{cartao.icone}</span>
            <strong>{(dados[cartao.chave] ?? 0).toLocaleString('pt-BR')}</strong>
            <p>{cartao.rotulo}</p>
          </div>
        ))}
      </div>

      <section className="secao-estatisticas">
        <h2>Gêneros mais lidos</h2>
        {dados.generos_mais_lidos.length === 0 ? (
          <p>Marque livros como lidos para ver seus gêneros favoritos aqui.</p>
        ) : (
          <div className="barras-generos">
            {dados.generos_mais_lidos.map((item) => (
              <div key={item.genero} className="linha-barra-genero">
                <span className="rotulo-barra-genero">{traduzirGenero(item.genero)}</span>
                <div className="barra-genero">
                  <div className="barra-genero-preenchida" style={{ width: `${item.percentual}%` }} />
                </div>
                <span className="percentual-barra-genero">{item.percentual}%</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="secao-estatisticas">
        <h2>Livros concluídos</h2>
        {dados.livros_concluidos.length === 0 ? (
          <p>Nenhum livro concluído ainda.</p>
        ) : (
          <ul className="lista-livros-concluidos">
            {dados.livros_concluidos.map((livro) => (
              <li key={livro.id_livro} className="item-livro-concluido">
                {livro.imagem_capa && (
                  <img src={livro.imagem_capa} alt={`Capa de ${livro.titulo}`} />
                )}
                <div>
                  <strong>{livro.titulo}</strong>
                  <p>{livro.autor}</p>
                  {livro.genero && (
                    <p className="genero-livro-concluido">{traduzirGenero(livro.genero)}</p>
                  )}
                  <p className="estrelas">
                    {livro.nota !== null ? estrelas(livro.nota) : 'Sem resenha'}
                  </p>
                </div>
                {livro.paginas && (
                  <span className="paginas-livro-concluido">{livro.paginas} pág.</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
