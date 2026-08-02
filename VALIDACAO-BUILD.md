# ✅ Checklist de Validação do Build

Este documento contém os passos necessários para validar que o build do BRINKPDV foi feito corretamente no Windows.

## 🔍 Antes do Build

### 1. Verificar Arquivos Compilados

Após executar `npm run build`, verifique:

```bash
# Deve existir:
dir client\dist\index.html
dir dist\index.js

# Não deve ter erros
```

**Esperado:**
- ✅ `client/dist/` contém `index.html` e pasta `assets/`
- ✅ `dist/` contém `index.js`

### 2. Executar electron-builder

```bash
npx electron-builder --win --config electron-builder.json
```

**Esperado:**
- ✅ Build completa sem erros
- ✅ Pasta `release/` é criada
- ✅ Arquivos gerados:
  - `BRINKPDV-1.0.0-Setup.exe`
  - `BRINKPDV-1.0.0-Portable.exe`

## 🔬 Validação do Executável

### 3. Verificar Conteúdo do Executável

Navegue até `release/win-unpacked/resources/app/` e verifique:

#### ✅ Arquivos que DEVEM EXISTIR:
```
electron-main.cjs
error.html
icon.ico
package.json
client/dist/index.html
client/dist/assets/*.js
client/dist/assets/*.css
dist/index.js
node_modules/ (pasta)
```

#### ❌ Arquivos que NÃO DEVEM EXISTIR:
```
server/*.ts          ❌ Código TypeScript do backend
server/index.ts      ❌
server/routes.ts     ❌
server/storage.ts    ❌
shared/*.ts          ❌ Código TypeScript compartilhado
shared/schema.ts     ❌
```

### 4. Comando de Validação Automática

Execute no PowerShell dentro de `release/win-unpacked/resources/app/`:

```powershell
# Verificar se há arquivos .ts (NÃO DEVEM EXISTIR)
Get-ChildItem -Recurse -Filter *.ts -Exclude node_modules | Format-Table Name, DirectoryName

# Se retornar vazio = ✅ CORRETO
# Se listar arquivos .ts = ❌ INCORRETO (tem source code)
```

## 🚀 Teste de Execução

### 5. Testar Instalador

1. Execute `BRINKPDV-1.0.0-Setup.exe`
2. Instale em uma pasta de teste
3. Execute o BRINKPDV pelo atalho
4. **Verificar:**
   - ✅ Sistema abre sem erros
   - ✅ Tela de login aparece
   - ✅ Login com admin/admin funciona
   - ✅ Dashboard carrega corretamente
   - ✅ Todas as páginas funcionam

### 6. Testar Versão Portátil

1. Execute `BRINKPDV-1.0.0-Portable.exe` direto
2. **Verificar:**
   - ✅ Sistema abre sem erros
   - ✅ Tela de login aparece
   - ✅ Login funciona
   - ✅ Sistema funcional

### 7. Teste de Funcionalidades

Execute estes testes básicos:

#### Login/Logout
- [ ] Login com admin/admin
- [ ] Usuário aparece no cabeçalho
- [ ] Logout funciona
- [ ] Volta para tela de login

#### Configurações
- [ ] Alterar nome da loja
- [ ] Nome atualiza no cabeçalho
- [ ] Upload de logo funciona
- [ ] Criar novo usuário

#### Navegação
- [ ] Todas as páginas abrem
- [ ] Sidebar funciona
- [ ] Tema claro/escuro alterna

#### Persistência
- [ ] Fechar e reabrir sistema
- [ ] Dados permanecem salvos
- [ ] Login mantém sessão (se marcado)

## 🐛 Problemas Comuns

### Erro: "Cannot find module"
**Causa:** Arquivos TypeScript (.ts) foram incluídos no build  
**Solução:** Verificar passo 3 e 4 acima - garantir que NÃO há arquivos .ts

### Erro ao iniciar
**Causa:** Build incompleto ou arquivos faltando  
**Solução:** 
1. Deletar pasta `release/`
2. Executar `npm run build` novamente
3. Executar `electron-builder` novamente

### "electron-main.cjs not found"
**Causa:** Arquivo principal não foi copiado  
**Solução:** Verificar electron-builder.json

## ✅ Checklist Final

Antes de distribuir o executável:

- [ ] Build executado com sucesso
- [ ] NÃO contém arquivos .ts (verificado no passo 4)
- [ ] Instalador testado
- [ ] Versão portátil testada
- [ ] Login funcionando
- [ ] Todas funcionalidades testadas
- [ ] Dados persistindo corretamente
- [ ] Tema alternando
- [ ] Sidebar funcionando

## 📝 Notas de Depuração

Se encontrar problemas:

1. **Logs do sistema:**
   ```
   %APPDATA%\BRINKPDV\logs\
   ```

2. **Logs do Electron:**
   - Abra DevTools: `Ctrl + Shift + I`
   - Veja console de erros

3. **Logs do Build:**
   - Salve a saída do comando electron-builder
   - Procure por warnings ou erros

## 📧 Reportar Problemas

Se a validação falhar:

1. Capture prints da tela
2. Copie mensagens de erro completas
3. Execute o comando de validação (passo 4)
4. Documente os passos para reproduzir
5. Inclua versão do Windows e Node.js

---

**Sistema validado e funcionando corretamente!** ✅
