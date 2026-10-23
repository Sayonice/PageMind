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

// --- Cartões de resumo ---
$stmt = $pdo->prepare(
    "SELECT COUNT(*) AS total FROM usuario
     WHERE id_instituicao = :id AND tipo = 'aluno' AND ativo = 1"
);
$stmt->execute(['id' => $idInstituicao]);
$totalAlunos = (int) $stmt->fetch()['total'];

$stmt = $pdo->prepare(
    "SELECT
        COUNT(resenha.id_resenha) AS total_resenhas,
        COUNT(DISTINCT resenha.id_livro) AS total_livros,
        ROUND(AVG(resenha.nota), 1) AS nota_media
     FROM resenha
     INNER JOIN usuario ON usuario.id_usuario = resenha.id_usuario
     WHERE usuario.id_instituicao = :id"
);
$stmt->execute(['id' => $idInstituicao]);
$resumoResenhas = $stmt->fetch();

// --- Alunos mais ativos (por resenhas publicadas) ---
$stmt = $pdo->prepare(
    "SELECT
        usuario.id_usuario,
        usuario.nome,
        COUNT(DISTINCT resenha.id_resenha) AS total_resenhas,
        (SELECT COUNT(*) FROM biblioteca_usuario
          WHERE biblioteca_usuario.id_usuario = usuario.id_usuario
            AND biblioteca_usuario.status = 'lido') AS livros_lidos
     FROM usuario
     LEFT JOIN resenha ON resenha.id_usuario = usuario.id_usuario
     WHERE usuario.id_instituicao = :id AND usuario.tipo = 'aluno' AND usuario.ativo = 1
     GROUP BY usuario.id_usuario
     ORDER BY total_resenhas DESC, livros_lidos DESC
     LIMIT 5"
);
$stmt->execute(['id' => $idInstituicao]);
$alunosAtivos = $stmt->fetchAll();

// --- Livros mais avaliados pela instituição ---
$stmt = $pdo->prepare(
    "SELECT
        livro.id_livro,
        livro.titulo,
        livro.autor,
        livro.imagem_capa,
        COUNT(resenha.id_resenha) AS total_resenhas,
        ROUND(AVG(resenha.nota), 1) AS nota_media
     FROM livro
     INNER JOIN resenha ON resenha.id_livro = livro.id_livro
     INNER JOIN usuario ON usuario.id_usuario = resenha.id_usuario
     WHERE usuario.id_instituicao = :id
     GROUP BY livro.id_livro
     ORDER BY total_resenhas DESC, nota_media DESC
     LIMIT 5"
);
$stmt->execute(['id' => $idInstituicao]);
$livrosMaisAvaliados = $stmt->fetchAll();

foreach ($alunosAtivos as &$aluno) {
    $aluno['total_resenhas'] = (int) $aluno['total_resenhas'];
    $aluno['livros_lidos'] = (int) $aluno['livros_lidos'];
}
foreach ($livrosMaisAvaliados as &$livro) {
    $livro['total_resenhas'] = (int) $livro['total_resenhas'];
    $livro['nota_media'] = $livro['nota_media'] !== null ? (float) $livro['nota_media'] : null;
}

echo json_encode([
    'sucesso' => true,
    'resumo' => [
        'total_alunos'   => $totalAlunos,
        'total_resenhas' => (int) $resumoResenhas['total_resenhas'],
        'total_livros'   => (int) $resumoResenhas['total_livros'],
        'nota_media'     => $resumoResenhas['nota_media'] !== null ? (float) $resumoResenhas['nota_media'] : null,
    ],
    'alunos_ativos'        => $alunosAtivos,
    'livros_mais_avaliados' => $livrosMaisAvaliados,
]);