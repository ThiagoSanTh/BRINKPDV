# Estrutura do projeto BRINKPDV

## Visão geral

A estrutura foi organizada para facilitar a navegação e a manutenção do projeto.

## Pastas principais

- app/: camada de aplicação e fluxo principal do sistema
- client/: frontend React/TypeScript
- server/: backend Express e lógica de API
- core/: regras de negócio e modelos centrais
- infra/: configuração de banco, sincronização e infraestrutura
- data/: arquivos locais de persistência, como SQLite
- docs/: documentação do projeto
- shared/: schemas e tipos compartilhados entre frontend e backend

## Organização recomendada

- app/ para orchestration do fluxo do PDV
- client/ para interface do usuário
- server/ para APIs e rotas
- core/ para regras de negócio e serviços
- infra/ para integração com banco, sync e ambiente
- data/ para dados locais e caches
- docs/ para documentação e guias
