// ========== BLOCOS DE CONTROLE ==========

Blockly.defineBlocksWithJsonArray([
  // Bloco: Delay (esperar)
  {
    "type": "controls_delay",
    "message0": "esperar %1 %2",
    "args0": [
      {
        "type": "input_value",
        "name": "DELAY_TIME",
        "check": "Number"
      },
      {
        "type": "field_dropdown",
        "name": "MEASURE_UNIT",
        "options": [["segundos", "SECONDS"], ["milissegundos", "MILLISECONDS"]]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#D94848",
    "inputsInline": true,
    "tooltip": "Pausa a execução por um tempo"
  },

  // Bloco: Stop (parar programa)
  {
    "type": "controls_stop",
    "message0": "parar programa",
    "previousStatement": null,
    "colour": "#D94848",
    "tooltip": "Encerra o programa"
  },

  // Bloco: If (se/então)
  {
    "type": "controls_if_simple",
    "message0": "se %1 então",
    "args0": [
      {
        "type": "input_value",
        "name": "CONDITION",
        "check": "Boolean"
      }
    ],
    "message1": "%1",
    "args1": [
      {
        "type": "input_statement",
        "name": "DO"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#D94848",
    "tooltip": "Executa comandos se a condição for verdadeira"
  },

  // Bloco: While (enquanto)
  {
    "type": "controls_while",
    "message0": "enquanto %1",
    "args0": [
      {
        "type": "input_value",
        "name": "CONDITION",
        "check": "Boolean"
      }
    ],
    "message1": "%1",
    "args1": [
      {
        "type": "input_statement",
        "name": "DO"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#D94848",
    "tooltip": "Repete enquanto a condição for verdadeira"
  },

  // Bloco: Repeat (repetir N vezes)
  {
    "type": "controls_repeat",
    "message0": "repetir %1 vezes",
    "args0": [
      {
        "type": "input_value",
        "name": "TIMES",
        "check": "Number"
      }
    ],
    "message1": "%1",
    "args1": [
      {
        "type": "input_statement",
        "name": "DO"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#D94848",
    "tooltip": "Repete comandos um número específico de vezes"
  },
// Bloco: Break (interromper laço)
  {
  "type": "controls_flow_statements",
  "message0": "interromper laço (break)",
  "previousStatement": null,
  "colour": "#D94848",
  "tooltip": "Sai imediatamente do loop (for, while ou repeat) atual."
}
]);