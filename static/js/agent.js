const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors()); // Permite acesso do navegador
app.use(bodyParser.json());

// Verifica se está online
app.get('/status', (req, res) => {
    res.json({ status: 'online', version: '1.0.0' });
});

// Faz o Upload
app.post('/upload', (req, res) => {
    const { code, board, port, arduinoPath } = req.body;

    console.log(`>>> Pedido de upload: ${board} na porta ${port}`);

    // === MODO SIMULAÇÃO ===
    // Se a porta for a de teste, finge que fez o upload
    if (port === "COM_TESTE") {
        console.log("⚠️ MODO SIMULAÇÃO ATIVADO");
        console.log("Fingindo que estou enviando para o Arduino...");
        
        // Simula uma demora de 3 segundos (tempo real de um upload)
        setTimeout(() => {
            console.log(">>> Upload 'Fake' concluído!");
            return res.json({ 
                success: true, 
                output: "MODO SIMULAÇÃO:\nO código foi compilado e enviado (de mentirinha).\nNenhum Arduino foi ferido neste teste." 
            });
        }, 3000);
        return; // Para aqui e não executa o resto
    }
    // ======================================

    if (!code || !board || !port || !arduinoPath) {
        return res.status(400).json({ success: false, output: 'Faltam parâmetros.' });
    }

    // 1. Criar pasta temporária
    const sketchDir = path.join(process.cwd(), 'sketch_temp');
    if (!fs.existsSync(sketchDir)) fs.mkdirSync(sketchDir);

    // 2. Salvar .ino
    const filePath = path.join(sketchDir, 'sketch_temp.ino');
    try {
        fs.writeFileSync(filePath, code);
    } catch (e) {
        return res.status(500).json({ success: false, output: 'Erro ao salvar arquivo: ' + e.message });
    }

    // 3. Montar comando (Arduino CLI antigo via debug)
    // Sintaxe: arduino_debug.exe --upload --board pacote:arch:placa --port COMx arquivo.ino
    const boardPackage = board === 'mega' ? 'arduino:avr:mega' : 
                         board === 'nano' ? 'arduino:avr:nano' : 
                         'arduino:avr:uno';

    const command = `"${arduinoPath}" --upload --board ${boardPackage} --port ${port} "${filePath}"`;

    console.log(`>>> Executando: ${command}`);

    // 4. Executar
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro: ${error.message}`);
            return res.json({ success: false, output: stderr || error.message });
        }
        console.log('>>> Sucesso!');
        res.json({ success: true, output: stdout });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log('=============================================');
    console.log(`⚡ MyMaker Connector rodando na porta ${PORT}`);
    console.log('   Mantenha esta janela aberta para usar a IDE.');
    console.log('=============================================');
});