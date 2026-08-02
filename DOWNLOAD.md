# 📥 Como Baixar e Preparar o BRINKPDV para Instalação

## 🎯 Objetivo

Este guia explica como baixar todo o código do BRINKPDV do Replit e gerar o executável Windows (.exe) para instalação.

## 📋 Método 1: Download Direto do Replit

### Passo 1: Baixar o Projeto

1. No Replit, clique em **"⋮" (três pontos)** no canto superior direito
2. Selecione **"Download as zip"**
3. Salve o arquivo `workspace.zip` no seu computador
4. Extraia o arquivo ZIP em uma pasta (ex: `C:\BRINKPDV`)

### Passo 2: Preparar o Ambiente Windows

1. **Instale o Node.js** (se ainda não tiver):
   - Baixe de: https://nodejs.org (versão LTS recomendada)
   - Durante a instalação, marque "Add to PATH"
   - Reinicie o computador após a instalação

2. **Verifique a instalação**:
   - Abra o PowerShell ou CMD
   - Execute: `node --version` (deve mostrar v18.x.x ou superior)
   - Execute: `npm --version` (deve mostrar 9.x.x ou superior)

### Passo 3: Gerar o Executável

**Opção A - Automático (Recomendado):**

1. Navegue até a pasta do projeto no Windows Explorer
2. Clique duas vezes em `build-windows.bat`
3. Aguarde o processo completar (5-10 minutos na primeira vez)
4. Os executáveis estarão na pasta `release\`

**Opção B - Manual:**

1. Abra PowerShell ou CMD na pasta do projeto
2. Execute os comandos:

```bash
# Instalar dependências
npm install

# Build do frontend e backend
npm run build

# Gerar executável
npx electron-builder --win --config electron-builder.json
```

## 📦 Arquivos Gerados

Após o build, você terá na pasta `release/`:

### 1. BRINKPDV-1.0.0-Setup.exe
- **Tipo**: Instalador NSIS
- **Tamanho**: ~150-200 MB
- **Uso**: Instalação completa no Windows
- **Cria**: Atalhos no desktop e menu iniciar
- **Desinstalador**: Sim

### 2. BRINKPDV-1.0.0-Portable.exe
- **Tipo**: Executável portátil
- **Tamanho**: ~150-200 MB
- **Uso**: Execução direta sem instalação
- **Portátil**: Pode ser executado de pendrive
- **Desinstalador**: Não necessário (apenas delete)

## 🚀 Primeiro Uso

### Com o Instalador (Setup.exe):

1. Execute `BRINKPDV-1.0.0-Setup.exe`
2. Escolha o local de instalação
3. Aguarde a instalação
4. Execute o BRINKPDV pelo atalho criado
5. **Login padrão**: 
   - Usuário: `admin`
   - Senha: `admin`

### Com a Versão Portátil:

1. Copie `BRINKPDV-1.0.0-Portable.exe` para onde desejar
2. Execute o arquivo
3. **Login padrão**:
   - Usuário: `admin`
   - Senha: `admin`

## 🔧 Solução de Problemas

### "Node.js não é reconhecido como comando"
- Reinstale o Node.js marcando "Add to PATH"
- Reinicie o computador

### "Build falhou" ou "Erro no npm install"
```bash
# Limpar cache e tentar novamente
npm cache clean --force
npm install
npm run build
```

### "Erro ao executar electron-builder"
```bash
# Instalar electron-builder globalmente
npm install -g electron-builder
electron-builder --win
```

### Executável não inicia
- Execute como Administrador
- Desative antivírus temporariamente (pode bloquear na primeira execução)
- Verifique se o Windows está atualizado

## 📊 Estrutura de Pastas

```
BRINKPDV/
├── build-windows.bat          # Script de build automático
├── BUILD.md                   # Documentação detalhada de build
├── DOWNLOAD.md               # Este arquivo
├── electron-builder.json     # Configuração do build
├── electron-main.cjs         # Arquivo principal do Electron
├── icon.ico                  # Ícone da aplicação
├── package.json              # Dependências do projeto
├── client/                   # Frontend (React)
│   └── dist/                # Frontend compilado (após build)
├── server/                   # Backend (Express)
└── dist/                     # Backend compilado (após build)
```

## 💾 Armazenamento de Dados

O BRINKPDV armazena todos os dados localmente no computador:

- **Local**: `%APPDATA%\BRINKPDV\`
- **Inclui**: Configurações, produtos, vendas, usuários
- **Backup**: Copie esta pasta para fazer backup

## 🔄 Atualizações Futuras

Para atualizar o BRINKPDV:

1. Baixe a nova versão do Replit
2. Execute o build novamente
3. Instale sobre a versão anterior
4. Os dados serão preservados

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique `BUILD.md` para informações técnicas detalhadas
2. Consulte os logs em `%APPDATA%\BRINKPDV\logs\`
3. Verifique se todas as dependências estão instaladas

## ✅ Checklist Final

Antes de distribuir o executável:

- [ ] Build executado com sucesso
- [ ] Executável testado no Windows
- [ ] Login funcionando (admin/admin)
- [ ] Sistema abrindo normalmente
- [ ] Dados sendo salvos corretamente
- [ ] Todas as funcionalidades testadas

---

**Sistema pronto para uso!** 🎉
