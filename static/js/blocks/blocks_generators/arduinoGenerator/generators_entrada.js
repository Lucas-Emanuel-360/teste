// ========== GERADORES DE CÓDIGO - ENTRADA ==========

arduinoGenerator.forBlock['io_digital_read'] = function(block) {
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '2';
  arduinoGenerator.setups_['setup_input_' + pin] = `pinMode(${pin}, INPUT);`;
  return [`digitalRead(${pin})`, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['io_analog_read'] = function(block) {
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || 'A0';
  return [`analogRead(${pin})`, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['time_millis'] = function(block) {
  return ['millis()', arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['io_pulsein'] = function(block) {
  const pin     = arduinoGenerator.valueToCode(block, 'PIN',     arduinoGenerator.ORDER_ATOMIC) || '7';
  const state   = block.getFieldValue('STATE');
  const timeout = arduinoGenerator.valueToCode(block, 'TIMEOUT', arduinoGenerator.ORDER_ATOMIC) || '20000';

  arduinoGenerator.setups_['setup_input_' + pin] = `pinMode(${pin}, INPUT);`;
  return [`pulseIn(${pin}, ${state}, ${timeout})`, arduinoGenerator.ORDER_ATOMIC];
};

// NOVO GERADOR: Ler Distância Ultrassônico
arduinoGenerator.forBlock['io_ultrasonic_read'] = function(block) {
  const trig = arduinoGenerator.valueToCode(block, 'TRIG', arduinoGenerator.ORDER_ATOMIC) || '8';
  const echo = arduinoGenerator.valueToCode(block, 'ECHO', arduinoGenerator.ORDER_ATOMIC) || '9';

  // Cria a função de leitura no escopo global do Arduino para deixar o loop principal limpo
  arduinoGenerator.definitions_['func_ultrasonic'] = 
    'long lerDistanciaUltrassonico(int trigPin, int echoPin) {\n' +
    '  pinMode(trigPin, OUTPUT);\n' +
    '  pinMode(echoPin, INPUT);\n' +
    '  digitalWrite(trigPin, LOW);\n' +
    '  delayMicroseconds(2);\n' +
    '  digitalWrite(trigPin, HIGH);\n' +
    '  delayMicroseconds(10);\n' +
    '  digitalWrite(trigPin, LOW);\n' +
    '  long duration = pulseIn(echoPin, HIGH, 20000);\n' + // Timeout de 20ms para não travar
    '  return duration / 58;\n' +
    '}\n';

  return [`lerDistanciaUltrassonico(${trig}, ${echo})`, arduinoGenerator.ORDER_ATOMIC];
};