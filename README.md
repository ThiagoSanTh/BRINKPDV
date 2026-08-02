# 🏪 BRINKPDV - Sistema de Ponto de Venda

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)
![License](https://img.shields.io/badge/license-MIT-green)

Sistema completo de PDV para o mercado brasileiro com controle de vendas, estoque, ordens de serviço e relatórios.

[Download](#-download) • [Instalação](#-instalação) • [Documentação](#-documentação) • [Suporte](#-suporte)

</div>

---

## 📋 Índice

- [Sobre](#-sobre)
- [Funcionalidades](#-funcionalidades)
- [Download](#-download)
- [Instalação](#-instalação)
- [Primeiro Uso](#-primeiro-uso)
- [Documentação](#-documentação)
- [Tecnologias](#-tecnologias)
- [Build do Código](#-build-do-código)
- [Suporte](#-suporte)
- [Licença](#-licença)

---

## 🎯 Sobre

O **BRINKPDV** é um sistema profissional de Ponto de Venda desenvolvido especialmente para o mercado brasileiro. Oferece controle completo de vendas, gestão de estoque, ordens de serviço, comissões de vendedores e muito mais.

### Por que escolher o BRINKPDV?

✅ **100% Offline** - Funciona sem internet  
✅ **Gratuito** - Sem mensalidades ou taxas  
✅ **Completo** - Todas as funcionalidades essenciais  
✅ **Seguro** - Controle de acesso por usuário  
✅ **Simples** - Interface intuitiva e moderna  

---

## ✨ Funcionalidades

### 🔐 Autenticação e Segurança
- Sistema de login com usuário e senha
- 4 níveis de permissão (Administrador, Gerente, Vendedor, Técnico)
- Controle hierárquico de acesso
- Múltiplos usuários do sistema

### 📊 Módulos Principais
- **Dashboard**: Visão geral de vendas e métricas
- **PDV/Vendas**: Ponto de venda rápido e intuitivo
- **Ordens de Serviço**: Gestão de reparos e manutenção
- **Produtos**: Controle de estoque e categorias
- **Vendedores**: Comissões e desempenho
- **Relatórios**: Análise de vendas e lucros

### ⚙️ Configurações
- Personalização da loja (nome, logo, dados)
- Configuração de impressoras e recibos
- Backup e restauração de dados
- Sistema de atualização

### 💳 Formas de Pagamento
- Cartão de Crédito
- Cartão de Débito
- PIX
- Dinheiro

---

## 📥 Download

### Opção 1: Executável Pronto (Windows)

> ⚠️ **Em breve!** Os executáveis serão disponibilizados para download direto.

### Opção 2: Compilar do Código-Fonte

1. **Baixe o projeto** do Replit ou GitHub
2. **Leia** o arquivo `DOWNLOAD.md` para instruções completas
3. **Execute** `build-windows.bat` no Windows
4. **Aguarde** a geração dos executáveis na pasta `release/`

---

## 🚀 Instalação

### Instalador Completo (Recomendado)

1. Execute `BRINKPDV-1.0.0-Setup.exe`
2. Escolha a pasta de instalação
3. Aguarde a conclusão
4. Execute pelo atalho criado

### Versão Portátil

1. Copie `BRINKPDV-1.0.0-Portable.exe` para onde desejar
2. Execute o arquivo diretamente
3. Não requer instalação

---

## 👤 Primeiro Uso

### 1. Login Inicial

Ao abrir o sistema pela primeira vez, use:

```
Usuário: admin
Senha: admin
```

> ⚠️ **IMPORTANTE**: Altere estas credenciais em Configurações → Usuários do Sistema

### 2. Configurar a Loja

1. Vá em **Configurações**
2. Preencha os dados da sua loja
3. Faça upload do logo (opcional)
4. Configure impressoras e recibos

### 3. Criar Usuários

1. Em **Configurações → Usuários do Sistema**
2. Clique em **Novo Usuário**
3. Preencha os dados e escolha a função:
   - **Administrador**: Acesso total
   - **Gerente**: Gerencia equipe
   - **Vendedor**: Opera vendas
   - **Técnico**: Gerencia ordens de serviço

### 4. Cadastrar Produtos

1. Acesse **Produtos**
2. Crie categorias
3. Cadastre seus produtos
4. Defina preços e estoque

### 5. Começar a Vender

1. Vá para **PDV/Vendas**
2. Adicione produtos ao carrinho
3. Finalize a venda
4. Imprima o recibo (se configurado)

---

## 📚 Documentação

### Arquivos de Documentação

- **`DOWNLOAD.md`** - Como baixar e preparar o sistema
- **`BUILD.md`** - Guia completo de build e compilação
- **`VERSION.md`** - Changelog e histórico de versões

### Estrutura de Permissões

| Função | Criar Usuários | Vendas | Produtos | Relatórios | Configurações |
|--------|---------------|--------|----------|------------|---------------|
| **Administrador** | ✅ Todos | ✅ | ✅ | ✅ | ✅ |
| **Gerente** | ✅ Vendedor/Técnico | ✅ | ✅ | ✅ | ⚠️ Limitado |
| **Vendedor** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Técnico** | ❌ | ❌ | ✅ | ❌ | ❌ |

### Atalhos do Teclado

- `Ctrl + B` - Toggle Sidebar
- `Ctrl + K` - Busca rápida (em breve)
- `F1` - Dashboard
- `F2` - PDV/Vendas

---

## 🛠️ Tecnologias

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- shadcn/ui (componentes)
- Radix UI (primitivos)
- TanStack Query (estado)

### Backend
- Node.js + Express
- TypeScript
- Drizzle ORM
- PostgreSQL (preparado)

### Desktop
- Electron 38
- electron-builder
- Windows (NSIS + Portable)

### Armazenamento
- localStorage (padrão)
- PostgreSQL (configurável)

---

## 🔨 Build do Código

### Pré-requisitos

- Windows 10/11
- Node.js 18+ ([baixar](https://nodejs.org))
- Git (opcional)

### Passos

#### 1. Clonar ou Baixar

```bash
# Via Git
git clone [URL_DO_REPOSITORIO]

# Ou baixe o ZIP do Replit
# Download as zip → Extrair
```

#### 2. Instalar Dependências

```bash
npm install
```

#### 3. Build Automático

```bash
# Execute no Windows
build-windows.bat
```

Ou manualmente:

```bash
# Build frontend + backend
npm run build

# Gerar executável
npx electron-builder --win --config electron-builder.json
```

#### 4. Localizar Executáveis

Os arquivos estarão em `release/`:
- `BRINKPDV-1.0.0-Setup.exe` (Instalador)
- `BRINKPDV-1.0.0-Portable.exe` (Portátil)

**Documentação completa**: Veja `BUILD.md`

---

## 💾 Backup de Dados

### Localização dos Dados

Os dados ficam em:
```
%APPDATA%\BRINKPDV\
```

### Fazer Backup

1. **Automático**: Use o botão em Configurações → Backup
2. **Manual**: Copie a pasta acima

### Restaurar Backup

1. Cole os arquivos de volta na pasta
2. Reinicie o sistema

---

## 🐛 Solução de Problemas

### Sistema não inicia
- Execute como Administrador
- Desative antivírus temporariamente
- Verifique logs em `%APPDATA%\BRINKPDV\logs\`

### Erro de login
- Use credenciais padrão: `admin` / `admin`
- Verifique se há usuários cadastrados
- Limpe o cache: Delete `%APPDATA%\BRINKPDV\`

### Dados não salvam
- Verifique permissões da pasta `%APPDATA%`
- Execute como Administrador
- Reinstale o sistema

---

## 📞 Suporte

### Reportar Bugs

Ao encontrar um problema:
1. Tire prints da tela
2. Copie os logs de `%APPDATA%\BRINKPDV\logs\`
3. Descreva os passos para reproduzir
4. Abra uma issue no repositório

### Contato

- 📧 Email: [seu-email]
- 💬 GitHub Issues: [link-issues]
- 📱 WhatsApp: [seu-whatsapp]

---

## 📄 Licença

MIT License

```
Copyright (c) 2025 BRINKPDV

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software.
```

Veja `LICENSE` para mais detalhes.

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ para o mercado brasileiro.

Tecnologias utilizadas:
- [React](https://react.dev)
- [Electron](https://electronjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Vite](https://vitejs.dev)

---

<div align="center">

**BRINKPDV v1.0.0** - Sistema de PDV Completo para Windows

[⬆ Voltar ao topo](#-brinkpdv---sistema-de-ponto-de-venda)

</div>
