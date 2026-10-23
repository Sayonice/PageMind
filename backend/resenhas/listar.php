<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/verificar_sessao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido.']);
    exit;
}

// Precisa estar logado para ver o feed (interrompe com 401 se não estiver).
$sessao = verificarSessao();

$pdo = conectarBanco();

$stmt = $pdo->prepare(
    'SELECT
        resenha.id_resenha,
        resenha.titulo   AS titulo_resenha,
        resenha.nota,
        resenha.texto,
        resenha.data,
        livro.id_livro,
        livro.titulo      AS titulo_livro,
        livro.autor       AS autor_livro,
        livro.genero      AS genero,
        livro.imagem_capa,
        usuario.nome       AS nome_usuario,
        usuario.tipo       AS tipo_usuario,
        (SELECT COUNT(*) FROM curtida
          WHERE curtida.id_resenha = resenha.id_resenha)   AS total_curtidas,
        (SELECT COUNT(*) FROM curtida
          WHERE curtida.id_resenha = resenha.id_resenha
            AND curtida.id_usuario = :id_usuario)          AS curtida_usuario,
        (SELECT COUNT(*) FROM comentario
          WHERE comentario.id_resenha = resenha.id_resenha) AS total_comentarios
     FROM resenha
     INNER JOIN livro   ON livro.id_livro     = resenha.id_livro
     INNER JOIN usuario ON usuario.id_usuario = resenha.id_usuario
     ORDER BY resenha.data DESC'
);
$stmt->execute(['id_usuario' => $sessao['id_usuario']]);

$resenhas = $stmt->fetchAll();

// curtida_usuario vem do banco como "0"/"1" (string); converte pra boolean de verdade.
foreach ($resenhas as &$resenha) {
    $resenha['curtida_usuario'] = (bool) $resenha['curtida_usuario'];
    $resenha['total_curtidas'] = (int) $resenha['total_curtidas'];
    $resenha['total_comentarios'] = (int) $resenha['total_comentarios'];
}

echo json_encode(['sucesso' => true, 'resenhas' => $resenhas]);
