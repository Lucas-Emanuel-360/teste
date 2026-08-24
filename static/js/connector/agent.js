const express = require('express');
const bodyParser = require('body-parser');
const { exec, execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const cors = require('cors');
const os = require('os');
const AdmZip = require('adm-zip');
const tar = require('tar');

const chalk = require('chalk');
const figlet = require('figlet');
const boxen = require('boxen');

const util = require('util');
const execAsync = util.promisify(exec);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;

const logInfo = (msg) => console.log(`${chalk.blue('ℹ')} ${msg}`);
const logSuccess = (msg) => console.log(`${chalk.green('✔')} ${msg}`);
const logError = (msg) => console.log(`${chalk.red('✖')} ${msg}`);
const logWarn = (msg) => console.log(`${chalk.yellow('⚠')} ${msg}`);

const baseDir = process.pkg ? path.dirname(process.execPath) : __dirname;

// =============================================================
// ARDUINO-CLI SOB DEMANDA (multiplataforma)
// =============================================================
// Em vez de embutir um .exe de ~40MB pra cada SO dentro do binário
// (o que triplicaria o tamanho do Conector), baixamos o arduino-cli
// certo pra cada plataforma na primeira execução, direto da fonte
// oficial. Fica salvo numa pasta persistente e as próximas vezes só
// reaproveitamos o que já foi baixado.

// Ajuste aqui quando quiser atualizar a versão do CLI usada pelo Conector.
const ARDUINO_CLI_VERSION = '1.5.1';

// Sentinel que o front-end manda quando o usuário não mexeu nas
// configurações avançadas (ver connector-status.js) — nesse caso
// tratamos como "usa o cli gerenciado automaticamente".
const DEFAULT_CLI_SENTINEL = 'arduino-cli.exe';

// Descobre nome do binário e do pacote a baixar pra plataforma atual.
function getPlatformTarget() {
    const platform = os.platform(); // 'win32' | 'linux' | 'darwin'
    const arch = os.arch();         // 'x64' | 'arm64' | 'ia32'

    const archMap = { x64: '64bit', ia32: '32bit', arm64: 'ARM64' };
    const archName = archMap[arch] || '64bit';

    if (platform === 'win32') {
        return {
            platform,
            binaryName: 'arduino-cli.exe',
            assetName: `arduino-cli_${ARDUINO_CLI_VERSION}_Windows_${archName}.zip`,
            isZip: true,
        };
    }
    if (platform === 'darwin') {
        return {
            platform,
            binaryName: 'arduino-cli',
            assetName: `arduino-cli_${ARDUINO_CLI_VERSION}_macOS_${archName}.tar.gz`,
            isZip: false,
        };
    }
    // linux e demais Unix caem aqui
    return {
        platform,
        binaryName: 'arduino-cli',
        assetName: `arduino-cli_${ARDUINO_CLI_VERSION}_Linux_${archName}.tar.gz`,
        isZip: false,
    };
}

// Pasta de dados persistente, no padrão de cada SO.
function getAppDataDir() {
    const platform = os.platform();
    if (platform === 'win32') {
        return path.join(process.env.LOCALAPPDATA || process.env.APPDATA || os.tmpdir(), 'RoboBlocks');
    }
    if (platform === 'darwin') {
        return path.join(os.homedir(), 'Library', 'Application Support', 'RoboBlocks');
    }
    return path.join(process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share'), 'RoboBlocks');
}

const APP_DATA_DIR = getAppDataDir();
const MANAGED_CLI_DIR = path.join(APP_DATA_DIR, 'bin');

// Baixa um arquivo seguindo redirecionamentos (downloads.arduino.cc
// costuma redirecionar pro CDN antes de servir o arquivo de verdade).
function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const request = (targetUrl) => {
            https.get(targetUrl, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    return request(res.headers.location);
                }
                if (res.statusCode !== 200) {
                    return reject(new Error(`Download falhou com status ${res.statusCode}`));
                }
                const fileStream = fs.createWriteStream(destPath);
                res.pipe(fileStream);
                fileStream.on('finish', () => fileStream.close(resolve));
                fileStream.on('error', reject);
            }).on('error', reject);
        };
        request(url);
    });
}

async function extractArchive(archivePath, destDir, isZip) {
    if (isZip) {
        new AdmZip(archivePath).extractAllTo(destDir, true);
    } else {
        await tar.x({ file: archivePath, cwd: destDir });
    }
}

// Garante que o arduino-cli certo pra essa plataforma está disponível
// localmente. Idempotente: se já foi baixado antes, só devolve o path.
async function ensureManagedCli() {
    const target = getPlatformTarget();
    const managedPath = path.join(MANAGED_CLI_DIR, target.binaryName);

    if (fs.existsSync(managedPath) && fs.statSync(managedPath).size > 0) {
        return managedPath;
    }

    logInfo(`Primeira execução: baixando arduino-cli v${ARDUINO_CLI_VERSION} para ${target.platform}...`);
    fs.mkdirSync(MANAGED_CLI_DIR, { recursive: true });

    const downloadUrl = `https://downloads.arduino.cc/arduino-cli/${target.assetName}`;
    const archivePath = path.join(MANAGED_CLI_DIR, target.assetName);

    try {
        await downloadFile(downloadUrl, archivePath);
        await extractArchive(archivePath, MANAGED_CLI_DIR, target.isZip);
        fs.unlinkSync(archivePath); // só o binário interessa, descarta o zip/tar.gz

        // Linux e macOS não vêm com a permissão de execução setada depois
        // de extraído — sem isso, execFile derruba EACCES.
        if (target.platform !== 'win32') {
            fs.chmodSync(managedPath, 0o755);
        }

        logSuccess(`arduino-cli pronto em: ${managedPath}`);
        return managedPath;
    } catch (e) {
        logError(`Não foi possível baixar o arduino-cli: ${e.message}`);
        throw e;
    }
}

// Resolve o caminho do arduino-cli a usar numa chamada específica:
// - Config padrão (ou nada enviado) → cli gerenciado automaticamente.
// - Caminho absoluto customizado pelo usuário (avançado) → respeita.
async function resolveCliPath(arduinoPath) {
    if (!arduinoPath || arduinoPath === DEFAULT_CLI_SENTINEL) {
        return ensureManagedCli();
    }
    return path.isAbsolute(arduinoPath) ? arduinoPath : path.join(baseDir, arduinoPath);
}

// =============================================================
// INSTALAÇÃO DINÂMICA DE BIBLIOTECAS (sem mudanças)
// =============================================================
const CORE_HEADERS = new Set([
    'Arduino.h', 'Wire.h', 'SPI.h', 'EEPROM.h',
    'math.h', 'string.h', 'stdio.h', 'stdlib.h',
]);

const HEADER_TO_LIBRARY = {
    'LiquidCrystal.h': 'LiquidCrystal',
    'Servo.h': 'Servo',
    'OneWire.h': 'OneWire',
    'DallasTemperature.h': 'DallasTemperature',
};

const librariesConfirmed = new Set();

function extractIncludedHeaders(code) {
    const regex = /#include\s*[<"]([^">]+)[>"]/g;
    const headers = new Set();
    let match;
    while ((match = regex.exec(code)) !== null) {
        headers.add(match[1]);
    }
    return headers;
}

async function ensureLibrariesForCode(code, cliPath) {
    const headers = extractIncludedHeaders(code);

    for (const header of headers) {
        if (CORE_HEADERS.has(header)) continue;
        if (librariesConfirmed.has(header)) continue;

        const libName = HEADER_TO_LIBRARY[header] || header.replace(/\.h$/, '');

        try {
            logInfo(`Verificando biblioteca necessária: ${libName} (de #include <${header}>)...`);
            await execAsync(`"${cliPath}" lib install "${libName}"`);
            logSuccess(`Biblioteca ${libName} pronta para uso!`);
            librariesConfirmed.add(header);
        } catch (err) {
            logWarn(`Não foi possível instalar automaticamente "${libName}": ${err.message}`);
        }
    }
}

function showWelcomeScreen() {
    console.clear();
    console.log(chalk.hex('#a277ff')(figlet.textSync('RoboBlocks', { horizontalLayout: 'full' })));

    console.log(boxen(
        `${chalk.bold('Status:')} ${chalk.green('Online')} 🟢\n` +
        `${chalk.bold('Porta:')}  ${PORT}\n` +
        `${chalk.bold('SO:')}     ${os.platform()} (${os.arch()})\n` +
        `${chalk.bold('Motor:')}  Arduino CLI (Gerenciado)`,
        { padding: 1, margin: 1, borderStyle: 'round', borderColor: 'cyan' }
    ));

    logInfo('Verificando dependências do Arduino (pode demorar na 1ª vez)...');

    (async () => {
        try {
            const cliPath = await ensureManagedCli();
            exec(`"${cliPath}" core install arduino:avr`, (err) => {
                if (err) {
                    logWarn('Aviso: Não foi possível atualizar as placas (sem internet na 1ª vez?).');
                } else {
                    logSuccess('Placas (Uno/Mega/Nano) prontas para uso!');
                }
                logInfo('Aguardando comandos da IDE pelo navegador...');
            });
        } catch (e) {
            logError('Não foi possível preparar o arduino-cli. O Conector vai iniciar mesmo assim.');
        }
    })();
}

function getFQBN(boardName) {
    if (boardName === 'mega') return 'arduino:avr:mega';
    if (boardName === 'nano') return 'arduino:avr:nano';
    return 'arduino:avr:uno';
}

function saveTempFile(code) {
    const sketchDir = path.join(os.tmpdir(), 'sketch_temp');
    if (!fs.existsSync(sketchDir)) fs.mkdirSync(sketchDir);

    const filePath = path.join(sketchDir, 'sketch_temp.ino');
    fs.writeFileSync(filePath, code);
    return sketchDir;
}

app.get('/status', (req, res) => {
    res.json({ status: 'online', engine: 'arduino-cli', version: '2.1.0' });
});

app.get('/ports', async (req, res) => {
    const arduinoPath = req.query.arduinoPath;

    logInfo('Buscando portas seriais conectadas...');
    const simulatedPort = { address: 'COM_TESTE', label: '🧪 Simulação (Teste)' };

    let targetCli;
    try {
        targetCli = await resolveCliPath(arduinoPath);
    } catch (e) {
        logError(`Não foi possível preparar o arduino-cli: ${e.message}`);
        return res.json({ success: true, ports: [simulatedPort], output: e.message });
    }

    execFile(targetCli, ['board', 'list', '--format', 'json'], (error, stdout, stderr) => {
        if (error) {
            logWarn('Não foi possível listar as portas (arduino-cli falhou ao iniciar?).');
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

app.post('/verify', async (req, res) => {
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
        const fqbn = getFQBN(board);
        const targetCli = await resolveCliPath(arduinoPath);

        await ensureLibrariesForCode(code, targetCli);
        const sketchDir = saveTempFile(code);

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

app.post('/upload', async (req, res) => {
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
        const fqbn = getFQBN(board);
        const targetCli = await resolveCliPath(arduinoPath);

        await ensureLibrariesForCode(code, targetCli);
        const sketchDir = saveTempFile(code);

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