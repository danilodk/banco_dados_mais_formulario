/**
 * ============================================================================
 * SERVIDOR NODE.JS - GERENCIADOR DE PRODUTOS COM BANCO SQLITE
 * ============================================================================
 * 
 * Descrição: Sistema web completo para gerenciar produtos em banco SQLite.
 * Permite adicionar, listar e excluir produtos através de interface HTML.
 * 
 * Funcionalidades:
 * - Interface web intuitiva e responsiva
 * - Banco de dados SQLite persistente
 * - CRUD completo (Create, Read, Delete)
 * - Tratamento de erros robusto
 * - Saída documentada para análise
 * 
 * Dependencias: http, url, sqlite3
 * Porta: 3000 (configurável via PORT)
 * Arquivo BD: produtos.db
 * 
 * ============================================================================
 */

// ============================================================================
// IMPORTAÇÕES E CONFIGURAÇÕES
// ============================================================================

const http = require('http');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();

// Cria/abre banco de dados SQLite
let db = new sqlite3.Database('produtos.db');

const PORT = process.env.PORT || 3000;

// ============================================================================
// INICIALIZAÇÃO DO BANCO DE DADOS
// ============================================================================

/**
 * Cria tabela 'produtos' se não existir
 * Estrutura: id (PK auto-increment), nome (TEXT), quantidade (INTEGER)
 */
db.serialize(function() {
  db.run(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      quantidade INTEGER NOT NULL
    )
  `, (err) => {
    if (err) console.error('❌ Erro ao criar tabela:', err);
    else console.log('✅ Banco de dados inicializado com sucesso');
  });
});

// ============================================================================
// FUNÇÕES AUXILIARES (HELPER FUNCTIONS)
// ============================================================================

/**
 * Recupera TODOS os produtos do banco
 * @returns {Promise<Array>} Array de produtos
 */
function getAllProducts() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM produtos', (err, rows) => {
      if (err) {
        console.error('❌ Erro ao recuperar:', err);
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
}

/**
 * Insere novo produto
 * @param {string} nome - Nome do produto
 * @param {number} quantidade - Quantidade em estoque
 */
function addProduct(nome, quantidade) {
  return new Promise((resolve, reject) => {
    if (!nome || !quantidade) {
      reject(new Error('Nome e quantidade obrigatórios'));
      return;
    }
    const stmt = db.prepare('INSERT INTO produtos (nome, quantidade) VALUES (?, ?)');
    stmt.run(nome, quantidade, function(err) {
      if (err) reject(err);
      else {
        console.log(`✅ Produto "${nome}" adicionado (ID: ${this.lastID})`);
        resolve();
      }
    });
    stmt.finalize();
  });
}

/**
 * Remove produto do banco
 * @param {number} productId - ID para deletar
 */
function deleteProduct(productId) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('DELETE FROM produtos WHERE id = ?');
    stmt.run(productId, function(err) {
      if (err) reject(err);
      else {
        console.log(`✅ Produto ID ${productId} excluído`);
        resolve();
      }
    });
    stmt.finalize();
  });
}

/**
 * Escapa HTML (protege contra XSS)
 */
function escapeHtml(text) {
  const map = {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'};
  return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
}

// ============================================================================
// GERAÇÃO DO HTML DA PÁGINA
// ============================================================================

/**
 * Gera HTML completo com lista de produtos
 * @param {Array} products - Array de produtos
 * @returns {string} HTML renderizado
 */
function generateHTML(products) {
  const productList = products.map(p => `
    <li class="product-item">
      <div><strong>${escapeHtml(p.nome)}</strong> - Qtd: ${p.quantidade}</div>
      <form action="/excluir_produto" method="post" style="margin:0;">
        <input type="hidden" name="productId" value="${p.id}">
        <button type="submit" class="delete-button">Excluir</button>
      </form>
    </li>
  `).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gerenciador de Produtos</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f2f2f2; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    h1 { color: #333; }
    form { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 3px; min-width: 150px; }
    button[type="submit"] { flex: 0 0 auto; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer; font-weight: bold; }
    button[type="submit"]:hover { background: #45a049; }
    .product-list { list-style: none; padding: 0; }
    .product-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 3px; background: #fafafa; }
    .delete-button { background: #ff6347; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; }
    .delete-button:hover { background: #d84315; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Gerenciador de Produtos</h1>
    
    <h2>Adicionar Novo Produto</h2>
    <form action="/adicionar_produto" method="post">
      <input type="text" name="productName" placeholder="Nome do produto" required>
      <input type="number" name="productQuantity" placeholder="Quantidade" min="1" required>
      <button type="submit">Adicionar</button>
    </form>
    
    <h2>Lista de Produtos (${products.length})</h2>
    ${products.length > 0 ? `<ul class="product-list">${productList}</ul>` : '<p>Nenhum produto cadastrado</p>'}
  </div>
</body>
</html>`;
}

// ============================================================================
// SERVIDOR HTTP - ROTAS
// ============================================================================

const server = http.createServer(async (req, res) => {
  const { pathname } = url.parse(req.url);
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${pathname}`);

  try {
    // ROTA 1: GET / - PÁGINA PRINCIPAL
    if (pathname === '/' && req.method === 'GET') {
      const products = await getAllProducts();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(generateHTML(products));
    }
    
    // ROTA 2: POST /adicionar_produto - ADICIONA NOVO PRODUTO
    else if (pathname === '/adicionar_produto' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', async () => {
        try {
          const params = new URLSearchParams(body);
          const nome = params.get('productName');
          const quantidade = params.get('productQuantity');
          await addProduct(nome, parseInt(quantidade));
          res.writeHead(302, { 'Location': '/' });
          res.end();
        } catch (err) {
          console.error('Erro ao adicionar:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Erro ao adicionar produto');
        }
      });
    }
    
    // ROTA 3: POST /excluir_produto - REMOVE PRODUTO
    else if (pathname === '/excluir_produto' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', async () => {
        try {
          const params = new URLSearchParams(body);
          const productId = params.get('productId');
          await deleteProduct(productId);
          res.writeHead(302, { 'Location': '/' });
          res.end();
        } catch (err) {
          console.error('Erro ao deletar:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Erro ao deletar produto');
        }
      });
    }
    
    // ROTA 4: ERRO 404
    else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Página não encontrada');
    }
  } catch (err) {
    console.error('Erro no servidor:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Erro interno do servidor');
  }
});

// ============================================================================
// INICIALIZAR SERVIDOR
// ============================================================================

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Abra o navegador e acesse a URL acima');
});

server.on('error', (err) => {
  console.error('Erro no servidor:', err);
});
