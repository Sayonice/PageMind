<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/verificar_sessao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido.']);
    exit;
}

$sessao = verificarSessao();
$idUsuario = $sessao['id_usuario'];

$pdo = conectarBanco();

// --- Livros lidos e páginas lidas ---
$stmt = $pdo->prepare(
    "SELECT COUNT(*) AS livros_lidos, COALESCE(SUM(livro.paginas), 0) AS paginas_lidas
     FROM biblioteca_usuario
     INNER JOIN livro ON livro.id_livro = biblioteca_usuario.id_livro
     WHERE biblioteca_usuario.id_usuario = :id_usuario
       AND biblioteca_usuario.status = 'lido'"
);
$stmt->execute(['id_usuario' => $idUsuario]);
$resumoLeitura = $stmt->fetch();

// --- Resenhas publicadas ---
$stmt = $pdo->prepare('SELECT COUNT(*) AS total FROM resenha WHERE id_usuario = :id_usuario');
$stmt->execute(['id_usuario' => $idUsuario]);
$resenhasPublicadas = (int) $stmt->fetch()['total'];

// --- Gêneros explorados (qualquer livro na biblioteca do usuário) ---
$stmt = $pdo->prepare(
    "SELECT COUNT(DISTINCT livro.genero) AS total
     FROM biblioteca_usuario
     INNER JOIN livro ON livro.id_livro = biblioteca_usuario.id_livro
     WHERE biblioteca_usuario.id_usuario = :id_usuario
       AND livro.genero IS NOT NULL AND livro.genero <> ''"
);
$stmt->execute(['id_usuario' => $idUsuario]);
$generosExplorados = (int) $stmt->fetch()['total'];

// --- Gêneros mais lidos (percentual entre os livros com status "lido") ---
$stmt = $pdo->prepare(
    "SELECT livro.genero AS genero, COUNT(*) AS total
     FROM biblioteca_usuario
     INNER JOIN livro ON livro.id_livro = biblioteca_usuario.id_livro
     WHERE biblioteca_usuario.id_usuario = :id_usuario
       AND biblioteca_usuario.status = 'lido'
       AND livro.genero IS NOT NULL AND livro.genero <> ''
     GROUP BY livro.genero
     ORDER BY total DESC"
);
$stmt->execute(['id_usuario' => $idUsuario]);
$generosBrutos = $stmt->fetchAll();

$totalLidosComGenero = array_sum(array_column($generosBrutos, 'total'));
$generosMaisLidos = array_map(function ($linha) use ($totalLidosComGenero) {
    return [
        'genero'     => $linha['genero'],
        'total'      => (int) $linha['total'],
        'percentual' => $totalLidosComGenero > 0
            ? round(($linha['total'] / $totalLidosComGenero) * 100)
            : 0,
    ];
}, $generosBrutos);

// --- Livros concluídos (com a nota que o usuário deu, se resenhou) ---
$stmt = $pdo->prepare(
    "SELECT
        livro.id_livro,
        livro.titulo,
        livro.autor,
        livro.genero,
        livro.imagem_capa,
        livro.paginas,
        resenha.nota
     FROM biblioteca_usuario
     INNER JOIN livro ON livro.id_livro = biblioteca_usuario.id_livro
     LEFT JOIN resenha
        ON resenha.id_livro = livro.id_livro
       AND resenha.id_usuario = biblioteca_usuario.id_usuario
     WHERE biblioteca_usuario.id_usuario = :id_usuario
       AND biblioteca_usuario.status = 'lido'
     ORDER BY biblioteca_usuario.atualizado_em DESC"
);
$stmt->execute(['id_usuario' => $idUsuario]);
$livrosConcluidos = $stmt->fetchAll();

foreach ($livrosConcluidos as &$livro) {
    $livro['paginas'] = $livro['paginas'] !== null ? (int) $livro['paginas'] : null;
    $livro['nota'] = $livro['nota'] !== null ? (int) $livro['nota'] : null;
}

echo json_encode([
    'sucesso' => true,
    'estatisticas' => [
        'livros_lidos'        => (int) $resumoLeitura['livros_lidos'],
        'paginas_lidas'        => (int) $resumoLeitura['paginas_lidas'],
        'resenhas_publicadas'  => $resenhasPublicadas,
        'generos_explorados'   => $generosExplorados,
        'generos_mais_lidos'   => $generosMaisLidos,
        'livros_concluidos'    => $livrosConcluidos,
    ],
]);