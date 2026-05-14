// ========== BLOCOS VISUAIS - CARRINHO (PONTE H) ==========

Blockly.defineBlocksWithJsonArray([
  // Bloco 1: SETUP (Configurar Pinos do Carrinho)
  {
    "type": "carrinho_setup",
    "message0": "⚙️ Configurar Motores do Carrinho %1 Motor Esq. ➔ Frente %2 Trás %3 Motor Dir. ➔ Frente %4 Trás %5",
    "args0": [
      { "type": "input_dummy" },
      { "type": "input_value", "name": "ESQ_FRENTE", "check": "Number" },
      { "type": "input_value", "name": "ESQ_TRAS", "check": "Number" },
      { "type": "input_value", "name": "DIR_FRENTE", "check": "Number" },
      { "type": "input_value", "name": "DIR_TRAS", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#E67E22",
    "tooltip": "Use no bloco 'No Início' para definir em quais portas do Arduino a Ponte H está ligada."
  },

  // Bloco 2: Mover para Frente
  {
    "type": "carrinho_frente",
    "message0": "⬆️ Mover carrinho para frente",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#E67E22",
    "tooltip": "Faz os dois motores girarem para frente."
  },

  // Bloco 3: Mover para Trás
  {
    "type": "carrinho_tras",
    "message0": "⬇️ Mover carrinho para trás",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#E67E22",
    "tooltip": "Faz os dois motores girarem para trás."
  },

  // Bloco 4: Virar para Esquerda
  {
    "type": "carrinho_esquerda",
    "message0": "⬅️ Virar carrinho para esquerda",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#E67E22",
    "tooltip": "Gira a roda direita para frente e a esquerda para trás."
  },

  // Bloco 5: Virar para Direita
  {
    "type": "carrinho_direita",
    "message0": "➡️ Virar carrinho para direita",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#E67E22",
    "tooltip": "Gira a roda esquerda para frente e a direita para trás."
  },

  // Bloco 6: Lado Aleatório
  {
    "type": "carrinho_aleatorio",
    "message0": "🔀 Virar carrinho para lado aleatório",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#E67E22",
    "tooltip": "Sorteia se o carrinho vai virar para a direita ou esquerda."
  },

  // Bloco 7: Parar
  {
    "type": "carrinho_parar",
    "message0": "🛑 Parar carrinho",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#E67E22",
    "tooltip": "Freia totalmente os motores."
  },

  // Bloco 8: Finalizar Circuito
  {
    "type": "carrinho_finalizar",
    "message0": "🏁 Finalizar circuito",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#E67E22",
    "tooltip": "Para os motores e encerra o programa (Loop infinito)."
  }
]);