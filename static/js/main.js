// Define localidade para Português
Blockly.setLocale(Blockly.Msg);

// =============================================================
// 1. GERENCIADOR DE TEMAS (JS + CSS)
// =============================================================

// Configurações específicas do Blockly para cada tema (Cores que o CSS não pega no Canvas)
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
        gridColor: '#dcdce0', // Grid mais escuro para aparecer no branco
        toolboxColor: '#ffffff',
        flyoutColor: '#eeeeee'
    },
    void: { 
        name: 'void',
        workspaceColor: '#000000', // Preto absoluto
        gridColor: '#1a1a1a',      // Grid cinza bem escuro
        toolboxColor: '#050505',
        flyoutColor: '#111111'
    }
};

// Função Principal de Troca de Tema
function setTheme(themeName) {
    const config = themeConfigs[themeName] || themeConfigs.aura;
    
    // 1. Atualiza Classes CSS no Body
    document.body.classList.remove('theme-aura', 'theme-light', 'theme-void');
    document.body.classList.add(`theme-${config.name}`);

    // 2. Cria e Aplica Tema no Blockly (Necessário para mudar o fundo do canvas)
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

    // Salva preferência
    localStorage.setItem('roboblocks_theme', config.name);
    
    // Fecha modal se estiver aberto
    toggleModal('themeModal', false);
    
    // Se não for o carregamento inicial, avisa o usuário
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
  grid: { spacing: 20, length: 3, colour: '#2a2a2a', snap: true }, // Cor inicial (será sobrescrita pelo tema)
  zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 3, minScale: 0.3 },
  trashcan: true
});

// Aplica o tema salvo ou o padrão ao iniciar
const savedTheme = localStorage.getItem('roboblocks_theme') || 'aura';
setTheme(savedTheme);

// Ajuste inicial de tamanho
setTimeout(() => { Blockly.svgResize(workspace); }, 100);
window.addEventListener('resize', () => Blockly.svgResize(workspace));

// =============================================================
// 3. MENU HAMBÚRGUER E INTERFACE
// =============================================================

// Abrir Menu Lateral
document.getElementById('menuBtn').addEventListener('click', () => {
    document.getElementById('sideMenu').classList.add('open');
});

// Fechar Menu Lateral
document.getElementById('closeMenuBtn').addEventListener('click', () => {
    document.getElementById('sideMenu').classList.remove('open');
});

// Botão "Mudar Tema" no Menu
document.getElementById('openThemeModalBtn').addEventListener('click', () => {
    document.getElementById('sideMenu').classList.remove('open'); // Fecha o menu lateral
    toggleModal('themeModal', true); // Abre o modal
});

// Fechar Modal de Tema
document.getElementById('closeThemeBtn').addEventListener('click', () => {
    toggleModal('themeModal', false);
});

// =============================================================
// 4. LÓGICA DO ARDUINO E CONFIG
// =============================================================
let currentCode = '';
let isAgentOnline = false;

let config = JSON.parse(localStorage.getItem('mymaker_config')) || {
  arduinoPath: 'C:\\Program Files (x86)\\Arduino\\arduino_debug.exe',
  agentUrl: 'http://localhost:3000'
};

workspace.addChangeListener(e => {
  if (e.type === Blockly.Events.UI) return;
  try {
    currentCode = arduinoGenerator.workspaceToCode(workspace);
  } catch (err) { console.error(err); }
});

// Helpers de UI
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

function syntaxHighlight(code) {
  if (!code) return '';
  code = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  code = code.replace(/(\/\/.*$)/gm, '<span class="code-comment">$1</span>');
  const keywords = ['void', 'int', 'float', 'if', 'else', 'for', 'while', 'setup', 'loop', 'true', 'false', '#include', 'Servo', 'OUTPUT', 'INPUT', 'HIGH', 'LOW', 'break', 'return', 'pinMode', 'digitalWrite', 'digitalRead', 'analogWrite', 'analogRead', 'delay', 'Serial', 'begin', 'println', 'print'];
  keywords.forEach(k => {
    const regex = new RegExp(`\\b(${k})\\b`, 'g');
    code = code.replace(regex, '<span class="code-keyword">$1</span>');
  });
  return code;
}

// Eventos de Botões
document.getElementById('showCodeBtn').addEventListener('click', () => {
  document.getElementById('codeViewer').innerHTML = syntaxHighlight(currentCode);
  toggleModal('codeModal', true);
});

document.getElementById('closeModalBtn').addEventListener('click', () => toggleModal('codeModal', false));

document.getElementById('copyCodeBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(currentCode);
  showToast("Código copiado!", "success");
});

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

// Lógica Agente e Monitoramento
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

// Salvar/Carregar
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

// Exemplos
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

// Função melhorada para listar portas
async function updateComPorts() {
    const portSelect = document.getElementById('portInput');
    
    // Limpa tudo e deixa a opção padrão
    portSelect.innerHTML = '<option value="">Porta COM</option>';

    // === ADICIONAR PORTA FALSA PARA TESTE (SIMULAÇÃO) ===
    const fakeOption = document.createElement('option');
    fakeOption.value = "COM_TESTE";
    fakeOption.text = "🛠️ Porta Virtual (Teste)";
    fakeOption.style.color = "orange"; 
    portSelect.appendChild(fakeOption);
    // ========================================

    if (!navigator.serial) return;

    try {
        const ports = await navigator.serial.getPorts();

        // Adiciona as portas encontradas
        ports.forEach((port, index) => {
            const info = port.getInfo();
            const vid = info.usbVendorId;
            
            // Tenta dar um nome melhor
            let label = `Porta ${index + 1}`;
            if (vid === 0x2341) label += " (Arduino)"; 
            else if (vid) label += ` (USB ${vid})`;
            
            const option = document.createElement('option');
            option.value = `COM${index + 3}`; // Chute inicial
            option.text = label;
            portSelect.appendChild(option);
        });

        // Opção sempre visível para buscar nova porta
        const addOption = document.createElement('option');
        addOption.value = "SEARCH";
        addOption.text = "➕ Nova Porta...";
        addOption.style.color = "#61ffca"; // Destaque visual
        portSelect.appendChild(addOption);

    } catch (err) {
        console.error("Erro portas:", err);
    }
}

// Botão de atualizar portas
document.getElementById('refreshPortsBtn').addEventListener('click', updateComPorts);

// Evento inteligente: Se escolher "Nova Porta...", abre a janela de busca
document.getElementById('portInput').addEventListener('change', async (e) => {
    if (e.target.value === "SEARCH") {
        try {
            await navigator.serial.requestPort(); // Abre janelinha do Chrome
            await updateComPorts(); // Atualiza a lista
            
            // Tenta selecionar a última porta adicionada
            const select = document.getElementById('portInput');
            if (select.options.length > 2) {
                 select.selectedIndex = select.options.length - 2; 
            }
        } catch (err) {
            // Usuário cancelou, volta para o padrão
            e.target.value = "";
        }
    }
});

// Inicializa a lista de portas ao carregar
updateComPorts();

// Evento de Upload (Unificado e Corrigido)
document.getElementById('uploadBtn').addEventListener('click', async (e) => {
  e.preventDefault(); // <--- IMPEDE OS BLOCOS DE SUMIREM
  
  if (!isAgentOnline) return showToast("🔌 Conector Offline!", "error");
  
  const board = document.getElementById('boardSelect').value;
  const port = document.getElementById('portInput').value; 
  
  // Validação simples
  if (!port || port === "" || port === "SELECT") {
      return showToast("⚠️ Selecione uma porta COM", "error");
  }

  const btn = document.getElementById('uploadBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = `<span class="loading-spinner"></span> Enviando...`;
  btn.disabled = true;

  try {
    const response = await fetch(`${config.agentUrl}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          code: currentCode, 
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

// Botão de Download do Agente
document.getElementById('downloadAgentBtn').addEventListener('click', () => {
    // Cria um link temporário para forçar o download
    const link = document.createElement('a');
    link.href = '../static/js/MyMakerConnector.exe'; // Caminho relativo ao index.html
    link.download = 'MyMakerConnector.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("⬇️ Download iniciado!");
});