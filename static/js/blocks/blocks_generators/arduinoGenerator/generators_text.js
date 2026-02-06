arduinoGenerator.forBlock['text'] = function(block) {
  const code = JSON.stringify(block.getFieldValue('TEXT'));
  return [code, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['text_join'] = function(block) {
  const arg0 = arduinoGenerator.valueToCode(block, 'ADD0', arduinoGenerator.ORDER_NONE) || '""';
  const arg1 = arduinoGenerator.valueToCode(block, 'ADD1', arduinoGenerator.ORDER_NONE) || '""';
  return [`String(${arg0}) + String(${arg1})`, arduinoGenerator.ORDER_ADDITION];
};

arduinoGenerator.forBlock['text_string_conv'] = function(block) {
  const arg0 = arduinoGenerator.valueToCode(block, 'VAR', arduinoGenerator.ORDER_NONE) || '0';
  return [`String(${arg0})`, arduinoGenerator.ORDER_ATOMIC];
};