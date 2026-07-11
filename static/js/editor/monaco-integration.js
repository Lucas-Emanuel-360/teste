// =============================================================
// Toda a integração com Monaco Editor (código visível/editável).
// Depende de: workspace (pra gerar código), ui-modals.js (toggleModal),
// theme-manager.js (monacoEditorInstance/monacoLiveEditor já declarados
// como "let" ali — este arquivo REUTILIZA essas variáveis, não as
// redeclara).
// =============================================================

require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs",
  },
});

let isManualEdit = false;
let isSystemUpdate = false;

document.getElementById("toggleLiveCodeBtn").addEventListener("click", async () => {
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

      monaco.editor.defineTheme("coffee-theme", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "a68c81", fontStyle: "italic" },
          { token: "keyword", foreground: "cda886", fontStyle: "bold" },
          { token: "string", foreground: "e6ccb2" },
          { token: "number", foreground: "ddb892" },
          { token: "type", foreground: "d4a373" },
          { token: "identifier", foreground: "fcf4eb" },
        ],
        colors: {
          "editor.background": "#2b211e",
          "editor.foreground": "#fcf4eb",
          "editorCursor.foreground": "#cda886",
          "editor.lineHighlightBackground": "#3a2c28",
          "editorLineNumber.foreground": "#a68c81",
          "editor.selectionBackground": "#54403a",
        },
      });

      let saved = localStorage.getItem("roboblocks_theme") || "aura";
      let initialTheme = "aura-theme";
      if (saved === "light") initialTheme = "light-theme";
      if (saved === "void") initialTheme = "void-theme";
      if (saved === "coffee") initialTheme = "coffee-theme";

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

      const liveContainer = document.getElementById("monacoLiveContainer");
      if (liveContainer) {
        liveContainer.innerHTML = "";
        monacoLiveEditor = monaco.editor.create(liveContainer, {
          value: currentCode,
          language: "cpp",
          theme: initialTheme,
          automaticLayout: true,
          readOnly: true,
          minimap: { enabled: false },
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
  if (markers.length > 0) monacoEditorInstance.revealLineInCenter(markers[0].startLineNumber);
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
  if (!confirm("Isso apagará suas edições manuais e trará o código dos blocos de volta. Confirmar?"))
    return;
  currentCode = arduinoGenerator.workspaceToCode(workspace);
  isManualEdit = false;
  isSystemUpdate = true;
  monacoEditorInstance.setValue(currentCode);
  isSystemUpdate = false;

  if (monacoEditorInstance)
    monaco.editor.setModelMarkers(monacoEditorInstance.getModel(), "arduino-linter", []);
  showToast("🔄 Sincronizado com os Blocos!");
});

document.getElementById("closeModalBtn").addEventListener("click", () => toggleModal("codeModal", false));

document.getElementById("copyCodeBtn").addEventListener("click", () => {
  const codeToCopy = monacoEditorInstance ? monacoEditorInstance.getValue() : currentCode;
  navigator.clipboard.writeText(codeToCopy);
  showToast("Código copiado!", "success");
});

function getFinalCode() {
  if (
    isManualEdit ||
    (monacoEditorInstance && document.getElementById("codeModal").classList.contains("modal-visible"))
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