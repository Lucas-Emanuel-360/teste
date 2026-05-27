// ========== GERADORES DE CÓDIGO - SENSORES PRÉ-DEFINIDOS ==========

// 1. Gerador: Sensor de Luz (LDR)
arduinoGenerator.forBlock['sensor_luz_simples'] = function(block) {
  const estado = block.getFieldValue('ESTADO');
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || 'A0';
  
  let code = '';
  // Limites padrão de LDR (0-1023). Ajuste conforme o resistor pull-down usado.
  if (estado === 'FORTE') {
    code = `(analogRead(${pin}) > 700)`;
  } else if (estado === 'AMBIENTE') {
    code = `(analogRead(${pin}) > 300 && analogRead(${pin}) <= 700)`;
  } else if (estado === 'FRACA') {
    code = `(analogRead(${pin}) <= 300)`;
  }

  return [code, arduinoGenerator.ORDER_CONDITIONAL];
};

// 2. Gerador: Sensor de Linha (Refletância / TCRT5000)
arduinoGenerator.forBlock['sensor_linha_simples'] = function(block) {
  const estado = block.getFieldValue('ESTADO');
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || 'A1';
  
  let code = '';
  // Limites padrão de refletância (0-1023)
  // Superfície clara reflete mais luz (valores menores no pino analógico em circuitos padrão)
  if (estado === 'MUITO') { // Branco / Claro
    code = `(analogRead(${pin}) < 300)`;
  } else if (estado === 'MEDIO') { // Borda
    code = `(analogRead(${pin}) >= 300 && analogRead(${pin}) <= 700)`;
  } else if (estado === 'POUCO') { // Preto / Escuro
    code = `(analogRead(${pin}) > 700)`;
  }

  return [code, arduinoGenerator.ORDER_CONDITIONAL];
};

// 3. Gerador: Sensor de Distância Ultrassônico
arduinoGenerator.forBlock['sensor_distancia_simples'] = function(block) {
  const operador = block.getFieldValue('OPERADOR');
  const distancia = block.getFieldValue('DISTANCIA');
  const trig = arduinoGenerator.valueToCode(block, 'TRIG', arduinoGenerator.ORDER_ATOMIC) || '8';
  const echo = arduinoGenerator.valueToCode(block, 'ECHO', arduinoGenerator.ORDER_ATOMIC) || '9';

  arduinoGenerator.definitions_['func_ultrasonic'] = 
    'long lerDistanciaUltrassonico(int trigPin, int echoPin) {\n' +
    '  pinMode(trigPin, OUTPUT);\n' +
    '  pinMode(echoPin, INPUT);\n' +
    '  digitalWrite(trigPin, LOW);\n' +
    '  delayMicroseconds(2);\n' +
    '  digitalWrite(trigPin, HIGH);\n' +
    '  delayMicroseconds(10);\n' +
    '  digitalWrite(trigPin, LOW);\n' +
    '  long duration = pulseIn(echoPin, HIGH, 20000);\n' +
    '  if (duration == 0) return 999;\n' + 
    '  return duration / 58;\n' +
    '}\n';

  let opCode = '';
  if (operador === 'MAIOR') opCode = '>';
  else if (operador === 'MENOR') opCode = '<';
  else if (operador === 'IGUAL') opCode = '==';

  const code = `(lerDistanciaUltrassonico(${trig}, ${echo}) ${opCode} ${distancia})`;
  
  return [code, arduinoGenerator.ORDER_CONDITIONAL];
};

// 4. Gerador: Potenciômetro
arduinoGenerator.forBlock['sensor_potenciometro_simples'] = function(block) {
  const estado = block.getFieldValue('ESTADO');
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || 'A0';
  
  let code = '';
  // Divide a escala de 0 a 1023 em 3 partes
  if (estado === 'ALTO') {
    code = `(analogRead(${pin}) > 682)`;
  } else if (estado === 'MEDIO') {
    code = `(analogRead(${pin}) >= 341 && analogRead(${pin}) <= 682)`;
  } else if (estado === 'BAIXO') {
    code = `(analogRead(${pin}) < 341)`;
  }

  return [code, arduinoGenerator.ORDER_CONDITIONAL];
};

// 5. Gerador: Botão / Touch
arduinoGenerator.forBlock['sensor_botao_simples'] = function(block) {
  const estado = block.getFieldValue('ESTADO');
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '2';
  
  // Utiliza INPUT_PULLUP por segurança para evitar pinos flutuando
  arduinoGenerator.setups_['setup_pullup_' + pin] = `pinMode(${pin}, INPUT_PULLUP);`;
  
  let code = '';
  if (estado === 'PRESSIONADO') {
    code = `(digitalRead(${pin}) == LOW)`;
  } else {
    code = `(digitalRead(${pin}) == HIGH)`;
  }

  return [code, arduinoGenerator.ORDER_CONDITIONAL];
};