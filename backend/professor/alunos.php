<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/verificar_sessao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido.']);
    exit;
}

$sessao = verificarSessao('professor');
$idInstituicao = $sessao['id_instituicao'];
$pdo = conectarBanco();

$stmt = $pdo->prepare(
    "SELECT
        usuario.id_usuario,
        usuario.nome,
        usuario.email,
        usuario.criado_em,
        COUNT(DISTINCT resenha.id_resenha) AS total_resenhas,
        (SELECT COUNT(*) FROM biblioteca_usuario
          WHERE biblioteca_usuario.id_usuario = usuario.id_usuario
            AND biblioteca_usuario.status = 'lido') AS livros_lidos,
        (SELECT COUNT(*) FROM curtida
          INNER JOIN resenha r2 ON r2.id_resenha = curtida.id_resenha
          WHERE r2.id_usuario = usuario.id_usuario) AS curtidas_recebidas
     FROM usuario
     LEFT JOIN resenha ON resenha.id_usuario = usuario.id_usuario
     WHERE usuario.id_instituicao = :id AND usuario.tipo = 'aluno' AND usuario.ativo = 1
     GROUP BY usuario.id_usuario
     ORDER BY usuario.nome ASC"
);
$stmt->execute(['id' => $idInstituicao]);
$alunos = $stmt->fetchAll();

foreach ($alunos as &$aluno) {
    $aluno['total_resenhas'] = (int) $aluno['total_resenhas'];
    $aluno['livros_lidos'] = (int) $aluno['livros_lidos'];
    $aluno['curtidas_recebidas'] = (int) $aluno['curtidas_recebidas'];
}

echo json_encode(['sucesso' => true, 'alunos' => $alunos]);