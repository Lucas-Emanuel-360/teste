// =============================================================
// Geradores para funções definidas pelo usuário (procedures_*).
// =============================================================

// =============================================================
// Helper: sanitiza nomes de identificadores para
// C++ válido. O nameDB_/Blockly.Names desta build não lida bem com
// caracteres acentuados. ele converte cada byte UTF-8
// do caractere para hexadecimal, resultando em nomes corrompidos 
//
// Esta função remove acentos antes de o nome chegar no nameDB_,
// usando normalize('NFD') para separar a letra base do acento, e então descarta os acentos.
// Qualquer caractere que ainda não seja letra/número/underscore após
// isso é substituído por "_", e nomes que comecem com dígito recebem
// um "_" na frente (identificadores C++ não podem começar com número).
// =============================================================
function _sanitizeIdentifier(rawName) {
  if (!rawName) return '_';

  let name = rawName
    .normalize('NFD')                  // separa letra + acento
    .replace(/[\u0300-\u036f]/g, '');  // remove os acentos combináveis

  name = name.replace(/[^a-zA-Z0-9_]/g, '_'); // troca qualquer sobra inválida por "_"

  if (/^[0-9]/.test(name)) {
    name = '_' + name; // C++ não aceita identificador começando com número
  }

  return name || '_';
}

arduinoGenerator.forBlock["procedures_defnoreturn"] = function (block) {
  const funcName = arduinoGenerator.nameDB_.getName(
    _sanitizeIdentifier(block.getFieldValue("NAME")),
    Blockly.PROCEDURE_CATEGORY_NAME,
  );
  let branch = arduinoGenerator.statementToCode(block, "STACK");
  const args = [];
  // block.getVars() não existe nesta versão do Blockly — a API correta
  // é getVarModels(), que já devolve os objetos de variável diretamente
  
  const variables = block.getVarModels();
  for (let i = 0; i < variables.length; i++) {
    args[i] =
      "float " +
      arduinoGenerator.nameDB_.getName(variables[i].getId(), Blockly.VARIABLE_CATEGORY_NAME);
  }
  let code = "void " + funcName + "(" + args.join(", ") + ") {\n" + branch + "}";
  code = arduinoGenerator.scrub_(block, code);
  arduinoGenerator.definitions_["%" + funcName] = code;
  return null;
};

arduinoGenerator.forBlock["procedures_defreturn"] = function (block) {
  const funcName = arduinoGenerator.nameDB_.getName(
    _sanitizeIdentifier(block.getFieldValue("NAME")),
    Blockly.PROCEDURE_CATEGORY_NAME,
  );
  let branch = arduinoGenerator.statementToCode(block, "STACK");
  let returnValue =
    arduinoGenerator.valueToCode(block, "RETURN", arduinoGenerator.ORDER_NONE) || "";
  if (returnValue) {
    returnValue = arduinoGenerator.INDENT + "return " + returnValue + ";\n";
  }
  const args = [];
  const variables = block.getVarModels();
  for (let i = 0; i < variables.length; i++) {
    args[i] =
      "float " +
      arduinoGenerator.nameDB_.getName(variables[i].getId(), Blockly.VARIABLE_CATEGORY_NAME);
  }
  let code =
    "float " + funcName + "(" + args.join(", ") + ") {\n" + branch + returnValue + "}";
  code = arduinoGenerator.scrub_(block, code);
  arduinoGenerator.definitions_["%" + funcName] = code;
  return null;
};

arduinoGenerator.forBlock["procedures_callnoreturn"] = function (block) {
  const funcName = arduinoGenerator.nameDB_.getName(
    _sanitizeIdentifier(block.getFieldValue("NAME")),
    Blockly.PROCEDURE_CATEGORY_NAME,
  );
  const args = [];
  const variables = block.getVarModels();
  for (let i = 0; i < variables.length; i++) {
    args[i] =
      arduinoGenerator.valueToCode(block, "ARG" + i, arduinoGenerator.ORDER_NONE) || "0";
  }
  return funcName + "(" + args.join(", ") + ");\n";
};

arduinoGenerator.forBlock["procedures_callreturn"] = function (block) {
  const funcName = arduinoGenerator.nameDB_.getName(
    _sanitizeIdentifier(block.getFieldValue("NAME")),
    Blockly.PROCEDURE_CATEGORY_NAME,
  );
  const args = [];
  const variables = block.getVarModels();
  for (let i = 0; i < variables.length; i++) {
    args[i] =
      arduinoGenerator.valueToCode(block, "ARG" + i, arduinoGenerator.ORDER_NONE) || "0";
  }
  return [funcName + "(" + args.join(", ") + ")", arduinoGenerator.ORDER_ATOMIC];
};