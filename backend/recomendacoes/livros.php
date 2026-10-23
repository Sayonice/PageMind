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

// --- 1. Descobre os gêneros favoritos da pessoa, a partir dos livros que
// ela já marcou como lidos OU resenhou (um livro contado uma vez só). ---
$stmt = $pdo->prepare(
    "SELECT livro.genero, COUNT(*) AS total
     FROM (
         SELECT id_livro FROM biblioteca_usuario
          WHERE id_usuario = :id_usuario1 AND status = 'lido'
         UNION
         SELECT id_livro FROM resenha WHERE id_usuario = :id_usuario2
     ) AS livros_usuario
     INNER JOIN livro ON livro.id_livro = livros_usuario.id_livro
     WHERE livro.genero IS NOT NULL AND livro.genero <> ''
     GROUP BY livro.genero
     ORDER BY total DESC
     LIMIT 3"
);
$stmt->execute(['id_usuario1' => $idUsuario, 'id_usuario2' => $idUsuario]);
$generosFavoritos = array_column($stmt->fetchAll(), 'genero');

$livros = [];
$baseadoEmGeneros = [];

// --- 2. Busca livros bem avaliados desses gêneros que a pessoa ainda não
// tem na biblioteca (nem como "quero ler", nem "lendo", nem "lido"). ---
if (!empty($generosFavoritos)) {
    $marcadores = implode(',', array_fill(0, count($generosFavoritos), '?'));

    $sql = "SELECT
                livro.id_livro, livro.titulo, livro.autor, livro.genero,
                livro.imagem_capa, livro.paginas,
                COUNT(resenha.id_resenha) AS total_resenhas,
                ROUND(AVG(resenha.nota), 1) AS nota_media
            FROM livro
            INNER JOIN resenha ON resenha.id_livro = livro.id_livro
            WHERE livro.genero IN ($marcadores)
              AND livro.id_livro NOT IN (
                  SELECT id_livro FROM biblioteca_usuario WHERE id_usuario = ?
              )
            GROUP BY livro.id_livro
            ORDER BY nota_media DESC, total_resenhas DESC
            LIMIT 8";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([...$generosFavoritos, $idUsuario]);
    $livros = $stmt->fetchAll();
    $baseadoEmGeneros = $generosFavoritos;
}

// --- 3. Sem gêneros favoritos ainda (conta nova) ou poucos resultados:
// completa com os livros mais bem avaliados da comunidade em geral. ---
if (count($livros) < 4) {
    $idsJaEscolhidos = array_column($livros, 'id_livro');
    $idsJaEscolhidos[] = 0; // evita lista vazia no NOT IN

    $marcadoresExcluir = implode(',', array_fill(0, count($idsJaEscolhidos), '?'));

    $sql = "SELECT
                livro.id_livro, livro.titulo, livro.autor, livro.genero,
                livro.imagem_capa, livro.paginas,
                COUNT(resenha.id_resenha) AS total_resenhas,
                ROUND(AVG(resenha.nota), 1) AS nota_media
            FROM livro
            INNER JOIN resenha ON resenha.id_livro = livro.id_livro
            WHERE livro.id_livro NOT IN ($marcadoresExcluir)
              AND livro.id_livro NOT IN (
                  SELECT id_livro FROM biblioteca_usuario WHERE id_usuario = ?
              )
            GROUP BY livro.id_livro
            ORDER BY nota_media DESC, total_resenhas DESC
            LIMIT " . (8 - count($livros));

    $stmt = $pdo->prepare($sql);
    $stmt->execute([...$idsJaEscolhidos, $idUsuario]);
    $livros = array_merge($livros, $stmt->fetchAll());
}

foreach ($livros as &$livro) {
    $livro['paginas'] = $livro['paginas'] !== null ? (int) $livro['paginas'] : null;
    $livro['total_resenhas'] = (int) $livro['total_resenhas'];
    $livro['nota_media'] = $livro['nota_media'] !== null ? (float) $livro['nota_media'] : null;
}

echo json_encode([
    'sucesso' => true,
    'baseado_em_generos' => $baseadoEmGeneros,
    'livros' => $livros,
]);