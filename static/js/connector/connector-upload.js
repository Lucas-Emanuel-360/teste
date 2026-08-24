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

document.getElementById("downloadAgentBtn").addEventListener("click", (e) => {
  e.stopPropagation(); // evita que um listener global (ex: fechar modal ao clicar fora) feche o instructionsModal no mesmo clique

  // Fecha o menu lateral, senão ele pode ficar por cima do modal (z-index) mesmo com display: flex
  const sideMenu = document.getElementById("sideMenu");
  if (sideMenu) sideMenu.classList.remove("open"); // ajuste "open" para a classe real usada pelo ui-menu.js, se for diferente

  const userAgent = navigator.userAgent.toLowerCase();
  let linkDownload = "";
  let fileName = "";
  let instructions = "";

  // Links apontando para a tag v1.2.0
  const linkWindows = "https://github.com/Lucas-Emanuel-360/teste/releases/download/v1.2.0/RoboBlocksConnectorWin.exe";
  const linkLinux   = "https://github.com/Lucas-Emanuel-360/teste/releases/download/v1.2.0/RoboBlocksConnectorLinux";
  const linkMac     = "https://github.com/Lucas-Emanuel-360/teste/releases/download/v1.2.0/RoboBlocksConnectorMac";

  // Prepara o link e as instruções com base no SO
  if (userAgent.indexOf("mac") !== -1) {
      linkDownload = linkMac;
      fileName = "RoboBlocksConnectorMac";
      instructions = `
        <h3 style="color: var(--primary); margin-bottom: 10px;">🍎 macOS Detectado</h3>
        <p>1. Após o download, abra o terminal na pasta do arquivo e dê permissão com:<br><code style="background: var(--bg-input); padding: 3px 6px; border-radius: 4px; color: var(--accent);">chmod +x RoboBlocksConnectorMac</code></p>
        <p style="margin-top: 10px;">2. Dê dois cliques para executar.</p>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 13px;"><i>Nota: Se o macOS bloquear, vá em <b>Configurações > Privacidade e Segurança</b> e clique em "Abrir Mesmo Assim".</i></p>
      `;
  } else if (userAgent.indexOf("linux") !== -1) {
      linkDownload = linkLinux;
      fileName = "RoboBlocksConnectorLinux";
      instructions = `
        <h3 style="color: var(--primary); margin-bottom: 10px;">🐧 Linux Detectado</h3>
        <p>1. Após o download, abra um terminal na pasta do arquivo e dê permissão com:<br><code style="background: var(--bg-input); padding: 3px 6px; border-radius: 4px; color: var(--accent);">chmod +x RoboBlocksConnectorLinux</code></p>
        <p style="margin-top: 10px;">2. Ainda no terminal, rode:<br><code style="background: var(--bg-input); padding: 3px 6px; border-radius: 4px; color: var(--accent);">./RoboBlocksConnectorLinux</code></p>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 13px;"><i>Nota: dois cliques no arquivo pelo gerenciador de arquivos não abre o terminal — o Conector precisa rodar via terminal pra você ver o status dele.</i></p>
        <div style="background: rgba(255, 0, 0, 0.1); border-left: 4px solid var(--danger); padding: 10px; margin-top: 15px;">
            <strong style="color: var(--danger);">⚠️ A placa não apareceu na lista?</strong><br>
            <span style="font-size: 14px;">Seu usuário precisa de acesso às portas seriais. Rode no terminal:<br>
            <code style="background: var(--bg-input); padding: 3px 6px; border-radius: 4px; color: var(--accent);">sudo usermod -a -G dialout $USER</code><br>E então <b>reinicie o PC</b>.</span>
        </div>
      `;
  } else {
      linkDownload = linkWindows; // Fallback para Windows
      fileName = "RoboBlocksConnectorWin.exe";
      instructions = `
        <h3 style="color: var(--primary); margin-bottom: 10px;">🪟 Windows Detectado</h3>
        <p>1. Após o download, basta dar dois cliques no executável <b>RoboBlocksConnectorWin.exe</b>.</p>
        <p style="margin-top: 10px; color: var(--text-muted); font-size: 13px;"><i>Nota: Se o Windows Defender exibir um alerta azul, clique em <b>"Mais informações"</b> e depois em <b>"Executar assim mesmo"</b>.</i></p>
      `;
  }

  // Cria o link dinâmico e força o download do arquivo
  const link = document.createElement("a");
  link.href = linkDownload;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Localiza o modal de instruções e injeta o texto
  const modal = document.getElementById("instructionsModal");
  if (modal) {
      document.getElementById("instructionsBody").innerHTML = instructions;
      toggleModal("instructionsModal", true);
  } else {
      showToast("⬇️ Download iniciado!");
  }
});

// Listener para fechar o modal de instruções
const closeInstBtn = document.getElementById("closeInstructionsBtn");
if (closeInstBtn) {
  closeInstBtn.addEventListener("click", () => {
    toggleModal("instructionsModal", false);
  });
}