// =============================================================
// Depende de: workspace, DEFAULT_XML, checkEmptyState
// (todos definidos em core/workspace-init.js, que deve carregar
// ANTES deste arquivo).
// =============================================================

const AUTOSAVE_KEY = "roboblocks_autosave";
const AUTOSAVE_DEBOUNCE_MS = 500;

// Flag global usada por outros arquivos (var-button-bindings.js,
// project-io.js) para saber quando NÃO devem reagir a eventos —
// ou seja, quando o workspace está sendo montado por um XML
// carregado, não por uma ação real do usuário.
let isLoadingWorkspace = false;

let autosaveDebounceTimer = null;

// -------------------------------------------------------------
// Salva o estado atual do workspace imediatamente.
// -------------------------------------------------------------
function saveWorkspaceNow() {
  if (isLoadingWorkspace) return;
  try {
    const xmlDom = Blockly.Xml.workspaceToDom(workspace);
    const xmlText = Blockly.Xml.domToText(xmlDom);
    localStorage.setItem(AUTOSAVE_KEY, xmlText);
  } catch (err) {
    console.error("[Autosave] Falha ao salvar:", err);
  }
}

// -------------------------------------------------------------
// Agenda um salvamento após um período de inatividade. Chamadas
// repetidas em sequência rápida (ex: carregar vários blocos de
// uma vez) resetam o temporizador, resultando em um salvamento
// só, no final, com o estado já assentado.
// -------------------------------------------------------------
function scheduleAutosave() {
  if (isLoadingWorkspace) return;
  clearTimeout(autosaveDebounceTimer);
  autosaveDebounceTimer = setTimeout(saveWorkspaceNow, AUTOSAVE_DEBOUNCE_MS);
}

// -------------------------------------------------------------
// Restaura o workspace a partir do localStorage, ou cai no
// DEFAULT_XML se não houver nada salvo / o XML estiver corrompido.
// -------------------------------------------------------------
function restoreWorkspaceFromAutosave() {
  const savedXml = localStorage.getItem(AUTOSAVE_KEY);

  isLoadingWorkspace = true;

  // Blockly.Events.disable() impede que QUALQUER listener seja notificado
  // durante a restauração, não importa se os eventos internos (VAR_CREATE,
  // BLOCK_CREATE, etc.) disparam de forma síncrona ou em fila/rAF.
  //
  // Antes, confiávamos em isLoadingWorkspace + setTimeout(...,0) para
  // "esperar" os eventos assentarem — mas builds modernas do Blockly
  // enfileiram eventos (via requestAnimationFrame), e esse enfileiramento
  // podia acontecer DEPOIS do nosso setTimeout já ter liberado a flag,
  // fazendo com que a criação da variável recriada a partir da
  // seção <variables> do próprio XML salvo fosse tratada como uma
  // criação NOVA pelo usuário, inserindo um bloco extra a cada F5.
  //
  // Desligando eventos de verdade, essa corrida de tempo deixa de existir:
  // nenhum listener é chamado até nós mesmos reabilitarmos.
  Blockly.Events.disable();

  try {
    workspace.clear();

    if (savedXml) {
      const dom = Blockly.utils.xml.textToDom(savedXml);
      Blockly.Xml.domToWorkspace(dom, workspace);
    } else {
      const dom = Blockly.utils.xml.textToDom(DEFAULT_XML);
      Blockly.Xml.domToWorkspace(dom, workspace);
    }
  } catch (err) {
    console.error("[Autosave] XML salvo corrompido, restaurando padrão:", err);
    showToast("⚠️ Não foi possível restaurar o projeto salvo.", "error");
    workspace.clear();
    const dom = Blockly.utils.xml.textToDom(DEFAULT_XML);
    Blockly.Xml.domToWorkspace(dom, workspace);
  } finally {
    // Reabilita eventos ANTES de liberar isLoadingWorkspace, para que
    // qualquer evento genuíno do usuário (depois disso) volte a ser
    // processado normalmente.
    Blockly.Events.enable();
    isLoadingWorkspace = false;
    checkEmptyState();

    if (savedXml) {
      setTimeout(() => showToast("💾 Projeto restaurado automaticamente!"), 800);
    }
  }
}

// -------------------------------------------------------------
// Listener que decide quando salvar. Só mudanças estruturais
// (criar/mover/conectar/deletar bloco, criar variável) contam.
// -------------------------------------------------------------
workspace.addChangeListener((e) => {
  if (e.type === Blockly.Events.UI) return;
  scheduleAutosave();
});

// Restaura assim que a página carrega.
window.addEventListener("DOMContentLoaded", () => {
  restoreWorkspaceFromAutosave();
});