# Guia de Build - BRINKPDV

## 📦 Como Gerar o Executável Windows

O BRINKPDV está configurado para ser empacotado como um aplicativo desktop Windows usando Electron. Como o Replit usa Linux, o build final deve ser feito em uma máquina Windows.

## 🔧 Pré-requisitos

- Windows 10 ou superior
- Node.js 18+ instalado
- Git instalado (opcional)

## 📋 Passos para Build

### 1. Baixar o Código

Faça download de todo o projeto do Replit ou clone o repositório.

### 2. Instalar Dependências

Abra o PowerShell ou CMD na pasta do projeto e execute:

```bash
npm install
```

### 3. Build do Frontend e Backend

```bash
npm run build
```

Isso vai gerar:
- `client/dist/` - Frontend compilado
- `dist/` - Backend compilado

### 4. Build do Executável Windows

Execute um dos comandos abaixo:

#### Instalador NSIS (recomendado)
```bash
npx electron-builder --win nsis --config electron-builder.json
```

#### Versão Portátil
```bash
npx electron-builder --win portable --config electron-builder.json
```

#### Ambos (Instalador + Portátil)
```bash
npx electron-builder --win --config electron-builder.json
```

### 5. Localizar os Arquivos

Os executáveis serão gerados na pasta `release/`:

- **Instalador**: `BRINKPDV-1.0.0-Setup.exe`
- **Portátil**: `BRINKPDV-1.0.0-Portable.exe`

## 📝 Configuração do Build

A configuração está em `electron-builder.json`:

```json
{
  "appId": "com.brinkpdv.pdv",
  "productName": "BRINKPDV",
  "asar": false,
  "win": {
    "target": ["nsis", "portable"],
    "icon": "icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "installerLanguages": ["pt_BR"]
  }
}
```

## 🚀 Scripts Disponíveis

O projeto já possui os scripts necessários no `package.json`:

- `npm run build` - Compila frontend e backend
- `npm run dev` - Modo desenvolvimento
- `npm run start` - Executa em produção

Para facilitar o build do Electron, use o script batch fornecido:
```bash
build-windows.bat
```

Ou execute manualmente os comandos em sequência:
```bash
npm run build
npx electron-builder --win --config electron-builder.json
```

## 🔍 Solução de Problemas

### Erro: "wine is required"
- Isso ocorre ao tentar fazer build no Linux/Mac
- Solução: Fazer o build em uma máquina Windows

### Erro: "electron-builder not found"
```bash
npm install electron-builder --save-dev
```

### Erro: "Cannot find module"
```bash
npm install
npm run build
```

### Executável não inicia
- Certifique-se de que executou `npm run build` antes
- Verifique se as pastas `client/dist` e `dist` existem
- Verifique o arquivo `electron-main.cjs`

## 📁 Estrutura do Executável

O executável empacotado conterá APENAS código compilado:

```
BRINKPDV/
├── electron-main.cjs      # Processo principal do Electron
├── error.html             # Página de erro  
├── icon.ico               # Ícone da aplicação
├── client/dist/           # Frontend compilado (React bundled)
│   ├── index.html
│   └── assets/            # JS e CSS bundled
├── dist/
│   └── index.js          # Backend compilado (Express bundled)
├── package.json
└── node_modules/          # Dependências de runtime
```

**Importante**: Os arquivos TypeScript source (server/, shared/) NÃO são incluídos no executável final. Todo o código é compilado e bundled antes da distribuição.

## 💾 Armazenamento de Dados

O sistema usa localStorage do navegador (Electron WebView) para persistir:
- Configurações da loja
- Usuários do sistema
- Produtos e vendas
- Configurações de impressora

Os dados ficam em:
```
%APPDATA%/BRINKPDV/
```

## 🔄 Atualização do Sistema

Para criar uma nova versão:

1. Atualize a versão em `package.json`
2. Execute o build
3. Distribua o novo executável

## 📞 Suporte

Para problemas no build, verifique:
- Logs no console durante o build
- Arquivo de log em `%APPDATA%/brinkpdv/logs/`
- Documentação do Electron Builder: https://www.electron.build/
