<?php
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/verificar_sessao.php';

$sessao = verificarSessao();
$idUsuario = $sessao['id_usuario'];
$pdo = conectarBanco();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // --- Dados do usuário + instituição ---
    $stmt = $pdo->prepare(
        "SELECT
            usuario.id_usuario,
            usuario.nome,
            usuario.email,
            usuario.tipo,
            usuario.foto,
            usuario.bio,
            instituicao.nome AS instituicao
         FROM usuario
         LEFT JOIN instituicao ON instituicao.id_instituicao = usuario.id_instituicao
         WHERE usuario.id_usuario = :id_usuario"
    );
    $stmt->execute(['id_usuario' => $idUsuario]);
    $usuario = $stmt->fetch();

    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Usuário não encontrado.']);
        exit;
    }

    // --- Contadores ---
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) AS total FROM biblioteca_usuario
         WHERE id_usuario = :id_usuario AND status = 'lido'"
    );
    $stmt->execute(['id_usuario' => $idUsuario]);
    $livrosLidos = (int) $stmt->fetch()['total'];

    $stmt = $pdo->prepare('SELECT COUNT(*) AS total FROM resenha WHERE id_usuario = :id_usuario');
    $stmt->execute(['id_usuario' => $idUsuario]);
    $resenhasPublicadas = (int) $stmt->fetch()['total'];

    $stmt = $pdo->prepare(
        "SELECT COUNT(*) AS total FROM curtida
         INNER JOIN resenha ON resenha.id_resenha = curtida.id_resenha
         WHERE resenha.id_usuario = :id_usuario"
    );
    $stmt->execute(['id_usuario' => $idUsuario]);
    $curtidasRecebidas = (int) $stmt->fetch()['total'];

    // --- Gêneros favoritos (entre os livros lidos) ---
    $stmt = $pdo->prepare(
        "SELECT livro.genero AS genero, COUNT(*) AS total
         FROM biblioteca_usuario
         INNER JOIN livro ON livro.id_livro = biblioteca_usuario.id_livro
         WHERE biblioteca_usuario.id_usuario = :id_usuario
           AND biblioteca_usuario.status = 'lido'
           AND livro.genero IS NOT NULL AND livro.genero <> ''
         GROUP BY livro.genero
         ORDER BY total DESC
         LIMIT 5"
    );
    $stmt->execute(['id_usuario' => $idUsuario]);
    $generosBrutos = $stmt->fetchAll();
    $totalGeneros = array_sum(array_column($generosBrutos, 'total'));
    $generosFavoritos = array_map(function ($linha) use ($totalGeneros) {
        return [
            'genero'     => $linha['genero'],
            'percentual' => $totalGeneros > 0 ? round(($linha['total'] / $totalGeneros) * 100) : 0,
        ];
    }, $generosBrutos);

    // --- Resenhas do próprio usuário (mais recentes primeiro) ---
    $stmt = $pdo->prepare(
        "SELECT
            resenha.id_resenha,
            resenha.titulo,
            resenha.nota,
            resenha.texto,
            resenha.data,
            livro.titulo AS livro_titulo,
            livro.imagem_capa
         FROM resenha
         INNER JOIN livro ON livro.id_livro = resenha.id_livro
         WHERE resenha.id_usuario = :id_usuario
         ORDER BY resenha.data DESC
         LIMIT 10"
    );
    $stmt->execute(['id_usuario' => $idUsuario]);
    $minhasResenhas = $stmt->fetchAll();

    echo json_encode([
        'sucesso' => true,
        'usuario' => $usuario,
        'estatisticas' => [
            'livros_lidos'        => $livrosLidos,
            'resenhas_publicadas' => $resenhasPublicadas,
            'curtidas_recebidas'  => $curtidasRecebidas,
            'generos_favoritos'   => $generosFavoritos,
        ],
        'minhas_resenhas' => $minhasResenhas,
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $dados = json_decode(file_get_contents('php://input'), true);
    $nome = trim($dados['nome'] ?? '');
    $bio  = trim($dados['bio'] ?? '');

    if ($nome === '') {
        http_response_code(400);
        echo json_encode(['sucesso' => false, 'mensagem' => 'O nome não pode ficar em branco.']);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE usuario SET nome = :nome, bio = :bio WHERE id_usuario = :id_usuario');
    $stmt->execute(['nome' => $nome, 'bio' => $bio ?: null, 'id_usuario' => $idUsuario]);

    echo json_encode(['sucesso' => true, 'mensagem' => 'Perfil atualizado com sucesso.']);
    exit;
}

http_response_code(405);
echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido.']);