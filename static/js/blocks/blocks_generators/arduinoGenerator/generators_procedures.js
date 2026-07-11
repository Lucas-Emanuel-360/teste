// =============================================================
// Geradores para funções definidas pelo usuário (procedures_*).
// =============================================================

arduinoGenerator.forBlock["procedures_defnoreturn"] = function (block) {
  const funcName = arduinoGenerator.nameDB_.getName(
    block.getFieldValue("NAME"),
    Blockly.PROCEDURE_CATEGORY_NAME,
  );
  let branch = arduinoGenerator.statementToCode(block, "STACK");

  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] =
      "float " +
      arduinoGenerator.nameDB_.getName(variables[i], Blockly.VARIABLE_CATEGORY_NAME);
  }

  let code = "void " + funcName + "(" + args.join(", ") + ") {\n" + branch + "}";
  code = arduinoGenerator.scrub_(block, code);
  arduinoGenerator.definitions_["%" + funcName] = code;
  return null;
};

arduinoGenerator.forBlock["procedures_defreturn"] = function (block) {
  const funcName = arduinoGenerator.nameDB_.getName(
    block.getFieldValue("NAME"),
    Blockly.PROCEDURE_CATEGORY_NAME,
  );
  let branch = arduinoGenerator.statementToCode(block, "STACK");
  let returnValue =
    arduinoGenerator.valueToCode(block, "RETURN", arduinoGenerator.ORDER_NONE) || "";
  if (returnValue) {
    returnValue = arduinoGenerator.INDENT + "return " + returnValue + ";\n";
  }
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] =
      "float " +
      arduinoGenerator.nameDB_.getName(variables[i], Blockly.VARIABLE_CATEGORY_NAME);
  }

  let code =
    "float " + funcName + "(" + args.join(", ") + ") {\n" + branch + returnValue + "}";
  code = arduinoGenerator.scrub_(block, code);
  arduinoGenerator.definitions_["%" + funcName] = code;
  return null;
};

arduinoGenerator.forBlock["procedures_callnoreturn"] = function (block) {
  const funcName = arduinoGenerator.nameDB_.getName(
    block.getFieldValue("NAME"),
    Blockly.PROCEDURE_CATEGORY_NAME,
  );
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] =
      arduinoGenerator.valueToCode(block, "ARG" + i, arduinoGenerator.ORDER_NONE) || "0";
  }
  return funcName + "(" + args.join(", ") + ");\n";
};

arduinoGenerator.forBlock["procedures_callreturn"] = function (block) {
  const funcName = arduinoGenerator.nameDB_.getName(
    block.getFieldValue("NAME"),
    Blockly.PROCEDURE_CATEGORY_NAME,
  );
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] =
      arduinoGenerator.valueToCode(block, "ARG" + i, arduinoGenerator.ORDER_NONE) || "0";
  }
  return [funcName + "(" + args.join(", ") + ")", arduinoGenerator.ORDER_ATOMIC];
};