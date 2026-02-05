// ========== GERADORES DE CÓDIGO - MATEMÁTICA ==========

// Número Simples
arduinoGenerator.forBlock['math_number'] = function(block) {
  const code = String(block.getFieldValue('NUM'));
  return [code, code >= 0 ? arduinoGenerator.ORDER_ATOMIC : arduinoGenerator.ORDER_UNARY_PREFIX];
};

// Operações Aritméticas (+, -, *, /)
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
  
  const argument0 = arduinoGenerator.valueToCode(block, 'A', order) || '0';
  const argument1 = arduinoGenerator.valueToCode(block, 'B', order) || '0';
  
  let code;
  if (!operator) { // Potência (pow)
    code = `pow(${argument0}, ${argument1})`;
    return [code, arduinoGenerator.ORDER_ATOMIC];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};

// Funções Matemáticas (Raiz, Abs, etc)
arduinoGenerator.forBlock['math_single'] = function(block) {
  const operator = block.getFieldValue('OP');
  const argument0 = arduinoGenerator.valueToCode(block, 'NUM', arduinoGenerator.ORDER_NONE) || '0';
  
  let code;
  switch(operator) {
    case 'ROOT':
      code = `sqrt(${argument0})`;
      break;
    case 'ABS':
      code = `abs(${argument0})`;
      break;
    case 'NEG':
      code = `-${argument0}`;
      return [code, arduinoGenerator.ORDER_UNARY_PREFIX];
    case 'ROUND':
      code = `round(${argument0})`;
      break;
    case 'CEIL':
      code = `ceil(${argument0})`;
      break;
    case 'FLOOR':
      code = `floor(${argument0})`;
      break;
    default:
      code = argument0;
  }
  return [code, arduinoGenerator.ORDER_ATOMIC];
};

// Mapear Valores (Map)
arduinoGenerator.forBlock['math_map'] = function(block) {
  const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_NONE) || '0';
  const fromLow = arduinoGenerator.valueToCode(block, 'FROM_LOW', arduinoGenerator.ORDER_NONE) || '0';
  const fromHigh = arduinoGenerator.valueToCode(block, 'FROM_HIGH', arduinoGenerator.ORDER_NONE) || '1023';
  const toLow = arduinoGenerator.valueToCode(block, 'TO_LOW', arduinoGenerator.ORDER_NONE) || '0';
  const toHigh = arduinoGenerator.valueToCode(block, 'TO_HIGH', arduinoGenerator.ORDER_NONE) || '255';
  
  const code = `map(${value}, ${fromLow}, ${fromHigh}, ${toLow}, ${toHigh})`;
  return [code, arduinoGenerator.ORDER_ATOMIC];
};

// === CORREÇÃO: O Bloco que estava faltando ===
arduinoGenerator.forBlock['math_random'] = function(block) {
  const from = arduinoGenerator.valueToCode(block, 'FROM', arduinoGenerator.ORDER_NONE) || '0';
  const to = arduinoGenerator.valueToCode(block, 'TO', arduinoGenerator.ORDER_NONE) || '100';
  
  // random(min, max) no Arduino
  const code = `random(${from}, ${to})`;
  return [code, arduinoGenerator.ORDER_ATOMIC];
};


// Constrain (Limitar Valores)
arduinoGenerator.forBlock['math_constrain'] = function(block) {
  const value = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_NONE) || '0';
  const low = arduinoGenerator.valueToCode(block, 'LOW', arduinoGenerator.ORDER_NONE) || '0';
  const high = arduinoGenerator.valueToCode(block, 'HIGH', arduinoGenerator.ORDER_NONE) || '100';
  return [`constrain(${value}, ${low}, ${high})`, arduinoGenerator.ORDER_ATOMIC];
};