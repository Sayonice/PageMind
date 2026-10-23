<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/verificar_sessao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido.']);
    exit;
}

// Só professores podem excluir resenhas de outras pessoas (moderação).
$sessao = verificarSessao('professor');

$dados = json_decode(file_get_contents('php://input'), true);
$idResenha = $dados['id_resenha'] ?? null;

if (!is_numeric($idResenha)) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Resenha inválida.']);
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

// curtida e comentario têm ON DELETE CASCADE, então somem junto
// automaticamente. biblioteca_usuario não referencia resenha, só o livro,
// então o "lido" da pessoa na biblioteca permanece mesmo sem a resenha.
$stmt = $pdo->prepare('DELETE FROM resenha WHERE id_resenha = :id');
$stmt->execute(['id' => $idResenha]);

echo json_encode(['sucesso' => true, 'mensagem' => 'Resenha excluída com sucesso.']);