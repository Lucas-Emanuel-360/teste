// ========== BLOCOS DE ENTRADA ==========

Blockly.defineBlocksWithJsonArray([
  // Bloco: Digital Read (ler pino digital)
  {
    "type": "io_digital_read",
    "message0": "ler pino digital %1",
    "args0": [
      {
        "type": "input_value",
        "name": "PIN",
        "check": "Number"
      }
    ],
    "output": "Number",
    "colour": "#4A90E2",
    "tooltip": "Lê o estado de um pino digital (retorna HIGH ou LOW)"
  },

  // Bloco: Analog Read (ler pino analógico)
  {
    "type": "io_analog_read",
    "message0": "ler pino analógico %1",
    "args0": [
      {
        "type": "input_value",
        "name": "PIN",
        "check": "Number"
      }
    ],
    "output": "Number",
    "colour": "#4A90E2",
    "tooltip": "Lê o valor de um pino analógico (0-1023)"
  },

  // Bloco: Tempo (Millis)
  {
    "type": "time_millis",
    "message0": "tempo decorrido (ms)",
    "output": "Number",
    "colour": "#5BA55B",
    "tooltip": "Retorna o tempo desde que o Arduino ligou"
  },

  // Bloco: Pulse In
  {
    "type": "io_pulsein",
    "message0": "ler pulso no pino %1 estado %2 timeout %3",
    "args0": [
      { "type": "input_value", "name": "PIN", "check": "Number" },
      { "type": "field_dropdown", "name": "STATE", "options": [["ALTO", "HIGH"], ["BAIXO", "LOW"]] },
      { "type": "input_value", "name": "TIMEOUT", "check": "Number" }
    ],
    "output": "Number",
    "colour": "#4A90E2",
    "inputsInline": true,
    "tooltip": "Lê a duração de um pulso (em microssegundos)."
  },

  // NOVO BLOCO: Ler Distância Ultrassônico
  {
    "type": "io_ultrasonic_read",
    "message0": "ler distância (cm) ultrassônico: Trigger %1 Echo %2",
    "args0": [
      { "type": "input_value", "name": "TRIG", "check": "Number" },
      { "type": "input_value", "name": "ECHO", "check": "Number" }
    ],
    "output": "Number",
    "colour": "#4A90E2",
    "inputsInline": true,
    "tooltip": "Retorna a distância em centímetros lida pelo sensor HC-SR04"
  }
]);