<?php
/**
 * Conexão com o banco de dados MySQL via PDO.
 * Ajuste as credenciais conforme o ambiente (local ou AWS EC2).
 */

function conectarBanco(): PDO
{
    $host   = 'localhost';
    $dbname = 'pagemind';
    $user   = 'root';
    $senha  = 'Yuna.135';
    $charset = 'utf8mb4';

    $dsn = "mysql:host={$host};dbname={$dbname};charset={$charset}";

    $opcoes = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        return new PDO($dsn, $user, $senha, $opcoes);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Falha na conexão com o banco de dados.'
        ]);
        exit;
    }
}
