// index.js (versão com debug completo)
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const supabase = require('./supabaseClient');

console.log("▶️  Cheguei no topo do index.js");

// Teste de conexão ao Supabase
supabase
  .from('clientes')
  .select('*')
  .then(({ data, error }) => {
    if (error) {
      console.log("❌ Erro de conexão ao Supabase:", error);
    } else {
      console.log("✅ Conexão Supabase OK, registros de clientes encontrados:", data.length);
    }
  })
  .catch(err => {
    console.log("❌ Exceção ao conectar no Supabase:", err);
  });

const app = express();
app.use(cors());
app.use(express.json());

console.log("🛠️  Configurações do Express aplicadas");

// Rota de teste
app.get('/', (req, res) => {
  console.log("🔔 Rota GET / acionada");
  res.send('API de Gestão de Clientes e Pedidos está rodando!');
});

// Rota para criar cliente
app.post('/clientes', async (req, res) => {
  console.log("🔔 Rota POST /clientes acionada", req.body);
  const { nome, documento, email } = req.body;
  try {
    const { data, error } = await supabase
      .from('clientes')
      .insert([{ nome, documento, email }]);

    if (error) {
      console.log("❌ Erro ao inserir cliente:", error);
      return res.status(500).json({ error });
    }
    console.log("✅ Cliente inserido com sucesso:", data);
    res.status(201).json(data);
  } catch (err) {
    console.log("❌ Exceção ao processar POST /clientes:", err);
    res.status(500).json({ error: err.message });
  }
});


// Rota para criar pedido
app.post('/pedidos', async (req, res) => {
  console.log("🔔 Rota POST /pedidos acionada", req.body);
  const { cliente_id, itens, valor_total, status, data_entrega } = req.body;

  try {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([{
        cliente_id,
        itens,
        valor_total,
        status: status || 'pendente',
        data_entrega
      }]);

    if (error) {
      console.log("❌ Erro ao inserir pedido:", error);
      return res.status(500).json({ error });
    }
    console.log("✅ Pedido inserido com sucesso:", data);
    res.status(201).json(data);
  } catch (err) {
    console.log("❌ Exceção ao processar POST /pedidos:", err);
    res.status(500).json({ error: err.message });
  }
});

// Rota para listar todos os pedidos
app.get('/pedidos', async (req, res) => {
  console.log("🔔 Rota GET /pedidos acionada");
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*');

    if (error) {
      console.log("❌ Erro ao listar pedidos:", error);
      return res.status(500).json({ error });
    }
    console.log("✅ Pedidos listados:", data.length);
    res.json(data);
  } catch (err) {
    console.log("❌ Exceção ao processar GET /pedidos:", err);
    res.status(500).json({ error: err.message });
  }
});

// (Opcional) Rota para listar pedidos de um cliente
app.get('/clientes/:id/pedidos', async (req, res) => {
  const cliente_id = req.params.id;
  console.log(`🔔 Rota GET /clientes/${cliente_id}/pedidos acionada`);
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('cliente_id', cliente_id);

    if (error) {
      console.log("❌ Erro ao listar pedidos por cliente:", error);
      return res.status(500).json({ error });
    }
    console.log(`✅ Pedidos do cliente ${cliente_id}:`, data.length);
    res.json(data);
  } catch (err) {
    console.log("❌ Exceção ao processar GET /clientes/:id/pedidos:", err);
    res.status(500).json({ error: err.message });
  }
});
// Rota para listar pedidos de um cliente específico
app.get('/pedidos/cliente/:cliente_id', async (req, res) => {
  const { cliente_id } = req.params;

  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('cliente_id', cliente_id);

  if (error) return res.status(500).json({ error });
  res.json(data);
});

// Atualizar status do pedido
app.put('/pedidos/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const { data, error } = await supabase
    .from('pedidos')
    .update({ status })
    .eq('id', id);

  if (error) return res.status(500).json({ error });
  res.json(data);
});

const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

app.get('/pedidos/:id/pdf', async (req, res) => {
  const { id } = req.params;

  // Buscar o pedido
  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .select('*')
    .eq('id', id)
    .single();

  if (pedidoError || !pedido) {
    return res.status(404).json({ error: 'Pedido não encontrado' });
  }

  // Buscar o cliente
  const { data: cliente, error: clienteError } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', pedido.cliente_id)
    .single();

  if (clienteError || !cliente) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  // Criar PDF
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
  (pedido.itens || []).forEach((item, i) => {
    doc.text(`- ${item.produto} (Qtd: ${item.qtd})`);
  });

  doc.end();
});

// Rota para previsibilidade de entregas por dia
app.get('/entregas', async (req, res) => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('id, data_entrega, status')
    .order('data_entrega', { ascending: true });

  if (error) return res.status(500).json({ error });

  // Agrupar por data de entrega
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

// Rota para atualizar status do pedido
app.put('/pedidos/:id/status', async (req, res) => {
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


// Novo login conectado ao Supabase
// Login usando JWT
app.post('/login', async (req, res) => {
  console.log("📩 entrou na rota login:");
  const { email, senha } = req.body;

  console.log("📩 Login recebido:", { email, senha });

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*') // Seleciona tudo pra evitar campo faltando
    .eq('email', email)
    .single();

  console.log("📦 Resultado do Supabase:", usuario);
  if (error) {
    console.log("❌ Erro do Supabase:", error);
  }

  if (!usuario) {
    return res.status(401).json({ error: 'Email ou senha inválidos (usuário não encontrado)' });
  }

  console.log("🔐 Comparando senhas...");
  console.log("→ Digitada:", senha);
  console.log("→ No banco:", usuario.senha);

  if (usuario.senha !== senha) {
    console.log("❌ Senhas não batem!");
    return res.status(401).json({ error: 'Email ou senha inválidos (senha incorreta)' });
  }

  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { email: usuario.email, role: usuario.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  console.log("✅ Login bem-sucedido!");
  res.json({ token, role: usuario.role });
});

// Middleware para verificar JWT
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Espera "Bearer TOKEN"

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) return res.sendStatus(403); // Token inválido
    req.usuario = usuario;
    next();
  });
}

app.get('/clientes', autenticarToken, async (req, res) => {
  const { data, error } = await supabase.from('clientes').select('*');
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// Rota para criar novo usuário
app.post('/usuarios', autenticarToken, async (req, res) => {
  const { email, senha, role } = req.body;

  console.log("🔵 Tentativa de criação de usuário:", req.usuario, email, senha, role);

  if (req.usuario.role !== 'admin') {
    console.log("⛔ Acesso negado: não é admin");
    return res.status(403).json({ error: 'Acesso negado. Somente administradores podem criar usuários.' });
  }

  if (!email || !senha || !role) {
    console.log("⛔ Campos obrigatórios faltando");
    return res.status(400).json({ error: 'Email, senha e role são obrigatórios.' });
  }

  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ email, senha, role }]);

  if (error) {
    console.log("❌ Erro ao cadastrar usuário:", error);
    return res.status(500).json({ error: error.message });
  }

  console.log("✅ Usuário criado com sucesso:", data);
  res.status(201).json({ message: 'Usuário criado com sucesso', usuario: data });
});


const PORT = process.env.PORT || 3000;
console.log("⏳ Tentando iniciar servidor na porta", PORT);
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
