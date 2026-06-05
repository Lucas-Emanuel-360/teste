// ========== BLOCOS DE ENTRADA ==========

Blockly.defineBlocksWithJsonArray([
  {
    "type": "io_digital_read",
    "message0": "ler pino digital %1",
    "args0": [
      { "type": "input_value", "name": "PIN", "check": "Number" }
    ],
    "output": "Number",
    "colour": "#4A90E2",
    "tooltip": "Lê o estado de um pino digital (retorna HIGH ou LOW)"
  },
  {
    "type": "io_analog_read",
    "message0": "ler pino analógico %1",
    "args0": [
      { "type": "input_value", "name": "PIN", "check": "Number" }
    ],
    "output": "Number",
    "colour": "#4A90E2",
    "tooltip": "Lê o valor de um pino analógico (0-1023)"
  },
  {
    "type": "time_millis",
    "message0": "tempo decorrido (ms)",
    "output": "Number",
    "colour": "#5BA55B",
    "tooltip": "Retorna o tempo desde que o Arduino ligou"
  },
  {
    "type": "io_pulsein",
    "message0": "ler pulso no pino %1 estado %2 timeout %3",
    "args0": [
      { "type": "input_value", "name": "PIN", "check": "Number" },
      { "type": "field_dropdown", "name": "STATE", "options": [["ALTO", "HIGH"], ["BAIXO", "LOW"]] },
      { "type": "input_value", "name": "TIMEOUT", "check": "Number" }
    ],
    "output": "Number",
    "colour": "#4A90E2",
    "inputsInline": true,
    "tooltip": "Lê a duração de um pulso (em microssegundos)."
  },
  {
    "type": "io_ultrasonic_read",
    "message0": "ler distância (cm) ultrassônico: Trigger %1 Echo %2",
    "args0": [
      { "type": "input_value", "name": "TRIG", "check": "Number" },
      { "type": "input_value", "name": "ECHO", "check": "Number" }
    ],
    "output": "Number",
    "colour": "#4A90E2",
    "inputsInline": true,
    "tooltip": "Retorna a distância em centímetros lida pelo sensor HC-SR04"
  }
]);

// NOVO BLOCO DINÂMICO BLINDADO: LER PINO DA MONTAGEM FÍSICA
Blockly.Blocks['hardware_pino'] = {
  init: function() {
    var menuGenerator = function() {
      let opcoes = [];
      try {
        let salvos = localStorage.getItem('roboblocks_montagem');
        if (salvos) {
          let arr = JSON.parse(salvos);
          if (arr && arr.length > 0) {
            arr.forEach(comp => {
              if (comp && comp.pinos) {
                comp.pinos.forEach(p => {
                  let label = p.label || 'Pino';
                  let val = p.pino || '0';
                  // Junta o nome que o aluno deu com o nome da porta
                  let nomeBonito = String(comp.nome) + ' (' + String(label) + ')';
                  opcoes.push([nomeBonito, String(val)]);
                });
              }
            });
          }
        }
      } catch (e) {
          console.log("Ainda sem componentes montados.");
      }
      
      // Fallback seguro pro Blockly nunca crachar
      if (opcoes.length === 0) {
        opcoes.push(["⚠️ Nenhuma montagem", "999"]);
      }
      
      return opcoes;
    };

    this.appendDummyInput()
        .appendField("🔌 Componente")
        .appendField(new Blockly.FieldDropdown(menuGenerator), "PINO");
    this.setOutput(true, "Number");
    this.setColour("#A277FF");
    this.setTooltip("Selecione um componente que você nomeou na aba de Montagem Física");
  }
};