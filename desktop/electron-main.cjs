const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');

let serverProcess = null;
let mainWindow = null;
const isDev = process.env.NODE_ENV === 'development';
const SERVER_PORT = 5000;

// Função para salvar logs de erro
function logError(message, error) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n${error ? error.stack || error : ''}\n\n`;
  
  // Log no console
  console.error(message, error);
  
  // Salva em arquivo se não for desenvolvimento
  if (!isDev) {
    try {
      const logDir = path.join(app.getPath('userData'), 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logFile = path.join(logDir, 'brinkpdv-errors.log');
      fs.appendFileSync(logFile, logMessage);
    } catch (e) {
      console.error('Falha ao salvar log:', e);
    }
  }
}

// Função para mostrar erro ao usuário
async function showErrorDialog(title, message, details) {
  logError(`${title}: ${message}`, details);
  
  if (!isDev) {
    await dialog.showMessageBox({
      type: 'error',
      title: title,
      message: message,
      detail: details ? (details.stack || details.toString()) : '',
      buttons: ['OK']
    });
  }
}

function startServer() {
  console.log(`[BRINKPDV] Modo: ${isDev ? 'Desenvolvimento' : 'Produção'}`);
  console.log('[BRINKPDV] Iniciando servidor Express...');

  if (isDev) {
    // Em desenvolvimento, spawna processo separado com tsx
    const serverScript = path.join(__dirname, '..', 'server', 'index.ts');
    const serverCommand = 'npx';
    const serverArgs = ['tsx', serverScript];
    const spawnOptions = {
      cwd: __dirname,
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, NODE_ENV: 'development' }
    };

    serverProcess = spawn(serverCommand, serverArgs, spawnOptions);

    serverProcess.stdout.on('data', (data) => {
      console.log(`[Servidor] ${data.toString().trim()}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[Servidor Erro] ${data.toString().trim()}`);
    });

    serverProcess.on('error', (error) => {
      console.error('[ERRO] Falha ao iniciar servidor:', error);
    });

    serverProcess.on('close', (code) => {
      console.log(`[Servidor] Processo encerrado com código ${code}`);
    });
  } else {
    // Em produção, carrega servidor no mesmo processo (não precisa de Node.js separado)
    // No executável empacotado (asar:false), os arquivos ficam em __dirname
    const distPath = path.join(__dirname, '..', 'dist', 'index.js');
    
    if (!fs.existsSync(distPath)) {
      const errorMsg = 'Arquivo do servidor não encontrado';
      const errorDetails = `
Caminho esperado: ${distPath}
__dirname: ${__dirname}
resourcesPath: ${process.resourcesPath}

Este erro ocorre quando o executável foi criado sem compilar o backend.
Execute "npm run build" antes de "build-windows.bat".
      `.trim();
      
      showErrorDialog('Erro de Build', errorMsg, errorDetails);
      return false;
    }
    
    console.log('[BRINKPDV] Arquivo do servidor encontrado:', distPath);

    console.log('[BRINKPDV] Carregando servidor no mesmo processo...');
    
    // Define NODE_ENV antes de carregar
    process.env.NODE_ENV = 'production';
    process.env.PORT = String(SERVER_PORT);
    
    // Carrega o servidor usando import dinâmico (ESM)
    // Converte caminho Windows para URL format
    const fileUrl = require('url').pathToFileURL(distPath).href;
    
    import(fileUrl)
      .then(() => {
        console.log('[BRINKPDV] ✓ Servidor carregado com sucesso!');
      })
      .catch(async (error) => {
        const errorMsg = 'Falha ao carregar servidor Express';
        const errorDetails = `
Arquivo: ${distPath}
Erro: ${error.message}
Stack: ${error.stack || 'N/A'}

Possíveis causas:
1. Módulo nativo incompatível (ex: bcrypt compilado para versão errada do Node.js)
2. Dependência faltando no executável
3. Erro de sintaxe no código do servidor

Electron: ${process.versions.electron}
Node: ${process.versions.node}
        `.trim();
        
        await showErrorDialog('Erro ao Iniciar Servidor', errorMsg, errorDetails);
      });
  }

  return true;
}

function checkServerReady(retries = 30, interval = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const tryConnect = () => {
      attempts++;
      console.log(`[BRINKPDV] Verificando servidor... (tentativa ${attempts}/${retries})`);
      
      const req = http.get(`http://localhost:${SERVER_PORT}/`, (res) => {
        console.log('[BRINKPDV] ✓ Servidor está pronto!');
        resolve(true);
      });
      
      req.on('error', (err) => {
        if (attempts >= retries) {
          console.error('[ERRO] Servidor não respondeu após múltiplas tentativas');
          reject(new Error('Servidor não disponível'));
        } else {
          setTimeout(tryConnect, interval);
        }
      });
      
      req.setTimeout(500, () => {
        req.destroy();
        if (attempts >= retries) {
          reject(new Error('Timeout ao conectar ao servidor'));
        } else {
          setTimeout(tryConnect, interval);
        }
      });
    };
    
    tryConnect();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'BRINKPDV - Sistema PDV',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    autoHideMenuBar: true,
    backgroundColor: '#ffffff',
    show: false
  });

  const serverStarted = startServer();
  
  if (!serverStarted) {
    mainWindow.loadFile(path.join(__dirname, 'error.html'));
    mainWindow.show();
    return;
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`[ERRO] Falha ao carregar: ${errorDescription} (código: ${errorCode})`);
    mainWindow.loadFile(path.join(__dirname, 'error.html'));
    mainWindow.show();
  });

  // Aguarda o servidor estar pronto antes de carregar a interface
  checkServerReady(30, 1000)
    .then(() => {
      console.log('[BRINKPDV] Carregando interface...');
      mainWindow.loadURL(`http://localhost:${SERVER_PORT}`);
    })
    .catch((err) => {
      console.error('[ERRO] Servidor não iniciou:', err.message);
      mainWindow.loadFile(path.join(__dirname, 'error.html'));
      mainWindow.show();
    });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess && isDev) {
    console.log('Encerrando servidor...');
    serverProcess.kill();
  }
  app.quit();
});

app.on('will-quit', () => {
  if (serverProcess && isDev) {
    serverProcess.kill();
  }
});

process.on('exit', () => {
  if (serverProcess && isDev) {
    serverProcess.kill();
  }
});
