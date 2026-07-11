// =============================================================
// blocks-variables.js
// Define variables_set/get/change customizados.
// CRÍTICO: deve carregar DEPOIS de qualquer arquivo "padrão" que
// também defina esses tipos (ex: um bundle de blocos stock), senão
// esse arquivo é sobrescrito e o campo DELETE_VAR desaparece.
// Se seu projeto tiver um arquivo tipo "loops.js"/"variables-stock.js"
// que já define variables_set, MOVA a tag <script> deste arquivo
// para depois dele no HTML.
// =============================================================

Blockly.defineBlocksWithJsonArray([
  {
    type: "variables_set",
    message0: "definir %1 como %2 %3",
    args0: [
      { type: "field_variable", name: "VAR", variable: "item" },
      { type: "input_value", name: "VALUE" },
      {
        type: "field_image",
        src: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><line x1='5' y1='12' x2='19' y2='12'></line></svg>",
        width: 14,
        height: 14,
        alt: "-",
        name: "DELETE_VAR",
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: "#FF6680",
    tooltip: "Define o valor de uma variável. Clique no [-] para excluí-la.",
    // o clique do DELETE_VAR é vinculado externamente por core/var-button-bindings.js
  },

  {
    type: "variables_get",
    message0: "%1",
    args0: [{ type: "field_variable", name: "VAR", variable: "item" }],
    output: null,
    colour: "#FF6680",
    tooltip: "Obtém o valor de uma variável",
  },

  {
    type: "variables_change",
    message0: "alterar %1 por %2",
    args0: [
      { type: "field_variable", name: "VAR", variable: "item" },
      { type: "input_value", name: "DELTA", check: "Number" },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#FF6680",
    inputsInline: true,
    tooltip: "Altera o valor de uma variável numérica",
  },
]);