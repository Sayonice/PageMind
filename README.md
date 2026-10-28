# PageMind

## O que instalar (uma vez só)

Precisa de PHP 8+ e Node.js instalados!!

1. PHP 8 ou mais novo: https://windows.php.net/download
2. Node.js (versão LTS): https://nodejs.org

## Escolha onde fica o banco de dados

### Opção A: banco na nuvem 

1. Na pasta `backend`, apague o arquivo `config.php` se ele existir.
2. Copie o arquivo `config.nuvem.php` enviado pelo aluno para dentro da pasta `backend` e
   renomeie a cópia para `config.php`.
3. Coloque também o arquivo `ca.pem` na pasta `backend` (já vem no projeto).

### Opção B: banco no próprio computador

1. Instale o **MySQL Server** e o **MySQL Workbench**: https://dev.mysql.com/downloads/installer
2. No Workbench, abra **Server > Data Import**, escolha **Import from Self-Contained File**,
   selecione `database/pagemind.sql` e clique em **Start Import**.
3. Na pasta `backend`, copie `config.local.php` e renomeie a cópia para `config.php`.
4. Abra o `config.php` e coloque a senha do seu MySQL em `'senha'`.

## Abrir o sistema

Terminal 1 (backend):
cd backend
php -S localhost:8000

Terminal 2 (frontend):
cd frontend
npm run dev