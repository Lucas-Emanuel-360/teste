// ========== GERADORES DE CÓDIGO - VARIÁVEIS (CORRIGIDO) ==========

arduinoGenerator.forBlock['variables_set'] = function(block) {
  // CORREÇÃO: Usa nameDB_.getName em vez de getVariableName
  const varName = arduinoGenerator.nameDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  
  const argument0 = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ASSIGNMENT) || '0';
  
  // 1. Identifica se é int ou float
  let type = 'int';
  if (argument0.match(/[.]/) || argument0.match(/sin|cos|tan|sqrt|pow|random/)) {
    type = 'float';
  }

  // 2. Garante a declaração global (int a;)
  if (!arduinoGenerator.definitions_['var_' + varName]) {
    arduinoGenerator.definitions_['var_' + varName] = type + ' ' + varName + ';';
  }

  // 3. Inicialização Inteligente no Setup
  const isPureNumber = /^-?\d+(\.\d+)?$/.test(argument0);
  if (isPureNumber) {
    if (!arduinoGenerator.setups_vars_) arduinoGenerator.setups_vars_ = Object.create(null);
    arduinoGenerator.setups_vars_['assign_' + varName] = varName + ' = ' + argument0 + ';';
  }
  
  return varName + ' = ' + argument0 + ';\n';
};

arduinoGenerator.forBlock['variables_get'] = function(block) {
  const varName = arduinoGenerator.nameDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  return [varName, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['variables_change'] = function(block) {
  const varName = arduinoGenerator.nameDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  const argument0 = arduinoGenerator.valueToCode(block, 'DELTA', arduinoGenerator.ORDER_ADDITION) || '1';
  
  if (!arduinoGenerator.definitions_['var_' + varName]) {
    arduinoGenerator.definitions_['var_' + varName] = 'int ' + varName + ';';
  }
  
  return varName + ' += ' + argument0 + ';\n';
};