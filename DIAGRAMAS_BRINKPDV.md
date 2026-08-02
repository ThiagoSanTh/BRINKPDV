# Diagramas do projeto BRINKPDV

## 1. Diagrama relacional

Este modelo representa a estrutura relacional esperada para o sistema com base no esquema atual em [shared/schema.ts](shared/schema.ts).

```mermaid
erDiagram
    USERS ||--o{ SALES : realiza
    SALESPERSONS ||--o{ SALES : atende
    SALES ||--o{ SALES_ITEMS : contem
    PRODUCTS ||--o{ SALES_ITEMS : compoe
    CUSTOMERS ||--o{ SERVICE_ORDERS : solicita
    SERVICE_ORDERS ||--o{ SERVICE_ORDER_EVENTS : possui

    USERS {
        string id PK
        string username
        string password
        string role
    }

    SALESPERSONS {
        string id PK-------------------
        string name                   |
        string email                  |
        string phone                  |
        decimal commission            |
        decimal totalSales            |
        boolean active                |
        date entryDate                |
    }                                 |                                                                        |
                                      |
    PRODUCTS {                        |
        string id PK                  |
        string sku                    |
        string name                   |
        string category               |
        decimal price                 |
        int stock                     |
        string image                  |
    }                                 |
    SALES {                           |
        string id PK                  |
        string salespersonId FK -------                        
        decimal total
        string paymentMethod
        string items
        string observation
        datetime createdAt
    }

    SALES_ITEMS {
        string id PK
        string saleId FK
        string productId FK
        int quantity
        decimal unitPrice
        decimal total
    }

    CUSTOMERS {
        string id PK
        string name
        string phone
        string email
        string address
    }

    SERVICE_ORDERS {
        string id PK
        string orderNumber
        string customerId FK
        string device
        string issue
        string status
        string priority
        decimal value
        date date
        date deadline
        date exitDate
    }

    SERVICE_ORDER_EVENTS {
        string id PK
        string orderId FK
        string eventType
        string description
        datetime createdAt
    }

    STORE_SETTINGS {
        string id PK
        string storeName
        string storeLogo
    }
```

## 2. Diagrama não relacional

Este modelo mostra uma abordagem orientada a documentos, útil se o sistema evoluir para um backend NoSQL mais flexível.

```mermaid
graph TD
    A[users] --> B[authSessions]
    C[stores] --> D[products]
    C --> E[salespersons]
    C --> F[sales]
    C --> G[serviceOrders]
    C --> H[settings]

    F --> I[items]
    G --> J[history]

    subgraph StoreDocument
        C[store]
        D[products]
        E[salespersons]
        F[sales]
        G[serviceOrders]
        H[settings]
    end

    subgraph UserContext
        A[users]
        B[authSessions]
    end
```

### Exemplo de estrutura documental

- users
  - id
  - username
  - passwordHash
  - role
  - active

- stores
  - id
  - name
  - logo
  - currency
  - settings

- products
  - id
  - sku
  - name
  - category
  - price
  - stock
  - image

- sales
  - id
  - salespersonId
  - paymentMethod
  - total
  - items[]
  - observation
  - createdAt

- serviceOrders
  - id
  - orderNumber
  - customer
  - device
  - issue
  - status
  - priority
  - value
  - history[]

## 3. Diagrama de caso de uso

```mermaid
flowchart LR
    ActorAdmin[Administrador]
    ActorSeller[Vendedor]
    ActorCustomer[Cliente]

    subgraph Sistema[BRINKPDV]
        UC1[Realizar login]
        UC2[Cadastrar produto]
        UC3[Registrar venda]
        UC4[Gerar relatório]
        UC5[Gerenciar vendedores]
        UC6[Criar ordem de serviço]
        UC7[Configurar loja]
        UC8[Visualizar dashboard]
    end

    ActorAdmin --> UC1
    ActorAdmin --> UC2
    ActorAdmin --> UC3
    ActorAdmin --> UC4
    ActorAdmin --> UC5
    ActorAdmin --> UC6
    ActorAdmin --> UC7
    ActorAdmin --> UC8

    ActorSeller --> UC1
    ActorSeller --> UC3
    ActorSeller --> UC8
    ActorSeller --> UC6

    ActorCustomer --> UC6
```

## Observação

- O modelo relacional é o mais alinhado com o estado atual do projeto.
- O modelo não relacional é uma proposta de evolução para um backend mais flexível e escalável.
- O caso de uso mostra os principais fluxos de negócio do sistema PDV.
