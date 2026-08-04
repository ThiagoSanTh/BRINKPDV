# Análise das issues do projeto BRINKPDV

Este documento mapeia as issues listadas para o código atual do projeto, indicando onde a implementação está hoje, o que parece estar faltando e uma sugestão de ajuste.

## Visão geral

As issues listadas apontam para problemas em quatro áreas principais:
- PDV / vendas: carrinho, desconto, busca por código de barras e gravação de vendas.
- Vendas do dia: exibição das vendas e reimpressão de comprovantes.
- Relatórios: dados não aparecem corretamente.
- Dashboard: ações de caixa não estão registrando/reflectindo as vendas.

A análise mostrou que o projeto ainda está muito baseado em dados mockados e em estado local no frontend, o que explica grande parte dos problemas.

---

## 1) PDV / Vendas - carrinho, permitir alteração de valor do produto (desconto)

### Onde está implementado hoje
- [client/src/pages/POS.tsx](client/src/pages/POS.tsx)
  - Bloco de estado do carrinho e da venda: linhas com `const [cart, setCart]` e `const subtotal = cart.reduce(...)`
  - Fluxo de pagamento: `handlePayment()`
  - Exibição do resumo do carrinho e total
- [client/src/components/CartItem.tsx](client/src/components/CartItem.tsx)
  - Componente do item do carrinho com preço, quantidade e total

### O que está faltando / problema
- O carrinho não possui campo para desconto por item ou por venda.
- O valor do produto é tratado como fixo, sem possibilidade de edição manual no momento da venda.
- O total é calculado apenas como `price * quantity`.

### Ajuste recomendado
- Implementar no fluxo de carrinho um campo de desconto por item ou por venda.
- Adicionar no estado do item do carrinho propriedades como `discount` e `unitPrice`.
- Recalcular o total com regra como:
  - totalItem = quantity * unitPrice - discount
  - totalVenda = soma dos itens com desconto aplicado
- Atualizar o componente [client/src/components/CartItem.tsx](client/src/components/CartItem.tsx) para permitir edição do valor e do desconto.

### Pontos exatos para revisar
- [client/src/pages/POS.tsx](client/src/pages/POS.tsx)
- [client/src/components/CartItem.tsx](client/src/components/CartItem.tsx)

---

## 2) PDV / Vendas - não busca por código de barras

### Onde está implementado hoje
- [client/src/pages/POS.tsx](client/src/pages/POS.tsx)
  - O input de busca por código de barras existe: `const [barcodeSearch, setBarcodeSearch] = useState("")`
  - O filtro tenta usar `p.barcode?.includes(barcodeSearch)`

### O que está faltando / problema
- O filtro está presente, mas o sistema não tem uma fonte real de produtos com código de barras preenchido.
- O componente usa dados mockados e não há integração com produtos reais.

### Ajuste recomendado
- Garantir que os produtos possuam campo `barcode` preenchido e que o filtro seja aplicado contra os produtos vindos do backend/estado real.
- Se o backend ainda estiver em memória, conectar o PDV à lista de produtos real em vez de `mockProducts`.
- Adicionar fallback para buscar também por SKU, nome e categoria.

### Pontos exatos para revisar
- [client/src/pages/POS.tsx](client/src/pages/POS.tsx)

---

## 3) Vendas do dia - reimprimir comprovante de venda

### Onde está implementado hoje
- [client/src/pages/DailySales.tsx](client/src/pages/DailySales.tsx)
  - O componente consome `GET /api/sales/today` via React Query.
  - A lista de vendas é renderizada com `sale.paymentMethod` e `sale.total`.
- [server/routes.ts](server/routes.ts)
  - Rotas de vendas: `GET /api/sales`, `GET /api/sales/today`, `POST /api/sales`.
- [server/storage.ts](server/storage.ts)
  - Armazenamento em memória das vendas.

### O que está faltando / problema
- Não existe botão ou fluxo para reimprimir um comprovante.
- Os dados das vendas não parecem ser persistidos de forma robusta para reimpressão posterior.
- O backend atual não tem uma camada de impressão/comprovante estruturada.

### Ajuste recomendado
- Adicionar na lista de vendas do dia uma ação de "Reimprimir".
- Implementar um formato de comprovante a partir da venda selecionada.
- Salvar/recuperar o conteúdo do comprovante ou gerar a partir do item da venda.
- Se a aplicação for desktop/electron, usar a impressão nativa ou abrir uma janela de visualização.

### Pontos exatos para revisar
- [client/src/pages/DailySales.tsx](client/src/pages/DailySales.tsx)
- [server/routes.ts](server/routes.ts)
- [server/storage.ts](server/storage.ts)

---

## 4) Relatórios - não reconhece as vendas

### Onde está implementado hoje
- [client/src/pages/Reports.tsx](client/src/pages/Reports.tsx)
  - Os relatórios estão com dados mockados (`mockSalesData`, `mockTopProducts`, `mockPeriodProducts`).
- [server/routes.ts](server/routes.ts)
  - Há API para buscar vendas, mas o frontend não usa esses dados nos relatórios.

### O que está faltando / problema
- Os relatórios mostram dados estáticos e não refletem as vendas feitas no sistema.
- O dashboard e os relatórios não consomem os dados reais de vendas.

### Ajuste recomendado
- Substituir os mocks por dados vindos do backend.
- Criar uma função que agregue vendas por período, forma de pagamento e produto.
- Expor no backend endpoints para relatórios ou reutilizar `/api/sales` com filtragem por data.
- No frontend, buscar esses dados via React Query em vez de usar arrays estáticos.

### Pontos exatos para revisar
- [client/src/pages/Reports.tsx](client/src/pages/Reports.tsx)
- [server/routes.ts](server/routes.ts)
- [server/storage.ts](server/storage.ts)

---

## 5) Dashboard - não registra

### Onde está implementado hoje
- [client/src/pages/Dashboard.tsx](client/src/pages/Dashboard.tsx)
  - As ações de entrada e saída de caixa alteram apenas estado local do componente (`cashIn`, `cashOut`).
  - O dashboard é renderizado com valores fixos e dados mockados.

### O que está faltando / problema
- O dashboard não registra as vendas reais nem as operações do caixa em um armazenamento persistente.
- A tela mostra valores zerados ou estáticos e não reflete o estado real do negócio.

### Ajuste recomendado
- Conectar o dashboard ao mesmo mesmo backend de vendas e caixa.
- Persistir entradas/saídas do caixa e vendas em storage real.
- Exibir métricas como total de vendas hoje, transações e saldo do caixa com base nos dados reais.

### Pontos exatos para revisar
- [client/src/pages/Dashboard.tsx](client/src/pages/Dashboard.tsx)
- [server/routes.ts](server/routes.ts)
- [server/storage.ts](server/storage.ts)

---

## 6) Observação sobre o backend atual

### Onde está implementado hoje
- [server/storage.ts](server/storage.ts)
- [server/routes.ts](server/routes.ts)
- [shared/schema.ts](shared/schema.ts)

### Problema principal
- O backend atual é um armazenamento em memória, então qualquer venda feita é perdida ao reiniciar a aplicação.
- O schema já prevê campos importantes como `salespersonId`, `paymentMethod`, `observation`, mas o fluxo do frontend não está aproveitando isso corretamente.

### Ajuste recomendado
- Substituir o storage em memória por persistência real (SQLite/PostgreSQL/MySQL) ou pelo menos salvar em arquivo local.
- Expandir a estrutura de vendas para incluir itens, descontos, valores brutos, valores líquidos e comprovante.

---

## Prioridade de correção sugerida

1. Conectar PDV, relatório e dashboard ao mesmo fluxo de vendas real.
2. Implementar desconto/valor alterado no carrinho.
3. Ajustar busca por código de barras com produtos reais.
4. Implementar reimpressão de comprovante.
5. Trocar mocks por dados persistidos no backend.

---

## Resumo executivo

Os issues listados estão relacionados principalmente ao fato de o projeto estar com a camada de vendas e relatórios ainda muito baseada em mock data e estado local. A correção principal é unificar o fluxo de vendas no frontend e no backend para que PDV, vendas do dia, relatórios e dashboard usem a mesma fonte de verdade.
