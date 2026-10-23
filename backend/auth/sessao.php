<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/verificar_sessao.php';

// Não redireciona nem dá erro fatal: aqui só queremos saber
// se existe uma sessão válida, então tratamos manualmente
// em vez de usar verificarSessao() (que interrompe com 401).

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION['id_usuario'])) {
    http_response_code(200);
    echo json_encode(['sucesso' => true, 'usuario' => null]);
    exit;
}

$pdo = conectarBanco();
$stmt = $pdo->prepare(
    'SELECT id_usuario, nome, email, tipo, id_instituicao
     FROM usuario
     WHERE id_usuario = :id AND ativo = 1'
);
$stmt->execute(['id' => $_SESSION['id_usuario']]);
$usuario = $stmt->fetch();

if (!$usuario) {
    // Sessão existia mas o usuário foi desativado/removido: encerra
    $_SESSION = [];
    session_destroy();
    echo json_encode(['sucesso' => true, 'usuario' => null]);
    exit;
}

echo json_encode(['sucesso' => true, 'usuario' => $usuario]);