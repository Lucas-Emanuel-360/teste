// ========== BLOCOS DE VARIÁVEIS ==========

Blockly.defineBlocksWithJsonArray([
  // Bloco: Definir variável
  {
    "type": "variables_set",
    "message0": "definir %1 como %2",
    "args0": [
      {
        "type": "field_variable",
        "name": "VAR",
        "variable": "variavel"
      },
      {
        "type": "input_value",
        "name": "VALUE"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FF6680",
    "tooltip": "Define o valor de uma variável"
  },

  // Bloco: Obter variável
  {
    "type": "variables_get",
    "message0": "%1",
    "args0": [
      {
        "type": "field_variable",
        "name": "VAR",
        "variable": "variavel"
      }
    ],
    "output": null,
    "colour": "#FF6680",
    "tooltip": "Obtém o valor de uma variável"
  },

  // Bloco: Alterar variável (incrementar/decrementar)
  {
    "type": "variables_change",
    "message0": "alterar %1 por %2",
    "args0": [
      {
        "type": "field_variable",
        "name": "VAR",
        "variable": "variavel"
      },
      {
        "type": "input_value",
        "name": "DELTA",
        "check": "Number"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#FF6680",
    "inputsInline": true,
    "tooltip": "Altera o valor de uma variável numérica"
  }
]);