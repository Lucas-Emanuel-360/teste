// ========== GERADORES - CAIXINHA ==========

// ========== GERADORES - LEDs ==========

arduinoGenerator.forBlock['caixinha_led_on'] = function(block) {
  var porta = block.getFieldValue('PORTA');
  arduinoGenerator.setups_['setup_led_' + porta] = 'pinMode(' + porta + ', OUTPUT);';
  return 'digitalWrite(' + porta + ', HIGH);\n';
};

arduinoGenerator.forBlock['caixinha_led_off'] = function(block) {
  var porta = block.getFieldValue('PORTA');
  arduinoGenerator.setups_['setup_led_' + porta] = 'pinMode(' + porta + ', OUTPUT);';
  return 'digitalWrite(' + porta + ', LOW);\n';
};

arduinoGenerator.forBlock['caixinha_led_blink'] = function(block) {
  var porta = block.getFieldValue('PORTA');
  var vel = block.getFieldValue('VELOCIDADE');
  arduinoGenerator.setups_['setup_led_' + porta] = 'pinMode(' + porta + ', OUTPUT);';
  return 'digitalWrite(' + porta + ', HIGH);\ndelay(' + vel + ');\ndigitalWrite(' + porta + ', LOW);\ndelay(' + vel + ');\n';
};

// 2. Sensores (Distância, Luz e Botão)
arduinoGenerator.forBlock['caixinha_distancia'] = function(block) {
  var operador = block.getFieldValue('OPERADOR');
  var dist = block.getFieldValue('DISTANCIA');

  // Injeta a função de ler distância usando as portas 6 (Trig) e 7 (Echo) do DB4K
  arduinoGenerator.definitions_['func_ler_distancia'] =
    'int lerDistancia() {\n' +
    '  pinMode(6, OUTPUT);\n' +
    '  pinMode(7, INPUT);\n' +
    '  digitalWrite(6, LOW);\n' +
    '  delayMicroseconds(2);\n' +
    '  digitalWrite(6, HIGH);\n' +
    '  delayMicroseconds(10);\n' +
    '  digitalWrite(6, LOW);\n' +
    '  long duration = pulseIn(7, HIGH, 20000);\n' +
    '  if(duration == 0) return 999;\n' +
    '  return duration * 0.034 / 2;\n' +
    '}\n';

  var code = 'lerDistancia() ' + operador + ' ' + dist;
  return [code, arduinoGenerator.ORDER_RELATIONAL];
};

arduinoGenerator.forBlock['caixinha_botao'] = function(block) {
  var porta = block.getFieldValue('PORTA');
  var estado = block.getFieldValue('ESTADO');
  arduinoGenerator.setups_['setup_btn_' + porta] = 'pinMode(' + porta + ', INPUT);';
  var code = 'digitalRead(' + porta + ') == ' + estado;
  return [code, arduinoGenerator.ORDER_EQUALITY];
};

arduinoGenerator.forBlock['caixinha_luz'] = function(block) {
  var porta = block.getFieldValue('PORTA');
  var estado = block.getFieldValue('ESTADO'); // "< 70" ou "> 90"
  arduinoGenerator.setups_['setup_luz_' + porta] = 'pinMode(' + porta + ', INPUT);';
  var code = 'analogRead(' + porta + ') ' + estado;
  return [code, arduinoGenerator.ORDER_RELATIONAL];
};

// 3. Buzzer
arduinoGenerator.forBlock['caixinha_buzzer_nota'] = function(block) {
  var porta = block.getFieldValue('PORTA');
  var nota = parseFloat(block.getFieldValue('NOTA'));
  var oitava = parseFloat(block.getFieldValue('OITAVA'));
  var frequencia = Math.round(nota * oitava);
  
  arduinoGenerator.setups_['setup_buzzer_' + porta] = 'pinMode(' + porta + ', OUTPUT);';
  return 'tone(' + porta + ', ' + frequencia + ');\n';
};

arduinoGenerator.forBlock['caixinha_buzzer_silenciar'] = function(block) {
  var porta = block.getFieldValue('PORTA');
  arduinoGenerator.setups_['setup_buzzer_' + porta] = 'pinMode(' + porta + ', OUTPUT);';
  return 'noTone(' + porta + ');\n';
};

arduinoGenerator.forBlock['caixinha_buzzer_sirene'] = function(block) {
  var porta = block.getFieldValue('PORTA');
  var velocidade = block.getFieldValue('VELOCIDADE');
  arduinoGenerator.setups_['setup_buzzer_' + porta] = 'pinMode(' + porta + ', OUTPUT);';
  
  return 'tone(' + porta + ', 800);\ndelay(' + velocidade + ');\ntone(' + porta + ', 500);\ndelay(' + velocidade + ');\n';
};