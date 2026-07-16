// =============================================================
// Cria o workspace, define DEFAULT_XML, gerencia toolbox e
// seleção de plataforma. A restauração de autosave foi movida inteiramente para core/autosave.js.
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

const baseToolboxXML = document.getElementById("toolbox").outerHTML;

const DEFAULT_XML = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="setup_block" x="100" y="50" deletable="false" movable="true"></block>
  <block type="loop_block" x="100" y="260" deletable="false" movable="true"></block>
</xml>
`;

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
  if (plataforma === "mega") {
    boardSelect.value = "mega";
  } else {
    boardSelect.value = "uno";
  }

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

// Decide qual tela mostrar (seleção de plataforma vs IDE).
// A restauração do workspace em si é responsabilidade de autosave.js,
window.addEventListener("DOMContentLoaded", () => {
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
});