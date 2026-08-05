// =============================================================
// Geradores Arduino para os blocos fixos setup e loop.
// =============================================================

arduinoGenerator.forBlock["setup_block"] = function (block) {
  // Capturamos o texto retornado pelos blocos filhos do SETUP e o
  // escrevemos em setups_["user_setup"]. Isso é necessário porque
  // alguns blocos (como lcd_print_line, lcd_clear_display) só
  // RETORNAM código — eles não se auto-registram em setups_ como
  // side-effect (diferente de io_digital_write/io_analog_write/io_tone,
  // que escrevem em chaves próprias tipo "setup_output_<pin>").
  //
  // Isso não duplica nada: io_pin_mode hoje só retorna texto (não
  // se auto-registra mais), então ele também precisa que este
  // "user_setup" capture seu retorno. pinMode()
  // sozinho dentro do Setup também some, do mesmo jeito que o
  // lcd_print_line estava sumindo agora.
  const setupBranch = arduinoGenerator.statementToCode(block, "SETUP");
  if (setupBranch) {
    arduinoGenerator.setups_["user_setup"] = setupBranch;
  }
  return "";
};
arduinoGenerator.forBlock["loop_block"] = function (block) {
  return arduinoGenerator.statementToCode(block, "STACK");
};