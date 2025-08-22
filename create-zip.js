
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Criar o arquivo ZIP
const output = fs.createWriteStream('zaplog-project.zip');
const archive = archiver('zip', {
  zlib: { level: 9 } // Máxima compressão
});

output.on('close', function() {
  console.log(`✅ ZIP criado com sucesso: zaplog-project.zip (${archive.pointer()} bytes)`);
  console.log('📁 Download disponível em: /zaplog-project.zip');
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// Adicionar arquivos e pastas, excluindo node_modules e outros desnecessários
const excludePatterns = [
  'node_modules',
  '.git',
  '.replit',
  'dist',
  '.env',
  'zaplog-project.zip',
  'create-zip.js',
  'attached_assets'
];

function shouldExclude(filePath) {
  return excludePatterns.some(pattern => filePath.includes(pattern));
}

function addDirectory(dirPath, zipPath = '') {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const zipFilePath = zipPath ? path.join(zipPath, file) : file;
    
    if (shouldExclude(fullPath)) {
      return;
    }
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      addDirectory(fullPath, zipFilePath);
    } else {
      archive.file(fullPath, { name: zipFilePath });
    }
  });
}

console.log('📦 Criando arquivo ZIP do projeto Zaplog...');

// Adicionar arquivos do projeto
addDirectory('.');

// Adicionar README com instruções
const readmeContent = `# Zaplog - Sistema de Gestão Logística

## 📋 Sobre o Projeto

Sistema completo de gestão logística com dashboard web e extensão Chrome para integração com WhatsApp Web.

### ✨ Funcionalidades Principais

- 🚚 **Dashboard Web**: Interface completa para gerenciamento de viagens
- 📱 **Extensão Chrome**: Integração direta com WhatsApp Web
- 📊 **Estatísticas**: Acompanhamento em tempo real
- 🔐 **Autenticação**: Sistema seguro de login
- 📦 **CRUD Completo**: Gerenciamento de viagens e motoristas

## 🛠 Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **shadcn/ui** componentes
- **Wouter** para roteamento
- **TanStack Query** para gerenciamento de estado

### Backend
- **Node.js** com Express
- **TypeScript**
- **Drizzle ORM**
- **PostgreSQL** (Neon Database)
- **Passport.js** para autenticação

### Extensão Chrome
- **Manifest V3**
- **Content Scripts**
- **Background Service Worker**
- **Chrome APIs**

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL ou conta no Neon Database

### 1. Instalar Dependências
\`\`\`bash
npm install
\`\`\`

### 2. Configurar Banco de Dados
\`\`\`bash
# Criar arquivo .env na raiz com:
DATABASE_URL="sua_url_do_postgres"
SESSION_SECRET="seu_secret_aqui"
\`\`\`

### 3. Executar Migrações
\`\`\`bash
npm run db:push
\`\`\`

### 4. Iniciar Aplicação
\`\`\`bash
npm run dev
\`\`\`

A aplicação estará disponível em: http://localhost:5000

## 🎯 Como Instalar a Extensão Chrome

### 1. Modo Desenvolvedor
1. Abra o Chrome e vá para \`chrome://extensions/\`
2. Ative o "Modo do desenvolvedor" no canto superior direito

### 2. Carregar Extensão
1. Clique em "Carregar extensão sem compactação"
2. Selecione a pasta \`chrome-extension\` do projeto
3. A extensão será instalada automaticamente

### 3. Como Usar
1. Faça login no dashboard web primeiro
2. Abra o WhatsApp Web
3. Clique com botão direito na página
4. Selecione "Iniciar Acompanhamento Zaplog"

## 📁 Estrutura do Projeto

\`\`\`
zaplog/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── hooks/          # Hooks customizados
│   │   ├── lib/            # Utilitários
│   │   └── types/          # Tipos TypeScript
├── server/                 # Backend Express
│   ├── db.ts              # Configuração do banco
│   ├── routes.ts          # Rotas da API
│   └── index.ts           # Servidor principal
├── chrome-extension/       # Extensão Chrome
│   ├── manifest.json      # Configuração da extensão
│   ├── background.js      # Service worker
│   ├── content-script.js  # Script de conteúdo
│   └── popup.html         # Interface do popup
└── shared/                # Schemas compartilhados
\`\`\`

## 🔑 Credenciais de Teste

- **Email:** teste@zaplog.com
- **Senha:** 123456

## 📊 APIs Disponíveis

### Autenticação
- \`POST /api/auth/login\` - Login do usuário
- \`GET /api/auth/me\` - Dados do usuário logado
- \`POST /api/auth/logout\` - Logout

### Viagens
- \`GET /api/trips\` - Listar viagens
- \`POST /api/trips\` - Criar viagem
- \`PUT /api/trips/:id\` - Atualizar viagem
- \`DELETE /api/trips/:id\` - Excluir viagem

### Estatísticas
- \`GET /api/stats\` - Estatísticas do dashboard

## 🚀 Deploy

### Preparação para Produção
\`\`\`bash
npm run build
\`\`\`

### Deploy no Replit
1. Importe o projeto no Replit
2. Configure as variáveis de ambiente
3. Execute \`npm run db:push\`
4. Clique em Deploy

## 📝 Próximas Funcionalidades

- [ ] Rastreamento em tempo real via GPS
- [ ] Notificações push
- [ ] Relatórios avançados
- [ ] Integração com APIs de mapas
- [ ] App mobile React Native

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Faça push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Desenvolvido com ❤️ para otimizar a gestão logística**
`;

archive.append(readmeContent, { name: 'README.md' });

// Finalizar o arquivo
archive.finalize();
