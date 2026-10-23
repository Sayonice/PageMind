<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/verificar_sessao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido.']);
    exit;
}

verificarSessao();

$pdo = conectarBanco();

// Livros com mais resenhas primeiro; empate é resolvido pela nota média.
$stmt = $pdo->query(
    'SELECT
        livro.id_livro,
        livro.titulo,
        livro.autor,
        livro.genero,
        livro.imagem_capa,
        COUNT(resenha.id_resenha) AS total_resenhas,
        ROUND(AVG(resenha.nota), 1) AS nota_media
     FROM livro
     INNER JOIN resenha ON resenha.id_livro = livro.id_livro
     GROUP BY livro.id_livro
     ORDER BY total_resenhas DESC, nota_media DESC
     LIMIT 8'
);

$livros = $stmt->fetchAll();

echo json_encode(['sucesso' => true, 'livros' => $livros]);
