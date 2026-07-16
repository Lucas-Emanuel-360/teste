// =============================================================
// Helpers defensivos de API de variáveis.
// Motivo: esta build do Blockly não expõe getVariableById/
// deleteVariableById diretamente em Workspace — a API real está
// em workspace.getVariableMap(). Esses helpers tentam múltiplos
// caminhos, do mais moderno ao mais antigo, para funcionar
// independente da versão exata em uso.
// =============================================================

function getVariableSafe(ws, varId) {
  const map = ws.getVariableMap();
  return map ? map.getVariableById(varId) : null;
}

function deleteVariableSafe(ws, varId) {
  const map = ws.getVariableMap();
  if (!map) return;

  const variable = map.getVariableById(varId);
  if (!variable) {
    console.warn("[RoboBlocks] Variável não encontrada para exclusão:", varId);
    return;
  }

  map.deleteVariable(variable); // API confirmada: recebe o OBJETO, não o ID
}

// =============================================================
// Sistema de clique resiliente para os botões [+] (criar variável)
// e [-] (excluir variável), e a lógica de auto-inserção do
// "definir X como" dentro do bloco Setup.
//
// Por que existe como arquivo separado: as extensões nativas do
// Blockly (Extensions.register + getSvgRoot) se mostraram frágeis
// porque o SVG de um campo é recriado a cada re-render do bloco pai
// (ex: ao conectar um novo bloco dentro do SETUP). Isso descartava
// os listeners antigos silenciosamente. A solução é reanexar os
// listeners sempre que o workspace mudar estruturalmente, usando um
// WeakSet para não duplicar em nós que já têm o listener.
// =============================================================

const boundFieldElements = new WeakSet();

function bindFieldClick(field, handler) {
  if (!field) return;
  const svgRoot = field.getSvgRoot();
  if (!svgRoot) return;
  if (boundFieldElements.has(svgRoot)) return;

  boundFieldElements.add(svgRoot);
  svgRoot.style.cursor = "pointer";

  // Impede que o clique seja interpretado como início de arraste do bloco
  svgRoot.addEventListener("mousedown", (e) => e.stopPropagation());

  svgRoot.addEventListener("click", (e) => {
    e.stopPropagation();
    handler();
  });
}


function rebindVarButtons() {
  workspace.getBlocksByType("setup_block", false).forEach((block) => {
    bindFieldClick(block.getField("ADD_VAR"), () => {
      Blockly.Variables.createVariableButtonHandler(block.workspace, null, "");
    });
  });

  workspace.getBlocksByType("variables_set", false).forEach((block) => {
    bindFieldClick(block.getField("DELETE_VAR"), () => {
      const varId = block.getFieldValue("VAR");
      const variable = getVariableSafe(block.workspace, varId);
      if (!variable) return;

      const usos = block.workspace
        .getAllBlocks(false)
        .filter(
          (b) => b.getVarModels && b.getVarModels().some((v) => v.getId() === varId),
        ).length;

      const msg =
        usos > 1
          ? `A variável "${variable.name}" é usada em ${usos} blocos. Excluir mesmo assim?`
          : `Excluir a variável "${variable.name}"?`;

      if (confirm(msg)) {
        deleteVariableSafe(block.workspace, varId);
      }
    });
  });
}

// -------------------------------------------------------------
// Auto-inserção: quando uma variável nasce (via [+] OU via toolbox),
// cria e encaixa um bloco "definir X como 0" dentro do Setup.
// -------------------------------------------------------------
let isInsertingVarBlock = false; // trava contra reentrância

function insertVarSetIntoSetup(ws, varId) {
  if (isInsertingVarBlock) return;
  isInsertingVarBlock = true;

  try {
    const setupBlock = ws.getBlocksByType("setup_block", false)[0];
    if (!setupBlock) return;

    const setupInput = setupBlock.getInput("SETUP");
    if (!setupInput || !setupInput.connection) return;

    const variable = getVariableSafe(ws, varId);
    if (!variable) {
      console.warn("[RoboBlocks] Variável não encontrada para varId:", varId);
      return;
    }

    let declBlock;

    if (Blockly.serialization && Blockly.serialization.blocks) {
      // Caminho preferencial: serialização JSON, que evita por completo
      // o problema de nós de texto/whitespace que XML tem, e é a API
      // recomendada em versões modernas do Blockly (v9+).
      const state = {
        type: "variables_set",
        fields: { VAR: { id: variable.getId() } },
        inputs: {
          VALUE: {
            shadow: { type: "math_number", fields: { NUM: 0 } },
          },
        },
      };
      declBlock = Blockly.serialization.blocks.append(state, ws);
    } else {
      // Fallback via XML, com a correção do bug anterior: usar
      // xmlDom.children[0] em vez de firstChild, já que "children"
      // (ao contrário de "childNodes"/firstChild) só retorna nós de
      // ELEMENTO, ignorando nós de texto/espaço em branco.
      const xmlText =
        `<xml xmlns="https://developers.google.com/blockly/xml">` +
        `<block type="variables_set">` +
        `<field name="VAR" id="${variable.getId()}" variabletype="${variable.type}">${variable.name}</field>` +
        `<value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>` +
        `</block></xml>`;

      const xmlDom = Blockly.utils.xml.textToDom(xmlText);
      declBlock = Blockly.Xml.domToBlock(xmlDom.children[0], ws);
    }

    if (!declBlock) {
      console.error("[RoboBlocks] Falha ao criar bloco variables_set para", variable.name);
      return;
    }

    const firstBlock = setupInput.connection.targetBlock();
    if (!firstBlock) {
      setupInput.connection.connect(declBlock.previousConnection);
      return;
    }
    let last = firstBlock;
    while (last.getNextBlock()) last = last.getNextBlock();
    last.nextConnection.connect(declBlock.previousConnection);

    // console.log("[RoboBlocks] Bloco 'definir X' inserido para:", variable.name, variable.getId());
  } catch (err) {
    // Antes, um erro aqui podia interromper o processamento do evento
    // VAR_CREATE inteiro, o que tinha efeito colateral em outros
    // listeners (inclusive o de autosave). Agora ele fica contido.
    console.error("[RoboBlocks] Erro ao inserir variável no Setup:", err);
  } finally {
    isInsertingVarBlock = false;
  }
}

workspace.addChangeListener((e) => {
  if (e.type === Blockly.Events.VAR_CREATE) {
    if (!isLoadingWorkspace && !isInsertingVarBlock) {
      insertVarSetIntoSetup(workspace, e.varId);
    }
  }

  // Re-vincula os botões após qualquer mudança estrutural
  // (novo bloco, conexão, desconexão). Ignoramos eventos de UI puros
  // (clique em bloco, scroll) porque não alteram a árvore de blocos.
  if (e.type !== Blockly.Events.UI) {
    setTimeout(rebindVarButtons, 0);
  } 
});

// Vínculo inicial, após o DEFAULT_XML/autosave já ter sido carregado
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(rebindVarButtons, 100);
});