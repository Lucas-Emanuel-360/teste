// Define localidade para Português
Blockly.setLocale(Blockly.Msg);

// =============================================================
// NOVO: BLOCO INICIAR PERSONALIZADO (C/ CRIAR VARIÁVEL RAPIDA)
// =============================================================

// Registra a extensão para o clique no "+" criar variáveis
Blockly.Extensions.register("add_var_button", function () {
  this.getField("ADD_VAR").clickHandler_ = () => {
    Blockly.Variables.createVariableButtonHandler(this.workspace, null, "");
  };
});

// Define o bloco "Iniciar" visual
Blockly.defineBlocksWithJsonArray([
  {
    type: "roboblocks_start",
    message0: "Iniciar %1 %2",
    args0: [
      {
        type: "field_image",
        // Ícone de "+" minimalista
        src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><line x1='12' y1='5' x2='12' y2='19'></line><line x1='5' y1='12' x2='19' y2='12'></line></svg>",
        width: 18,
        height: 18,
        alt: "+",
        name: "ADD_VAR",
      },
      { type: "input_dummy" },
    ],
    message1: "Configuração (Setup) %1",
    args1: [{ type: "input_statement", name: "SETUP" }],
    message2: "Repetir para Sempre (Loop) %1",
    args2: [{ type: "input_statement", name: "LOOP" }],
    colour: "#F39C12",
    tooltip: "Bloco principal do seu robô. Clique no [+] para criar Variáveis.",
    extensions: ["add_var_button"],
  },
]);

// Gerador Arduino para o Bloco Iniciar
arduinoGenerator.forBlock["roboblocks_start"] = function (block) {
  const setupBranch = arduinoGenerator.statementToCode(block, "SETUP");
  const loopBranch = arduinoGenerator.statementToCode(block, "LOOP");

  // Injeta as configurações no setup do Arduino
  if (setupBranch) {
    arduinoGenerator.setups_["user_setup"] = setupBranch;
  }

  return loopBranch; // Retorna o Loop para cair na rotina principal
};

// =============================================================
// NOVO: GERADOR ARDUINO PARA FUNÇÕES (PROCEDURES)
// =============================================================
arduinoGenerator.forBlock["procedures_defnoreturn"] = function (block) {
  const funcName = arduinoGenerator.nameDB_.getName(
    block.getFieldValue("NAME"),
    Blockly.PROCEDURE_CATEGORY_NAME,
  );
  let branch = arduinoGenerator.statementToCode(block, "STACK");

  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    // C++ requer tipos nas funções. Como blockly não tem tipagem estrita por padrão, usamos float que atende matemática/sensores
    args[i] =
      "float " +
      arduinoGenerator.nameDB_.getName(
        variables[i],
        Blockly.VARIABLE_CATEGORY_NAME,
      );
  }

  let code =
    "void " + funcName + "(" + args.join(", ") + ") {\n" + branch + "}";
  code = arduinoGenerator.scrub_(block, code);
  arduinoGenerator.definitions_["%" + funcName] = code;
  return null;
};

arduinoGenerator.forBlock["procedures_defreturn"] = function (block) {
  const funcName = arduinoGenerator.nameDB_.getName(
    block.getFieldValue("NAME"),
    Blockly.PROCEDURE_CATEGORY_NAME,
  );
  let branch = arduinoGenerator.statementToCode(block, "STACK");
  let returnValue =
    arduinoGenerator.valueToCode(
      block,
      "RETURN",
      arduinoGenerator.ORDER_NONE,
    ) || "";
  if (returnValue) {
    returnValue = arduinoGenerator.INDENT + "return " + returnValue + ";\n";
  }
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] =
      "float " +
      arduinoGenerator.nameDB_.getName(
        variables[i],
        Blockly.VARIABLE_CATEGORY_NAME,
      );
  }

  let code =
    "float " +
    funcName +
    "(" +
    args.join(", ") +
    ") {\n" +
    branch +
    returnValue +
    "}";
  code = arduinoGenerator.scrub_(block, code);
  arduinoGenerator.definitions_["%" + funcName] = code;
  return null;
};

arduinoGenerator.forBlock["procedures_callnoreturn"] = function (block) {
  const funcName = arduinoGenerator.nameDB_.getName(
    block.getFieldValue("NAME"),
    Blockly.PROCEDURE_CATEGORY_NAME,
  );
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] =
      arduinoGenerator.valueToCode(
        block,
        "ARG" + i,
        arduinoGenerator.ORDER_NONE,
      ) || "0";
  }
  return funcName + "(" + args.join(", ") + ");\n";
};

arduinoGenerator.forBlock["procedures_callreturn"] = function (block) {
  const funcName = arduinoGenerator.nameDB_.getName(
    block.getFieldValue("NAME"),
    Blockly.PROCEDURE_CATEGORY_NAME,
  );
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] =
      arduinoGenerator.valueToCode(
        block,
        "ARG" + i,
        arduinoGenerator.ORDER_NONE,
      ) || "0";
  }
  return [
    funcName + "(" + args.join(", ") + ")",
    arduinoGenerator.ORDER_ATOMIC,
  ];
};

// =============================================================
// 1. GERENCIADOR DE TEMAS (JS + CSS)
// =============================================================

const themeConfigs = {
  aura: {
    name: "aura",
    workspaceColor: "#1e1e1e",
    gridColor: "#2a2a2a",
    toolboxColor: "#252526",
    flyoutColor: "#2d2d30",
  },
  light: {
    name: "light",
    workspaceColor: "#f2f2f5",
    gridColor: "#dcdce0",
    toolboxColor: "#ffffff",
    flyoutColor: "#eeeeee",
  },
  void: {
    name: "void",
    workspaceColor: "#000000",
    gridColor: "#1a1a1a",
    toolboxColor: "#050505",
    flyoutColor: "#111111",
  },
  coffee: {
    name: "coffee",
    workspaceColor: "#2b211e",
    gridColor: "#3a2c28",
    toolboxColor: "#3a2c28",
    flyoutColor: "#4c3a34",
  }
};

let monacoEditorInstance = null;
let monacoLiveEditor = null; // Instância nova para o código em tempo real

function setTheme(themeName) {
  const config = themeConfigs[themeName] || themeConfigs.aura;

  document.body.classList.remove("theme-aura", "theme-light", "theme-void", "theme-coffee");
  document.body.classList.add(`theme-${config.name}`);

  const blocklyTheme = Blockly.Theme.defineTheme(`${config.name}Theme`, {
    base: Blockly.Themes.Classic,
    blockStyles: {
      control_category: { colourPrimary: "#d94848" },
      logic_blocks: { colourPrimary: "#9966ff" },
      loop_blocks: { colourPrimary: "#5ba55b" },
      math_blocks: { colourPrimary: "#5ba55b" },
      variable_blocks: { colourPrimary: "#ff6680" },
      procedure_blocks: { colourPrimary: "#995ba5" },
    },
    componentStyles: {
      workspaceBackgroundColour: config.workspaceColor,
      toolboxBackgroundColour: config.toolboxColor,
      toolboxForegroundColour: themeName === "light" ? "#333" : "#fff",
      flyoutBackgroundColour: config.flyoutColor,
      flyoutForegroundColour: "#cccccc",
      scrollbarColour: themeName === "light" ? "#ccc" : (themeName === "coffee" ? "#a68c81" : "#3e3e42"),
      insertionMarkerColour: "#ffffff",
      cursorColour: themeName === "coffee" ? "#cda886" : "#00bfa5",
    },
  });

  workspace.setTheme(blocklyTheme);

  if (monacoEditorInstance) {
    if (config.name === "aura") monaco.editor.setTheme("aura-theme");
    if (config.name === "light") monaco.editor.setTheme("light-theme");
    if (config.name === "void") monaco.editor.setTheme("void-theme");
    if (config.name === "coffee") monaco.editor.setTheme("coffee-theme");
  }

  if (monacoLiveEditor) {
    if (config.name === "aura") monaco.editor.setTheme("aura-theme");
    if (config.name === "light") monaco.editor.setTheme("light-theme");
    if (config.name === "void") monaco.editor.setTheme("void-theme");
    if (config.name === "coffee") monaco.editor.setTheme("coffee-theme");
  }

  localStorage.setItem("roboblocks_theme", config.name);
  toggleModal("themeModal", false);

  if (document.getElementById("themeModal").style.display === "flex") {
    showToast(`Tema ${config.name.toUpperCase()} aplicado!`);
  }
}

// =============================================================
// 2. INICIALIZAÇÃO DO WORKSPACE E AUTO-SAVE
// =============================================================
const workspace = Blockly.inject("blocklyArea", {
  toolbox: document.getElementById("toolbox"),
  renderer: "zelos",
  grid: { spacing: 20, length: 3, colour: "#2a2a2a", snap: true },
  zoom: {
    controls: true,
    wheel: true,
    startScale: 0.9,
    maxScale: 3,
    minScale: 0.3,
  },
  trashcan: true,
});

const savedTheme = localStorage.getItem("roboblocks_theme") || "aura";
setTheme(savedTheme);

setTimeout(() => {
  Blockly.svgResize(workspace);
}, 100);
window.addEventListener("resize", () => Blockly.svgResize(workspace));

// Traz os blocos padrões ao iniciar um novo projeto
const DEFAULT_XML = `<xml><block type="roboblocks_start" x="100" y="50" deletable="false"></block></xml>`;

const autoSaveXml = localStorage.getItem("roboblocks_autosave");
if (
  autoSaveXml &&
  autoSaveXml !==
    '<xml xmlns="https://developers.google.com/blockly/xml"></xml>'
) {
  try {
    Blockly.Xml.domToWorkspace(
      Blockly.utils.xml.textToDom(autoSaveXml),
      workspace,
    );
    setTimeout(() => showToast("💾 Projeto restaurado automaticamente!"), 1000);
  } catch (e) {
    console.error("Erro ao restaurar autosave", e);
    Blockly.Xml.domToWorkspace(
      Blockly.utils.xml.textToDom(DEFAULT_XML),
      workspace,
    );
  }
} else {
  // Injeta bloco padrao
  Blockly.Xml.domToWorkspace(
    Blockly.utils.xml.textToDom(DEFAULT_XML),
    workspace,
  );
}

// Lógica do Empty State
function checkEmptyState() {
  const emptyStateEl = document.getElementById("emptyState");
  if (workspace.getAllBlocks().length === 0) {
    emptyStateEl.classList.add("show");
  } else {
    emptyStateEl.classList.remove("show");
  }
}
checkEmptyState();

// =============================================================
// 3. MENU E HELPERS UI
// =============================================================

document
  .getElementById("menuBtn")
  .addEventListener("click", () =>
    document.getElementById("sideMenu").classList.add("open"),
  );
document
  .getElementById("closeMenuBtn")
  .addEventListener("click", () =>
    document.getElementById("sideMenu").classList.remove("open"),
  );

document.getElementById("openThemeModalBtn").addEventListener("click", () => {
  document.getElementById("sideMenu").classList.remove("open");
  toggleModal("themeModal", true);
});
document
  .getElementById("closeThemeBtn")
  .addEventListener("click", () => toggleModal("themeModal", false));

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function toggleModal(modalId, show) {
  const modal = document.getElementById(modalId);
  if (show) {
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("modal-visible"), 10);
  } else {
    modal.classList.remove("modal-visible");
    setTimeout(() => {
      if (!modal.classList.contains("modal-visible"))
        modal.style.display = "none";
    }, 300);
  }
}

function showErrorModal(logOutput) {
  document.getElementById("errorMessageText").innerText = logOutput;
  toggleModal("errorModal", true);
}
document
  .getElementById("closeErrorBtn")
  .addEventListener("click", () => toggleModal("errorModal", false));
document.getElementById("viewErrorInCodeBtn").addEventListener("click", () => {
  toggleModal("errorModal", false);
  toggleModal("codeModal", true);
});

// =============================================================
// 4. CONFIGURAÇÃO E AGENTE (Integração CLI nativa)
// =============================================================
let currentCode = "";
let isAgentOnline = false;

let config = JSON.parse(localStorage.getItem("mymaker_config")) || {
  arduinoPath: "arduino-cli.exe",
  agentUrl: "http://localhost:3000",
};

// Escuta mudanças: Gera código C++, Atualiza Live Code e salva XML
workspace.addChangeListener((e) => {
  if (e.type === Blockly.Events.UI) return;
  checkEmptyState();
  try {
    currentCode = arduinoGenerator.workspaceToCode(workspace);

    // Atualiza o painel de código em tempo real
    if (monacoLiveEditor) {
      monacoLiveEditor.setValue(currentCode);
    }

    const xml = Blockly.Xml.workspaceToDom(workspace);
    localStorage.setItem("roboblocks_autosave", Blockly.Xml.domToText(xml));
  } catch (err) {
    console.error(err);
  }
});

document.getElementById("settingsBtn").addEventListener("click", () => {
  document.getElementById("arduinoPathInput").value = config.arduinoPath;
  document.getElementById("agentUrlInput").value = config.agentUrl;
  toggleModal("configModal", true);
});
document
  .getElementById("closeConfigBtn")
  .addEventListener("click", () => toggleModal("configModal", false));
document.getElementById("saveConfigBtn").addEventListener("click", () => {
  config.arduinoPath = document.getElementById("arduinoPathInput").value;
  config.agentUrl = document.getElementById("agentUrlInput").value;
  localStorage.setItem("mymaker_config", JSON.stringify(config));
  toggleModal("configModal", false);
  checkAgentStatus();
  showToast("Configurações salvas!");
});

const agentDot = document.getElementById("agentDot");
const agentStatusText = document.getElementById("agentStatus");

async function checkAgentStatus() {
  try {
    const res = await fetch(`${config.agentUrl}/status`);
    if (res.ok) {
      isAgentOnline = true;
      agentDot.classList.add("status-online");
      agentStatusText.style.color = "var(--text-main)";
      document.getElementById("uploadBtn").title = "Pronto para enviar";
    }
  } catch (e) {
    isAgentOnline = false;
    agentDot.classList.remove("status-online");
    agentStatusText.style.color = "var(--text-muted)";
  }
}
setInterval(checkAgentStatus, 2000);
checkAgentStatus();

// =============================================================
// 5. INTEGRAÇÃO COM MONACO EDITOR E LIVE CODE
// =============================================================

require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs",
  },
});

let isManualEdit = false;
let isSystemUpdate = false;

// Lógica de Toggle do Live Code Panel
document
  .getElementById("toggleLiveCodeBtn")
  .addEventListener("click", async () => {
    const panel = document.getElementById("liveCodePanel");
    panel.classList.toggle("open");

    if (panel.classList.contains("open")) {
      setTimeout(() => Blockly.svgResize(workspace), 300);

      if (!monacoLiveEditor) {
        document.getElementById("monacoLiveContainer").innerHTML =
          '<p style="color:#888; text-align:center; padding-top:20px;">Carregando...</p>';
        await initMonaco();
      }
      setTimeout(() => monacoLiveEditor.layout(), 350);
    } else {
      setTimeout(() => Blockly.svgResize(workspace), 300);
    }
  });

document.getElementById("closeLiveCodeBtn").addEventListener("click", () => {
  document.getElementById("liveCodePanel").classList.remove("open");
  setTimeout(() => Blockly.svgResize(workspace), 300);
});

function initMonaco() {
  return new Promise((resolve) => {
    require(["vs/editor/editor.main"], function () {
      monaco.editor.defineTheme("aura-theme", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6272a4", fontStyle: "italic" },
          { token: "keyword", foreground: "ff79c6", fontStyle: "bold" },
          { token: "number", foreground: "bd93f9" },
          { token: "string", foreground: "f1fa8c" },
          { token: "type", foreground: "8be9fd" },
          { token: "identifier", foreground: "f8f8f2" },
        ],
        colors: {
          "editor.background": "#15141b",
          "editor.foreground": "#f8f8f2",
          "editorCursor.foreground": "#ff79c6",
          "editor.lineHighlightBackground": "#21202e",
          "editorLineNumber.foreground": "#6272a4",
          "editor.selectionBackground": "#44475a",
        },
      });
      monaco.editor.defineTheme("light-theme", {
        base: "vs",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6a737d", fontStyle: "italic" },
          { token: "keyword", foreground: "d73a49", fontStyle: "bold" },
          { token: "string", foreground: "032f62" },
          { token: "number", foreground: "005cc5" },
          { token: "type", foreground: "6f42c1" },
        ],
        colors: {
          "editor.background": "#ffffff",
          "editor.foreground": "#24292e",
          "editorCursor.foreground": "#24292e",
          "editor.lineHighlightBackground": "#f6f8fa",
          "editorLineNumber.foreground": "#babbbd",
          "editor.selectionBackground": "#0366d625",
        },
      });
      monaco.editor.defineTheme("void-theme", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "008800" },
          { token: "keyword", foreground: "00ff41", fontStyle: "bold" },
          { token: "string", foreground: "00e5ff" },
          { token: "number", foreground: "bd93f9" },
          { token: "type", foreground: "00ff41" },
          { token: "identifier", foreground: "cccccc" },
        ],
        colors: {
          "editor.background": "#000000",
          "editor.foreground": "#e0e0e0",
          "editorCursor.foreground": "#00ff41",
          "editor.lineHighlightBackground": "#111111",
          "editorLineNumber.foreground": "#333333",
          "editor.selectionBackground": "#003300",
        },
      });
      
      // Definição do Tema Coffee para o Editor Monaco
      monaco.editor.defineTheme('coffee-theme', {
          base: 'vs-dark', 
          inherit: true,
          rules: [
              { token: 'comment', foreground: 'a68c81', fontStyle: 'italic' },
              { token: 'keyword', foreground: 'cda886', fontStyle: 'bold' },
              { token: 'string', foreground: 'e6ccb2' },
              { token: 'number', foreground: 'ddb892' },
              { token: 'type', foreground: 'd4a373' },
              { token: 'identifier', foreground: 'fcf4eb' }
          ],
          colors: {
              'editor.background': '#2b211e',
              'editor.foreground': '#fcf4eb',
              'editorCursor.foreground': '#cda886',
              'editor.lineHighlightBackground': '#3a2c28',
              'editorLineNumber.foreground': '#a68c81',
              'editor.selectionBackground': '#54403a'
          }
      });

      let saved = localStorage.getItem("roboblocks_theme") || "aura";
      let initialTheme = "aura-theme";
      if (saved === "light") initialTheme = "light-theme";
      if (saved === "void") initialTheme = "void-theme";
      if (saved === "coffee") initialTheme = "coffee-theme";

      // Instancia Monaco do Modal de Edição (Se precisar)
      const modalContainer = document.getElementById("monacoEditorContainer");
      if (modalContainer) {
        modalContainer.innerHTML = "";
        monacoEditorInstance = monaco.editor.create(modalContainer, {
          value: currentCode,
          language: "cpp",
          theme: initialTheme,
          automaticLayout: true,
          readOnly: false,
          minimap: { enabled: true },
          fontFamily: "'Fira Code', 'Consolas', monospace",
          fontSize: 14,
          fontLigatures: true,
          scrollBeyondLastLine: false,
          padding: { top: 20, bottom: 20 },
        });
        monacoEditorInstance.onDidChangeModelContent(() => {
          if (!isSystemUpdate) isManualEdit = true;
        });
      }

      // Instancia Monaco da Live View Lateral
      const liveContainer = document.getElementById("monacoLiveContainer");
      if (liveContainer) {
        liveContainer.innerHTML = "";
        monacoLiveEditor = monaco.editor.create(liveContainer, {
          value: currentCode,
          language: "cpp",
          theme: initialTheme,
          automaticLayout: true,
          readOnly: true,
          minimap: { enabled: false }, // Live Code é apenas visualização
          fontFamily: "'Fira Code', 'Consolas', monospace",
          fontSize: 13,
          scrollBeyondLastLine: false,
          padding: { top: 15, bottom: 15 },
        });
      }

      resolve(true);
    });
  });
}

function highlightErrors(logOutput) {
  if (!monacoEditorInstance) return;
  const model = monacoEditorInstance.getModel();
  monaco.editor.setModelMarkers(model, "arduino-linter", []);

  const regex = /:(\d+):(\d+):\s*(?:fatal\s+)?error:\s*(.*)/gi;
  const markers = [];
  let match;
  while ((match = regex.exec(logOutput)) !== null) {
    const line = parseInt(match[1]);
    const msg = match[3];
    markers.push({
      startLineNumber: line,
      startColumn: 1,
      endLineNumber: line,
      endColumn: 1000,
      message: msg,
      severity: monaco.MarkerSeverity.Error,
    });
  }
  monaco.editor.setModelMarkers(model, "arduino-linter", markers);
  if (markers.length > 0)
    monacoEditorInstance.revealLineInCenter(markers[0].startLineNumber);
}

document.getElementById("showCodeBtn").addEventListener("click", async () => {
  try {
    currentCode = arduinoGenerator.workspaceToCode(workspace);
  } catch (e) {}
  toggleModal("codeModal", true);

  if (!monacoEditorInstance) {
    document.getElementById("monacoEditorContainer").innerHTML =
      '<p style="color:#888; text-align:center; padding-top:20px;">Iniciando Monaco Editor...</p>';
    await initMonaco();
  }

  if (!isManualEdit) {
    isSystemUpdate = true;
    monacoEditorInstance.setValue(currentCode);
    isSystemUpdate = false;
  } else {
    showToast("⚠️ Modo Manual: Edições preservadas.");
  }
  setTimeout(() => monacoEditorInstance.layout(), 50);
});

document.getElementById("resetCodeBtn").addEventListener("click", () => {
  if (
    !confirm(
      "Isso apagará suas edições manuais e trará o código dos blocos de volta. Confirmar?",
    )
  )
    return;
  currentCode = arduinoGenerator.workspaceToCode(workspace);
  isManualEdit = false;
  isSystemUpdate = true;
  monacoEditorInstance.setValue(currentCode);
  isSystemUpdate = false;

  if (monacoEditorInstance)
    monaco.editor.setModelMarkers(
      monacoEditorInstance.getModel(),
      "arduino-linter",
      [],
    );
  showToast("🔄 Sincronizado com os Blocos!");
});

document
  .getElementById("closeModalBtn")
  .addEventListener("click", () => toggleModal("codeModal", false));

document.getElementById("copyCodeBtn").addEventListener("click", () => {
  const codeToCopy = monacoEditorInstance
    ? monacoEditorInstance.getValue()
    : currentCode;
  navigator.clipboard.writeText(codeToCopy);
  showToast("Código copiado!", "success");
});

function getFinalCode() {
  if (
    isManualEdit ||
    (monacoEditorInstance &&
      document.getElementById("codeModal").classList.contains("modal-visible"))
  ) {
    if (monacoEditorInstance) return monacoEditorInstance.getValue();
  }
  return arduinoGenerator.workspaceToCode(workspace);
}

document.getElementById("downloadInoBtn").addEventListener("click", () => {
  const code = getFinalCode();
  const blob = new Blob([code], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "RoboBlocks_Projeto.ino";
  a.click();
  showToast("Arquivo .ino baixado!");
});

// =============================================================
// 6. SERIAL, PORTAS E UPLOAD (Atualizado p/ Baud Rate e Scroll)
// =============================================================

const serialMonitor = document.getElementById("serialMonitor");
let currentPort = null;
let serialWriter = null;
let reader = null;
let lineBuffer = "";

document
  .getElementById("connectSerialBtn")
  .addEventListener("click", async () => {
    if (!navigator.serial) return alert("Use Chrome ou Edge para Serial.");

    const baudRate = parseInt(document.getElementById("baudRateSelect").value);

    try {
      currentPort = await navigator.serial.requestPort();
      await currentPort.open({ baudRate: baudRate });
      serialMonitor.classList.add("open");
      const output = document.getElementById("serialOutput");
      output.innerHTML += `<div style="color: var(--secondary); border-bottom: 1px dashed #333; padding-bottom: 5px;">>>> Conectado (${baudRate} baud) 🔌</div>`;

      const textEncoder = new TextEncoderStream();
      textEncoder.readable.pipeTo(currentPort.writable);
      serialWriter = textEncoder.writable.getWriter();

      const textDecoder = new TextDecoderStream();
      currentPort.readable.pipeTo(textDecoder.writable);
      reader = textDecoder.readable.getReader();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          const addTimestamp =
            document.getElementById("timestampCheck").checked;
          const autoScroll = document.getElementById("autoScrollCheck").checked;

          if (addTimestamp) {
            lineBuffer += value;
            if (lineBuffer.includes("\n")) {
              const lines = lineBuffer.split("\n");
              lineBuffer = lines.pop(); // Guarda o fragmento final sem \n
              const time = new Date().toLocaleTimeString();
              lines.forEach(
                (l) =>
                  (output.innerHTML += `<span style="color:#555">[${time}]</span> ${l}<br>`),
              );
            }
          } else {
            output.innerHTML += value.replace(/\n/g, "<br>");
          }

          if (autoScroll) output.scrollTop = output.scrollHeight;
        }
      }
    } catch (e) {
      console.log("Erro Serial:", e);
    }
  });

document.getElementById("sendSerialBtn").addEventListener("click", async () => {
  if (!serialWriter)
    return showToast("A porta serial não está conectada.", "error");
  const inputEl = document.getElementById("serialInputText");
  const dataToSend = inputEl.value + "\n";
  try {
    await serialWriter.write(dataToSend);
    inputEl.value = "";
  } catch (e) {
    showToast("Falha ao enviar dado.", "error");
  }
});

document
  .getElementById("serialInputText")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") document.getElementById("sendSerialBtn").click();
  });

document
  .getElementById("closeSerialBtn")
  .addEventListener("click", async () => {
    serialMonitor.classList.remove("open");
    if (reader) {
      await reader.cancel();
      reader = null;
    }
    if (serialWriter) {
      await serialWriter.close();
      serialWriter = null;
    }
    if (currentPort) {
      await currentPort.close();
      currentPort = null;
    }
  });
document
  .getElementById("clearSerialBtn")
  .addEventListener(
    "click",
    () => (document.getElementById("serialOutput").innerHTML = ""),
  );

async function updateComPorts() {
  const portSelect = document.getElementById("portInput");
  portSelect.innerHTML = '<option value="">Porta COM</option>';
  const fakeOption = document.createElement("option");
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
      const option = document.createElement("option");
      option.value = `COM${index + 3}`;
      option.text = label;
      portSelect.appendChild(option);
    });
    const addOption = document.createElement("option");
    addOption.value = "SEARCH";
    addOption.text = "➕ Nova Porta...";
    addOption.style.color = "#61ffca";
    portSelect.appendChild(addOption);
  } catch (err) {
    console.error("Erro portas:", err);
  }
}

document
  .getElementById("refreshPortsBtn")
  .addEventListener("click", updateComPorts);
document.getElementById("portInput").addEventListener("change", async (e) => {
  if (e.target.value === "SEARCH") {
    try {
      await navigator.serial.requestPort();
      await updateComPorts();
      const select = document.getElementById("portInput");
      if (select.options.length > 2)
        select.selectedIndex = select.options.length - 2;
    } catch (err) {
      e.target.value = "";
    }
  }
});
updateComPorts();

// =============================================================
// 7. AÇÃO DE UPLOAD E VERIFICAR
// =============================================================

document.getElementById("uploadBtn").addEventListener("click", async (e) => {
  e.preventDefault();
  if (!isAgentOnline) return showToast("🔌 Conector Offline!", "error");

  const board = document.getElementById("boardSelect").value;
  const port = document.getElementById("portInput").value;
  if (!port || port === "")
    return showToast("⚠️ Selecione uma porta COM", "error");

  const codeToUpload = getFinalCode();
  const btn = document.getElementById("uploadBtn");
  const originalText = btn.innerHTML;
  btn.innerHTML = `<span class="loading-spinner"></span> Enviando...`;
  btn.disabled = true;

  try {
    const response = await fetch(`${config.agentUrl}/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: codeToUpload,
        board: board,
        port: port,
        arduinoPath: config.arduinoPath,
      }),
    });

    const result = await response.json();
    if (result.success) {
      showToast("✅ Upload Concluído!", "success");
      if (monacoEditorInstance)
        monaco.editor.setModelMarkers(
          monacoEditorInstance.getModel(),
          "arduino-linter",
          [],
        );
    } else {
      showErrorModal(result.output);
      setTimeout(() => {
        if (!monacoEditorInstance)
          initMonaco().then(() => highlightErrors(result.output));
        else highlightErrors(result.output);
      }, 100);
    }
  } catch (err) {
    showToast("Erro de comunicação com o Agente.", "error");
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
});

document.getElementById("verifyBtn").addEventListener("click", async (e) => {
  e.preventDefault();
  if (!isAgentOnline) return showToast("🔌 Conector Offline!", "error");
  const board = document.getElementById("boardSelect").value;
  const codeToVerify = getFinalCode();

  const btn = document.getElementById("verifyBtn");
  const originalContent = btn.innerHTML;
  btn.innerHTML = `<span class="loading-spinner"></span> Verificando...`;
  btn.disabled = true;

  try {
    const response = await fetch(`${config.agentUrl}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: codeToVerify,
        board: board,
        arduinoPath: config.arduinoPath,
      }),
    });
    const result = await response.json();
    if (result.success) {
      showToast("✅ Código Compilado com Sucesso!", "success");
      if (monacoEditorInstance)
        monaco.editor.setModelMarkers(
          monacoEditorInstance.getModel(),
          "arduino-linter",
          [],
        );
    } else {
      showErrorModal(result.output);
      setTimeout(() => {
        if (!monacoEditorInstance)
          initMonaco().then(() => highlightErrors(result.output));
        else highlightErrors(result.output);
      }, 100);
    }
  } catch (err) {
    showToast("Erro ao comunicar com o Agente.", "error");
  } finally {
    btn.innerHTML = originalContent;
    btn.disabled = false;
  }
});

document.getElementById("downloadAgentBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = "../static/js/RoboBlocksConnector.exe";
  link.download = "RoboBlocksConnector.exe";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("⬇️ Download iniciado!");
});

// =============================================================
// 8. SALVAR, CARREGAR E EXEMPLOS
// =============================================================
document.getElementById("saveBtn").addEventListener("click", () => {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  const blob = new Blob([Blockly.Xml.domToText(xml)], { type: "text/xml" });
  const a = document.createElement("a");
  a.download = "projeto.xml";
  a.href = URL.createObjectURL(blob);
  a.click();
  showToast("Projeto salvo!");
});

document
  .getElementById("loadBtn")
  .addEventListener("click", () =>
    document.getElementById("loadInput").click(),
  );
document.getElementById("loadInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      workspace.clear();
      Blockly.Xml.domToWorkspace(
        Blockly.utils.xml.textToDom(e.target.result),
        workspace,
      );
      showToast("Projeto carregado!");
    } catch (err) {
      showToast("Erro ao carregar XML.", "error");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

const xmlBlink = `<xml><block type="roboblocks_start" x="100" y="50" deletable="false"><statement name="SETUP"><block type="io_pin_mode"><value name="PIN"><shadow type="math_number"><field name="NUM">13</field></shadow></value><field name="MODE">OUTPUT</field></block></statement><statement name="LOOP"><block type="io_digital_write"><value name="PIN"><shadow type="math_number"><field name="NUM">13</field></shadow></value><value name="STATE"><shadow type="io_high"></shadow></value><next><block type="controls_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value><next><block type="io_digital_write"><value name="PIN"><shadow type="math_number"><field name="NUM">13</field></shadow></value><value name="STATE"><shadow type="io_low"></shadow></value><next><block type="controls_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value></block></next></block></next></block></next></block></statement></block></xml>`;
const xmlServo = `<xml><block type="roboblocks_start" x="100" y="50" deletable="false"><statement name="LOOP"><block type="servo_write"><value name="PIN"><shadow type="math_number"><field name="NUM">9</field></shadow></value><value name="ANGLE"><shadow type="math_number"><field name="NUM">0</field></shadow></value><next><block type="controls_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value><next><block type="servo_write"><value name="PIN"><shadow type="math_number"><field name="NUM">9</field></shadow></value><value name="ANGLE"><shadow type="math_number"><field name="NUM">180</field></shadow></value><next><block type="controls_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value></block></next></block></next></block></next></block></statement></block></xml>`;
const xmlPot = `<xml><block type="roboblocks_start" x="100" y="50" deletable="false"><statement name="LOOP"><block type="io_serial_print"><value name="TEXT"><block type="io_analog_read"><value name="PIN"><shadow type="math_number"><field name="NUM">0</field></shadow></value></block></value><next><block type="controls_delay"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">100</field></shadow></value></block></next></block></statement></block></xml>`;

function loadExample(xml) {
  if (confirm("Isso substituirá seus blocos. Continuar?")) {
    workspace.clear();
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
    workspace.scrollCenter();
  }
}
workspace.registerButtonCallback("LOAD_BLINK", () => loadExample(xmlBlink));
workspace.registerButtonCallback("LOAD_SERVO", () => loadExample(xmlServo));
workspace.registerButtonCallback("LOAD_POT", () => loadExample(xmlPot));
document.getElementById("clearBtn")?.addEventListener("click", () => {
  if (confirm("Apagar tudo?")) {
    workspace.clear();
    Blockly.Xml.domToWorkspace(
      Blockly.utils.xml.textToDom(DEFAULT_XML),
      workspace,
    );
  }
});

// =============================================================
// 9. RESPONSIVIDADE: TELETRANSPORTE DE DOM
// =============================================================

function handleResponsiveLayout() {
  const width = window.innerWidth;
  const mobileBreakpoint = 850;

  const controlsBlock = document.getElementById("arduinoControlsBlock");
  const actionsBlock = document.getElementById("actionsBlock");
  const desktopControlsSlot = document.getElementById("desktopControlsSlot");
  const desktopActionsSlot = document.getElementById("desktopActionsSlot");
  const mobileMenuSlot = document.getElementById("mobileMenuSlot");

  if (width <= mobileBreakpoint) {
    if (controlsBlock.parentElement !== mobileMenuSlot) {
      mobileMenuSlot.appendChild(controlsBlock);
      mobileMenuSlot.appendChild(actionsBlock);
    }
  } else {
    if (controlsBlock.parentElement !== desktopControlsSlot) {
      desktopControlsSlot.appendChild(controlsBlock);
      desktopActionsSlot.appendChild(actionsBlock);
    }
  }
}
window.addEventListener("resize", handleResponsiveLayout);
window.addEventListener("DOMContentLoaded", handleResponsiveLayout);
handleResponsiveLayout();