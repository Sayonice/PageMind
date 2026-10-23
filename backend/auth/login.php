<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido.']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);

$email = trim($dados['email'] ?? '');
$senha = $dados['senha'] ?? '';

if ($email === '' || $senha === '') {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Informe e-mail e senha.']);
    exit;
}

$pdo = conectarBanco();

$stmt = $pdo->prepare(
    'SELECT id_usuario, nome, email, senha, tipo, id_instituicao, ativo
     FROM usuario
     WHERE email = :email'
);
$stmt->execute(['email' => $email]);
$usuario = $stmt->fetch();

// Mensagem genérica de propósito, para não revelar se o e-mail existe ou não
if (!$usuario || !password_verify($senha, $usuario['senha'])) {
    http_response_code(401);
    echo json_encode(['sucesso' => false, 'mensagem' => 'E-mail ou senha inválidos.']);
    exit;
}

if ((int) $usuario['ativo'] !== 1) {
    http_response_code(403);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Usuário inativo. Contate a instituição.']);
    exit;
}

// --- Sessão autenticada ---
session_regenerate_id(true);
$_SESSION['id_usuario']     = $usuario['id_usuario'];
$_SESSION['tipo']           = $usuario['tipo'];
$_SESSION['id_instituicao'] = $usuario['id_instituicao'];

echo json_encode([
    'sucesso' => true,
    'usuario' => [
        'id_usuario'     => $usuario['id_usuario'],
        'nome'           => $usuario['nome'],
        'email'          => $usuario['email'],
        'tipo'           => $usuario['tipo'],
        'id_instituicao' => $usuario['id_instituicao'],
    ],
]);
