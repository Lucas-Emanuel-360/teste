// ========== GERADORES DE TEXTO ==========

arduinoGenerator.forBlock['text'] = function(block) {
  const code = JSON.stringify(block.getFieldValue('TEXT'));
  return [code, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['text_join'] = function(block) {
  const argument0 = arduinoGenerator.valueToCode(block, 'ADD0', arduinoGenerator.ORDER_NONE) || '""';
  const argument1 = arduinoGenerator.valueToCode(block, 'ADD1', arduinoGenerator.ORDER_NONE) || '""';
  // Soma de Strings no Arduino
  const code = 'String(' + argument0 + ') + String(' + argument1 + ')';
  return [code, arduinoGenerator.ORDER_ADDITION];
};

arduinoGenerator.forBlock['text_string_conv'] = function(block) {
  const argument0 = arduinoGenerator.valueToCode(block, 'VAR', arduinoGenerator.ORDER_NONE) || '0';
  const code = 'String(' + argument0 + ')';
  return [code, arduinoGenerator.ORDER_ATOMIC];
};