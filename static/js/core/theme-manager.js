// =============================================================
// GERENCIADOR DE TEMAS (JS + CSS)
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
let monacoLiveEditor = null;

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
