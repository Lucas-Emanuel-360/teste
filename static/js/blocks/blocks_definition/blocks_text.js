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
  },

  // ========================================================
  // NOVOS BLOCOS LCD (SIMPLIFICADOS)
  // ========================================================

  // Bloco: Escrever na linha
  {
    "type": "lcd_print_line",
    "message0": "🖥️ Escrever %1 na linha %2",
    "args0": [
      { "type": "input_value", "name": "TEXT" },
      {
        "type": "field_dropdown",
        "name": "LINE",
        "options": [
          ["1", "0"], // Usuário vê 1, código recebe 0 (linha 0 do LCD)
          ["2", "1"]  // Usuário vê 2, código recebe 1 (linha 1 do LCD)
        ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#D81B60", // Cor rosa/magenta
    "inputsInline": true,
    "tooltip": "Escreve um texto no início da linha escolhida do LCD"
  },

  // Bloco: Limpar Display
  {
    "type": "lcd_clear_display",
    "message0": "🖥️ Limpar Display",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#D81B60", // Cor rosa/magenta
    "tooltip": "Apaga todo o conteúdo do display LCD"
  }
]);