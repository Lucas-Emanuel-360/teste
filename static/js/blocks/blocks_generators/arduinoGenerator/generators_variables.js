// ========== GERADORES DE CÓDIGO - VARIÁVEIS (INTELIGENTE) ==========

arduinoGenerator.forBlock['variables_set'] = function(block) {
  const varName = arduinoGenerator.nameDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  
  const argument0 = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ASSIGNMENT) || '0';
  
  // 1. Detecção de Tipo
  let type = 'int'; // Padrão
  
  if (argument0.startsWith('"') || argument0.startsWith("'")) {
    type = 'String';
  } else if (argument0.includes('.') || argument0.match(/sin|cos|tan|sqrt|pow/)) {
    type = 'float';
  }

  // 2. Declaração Global (evita redefinição)
  if (!arduinoGenerator.definitions_['var_' + varName]) {
    arduinoGenerator.definitions_['var_' + varName] = `${type} ${varName};`;
  }

  // 3. Inicialização no Setup (se for número puro) para evitar lixo de memória
  // Se for expressão complexa, deixa para o loop
  const isPureNumber = /^-?\d+(\.\d+)?$/.test(argument0);
  if (isPureNumber) {
     if (!arduinoGenerator.setups_vars_) arduinoGenerator.setups_vars_ = Object.create(null);
     arduinoGenerator.setups_vars_['assign_' + varName] = `${varName} = ${argument0};`;
  }
  
  return `${varName} = ${argument0};\n`;
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
  
  // Garante que existe, caso o usuário use o bloco "mudar" sem "definir" antes
  if (!arduinoGenerator.definitions_['var_' + varName]) {
    arduinoGenerator.definitions_['var_' + varName] = `int ${varName};`;
  }
  
  return `${varName} += ${argument0};\n`;
};