// index.js (versão organizada e corrigida)
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const supabase = require('./supabaseClient');
require('dotenv').config();
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

console.log("▶️  Iniciando API de Gestão de Clientes e Pedidos");

// Teste de conexão ao Supabase
supabase
  .from('clientes')
  .select('*')
  .then(({ data, error }) => {
    if (error) {
      console.log("❌ Erro de conexão ao Supabase:", error);
    } else {
      console.log(`✅ Conexão Supabase OK, ${data.length} clientes encontrados`);
    }
  })
  .catch(err => {
    console.log("❌ Erro de exceção ao conectar no Supabase:", err);
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

// Rota de teste
app.get('/', (req, res) => {
  console.log("🔔 GET / acionada");
  res.send('API de Gestão de Clientes e Pedidos está rodando!');
});

// Login
app.post('/login', async (req, res) => {
  console.log("📩 POST /login acionado");

  const { email, senha } = req.body;
  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.log("❌ Erro ao buscar usuário:", error);
    return res.status(500).json({ error: "Erro interno ao buscar usuário" });
  }

  if (!usuario) {
    return res.status(401).json({ error: 'Email ou senha inválidos' });
  }

  if (!usuario.ativo) {
    return res.status(403).json({ error: 'Usuário desativado. Contate o administrador.' });
  }

  if (usuario.senha !== senha) {
    return res.status(401).json({ error: 'Email ou senha inválidos' });
  }

  const token = jwt.sign(
    { email: usuario.email, role: usuario.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  console.log("✅ Login bem-sucedido");
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

// PEDIDOS
app.get('/pedidos', autenticarToken, async (req, res) => {
  const { data, error } = await supabase.from('pedidos').select('*');
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.post('/pedidos', autenticarToken, async (req, res) => {
  const { cliente_id, itens, valor_total, status, data_entrega } = req.body;
  const { data, error } = await supabase
    .from('pedidos')
    .insert([{ cliente_id, itens, valor_total, status: status || 'pendente', data_entrega }]);
  if (error) return res.status(500).json({ error });
  res.status(201).json(data);
});

// Atualizar status pedido
app.put('/pedidos/:id/status', autenticarToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status é obrigatório' });
  }

  const { data, error } = await supabase
    .from('pedidos')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error });
  res.json({ message: 'Status atualizado com sucesso', pedido: data });
});

// Previsibilidade de entregas
app.get('/entregas', autenticarToken, async (req, res) => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('id, data_entrega, status')
    .order('data_entrega', { ascending: true });

  if (error) return res.status(500).json({ error });

  const entregaPorData = {};

  data.forEach(pedido => {
    const dataStr = new Date(pedido.data_entrega).toLocaleDateString('pt-BR');
    if (!entregaPorData[dataStr]) {
      entregaPorData[dataStr] = { total: 0, entregues: 0, pendentes: 0, pedidos: [] };
    }
    entregaPorData[dataStr].total++;
    entregaPorData[dataStr].pedidos.push(pedido);

    if (pedido.status === 'entregue') {
      entregaPorData[dataStr].entregues++;
    } else {
      entregaPorData[dataStr].pendentes++;
    }
  });

  res.json(entregaPorData);
});

// Gerar PDF de pedido
app.get('/pedidos/:id/pdf', autenticarToken, async (req, res) => {
  const { id } = req.params;

  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .select('*')
    .eq('id', id)
    .single();

  if (pedidoError || !pedido) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }

  const { data: cliente, error: clienteError } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', pedido.cliente_id)
    .single();

  if (clienteError || !cliente) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  const doc = new PDFDocument();
  let chunks = [];

  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => {
    const result = Buffer.concat(chunks);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=pedido-${id}.pdf`);
    res.send(result);
  });

  doc.fontSize(18).text('Resumo do Pedido', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Pedido ID: ${pedido.id}`);
  doc.text(`Status: ${pedido.status}`);
  doc.text(`Data de Entrega: ${new Date(pedido.data_entrega).toLocaleString()}`);
  doc.text(`Valor Total: R$ ${pedido.valor_total}`);
  doc.moveDown();

  doc.fontSize(14).text('Cliente', { underline: true });
  doc.fontSize(12).text(`Nome: ${cliente.nome}`);
  doc.text(`Email: ${cliente.email}`);
  doc.text(`Documento: ${cliente.documento}`);
  doc.moveDown();

  doc.fontSize(14).text('Itens', { underline: true });
  (pedido.itens || []).forEach(item => {
    doc.text(`- ${item.produto} (Qtd: ${item.qtd})`);
  });

  doc.end();
});

// USUÁRIOS
app.post('/usuarios', autenticarToken, async (req, res) => {
  const { email, senha, role } = req.body;

  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  if (!email || !senha || !role) {
    return res.status(400).json({ error: 'Email, senha e role são obrigatórios.' });
  }

  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ email, senha, role }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Usuário criado com sucesso', usuario: data });
});

app.get('/usuarios', autenticarToken, async (req, res) => {
  if (req.usuario.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }

  const { data, error } = await supabase
    .from('usuarios')
    .select('id, email, role, ativo')
    .eq('ativo', true);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
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

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Usuário desativado com sucesso', usuario: data });
});

// Rota para buscar produtos (por nome ou código)
app.get('/produtos', autenticarToken, async (req, res) => {
  const { busca } = req.query; // ?busca=camisa ou ?busca=12345

  let query = supabase.from('produtos').select('*');

  if (busca) {
    query = query.or(`nome.ilike.%${busca}%,codigo.ilike.%${busca}%`);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error });
  }

  res.json(data);
});

app.post('/itens-pedido', async (req, res) => {
  const { pedido_id, produto_id, quantidade, preco_unitario } = req.body;
  const { data, error } = await supabase
    .from('itens_pedido')
    .insert([{ pedido_id, produto_id, quantidade, preco_unitario }]);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.get('/itens-pedido/:pedidoId', async (req, res) => {
  const { pedidoId } = req.params;
  const { data, error } = await supabase
    .from('itens_pedido')
    .select('*')
    .eq('pedido_id', pedidoId);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post('/pedidos/:pedidoId/atualizar-total', async (req, res) => {
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

// -------------------- Subir Servidor --------------------
const PORT = process.env.PORT || 3000;
console.log("⏳ Tentando iniciar servidor na porta", PORT);
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
