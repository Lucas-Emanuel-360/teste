// ========== BLOCOS DE SAÍDA ==========

Blockly.defineBlocksWithJsonArray([
  // Bloco: Digital Write (escrever pino digital)
  {
    "type": "io_digital_write",
    "message0": "pino digital %1 estado %2",
    "args0": [
      {
        "type": "input_value",
        "name": "PIN",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "STATE"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4A90E2",
    "inputsInline": true,
    "tooltip": "Define o estado de um pino digital (HIGH/LOW ou 1/0)"
  },

  // Bloco: Analog Write (PWM)
  {
    "type": "io_analog_write",
    "message0": "pino PWM %1 valor %2",
    "args0": [
      {
        "type": "input_value",
        "name": "PIN",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "VALUE",
        "check": "Number"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4A90E2",
    "inputsInline": true,
    "tooltip": "Define valor PWM no pino (0-255)"
  },

  // Bloco: Pin Mode (configurar modo do pino)
  {
    "type": "io_pin_mode",
    "message0": "configurar pino %1 como %2",
    "args0": [
      {
        "type": "input_value",
        "name": "PIN",
        "check": "Number"
      },
      {
        "type": "field_dropdown",
        "name": "MODE",
        "options": [
          ["SAÍDA", "OUTPUT"],
          ["ENTRADA", "INPUT"],
          ["ENTRADA_PULLUP", "INPUT_PULLUP"]
        ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4A90E2",
    "inputsInline": true,
    "tooltip": "Define o modo de operação de um pino"
  },

  // Bloco: Serial Print
  {
    "type": "io_serial_print",
    "message0": "imprimir no serial %1",
    "args0": [
      {
        "type": "input_value",
        "name": "TEXT"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4A90E2",
    "tooltip": "Envia dados para o monitor serial"
  },

  // Bloco: HIGH (constante)
  {
    "type": "io_high",
    "message0": "ALTO",
    "output": "Number",
    "colour": "#4A90E2",
    "tooltip": "Estado HIGH (1)"
  },

  // Bloco: LOW (constante)
  {
    "type": "io_low",
    "message0": "BAIXO",
    "output": "Number",
    "colour": "#4A90E2",
    "tooltip": "Estado LOW (0)"
  },

  // Bloco: Tom (Buzzer)
  {
    "type": "io_tone",
    "message0": "tocar nota pino %1 freq %2 Hz tempo %3 ms",
    "args0": [
      { "type": "input_value", "name": "PIN", "check": "Number" },
      { "type": "input_value", "name": "FREQ", "check": "Number" },
      { "type": "input_value", "name": "DURATION", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4A90E2",
    "inputsInline": true,
    "tooltip": "Emite um som no buzzer"
  },

  // Bloco: Parar Som
  {
    "type": "io_notone",
    "message0": "parar som pino %1",
    "args0": [
      { "type": "input_value", "name": "PIN", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4A90E2",
    "tooltip": "Para o som imediatamente"
  }
]);