-- Execute este arquivo no banco meu_banco_db pelo pgAdmin.

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  nome_produto VARCHAR(100) NOT NULL,
  peso NUMERIC(10, 2) NOT NULL CHECK (peso >= 0),
  preco NUMERIC(10, 2) NOT NULL CHECK (preco >= 0)
);

-- A senha inicial é 123456, armazenada como hash bcrypt conforme o guia.
-- Altere a senha depois do primeiro acesso.
INSERT INTO usuarios (nome, email, senha)
VALUES (
  'Administrador',
  'admin@email.com',
  '$2b$10$3nB7LvE84f5OYbKTJDqdKuxbDRDur1FB7AdYX9uHf0dxqRbV9TxGO'
)
ON CONFLICT (email) DO NOTHING;
