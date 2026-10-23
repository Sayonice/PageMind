<?php
/**
 * Inclua este arquivo no topo de qualquer rota protegida:
 *   require_once __DIR__ . '/../middleware/verificar_sessao.php';
 *   require_once __DIR__ . '/../middleware/verificar_sessao.php'; verificarSessao('professor');
 */

function verificarSessao(?string $tipoExigido = null): array
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (empty($_SESSION['id_usuario'])) {
        http_response_code(401);
        echo json_encode(['sucesso' => false, 'mensagem' => 'É necessário estar autenticado.']);
        exit;
    }

    if ($tipoExigido !== null && $_SESSION['tipo'] !== $tipoExigido) {
        http_response_code(403);
        echo json_encode(['sucesso' => false, 'mensagem' => 'Acesso restrito a ' . $tipoExigido . '.']);
        exit;
    }

    return $_SESSION;
}
