// ========== BLOCOS DE TEXTO (Seu Estilo) ==========

Blockly.defineBlocksWithJsonArray([
  // Texto Simples ("")
  {
    "type": "text",
    "message0": "\"%1\"",
    "args0": [{
      "type": "field_input",
      "name": "TEXT",
      "text": ""
    }],
    "output": "String",
    "colour": "#E67E22", // Laranja para diferenciar
    "tooltip": "Um texto literal"
  },
  
  // Criar Texto (Juntar)
  {
    "type": "text_join",
    "message0": "criar texto com %1 %2",
    "args0": [
      { "type": "input_value", "name": "ADD0" },
      { "type": "input_value", "name": "ADD1" }
    ],
    "output": "String",
    "colour": "#E67E22",
    "inputsInline": true,
    "tooltip": "Junta dois textos ou números"
  },
  
  // Converter para Texto
  {
    "type": "text_string_conv",
    "message0": "converter %1 para texto",
    "args0": [
        { "type": "input_value", "name": "VAR" }
    ],
    "output": "String",
    "colour": "#E67E22",
    "tooltip": "Transforma números em texto (String)"
  }
]);