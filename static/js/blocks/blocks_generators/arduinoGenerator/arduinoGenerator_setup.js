// Definição do Gerador
const arduinoGenerator = new Blockly.Generator('Arduino');

// Lista de palavras reservadas
arduinoGenerator.addReservedWords(
  'setup,loop,if,else,for,switch,case,while,do,break,continue,return,goto,define,include,HIGH,LOW,INPUT,OUTPUT,INPUT_PULLUP,true,false,integer,constants,floating,point,void,book,boolean,char,class,const,double,enum,explicit,extern,float,friend,inline,int,long,mutable,namespace,new,operator,private,protected,public,register,short,signed,sizeof,static,struct,template,this,throw,try,typedef,union,unsigned,using,virtual,volatile,void'
);

// Ordem de precedência
arduinoGenerator.ORDER_ATOMIC = 0;
arduinoGenerator.ORDER_UNARY_POSTFIX = 1;
arduinoGenerator.ORDER_UNARY_PREFIX = 2;
arduinoGenerator.ORDER_MULTIPLICATION = 3;
arduinoGenerator.ORDER_ADDITION = 4;
arduinoGenerator.ORDER_RELATIONAL = 6;
arduinoGenerator.ORDER_EQUALITY = 7;
arduinoGenerator.ORDER_LOGICAL_AND = 11;
arduinoGenerator.ORDER_LOGICAL_OR = 12;
arduinoGenerator.ORDER_ASSIGNMENT = 14;
arduinoGenerator.ORDER_NONE = 99;

/**
 * Inicializa o gerador.
 */
arduinoGenerator.init = function(workspace) {
  arduinoGenerator.definitions_ = Object.create(null);
  
  // AGORA TEMOS DUAS LISTAS DE SETUP:
  arduinoGenerator.setups_vars_ = Object.create(null); // 1. Inicialização de variáveis (a = 24)
  arduinoGenerator.setups_ = Object.create(null);      // 2. Configurações de hardware (pinMode)

  if (!arduinoGenerator.nameDB_) {
    arduinoGenerator.nameDB_ = new Blockly.Names(arduinoGenerator.RESERVED_WORDS_);
  } else {
    arduinoGenerator.nameDB_.reset();
  }
  arduinoGenerator.nameDB_.setVariableMap(workspace.getVariableMap());
};

/**
 * Finaliza o código, garantindo a ordem correta no setup.
 */
arduinoGenerator.finish = function(code) {
  // 1. Definições Globais (int a;)
  const definitions = [];
  for (const name in arduinoGenerator.definitions_) {
    definitions.push(arduinoGenerator.definitions_[name]);
  }
  const defsCode = definitions.join('\n');

  // 2. Setup de Variáveis (a = 24;) - Roda PRIMEIRO
  const setupsVars = [];
  for (const name in arduinoGenerator.setups_vars_) {
    setupsVars.push(arduinoGenerator.setups_vars_[name]);
  }
  
  // 3. Setup de Hardware (pinMode...) - Roda DEPOIS
  const setupsHW = [];
  for (const name in arduinoGenerator.setups_) {
    setupsHW.push(arduinoGenerator.setups_[name]);
  }

  // Montagem do Código
  let finalCode = '// Código Gerado pelo Robôblocks\n\n';
  
  if (defsCode) finalCode += defsCode + '\n\n';
  
  finalCode += 'void setup() {\n';
  
  // Imprime atribuições de variáveis primeiro
  if (setupsVars.length > 0) {
    finalCode += '  ' + setupsVars.join('\n  ') + '\n';
  }
  
  // Imprime configurações de hardware depois
  if (setupsHW.length > 0) {
    finalCode += '  ' + setupsHW.join('\n  ') + '\n';
  }
  
  finalCode += '}\n\n';
  
  finalCode += 'void loop() {\n';
  finalCode += code;
  finalCode += '}';

  return finalCode;
};

arduinoGenerator.scrub_ = function(block, code, thisOnly) {
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock && !thisOnly) {
    return code + arduinoGenerator.blockToCode(nextBlock);
  }
  return code;
};