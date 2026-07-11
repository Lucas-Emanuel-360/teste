// =============================================================
// blocks-setup-loop.js
// Define os blocos fixos "Iniciar (Setup)" e "Repetir para Sempre (Loop)".
// Não tem lógica de clique nem geradores — só estrutura visual.
// Precisa carregar ANTES de: gen-setup-loop.js, workspace-init.js
// =============================================================

Blockly.defineBlocksWithJsonArray([
  {
    type: "setup_block",
    message0: "iniciar %1",
    args0: [
      {
        type: "field_image",
        src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><line x1='12' y1='5' x2='12' y2='19'></line><line x1='5' y1='12' x2='19' y2='12'></line></svg>",
        width: 16,
        height: 16,
        alt: "+",
        name: "ADD_VAR",
      },
    ],
    message1: "%1",
    args1: [{ type: "input_statement", name: "SETUP" }],
    colour: 0,
    tooltip: "Configurações iniciais. Clique no [+] para criar uma variável.",
  },
]);

// setDeletable/setMovable não dá pra colocar no JSON puro, então
// sobrescrevemos o init() logo após a definição.
Blockly.Blocks["setup_block"].init0 = Blockly.Blocks["setup_block"].init;
Blockly.Blocks["setup_block"].init = function () {
  Blockly.Blocks["setup_block"].init0.call(this);
  this.setDeletable(false);
  this.setMovable(true);
};

Blockly.defineBlocksWithJsonArray([
  {
    type: "loop_block",
    message0: "repetir para sempre %1",
    args0: [{ type: "input_statement", name: "STACK" }],
    colour: 0,
    tooltip: "Código dentro deste bloco roda repetidamente (void loop).",
  },
]);

Blockly.Blocks["loop_block"].init0 = Blockly.Blocks["loop_block"].init;
Blockly.Blocks["loop_block"].init = function () {
  Blockly.Blocks["loop_block"].init0.call(this);
  this.setDeletable(false);
  this.setMovable(true);
};