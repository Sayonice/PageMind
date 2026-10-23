<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/verificar_sessao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido.']);
    exit;
}

// Só passa daqui se houver sessão ativa (aluno ou professor).
// Interrompe automaticamente com 401 se não houver.
$sessao = verificarSessao();

$dados = json_decode(file_get_contents('php://input'), true);

$livro   = $dados['livro'] ?? [];
$resenha = $dados['resenha'] ?? [];

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

// --- Validação dos dados da resenha ---
$tituloResenha = trim($resenha['titulo'] ?? '');
$nota          = $resenha['nota'] ?? null;
$texto         = trim($resenha['texto'] ?? '');

if ($tituloResenha === '' || $texto === '' || $nota === null) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Preencha título, nota e texto da resenha.']);
    exit;
}

if (!is_numeric($nota) || $nota < 1 || $nota > 5) {
    http_response_code(400);
    echo json_encode(['sucesso' => false, 'mensagem' => 'A nota deve ser um número entre 1 e 5.']);
    exit;
}

$pdo = conectarBanco();

try {
    $pdo->beginTransaction();

    // --- Busca o livro pelo google_books_id; cria se ainda não existir ---
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

    // --- Cria a resenha vinculada ao usuário logado e ao livro ---
    $stmt = $pdo->prepare(
        'INSERT INTO resenha (titulo, nota, texto, id_usuario, id_livro)
         VALUES (:titulo, :nota, :texto, :id_usuario, :id_livro)'
    );
    $stmt->execute([
        'titulo'     => $tituloResenha,
        'nota'       => $nota,
        'texto'      => $texto,
        'id_usuario' => $sessao['id_usuario'],
        'id_livro'   => $idLivro,
    ]);
    $idResenha = $pdo->lastInsertId();

    // --- Quem resenha um livro, leu ele: marca/atualiza como "lido"
    //     na biblioteca pessoal, com a página atual no final (se soubermos
    //     o total de páginas).
    $stmt = $pdo->prepare(
        'INSERT INTO biblioteca_usuario (id_usuario, id_livro, status, pagina_atual)
         VALUES (:id_usuario, :id_livro, \'lido\', :pagina_atual)
         ON DUPLICATE KEY UPDATE
            status = \'lido\',
            pagina_atual = VALUES(pagina_atual)'
    );
    $stmt->execute([
        'id_usuario'   => $sessao['id_usuario'],
        'id_livro'     => $idLivro,
        'pagina_atual' => $paginasLivro ?: 0,
    ]);

    $pdo->commit();

    http_response_code(201);
    echo json_encode([
        'sucesso'    => true,
        'mensagem'   => 'Resenha publicada com sucesso.',
        'id_resenha' => $idResenha,
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro ao salvar a resenha.']);
}