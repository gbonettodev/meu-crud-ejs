import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from './db.js';
import { verificarAutenticacao } from './middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'chave-local-de-desenvolvimento-troque-no-env',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60,
  },
}));

app.get('/', (req, res) => {
  res.redirect(req.session.usuario ? '/produtos' : '/login');
});

app.get('/login', (req, res) => {
  if (req.session.usuario) return res.redirect('/produtos');
  res.render('login', { erro: null, email: '' });
});

app.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const senha = String(req.body.senha || '');

  try {
    const resultado = await pool.query(
      'SELECT id, nome, email, senha FROM usuarios WHERE email = $1',
      [email],
    );

    const usuario = resultado.rows[0];
    const senhaValida = usuario && await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).render('login', {
        erro: 'E-mail ou senha não conferem. Confira os dados e tente novamente.',
        email,
      });
    }

    req.session.usuario = { id: usuario.id, nome: usuario.nome, email: usuario.email };
    return req.session.save((error) => {
      if (error) {
        console.error('Não foi possível iniciar a sessão:', error.message);
        return res.status(500).render('login', {
          erro: 'Não foi possível iniciar sua sessão. Tente novamente.', email,
        });
      }
      res.redirect('/produtos');
    });
  } catch (error) {
    console.error('Erro ao realizar login:', error.message);
    return res.status(500).render('login', {
      erro: 'Não foi possível conectar ao banco de dados. Confira a configuração do PostgreSQL.',
      email,
    });
  }
});

app.post('/logout', verificarAutenticacao, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

app.get('/produtos', verificarAutenticacao, async (req, res) => {
  const busca = String(req.query.busca || '').trim();
  try {
    const resultado = await pool.query(
      `SELECT id, nome_produto, peso, preco
       FROM produtos
       WHERE nome_produto ILIKE $1
       ORDER BY id DESC`,
      [`%${busca}%`],
    );
    res.render('produtos', {
      produtos: resultado.rows,
      usuario: req.session.usuario,
      busca,
      erro: null,
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error.message);
    res.status(500).render('produtos', {
      produtos: [], usuario: req.session.usuario, busca,
      erro: 'Não foi possível carregar os produtos. Confira sua conexão com o banco.',
    });
  }
});

app.get('/produtos/novo', verificarAutenticacao, (req, res) => {
  res.render('novo-produto', {
    usuario: req.session.usuario,
    erro: null,
    produto: { nome_produto: '', peso: '', preco: '' },
  });
});

app.post('/produtos/novo', verificarAutenticacao, async (req, res) => {
  const produto = lerProduto(req.body);
  const erro = validarProduto(produto);
  if (erro) return res.status(400).render('novo-produto', { usuario: req.session.usuario, erro, produto });

  try {
    await pool.query(
      'INSERT INTO produtos (nome_produto, peso, preco) VALUES ($1, $2, $3)',
      [produto.nome_produto, produto.peso, produto.preco],
    );
    res.redirect('/produtos');
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error.message);
    res.status(500).render('novo-produto', {
      usuario: req.session.usuario, erro: 'Não foi possível salvar. Tente novamente.', produto,
    });
  }
});

app.get('/produtos/editar/:id', verificarAutenticacao, async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM produtos WHERE id = $1', [req.params.id]);
    if (resultado.rowCount === 0) return res.status(404).render('404');
    res.render('editar-produto', {
      usuario: req.session.usuario, erro: null, produto: resultado.rows[0],
    });
  } catch (error) {
    console.error('Erro ao abrir produto:', error.message);
    res.status(500).render('erro', { mensagem: 'Não foi possível abrir este produto.' });
  }
});

app.post('/produtos/editar/:id', verificarAutenticacao, async (req, res) => {
  const produto = { ...lerProduto(req.body), id: req.params.id };
  const erro = validarProduto(produto);
  if (erro) return res.status(400).render('editar-produto', { usuario: req.session.usuario, erro, produto });

  try {
    const resultado = await pool.query(
      `UPDATE produtos
       SET nome_produto = $1, peso = $2, preco = $3
       WHERE id = $4`,
      [produto.nome_produto, produto.peso, produto.preco, produto.id],
    );
    if (resultado.rowCount === 0) return res.status(404).render('404');
    res.redirect('/produtos');
  } catch (error) {
    console.error('Erro ao editar produto:', error.message);
    res.status(500).render('editar-produto', {
      usuario: req.session.usuario, erro: 'Não foi possível atualizar. Tente novamente.', produto,
    });
  }
});

app.post('/produtos/deletar/:id', verificarAutenticacao, async (req, res) => {
  try {
    await pool.query('DELETE FROM produtos WHERE id = $1', [req.params.id]);
    res.redirect('/produtos');
  } catch (error) {
    console.error('Erro ao excluir produto:', error.message);
    res.status(500).render('erro', { mensagem: 'Não foi possível excluir este produto.' });
  }
});

app.use((req, res) => res.status(404).render('404'));
app.use((error, req, res, next) => {
  console.error('Erro inesperado:', error.message);
  res.status(500).render('erro', { mensagem: 'Ocorreu um erro inesperado. Tente novamente.' });
});

app.listen(port, () => {
  console.log(`Projeto disponível em http://localhost:${port}`);
});

function lerProduto(body) {
  return {
    nome_produto: String(body.nome_produto || '').trim(),
    peso: String(body.peso || '').trim(),
    preco: String(body.preco || '').trim(),
  };
}

function validarProduto(produto) {
  if (!produto.nome_produto) return 'Informe o nome do produto.';
  if (produto.nome_produto.length > 100) return 'O nome deve ter no máximo 100 caracteres.';
  if (!Number.isFinite(Number(produto.peso)) || Number(produto.peso) < 0) return 'Informe um peso válido, igual ou maior que zero.';
  if (!Number.isFinite(Number(produto.preco)) || Number(produto.preco) < 0) return 'Informe um preço válido, igual ou maior que zero.';
  return null;
}
