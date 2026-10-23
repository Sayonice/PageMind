<?php
require_once __DIR__ . '/../config/cors.php';

session_start();
$_SESSION = [];
session_destroy();

echo json_encode(['sucesso' => true, 'mensagem' => 'Sessão encerrada.']);
