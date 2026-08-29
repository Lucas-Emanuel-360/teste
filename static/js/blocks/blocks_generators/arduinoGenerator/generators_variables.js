// ========== GERADORES DE CÓDIGO - VARIÁVEIS (INTELIGENTE) ==========

arduinoGenerator.forBlock['variables_set'] = function(block) {
  const varName = arduinoGenerator.nameDB_.getName(block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  
  const argument0 = arduinoGenerator.valueToCode(block, 'VALUE', arduinoGenerator.ORDER_ASSIGNMENT) || '0';
  
  // 1. Detecção de Tipo (mantido: usado para a declaração global)
  let type = 'int';
  if (argument0.startsWith('"') || argument0.startsWith("'")) {
    type = 'String';
  } else if (argument0.includes('.') || argument0.match(/sin|cos|tan|sqrt|pow/)) {
    type = 'float';
  }

  // 2. Declaração Global (evita redefinição) — continua igual
  if (!arduinoGenerator.definitions_['var_' + varName]) {
    arduinoGenerator.definitions_['var_' + varName] = `${type} ${varName};`;
  }

  // 3. O bloco SEMPRE retorna o código na posição em que foi colocado
  // no workspace — seja dentro do Setup, do Loop, ou de um if aninhado
  // em qualquer lugar. Removemos o desvio automático para setups_vars_
  // quando o valor era um número puro: aquela lógica assumia que todo
  // "definir X como <número>" estava destinado ao Setup.
  //
  // Com blocos soltos que podem ficar em qualquer lugar (ex: dentro de
  // um "if" no Loop, como "definir status_rodando como 1"), esse desvio
  // fazia o código sumir do lugar onde o usuário colocou o bloco e
  // reaparecer só uma vez, lá no topo do setup() — quebrando qualquer
  // lógica condicional que dependesse de atribuir a variável em runtime.
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

// O Blockly popula a categoria "Variáveis" automaticamente (custom="VARIABLE"
// no XML da toolbox) usando seu próprio conjunto padrão de blocos. Nesse
// conjunto, o bloco de "alterar X por Y" tem o tipo nativo "math_change",
// não "variables_change". Nosso "variables_change" customizado nunca é
// de fato inserível pela toolbox, então
// damos um gerador ao tipo que realmente aparece: math_change.
arduinoGenerator.forBlock['math_change'] = function(block) {
  const varName = arduinoGenerator.nameDB_.getName(
    block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  const argument0 = arduinoGenerator.valueToCode(block, 'DELTA', arduinoGenerator.ORDER_ADDITION) || '1';

  if (!arduinoGenerator.definitions_['var_' + varName]) {
    arduinoGenerator.definitions_['var_' + varName] = `int ${varName};`;
  }

  return `${varName} += ${argument0};\n`;
};