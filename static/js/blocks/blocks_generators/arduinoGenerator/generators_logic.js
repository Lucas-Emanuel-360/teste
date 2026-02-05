// ========== GERADORES DE CÓDIGO - LÓGICA ==========

arduinoGenerator.forBlock['logic_boolean'] = function(block) {
  const code = block.getFieldValue('BOOL') === 'TRUE' ? 'true' : 'false';
  return [code, arduinoGenerator.ORDER_ATOMIC];
};

arduinoGenerator.forBlock['logic_compare'] = function(block) {
  const OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  const operator = OPERATORS[block.getFieldValue('OP')];
  const order = (operator === '==' || operator === '!=') ?
      arduinoGenerator.ORDER_EQUALITY : arduinoGenerator.ORDER_RELATIONAL;
  const argument0 = arduinoGenerator.valueToCode(block, 'A', order) || '0';
  const argument1 = arduinoGenerator.valueToCode(block, 'B', order) || '0';
  const code = `${argument0} ${operator} ${argument1}`;
  return [code, order];
};

arduinoGenerator.forBlock['logic_operation'] = function(block) {
  const operator = block.getFieldValue('OP') === 'AND' ? '&&' : '||';
  const order = operator === '&&' ? arduinoGenerator.ORDER_LOGICAL_AND : arduinoGenerator.ORDER_LOGICAL_OR;
  const argument0 = arduinoGenerator.valueToCode(block, 'A', order) || 'false';
  const argument1 = arduinoGenerator.valueToCode(block, 'B', order) || 'false';
  const code = `${argument0} ${operator} ${argument1}`;
  return [code, order];
};

arduinoGenerator.forBlock['logic_negate'] = function(block) {
  const argument0 = arduinoGenerator.valueToCode(block, 'BOOL', arduinoGenerator.ORDER_UNARY_PREFIX) || 'false';
  const code = `!${argument0}`;
  return [code, arduinoGenerator.ORDER_UNARY_PREFIX];
};