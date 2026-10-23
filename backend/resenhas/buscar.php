<?php
// pagemind-backend/resenhas/buscar.php
// Busca resenhas pelo nome do livro ou pelo nome de quem escreveu.

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/verificar_sessao.php';

$sessao = verificarSessao();

$termo = trim($_GET['termo'] ?? '');

if ($termo === '') {
    echo json_encode(['sucesso' => true, 'resenhas' => []]);
    exit;
}

try {
    $pdo = conectarBanco();

    $sql = "SELECT
                resenha.id_resenha, resenha.titulo, resenha.nota, resenha.texto, resenha.data,
                usuario.id_usuario, usuario.nome AS nome_usuario,
                livro.id_livro, livro.titulo AS titulo_livro, livro.autor, livro.genero, livro.imagem_capa,
                (SELECT COUNT(*) FROM curtida WHERE curtida.id_resenha = resenha.id_resenha) AS total_curtidas,
                EXISTS (
                    SELECT 1 FROM curtida
                    WHERE curtida.id_resenha = resenha.id_resenha
                      AND curtida.id_usuario = :id_usuario_curtida
                ) AS curtida_usuario,
                (SELECT COUNT(*) FROM comentario WHERE comentario.id_resenha = resenha.id_resenha) AS total_comentarios
            FROM resenha
            INNER JOIN usuario ON usuario.id_usuario = resenha.id_usuario
            INNER JOIN livro ON livro.id_livro = resenha.id_livro
            WHERE livro.titulo LIKE :termo_livro
               OR usuario.nome LIKE :termo_usuario
            ORDER BY resenha.data DESC
            LIMIT 50";

    $stmt = $pdo->prepare($sql);
    $curinga = '%' . $termo . '%';
    $stmt->bindValue(':id_usuario_curtida', $sessao['id_usuario'], PDO::PARAM_INT);
    $stmt->bindValue(':termo_livro', $curinga, PDO::PARAM_STR);
    $stmt->bindValue(':termo_usuario', $curinga, PDO::PARAM_STR);
    $stmt->execute();

    $resenhas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($resenhas as &$resenha) {
        $resenha['curtida_usuario'] = (bool) $resenha['curtida_usuario'];
        $resenha['total_curtidas'] = (int) $resenha['total_curtidas'];
        $resenha['total_comentarios'] = (int) $resenha['total_comentarios'];
    }

    echo json_encode(['sucesso' => true, 'resenhas' => $resenhas]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao buscar resenhas.']);
}