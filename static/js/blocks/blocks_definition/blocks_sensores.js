// ========== BLOCOS DE SENSORES PRÉ-DEFINIDOS ==========

Blockly.defineBlocksWithJsonArray([
  // 1. Sensor de Luz (LDR)
  {
    "type": "sensor_luz_simples",
    "message0": "💡 Luz %1 no pino analógico %2",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "ESTADO",
        "options": [
          ["Forte ☀️", "FORTE"],
          ["Ambiente ⛅", "AMBIENTE"],
          ["Fraca 🌙", "FRACA"]
        ]
      },
      { "type": "input_value", "name": "PIN", "check": "Number" }
    ],
    "output": "Boolean",
    "colour": "#16A085", // Cor unificada com a categoria
    "inputsInline": true,
    "tooltip": "Verifica se a luz no ambiente está forte, normal ou fraca."
  },

  // 2. Sensor de Linha / Refletância (TCRT5000)
  {
    "type": "sensor_linha_simples",
    "message0": "👁️ Reflexo %1 no pino analógico %2",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "ESTADO",
        "options": [
          ["Muito (Branco) ⚪", "MUITO"],
          ["Médio 🌓", "MEDIO"],
          ["Pouco (Preto) ⚫", "POUCO"]
        ]
      },
      { "type": "input_value", "name": "PIN", "check": "Number" }
    ],
    "output": "Boolean",
    "colour": "#16A085", // Cor unificada com a categoria
    "inputsInline": true,
    "tooltip": "Verifica a quantidade de luz refletida (útil para seguidor de linha)."
  },

  // 3. Sensor de Distância (Ultrassônico)
  {
    "type": "sensor_distancia_simples",
    "message0": "📏 Distância %1 %2 cm Trig %3 Echo %4",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "OPERADOR",
        "options": [
          ["> maior que", "MAIOR"],
          ["< menor que", "MENOR"],
          ["= igual a", "IGUAL"]
        ]
      },
      { "type": "field_number", "name": "DISTANCIA", "value": 10, "min": 0 },
      { "type": "input_value", "name": "TRIG", "check": "Number" },
      { "type": "input_value", "name": "ECHO", "check": "Number" }
    ],
    "output": "Boolean",
    "colour": "#16A085", // Cor unificada com a categoria
    "inputsInline": true,
    "tooltip": "Verifica se um obstáculo está na distância especificada."
  },

  // 4. Potenciômetro
  {
    "type": "sensor_potenciometro_simples",
    "message0": "🎛️ Potenciômetro %1 no pino analógico %2",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "ESTADO",
        "options": [
          ["Alto 📈", "ALTO"],
          ["Médio ➖", "MEDIO"],
          ["Baixo 📉", "BAIXO"]
        ]
      },
      { "type": "input_value", "name": "PIN", "check": "Number" }
    ],
    "output": "Boolean",
    "colour": "#16A085", // Cor unificada com a categoria
    "inputsInline": true,
    "tooltip": "Verifica a posição do potenciômetro."
  },

  // 5. Botão / Sensor de Toque
  {
    "type": "sensor_botao_simples",
    "message0": "🔘 Botão %1 no pino digital %2",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "ESTADO",
        "options": [
          ["Pressionado 🛑", "PRESSIONADO"],
          ["Solto ⭕", "SOLTO"]
        ]
      },
      { "type": "input_value", "name": "PIN", "check": "Number" }
    ],
    "output": "Boolean",
    "colour": "#16A085", // Cor unificada com a categoria
    "inputsInline": true,
    "tooltip": "Verifica se o botão/sensor de toque está sendo apertado."
  }
]);