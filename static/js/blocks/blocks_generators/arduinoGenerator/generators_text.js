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

// ========== GERADORES DE CÓDIGO - LCD (SIMPLIFICADO) ==========

// Helper: garante que a lib e o objeto lcd_ sejam incluídos apenas uma vez
// e inicializa o LCD nos setups automaticamente sem precisar de um bloco de inicialização.
function _lcdEnsureSetup() {
  arduinoGenerator.definitions_['include_liquidcrystal'] = '#include <LiquidCrystal.h>';

  // Objeto global usando os pinos diretos do DB4K
  arduinoGenerator.definitions_['var_lcd'] =
    `LiquidCrystal lcd_(31, 33, 35, 30, 32, 34, 36);`;

  // Inicializa com 16 colunas, 2 linhas
  arduinoGenerator.setups_['setup_lcd'] =
    `lcd_.begin(16, 2);`;
}

// Gerador: Escrever texto na linha
arduinoGenerator.forBlock['lcd_print_line'] = function(block) {
  _lcdEnsureSetup();
  
  // Pega o texto e a linha escolhida
  const text = arduinoGenerator.valueToCode(block, 'TEXT', arduinoGenerator.ORDER_ATOMIC) || '""';
  const line = block.getFieldValue('LINE'); // Vai ser "0" (linha 1) ou "1" (linha 2)
  
  // O código C++ que vai pro Arduino: Move o cursor pro início da linha e imprime
  let code = `lcd_.setCursor(0, ${line});\n`;
  code += `lcd_.print(${text});\n`;
  
  return code;
};

// Gerador: Escrever texto numa posição (coluna, linha) específica
arduinoGenerator.forBlock['lcd_print_at'] = function(block) {
  _lcdEnsureSetup();

  const text = arduinoGenerator.valueToCode(block, 'TEXT', arduinoGenerator.ORDER_ATOMIC) || '""';
  const col = arduinoGenerator.valueToCode(block, 'COL', arduinoGenerator.ORDER_ATOMIC) || '0';
  const line = block.getFieldValue('LINE');

  let code = `lcd_.setCursor(${col}, ${line});\n`;
  code += `lcd_.print(${text});\n`;

  return code;
};

// Gerador: Apagar apenas uma linha (preenche com espaços em branco
// e volta o cursor para o início da linha, já que o LCD não tem
// comando nativo de "limpar só uma linha")
arduinoGenerator.forBlock['lcd_clear_line'] = function(block) {
  _lcdEnsureSetup();

  const line = block.getFieldValue('LINE');

  let code = `lcd_.setCursor(0, ${line});\n`;
  code += `lcd_.print("                ");\n`; // 16 espaços = largura padrão do display
  code += `lcd_.setCursor(0, ${line});\n`;

  return code;
};

// Gerador: Limpar tela
arduinoGenerator.forBlock['lcd_clear_display'] = function(block) {
  _lcdEnsureSetup();
  return 'lcd_.clear();\n';
};