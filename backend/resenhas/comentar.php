<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/verificar_sessao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido.']);
    exit;
}

$sessao = verificarSessao();

$dados = json_decode(file_get_contents('php://input'), true);
$idResenha = $dados['id_resenha'] ?? null;
$texto = trim($dados['texto'] ?? '');

if (!is_numeric($idResenha)) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Resenha inválida.']);
    exit;
}

if ($texto === '') {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Escreva algo antes de comentar.']);
    exit;
}

$pdo = conectarBanco();

$stmt = $pdo->prepare('SELECT id_resenha FROM resenha WHERE id_resenha = :id');
$stmt->execute(['id' => $idResenha]);
if (!$stmt->fetch()) {
    http_response_code(404);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Resenha não encontrada.']);
    exit;
}

$stmt = $pdo->prepare(
    'INSERT INTO comentario (texto, id_usuario, id_resenha)
     VALUES (:texto, :id_usuario, :id_resenha)'
);
$stmt->execute([
    'texto'      => $texto,
    'id_usuario' => $sessao['id_usuario'],
    'id_resenha' => $idResenha,
]);

http_response_code(201);
echo json_encode([
    'sucesso'       => true,
    'id_comentario' => $pdo->lastInsertId(),
]);