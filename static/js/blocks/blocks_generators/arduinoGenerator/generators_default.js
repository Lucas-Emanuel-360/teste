// =============================================================
// Geradores Arduino para os blocos fixos setup e loop.
// =============================================================

arduinoGenerator.forBlock["setup_block"] = function (block) {
  // Sem esta chamada, os blocos dentro do Setup nunca são processados
  // pelo motor de geração.
  //
  // Descartamos o texto retornado de propósito: escrevê-lo em setups_
  // de novo (como a versão antiga fazia) duplicava o pinMode, porque
  // io_pin_mode JÁ escreve sozinho em setups_ como side-effect.
  arduinoGenerator.statementToCode(block, "SETUP");
  return "";
};
arduinoGenerator.forBlock["loop_block"] = function (block) {
  return arduinoGenerator.statementToCode(block, "STACK");
};