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

$idResenha = $_GET['id_resenha'] ?? null;

if (!is_numeric($idResenha)) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Resenha inválida.']);
    exit;
}

$pdo = conectarBanco();

$stmt = $pdo->prepare(
    'SELECT
        comentario.id_comentario,
        comentario.texto,
        comentario.data,
        usuario.nome AS nome_usuario
     FROM comentario
     INNER JOIN usuario ON usuario.id_usuario = comentario.id_usuario
     WHERE comentario.id_resenha = :id_resenha
     ORDER BY comentario.data ASC'
);
$stmt->execute(['id_resenha' => $idResenha]);

echo json_encode(['sucesso' => true, 'comentarios' => $stmt->fetchAll()]);