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

// === PORTAS SERIAIS ===
// Busca as portas reais no agente local (via arduino-cli) e popula o select.
async function refreshPorts(showToasts = true) {
  const portSelect = document.getElementById("portInput");
  const refreshBtn = document.getElementById("refreshPortsBtn");

  if (!isAgentOnline) {
    if (showToasts) showToast("🔌 Conector Offline!", "error");
    return;
  }

  const previousValue = portSelect.value;
  if (refreshBtn) refreshBtn.disabled = true;

  try {
    const url = new URL(`${config.agentUrl}/ports`);
    if (config.arduinoPath) url.searchParams.set("arduinoPath", config.arduinoPath);

    const res = await fetch(url);
    const data = await res.json();

    portSelect.innerHTML = '<option value="">Porta COM</option>';

    (data.ports || []).forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.address;
      opt.textContent = p.label;
      portSelect.appendChild(opt);
    });

    // Mantém a porta selecionada antes do refresh, se ela ainda existir na lista
    if (previousValue && [...portSelect.options].some((o) => o.value === previousValue)) {
      portSelect.value = previousValue;
    }

    if (showToasts) {
      const realPorts = (data.ports || []).filter((p) => p.address !== "COM_TESTE");
      showToast(realPorts.length ? "🔄 Portas atualizadas!" : "Nenhuma porta real encontrada.", realPorts.length ? "success" : "error");
    }
  } catch (e) {
    if (showToasts) showToast("Erro ao buscar portas no Agente.", "error");
  } finally {
    if (refreshBtn) refreshBtn.disabled = false;
  }
}

document.getElementById("refreshPortsBtn").addEventListener("click", () => refreshPorts(true));

async function checkAgentStatus() {
  const wasOnline = isAgentOnline;
  try {
    const res = await fetch(`${config.agentUrl}/status`);
    if (res.ok) {
      isAgentOnline = true;
      agentDot.classList.add("status-online");
      agentStatusText.style.color = "var(--text-main)";
      document.getElementById("uploadBtn").title = "Pronto para enviar";

      // Assim que o agente fica online (ou na primeira checagem), busca as portas automaticamente
      if (!wasOnline) refreshPorts(false);
    }
  } catch (e) {
    isAgentOnline = false;
    agentDot.classList.remove("status-online");
    agentStatusText.style.color = "var(--text-muted)";
  }
}
setInterval(checkAgentStatus, 2000);
checkAgentStatus();