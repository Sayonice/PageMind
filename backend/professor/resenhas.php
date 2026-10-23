<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/verificar_sessao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido.']);
    exit;
}

// Lista TODAS as resenhas da instituição do professor, para moderação —
// diferente de resenhas/listar.php (feed geral de todas as instituições).
$sessao = verificarSessao('professor');
$idInstituicao = $sessao['id_instituicao'];
$pdo = conectarBanco();

$stmt = $pdo->prepare(
    "SELECT
        resenha.id_resenha,
        resenha.titulo AS titulo_resenha,
        resenha.nota,
        resenha.texto,
        resenha.data,
        livro.titulo AS titulo_livro,
        livro.imagem_capa,
        usuario.nome AS nome_usuario,
        (SELECT COUNT(*) FROM curtida
          WHERE curtida.id_resenha = resenha.id_resenha) AS total_curtidas,
        (SELECT COUNT(*) FROM comentario
          WHERE comentario.id_resenha = resenha.id_resenha) AS total_comentarios
     FROM resenha
     INNER JOIN livro ON livro.id_livro = resenha.id_livro
     INNER JOIN usuario ON usuario.id_usuario = resenha.id_usuario
     WHERE usuario.id_instituicao = :id
     ORDER BY resenha.data DESC"
);
$stmt->execute(['id' => $idInstituicao]);
$resenhas = $stmt->fetchAll();

foreach ($resenhas as &$resenha) {
    $resenha['total_curtidas'] = (int) $resenha['total_curtidas'];
    $resenha['total_comentarios'] = (int) $resenha['total_comentarios'];
}

echo json_encode(['sucesso' => true, 'resenhas' => $resenhas]);