<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/verificar_sessao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido.']);
    exit;
}

$sessao = verificarSessao();

$pdo = conectarBanco();

$stmt = $pdo->prepare(
    'SELECT
        biblioteca_usuario.id_biblioteca,
        biblioteca_usuario.status,
        biblioteca_usuario.pagina_atual,
        livro.id_livro,
        livro.google_books_id,
        livro.titulo,
        livro.autor,
        livro.genero,
        livro.imagem_capa,
        livro.paginas
     FROM biblioteca_usuario
     INNER JOIN livro ON livro.id_livro = biblioteca_usuario.id_livro
     WHERE biblioteca_usuario.id_usuario = :id_usuario
     ORDER BY biblioteca_usuario.atualizado_em DESC'
);
$stmt->execute(['id_usuario' => $sessao['id_usuario']]);

$livros = $stmt->fetchAll();

foreach ($livros as &$livro) {
    $livro['pagina_atual'] = (int) $livro['pagina_atual'];
    $livro['paginas'] = $livro['paginas'] !== null ? (int) $livro['paginas'] : null;
}

echo json_encode(['sucesso' => true, 'livros' => $livros]);
