# 📄 Gerenciador de Produtos - Banco SQLite + Formulario HTML

[![Node.js](https://img.shields.io/badge/node.js-v14%2B-green.svg)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/database-SQLite3-blue.svg)](https://www.sqlite.org/)
[![License MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status Active](https://img.shields.io/badge/status-Active-success.svg)](#)

> Sistema web completo para gerenciar produtos em banco SQLite com interface HTML intuitiva.
> CRUD com formulário, validação de dados e banco de dados persistente.

## 🌟 Destaques Principais

- ✅ **Interface Web Responsiva** - Formulário intuitivo e lista de produtos em tempo real
- 📄 **Banco SQLite Persistente** - Dados salvos automaticamente em `produtos.db`
- 🔍 **CRUD Completo** - Create, Read, Delete com operações assíncronas
- 🔒 **Segurança** - Proteção contra XSS e validação de entrada
- 🎨 **Código Limpo** - Estrutura modular, bem documentado e fácil de manter
- 📚 **Promises & Async** - Operações assíncronas com tratamento de erros

## 🚀 Começar Rápido

### Pré-requisitos

- **Node.js** v14+ instalado
- **npm** ou **yarn**

### 1. Instalação

```bash
git clone https://github.com/danilodk/banco_dados_mais_formulario.git
cd banco_dados_mais_formulario
npm install
```

### 2. Executar o Servidor

```bash
node server.js
```

### 3. Acessar a Aplicação

```
http://localhost:3000
```

## 📂 Estrutura do Projeto

```
banco_dados_mais_formulario/
├── server.js              # Servidor Node.js com rotas HTTP
├── README.md              # Documentação
├── package.json           # Dependências npm
├── produtos.db            # Banco SQLite (criado automaticamente)
└── .gitignore             # Arquivos ignorados
```

## 📃 Dependências

A única dependência externa necessária é:

```bash
npm install sqlite3
```

Os módulos `http` e `url` são built-in do Node.js.

## 🌐 Como Usar

### Adicionar um Produto

1. Digite o **nome do produto** (ex: "Notebook")
2. Digite a **quantidade** (ex: "5")
3. Clique em **"Adicionar"**
4. Produto aparece automaticamente na lista

### Remover um Produto

1. Localize o produto na lista
2. Clique no botão **"Excluir"**
3. Produto é removido instantaneamente

## 💫 Banco de Dados

### Tabela: `produtos`

| Campo | Tipo | Descrição |
|-------|------|-------|
| `id` | INTEGER | Chave primária (auto-incrementada) |
| `nome` | TEXT | Nome do produto |
| `quantidade` | INTEGER | Quantidade em estoque |

### Exemplo de Registro

```sql
SELECT * FROM produtos;
-- id | nome    | quantidade
-- 1  | Notebook| 5
-- 2  | Mouse   | 20
```

## 💥 Rotas HTTP

### GET `/`
- Exibe a página principal
- Response: HTML renderizado
- Status: 200 OK

### POST `/adicionar_produto`
- Adiciona novo produto
- Parâmetros: `productName`, `productQuantity`
- Redireciona: para `/` (302)

### POST `/excluir_produto`
- Remove produto pelo ID
- Parâmetros: `productId`
- Redireciona: para `/` (302)

## 📝 Exemplos de Uso

### Via cURL

```bash
# Adicionar produto
curl -X POST http://localhost:3000/adicionar_produto \
  -d "productName=Teclado&productQuantity=15"

# Deletar produto (ID=1)
curl -X POST http://localhost:3000/excluir_produto \
  -d "productId=1"
```

### Via SQLite3 CLI

```bash
sqlite3 produtos.db

# Ver todos os produtos
SELECT * FROM produtos;

# Contar produtos
SELECT COUNT(*) FROM produtos;
```

## 🛠️ Configuração

### Alterar Porta

Padrão: 3000

```bash
PORT=8080 node server.js
```

### Mudar Nome do Banco

No `server.js`, altere:

```javascript
let db = new sqlite3.Database('meu_banco.db');
```

## 👤 Autor

**Danilo Araújo** - [@danilodk](https://github.com/danilodk)

## 📄 Licença

MIT - veja [LICENSE](LICENSE) para detalhes

## 🐛 Reportar Bugs

[Abra uma issue](https://github.com/danilodk/banco_dados_mais_formulario/issues)

## 🚀 Melhorias Futuras

- [ ] Editar produtos
- [ ] Sistema de categorias
- [ ] Busca avançada
- [ ] Export CSV/Excel
- [ ] Autenticação
- [ ] API REST
- [ ] Testes automatizados
- [ ] Dashboard analytics

## 👍 Contribuindo

Fork → Feature Branch → Commit → Push → Pull Request

---

**🚀 Desenvolvido com ❤️ em Node.js**
