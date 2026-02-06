// ========== GERADORES DE CÓDIGO - MATEMÁTICA ==========

arduinoGenerator.forBlock['math_number'] = function(block) {
  const code = String(block.getFieldValue('NUM'));
  return [code, code >= 0 ? arduinoGenerator.ORDER_ATOMIC : arduinoGenerator.ORDER_UNARY_PREFIX];
};

arduinoGenerator.forBlock['math_arithmetic'] = function(block) {
  const OPERATORS = {
    'ADD': [' + ', arduinoGenerator.ORDER_ADDITION],
    'MINUS': [' - ', arduinoGenerator.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', arduinoGenerator.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', arduinoGenerator.ORDER_DIVISION],
    'POWER': [null, arduinoGenerator.ORDER_NONE]
  };
  const tuple = OPERATORS[block.getFieldValue('OP')];
  const operator = tuple[0];
  const order = tuple[1];
  
  const arg0 = arduinoGenerator.valueToCode(block, 'A', order) || '0';
  const arg1 = arduinoGenerator.valueToCode(block, 'B', order) || '0';
  
  if (!operator) { // Power
    return [`pow(${arg0}, ${arg1})`, arduinoGenerator.ORDER_ATOMIC];
  }
  return [`${arg0}${operator}${arg1}`, order];
};

arduinoGenerator.forBlock['math_map'] = function(block) {
  const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_NONE) || '0';
  const fL = arduinoGenerator.valueToCode(block, 'FROM_LOW', arduinoGenerator.ORDER_NONE) || '0';
  const fH = arduinoGenerator.valueToCode(block, 'FROM_HIGH', arduinoGenerator.ORDER_NONE) || '1023';
  const tL = arduinoGenerator.valueToCode(block, 'TO_LOW', arduinoGenerator.ORDER_NONE) || '0';
  const tH = arduinoGenerator.valueToCode(block, 'TO_HIGH', arduinoGenerator.ORDER_NONE) || '255';
  
  return [`map(${value}, ${fL}, ${fH}, ${tL}, ${tH})`, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['math_random'] = function(block) {
  const from = arduinoGenerator.valueToCode(block, 'FROM', arduinoGenerator.ORDER_NONE) || '0';
  const to = arduinoGenerator.valueToCode(block, 'TO', arduinoGenerator.ORDER_NONE) || '100';
  
  return [`random(${from}, ${to})`, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['math_constrain'] = function(block) {
  const val = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_NONE) || '0';
  const low = arduinoGenerator.valueToCode(block, 'LOW', arduinoGenerator.ORDER_NONE) || '0';
  const high = arduinoGenerator.valueToCode(block, 'HIGH', arduinoGenerator.ORDER_NONE) || '100';
  
  return [`constrain(${val}, ${low}, ${high})`, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['math_single'] = function(block) {
  const operator = block.getFieldValue('OP');
  const arg = arduinoGenerator.valueToCode(block, 'NUM', arduinoGenerator.ORDER_NONE) || '0';
  
  let code;
  switch(operator) {
    case 'ROOT': code = `sqrt(${arg})`; break;
    case 'ABS': code = `abs(${arg})`; break;
    case 'NEG': return [`-${arg}`, arduinoGenerator.ORDER_UNARY_PREFIX];
    case 'ROUND': code = `round(${arg})`; break;
    case 'CEIL': code = `ceil(${arg})`; break;
    case 'FLOOR': code = `floor(${arg})`; break;
    default: code = arg;
  }
  return [code, arduinoGenerator.ORDER_ATOMIC];
};