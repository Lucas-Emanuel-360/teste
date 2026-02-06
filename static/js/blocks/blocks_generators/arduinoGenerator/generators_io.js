// ========== GERADORES DE CÓDIGO - ENTRADA/SAÍDA (OTIMIZADO) ==========

arduinoGenerator.forBlock['io_digital_write'] = function(block) {
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '13';
  const state = arduinoGenerator.valueToCode(block, 'STATE', arduinoGenerator.ORDER_ATOMIC) || 'LOW';
  
  // Usa chave única 'setup_output_PIN' para evitar repetição
  arduinoGenerator.setups_['setup_output_' + pin] = `pinMode(${pin}, OUTPUT);`;

  return `digitalWrite(${pin}, ${state});\n`;
};

arduinoGenerator.forBlock['io_digital_read'] = function(block) {
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '2';
  
  arduinoGenerator.setups_['setup_input_' + pin] = `pinMode(${pin}, INPUT);`;
  
  return [`digitalRead(${pin})`, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['io_analog_write'] = function(block) {
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '3';
  const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ATOMIC) || '0';
  
  arduinoGenerator.setups_['setup_output_' + pin] = `pinMode(${pin}, OUTPUT);`;
  
  return `analogWrite(${pin}, ${value});\n`;
};

arduinoGenerator.forBlock['io_analog_read'] = function(block) {
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || 'A0';
  // Analog read não precisa de pinMode explícito na maioria dos Arduinos, mas não faz mal
  return [`analogRead(${pin})`, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['io_pin_mode'] = function(block) {
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '13';
  const mode = block.getFieldValue('MODE'); // INPUT, OUTPUT, INPUT_PULLUP
  
  arduinoGenerator.setups_['setup_pinmode_' + pin] = `pinMode(${pin}, ${mode});`;
  
  return ''; // Bloco de configuração não gera código no loop
};

arduinoGenerator.forBlock['io_serial_print'] = function(block) {
  const text = arduinoGenerator.valueToCode(block, 'TEXT', arduinoGenerator.ORDER_ATOMIC) || '""';
  
  // Garante Serial.begin apenas uma vez
  arduinoGenerator.setups_['setup_serial'] = 'Serial.begin(9600);';
  
  return `Serial.println(${text});\n`;
};

arduinoGenerator.forBlock['io_tone'] = function(block) {
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '8';
  const freq = arduinoGenerator.valueToCode(block, 'FREQ', arduinoGenerator.ORDER_ATOMIC) || '440';
  const duration = arduinoGenerator.valueToCode(block, 'DURATION', arduinoGenerator.ORDER_ATOMIC) || '1000';
  
  arduinoGenerator.setups_['setup_output_' + pin] = `pinMode(${pin}, OUTPUT);`;
  
  return `tone(${pin}, ${freq}, ${duration});\n`;
};

arduinoGenerator.forBlock['io_notone'] = function(block) {
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '8';
  return `noTone(${pin});\n`;
};

arduinoGenerator.forBlock['time_millis'] = function(block) {
  return ['millis()', arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['io_high'] = function(block) { return ['HIGH', arduinoGenerator.ORDER_ATOMIC]; };
arduinoGenerator.forBlock['io_low'] = function(block) { return ['LOW', arduinoGenerator.ORDER_ATOMIC]; };

arduinoGenerator.forBlock['io_pulsein'] = function(block) {
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '7';
  const state = block.getFieldValue('STATE');
  const timeout = arduinoGenerator.valueToCode(block, 'TIMEOUT', arduinoGenerator.ORDER_ATOMIC) || '20000';
  
  arduinoGenerator.setups_['setup_input_' + pin] = `pinMode(${pin}, INPUT);`;

  return [`pulseIn(${pin}, ${state}, ${timeout})`, arduinoGenerator.ORDER_ATOMIC];
};