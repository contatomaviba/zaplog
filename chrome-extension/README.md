# Zaplog Chrome Extension

Extensão para integração do sistema Zaplog com WhatsApp Web.

## Como instalar a extensão:

1. Abra o Chrome e vá para `chrome://extensions/`
2. Ative o "Modo do desenvolvedor" no canto superior direito
3. Clique em "Carregar extensão sem compactação"
4. Selecione a pasta `chrome-extension` deste projeto
5. A extensão será instalada e aparecerá na barra de ferramentas

## Como usar:

### 1. Fazer login no dashboard
- Clique no ícone da extensão
- Clique em "Abrir Dashboard"  
- Faça login com suas credenciais

### 2. Criar viagem a partir do WhatsApp
- Abra o WhatsApp Web
- Entre em uma conversa com um motorista
- Clique com o botão direito na página
- Selecione "Iniciar Acompanhamento Zaplog"
- Ou clique no ícone da extensão para abrir o popup

### 3. Funcionalidades da extensão:
- ✅ Extração automática de contatos do WhatsApp
- ✅ Criação rápida de viagens
- ✅ Integração com dashboard web
- ✅ Menu de contexto no WhatsApp Web
- ✅ Notificações visuais

## Credenciais de teste:
- **Email:** teste@zaplog.com
- **Senha:** 123456

## Estrutura dos arquivos:
- `manifest.json` - Configuração da extensão
- `background.js` - Script de background
- `content-script.js` - Script para WhatsApp Web
- `popup.html` - Interface do popup
- `popup.css` - Estilos do popup
- `popup.js` - Lógica do popup