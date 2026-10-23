// src/services/googleBooks.js
//
// Busca livros na Google Books API usando uma chave própria (guardada em
// .env), para não depender da cota compartilhada e anônima do Google,
// que costuma ficar esgotada. Isolamos aqui a tradução da resposta
// bagunçada do Google para o formato simples que nosso backend espera
// (mesmos campos da tabela livro).

import { traduzirGenero } from '../utils/generos';

const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';
const CHAVE_API = import.meta.env.VITE_GOOGLE_BOOKS_KEY;

// Palavras que, aparecendo nas categorias do Google Books, indicam
// conteúdo adulto/erótico — além da própria marcação "MATURE" que o
// Google já usa, essas categorias são um segundo filtro de segurança.
const CATEGORIAS_IMPROPRIAS = ['erotic', 'erótic', 'sexual content', 'adult'];

// A marcação "MATURE" do Google é inconsistente — muita coisa explícita
// não vem marcada. Por isso também barramos pelo que aparece no próprio
// título, subtítulo e descrição do livro, que é mais confiável. A lista
// é propositalmente ampla (PT e EN): aqui vale pecar pelo excesso, já
// que o site é pra leitura em contexto escolar.
const PALAVRAS_IMPROPRIAS = [
  'porno', 'pornografia', 'pornographic', 'pornography',
  'erotic', 'erótic', 'erotismo', 'erotica',
  'sexo explicito', 'sexo explícito', 'explicit sex', 'sexually explicit',
  'hentai', 'hentai manga',
  'nudez explicita', 'nudez explícita',
  'conteudo adulto', 'conteúdo adulto', 'adult content',
  'fetiche sexual', 'sexual fetish',
  'xxx',
];

// Remove acentos pra comparação ficar mais robusta ("erótico" === "erotico").
function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function ehConteudoImproprio(info) {
  if (info.maturityRating === 'MATURE') return true;

  const categorias = (info.categories || []).join(' ').toLowerCase();
  if (CATEGORIAS_IMPROPRIAS.some((palavra) => categorias.includes(palavra))) {
    return true;
  }

  const textoCompleto = normalizar(
    [info.title, info.subtitle, info.description].filter(Boolean).join(' ')
  );
  return PALAVRAS_IMPROPRIAS.some((palavra) => textoCompleto.includes(normalizar(palavra)));
}

export async function buscarLivros(termo) {
  if (!termo || termo.trim() === '') return [];

  // langRestrict + country=BR fazem o Google priorizar edições em
  // português quando elas existem, sem travar a busca quando não existem
  // (aí ele devolve o que tiver, em vez de nada). Pedimos mais resultados
  // (20) do que mostramos (10) porque descartamos conteúdo impróprio
  // antes de cortar a lista — assim sobram 10 de verdade, não menos.
  const resposta = await fetch(
    `${GOOGLE_BOOKS_URL}?q=${encodeURIComponent(termo)}&maxResults=20` +
      `&langRestrict=pt&country=BR&key=${CHAVE_API}`
  );

  if (!resposta.ok) {
    throw new Error('Não foi possível buscar livros agora. Tente novamente.');
  }

  const dados = await resposta.json();

  if (!dados.items) return [];

  return dados.items
    .filter((item) => !ehConteudoImproprio(item.volumeInfo || {}))
    .slice(0, 10)
    .map((item) => {
      const info = item.volumeInfo || {};

      return {
        google_books_id: item.id,
        titulo: info.title || 'Título desconhecido',
        autor: (info.authors && info.authors.join(', ')) || '',
        genero: traduzirGenero((info.categories && info.categories[0]) || ''),
        // trocamos http por https porque o React reclama de conteúdo misto
        imagem_capa: info.imageLinks?.thumbnail?.replace('http://', 'https://') || '',
        paginas: info.pageCount || null,
      };
    });
}

// Remove as tags HTML que a Google Books manda dentro da sinopse
// (<p>, <i>, <br> etc.) — a gente não quer executar esse HTML, só
// mostrar o texto limpo.
function limparHtml(textoHtml) {
  if (!textoHtml) return '';

  return textoHtml
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

// Busca os detalhes completos de UM livro pelo id do Google Books — usado
// na página de detalhes pra trazer sinopse, editora, data de publicação
// e uma capa em resolução melhor, coisas que a gente não guarda no banco
// (lá só fica a miniatura pequena usada nas listagens).
export async function buscarDetalhesGoogleBooks({ googleBooksId }) {
  if (!googleBooksId) return null;

  const resposta = await fetch(
    `${GOOGLE_BOOKS_URL}/${googleBooksId}?country=BR&key=${CHAVE_API}`
  );
  if (!resposta.ok) return null;

  const item = await resposta.json();
  const info = item.volumeInfo || {};
  const imagens = info.imageLinks || {};

  // Pega a maior versão da capa disponível (nem todo livro tem todas).
  const capaGrande = (
    imagens.extraLarge ||
    imagens.large ||
    imagens.medium ||
    imagens.small ||
    imagens.thumbnail ||
    ''
  ).replace('http://', 'https://');

  return {
    sinopse: limparHtml(info.description),
    editora: info.publisher || '',
    dataPublicacao: info.publishedDate || '',
    idioma: info.language || '',
    capaGrande,
  };
}