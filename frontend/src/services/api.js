// src/services/api.js
//
// Centraliza a comunicação com o backend PHP.
// Quando o endereço do servidor mudar (ex: ao subir para a AWS),
// só precisa trocar aqui.

const API_URL = 'http://localhost:8000';

/**
 * Função genérica para fazer requisições POST em JSON.
 * `credentials: 'include'` é importante para o login funcionar,
 * pois é o que permite o navegador guardar o cookie de sessão do PHP.
 */
async function postJSON(rota, dados) {
  const resposta = await fetch(`${API_URL}${rota}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(dados),
  });

  const json = await resposta.json();

  if (!resposta.ok) {
    // Repassa a mensagem de erro que o PHP já formatou
    throw new Error(json.mensagem || 'Erro na requisição.');
  }

  return json;
}

export function cadastrarUsuario({ nome, email, senha, tipo, id_instituicao }) {
  return postJSON('/auth/cadastro.php', { nome, email, senha, tipo, id_instituicao });
}

export function fazerLogin({ email, senha }) {
  return postJSON('/auth/login.php', { email, senha });
}

export function fazerLogout() {
  return postJSON('/auth/logout.php', {});
}

export async function verificarSessao() {
  const resposta = await fetch(`${API_URL}/auth/sessao.php`, {
    credentials: 'include',
  });
  return resposta.json(); // { sucesso: true, usuario: {...} | null }
}

export function criarResenha({ livro, resenha }) {
  return postJSON('/resenhas/criar.php', { livro, resenha });
}

export async function listarResenhas() {
  const resposta = await fetch(`${API_URL}/resenhas/listar.php`, {
    credentials: 'include',
  });

  const json = await resposta.json();

  if (!resposta.ok) {
    throw new Error(json.mensagem || 'Erro ao carregar o feed.');
  }

  return json.resenhas;
}

export async function listarLivrosDestaque() {
  const resposta = await fetch(`${API_URL}/resenhas/livros_destaque.php`, {
    credentials: 'include',
  });

  const json = await resposta.json();

  if (!resposta.ok) {
    throw new Error(json.mensagem || 'Erro ao carregar livros em destaque.');
  }

  return json.livros;
}

export async function curtirResenha(idResenha) {
  const json = await postJSON('/resenhas/curtir.php', { id_resenha: idResenha });
  return json; // { sucesso, curtiu, total_curtidas }
}

export function excluirResenha(idResenha) {
  return postJSON('/resenhas/excluir.php', { id_resenha: idResenha });
}

export async function buscarRecomendacoes() {
  const resposta = await fetch(`${API_URL}/recomendacoes/livros.php`, {
    credentials: 'include',
  });

  const json = await resposta.json();

  if (!resposta.ok) {
    throw new Error(json.mensagem || 'Erro ao carregar recomendações.');
  }

  return json; // { baseado_em_generos, livros }
}

export async function buscarDetalhesLivro(idLivro) {
  const resposta = await fetch(`${API_URL}/livros/detalhes.php?id=${idLivro}`, {
    credentials: 'include',
  });

  const json = await resposta.json();

  if (!resposta.ok) {
    throw new Error(json.mensagem || 'Erro ao carregar o livro.');
  }

  return json; // { livro, resenhas }
}

export async function listarComentarios(idResenha) {
  const resposta = await fetch(
    `${API_URL}/resenhas/comentarios.php?id_resenha=${idResenha}`,
    { credentials: 'include' }
  );

  const json = await resposta.json();

  if (!resposta.ok) {
    throw new Error(json.mensagem || 'Erro ao carregar comentários.');
  }

  return json.comentarios;
}

export function comentar({ idResenha, texto }) {
  return postJSON('/resenhas/comentar.php', { id_resenha: idResenha, texto });
}

export async function listarBiblioteca() {
  const resposta = await fetch(`${API_URL}/biblioteca/listar.php`, {
    credentials: 'include',
  });

  const json = await resposta.json();

  if (!resposta.ok) {
    throw new Error(json.mensagem || 'Erro ao carregar sua biblioteca.');
  }

  return json.livros;
}

export function atualizarStatusBiblioteca({ livro, status, paginaAtual = 0 }) {
  return postJSON('/biblioteca/atualizar_status.php', {
    livro,
    status,
    pagina_atual: paginaAtual,
  });
}

export async function buscarEstatisticas() {
  const resposta = await fetch(`${API_URL}/estatisticas/resumo.php`, {
    credentials: 'include',
  });

  const json = await resposta.json();

  if (!resposta.ok) {
    throw new Error(json.mensagem || 'Erro ao carregar estatísticas.');
  }

  return json.estatisticas;
}

export async function buscarPerfil() {
  const resposta = await fetch(`${API_URL}/usuarios/perfil.php`, {
    credentials: 'include',
  });

  const json = await resposta.json();

  if (!resposta.ok) {
    throw new Error(json.mensagem || 'Erro ao carregar o perfil.');
  }

  return json; // { usuario, estatisticas, minhas_resenhas }
}

export function atualizarPerfil({ nome, bio }) {
  return postJSON('/usuarios/perfil.php', { nome, bio });
}

async function getJSON(rota) {
  const resposta = await fetch(`${API_URL}${rota}`, { credentials: 'include' });
  const json = await resposta.json();

  if (!resposta.ok) {
    throw new Error(json.mensagem || 'Erro ao carregar dados.');
  }

  return json;
}

export async function buscarDashboardProfessor() {
  const json = await getJSON('/professor/dashboard.php');
  return json; // { resumo, alunos_ativos, livros_mais_avaliados }
}

export async function listarAlunos() {
  const json = await getJSON('/professor/alunos.php');
  return json.alunos;
}

export async function listarResenhasInstituicao() {
  const json = await getJSON('/professor/resenhas.php');
  return json.resenhas;
}

export async function buscarResenhas(termo) {
  const json = await getJSON(`/resenhas/buscar.php?termo=${encodeURIComponent(termo)}`);
  return json.resenhas;
}