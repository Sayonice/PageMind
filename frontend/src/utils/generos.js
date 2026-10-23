// src/utils/generos.js
//
// A Google Books API devolve categorias em inglês, geralmente como uma
// string hierárquica (ex: "Fiction / Fantasy / Epic"). Aqui a gente pega
// só o primeiro nível e traduz pros termos mais comuns em português.
// Categorias fora da lista aparecem como vieram (sem tradução).

const TRADUCOES = {
  Fiction: 'Ficção',
  'Juvenile Fiction': 'Ficção Juvenil',
  'Young Adult Fiction': 'Ficção Young Adult',
  'Juvenile Nonfiction': 'Não Ficção Juvenil',
  'Science Fiction': 'Ficção Científica',
  Fantasy: 'Fantasia',
  Romance: 'Romance',
  Horror: 'Terror',
  'Mystery & Detective': 'Mistério e Suspense',
  Adventure: 'Aventura',
  Classics: 'Clássicos',
  Drama: 'Drama',
  Poetry: 'Poesia',
  Humor: 'Humor',
  'True Crime': 'Crime Real',
  'Comics & Graphic Novels': 'Quadrinhos',
  'Biography & Autobiography': 'Biografia e Autobiografia',
  History: 'História',
  Science: 'Ciência',
  Philosophy: 'Filosofia',
  Religion: 'Religião',
  'Business & Economics': 'Negócios e Economia',
  Cooking: 'Culinária',
  'Health & Fitness': 'Saúde e Bem-estar',
  'Literary Criticism': 'Crítica Literária',
  'Social Science': 'Ciências Sociais',
  Psychology: 'Psicologia',
  Education: 'Educação',
  Art: 'Arte',
  Music: 'Música',
  Travel: 'Viagem',
  'Sports & Recreation': 'Esportes e Lazer',
  Computers: 'Computação',
  'Technology & Engineering': 'Tecnologia e Engenharia',
  'Political Science': 'Ciência Política',
  Law: 'Direito',
  Medical: 'Medicina',
  Nature: 'Natureza',
  'Self-Help': 'Autoajuda',
};

// Reduz "Fiction / Fantasy / Epic" para só "Fiction" antes de traduzir.
export function traduzirGenero(generoOriginal) {
  if (!generoOriginal) return '';
  const primeiroNivel = generoOriginal.split('/')[0].trim();
  return TRADUCOES[primeiroNivel] || primeiroNivel;
}