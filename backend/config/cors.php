<?php
/**
 * Cabeçalhos padrão para as rotas da API.
 *
 * Access-Control-Allow-Origin precisa ser um domínio específico (não "*")
 * quando Access-Control-Allow-Credentials está ativado — é isso que permite
 * o navegador enviar/receber o cookie de sessão do PHP entre localhost:5173
 * (React) e localhost:8000 (PHP). Ajuste a origem quando for para produção.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}