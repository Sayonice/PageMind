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

$idLivro = $_GET['id'] ?? null;
if (!is_numeric($idLivro)) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Livro inválido.']);
    exit;
}

$pdo = conectarBanco();

// --- Dados do livro + estatísticas agregadas das resenhas ---
$stmt = $pdo->prepare(
    'SELECT
        livro.id_livro,
        livro.google_books_id,
        livro.titulo,
        livro.autor,
        livro.genero,
        livro.imagem_capa,
        livro.paginas,
        COUNT(resenha.id_resenha) AS total_resenhas,
        ROUND(AVG(resenha.nota), 1) AS nota_media
     FROM livro
     LEFT JOIN resenha ON resenha.id_livro = livro.id_livro
     WHERE livro.id_livro = :id_livro
     GROUP BY livro.id_livro'
);
$stmt->execute(['id_livro' => $idLivro]);
$livro = $stmt->fetch();

if (!$livro) {
    http_response_code(404);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Livro não encontrado.']);
    exit;
}

$livro['paginas'] = $livro['paginas'] !== null ? (int) $livro['paginas'] : null;
$livro['total_resenhas'] = (int) $livro['total_resenhas'];
$livro['nota_media'] = $livro['nota_media'] !== null ? (float) $livro['nota_media'] : null;

// --- Todas as resenhas desse livro ---
$stmt = $pdo->prepare(
    'SELECT
        resenha.id_resenha,
        resenha.titulo AS titulo_resenha,
        resenha.nota,
        resenha.texto,
        resenha.data,
        usuario.nome AS nome_usuario,
        (SELECT COUNT(*) FROM curtida
          WHERE curtida.id_resenha = resenha.id_resenha) AS total_curtidas,
        (SELECT COUNT(*) FROM curtida
          WHERE curtida.id_resenha = resenha.id_resenha
            AND curtida.id_usuario = :id_usuario) AS curtida_usuario,
        (SELECT COUNT(*) FROM comentario
          WHERE comentario.id_resenha = resenha.id_resenha) AS total_comentarios
     FROM resenha
     INNER JOIN usuario ON usuario.id_usuario = resenha.id_usuario
     WHERE resenha.id_livro = :id_livro
     ORDER BY resenha.data DESC'
);
$stmt->execute([
    'id_usuario' => $sessao['id_usuario'],
    'id_livro'   => $idLivro,
]);
$resenhas = $stmt->fetchAll();

foreach ($resenhas as &$resenha) {
    $resenha['curtida_usuario'] = (bool) $resenha['curtida_usuario'];
    $resenha['total_curtidas'] = (int) $resenha['total_curtidas'];
    $resenha['total_comentarios'] = (int) $resenha['total_comentarios'];
}

echo json_encode(['sucesso' => true, 'livro' => $livro, 'resenhas' => $resenhas]);
