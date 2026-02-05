// ========== GERADORES DE SERVOMOTOR ==========

arduinoGenerator.forBlock['servo_write'] = function(block) {
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '9';
  const angle = arduinoGenerator.valueToCode(block, 'ANGLE', arduinoGenerator.ORDER_ATOMIC) || '90';
  
  const servoName = 'servo_' + pin;

  // Inclui biblioteca e cria objeto
  arduinoGenerator.definitions_['include_servo'] = '#include <Servo.h>';
  arduinoGenerator.definitions_['var_' + servoName] = 'Servo ' + servoName + ';';
  
  // Configura no setup
  if (!arduinoGenerator.setups_) arduinoGenerator.setups_ = Object.create(null);
  arduinoGenerator.setups_['setup_servo_' + pin] = servoName + '.attach(' + pin + ');';
  
  return servoName + '.write(' + angle + ');\n';
};

arduinoGenerator.forBlock['servo_read'] = function(block) {
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '9';
  const servoName = 'servo_' + pin;

  arduinoGenerator.definitions_['include_servo'] = '#include <Servo.h>';
  arduinoGenerator.definitions_['var_' + servoName] = 'Servo ' + servoName + ';';
  
  if (!arduinoGenerator.setups_) arduinoGenerator.setups_ = Object.create(null);
  arduinoGenerator.setups_['setup_servo_' + pin] = servoName + '.attach(' + pin + ');';
  
  return [servoName + '.read()', arduinoGenerator.ORDER_ATOMIC];
};