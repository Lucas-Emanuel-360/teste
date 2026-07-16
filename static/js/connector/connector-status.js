// =============================================================
// Config e verificação de status do Agente Conector (CLI local).
// Também é o lugar do listener que GERA o código a cada mudança
// do workspace
// =============================================================

let isAgentOnline = false;

let config = JSON.parse(localStorage.getItem("mymaker_config")) || {
  arduinoPath: "arduino-cli.exe",
  agentUrl: "http://localhost:3000",
};

// Gera código C++ a cada mudança relevante e atualiza Live Code.
workspace.addChangeListener((e) => {
  if (e.type === Blockly.Events.UI) return;
  if (isLoadingWorkspace) return;
  checkEmptyState();
  try {
  currentCode = arduinoGenerator.workspaceToCode(workspace);
  if (monacoLiveEditor) {
    monacoLiveEditor.setValue(currentCode);
  }
  } catch (err) {
    console.error("Erro ao gerar código:", err);
    showToast("⚠️ Erro ao gerar código — algum bloco está com problema (veja o console)", "error");

    // Tenta identificar e destacar o bloco problemático no workspace,
    // já que o erro geralmente ocorre "dentro" de um bloco específico
    // mas o try/catch não informa qual.
    const stackMatch = err.stack && err.stack.match(/forBlock\.(\w+)/);
    if (stackMatch) {
      console.warn(`[RoboBlocks] O erro ocorreu no gerador do tipo de bloco: "${stackMatch[1]}"`);
    }
  }
});

document.getElementById("settingsBtn").addEventListener("click", () => {
  document.getElementById("arduinoPathInput").value = config.arduinoPath;
  document.getElementById("agentUrlInput").value = config.agentUrl;
  toggleModal("configModal", true);
});
document.getElementById("closeConfigBtn").addEventListener("click", () => toggleModal("configModal", false));
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