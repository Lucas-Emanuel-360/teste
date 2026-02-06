// ========== GERADORES DE CÓDIGO - CONTROLE (OTIMIZADO) ==========

// Delay (esperar)
arduinoGenerator.forBlock['controls_delay'] = function(block) {
  let delay_time = arduinoGenerator.valueToCode(block, 'DELAY_TIME', arduinoGenerator.ORDER_ATOMIC) || '1000';
  const measure_unit = block.getFieldValue('MEASURE_UNIT'); // Se tiver seletor de unidade

  if (measure_unit === 'SECONDS') {
    return `delay(${delay_time} * 1000);\n`;
  }
  return `delay(${delay_time});\n`;
};

// Stop (travamento proposital)
arduinoGenerator.forBlock['controls_stop'] = function(block) {
  return `while(true) {
    // Parar execução
  }\n`;
};

// If (se/então)
arduinoGenerator.forBlock['controls_if_simple'] = function(block) {
  const condition = arduinoGenerator.valueToCode(block, 'CONDITION', arduinoGenerator.ORDER_NONE) || 'false';
  let branch = arduinoGenerator.statementToCode(block, 'DO');
  branch = arduinoGenerator.addLoopTrap(branch, block);
  
  return `if (${condition}) {\n${branch}}\n`;
};

// While (enquanto)
arduinoGenerator.forBlock['controls_while'] = function(block) {
  const condition = arduinoGenerator.valueToCode(block, 'CONDITION', arduinoGenerator.ORDER_NONE) || 'false';
  let branch = arduinoGenerator.statementToCode(block, 'DO');
  branch = arduinoGenerator.addLoopTrap(branch, block);
  
  return `while (${condition}) {\n${branch}}\n`;
};

// Repeat (repetir N vezes - Com proteção para loops aninhados)
arduinoGenerator.forBlock['controls_repeat'] = function(block) {
  const times = arduinoGenerator.valueToCode(block, 'TIMES', arduinoGenerator.ORDER_ATOMIC) || '10';
  let branch = arduinoGenerator.statementToCode(block, 'DO');
  branch = arduinoGenerator.addLoopTrap(branch, block);
  
  // Gera nome de variável única (i, j, k...) para evitar conflito em loops dentro de loops
  const loopVar = arduinoGenerator.nameDB_.getDistinctName('i', Blockly.VARIABLE_CATEGORY_NAME);
  
  return `for (int ${loopVar} = 0; ${loopVar} < ${times}; ${loopVar}++) {\n${branch}}\n`;
};

// Flow (break/continue)
arduinoGenerator.forBlock['controls_flow_statements'] = function(block) {
  const flow = block.getFieldValue('FLOW');
  return flow === 'BREAK' ? 'break;\n' : 'continue;\n';
};