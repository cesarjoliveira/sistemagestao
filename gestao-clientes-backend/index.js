const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const supabase = require('./supabaseClient');
require('dotenv').config();
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

console.log("▶️  Iniciando API de Gestão de Clientes e Pedidos");

const app = express();
app.use(cors());
app.use(express.json());

// -------------------- Middleware de Autenticação --------------------
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) return res.sendStatus(403);
    req.usuario = usuario;
    next();
  });
}

// -------------------- Rotas Públicas --------------------

// Teste
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
    return res.status(403).json({ error: 'Usuário desativado' });
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
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/clientes', autenticarToken, async (req, res) => {
  const { nome, documento, email } = req.body;

  if (!nome || !documento || !email) {
    return res.status(400).json({ error: 'Nome, documento e email são obrigatórios.' });
  }

  // Verificar se já existe cliente com mesmo documento
  const { data: clienteDoc, error: errorDoc } = await supabase
    .from('clientes')
    .select('*')
    .eq('documento', documento)
    .maybeSingle();

  if (errorDoc) {
    return res.status(500).json({ error: 'Erro ao buscar documento existente.' });
  }

  if (clienteDoc) {
    return res.status(409).json({ error: 'Documento já cadastrado.' });
  }

  // Verificar se já existe cliente com mesmo email
  const { data: clienteEmail, error: errorEmail } = await supabase
    .from('clientes')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (errorEmail) {
    return res.status(500).json({ error: 'Erro ao buscar email existente.' });
  }

  if (clienteEmail) {
    return res.status(409).json({ error: 'Email já cadastrado.' });
  }

  // Inserir novo cliente
  const { data, error } = await supabase
    .from('clientes')
    .insert([{ nome, documento, email }])
    .select('*');

  if (error) {
    return res.status(500).json({ error: 'Erro ao cadastrar cliente.' });
  }

  res.status(201).json(data[0]);
});


// 🔥 Atualizar cliente (parcial)
app.put('/clientes/:id', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { nome, documento, email } = req.body;

  const { data, error } = await supabase
    .from('clientes')
    .update({ nome, documento, email })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "Cliente atualizado com sucesso", cliente: data });
});

// ENDEREÇOS
app.get('/enderecos/:clienteId', autenticarToken, async (req, res) => {
  const { clienteId } = req.params;
  const { data, error } = await supabase
    .from('enderecos')
    .select('*')
    .eq('cliente_id', clienteId);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/enderecos', autenticarToken, async (req, res) => {
  const { cliente_id, rua, numero, bairro, cidade, estado, cep, complemento } = req.body;
  const { data, error } = await supabase
    .from('enderecos')
    .insert([{ cliente_id, rua, numero, bairro, cidade, estado, cep, complemento }]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PEDIDOS
app.get('/pedidos', autenticarToken, async (req, res) => {
  const { data, error } = await supabase.from('pedidos').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/pedidos', autenticarToken, async (req, res) => {
  const { cliente_id, status, data_entrega } = req.body;
  const { data, error } = await supabase
    .from('pedidos')
    .insert([{ cliente_id, status: status || 'pendente', data_entrega }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

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

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Status atualizado com sucesso', pedido: data });
});

// ITENS PEDIDO
app.post('/itens-pedido', autenticarToken, async (req, res) => {
  const { pedido_id, produto_id, quantidade, preco_unitario } = req.body;
  const { data, error } = await supabase
    .from('itens_pedido')
    .insert([{ pedido_id, produto_id, quantidade, preco_unitario }]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
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

app.post('/pedidos/:pedidoId/atualizar-total', autenticarToken, async (req, res) => {
  const { pedidoId } = req.params;

  const { data: itens, error: errorItens } = await supabase
    .from('itens_pedido')
    .select('quantidade, preco_unitario')
    .eq('pedido_id', pedidoId);

  if (errorItens) return res.status(400).json({ error: errorItens.message });

  const valorTotal = itens.reduce((total, item) => {
    return total + item.quantidade * parseFloat(item.preco_unitario);
  }, 0);

  const { error: errorUpdate } = await supabase
    .from('pedidos')
    .update({ valor_total: valorTotal })
    .eq('id', pedidoId);

  if (errorUpdate) return res.status(400).json({ error: errorUpdate.message });

  res.json({ valor_total: valorTotal });
});

// PRODUTOS
app.get('/produtos', autenticarToken, async (req, res) => {
  const { busca } = req.query;

  let query = supabase.from('produtos').select('*');

  if (busca) {
    query = query.or(`nome.ilike.%${busca}%,codigo.ilike.%${busca}%`);
  }

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// -------------------- Subir Servidor --------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
