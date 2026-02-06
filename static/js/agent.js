const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Bibliotecas visuais (instalar: npm install chalk@4 boxen@5 figlet)
const chalk = require('chalk');
const figlet = require('figlet');
const boxen = require('boxen');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;

// === FUNÇÕES DE LOG VISUAL ===
const logInfo = (msg) => console.log(`${chalk.blue('ℹ')} ${msg}`);
const logSuccess = (msg) => console.log(`${chalk.green('✔')} ${msg}`);
const logError = (msg) => console.log(`${chalk.red('✖')} ${msg}`);
const logWarn = (msg) => console.log(`${chalk.yellow('⚠')} ${msg}`);

// Tela de Boas-vindas
function showWelcomeScreen() {
    console.clear();
    console.log(
        chalk.hex('#a277ff')(
            figlet.textSync('RoboBlocks', { horizontalLayout: 'full' })
        )
    );
    
    console.log(boxen(
        `${chalk.bold('Status:')} ${chalk.green('Online')} 🟢\n` +
        `${chalk.bold('Porta:')}  ${PORT}\n` +
        `${chalk.bold('Modo:')}   Ready to Code`,
        { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'cyan' }
    ));
    
    logInfo('Aguardando comandos da IDE...');
}

// === HELPER: Mapear Placa ===
function getBoardPackage(boardName) {
    if (boardName === 'mega') return 'arduino:avr:mega';
    if (boardName === 'nano') return 'arduino:avr:nano';
    return 'arduino:avr:uno'; // Default UNO
}

// === HELPER: Salvar Arquivo Temporário ===
function saveTempFile(code) {
    const sketchDir = path.join(process.cwd(), 'sketch_temp');
    if (!fs.existsSync(sketchDir)) fs.mkdirSync(sketchDir);
    
    const filePath = path.join(sketchDir, 'sketch_temp.ino');
    fs.writeFileSync(filePath, code);
    return filePath;
}

// Rota de Status
app.get('/status', (req, res) => {
    // Não vamos poluir o log com pings de status a cada 2 segundos
    res.json({ status: 'online', version: '2.0.0' });
});

// === ROTA 1: VERIFICAR (COMPILAR) ===
app.post('/verify', (req, res) => {
    const { code, board, arduinoPath } = req.body;
    logInfo(`Pedido de Verificação (Compile) para: ${chalk.cyan(board)}`);

    // Simulação
    if (board === "COM_TESTE" || !arduinoPath) {
        setTimeout(() => {
            logSuccess('Simulação de verificação concluída.');
            res.json({ success: true, output: "Modo Simulação: Código compilado com sucesso (Fake)." });
        }, 1500);
        return;
    }

    try {
        const filePath = saveTempFile(code);
        const boardPkg = getBoardPackage(board);
        
        // Comando --verify (apenas compila)
        const command = `"${arduinoPath}" --verify --board ${boardPkg} "${filePath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                logError('Erro na compilação.');
                return res.json({ success: false, output: stderr || error.message });
            }
            logSuccess('Código verificado com sucesso!');
            res.json({ success: true, output: stdout || "Compilação concluída sem erros." });
        });
    } catch (e) {
        logError(e.message);
        res.status(500).json({ success: false, output: e.message });
    }
});

// === ROTA 2: UPLOAD (ENVIAR) ===
app.post('/upload', (req, res) => {
    const { code, board, port, arduinoPath } = req.body;
    
    // Simulação
    if (port === "COM_TESTE") {
        logWarn('Iniciando Upload Simulado...');
        setTimeout(() => {
            logSuccess('Upload Simulado Concluído!');
            res.json({ success: true, output: "Upload Fake realizado com sucesso." });
        }, 3000);
        return;
    }

    if (!code || !board || !port) {
        return res.status(400).json({ success: false, output: 'Dados incompletos.' });
    }

    logInfo(`Iniciando Upload: ${chalk.cyan(board)} na porta ${chalk.yellow(port)}`);

    try {
        const filePath = saveTempFile(code);
        const boardPkg = getBoardPackage(board);
        
        // Comando --upload
        const command = `"${arduinoPath}" --upload --board ${boardPkg} --port ${port} "${filePath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                logError('Falha no upload.');
                return res.json({ success: false, output: stderr || error.message });
            }
            logSuccess('Upload realizado com sucesso!');
            res.json({ success: true, output: stdout });
        });

    } catch (e) {
        logError(e.message);
        res.status(500).json({ success: false, output: e.message });
    }
});

// Iniciar Servidor
app.listen(PORT, () => {
    showWelcomeScreen();
});