# Documentação do projeto BRINKPDV

## Visão geral

Este projeto é um sistema de PDV (ponto de venda) com interface web em React/TypeScript, backend em Express e modelo de dados compartilhado com Drizzle ORM. O código atual está estruturado como uma aplicação de demonstração/produtiva inicial, com foco em fluxo de vendas, gestão de produtos, vendedores, ordens de serviço e configurações da loja.

## Estrutura geral do projeto

- [client/src](client/src): interface do usuário em React.
  - [client/src/pages](client/src/pages): páginas principais do sistema.
  - [client/src/components](client/src/components): componentes visuais reutilizáveis.
  - [client/src/lib](client/src/lib): utilidades e cliente React Query.
- [server](server): backend Express.
  - [server/index.ts](server/index.ts): bootstrap do servidor e middleware HTTP.
  - [server/routes.ts](server/routes.ts): registro das rotas da API.
  - [server/storage.ts](server/storage.ts): camada de armazenamento em memória.
  - [server/vite.ts](server/vite.ts): configuração de Vite para desenvolvimento.
- [shared/schema.ts](shared/schema.ts): esquema de dados e tipos compartilhados.
- [package.json](package.json): dependências, scripts e configuração do projeto.

## Arquitetura e prontidão para expansão

### Pontos fortes da estrutura atual
- Separação entre frontend, backend e schema compartilhado.
- Uso de TypeScript para reduzir riscos de regressão.
- Uso de Drizzle ORM e esquema de banco já definido, mesmo que a implementação atual ainda use armazenamento em memória.
- Organização por módulo e páginas, o que facilita evolução incremental.

### Limitações atuais
- O backend não está conectado a um banco persistente real em tempo de execução; o storage atual é em memória ([server/storage.ts](server/storage.ts)).
- As rotas existentes são mínimas e cobrem principalmente vendas.
- A autenticação atual é baseada em localStorage e não em sessão segura no backend.

### Disponibilidade para evoluir para um backend mais robusto
Sim. A estrutura já permite essa evolução com relativa facilidade:
- Substituir a camada de armazenamento em [server/storage.ts](server/storage.ts) por integração com PostgreSQL/SQLite/MySQL.
- Implementar CRUD completo para clientes, produtos, vendedores e ordens de serviço.
- Adicionar autenticação real com JWT, refresh token e controle por roles.
- Separar as rotas por recurso e criar serviços/domain layer.
- Adicionar validação e tratamento de erro centralizado.

## Funções e pontos funcionais do projeto

### 1. Infraestrutura do servidor

- `log(message, source)` — registra mensagens de log do servidor em [server/index.ts](server/index.ts#L19) e [server/vite.ts](server/vite.ts#L11).
- `serveStatic(app)` — serve os arquivos estáticos do frontend em produção em [server/index.ts](server/index.ts#L30).
- `setupVite(app, server)` — prepara o ambiente Vite para desenvolvimento em [server/vite.ts](server/vite.ts#L22).
- `registerRoutes(app)` — registra as rotas da API em [server/routes.ts](server/routes.ts#L5).

### 2. Rotas e operações de backend

- `GET /api/sales` — busca todas as vendas em [server/routes.ts](server/routes.ts#L9).
- `GET /api/sales/today` — busca vendas do dia e enriquece com o nome do vendedor em [server/routes.ts](server/routes.ts#L19).
- `POST /api/sales` — cria uma nova venda em [server/routes.ts](server/routes.ts#L45).

### 3. Armazenamento e dados

- `getUser(id)` — recupera um usuário pelo id em [server/storage.ts](server/storage.ts).
- `getUserByUsername(username)` — busca usuário por nome de login em [server/storage.ts](server/storage.ts).
- `createUser(user)` — cria novo usuário em [server/storage.ts](server/storage.ts).
- `getSales()` — lista todas as vendas em [server/storage.ts](server/storage.ts).
- `getTodaySales()` — lista vendas do dia atual em [server/storage.ts](server/storage.ts).
- `getSaleById(id)` — busca venda específica em [server/storage.ts](server/storage.ts).
- `createSale(sale)` — cria uma nova venda em [server/storage.ts](server/storage.ts).
- `getSalespersonById(id)` — busca vendedor pelo id em [server/storage.ts](server/storage.ts).

### 4. Estrutura da aplicação e navegação

- `Router()` — define as rotas da aplicação com Wouter em [client/src/App.tsx](client/src/App.tsx#L25).
- `App()` — monta o shell principal, autenticação e barra lateral em [client/src/App.tsx](client/src/App.tsx#L41).
- `handleLogout()` — encerra a sessão atual em [client/src/App.tsx](client/src/App.tsx#L119).
- `handleStoreInfoUpdate()` — atualiza o nome da loja em [client/src/App.tsx](client/src/App.tsx#L78).
- `handleAuthChange()` — sincroniza o estado de autenticação em [client/src/App.tsx](client/src/App.tsx#L90).

### 5. Autenticação e acesso

- `Login()` — página de login em [client/src/pages/Login.tsx](client/src/pages/Login.tsx#L10).
- `handleLogin(e)` — valida credenciais e inicia sessão em [client/src/pages/Login.tsx](client/src/pages/Login.tsx#L18).

### 6. Dashboard e caixa

- `Dashboard()` — página inicial do sistema em [client/src/pages/Dashboard.tsx](client/src/pages/Dashboard.tsx#L25).
- `handleCashEntry()` — registra entrada de dinheiro no caixa em [client/src/pages/Dashboard.tsx](client/src/pages/Dashboard.tsx#L38).
- `handleCashWithdrawal()` — registra saída de dinheiro do caixa em [client/src/pages/Dashboard.tsx](client/src/pages/Dashboard.tsx#L60).

### 7. Vendas diárias

- `DailySales()` — página de vendas do dia em [client/src/pages/DailySales.tsx](client/src/pages/DailySales.tsx#L30).
- `formatCurrency(value)` — formata valores monetários em [client/src/pages/DailySales.tsx](client/src/pages/DailySales.tsx#L83).
- `formatTime(date)` — formata horários para exibição em [client/src/pages/DailySales.tsx](client/src/pages/DailySales.tsx#L90).

### 8. Ponto de venda

- `POS()` — tela de ponto de venda em [client/src/pages/POS.tsx](client/src/pages/POS.tsx#L44).
- `handleAddToCart(productId)` — adiciona produto ao carrinho em [client/src/pages/POS.tsx](client/src/pages/POS.tsx#L76).
- `handleIncrement(id)` — aumenta a quantidade de um item em [client/src/pages/POS.tsx](client/src/pages/POS.tsx#L90).
- `handleDecrement(id)` — diminui a quantidade de um item em [client/src/pages/POS.tsx](client/src/pages/POS.tsx#L96).
- `handleRemove(id)` — remove um item do carrinho em [client/src/pages/POS.tsx](client/src/pages/POS.tsx#L102).
- `handleCheckout()` — inicia o fluxo de finalização da venda em [client/src/pages/POS.tsx](client/src/pages/POS.tsx#L109).
- `handleProceedToPayment()` — avança para o pagamento em [client/src/pages/POS.tsx](client/src/pages/POS.tsx#L114).
- `handlePayment()` — conclui o pagamento em [client/src/pages/POS.tsx](client/src/pages/POS.tsx#L119).

### 9. Gestão de produtos

- `Products()` — página de cadastro e gestão de produtos em [client/src/pages/Products.tsx](client/src/pages/Products.tsx#L37).
- `handleNewProduct()` — abre o fluxo de criação de produto em [client/src/pages/Products.tsx](client/src/pages/Products.tsx#L89).
- `handleEdit(product)` — prepara edição de um produto em [client/src/pages/Products.tsx](client/src/pages/Products.tsx#L132).
- `handleUpdateProduct()` — salva a atualização do produto em [client/src/pages/Products.tsx](client/src/pages/Products.tsx#L145).
- `handleDelete(product)` — prepara exclusão de um produto em [client/src/pages/Products.tsx](client/src/pages/Products.tsx#L191).
- `confirmDelete()` — confirma a exclusão do produto em [client/src/pages/Products.tsx](client/src/pages/Products.tsx#L196).

### 10. Relatórios

- `Reports()` — tela de relatórios em [client/src/pages/Reports.tsx](client/src/pages/Reports.tsx#L61).
- `handleUnlock()` — desbloqueia a edição do período em [client/src/pages/Reports.tsx](client/src/pages/Reports.tsx#L72).
- `handleClose()` — fecha o diálogo de período em [client/src/pages/Reports.tsx](client/src/pages/Reports.tsx#L79).
- `handleSelectPeriod()` — seleciona um período de análise em [client/src/pages/Reports.tsx](client/src/pages/Reports.tsx#L83).
- `handleApplyPeriod()` — aplica o período selecionado em [client/src/pages/Reports.tsx](client/src/pages/Reports.tsx#L87).
- `handleExport()` — exporta os dados do relatório em [client/src/pages/Reports.tsx](client/src/pages/Reports.tsx#L115).

### 11. Gestão de vendedores

- `Salespersons()` — tela de cadastro e gestão de vendedores em [client/src/pages/Salespersons.tsx](client/src/pages/Salespersons.tsx#L37).
- `handleNewSalesperson()` — cria novo cadastro de vendedor em [client/src/pages/Salespersons.tsx](client/src/pages/Salespersons.tsx#L64).
- `handleEdit(salesperson)` — prepara edição de vendedor em [client/src/pages/Salespersons.tsx](client/src/pages/Salespersons.tsx#L101).
- `handleUpdateSalesperson()` — salva a alteração do vendedor em [client/src/pages/Salespersons.tsx](client/src/pages/Salespersons.tsx#L113).
- `handleDelete(salesperson)` — prepara remoção do vendedor em [client/src/pages/Salespersons.tsx](client/src/pages/Salespersons.tsx#L148).
- `confirmDelete()` — confirma a exclusão do vendedor em [client/src/pages/Salespersons.tsx](client/src/pages/Salespersons.tsx#L153).

### 12. Ordens de serviço

- `ServiceOrders()` — tela de ordens de serviço em [client/src/pages/ServiceOrders.tsx](client/src/pages/ServiceOrders.tsx#L50).
- `handleViewDetails(order)` — visualiza detalhes da ordem em [client/src/pages/ServiceOrders.tsx](client/src/pages/ServiceOrders.tsx#L95).
- `handleNewOrder()` — cria uma nova ordem de serviço em [client/src/pages/ServiceOrders.tsx](client/src/pages/ServiceOrders.tsx#L100).
- `handleCompleteOrder(orderId)` — marca ordem como concluída em [client/src/pages/ServiceOrders.tsx](client/src/pages/ServiceOrders.tsx#L150).
- `handleShareWhatsApp(order)` — envia a ordem por WhatsApp em [client/src/pages/ServiceOrders.tsx](client/src/pages/ServiceOrders.tsx#L162).
- `handleOpenPrintDialog(order)` — abre diálogo de impressão em [client/src/pages/ServiceOrders.tsx](client/src/pages/ServiceOrders.tsx#L179).
- `handlePrint()` — executa a impressão da ordem em [client/src/pages/ServiceOrders.tsx](client/src/pages/ServiceOrders.tsx#L184).

### 13. Configurações da loja e usuários

- `Settings()` — página de configurações em [client/src/pages/Settings.tsx](client/src/pages/Settings.tsx#L34).
- `getCurrentUser()` — recupera o usuário atual em [client/src/pages/Settings.tsx](client/src/pages/Settings.tsx#L51).
- `getAvailableRoles()` — lista papéis permitidos em [client/src/pages/Settings.tsx](client/src/pages/Settings.tsx#L66).
- `openNewUserDialog()` — abre o formulário de novo usuário em [client/src/pages/Settings.tsx](client/src/pages/Settings.tsx#L83).
- `handleCreateUser()` — cria usuário no sistema em [client/src/pages/Settings.tsx](client/src/pages/Settings.tsx#L231).
- `handleDeleteUser(userId)` — remove um usuário em [client/src/pages/Settings.tsx](client/src/pages/Settings.tsx#L273).
- `handleBackup()` — executa backup dos dados em [client/src/pages/Settings.tsx](client/src/pages/Settings.tsx#L284).
- `handleFileUpload(event)` — faz upload de arquivo em [client/src/pages/Settings.tsx](client/src/pages/Settings.tsx#L307).
- `handleLogoUpload(event)` — troca logo da loja em [client/src/pages/Settings.tsx](client/src/pages/Settings.tsx#L320).
- `handleRemoveLogo()` — remove a logo atual em [client/src/pages/Settings.tsx](client/src/pages/Settings.tsx#L333).
- `handleSaveLogo()` — salva a logo em [client/src/pages/Settings.tsx](client/src/pages/Settings.tsx#L344).
- `handleSaveProfile()` — salva dados do perfil em [client/src/pages/Settings.tsx](client/src/pages/Settings.tsx#L356).
- `handleSaveStoreInfo()` — salva informações da loja em [client/src/pages/Settings.tsx](client/src/pages/Settings.tsx#L364).
- `handleSaveStoreData()` — salva dados gerais da loja em [client/src/pages/Settings.tsx](client/src/pages/Settings.tsx#L374).
- `handleSaveReceiptSettings()` — salva configurações de recibo em [client/src/pages/Settings.tsx](client/src/pages/Settings.tsx#L382).
- `handleSavePrinterSettings()` — salva configurações de impressora em [client/src/pages/Settings.tsx](client/src/pages/Settings.tsx#L390).
- `handleCheckUpdates()` — verifica por atualizações em [client/src/pages/Settings.tsx](client/src/pages/Settings.tsx#L398).

### 14. Upload de arquivos

- `Upload()` — página de upload em [client/src/pages/Upload.tsx](client/src/pages/Upload.tsx#L5).
- `handleFileUpload(file)` — processa o arquivo enviado em [client/src/pages/Upload.tsx](client/src/pages/Upload.tsx#L6).

### 15. Página de erro

- `NotFound()` — renderiza a tela de página não encontrada em [client/src/pages/not-found.tsx](client/src/pages/not-found.tsx#L4).

## Modelo de dados principal

O schema compartilhado define as entidades principais em [shared/schema.ts](shared/schema.ts):
- `users`
- `products`
- `salespersons`
- `sales`
- `serviceOrders`
- `storeSettings`

Essas entidades dão base para evoluir para um backend mais robusto com CRUD completo e persistência real.

## Resumo executivo

O projeto já possui uma base funcional de PDV com:
- autenticação simples,
- dashboard,
- cadastro de produtos,
- cadastro de vendedores,
- fluxo de vendas,
- ordens de serviço,
- configurações da loja.

O principal ponto de melhoria é substituir o armazenamento temporário por um backend real e expandir o modelo de dados e as rotas para cobrir clientes, estoque, auditoria, permissões e integração com sistemas externos.
