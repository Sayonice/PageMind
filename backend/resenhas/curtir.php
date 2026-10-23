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

if (!is_numeric($idResenha)) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Resenha inválida.']);
    exit;
}

$pdo = conectarBanco();

// Confirma que a resenha existe antes de tentar curtir.
$stmt = $pdo->prepare('SELECT id_resenha FROM resenha WHERE id_resenha = :id');
$stmt->execute(['id' => $idResenha]);
if (!$stmt->fetch()) {
    http_response_code(404);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Resenha não encontrada.']);
    exit;
}

$stmt = $pdo->prepare(
    'SELECT id_curtida FROM curtida WHERE id_usuario = :id_usuario AND id_resenha = :id_resenha'
);
$stmt->execute([
    'id_usuario' => $sessao['id_usuario'],
    'id_resenha' => $idResenha,
]);
$curtidaExistente = $stmt->fetch();

if ($curtidaExistente) {
    // Já tinha curtido: remove (descurtir).
    $stmt = $pdo->prepare('DELETE FROM curtida WHERE id_curtida = :id');
    $stmt->execute(['id' => $curtidaExistente['id_curtida']]);
    $curtiu = false;
} else {
    // Ainda não tinha curtido: adiciona.
    $stmt = $pdo->prepare(
        'INSERT INTO curtida (id_usuario, id_resenha) VALUES (:id_usuario, :id_resenha)'
    );
    $stmt->execute([
        'id_usuario' => $sessao['id_usuario'],
        'id_resenha' => $idResenha,
    ]);
    $curtiu = true;
}

$stmt = $pdo->prepare('SELECT COUNT(*) AS total FROM curtida WHERE id_resenha = :id');
$stmt->execute(['id' => $idResenha]);
$totalCurtidas = (int) $stmt->fetch()['total'];

echo json_encode([
    'sucesso' => true,
    'curtiu' => $curtiu,
    'total_curtidas' => $totalCurtidas,
]);