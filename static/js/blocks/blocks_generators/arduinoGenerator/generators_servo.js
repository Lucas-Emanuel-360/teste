// ========== GERADORES DE SERVOMOTOR (EFICIENTE) ==========

arduinoGenerator.forBlock['servo_write'] = function(block) {
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '9';
  const angle = arduinoGenerator.valueToCode(block, 'ANGLE', arduinoGenerator.ORDER_ATOMIC) || '90';
  
  // Nome único baseado no pino (ex: servo_9)
  const servoName = 'servo_' + pin;

  // Inclui lib apenas uma vez
  arduinoGenerator.definitions_['include_servo'] = '#include <Servo.h>';
  
  // Cria objeto global apenas uma vez
  arduinoGenerator.definitions_['var_' + servoName] = `Servo ${servoName};`;
  
  // Attach no setup apenas uma vez
  arduinoGenerator.setups_['setup_servo_' + pin] = `${servoName}.attach(${pin});`;
  
  return `${servoName}.write(${angle});\n`;
};

arduinoGenerator.forBlock['servo_read'] = function(block) {
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '9';
  const servoName = 'servo_' + pin;

  arduinoGenerator.definitions_['include_servo'] = '#include <Servo.h>';
  arduinoGenerator.definitions_['var_' + servoName] = `Servo ${servoName};`;
  arduinoGenerator.setups_['setup_servo_' + pin] = `${servoName}.attach(${pin});`;
  
  return [`${servoName}.read()`, arduinoGenerator.ORDER_ATOMIC];
};