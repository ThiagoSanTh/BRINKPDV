# BRINKPDV - Informações de Versão

## Versão Atual: 1.0.0

**Data de Release**: Outubro 2025

## 📋 Changelog

### Versão 1.0.0 (Outubro 2025)

#### ✨ Funcionalidades Principais

**Sistema de Autenticação**
- Login com usuário e senha
- Logout com limpeza de sessão
- Usuário padrão: admin/admin
- Exibição de usuário logado no cabeçalho
- Opção de visualizar/ocultar senha

**Controle de Acesso (RBAC)**
- 4 níveis de permissão:
  - **Administrador**: Acesso total, pode criar qualquer usuário
  - **Gerente**: Pode criar Vendedor e Técnico, acesso a relatórios
  - **Vendedor**: Operacional, sem criação de usuários
  - **Técnico**: Operacional, focado em ordens de serviço
- Interface visual de hierarquia de permissões
- Validação de permissões na criação de usuários

**Gerenciamento de Usuários**
- Criar, visualizar e excluir usuários
- Campos: nome, email, senha, função
- Status ativo/inativo
- Persistência em localStorage

**Configurações da Loja**
- Logo personalizável (upload de imagem)
- Nome da loja exibido no cabeçalho
- Informações completas: CNPJ, endereço, telefone
- Configurações de recibo e impressora
- Sistema de backup e importação

**Módulos do Sistema**
- 📊 Dashboard: Visão geral de vendas
- 🛒 PDV/Vendas: Ponto de venda
- 📅 Vendas Diárias: Histórico de vendas
- 🔧 Ordens de Serviço: Gestão de reparos
- 👥 Vendedores: Comissões e desempenho
- 📦 Produtos: Gestão de estoque
- 📈 Relatórios: Análise de vendas
- ⚙️ Configurações: Personalização do sistema

**Interface**
- Tema claro/escuro
- Design Material Design 3 adaptado
- Sidebar responsivo
- Navegação intuitiva
- Ícones visuais (Lucide React)

#### 🔧 Tecnologias

**Frontend**
- React 18.3.1
- TypeScript 5.6.3
- Vite 5.4.20
- Tailwind CSS 3.4.17
- Radix UI (componentes)
- shadcn/ui
- TanStack Query
- Wouter (rotas)

**Backend**
- Node.js
- Express 4.21.2
- TypeScript
- Drizzle ORM
- PostgreSQL (configurado)

**Desktop**
- Electron 38.2.2
- electron-builder 26.0.12
- Windows (NSIS + Portable)

#### 💾 Armazenamento

- localStorage (navegador Electron)
- Suporte futuro para PostgreSQL
- Backup/restauração em JSON

#### 🐛 Correções

- Login instantâneo (removido delay de 800ms)
- Sincronização de autenticação entre componentes
- Notificações em tempo real
- Eventos customizados para atualizações

## 🔐 Credenciais Padrão

- **Usuário**: admin
- **Senha**: admin

> ⚠️ **IMPORTANTE**: Altere as credenciais padrão após a primeira instalação!

## 📁 Arquivos do Build

- **BRINKPDV-1.0.0-Setup.exe**: Instalador Windows (NSIS)
- **BRINKPDV-1.0.0-Portable.exe**: Versão portátil

## 🔄 Próximas Versões

### Planejado para v1.1.0
- [ ] Integração completa com PostgreSQL
- [ ] Relatórios avançados de lucro
- [ ] Exportação de dados para Excel
- [ ] Impressão de recibos térmicos
- [ ] Dashboard com gráficos em tempo real

### Planejado para v1.2.0
- [ ] Sistema de backup automático
- [ ] Sincronização em nuvem
- [ ] App móvel (Android/iOS)
- [ ] API RESTful para integrações

## 📞 Suporte

Para reportar bugs ou sugerir melhorias:
1. Documente o erro com prints
2. Inclua os logs de `%APPDATA%/brinkpdv/logs/`
3. Descreva os passos para reproduzir

## 📄 Licença

MIT License - Livre para uso comercial e pessoal

---

**Sistema estável e pronto para produção!** ✅
