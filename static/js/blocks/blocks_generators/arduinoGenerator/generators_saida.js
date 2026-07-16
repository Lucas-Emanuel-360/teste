// ========== GERADORES DE CÓDIGO - SAÍDA ==========

arduinoGenerator.forBlock['io_digital_write'] = function(block) {
  const pin   = arduinoGenerator.valueToCode(block, 'PIN',   arduinoGenerator.ORDER_ATOMIC) || '13';
  const state = arduinoGenerator.valueToCode(block, 'STATE', arduinoGenerator.ORDER_ATOMIC) || 'LOW';

  arduinoGenerator.setups_['setup_output_' + pin] = `pinMode(${pin}, OUTPUT);`;
  return `digitalWrite(${pin}, ${state});\n`;
};

arduinoGenerator.forBlock['io_analog_write'] = function(block) {
  const pin   = arduinoGenerator.valueToCode(block, 'PIN',   arduinoGenerator.ORDER_ATOMIC) || '3';
  const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';

  arduinoGenerator.setups_['setup_output_' + pin] = `pinMode(${pin}, OUTPUT);`;
  return `analogWrite(${pin}, ${value});\n`;
};

arduinoGenerator.forBlock['io_pin_mode'] = function(block) {
  const pin  = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '13';
  const mode = block.getFieldValue('MODE');

  //fix: correção de duplicação em setup
  //arduinoGenerator.setups_['setup_pinmode_' + pin] = `pinMode(${pin}, ${mode});`;
  return `pinMode(${pin}, ${mode});\n`; // quando o pinmode escreve em setups_ ocorre duplicação quando o bloco é processado por setup_block
};

arduinoGenerator.forBlock['io_serial_print'] = function(block) {
  const text = arduinoGenerator.valueToCode(block, 'TEXT', arduinoGenerator.ORDER_ATOMIC) || '""';

  // Reaproveita o mesmo baud rate configurado no monitor serial da UI,
  // pra garantir que o código gerado sempre bata com o que o usuário
  // vai usar para ler a saída depois.
  const baudSelect = document.getElementById("baudRateSelect");
  const baudRate = baudSelect ? parseInt(baudSelect.value) : 9600;

  arduinoGenerator.setups_['setup_serial'] = `Serial.begin(${baudRate});`;
  return `Serial.println(${text});\n`;
};

arduinoGenerator.forBlock['io_tone'] = function(block) {
  const pin      = arduinoGenerator.valueToCode(block, 'PIN',      arduinoGenerator.ORDER_ATOMIC) || '8';
  const freq     = arduinoGenerator.valueToCode(block, 'FREQ',     arduinoGenerator.ORDER_ATOMIC) || '440';
  const duration = arduinoGenerator.valueToCode(block, 'DURATION', arduinoGenerator.ORDER_ATOMIC) || '1000';

  arduinoGenerator.setups_['setup_output_' + pin] = `pinMode(${pin}, OUTPUT);`;
  return `tone(${pin}, ${freq}, ${duration});\n`;
};

arduinoGenerator.forBlock['io_notone'] = function(block) {
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '8';
  return `noTone(${pin});\n`;
};

arduinoGenerator.forBlock['io_high'] = function(block) { return ['HIGH', arduinoGenerator.ORDER_ATOMIC]; };
arduinoGenerator.forBlock['io_low']  = function(block) { return ['LOW',  arduinoGenerator.ORDER_ATOMIC]; };