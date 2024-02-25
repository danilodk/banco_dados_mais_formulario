const http = require('http');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();

// Cria ou abre o banco de dados SQLite em um arquivo
let db = new sqlite3.Database('produtos.db');

// Verifica se a tabela 'produtos' já existe no banco de dados
db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS produtos (id INTEGER PRIMARY KEY, nome TEXT, quantidade INTEGER)");
});

// Função para obter todos os produtos do banco de dados
function getAllProducts() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM produtos", (err, rows) => {
            if (err) {
                console.error('Erro ao recuperar os produtos:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Cria um servidor HTTP
const server = http.createServer((req, res) => {
    const { pathname } = url.parse(req.url);

    // Rota para a página inicial (exibe o formulário e lista de produtos)
    if (pathname === '/') {
        // Obter todos os produtos do banco de dados
        getAllProducts()
            .then((products) => {
                let productListHTML = '';
                products.forEach(product => {
                    productListHTML += `
                        <li class="product-item">
                            <span>${product.nome} - Quantidade: ${product.quantidade}</span>
                            <form action="/excluir_produto" method="post">
                                <input type="hidden" name="productId" value="${product.id}">
                                <button type="submit" class="delete-button">Excluir</button>
                            </form>
                        </li>
                    `;
                });

                // Exibir a página inicial com o formulário e lista de produtos
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Formulário de Produtos</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 0;
                                padding: 0;
                                background-color: #f2f2f2;
                            }
                            .container {
                                max-width: 600px;
                                margin: 50px auto;
                                padding: 20px;
                                background-color: #fff;
                                border: 1px solid #ccc;
                                border-radius: 5px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            }
                            h1 {
                                font-size: 24px;
                            }
                            form {
                                margin-bottom: 20px;
                                display: flex;
                                flex-direction: row;
                            }
                            label {
                                flex: 1;
                            }
                            input[type="text"],
                            input[type="number"] {
                                flex: 2;
                                margin-right: 10px;
                                padding: 5px;
                            }
                            button[type="submit"] {
                                flex: 1;
                                padding: 10px;
                                border: none;
                                background-color: #4CAF50;
                                color: white;
                                cursor: pointer;
                            }
                            button[type="submit"]:hover {
                                background-color: #45a049;
                            }
                            .product-list {
                                list-style-type: none;
                                padding: 0;
                            }
                            .product-item {
                                margin-bottom: 10px;
                                padding: 10px;
                                border: 1px solid #ccc;
                                border-radius: 5px;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                            }
                            .delete-button {
                                background-color: #ff6347;
                                color: #fff;
                                border: none;
                                padding: 5px 10px;
                                border-radius: 3px;
                                cursor: pointer;
                            }
                            .delete-button:hover {
                                background-color: #d84315;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Formulário de Produtos</h1>
                            <form action="/adicionar_produto" method="post">
                                <label for="productName">Nome:</label>
                                <input type="text" id="productName" name="productName">
                                <label for="productQuantity">Quantidade:</label>
                                <input type="number" id="productQuantity" name="productQuantity">
                                <button type="submit">Adicionar Produto</button>
                            </form>
                            <h2>Lista de Produtos</h2>
                            <ul class="product-list">${productListHTML}</ul>
                        </div>
                    </body>
                    </html>
                `);
            })
            .catch((err) => {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Erro interno do servidor');
            });
    }

    // Rota para adicionar produto (processa os dados do formulário e insere no banco de dados)
    else if (pathname === '/adicionar_produto' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const formData = new URLSearchParams(body);
            const productName = formData.get('productName');
            const productQuantity = formData.get('productQuantity');

            // Insere os dados do produto no banco de dados
            const stmt = db.prepare("INSERT INTO produtos (nome, quantidade) VALUES (?, ?)");
            stmt.run(productName, productQuantity);
            stmt.finalize();

            // Redireciona o cliente de volta para a página inicial
            res.writeHead(302, {'Location': '/'});
            res.end();
        });
    }

    // Rota para excluir produto (processa os dados do formulário e exclui do banco de dados)
    else if (pathname === '/excluir_produto' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const formData = new URLSearchParams(body);
            const productId = formData.get('productId');

            // Exclui o produto do banco de dados
            const stmt = db.prepare("DELETE FROM produtos WHERE id = ?");
            stmt.run(productId);
            stmt.finalize();

            // Redireciona o cliente de volta para a página inicial
            res.writeHead(302, {'Location': '/'});
            res.end();
        });
    }

    // Rota para lidar com outras requisições
    else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Página não encontrada');
    }
});

// Define a porta onde o servidor irá escutar
const PORT = process.env.PORT || 3000;

// Inicia o servidor
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
