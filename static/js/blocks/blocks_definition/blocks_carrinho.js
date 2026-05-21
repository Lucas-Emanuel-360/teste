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
  },
  // ==========================================================
  // BLOCOS ESPECÍFICOS: SHIELD CDR CAR (1 Pino Digital + 1 PWM)
  // ==========================================================

  // Bloco 1: SETUP (Configurar Pinos do CDR CAR)
  {
    "type": "carrinho_cdr_setup",
    "message0": "🏎️ Configurar CDR CAR %1 Motor Esq. ➔ Vel(PWM) %2 Dir(Digital) %3 Motor Dir. ➔ Vel(PWM) %4 Dir(Digital) %5",
    "args0": [
      { "type": "input_dummy" },
      { "type": "input_value", "name": "ESQ_VEL", "check": "Number" },
      { "type": "input_value", "name": "ESQ_DIR", "check": "Number" },
      { "type": "input_value", "name": "DIR_VEL", "check": "Number" },
      { "type": "input_value", "name": "DIR_DIR", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#D35400", // Cor um pouco mais escura para diferenciar
    "tooltip": "Define as portas do Shield do CDR CAR. Use pinos PWM (~)."
  },

  // Bloco 2: Mover para Frente CDR CAR
  {
    "type": "carrinho_cdr_frente",
    "message0": "⬆️ Mover CDR CAR para frente",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#D35400",
    "tooltip": "Faz o CDR CAR andar para frente."
  },

// Bloco 3: Virar para Direita CDR CAR (Curva Pivô)
  {
    "type": "carrinho_cdr_direita",
    "message0": "➡️ Virar CDR CAR para direita",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#D35400",
    "tooltip": "Faz uma curva pivô para a direita, parando a roda direita e avançando a esquerda."
  },

  // Bloco 4: Virar para Esquerda CDR CAR (Curva Pivô)
  {
    "type": "carrinho_cdr_esquerda",
    "message0": "⬅️ Virar CDR CAR para esquerda",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#D35400",
    "tooltip": "Faz uma curva pivô para a esquerda, parando a roda esquerda e avançando a direita."
  },
  // Bloco 5: Parar CDR CAR
  {
    "type": "carrinho_cdr_parar",
    "message0": "🛑 Parar CDR CAR",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#D35400",
    "tooltip": "Corta a energia (PWM = 0) dos motores do CDR CAR."
  }
]);