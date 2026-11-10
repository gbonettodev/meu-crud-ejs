-- Execute no banco meu_banco_db se o SQL inicial já tiver sido executado.
-- Atualiza somente o hash do usuário inicial do projeto.
UPDATE usuarios
SET senha = '$2b$10$3nB7LvE84f5OYbKTJDqdKuxbDRDur1FB7AdYX9uHf0dxqRbV9TxGO'
WHERE email = 'admin@email.com';
