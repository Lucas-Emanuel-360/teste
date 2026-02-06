// Define localidade para Português
Blockly.setLocale(Blockly.Msg);

// =============================================================
// 1. GERENCIADOR DE TEMAS (JS + CSS)
// =============================================================

// Configurações específicas do Blockly para cada tema
const themeConfigs = {
    aura: { 
        name: 'aura',
        workspaceColor: '#1e1e1e', 
        gridColor: '#2a2a2a',
        toolboxColor: '#252526',
        flyoutColor: '#2d2d30'
    },
    light: { 
        name: 'light',
        workspaceColor: '#f2f2f5', 
        gridColor: '#dcdce0',
        toolboxColor: '#ffffff',
        flyoutColor: '#eeeeee'
    },
    void: { 
        name: 'void',
        workspaceColor: '#000000',
        gridColor: '#1a1a1a',
        toolboxColor: '#050505',
        flyoutColor: '#111111'
    }
};

// Variável para armazenar a instância do Monaco (Editor de Código)
let monacoEditorInstance = null;

// Função Principal de Troca de Tema
function setTheme(themeName) {
    const config = themeConfigs[themeName] || themeConfigs.aura;
    
    // 1. Atualiza Classes CSS no Body
    document.body.classList.remove('theme-aura', 'theme-light', 'theme-void');
    document.body.classList.add(`theme-${config.name}`);

    // 2. Cria e Aplica Tema no Blockly
    const blocklyTheme = Blockly.Theme.defineTheme(`${config.name}Theme`, {
        'base': Blockly.Themes.Classic,
        'blockStyles': {
            'control_category': { 'colourPrimary': '#d94848' },
            'logic_blocks': { 'colourPrimary': '#9966ff' },
            'loop_blocks': { 'colourPrimary': '#5ba55b' },
            'math_blocks': { 'colourPrimary': '#5ba55b' },
            'variable_blocks': { 'colourPrimary': '#ff6680' }
        },
        'componentStyles': {
            'workspaceBackgroundColour': config.workspaceColor,
            'toolboxBackgroundColour': config.toolboxColor,
            'toolboxForegroundColour': (themeName === 'light') ? '#333' : '#fff', 
            'flyoutBackgroundColour': config.flyoutColor,
            'flyoutForegroundColour': '#cccccc',
            'scrollbarColour': (themeName === 'light') ? '#ccc' : '#3e3e42',
            'insertionMarkerColour': '#ffffff',
            'cursorColour': '#00bfa5'
        }
    });

    workspace.setTheme(blocklyTheme);

    // 3. Atualiza o Tema do Monaco (se já estiver carregado)
    if (monacoEditorInstance) {
        if (config.name === 'aura') monaco.editor.setTheme('aura-theme');
        if (config.name === 'light') monaco.editor.setTheme('light-theme');
        if (config.name === 'void') monaco.editor.setTheme('void-theme');
    }

    // Salva preferência
    localStorage.setItem('roboblocks_theme', config.name);
    
    toggleModal('themeModal', false);
    
    if (document.getElementById('themeModal').style.display === 'flex') {
        showToast(`Tema ${config.name.toUpperCase()} aplicado!`);
    }
}

// =============================================================
// 2. INICIALIZAÇÃO DO WORKSPACE
// =============================================================
const workspace = Blockly.inject('blocklyArea', {
  toolbox: document.getElementById('toolbox'),
  renderer: 'zelos',
  grid: { spacing: 20, length: 3, colour: '#2a2a2a', snap: true },
  zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 3, minScale: 0.3 },
  trashcan: true
});

// Aplica o tema salvo ou o padrão ao iniciar
const savedTheme = localStorage.getItem('roboblocks_theme') || 'aura';
setTheme(savedTheme);

setTimeout(() => { Blockly.svgResize(workspace); }, 100);
window.addEventListener('resize', () => Blockly.svgResize(workspace));

// =============================================================
// 3. MENU E HELPERS UI
// =============================================================

document.getElementById('menuBtn').addEventListener('click', () => document.getElementById('sideMenu').classList.add('open'));
document.getElementById('closeMenuBtn').addEventListener('click', () => document.getElementById('sideMenu').classList.remove('open'));

document.getElementById('openThemeModalBtn').addEventListener('click', () => {
    document.getElementById('sideMenu').classList.remove('open');
    toggleModal('themeModal', true);
});
document.getElementById('closeThemeBtn').addEventListener('click', () => toggleModal('themeModal', false));

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (show) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('modal-visible'), 10);
    } else {
        modal.classList.remove('modal-visible');
        setTimeout(() => {
            if (!modal.classList.contains('modal-visible')) modal.style.display = 'none';
        }, 300);
    }
}

// =============================================================
// 4. CONFIGURAÇÃO E AGENTE
// =============================================================
let currentCode = '';
let isAgentOnline = false;

let config = JSON.parse(localStorage.getItem('mymaker_config')) || {
  arduinoPath: 'C:\\Program Files (x86)\\Arduino\\arduino_debug.exe',
  agentUrl: 'http://localhost:3000'
};

// Atualiza o código quando os blocos mudam
workspace.addChangeListener(e => {
  if (e.type === Blockly.Events.UI) return;
  try {
    currentCode = arduinoGenerator.workspaceToCode(workspace);
  } catch (err) { console.error(err); }
});

// Botão Configurações
document.getElementById('settingsBtn').addEventListener('click', () => {
  document.getElementById('arduinoPathInput').value = config.arduinoPath;
  document.getElementById('agentUrlInput').value = config.agentUrl;
  toggleModal('configModal', true);
});
document.getElementById('closeConfigBtn').addEventListener('click', () => toggleModal('configModal', false));
document.getElementById('saveConfigBtn').addEventListener('click', () => {
  config.arduinoPath = document.getElementById('arduinoPathInput').value;
  config.agentUrl = document.getElementById('agentUrlInput').value;
  localStorage.setItem('mymaker_config', JSON.stringify(config));
  toggleModal('configModal', false);
  checkAgentStatus();
  showToast("Configurações salvas!");
});

// Checa status do Agente
const agentDot = document.getElementById('agentDot');
const agentStatusText = document.getElementById('agentStatus');

async function checkAgentStatus() {
  try {
    const res = await fetch(`${config.agentUrl}/status`);
    if (res.ok) {
      isAgentOnline = true;
      agentDot.classList.add('status-online');
      agentStatusText.style.color = 'var(--text-main)';
      document.getElementById('uploadBtn').title = "Pronto para enviar";
    }
  } catch (e) {
    isAgentOnline = false;
    agentDot.classList.remove('status-online');
    agentStatusText.style.color = 'var(--text-muted)';
  }
}
setInterval(checkAgentStatus, 2000);
checkAgentStatus();

// =============================================================
// 5. INTEGRAÇÃO COM MONACO EDITOR (CUSTOMIZADO & EDITÁVEL)
// =============================================================

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }});

function initMonaco() {
    return new Promise((resolve) => {
        require(['vs/editor/editor.main'], function () {
            
            // --- 1. DEFINIÇÃO DOS TEMAS ---
            
            // AURA (Roxo/Dracula)
            monaco.editor.defineTheme('aura-theme', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
                    { token: 'keyword', foreground: 'ff79c6', fontStyle: 'bold' },
                    { token: 'number', foreground: 'bd93f9' },
                    { token: 'string', foreground: 'f1fa8c' },
                    { token: 'type', foreground: '8be9fd' },
                    { token: 'identifier', foreground: 'f8f8f2' }
                ],
                colors: {
                    'editor.background': '#15141b',
                    'editor.foreground': '#f8f8f2',
                    'editorCursor.foreground': '#ff79c6',
                    'editor.lineHighlightBackground': '#21202e',
                    'editorLineNumber.foreground': '#6272a4',
                    'editor.selectionBackground': '#44475a'
                }
            });

            // LIGHT (GitHub Style)
            monaco.editor.defineTheme('light-theme', {
                base: 'vs',
                inherit: true,
                rules: [
                    { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
                    { token: 'keyword', foreground: 'd73a49', fontStyle: 'bold' },
                    { token: 'string', foreground: '032f62' },
                    { token: 'number', foreground: '005cc5' },
                    { token: 'type', foreground: '6f42c1' }
                ],
                colors: {
                    'editor.background': '#ffffff',
                    'editor.foreground': '#24292e',
                    'editorCursor.foreground': '#24292e',
                    'editor.lineHighlightBackground': '#f6f8fa',
                    'editorLineNumber.foreground': '#babbbd',
                    'editor.selectionBackground': '#0366d625'
                }
            });

            // VOID (Cyberpunk/Matrix)
            monaco.editor.defineTheme('void-theme', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'comment', foreground: '008800' },
                    { token: 'keyword', foreground: '00ff41', fontStyle: 'bold' },
                    { token: 'string', foreground: '00e5ff' },
                    { token: 'number', foreground: 'bd93f9' },
                    { token: 'type', foreground: '00ff41' },
                    { token: 'identifier', foreground: 'cccccc' }
                ],
                colors: {
                    'editor.background': '#000000',
                    'editor.foreground': '#e0e0e0',
                    'editorCursor.foreground': '#00ff41',
                    'editor.lineHighlightBackground': '#111111',
                    'editorLineNumber.foreground': '#333333',
                    'editor.selectionBackground': '#003300'
                }
            });

            // --- 2. PREPARAÇÃO DO CONTAINER ---
            const container = document.getElementById('monacoEditorContainer');
            container.innerHTML = ''; // Limpa o "Carregando..."

            // --- 3. ESCOLHA DO TEMA INICIAL ---
            let saved = localStorage.getItem('roboblocks_theme') || 'aura';
            let initialTheme = 'aura-theme';
            if (saved === 'light') initialTheme = 'light-theme';
            if (saved === 'void') initialTheme = 'void-theme';

            // --- 4. CRIAÇÃO DA INSTÂNCIA ---
            monacoEditorInstance = monaco.editor.create(container, {
                value: '// Carregando código...',
                language: 'cpp',
                theme: initialTheme,
                automaticLayout: true,
                readOnly: false, // PERMITE EDIÇÃO MANUAL
                minimap: { enabled: true },
                fontFamily: "'Fira Code', 'Consolas', monospace",
                fontSize: 14,
                fontLigatures: true,
                scrollBeyondLastLine: false,
                renderWhitespace: 'selection',
                padding: { top: 20, bottom: 20 }
            });

            resolve(monacoEditorInstance);
        });
    });
}

// Botão "Ver Código"
document.getElementById('showCodeBtn').addEventListener('click', async () => {
    // 1. Pega o código mais recente dos blocos
    try {
        currentCode = arduinoGenerator.workspaceToCode(workspace);
    } catch (e) { console.error(e); }

    // 2. Abre o Modal
    toggleModal('codeModal', true);

    // 3. Inicia o Monaco se necessário
    if (!monacoEditorInstance) {
        document.getElementById('monacoEditorContainer').innerHTML = '<p style="color:#888; text-align:center; padding-top:20px;">Iniciando Monaco Editor...</p>';
        await initMonaco();
    }

    // 4. Define o valor (Sempre sobrescreve com o dos blocos ao abrir para garantir sincronia inicial)
    // Se quiser manter o que o usuário digitou antes, teria que fazer uma lógica extra aqui.
    // Por enquanto, "Ver Código" reseta para a versão dos blocos.
    monacoEditorInstance.setValue(currentCode);
    
    // Força refresh do layout
    setTimeout(() => monacoEditorInstance.layout(), 50);
});

document.getElementById('closeModalBtn').addEventListener('click', () => toggleModal('codeModal', false));

document.getElementById('copyCodeBtn').addEventListener('click', () => {
    // Copia do editor se ele existir, senão da variável
    const codeToCopy = monacoEditorInstance ? monacoEditorInstance.getValue() : currentCode;
    navigator.clipboard.writeText(codeToCopy);
    showToast("Código copiado!", "success");
});

// =============================================================
// 6. SERIAL, PORTAS E UPLOAD
// =============================================================

// Monitor Serial
const serialMonitor = document.getElementById('serialMonitor');
document.getElementById('connectSerialBtn').addEventListener('click', async () => {
  if (!navigator.serial) return alert("Use Chrome ou Edge para Serial.");
  try {
    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    serialMonitor.classList.add('open');
    const output = document.getElementById('serialOutput');
    output.innerHTML += `<div style="color: var(--secondary); border-bottom: 1px dashed #333; padding-bottom: 5px;">>>> Conectado (9600 baud) 🔌</div>`;
    const textDecoder = new TextDecoderStream();
    port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) { output.innerHTML += value; output.scrollTop = output.scrollHeight; }
    }
  } catch (e) { console.log("Erro Serial:", e); }
});
document.getElementById('closeSerialBtn').addEventListener('click', () => serialMonitor.classList.remove('open'));
document.getElementById('clearSerialBtn').addEventListener('click', () => document.getElementById('serialOutput').innerHTML = '');

// Listar Portas
async function updateComPorts() {
    const portSelect = document.getElementById('portInput');
    portSelect.innerHTML = '<option value="">Porta COM</option>';

    // Porta Falsa de Teste
    const fakeOption = document.createElement('option');
    fakeOption.value = "COM_TESTE";
    fakeOption.text = "🛠️ Porta Virtual (Teste)";
    fakeOption.style.color = "orange"; 
    portSelect.appendChild(fakeOption);

    if (!navigator.serial) return;

    try {
        const ports = await navigator.serial.getPorts();
        ports.forEach((port, index) => {
            const info = port.getInfo();
            const vid = info.usbVendorId;
            let label = `Porta ${index + 1}`;
            if (vid === 0x2341) label += " (Arduino)"; 
            else if (vid) label += ` (USB ${vid})`;
            
            const option = document.createElement('option');
            option.value = `COM${index + 3}`; 
            option.text = label;
            portSelect.appendChild(option);
        });

        const addOption = document.createElement('option');
        addOption.value = "SEARCH";
        addOption.text = "➕ Nova Porta...";
        addOption.style.color = "#61ffca";
        portSelect.appendChild(addOption);
    } catch (err) { console.error("Erro portas:", err); }
}

document.getElementById('refreshPortsBtn').addEventListener('click', updateComPorts);
document.getElementById('portInput').addEventListener('change', async (e) => {
    if (e.target.value === "SEARCH") {
        try {
            await navigator.serial.requestPort();
            await updateComPorts();
            const select = document.getElementById('portInput');
            if (select.options.length > 2) select.selectedIndex = select.options.length - 2; 
        } catch (err) { e.target.value = ""; }
    }
});
updateComPorts();

// =============================================================
// 7. AÇÃO DE UPLOAD E VERIFICAR (COM SUPORTE A EDIÇÃO MANUAL)
// =============================================================

// Helper para pegar o código correto (Blocos ou Manual)
function getFinalCode() {
    // Se o modal estiver aberto, confiamos no Editor Manual
    if (monacoEditorInstance && document.getElementById('codeModal').classList.contains('modal-visible')) {
        return monacoEditorInstance.getValue();
    }
    // Caso contrário, geramos dos blocos para garantir atualização
    return arduinoGenerator.workspaceToCode(workspace);
}

// Botão UPLOAD
document.getElementById('uploadBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  
  if (!isAgentOnline) return showToast("🔌 Conector Offline!", "error");
  
  const board = document.getElementById('boardSelect').value;
  const port = document.getElementById('portInput').value; 
  
  if (!port || port === "") return showToast("⚠️ Selecione uma porta COM", "error");

  // Decide qual código usar
  const codeToUpload = getFinalCode();
  
  // Feedback Visual
  const btn = document.getElementById('uploadBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = `<span class="loading-spinner"></span> Enviando...`;
  btn.disabled = true;

  try {
    const response = await fetch(`${config.agentUrl}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          code: codeToUpload, 
          board: board, 
          port: port,
          arduinoPath: config.arduinoPath 
      })
    });
    
    const result = await response.json();
    if (result.success) showToast("✅ Upload Concluído!", "success");
    else alert("❌ Erro no Upload:\n\n" + result.output);
    
  } catch (err) {
    showToast("Erro de comunicação com o Agente.", "error");
    console.error(err);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

// Botão VERIFICAR
document.getElementById('verifyBtn').addEventListener('click', async (e) => {
    e.preventDefault();

    if (!isAgentOnline) return showToast("🔌 Conector Offline!", "error");

    const board = document.getElementById('boardSelect').value;
    const codeToVerify = getFinalCode();
    
    const btn = document.getElementById('verifyBtn');
    const originalContent = btn.innerHTML;
    btn.innerHTML = `<span class="loading-spinner"></span> Verificando...`;
    btn.disabled = true;

    try {
        const response = await fetch(`${config.agentUrl}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                code: codeToVerify, 
                board: board, 
                arduinoPath: config.arduinoPath 
            })
        });

        const result = await response.json();
        
        if (result.success) {
            showToast("✅ Código Compilado com Sucesso!", "success");
        } else {
            alert("❌ Erro na Compilação:\n\n" + result.output);
        }

    } catch (err) {
        showToast("Erro ao comunicar com o Agente.", "error");
        console.error(err);
    } finally {
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
});

// Download do Agente
document.getElementById('downloadAgentBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = '../static/js/MyMakerConnector.exe'; 
    link.download = 'MyMakerConnector.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("⬇️ Download iniciado!");
});

// =============================================================
// 8. SALVAR, CARREGAR E EXEMPLOS
// =============================================================
document.getElementById('saveBtn').addEventListener('click', () => {
    const xml = Blockly.Xml.workspaceToDom(workspace);
    const blob = new Blob([Blockly.Xml.domToText(xml)], {type: 'text/xml'});
    const a = document.createElement('a');
    a.download = 'projeto.xml';
    a.href = URL.createObjectURL(blob);
    a.click();
    showToast("Projeto salvo!");
});

document.getElementById('loadBtn').addEventListener('click', () => document.getElementById('loadInput').click());
document.getElementById('loadInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            workspace.clear();
            Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(e.target.result), workspace);
            showToast("Projeto carregado!");
        } catch(err) { showToast("Erro ao carregar XML.", "error"); }
    };
    reader.readAsText(file);
    e.target.value = ''; 
});

// Exemplos Rápidos
const xmlBlink = `<xml><block type="io_pin_mode" x="50" y="50"><value name="PIN"><shadow type="math_number"><field name="NUM">13</field></shadow></value><field name="MODE">OUTPUT</field><next><block type="controls_while"><value name="CONDITION"><block type="logic_boolean"><field name="BOOL">TRUE</field></block></value><statement name="DO"><block type="io_digital_write"><value name="PIN"><shadow type="math_number"><field name="NUM">13</field></shadow></value><value name="STATE"><shadow type="io_high"></shadow></value><next><block type="controls_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value><next><block type="io_digital_write"><value name="PIN"><shadow type="math_number"><field name="NUM">13</field></shadow></value><value name="STATE"><shadow type="io_low"></shadow></value><next><block type="controls_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value></block></next></block></next></block></next></block></statement></block></next></block></xml>`;
const xmlServo = `<xml><block type="controls_while" x="50" y="50"><value name="CONDITION"><block type="logic_boolean"><field name="BOOL">TRUE</field></block></value><statement name="DO"><block type="servo_write"><value name="PIN"><shadow type="math_number"><field name="NUM">9</field></shadow></value><value name="ANGLE"><shadow type="math_number"><field name="NUM">0</field></shadow></value><next><block type="controls_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value><next><block type="servo_write"><value name="PIN"><shadow type="math_number"><field name="NUM">9</field></shadow></value><value name="ANGLE"><shadow type="math_number"><field name="NUM">180</field></shadow></value><next><block type="controls_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value></block></next></block></next></block></next></block></statement></block></xml>`;
const xmlPot = `<xml><block type="controls_while" x="50" y="50"><value name="CONDITION"><block type="logic_boolean"><field name="BOOL">TRUE</field></block></value><statement name="DO"><block type="io_serial_print"><value name="TEXT"><block type="io_analog_read"><value name="PIN"><shadow type="math_number"><field name="NUM">0</field></shadow></value></block></value><next><block type="controls_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">100</field></shadow></value></block></next></block></statement></block></xml>`;

function loadExample(xml) {
  if (confirm("Isso substituirá seus blocos. Continuar?")) {
    workspace.clear();
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
    workspace.scrollCenter(); 
  }
}
workspace.registerButtonCallback('LOAD_BLINK', () => loadExample(xmlBlink));
workspace.registerButtonCallback('LOAD_SERVO', () => loadExample(xmlServo));
workspace.registerButtonCallback('LOAD_POT', () => loadExample(xmlPot));
document.getElementById('clearBtn')?.addEventListener('click', () => { if(confirm("Apagar tudo?")) workspace.clear(); });