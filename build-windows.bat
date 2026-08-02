@echo off
echo ========================================
echo   BRINKPDV - Build para Windows
echo ========================================
echo.

echo Verificando dependencias...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: npm nao encontrado. Instale Node.js primeiro.
    pause
    exit /b 1
)

echo.
echo Passo 1: Instalando dependencias...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Erro ao instalar dependencias!
    pause
    exit /b 1
)

echo.
echo Passo 2: Construindo frontend e backend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Erro ao construir projeto!
    pause
    exit /b 1
)

echo.
echo Passo 3: Verificando arquivos de build...
if not exist "client\dist\index.html" (
    echo ERRO: Frontend nao foi construido! Arquivo client\dist\index.html nao encontrado.
    pause
    exit /b 1
)
if not exist "dist\index.js" (
    echo ERRO: Backend nao foi construido! Arquivo dist\index.js nao encontrado.
    pause
    exit /b 1
)
echo Arquivos de build verificados com sucesso!

echo.
echo Passo 4: Verificando icone...
if not exist "icon.ico" (
    echo AVISO: Icone nao encontrado. Usando icone padrao.
)

echo.
echo Passo 5: Gerando executavel Windows...
echo Isso pode demorar 5-10 minutos na primeira vez...
call npx electron-builder --win --x64 --config electron-builder.json
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Erro ao gerar executavel!
    echo Tente executar manualmente:
    echo   npx electron-builder --win --x64 --config electron-builder.json
    pause
    exit /b 1
)

echo.
echo ======================================
echo   Build concluido com sucesso!
echo ======================================
echo.
echo Arquivos gerados em: .\release\
echo.
echo Arquivos disponiveis:
echo   - BRINKPDV-1.0.0-Setup.exe
echo      Instalador completo com assistente
echo   - BRINKPDV-1.0.0-Portable.exe
echo      Executavel portatil (sem instalacao)
echo.
echo Para testar localmente antes do build:
echo    npx electron .
echo.
echo Leia BUILD.md para mais informacoes
echo.
explorer release 2>nul
echo.
pause
