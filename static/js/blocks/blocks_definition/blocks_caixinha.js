
// ========== CATEGORIA CAIXINHA (LEDs, Buzzer e Sensores) ==========

// --- GATILHO: Atualizar porta do LED automaticamente ---
if (!Blockly.Extensions.isRegistered('auto_update_porta_led')) {
  Blockly.Extensions.register('auto_update_porta_led', function() {
    this.setOnChange(function(event) {
      if (!this.workspace || this.isInFlyout) return;
      if (event.type === Blockly.Events.BLOCK_CHANGE && event.blockId === this.id) {
        if (event.name === 'LADO' || event.name === 'COR') {
          var lado = this.getFieldValue('LADO');
          var cor = this.getFieldValue('COR');
          var novaPorta = this.getFieldValue('PORTA');
          
          if (lado === 'Direita') {
            if (cor === 'Vermelho') novaPorta = '9';
            else if (cor === 'Amarelo') novaPorta = '10';
            else if (cor === 'Verde') novaPorta = '11';
          } else if (lado === 'Esquerda') {
            if (cor === 'Vermelho') novaPorta = '53';
            else if (cor === 'Amarelo') novaPorta = '51';
            else if (cor === 'Verde') novaPorta = '49';
          }
          
          if (this.getFieldValue('PORTA') !== novaPorta) {
            this.setFieldValue(novaPorta, 'PORTA');
          }
        }
      }
    });
  });
}

// --- GATILHO: Atualizar porta do Botão automaticamente ---
if (!Blockly.Extensions.isRegistered('auto_update_porta_botao')) {
  Blockly.Extensions.register('auto_update_porta_botao', function() {
    this.setOnChange(function(event) {
      if (!this.workspace || this.isInFlyout) return;
      if (event.type === Blockly.Events.BLOCK_CHANGE && event.blockId === this.id) {
        if (event.name === 'NUM_BOTAO') {
          var btn = this.getFieldValue('NUM_BOTAO');
          var novaPorta = this.getFieldValue('PORTA');
          
          if (btn === '1') novaPorta = '15';
          else if (btn === '2') novaPorta = '16';
          else if (btn === '3') novaPorta = '14';
          else if (btn === '4') novaPorta = '17';
          
          if (this.getFieldValue('PORTA') !== novaPorta) {
            this.setFieldValue(novaPorta, 'PORTA');
          }
        }
      }
    });
  });
}

Blockly.defineBlocksWithJsonArray([

  // ========================================================
  // LEDS (Verde Esmeralda #00C060)
  // ========================================================
  {
    "type": "caixinha_led_on",
    "message0": "💡 Acender o LED %1 %2",
    "args0": [
      { "type": "field_dropdown", "name": "LADO", "options": [["Direita", "Direita"], ["Esquerda", "Esquerda"]] },
      { "type": "field_dropdown", "name": "COR", "options": [["🔴 Vermelho", "Vermelho"], ["🟡 Amarelo", "Amarelo"], ["🟢 Verde", "Verde"]] }
    ],
    "message1": "Porta: %1",
    "args1": [
      { "type": "field_dropdown", "name": "PORTA", "options": [
          ["9", "9"], ["10", "10"], ["11", "11"], ["49", "49"], ["51", "51"], ["53", "53"]
        ] 
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#00C060",
    "extensions": ["auto_update_porta_led"], 
    "tooltip": "Acende o LED escolhido"
  },
  {
    "type": "caixinha_led_off",
    "message0": "💡 Apagar o LED %1 %2",
    "args0": [
      { "type": "field_dropdown", "name": "LADO", "options": [["Direita", "Direita"], ["Esquerda", "Esquerda"]] },
      { "type": "field_dropdown", "name": "COR", "options": [["🔴 Vermelho", "Vermelho"], ["🟡 Amarelo", "Amarelo"], ["🟢 Verde", "Verde"]] }
    ],
    "message1": "Porta: %1",
    "args1": [
      { "type": "field_dropdown", "name": "PORTA", "options": [
          ["9", "9"], ["10", "10"], ["11", "11"], ["49", "49"], ["51", "51"], ["53", "53"]
        ] 
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#00C060",
    "extensions": ["auto_update_porta_led"],
    "tooltip": "Apaga o LED escolhido"
  },
  {
    "type": "caixinha_led_blink",
    "message0": "💡 Piscar o LED %1 %2 %3",
    "args0": [
      { "type": "field_dropdown", "name": "LADO", "options": [["Direita", "Direita"], ["Esquerda", "Esquerda"]] },
      { "type": "field_dropdown", "name": "COR", "options": [["🔴 Vermelho", "Vermelho"], ["🟡 Amarelo", "Amarelo"], ["🟢 Verde", "Verde"]] },
      { "type": "field_dropdown", "name": "VELOCIDADE", "options": [["○ Rápido", "150"], ["○ Médio", "500"], ["○ Lento", "1000"]] }
    ],
    "message1": "Porta: %1",
    "args1": [
      { "type": "field_dropdown", "name": "PORTA", "options": [
          ["9", "9"], ["10", "10"], ["11", "11"], ["49", "49"], ["51", "51"], ["53", "53"]
        ] 
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#00C060",
    "extensions": ["auto_update_porta_led"],
    "tooltip": "Pisca o LED na velocidade escolhida"
  },

  // ========================================================
  // SENSORES (Verde Limão #A4C400)
  // ========================================================
  {
    "type": "caixinha_distancia",
    "message0": "📏 Distância %1 que %2 cm",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "OPERADOR",
        "options": [["> maior", ">"], ["< menor", "<"], ["= igual", "=="]]
      },
      {
        "type": "field_number",
        "name": "DISTANCIA",
        "value": 10
      }
    ],
    "output": "Boolean",
    "colour": "#A4C400",
    "tooltip": "Lê o sensor ultrassônico e compara a distância."
  },
  
  {
    "type": "caixinha_botao",
    "message0": "🔘 Botão %1 %2 Porta: %3",
    "args0": [
      { "type": "field_dropdown", "name": "NUM_BOTAO", "options": [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"]] },
      { "type": "field_dropdown", "name": "ESTADO", "options": [["Pressionado", "HIGH"], ["Solto", "LOW"]] },
      { "type": "field_dropdown", "name": "PORTA", "options": [["15", "15"], ["16", "16"], ["14", "14"], ["17", "17"]] }
    ],
    "output": "Boolean",
    "colour": "#A4C400",
    "extensions": ["auto_update_porta_botao"], // Gatilho do botão ativado!
    "tooltip": "Verifica se o botão de toque foi pressionado."
  },
  {
    "type": "caixinha_luz",
    "message0": "💡 Luz %1 Porta: %2",
    "args0": [
      { "type": "field_dropdown", "name": "ESTADO", "options": [["Forte", "< 70"], ["Fraca", "> 90"]] },
      { "type": "field_dropdown", "name": "PORTA", "options": [["A2", "A2"]] }
    ],
    "output": "Boolean",
    "colour": "#A4C400",
    "tooltip": "Verifica a claridade lida pelo sensor de luz LDR."
  },

  // ========================================================
  // BUZZER (Azul #0000CD)
  // ========================================================
  {
    "type": "caixinha_buzzer_nota",
    "message0": "🔊 Tocar nota %1 %2 %3 no Buzzer Porta: %4",
    "args0": [
      { "type": "field_dropdown", "name": "NOTA", "options": [["Dó", "261"], ["Ré", "293"], ["Mi", "329"], ["Fá", "349"], ["Sol", "392"], ["Lá", "440"], ["Si", "493"]] },
      { "type": "field_dropdown", "name": "OITAVA", "options": [["Médio", "1"], ["Grave", "0.5"], ["Agudo", "2"]] },
      { "type": "field_dropdown", "name": "ACIDENTE", "options": [["Natural", "1"]] },
      { "type": "field_dropdown", "name": "PORTA", "options": [["8", "8"]] }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#0000CD",
    "tooltip": "Toca uma nota musical no Buzzer"
  },
  {
    "type": "caixinha_buzzer_silenciar",
    "message0": "🔇 Silenciar Buzzer Porta: %1",
    "args0": [
      { "type": "field_dropdown", "name": "PORTA", "options": [["8", "8"]] }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#0000CD",
    "tooltip": "Para de tocar o Buzzer"
  },
  {
    "type": "caixinha_buzzer_sirene",
    "message0": "🚨 Tocar Sirene %1 no Buzzer Porta: %2",
    "args0": [
      { "type": "field_dropdown", "name": "VELOCIDADE", "options": [["Rápido", "150"], ["Lento", "500"]] },
      { "type": "field_dropdown", "name": "PORTA", "options": [["8", "8"]] }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#0000CD",
    "tooltip": "Toca um som contínuo de sirene"
  }
]);