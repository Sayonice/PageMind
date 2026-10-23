<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido.']);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);

$nome           = trim($dados['nome'] ?? '');
$email          = trim($dados['email'] ?? '');
$senha          = $dados['senha'] ?? '';
$tipo           = $dados['tipo'] ?? '';          // 'aluno' ou 'professor'
$idInstituicao  = $dados['id_instituicao'] ?? null;

// --- Validações básicas ---
if ($nome === '' || $email === '' || $senha === '' || $idInstituicao === null) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Preencha todos os campos obrigatórios.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'E-mail inválido.']);
    exit;
}

if (!in_array($tipo, ['aluno', 'professor'], true)) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => "Tipo de usuário deve ser 'aluno' ou 'professor'."]);
    exit;
}

if (strlen($senha) < 8) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'A senha deve ter no mínimo 8 caracteres.']);
    exit;
}

$pdo = conectarBanco();

// --- Verifica se o e-mail já está cadastrado ---
$stmt = $pdo->prepare('SELECT id_usuario FROM usuario WHERE email = :email');
$stmt->execute(['email' => $email]);

if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Este e-mail já está cadastrado.']);
    exit;
}

// --- Verifica se a instituição existe e está ativa ---
$stmt = $pdo->prepare('SELECT id_instituicao FROM instituicao WHERE id_instituicao = :id AND ativo = 1');
$stmt->execute(['id' => $idInstituicao]);

if (!$stmt->fetch()) {
    http_response_code(404);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Instituição não encontrada ou inativa.']);
    exit;
}

// --- Hash da senha (BCRYPT) e inserção ---
$senhaHash = password_hash($senha, PASSWORD_BCRYPT);

$stmt = $pdo->prepare(
    'INSERT INTO usuario (nome, email, senha, tipo, id_instituicao)
     VALUES (:nome, :email, :senha, :tipo, :id_instituicao)'
);

$stmt->execute([
    'nome'           => $nome,
    'email'          => $email,
    'senha'          => $senhaHash,
    'tipo'           => $tipo,
    'id_instituicao' => $idInstituicao,
]);

http_response_code(201);
echo json_encode([
    'sucesso'   => true,
    'mensagem'  => 'Cadastro realizado com sucesso.',
    'id_usuario' => $pdo->lastInsertId(),
]);
