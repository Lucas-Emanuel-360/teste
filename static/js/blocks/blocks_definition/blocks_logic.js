// ========== BLOCOS DE LÓGICA ==========

Blockly.defineBlocksWithJsonArray([
  // Bloco: Boolean (verdadeiro/falso)
  {
    "type": "logic_boolean",
    "message0": "%1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "BOOL",
        "options": [
          ["verdadeiro", "TRUE"],
          ["falso", "FALSE"]
        ]
      }
    ],
    "output": "Boolean",
    "colour": "#9966FF",
    "tooltip": "Valor booleano verdadeiro ou falso"
  },

  // Bloco: Comparação
  {
    "type": "logic_compare",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "input_value",
        "name": "A"
      },
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["=", "EQ"],
          ["≠", "NEQ"],
          ["<", "LT"],
          ["≤", "LTE"],
          [">", "GT"],
          ["≥", "GTE"]
        ]
      },
      {
        "type": "input_value",
        "name": "B"
      }
    ],
    "output": "Boolean",
    "colour": "#9966FF",
    "inputsInline": true,
    "tooltip": "Compara dois valores"
  },

  // Bloco: Operadores lógicos (E/OU)
  {
    "type": "logic_operation",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "input_value",
        "name": "A",
        "check": "Boolean"
      },
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["e", "AND"],
          ["ou", "OR"]
        ]
      },
      {
        "type": "input_value",
        "name": "B",
        "check": "Boolean"
      }
    ],
    "output": "Boolean",
    "colour": "#9966FF",
    "inputsInline": true,
    "tooltip": "Operadores lógicos AND/OR"
  },

  // Bloco: NOT (negação)
  {
    "type": "logic_negate",
    "message0": "não %1",
    "args0": [
      {
        "type": "input_value",
        "name": "BOOL",
        "check": "Boolean"
      }
    ],
    "output": "Boolean",
    "colour": "#9966FF",
    "tooltip": "Inverte o valor booleano"
  }
]);