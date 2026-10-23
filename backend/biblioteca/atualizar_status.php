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

$livro = $dados['livro'] ?? [];
$status = $dados['status'] ?? '';
$paginaAtual = $dados['pagina_atual'] ?? 0;

$statusValidos = ['quero_ler', 'lendo', 'lido'];

// --- Validação dos dados do livro (vindos da Google Books API) ---
$googleBooksId = trim($livro['google_books_id'] ?? '');
$tituloLivro   = trim($livro['titulo'] ?? '');
$autorLivro    = trim($livro['autor'] ?? '');
$generoLivro   = trim($livro['genero'] ?? '');
$imagemCapa    = trim($livro['imagem_capa'] ?? '');
$paginasLivro  = $livro['paginas'] ?? null;

if ($googleBooksId === '' || $tituloLivro === '') {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Selecione um livro válido antes de continuar.']);
    exit;
}

if (!in_array($status, $statusValidos, true)) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Status inválido.']);
    exit;
}

$pdo = conectarBanco();

try {
    $pdo->beginTransaction();

    // --- Encontra ou cria o livro (mesmo padrão de resenhas/criar.php) ---
    $stmt = $pdo->prepare('SELECT id_livro FROM livro WHERE google_books_id = :gid');
    $stmt->execute(['gid' => $googleBooksId]);
    $livroExistente = $stmt->fetch();

    if ($livroExistente) {
        $idLivro = $livroExistente['id_livro'];
    } else {
        $stmt = $pdo->prepare(
            'INSERT INTO livro (google_books_id, titulo, autor, genero, imagem_capa, paginas)
             VALUES (:gid, :titulo, :autor, :genero, :capa, :paginas)'
        );
        $stmt->execute([
            'gid'     => $googleBooksId,
            'titulo'  => $tituloLivro,
            'autor'   => $autorLivro ?: null,
            'genero'  => $generoLivro ?: null,
            'capa'    => $imagemCapa ?: null,
            'paginas' => $paginasLivro ?: null,
        ]);
        $idLivro = $pdo->lastInsertId();
    }

    // --- Insere ou atualiza a entrada na biblioteca do usuário ---
    $stmt = $pdo->prepare(
        'INSERT INTO biblioteca_usuario (id_usuario, id_livro, status, pagina_atual)
         VALUES (:id_usuario, :id_livro, :status, :pagina_atual)
         ON DUPLICATE KEY UPDATE
            status = VALUES(status),
            pagina_atual = VALUES(pagina_atual)'
    );
    $stmt->execute([
        'id_usuario'    => $sessao['id_usuario'],
        'id_livro'      => $idLivro,
        'status'        => $status,
        'pagina_atual'  => $paginaAtual,
    ]);

    $pdo->commit();

    echo json_encode(['sucesso' => true]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao atualizar sua biblioteca.']);
}