// =============================================================
// Cria o workspace, define DEFAULT_XML, gerencia toolbox e autosave
// básico. A restauração inicial mora aqui porque acontece no
// DOMContentLoaded junto com a seleção de plataforma.
// =============================================================

// =============================================================
// workspace-init.js — VERSÃO DE DIAGNÓSTICO (temporária)
// =============================================================

const workspace = Blockly.inject("blocklyArea", {
  toolbox: document.getElementById("toolbox"),
  renderer: "zelos",
  grid: { spacing: 20, length: 3, colour: "#2a2a2a", snap: true },
  zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 3, minScale: 0.3 },
  trashcan: true,
});

const baseToolboxXML = document.getElementById("toolbox").outerHTML;

const DEFAULT_XML = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="setup_block" x="100" y="50" deletable="false" movable="true"></block>
  <block type="loop_block" x="100" y="260" deletable="false" movable="true"></block>
</xml>
`;

let isLoadingWorkspace = false;
let currentCode = "";

function checkEmptyState() {
  const emptyStateEl = document.getElementById("emptyState");
  if (workspace.getAllBlocks().length === 0) {
    emptyStateEl.classList.add("show");
  } else {
    emptyStateEl.classList.remove("show");
  }
}

function iniciarIDE(plataforma) {
  localStorage.setItem("roboblocks_plataforma", plataforma);
  document.getElementById("selector-screen").style.display = "none";
  document.getElementById("ide-screen").style.display = "flex";
  const boardSelect = document.getElementById("boardSelect");
  boardSelect.value = plataforma === "mega" ? "mega" : "uno";
  atualizarToolbox(plataforma);
  setTimeout(() => {
    Blockly.svgResize(workspace);
    handleResponsiveLayout();
  }, 100);
}

function atualizarToolbox(plataforma) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(baseToolboxXML, "text/xml");
  if (plataforma === "uno" || plataforma === "mega") {
    const catProjetos = xmlDoc.getElementById("cat_projetos");
    if (catProjetos) {
      const catCaixinha = xmlDoc.getElementById("cat_caixinha");
      if (catCaixinha) catCaixinha.remove();
      if (catProjetos.children.length === 0) catProjetos.remove();
    }
  } else if (plataforma === "caixinha") {
    const catCarrinho = xmlDoc.getElementById("cat_carrinho");
    const catCdr = xmlDoc.getElementById("cat_cdr");
    const catSensoresFaceis = xmlDoc.getElementById("cat_sensores_faceis");
    if (catCarrinho) catCarrinho.remove();
    if (catCdr) catCdr.remove();
    if (catSensoresFaceis) catSensoresFaceis.remove();
  }
  workspace.updateToolbox(xmlDoc.documentElement);
}

document.getElementById("changePlatformBtn").addEventListener("click", () => {
  document.getElementById("sideMenu").classList.remove("open");
  document.getElementById("ide-screen").style.display = "none";
  document.getElementById("selector-screen").style.display = "flex";
});

// -------------------------------------------------------------
// DIAGNÓSTICO: loga toda vez que QUALQUER listener de mudança
// dispara, mostrando o tipo do evento e o estado da flag.
// -------------------------------------------------------------
workspace.addChangeListener((e) => {
  console.log(
    `[DIAG] evento="${e.type}" isLoadingWorkspace=${isLoadingWorkspace} blocosNoWorkspace=${workspace.getAllBlocks(false).length}`
  );
});

window.addEventListener("DOMContentLoaded", () => {
  console.log("[DIAG] === DOMContentLoaded iniciado ===");
  handleResponsiveLayout();

  const savedTheme = localStorage.getItem("roboblocks_theme") || "aura";
  setTheme(savedTheme);

  const savedPlatform = localStorage.getItem("roboblocks_plataforma");
  if (savedPlatform) {
    iniciarIDE(savedPlatform);
  } else {
    document.getElementById("ide-screen").style.display = "none";
    document.getElementById("selector-screen").style.display = "flex";
  }

  const autoSaveXml = localStorage.getItem("roboblocks_autosave");
  console.log("[DIAG] autoSaveXml lido do localStorage:", autoSaveXml);
  console.log("[DIAG] autoSaveXml é truthy?", !!autoSaveXml);
  console.log("[DIAG] autoSaveXml === xml vazio?", autoSaveXml === '<xml xmlns="https://developers.google.com/blockly/xml"></xml>');

  workspace.clear();
  console.log("[DIAG] workspace.clear() executado");

  isLoadingWorkspace = true;
  console.log("[DIAG] isLoadingWorkspace = true");

  if (autoSaveXml && autoSaveXml !== '<xml xmlns="https://developers.google.com/blockly/xml"></xml>') {
    console.log("[DIAG] entrando no bloco TRY de restauração");
    try {
      const xmlDom = Blockly.utils.xml.textToDom(autoSaveXml);
      console.log("[DIAG] textToDom OK, chamando domToWorkspace...");
      Blockly.Xml.domToWorkspace(xmlDom, workspace);
      console.log("[DIAG] domToWorkspace retornou SEM lançar exceção. Blocos agora:", workspace.getAllBlocks(false).length);
      setTimeout(() => showToast("💾 Projeto restaurado automaticamente!"), 1000);
    } catch (e) {
      console.error("[DIAG] EXCEÇÃO capturada no catch:", e.message);
      console.error("[DIAG] Stack:", e.stack);
      showToast("⚠️ Falha ao restaurar projeto salvo — veja o console (F12)", "error");
      const xmlDom = Blockly.utils.xml.textToDom(DEFAULT_XML);
      Blockly.Xml.domToWorkspace(xmlDom, workspace);
    }
  } else {
    console.log("[DIAG] entrou no ELSE — autoSaveXml era falsy ou igual ao xml vazio. Carregando DEFAULT_XML.");
    const xmlDom = Blockly.utils.xml.textToDom(DEFAULT_XML);
    Blockly.Xml.domToWorkspace(xmlDom, workspace);
  }

  console.log("[DIAG] agendando liberação de isLoadingWorkspace via setTimeout...");
  setTimeout(() => {
    isLoadingWorkspace = false;
    checkEmptyState();
    console.log("[DIAG] isLoadingWorkspace = false (dentro do setTimeout). Blocos finais:", workspace.getAllBlocks(false).length);
    console.log("[DIAG] localStorage NESTE MOMENTO:", localStorage.getItem("roboblocks_autosave"));
  }, 0);

  console.log("[DIAG] === fim síncrono do DOMContentLoaded (setTimeout ainda pendente) ===");
});