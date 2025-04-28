// index.js (versão atualizada)
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const supabase = require('./supabaseClient');
require('dotenv').config();
const PDFDocument = require('pdfkit');

console.log("▶️  Iniciando API de Gestão de Clientes e Pedidos");

supabase
  .from('clientes')
  .select('*')
  .then(({ data, error }) => {
    if (error) {
      console.error("❌ Erro de conexão ao Supabase:", error);
    } else {
      console.log(`✅ Conexão Supabase OK, ${data.length} clientes encontrados`);
    }
  })
  .catch(err => {
    console.error("❌ Erro de exceção ao conectar no Supabase:", err);
  });

const app = express();
app.use(cors());
app.use(express.json());

console.log("🛠️  Middlewares aplicados (CORS, JSON)");

// -------------------- Middleware de Autenticação --------------------
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); // Sem token

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) return res.sendStatus(403); // Token inválido
    req.usuario = usuario;
    next();
  });
}

// -------------------- Rotas Públicas --------------------
app.get('/', (req, res) => {
  res.send('API de Gestão de Clientes e Pedidos está rodando!');
});

// Login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return res.status(500).json({ error: "Erro interno ao buscar usuário" });

  if (!usuario || usuario.senha !== senha) {
    return res.status(401).json({ error: 'Email ou senha inválidos' });
  }

  if (!usuario.ativo) {
    return res.status(403).json({ error: 'Usuário desativado.' });
  }

  const token = jwt.sign(
    { email: usuario.email, role: usuario.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, role: usuario.role });
});

// -------------------- Rotas Protegidas --------------------

// CLIENTES
app.get('/clientes', autenticarToken, async (req, res) => {
  const { data, error } = await supabase.from('clientes').select('*');
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.post('/clientes', autenticarToken, async (req, res) => {
  const { nome, documento, email } = req.body;
  const { data, error } = await supabase
    .from('clientes')
    .insert([{ nome, documento, email }]);
  if (error) return res.status(500).json({ error });
  res.status(201).json(data);
});

// PRODUTOS
app.get('/produtos', autenticarToken, async (req, res) => {
  const { busca } = req.query;
  let query = supabase.from('produtos').select('*');

  if (busca) {
    query = query.or(`nome.ilike.%${busca}%,codigo.ilike.%${busca}%`);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// PEDIDOS
app.get('/pedidos', autenticarToken, async (req, res) => {
  const { data, error } = await supabase.rpc('buscar_pedidos_com_total');
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.post('/pedidos', autenticarToken, async (req, res) => {
  const { cliente_id, status, data_entrega } = req.body;

  const { data, error } = await supabase
    .from('pedidos')
    .insert([{ 
      cliente_id, 
      status: status || 'pendente', 
      data_entrega 
    }])
    .select();

  if (error) return res.status(500).json({ error });
  res.status(201).json(data[0]);
});

// Atualizar status do pedido
app.put('/pedidos/:id/status', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: 'Status é obrigatório' });

  const { data, error } = await supabase
    .from('pedidos')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error });
  res.json({ message: 'Status atualizado com sucesso', pedido: data });
});

// ITENS DO PEDIDO
app.post('/itens-pedido', autenticarToken, async (req, res) => {
  const { pedido_id, produto_id, quantidade, preco_unitario } = req.body;
  const { data, error } = await supabase
    .from('itens_pedido')
    .insert([{ pedido_id, produto_id, quantidade, preco_unitario }]);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.get('/itens-pedido/:pedidoId', autenticarToken, async (req, res) => {
  const { pedidoId } = req.params;
  const { data, error } = await supabase
    .from('itens_pedido')
    .select('*')
    .eq('pedido_id', pedidoId);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// USUÁRIOS
app.get('/usuarios', autenticarToken, async (req, res) => {
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const { data, error } = await supabase
    .from('usuarios')
    .select('id, email, role, ativo')
    .eq('ativo', true);

  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.post('/usuarios', autenticarToken, async (req, res) => {
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const { email, senha, role } = req.body;
  if (!email || !senha || !role) {
    return res.status(400).json({ error: 'Email, senha e role são obrigatórios.' });
  }

  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ email, senha, role }]);

  if (error) return res.status(500).json({ error });
  res.status(201).json({ message: 'Usuário criado com sucesso', usuario: data });
});

app.put('/usuarios/:id/desativar', autenticarToken, async (req, res) => {
  const { id } = req.params;

  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const { data, error } = await supabase
    .from('usuarios')
    .update({ ativo: false })
    .eq('id', id);

  if (error) return res.status(500).json({ error });
  res.json({ message: 'Usuário desativado com sucesso', usuario: data });
});

// -------------------- Subir Servidor --------------------
const PORT = process.env.PORT || 3000;
console.log("⏳ Tentando iniciar servidor na porta", PORT);
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
