const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// Bibliotecas visuais
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
        `${chalk.bold('Motor:')}  Arduino CLI (Integrado)`,
        { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'cyan' }
    ));
    
    logInfo('Verificando dependências do Arduino (pode demorar na 1ª vez)...');
    
    // Tenta instalar os cores automaticamente usando o executável local na mesma pasta
    const cliPath = path.join(__dirname, 'arduino-cli.exe');
    exec(`"${cliPath}" core install arduino:avr`, (err, stdout, stderr) => {
        if (err) {
            logWarn('Aviso: Não foi possível atualizar as placas. O arduino-cli.exe está na mesma pasta?');
        } else {
            logSuccess('Placas (Uno/Mega/Nano) prontas para uso!');
        }
        logInfo('Aguardando comandos da IDE pelo navegador...');
    });
}

// === HELPER: Mapear Placa para FQBN do arduino-cli ===
function getFQBN(boardName) {
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
    return sketchDir;
}

app.get('/status', (req, res) => {
    res.json({ status: 'online', engine: 'arduino-cli', version: '2.1.0' });
});

// === ROTA 1: VERIFICAR (COMPILAR) ===
app.post('/verify', (req, res) => {
    const { code, board, arduinoPath } = req.body;
    logInfo(`Pedido de Verificação (Compile) para: ${chalk.cyan(board)}`);

    if (board === "COM_TESTE") {
        setTimeout(() => {
            logSuccess('Simulação de verificação concluída.');
            res.json({ success: true, output: "Modo Simulação: Código compilado com sucesso (Fake)." });
        }, 1500);
        return;
    }

    try {
        const sketchDir = saveTempFile(code);
        const fqbn = getFQBN(board);
        
        // Garante que pega do frontend ou tenta da pasta atual
        const targetCli = arduinoPath || path.join(__dirname, 'arduino-cli.exe');
        
        const command = `"${targetCli}" compile --fqbn ${fqbn} "${sketchDir}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                logError('Erro na compilação.');
                return res.json({ success: false, output: stdout + "\n" + stderr });
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
        const sketchDir = saveTempFile(code);
        const fqbn = getFQBN(board);
        
        const targetCli = arduinoPath || path.join(__dirname, 'arduino-cli.exe');
        const command = `"${targetCli}" compile --upload --fqbn ${fqbn} -p ${port} "${sketchDir}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                logError('Falha no upload.');
                return res.json({ success: false, output: stdout + "\n" + stderr });
            }
            logSuccess('Upload realizado com sucesso!');
            res.json({ success: true, output: stdout });
        });

    } catch (e) {
        logError(e.message);
        res.status(500).json({ success: false, output: e.message });
    }
});

app.listen(PORT, () => {
    showWelcomeScreen();
});