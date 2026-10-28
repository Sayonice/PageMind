import { useEffect, useState } from 'react';
import { buscarEstatisticas } from '../services/api';
import { estrelas } from '../utils/formatacao';
import { traduzirGenero } from '../utils/generos';
import { IconeLivros, IconePagina, IconeCaneta, IconeEtiqueta } from '../components/Icones';
import './Estatisticas.css';

const CARTOES = [
  { chave: 'livros_lidos', rotulo: 'Livros lidos', Icone: IconeLivros },
  { chave: 'paginas_lidas', rotulo: 'Páginas lidas', Icone: IconePagina },
  { chave: 'resenhas_publicadas', rotulo: 'Resenhas publicadas', Icone: IconeCaneta },
  { chave: 'generos_explorados', rotulo: 'Gêneros explorados', Icone: IconeEtiqueta },
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
      <header className="cabecalho-estatisticas">
        <span className="rotulo-secao">Meus dados</span>
        <h1>Estatísticas</h1>
        <p>Um resumo da sua jornada de leitura no PageMind.</p>
      </header>

      <div className="grade-cartoes-estatisticas">
        {CARTOES.map(({ chave, rotulo, Icone }) => (
          <div key={chave} className="cartao-estatistica">
            <span className="icone-cartao">
              <Icone tamanho={20} />
            </span>
            <strong>{(dados[chave] ?? 0).toLocaleString('pt-BR')}</strong>
            <p>{rotulo}</p>
          </div>
        ))}
      </div>

      <section className="painel secao-estatisticas">
        <h2>Gêneros mais lidos</h2>
        {dados.generos_mais_lidos.length === 0 ? (
          <p>Marque livros como lidos para ver seus gêneros favoritos aqui.</p>
        ) : (
          <div className="barras-generos">
            {dados.generos_mais_lidos.map((item) => (
              <div key={item.genero} className="linha-barra-genero">
                <span>{traduzirGenero(item.genero)}</span>
                <div className="barra-genero">
                  <div className="barra-genero-preenchida" style={{ width: `${item.percentual}%` }} />
                </div>
                <span>{item.percentual}%</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="painel secao-estatisticas">
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
                <div className="item-livro-info">
                  <strong>{livro.titulo}</strong>
                  <p className="item-livro-autor">{livro.autor}</p>
                  <p className="estrelas">
                    {livro.nota !== null ? estrelas(livro.nota) : 'Sem resenha'}
                  </p>
                </div>
                <div className="item-livro-lado">
                  {livro.genero && <span>{traduzirGenero(livro.genero)}</span>}
                  {livro.paginas && <span>{livro.paginas} págs.</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
