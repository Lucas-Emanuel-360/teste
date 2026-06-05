// =============================================================
// MONTAGEM VIRTUAL DE HARDWARE - ROBOBLOCKS (SIMULAÇÃO + MANHATTAN)
// =============================================================

let componentCounter = 0;
let plataformaAtual = 'uno';

let zoomScale = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let startPanX = 0;
let startPanY = 0;

function getPortasDaPlaca(plataforma) {
    let portas = [
        { id: '', label: 'Nenhuma' },
        { id: '_5V', label: 'Energia (5V)' },
        { id: '_3.3V', label: 'Energia (3.3V)' },
        { id: 'GND1', label: 'Terra (GND 1)' },
        { id: 'GND2', label: 'Terra (GND 2)' },
        { id: 'GND3', label: 'Terra (GND 3)' }
    ];

    if (plataforma === 'mega') {
        portas.push({ id: 'GND4', label: 'Terra (GND 4)' });
        portas.push({ id: 'GND5', label: 'Terra (GND 5)' });
    }

    let maxAnalog = plataforma === 'mega' ? 15 : 5;
    for (let i = 0; i <= maxAnalog; i++) {
        portas.push({ id: `A${i}`, label: `Analógico A${i}` });
    }

    let maxDigital = plataforma === 'mega' ? 53 : 13;
    for (let i = 0; i <= maxDigital; i++) {
        let isPWM = [3, 5, 6, 9, 10, 11].includes(i);
        if (plataforma === 'mega' && ((i >= 2 && i <= 13) || (i >= 44 && i <= 46))) {
            isPWM = true;
        }
        let prefix = isPWM ? '~' : '';
        portas.push({ id: `_${i}`, label: `Digital ${prefix}${i}` });
    }
    return portas;
}

// --- FUNÇÕES GLOBAIS DE INTERFACE ---
window.abrirMontagem = function() {
    const overlay = document.getElementById('hardwareOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
        carregarPlacaParaMontagem();
        setTimeout(() => { if(window.atualizarConexoes) window.atualizarConexoes(); }, 150);
    }
};

window.fecharMontagem = function() {
    const overlay = document.getElementById('hardwareOverlay');
    if (overlay) overlay.style.display = 'none';
    if (window.salvarHardwareConfig) window.salvarHardwareConfig();
};

window.alterarZoomManual = function(fator) {
    let newScale = zoomScale * fator;
    newScale = Math.max(0.3, Math.min(newScale, 3));
    
    const workspace = document.getElementById('hardwareWorkspace');
    if (!workspace) return;

    const rect = workspace.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    panX = centerX - (centerX - panX) * (newScale / zoomScale);
    panY = centerY - (centerY - panY) * (newScale / zoomScale);
    zoomScale = newScale;
    aplicarTransformacaoCamera();
};

window.resetarZoom = function() {
    zoomScale = 1; panX = 0; panY = 0; 
    aplicarTransformacaoCamera();
};

function aplicarTransformacaoCamera() {
    const assemblyCanvas = document.getElementById('assemblyCanvas');
    if (assemblyCanvas) {
        assemblyCanvas.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomScale})`;
    }
}

// --- EVENTOS DO RATO PARA ZOOM E PAN ---
document.addEventListener('DOMContentLoaded', () => {
    const workspace = document.getElementById('hardwareWorkspace');
    if (workspace) {
        workspace.addEventListener('mousedown', (e) => {
            if (e.target.closest('.component-card') || e.target.closest('.floating-toolbox') || e.target.closest('.zoom-controls') || e.target.tagName === 'BUTTON') return;
            isPanning = true;
            startPanX = e.clientX - panX;
            startPanY = e.clientY - panY;
            workspace.style.cursor = 'grabbing';
        });

        workspace.addEventListener('wheel', (e) => {
            if (e.target.closest('.floating-toolbox') || e.target.closest('.zoom-controls')) return;
            e.preventDefault();

            const delta = -e.deltaY * 0.001;
            let newScale = zoomScale * (1 + delta);
            newScale = Math.max(0.3, Math.min(newScale, 3)); 

            const rect = workspace.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            panX = mouseX - (mouseX - panX) * (newScale / zoomScale);
            panY = mouseY - (mouseY - panY) * (newScale / zoomScale);
            zoomScale = newScale;

            aplicarTransformacaoCamera();
        });
    }
    
    window.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        panX = e.clientX - startPanX;
        panY = e.clientY - startPanY;
        aplicarTransformacaoCamera();
    });

    window.addEventListener('mouseup', () => {
        if(isPanning){
           isPanning = false;
           const workspace = document.getElementById('hardwareWorkspace');
           if (workspace) workspace.style.cursor = 'default';
        }
    });

    window.addEventListener('resize', () => {
        const overlay = document.getElementById('hardwareOverlay');
        if (overlay && overlay.style.display === 'flex') {
            if(window.atualizarConexoes) window.atualizarConexoes();
        }
    });
});

// --- LÓGICA DE MONTAGEM E SIMULAÇÃO ---
function carregarPlacaParaMontagem() {
    const assemblyBoardArea = document.getElementById('assemblyBoardArea');
    if(!assemblyBoardArea) return;
    
    assemblyBoardArea.innerHTML = '';
    plataformaAtual = localStorage.getItem('roboblocks_plataforma') || 'uno';
    const boardOriginal = document.querySelector(`#board-${plataformaAtual} svg`);
    
    if (boardOriginal) {
        const boardClone = boardOriginal.cloneNode(true);
        boardClone.removeAttribute('width');
        boardClone.removeAttribute('height');
        assemblyBoardArea.appendChild(boardClone);
    }
}

window.adicionarComponente = function(tipo) {
    const assemblyCanvas = document.getElementById('assemblyCanvas');
    const workspace = document.getElementById('hardwareWorkspace');
    if(!assemblyCanvas || !workspace) return;
    
    componentCounter++;
    const cardId = `comp-${componentCounter}`;
    const card = document.createElement('div');
    card.className = 'component-card';
    card.id = cardId;
    
    const rect = workspace.getBoundingClientRect();
    const centerX = (rect.width / 2 - panX) / zoomScale;
    const centerY = (rect.height / 2 - panY) / zoomScale;
    
    card.style.top = `${centerY - 50 + (Math.random()*40-20)}px`;
    card.style.left = `${centerX - 100 + (Math.random()*40-20)}px`;

    const dot = document.createElement('div');
    dot.className = 'connection-dot';
    dot.id = `dot-${cardId}`;
    card.appendChild(dot);

    let selectsHTML = '';
    let icone = '';
    let placeholderNome = '';
    let nomeArquivoSvg = ''; 

    if(tipo === 'LED') {
        icone = '💡'; placeholderNome = 'MeuLED'; nomeArquivoSvg = 'led.svg';
        selectsHTML = `
            ${gerarSelectHTML(cardId, 'Pino Sinal', 'var(--blue)')}
            <div class="port-selector">
                <label style="border-left: 3px solid #ff6767; padding-left: 5px;">Cor da Luz</label>
                <select class="color-select" onchange="window.mudarCorComponente('${cardId}')">
                    <option value="#ff0000">🔴 Vermelho</option>
                    <option value="#00ff00">🟢 Verde</option>
                    <option value="#0000ff">🔵 Azul</option>
                    <option value="#ffff00">🟡 Amarelo</option>
                    <option value="#ffffff">⚪ Branco</option>
                </select>
            </div>
        `;
    } else if(tipo === 'BOTAO') {
        icone = '🔘'; placeholderNome = 'BotaoAcao'; nomeArquivoSvg = 'botao.svg';
        selectsHTML = `${gerarSelectHTML(cardId, 'GND', '#a39ea9')}${gerarSelectHTML(cardId, 'Sinal', 'var(--secondary)')}`;
    } else if(tipo === 'POTENCIOMETRO' || tipo === 'LDR') {
        icone = tipo === 'LDR' ? '☀️' : '🎛️'; 
        placeholderNome = tipo === 'LDR' ? 'SensorLuz' : 'Volante';
        nomeArquivoSvg = tipo === 'LDR' ? 'ldr.svg' : 'potenciometro.svg';
        selectsHTML = `${gerarSelectHTML(cardId, 'VCC', '#ff6767')}${gerarSelectHTML(cardId, 'GND', '#a39ea9')}${gerarSelectHTML(cardId, 'Sinal', '#ffca85')}`;
    } else if(tipo === 'SERVO') {
        icone = '⚙️'; placeholderNome = 'MotorGarra'; nomeArquivoSvg = 'servo.svg';
        selectsHTML = `${gerarSelectHTML(cardId, 'VCC', '#ff6767')}${gerarSelectHTML(cardId, 'GND', '#a39ea9')}${gerarSelectHTML(cardId, 'Sinal', '#f694ff')}`;
    } else if(tipo === 'ULTRASSOM') {
        icone = '📏'; placeholderNome = 'OlhoUltrassom'; nomeArquivoSvg = 'ultrassom.svg';
        selectsHTML = `${gerarSelectHTML(cardId, 'VCC', '#ff6767')}${gerarSelectHTML(cardId, 'GND', '#a39ea9')}${gerarSelectHTML(cardId, 'Trig', 'var(--blue)')}${gerarSelectHTML(cardId, 'Echo', 'var(--primary)')}`;
    } else if(tipo === 'PONTE_H') {
        icone = '🏎️'; placeholderNome = 'Rodas'; nomeArquivoSvg = 'l298n.svg';
        selectsHTML = `${gerarSelectHTML(cardId, 'Esq Fren', '#ffca85')}${gerarSelectHTML(cardId, 'Esq Tras', '#ffca85')}${gerarSelectHTML(cardId, 'Dir Fren', '#82e2ff')}${gerarSelectHTML(cardId, 'Dir Tras', '#82e2ff')}`;
    }

    // Dividimos em 2 paineis: O de Editar e o do SVG Real
    card.innerHTML += `
        <div class="edit-view">
            <div class="card-drag-handle">
                <span class="card-icon">${icone}</span>
                <input type="text" class="card-name-input component-name" placeholder="Ex: ${placeholderNome}">
                <button class="icon-btn" style="width: 20px; height: 20px; font-size: 12px; color: var(--danger); padding:0; border:none;" onclick="window.removerComponente('${cardId}')">✕</button>
            </div>
            ${selectsHTML}
        </div>
        <div class="sim-view" id="sim-svg-${cardId}">
            <span style="font-size: 50px; text-shadow: 0 5px 15px rgba(0,0,0,0.5);">${icone}</span>
        </div>
    `;

    assemblyCanvas.appendChild(card);
    tornarArrastavel(card); 
    
    if(nomeArquivoSvg) {
        carregarSvgComponente(cardId, nomeArquivoSvg, icone);
    }
    
    card.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', window.salvarHardwareConfig);
        el.addEventListener('keyup', window.salvarHardwareConfig);
    });
    window.salvarHardwareConfig();
};

function gerarSelectHTML(cardId, label, colorIndicator) {
    const portas = getPortasDaPlaca(plataformaAtual);
    const options = portas.map(p => `<option value="${p.id}">${p.label}</option>`).join('');
    return `
        <div class="port-selector">
            <label style="border-left: 3px solid ${colorIndicator}; padding-left: 5px;">${label}</label>
            <select class="pino-select" data-color="${colorIndicator}" onchange="window.atualizarConexoes()">
                ${options}
            </select>
        </div>
    `;
}

window.removerComponente = function(cardId) {
    const el = document.getElementById(cardId);
    if(el) el.remove();
    if(window.atualizarConexoes) window.atualizarConexoes();
    if(window.salvarHardwareConfig) window.salvarHardwareConfig();
};

// --- FUNÇÃO QUE PUXA O SVG REAL DA PASTA DE COMPONENTES ---
async function carregarSvgComponente(cardId, arquivo, iconeFallback) {
    const container = document.getElementById(`sim-svg-${cardId}`);
    if(!container) return;

    try {
        // Usa o caminho especificado!
        const resposta = await fetch(`../src/img/componentes/${arquivo}`);
        if (!resposta.ok) throw new Error("SVG não encontrado");
        
        const codigoSvg = await resposta.text();
        container.innerHTML = codigoSvg; 
        
        // Aplica cor inicial caso seja um LED
        window.mudarCorComponente(cardId);
    } catch (erro) {
        console.warn(`[Aviso RoboBlocks] Sem SVG para ${arquivo}.`, erro);
        container.innerHTML = `<span style="font-size: 50px; text-shadow: 0 5px 15px rgba(0,0,0,0.5);">${iconeFallback}</span>`;
    }
}

// --- FUNÇÃO PARA COLORIR O LED NO SVG ---
window.mudarCorComponente = function(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;

    const colorSelect = card.querySelector('.color-select');
    if (!colorSelect) return;

    const corEscolhida = colorSelect.value;
    
    // Procura o ID ou a classe no arquivo SVG (Lembre de colocar no arquivo no Affinity!)
    const luzDoLed = card.querySelector('#luz-led, .luz-led'); 
    
    if (luzDoLed) {
        luzDoLed.style.fill = corEscolhida;
        luzDoLed.style.filter = `drop-shadow(0 0 10px ${corEscolhida})`;
    }
};

// --- MODO SIMULAÇÃO ON / OFF ---
window.toggleSimulacao = function() {
    const workspace = document.getElementById('hardwareWorkspace');
    const btnSimulacao = document.getElementById('btnStartSimulacao');
    
    if(!workspace) return;

    const estaSimulando = workspace.classList.contains('simulating');

    if (estaSimulando) {
        workspace.classList.remove('simulating');
        if(btnSimulacao) {
            btnSimulacao.innerHTML = '▶ Iniciar Simulação';
            btnSimulacao.style.background = 'var(--secondary)';
            btnSimulacao.style.color = '#15141b';
        }
    } else {
        workspace.classList.add('simulating');
        if(btnSimulacao) {
            btnSimulacao.innerHTML = '⏹ Parar Simulação';
            btnSimulacao.style.background = 'var(--danger)';
            btnSimulacao.style.color = '#fff';
        }
    }
    
    setTimeout(window.atualizarConexoes, 50);
};

// --- DRAG AND DROP ---
function tornarArrastavel(elemento) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    elemento.onmousedown = function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON') return; 
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = pararArrastar;
        document.onmousemove = arrastarElemento;
        
        document.querySelectorAll('.component-card').forEach(c => c.style.zIndex = 100);
        elemento.style.zIndex = 101; 
    };

    function arrastarElemento(e) {
        e.preventDefault();
        pos1 = (pos3 - e.clientX) / zoomScale; 
        pos2 = (pos4 - e.clientY) / zoomScale;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elemento.style.top = (elemento.offsetTop - pos2) + "px";
        elemento.style.left = (elemento.offsetLeft - pos1) + "px";
        
        if(window.atualizarConexoes) window.atualizarConexoes(); 
    }

    function pararArrastar() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// --- DESENHO DOS FIOS (MANHATTAN ORTOGONAL) ---
window.atualizarConexoes = function() {
    const wireCanvas = document.getElementById('wire-canvas');
    const assemblyBoardArea = document.getElementById('assemblyBoardArea');
    const assemblyCanvas = document.getElementById('assemblyCanvas');
    
    if (!wireCanvas || !assemblyBoardArea || !assemblyCanvas) return;

    wireCanvas.innerHTML = '';
    const pinosAtivos = assemblyBoardArea.querySelectorAll('.pin-active');
    pinosAtivos.forEach(p => p.classList.remove('pin-active'));

    assemblyCanvas.querySelectorAll('.component-card').forEach(card => {
        const dot = card.querySelector('.connection-dot');
        let temConexao = false;

        card.querySelectorAll('select.pino-select').forEach(select => {
            if (select.value !== '') {
                temConexao = true;
                const corFio = select.getAttribute('data-color');
                const svgPin = assemblyBoardArea.querySelector(`[id="${select.value}"]`);
                
                if(svgPin) {
                    svgPin.classList.add('pin-active');
                    desenharFio(dot, svgPin, corFio, wireCanvas);
                }
            }
        });

        if(temConexao) dot.classList.add('connected');
        else dot.classList.remove('connected');
    });
};

function desenharFio(dotElement, svgPinElement, corFio, wireCanvas) {
    const dotRect = dotElement.getBoundingClientRect();
    const pinRect = svgPinElement.getBoundingClientRect();
    const canvasRect = wireCanvas.getBoundingClientRect();

    const startX = ((dotRect.left - canvasRect.left) / zoomScale) + ((dotRect.width / zoomScale) / 2);
    const startY = ((dotRect.top - canvasRect.top) / zoomScale) + ((dotRect.height / zoomScale) / 2);
    const endX = ((pinRect.left - canvasRect.left) / zoomScale) + ((pinRect.width / zoomScale) / 2);
    const endY = ((pinRect.top - canvasRect.top) / zoomScale) + ((pinRect.height / zoomScale) / 2);

    // LÓGICA MANHATTAN (FIOS EM ÂNGULOS RETOS)
    let midX;
    if (endX > startX - 30) {
        midX = startX - 30; // Dá um recuo para não invadir o card
    } else {
        midX = (startX + endX) / 2;
    }

    const pathData = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;

    const pathNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathNode.setAttribute('d', pathData);
    pathNode.setAttribute('class', 'wire-path');
    pathNode.style.stroke = corFio;

    wireCanvas.appendChild(pathNode);
}

// --- SALVAMENTO NO LOCALSTORAGE ---
window.salvarHardwareConfig = function() {
    const assemblyCanvas = document.getElementById('assemblyCanvas');
    if(!assemblyCanvas) return;
    
    const cards = assemblyCanvas.querySelectorAll('.component-card');
    let hardwareSalvo = [];

    cards.forEach(card => {
        const nomeInput = card.querySelector('.component-name');
        const nome = nomeInput.value || nomeInput.placeholder.replace('Ex: ', '');
        
        const pinos = [];
        card.querySelectorAll('.port-selector').forEach(selector => {
             const label = selector.querySelector('label').innerText;
             const select = selector.querySelector('.pino-select');
             if(select) {
                 let pinoReal = select.value.replace('_', ''); 
                 if(pinoReal !== '') pinos.push({ label: label, pino: pinoReal });
             }
        });

        if(pinos.length > 0) hardwareSalvo.push({ nome: nome, pinos: pinos });
    });

    localStorage.setItem('roboblocks_montagem', JSON.stringify(hardwareSalvo));
};