// ========== BLOCOS DE SERVOMOTOR (Seu Estilo) ==========

Blockly.defineBlocksWithJsonArray([
  // Girar Servo
  {
    "type": "servo_write",
    "message0": "girar servo no pino %1 para %2 graus",
    "args0": [
      { "type": "input_value", "name": "PIN", "check": "Number" },
      { "type": "input_value", "name": "ANGLE", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#4A90E2", // Azul (Igual IO)
    "inputsInline": true,
    "tooltip": "Move o servo motor (0 a 180 graus)"
  },
  
  // Ler Servo
  {
    "type": "servo_read",
    "message0": "ler ângulo do servo no pino %1",
    "args0": [
      { "type": "input_value", "name": "PIN", "check": "Number" }
    ],
    "output": "Number",
    "colour": "#4A90E2", // Azul (Igual IO)
    "inputsInline": true,
    "tooltip": "Lê a última posição definida do servo"
  }
]);