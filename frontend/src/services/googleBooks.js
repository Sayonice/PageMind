import { traduzirGenero } from '../utils/generos';

const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';
const CHAVE_API = import.meta.env.VITE_GOOGLE_BOOKS_KEY;

const CATEGORIAS_IMPROPRIAS = ['erotic', 'erótic', 'sexual content', 'adult'];

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
        imagem_capa: info.imageLinks?.thumbnail?.replace('http://', 'https://') || '',
        paginas: info.pageCount || null,
      };
    });
}

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

export async function buscarDetalhesGoogleBooks({ googleBooksId }) {
  if (!googleBooksId) return null;

  const resposta = await fetch(
    `${GOOGLE_BOOKS_URL}/${googleBooksId}?country=BR&key=${CHAVE_API}`
  );
  if (!resposta.ok) return null;

  const item = await resposta.json();
  const info = item.volumeInfo || {};
  const imagens = info.imageLinks || {};

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