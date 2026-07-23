const express = require('express');
const bodyParser = require('body-parser');
const { exec, execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const os = require('os'); // Acesso à pasta temporária e pasta de dados do usuário

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

// Quando compilado com pkg, __dirname aponta pra dentro do snapshot virtual do executável,
// não pra pasta real no disco. process.execPath é o caminho real do .exe nesse caso.
const baseDir = process.pkg ? path.dirname(process.execPath) : __dirname;

// =============================================================
// ARDUINO-CLI EMBUTIDO
// =============================================================
// O arduino-cli.exe agora vai DENTRO do próprio executável do Conector
// (via "assets" do pkg no package.json). fs.readFileSync consegue ler
// esse arquivo normalmente a partir de __dirname, mesmo dentro do
// snapshot virtual — é assim que o pkg expõe os assets embutidos.
//
// Só que não dá pra RODAR (execFile) um binário que está "dentro" do
// snapshot virtual. Por isso, na primeira execução, extraímos o
// arduino-cli.exe pra uma pasta real e persistente no disco do usuário,
// e nas próximas vezes só reaproveitamos o que já foi extraído.
const BUNDLED_CLI_PATH = path.join(__dirname, 'RoboBlocks_Conector', 'arduino-cli.exe');

const APP_DATA_DIR = path.join(process.env.LOCALAPPDATA || process.env.APPDATA || os.tmpdir(), 'RoboBlocks');
const MANAGED_CLI_DIR = path.join(APP_DATA_DIR, 'bin');
const MANAGED_CLI_PATH = path.join(MANAGED_CLI_DIR, 'arduino-cli.exe');

// Valor padrão que o frontend manda quando o usuário nunca mexeu nas
// configurações (ver connector-status.js). Quando o valor recebido é
// exatamente esse "default", tratamos como "usar o cli gerenciado
// automaticamente" em vez de resolver como um caminho de arquivo
// literal. Isso mantém compatibilidade total com o frontend existente,
// sem precisar mudar uma linha lá.
const DEFAULT_CLI_SENTINEL = 'arduino-cli.exe';

// Extrai o arduino-cli embutido pra uma pasta persistente, se ainda não
// tiver sido extraído antes. Idempotente: em execuções seguintes, só
// confere se o arquivo já existe e devolve o caminho, sem reescrever
// dezenas de MB em disco toda vez que o Conector abre.
function ensureManagedCli() {
    try {
        if (fs.existsSync(MANAGED_CLI_PATH) && fs.statSync(MANAGED_CLI_PATH).size > 0) {
            return MANAGED_CLI_PATH;
        }

        logInfo('Primeira execução: extraindo arduino-cli embutido no executável...');
        fs.mkdirSync(MANAGED_CLI_DIR, { recursive: true });

        const cliBuffer = fs.readFileSync(BUNDLED_CLI_PATH);
        fs.writeFileSync(MANAGED_CLI_PATH, cliBuffer);

        logSuccess(`arduino-cli pronto em: ${MANAGED_CLI_PATH}`);
        return MANAGED_CLI_PATH;
    } catch (e) {
        logError(`Não foi possível extrair o arduino-cli embutido: ${e.message}`);
        // Fallback pro comportamento antigo (dois arquivos soltos na
        // mesma pasta), só por segurança/compatibilidade.
        return path.join(baseDir, 'arduino-cli.exe');
    }
}

// Resolve o caminho do arduino-cli a usar numa chamada específica:
// - Config padrão (ou nada enviado) → cli gerenciado automaticamente.
// - Caminho absoluto customizado pelo usuário (avançado) → respeita.
function resolveCliPath(arduinoPath) {
    if (!arduinoPath || arduinoPath === DEFAULT_CLI_SENTINEL) {
        return ensureManagedCli();
    }
    return path.isAbsolute(arduinoPath) ? arduinoPath : path.join(baseDir, arduinoPath);
}

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
        `${chalk.bold('Motor:')}  Arduino CLI (Embutido)`,
        { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'cyan' }
    ));

    logInfo('Verificando dependências do Arduino (pode demorar na 1ª vez)...');

    // Garante que o arduino-cli embutido já foi extraído antes de usá-lo
    const cliPath = ensureManagedCli();

    exec(`"${cliPath}" core install arduino:avr`, (err, stdout, stderr) => {
        if (err) {
            logWarn('Aviso: Não foi possível atualizar as placas (sem internet na 1ª vez?).');
        } else {
            logSuccess('Placas (Uno/Mega/Nano) prontas para uso!');

            // Instala a biblioteca Servo automaticamente
            logInfo('Verificando bibliotecas essenciais...');
            exec(`"${cliPath}" lib install Servo`, (errLib) => {
                if (!errLib) logSuccess('Biblioteca Servo pronta para uso!');
            });
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
    // Aponta para a pasta temporária do próprio SO em vez da pasta do projeto
    const sketchDir = path.join(os.tmpdir(), 'sketch_temp');
    if (!fs.existsSync(sketchDir)) fs.mkdirSync(sketchDir);

    const filePath = path.join(sketchDir, 'sketch_temp.ino');
    fs.writeFileSync(filePath, code);
    return sketchDir;
}

app.get('/status', (req, res) => {
    res.json({ status: 'online', engine: 'arduino-cli', version: '2.1.0' });
});

// === ROTA NOVA: LISTAR PORTAS DISPONÍVEIS ===
app.get('/ports', (req, res) => {
    const arduinoPath = req.query.arduinoPath;
    const targetCli = resolveCliPath(arduinoPath);

    logInfo('Buscando portas seriais conectadas...');

    execFile(targetCli, ['board', 'list', '--format', 'json'], (error, stdout, stderr) => {
        // Sempre oferece a porta de simulação, mesmo se o arduino-cli falhar
        const simulatedPort = { address: 'COM_TESTE', label: '🧪 Simulação (Teste)' };

        if (error) {
            logWarn('Não foi possível listar as portas (arduino-cli embutido falhou ao iniciar?).');
            logError(`Detalhe: ${error.message}`);
            if (stderr) logError(`Stderr: ${stderr}`);
            return res.json({ success: true, ports: [simulatedPort], output: stderr || error.message });
        }

        try {
            const data = JSON.parse(stdout);
            const detected = data.detected_ports || data || [];

            const ports = detected
                .map((entry) => {
                    const address = entry.port && entry.port.address ? entry.port.address : entry.address;
                    if (!address) return null;
                    const boardName = entry.matching_boards && entry.matching_boards[0]
                        ? entry.matching_boards[0].name
                        : null;
                    return { address, label: boardName ? `${address} — ${boardName}` : address };
                })
                .filter(Boolean);

            ports.push(simulatedPort);
            logSuccess(`${ports.length - 1} porta(s) real(is) encontrada(s).`);
            res.json({ success: true, ports });
        } catch (e) {
            logError('Erro ao interpretar a saída do arduino-cli.');
            res.json({ success: true, ports: [simulatedPort], output: e.message });
        }
    });
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
        const targetCli = resolveCliPath(arduinoPath);

        // --no-color adicionado para limpar os caracteres ANSI no front-end
        execFile(targetCli, ['compile', '--no-color', '--fqbn', fqbn, sketchDir], (error, stdout, stderr) => {
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
        const targetCli = resolveCliPath(arduinoPath);

        // --no-color adicionado para limpar os caracteres ANSI no front-end
        execFile(targetCli, ['compile', '--upload', '--no-color', '--fqbn', fqbn, '-p', port, sketchDir], (error, stdout, stderr) => {
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