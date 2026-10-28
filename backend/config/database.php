<?php

function conectarBanco(): PDO
{
    $arquivoConfig = __DIR__ . '/config.php';

    if (!file_exists($arquivoConfig)) {
        http_response_code(500);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Arquivo config.php não encontrado. Copie config.local.php ou config.nuvem.php para config.php.'
        ]);
        exit;
    }

    $config = require $arquivoConfig;

    $dsn = "mysql:host={$config['host']};port={$config['porta']};dbname={$config['banco']};charset=utf8mb4";

    $opcoes = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    if (!empty($config['ssl_ca'])) {
        $opcoes[PDO::MYSQL_ATTR_SSL_CA] = $config['ssl_ca'];
    }

    try {
        return new PDO($dsn, $config['usuario'], $config['senha'], $opcoes);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Falha na conexão com o banco de dados.'
        ]);
        exit;
    }
}