// ========== BLOCOS DE MATEMÁTICA ==========

Blockly.defineBlocksWithJsonArray([
  // Bloco: Número
  {
    "type": "math_number",
    "message0": "%1",
    "args0": [
      {
        "type": "field_number",
        "name": "NUM",
        "value": 0
      }
    ],
    "output": "Number",
    "colour": "#5BA55B",
    "tooltip": "Um número"
  },

  // Bloco: Operações matemáticas
  {
    "type": "math_arithmetic",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "input_value",
        "name": "A",
        "check": "Number"
      },
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["+", "ADD"],
          ["-", "MINUS"],
          ["×", "MULTIPLY"],
          ["÷", "DIVIDE"],
          ["^", "POWER"]
        ]
      },
      {
        "type": "input_value",
        "name": "B",
        "check": "Number"
      }
    ],
    "output": "Number",
    "colour": "#5BA55B",
    "inputsInline": true,
    "tooltip": "Operações matemáticas básicas"
  },

  // Bloco: Funções matemáticas
  {
    "type": "math_single",
    "message0": "%1 de %2",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "OP",
        "options": [
          ["raiz quadrada", "ROOT"],
          ["valor absoluto", "ABS"],
          ["negativo", "NEG"],
          ["arredondar", "ROUND"],
          ["arredondar para cima", "CEIL"],
          ["arredondar para baixo", "FLOOR"]
        ]
      },
      {
        "type": "input_value",
        "name": "NUM",
        "check": "Number"
      }
    ],
    "output": "Number",
    "colour": "#5BA55B",
    "tooltip": "Funções matemáticas comuns"
  },

  // Bloco: Número aleatório
  {
    "type": "math_random",
    "message0": "número aleatório entre %1 e %2",
    "args0": [
      {
        "type": "input_value",
        "name": "FROM",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "TO",
        "check": "Number"
      }
    ],
    "output": "Number",
    "colour": "#5BA55B",
    "inputsInline": true,
    "tooltip": "Gera um número aleatório"
  },

  // Bloco: Mapear valores
  {
    "type": "math_map",
    "message0": "mapear %1 de [%2 a %3] para [%4 a %5]",
    "args0": [
      {
        "type": "input_value",
        "name": "VALUE",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "FROM_LOW",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "FROM_HIGH",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "TO_LOW",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "TO_HIGH",
        "check": "Number"
      }
    ],
    "output": "Number",
    "colour": "#5BA55B",
    "inputsInline": false,
    "tooltip": "Mapeia um valor de uma faixa para outra (map do Arduino)"
  },
// Bloco: Restringir valores
  {
  "type": "math_constrain",
  "message0": "restringir %1 entre %2 e %3",
  "args0": [
    { "type": "input_value", "name": "VALUE", "check": "Number" },
    { "type": "input_value", "name": "LOW", "check": "Number" },
    { "type": "input_value", "name": "HIGH", "check": "Number" }
  ],
  "output": "Number",
  "colour": "#5BA55B",
  "inputsInline": true,
  "tooltip": "Força um número a ficar dentro de um limite (ex: entre 0 e 180)"
}
]);