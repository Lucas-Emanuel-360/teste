// =============================================================
// Ações de Upload e Verificar via Agente Conector.
// =============================================================

document.getElementById("uploadBtn").addEventListener("click", async (e) => {
  e.preventDefault();
  if (!isAgentOnline) return showToast("🔌 Conector Offline!", "error");

  const board = document.getElementById("boardSelect").value;
  const port = document.getElementById("portInput").value;
  if (!port || port === "") return showToast("⚠️ Selecione uma porta COM", "error");

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
        monaco.editor.setModelMarkers(monacoEditorInstance.getModel(), "arduino-linter", []);
    } else {
      showErrorModal(result.output);
      setTimeout(() => {
        if (!monacoEditorInstance) initMonaco().then(() => highlightErrors(result.output));
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
        monaco.editor.setModelMarkers(monacoEditorInstance.getModel(), "arduino-linter", []);
    } else {
      showErrorModal(result.output);
      setTimeout(() => {
        if (!monacoEditorInstance) initMonaco().then(() => highlightErrors(result.output));
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
  const userAgent = navigator.userAgent.toLowerCase();
  let linkDownload = "";
  let fileName = "";

  // Links apontando para a tag v1.2.0 e os nomes exatos dos seus arquivos
  const linkWindows = "https://github.com/Lucas-Emanuel-360/teste/releases/download/v1.2.0/RoboBlocksConnectorWin.exe";
  const linkLinux   = "https://github.com/Lucas-Emanuel-360/teste/releases/download/v1.2.0/RoboBlocksConnectorLinux";
  const linkMac     = "https://github.com/Lucas-Emanuel-360/teste/releases/download/v1.2.0/RoboBlocksConnectorMac";

  // Verifica o sistema e define o link e o nome do arquivo
  if (userAgent.indexOf("mac") !== -1) {
      linkDownload = linkMac;
      fileName = "RoboBlocksConnectorMac";
  } else if (userAgent.indexOf("linux") !== -1) {
      linkDownload = linkLinux;
      fileName = "RoboBlocksConnectorLinux";
  } else {
      linkDownload = linkWindows; // Windows como fallback
      fileName = "RoboBlocksConnectorWin.exe";
  }

  // Cria o link dinâmico e força o download
  const link = document.createElement("a");
  link.href = linkDownload;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast("⬇️ Download iniciado!");
});