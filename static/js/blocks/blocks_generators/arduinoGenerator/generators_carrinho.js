// ========== GERADORES DE CÓDIGO - CARRINHO ==========

// Gerador 1: Setup do Carrinho
arduinoGenerator.forBlock['carrinho_setup'] = function(block) {
  // Pega os pinos inseridos pelo aluno (se estiver vazio, usa pinos padrão de segurança)
  const pinoEF = arduinoGenerator.valueToCode(block, 'ESQ_FRENTE', arduinoGenerator.ORDER_ATOMIC) || '10';
  const pinoET = arduinoGenerator.valueToCode(block, 'ESQ_TRAS', arduinoGenerator.ORDER_ATOMIC) || '9';
  const pinoDF = arduinoGenerator.valueToCode(block, 'DIR_FRENTE', arduinoGenerator.ORDER_ATOMIC) || '5';
  const pinoDT = arduinoGenerator.valueToCode(block, 'DIR_TRAS', arduinoGenerator.ORDER_ATOMIC) || '6';

  // Cria as variáveis globais no Arduino para guardar os pinos
  arduinoGenerator.definitions_['var_car_esq_frente'] = `int car_Esq_Frente = ${pinoEF};`;
  arduinoGenerator.definitions_['var_car_esq_tras'] = `int car_Esq_Tras = ${pinoET};`;
  arduinoGenerator.definitions_['var_car_dir_frente'] = `int car_Dir_Frente = ${pinoDF};`;
  arduinoGenerator.definitions_['var_car_dir_tras'] = `int car_Dir_Tras = ${pinoDT};`;

  // Define os pinos como OUTPUT na função void setup()
  arduinoGenerator.setups_['setup_car_esq_frente'] = `pinMode(car_Esq_Frente, OUTPUT);`;
  arduinoGenerator.setups_['setup_car_esq_tras'] = `pinMode(car_Esq_Tras, OUTPUT);`;
  arduinoGenerator.setups_['setup_car_dir_frente'] = `pinMode(car_Dir_Frente, OUTPUT);`;
  arduinoGenerator.setups_['setup_car_dir_tras'] = `pinMode(car_Dir_Tras, OUTPUT);`;

  return ''; // Não retorna código no loop para este bloco
};

// Gerador 2: Frente
arduinoGenerator.forBlock['carrinho_frente'] = function(block) {
  return `digitalWrite(car_Esq_Frente, HIGH);\n` +
         `digitalWrite(car_Esq_Tras, LOW);\n` +
         `digitalWrite(car_Dir_Frente, HIGH);\n` +
         `digitalWrite(car_Dir_Tras, LOW);\n`;
};

// Gerador 3: Trás
arduinoGenerator.forBlock['carrinho_tras'] = function(block) {
  return `digitalWrite(car_Esq_Frente, LOW);\n` +
         `digitalWrite(car_Esq_Tras, HIGH);\n` +
         `digitalWrite(car_Dir_Frente, LOW);\n` +
         `digitalWrite(car_Dir_Tras, HIGH);\n`;
};

// Gerador 4: Esquerda
arduinoGenerator.forBlock['carrinho_esquerda'] = function(block) {
  return `digitalWrite(car_Esq_Frente, LOW);\n` +
         `digitalWrite(car_Esq_Tras, HIGH);\n` +
         `digitalWrite(car_Dir_Frente, HIGH);\n` +
         `digitalWrite(car_Dir_Tras, LOW);\n`;
};

// Gerador 5: Direita
arduinoGenerator.forBlock['carrinho_direita'] = function(block) {
  return `digitalWrite(car_Esq_Frente, HIGH);\n` +
         `digitalWrite(car_Esq_Tras, LOW);\n` +
         `digitalWrite(car_Dir_Frente, LOW);\n` +
         `digitalWrite(car_Dir_Tras, HIGH);\n`;
};

// Gerador 6: Aleatório
arduinoGenerator.forBlock['carrinho_aleatorio'] = function(block) {
  // Inicializa o gerador de números aleatórios na primeira vez que for usado
  arduinoGenerator.setups_['setup_random_seed'] = `randomSeed(analogRead(A0));`;
  
  return `int lado_aleatorio = random(1, 3);\n` +
         `if (lado_aleatorio == 1) {\n` +
         `  // Vira para Direita\n` +
         `  digitalWrite(car_Esq_Frente, HIGH);\n` +
         `  digitalWrite(car_Esq_Tras, LOW);\n` +
         `  digitalWrite(car_Dir_Frente, LOW);\n` +
         `  digitalWrite(car_Dir_Tras, HIGH);\n` +
         `} else {\n` +
         `  // Vira para Esquerda\n` +
         `  digitalWrite(car_Esq_Frente, LOW);\n` +
         `  digitalWrite(car_Esq_Tras, HIGH);\n` +
         `  digitalWrite(car_Dir_Frente, HIGH);\n` +
         `  digitalWrite(car_Dir_Tras, LOW);\n` +
         `}\n`;
};

// Gerador 7: Parar
arduinoGenerator.forBlock['carrinho_parar'] = function(block) {
  // O DB4K original usa HIGH em tudo para causar um "freio de curto" na Ponte H. Mantido fiel.
  return `digitalWrite(car_Esq_Frente, HIGH);\n` +
         `digitalWrite(car_Esq_Tras, HIGH);\n` +
         `digitalWrite(car_Dir_Frente, HIGH);\n` +
         `digitalWrite(car_Dir_Tras, HIGH);\n`;
};

// Gerador 8: Finalizar
arduinoGenerator.forBlock['carrinho_finalizar'] = function(block) {
  return `digitalWrite(car_Esq_Frente, HIGH);\n` +
         `digitalWrite(car_Esq_Tras, HIGH);\n` +
         `digitalWrite(car_Dir_Frente, HIGH);\n` +
         `digitalWrite(car_Dir_Tras, HIGH);\n` +
         `while(true);\n`; // Loop infinito para travar o Arduino
};

// ==========================================================
// GERADORES DE CÓDIGO - SHIELD CDR CAR
// ==========================================================

// Gerador Setup do CDR CAR
arduinoGenerator.forBlock['carrinho_cdr_setup'] = function(block) {
  // Pega os pinos inseridos (com os padrões do CDR CAR como fallback)
  const pinoEV = arduinoGenerator.valueToCode(block, 'ESQ_VEL', arduinoGenerator.ORDER_ATOMIC) || '10';
  const pinoED = arduinoGenerator.valueToCode(block, 'ESQ_DIR', arduinoGenerator.ORDER_ATOMIC) || '12';
  const pinoDV = arduinoGenerator.valueToCode(block, 'DIR_VEL', arduinoGenerator.ORDER_ATOMIC) || '11';
  const pinoDD = arduinoGenerator.valueToCode(block, 'DIR_DIR', arduinoGenerator.ORDER_ATOMIC) || '13';

  // Variáveis Globais
  arduinoGenerator.definitions_['var_cdr_esq_vel'] = `int cdr_Esq_Vel = ${pinoEV};`;
  arduinoGenerator.definitions_['var_cdr_esq_dir'] = `int cdr_Esq_Dir = ${pinoED};`;
  arduinoGenerator.definitions_['var_cdr_dir_vel'] = `int cdr_Dir_Vel = ${pinoDV};`;
  arduinoGenerator.definitions_['var_cdr_dir_dir'] = `int cdr_Dir_Dir = ${pinoDD};`;
  arduinoGenerator.definitions_['var_cdr_velocidade'] = `int cdr_velocidade = 130; // Velocidade ideal para OBR`;

  // Define os pinos como OUTPUT no void setup()
  arduinoGenerator.setups_['setup_cdr_esq_vel'] = `pinMode(cdr_Esq_Vel, OUTPUT);`;
  arduinoGenerator.setups_['setup_cdr_esq_dir'] = `pinMode(cdr_Esq_Dir, OUTPUT);`;
  arduinoGenerator.setups_['setup_cdr_dir_vel'] = `pinMode(cdr_Dir_Vel, OUTPUT);`;
  arduinoGenerator.setups_['setup_cdr_dir_dir'] = `pinMode(cdr_Dir_Dir, OUTPUT);`;

  return '';
};

// Gerador Frente CDR CAR
arduinoGenerator.forBlock['carrinho_cdr_frente'] = function(block) {
  return `digitalWrite(cdr_Esq_Dir, HIGH);\n` +
         `digitalWrite(cdr_Dir_Dir, HIGH);\n` +
         `analogWrite(cdr_Esq_Vel, cdr_velocidade);\n` +
         `analogWrite(cdr_Dir_Vel, cdr_velocidade);\n`;
};

// Gerador Direita CDR CAR (Curva Pivô)
arduinoGenerator.forBlock['carrinho_cdr_direita'] = function(block) {
  return `digitalWrite(cdr_Esq_Dir, HIGH);\n` +
         `digitalWrite(cdr_Dir_Dir, HIGH);\n` + 
         `analogWrite(cdr_Esq_Vel, cdr_velocidade);\n` + 
         `analogWrite(cdr_Dir_Vel, 0);\n`; // Desliga a roda direita para servir de pivô
};

// Gerador Esquerda CDR CAR (Curva Pivô)
arduinoGenerator.forBlock['carrinho_cdr_esquerda'] = function(block) {
  return `digitalWrite(cdr_Esq_Dir, HIGH);\n` +
         `digitalWrite(cdr_Dir_Dir, HIGH);\n` + 
         `analogWrite(cdr_Esq_Vel, 0);\n` + // Desliga a roda esquerda para servir de pivô
         `analogWrite(cdr_Dir_Vel, cdr_velocidade);\n`;
};

// Gerador Parar CDR CAR
arduinoGenerator.forBlock['carrinho_cdr_parar'] = function(block) {
  return `analogWrite(cdr_Esq_Vel, 0);\n` +
         `analogWrite(cdr_Dir_Vel, 0);\n`;
};