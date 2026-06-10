<div align="center">

# 📖 RoboBlocks — Documentação Técnica Completa

**Referência interna para desenvolvimento e manutenção**

![Dev Docs](https://img.shields.io/badge/tipo-documentação_técnica-a277ff?style=flat-square&labelColor=15141b)
![Status](https://img.shields.io/badge/projeto-em_desenvolvimento-ffca85?style=flat-square&labelColor=15141b)
![Cobertura](https://img.shields.io/badge/cobertura-código_fonte_completo-61ffca?style=flat-square&labelColor=15141b)

</div>

---

> **Para quem é esse doc?**  
> Para qualquer desenvolvedor que for mexer no projeto — inclusive você daqui a 3 meses sem lembrar de nada. Aqui está **tudo**: como cada parte funciona por dentro, como alterar, como adicionar, onde estão as armadilhas.

---

## Índice

1. [Arquitetura Geral](#1-arquitetura-geral)
2. [Estrutura de Arquivos](#2-estrutura-de-arquivos)
3. [Sistema de Blocos — Definições](#3-sistema-de-blocos--definições)
4. [Sistema de Blocos — Geradores de Código](#4-sistema-de-blocos--geradores-de-código)
5. [Referência Completa de Blocos](#5-referência-completa-de-blocos)
6. [O Gerador Arduino (arduinoGenerator)](#6-o-gerador-arduino-arduinogenerator)
7. [Interface Principal (main.js)](#7-interface-principal-mainjs)
8. [Sistema de Temas](#8-sistema-de-temas)
9. [Monaco Editor e Live Code](#9-monaco-editor-e-live-code)
10. [Persistência e Autosave](#10-persistência-e-autosave)
11. [O Conector Local (agent.js)](#11-o-conector-local-agentjs)
12. [Monitor Serial](#12-monitor-serial)
13. [Painel de Montagem de Hardware](#13-painel-de-montagem-de-hardware)
14. [Sistema de Plataformas](#14-sistema-de-plataformas)
15. [Responsividade](#15-responsividade)
16. [Como Adicionar um Novo Bloco — Passo a Passo](#16-como-adicionar-um-novo-bloco--passo-a-passo)
17. [Armadilhas e Bugs Conhecidos](#17-armadilhas-e-bugs-conhecidos)

---

## 1. Arquitetura Geral

O RoboBlocks tem duas partes que rodam separadas e se comunicam via HTTP:

```
┌─────────────────────────────────────────────────────────┐
│                  NAVEGADOR (Chrome/Edge)                  │
│                                                           │
│  ┌──────────────┐    ┌─────────────────┐                 │
│  │   Blockly    │───►│ arduinoGenerator│                 │
│  │  Workspace   │    │   (código C++)  │                 │
│  └──────────────┘    └────────┬────────┘                 │
│                               │                           │
│                    ┌──────────▼────────┐                 │
│                    │  Monaco Editor    │                 │
│                    │  (Live Code)      │                 │
│                    └──────────┬────────┘                 │
│                               │ fetch() POST              │
└───────────────────────────────┼─────────────────────────┘
                                │ HTTP localhost:3000
┌───────────────────────────────▼─────────────────────────┐
│              CONECTOR LOCAL (agent.js — Node.js)         │
│                                                           │
│   /verify ──► arduino-cli compile --fqbn ...             │
│   /upload ──► arduino-cli compile --upload -p COM... │
└─────────────────────────────────────────────────────────┘
                                │ USB
                         ┌──────▼──────┐
                         │   Arduino   │
                         └─────────────┘
```

**Ponto-chave:** a IDE é HTML estático puro — não tem servidor web, não tem backend, não tem banco de dados. Tudo que é "salvo" fica em `localStorage`. O único processo externo é o Conector, e ele é opcional (sem ele, dá pra editar blocos mas não compilar/enviar).

---

## 2. Estrutura de Arquivos

```
projeto/
│
├── interface/
│   ├── index.html                  ← Ponto de entrada. Abrir direto no browser.
│   └── stylesheet.css              ← Todos os estilos + variáveis de tema
│
├── src/
│   └── img/
│       ├── Logo.svg                ← Logo do projeto
│       ├── Uno.svg                 ← SVG da placa Arduino Uno (injetado via JS)
│       ├── Mega.svg                ← SVG da placa Arduino Mega
│       ├── Mega.txt / Uno.txt      ← Cópias backup dos SVGs em .txt
│       ├── Caixinha.png            ← Imagem do kit educacional (PNG estático)
│       ├── Arduino-Fixed.svg       ← Variante de SVG da placa
│       └── componentes/
│           └── led.svg             ← SVG do LED para o painel de montagem
│
└── static/
    └── js/
        ├── main.js                 ← Coração da IDE (~1000 linhas)
        ├── hardware_assembly.js    ← Lógica do painel de montagem física
        ├── virtualBoards.js        ← Carregamento dinâmico dos SVGs das placas
        ├── agent.js                ← Servidor do Conector (roda separado com Node)
        ├── package.json            ← Deps do Conector (express, cors, etc.)
        │
        └── blocks/
            ├── blocks_definition/  ← O que o bloco parece (visual + campos)
            │   ├── blocks_caixinha.js
            │   ├── blocks_carrinho.js
            │   ├── blocks_controls.js
            │   ├── blocks_entrada.js
            │   ├── blocks_logic.js
            │   ├── blocks_math.js
            │   ├── blocks_saida.js
            │   ├── blocks_sensores.js
            │   ├── blocks_servo.js
            │   ├── blocks_text.js
            │   └── blocks_variables.js
            │
            └── blocks_generators/
                └── arduinoGenerator/  ← O que o bloco gera em C++
                    ├── arduinoGenerator_setup.js  ← Setup do gerador
                    ├── generators_caixinha.js
                    ├── generators_carrinho.js
                    ├── generators_controls.js
                    ├── generators_entrada.js
                    ├── generators_logic.js
                    ├── generators_math.js
                    ├── generators_saida.js
                    ├── generators_sensores.js
                    ├── generators_servo.js
                    ├── generators_text.js
                    └── generators_variables.js
```

> **Regra de ouro:** para cada bloco, existem **dois** arquivos correspondentes — um em `blocks_definition/` (visual) e um em `blocks_generators/` (código C++). Sempre os dois.

---

## 3. Sistema de Blocos — Definições

Cada arquivo em `blocks_definition/` define o aspecto visual dos blocos daquela categoria usando `Blockly.defineBlocksWithJsonArray([...])`.

### Anatomia de uma definição

```javascript
Blockly.defineBlocksWithJsonArray([
  {
    "type": "nome_unico_do_bloco",   // ID interno — deve ser único em todo o projeto
    "message0": "texto %1 mais %2",  // Texto do bloco. %1, %2... são slots de campos/inputs
    "args0": [
      // Para cada %N, um campo correspondente em args0
      { "type": "input_value", "name": "PARAM_A", "check": "Number" },
      { "type": "field_dropdown", "name": "MODO", "options": [["opção", "VALOR"]] }
    ],
    "previousStatement": null,       // null = aceita bloco anterior conectado
    "nextStatement": null,           // null = aceita bloco seguinte conectado
    "output": "Number",              // se tem output, NÃO usa previousStatement/nextStatement
    "colour": "#a277ff",             // cor hex do bloco
    "inputsInline": true,            // campos na mesma linha (false = em linhas separadas)
    "tooltip": "Descrição curta."
  }
]);
```

### Tipos de `args0` mais usados

| Tipo | O que é | Parâmetros relevantes |
|---|---|---|
| `input_value` | Encaixe para outro bloco | `name`, `check` (tipo aceito: `"Number"`, `"Boolean"`, `"String"` ou omitir para qualquer) |
| `input_statement` | Slot para blocos empilhados dentro | `name` |
| `input_dummy` | Quebra de linha sem slot | — |
| `field_dropdown` | Dropdown de opções fixas | `name`, `options: [["Label", "VALOR"]]` |
| `field_number` | Campo numérico editável | `name`, `value` (valor padrão) |
| `field_input` | Campo de texto editável | `name`, `text` (texto padrão) |
| `field_variable` | Seletor de variável | `name`, `variable` (nome padrão) |
| `field_image` | Ícone decorativo | `src`, `width`, `height`, `alt`, `name` |

### Blocos com lógica própria (não JSON)

Dois blocos usam a API imperativa em vez do JSON — são casos especiais:

**`roboblocks_start`** (em `main.js`): O bloco principal "Iniciar". Tem 3 seções (linha do título, Setup e Loop). Usa `Blockly.defineBlocksWithJsonArray` com mensagens múltiplas (`message0`, `message1`, `message2`) e um botão `[+]` para criar variáveis via extensão registrada.

```javascript
// A extensão que faz o botão + funcionar
Blockly.Extensions.register("add_var_button", function () {
  this.getField("ADD_VAR").clickHandler_ = () => {
    Blockly.Variables.createVariableButtonHandler(this.workspace, null, "");
  };
});
```

**`hardware_pino`** (em `blocks_entrada.js`): Bloco dinâmico que lê a montagem de hardware salva no `localStorage` e popula um dropdown com os componentes e pinos que o usuário conectou. Usa a API imperativa `Blockly.Blocks['hardware_pino'] = { init: function() {...} }` porque o dropdown precisa ser gerado em tempo de execução.

```javascript
// O gerador de opções é uma função, não um array estático
var menuGenerator = function() {
  let opcoes = [];
  let salvos = localStorage.getItem('roboblocks_montagem');
  // ... parseia e retorna as opções com base na montagem atual
  return opcoes; // Fallback: [["⚠️ Nenhuma montagem", "999"]]
};
```

---

## 4. Sistema de Blocos — Geradores de Código

Cada arquivo em `blocks_generators/arduinoGenerator/` registra funções que convertem um bloco em string C++.

### Anatomia de um gerador

**Bloco de declaração** (que não retorna valor, apenas executa):
```javascript
arduinoGenerator.forBlock['nome_do_bloco'] = function(block) {
  // Lê valores de outros blocos conectados
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || '13';
  
  // Lê campos diretos (dropdowns, números, textos)
  const mode = block.getFieldValue('MODO');
  
  // Injeta #include, variáveis globais ou código no setup() — apenas uma vez
  arduinoGenerator.definitions_['include_algo'] = '#include <Algo.h>';
  arduinoGenerator.setups_['setup_pino_' + pin] = `pinMode(${pin}, OUTPUT);`;
  
  // Retorna a string de código C++ para o loop()
  return `digitalWrite(${pin}, HIGH);\n`;
};
```

**Bloco de expressão** (que retorna um valor para encaixar em outro bloco):
```javascript
arduinoGenerator.forBlock['nome_do_bloco'] = function(block) {
  const pin = arduinoGenerator.valueToCode(block, 'PIN', arduinoGenerator.ORDER_ATOMIC) || 'A0';
  
  // Retorna ARRAY: [string de código, nível de precedência]
  return [`analogRead(${pin})`, arduinoGenerator.ORDER_ATOMIC];
};
```

### As três "sacolas" do gerador

O gerador tem três objetos onde você pode depositar código que precisa aparecer fora do `loop()`:

| Sacola | Como usar | Onde aparece no código final |
|---|---|---|
| `arduinoGenerator.definitions_['chave']` | `'#include <Lib.h>'` ou declaração de variável/função global | Antes do `void setup()` |
| `arduinoGenerator.setups_vars_['chave']` | Inicialização de variável (`varName = 0;`) | Dentro do `setup()`, primeiro |
| `arduinoGenerator.setups_['chave']` | Configuração de hardware (`pinMode(...)`) | Dentro do `setup()`, depois das vars |

**Chave única:** a chave do objeto é usada para **deduplicar**. Se dois blocos diferentes tentarem inserir o mesmo include, só entra uma vez. Use nomes descritivos e únicos por pino quando necessário (ex: `'setup_output_13'`).

### Ordem de precedência

Definidas em `arduinoGenerator_setup.js`. Usadas no segundo argumento de `valueToCode` para garantir que parênteses sejam inseridos corretamente quando necessário:

```javascript
arduinoGenerator.ORDER_ATOMIC        = 0;   // literais, chamadas de função
arduinoGenerator.ORDER_UNARY_PREFIX  = 2;   // !x, -x
arduinoGenerator.ORDER_MULTIPLICATION = 3;
arduinoGenerator.ORDER_DIVISION      = 3;
arduinoGenerator.ORDER_ADDITION      = 4;
arduinoGenerator.ORDER_SUBTRACTION   = 4;
arduinoGenerator.ORDER_RELATIONAL    = 6;   // <, >, <=, >=
arduinoGenerator.ORDER_EQUALITY      = 7;   // ==, !=
arduinoGenerator.ORDER_LOGICAL_AND   = 11;  // &&
arduinoGenerator.ORDER_LOGICAL_OR    = 12;  // ||
arduinoGenerator.ORDER_ASSIGNMENT    = 14;  // =
arduinoGenerator.ORDER_NONE          = 99;  // sem precedência definida
```

---

## 5. Referência Completa de Blocos

### 🔴 Controles (`blocks_controls.js` / `generators_controls.js`)

| `type` | Visual | Código gerado | Observações |
|---|---|---|---|
| `controls_delay` | `esperar [N] [segundos/ms]` | `delay(N);` ou `delay(N*1000);` | Dropdown: `SECONDS` multiplica por 1000 |
| `controls_stop` | `parar programa` | `while(true) { }` | Trava o Arduino em loop infinito |
| `controls_if_simple` | `se [cond] então` | `if (cond) { }` | — |
| `controls_if_else` | `se [cond] então / senão` | `if (cond) { } else { }` | — |
| `controls_while` | `enquanto [cond]` | `while (cond) { }` | — |
| `controls_repeat` | `repetir [N] vezes` | `for (int i = 0; i < N; i++) { }` | Cria variável de loop via `getDistinctName` |
| `controls_flow_statements` | `interromper laço (break)` | `break;` | Sempre emite `break` — sem campo `FLOW` |

---

### 🟣 Lógica (`blocks_logic.js` / `generators_logic.js`)

| `type` | Visual | Código gerado |
|---|---|---|
| `logic_boolean` | `verdadeiro / falso` | `true` ou `false` |
| `logic_compare` | `[A] [=,≠,<,≤,>,≥] [B]` | `A == B`, `A != B`, etc. |
| `logic_operation` | `[A] [e/ou] [B]` | `A && B` ou `A \|\| B` |
| `logic_negate` | `não [bool]` | `!bool` |

---

### 🟢 Matemática (`blocks_math.js` / `generators_math.js`)

| `type` | Visual | Código gerado | Observações |
|---|---|---|---|
| `math_number` | `[0]` | valor literal | Campo `NUM` |
| `math_arithmetic` | `[A] [+,-,×,÷,^] [B]` | `A + B`, ..., `pow(A, B)` | `^` vira `pow()` |
| `math_single` | `[func] de [N]` | `sqrt()`, `abs()`, `round()`, `ceil()`, `floor()`, `-N` | Opção `NEG` retorna com prefixo `-` |
| `math_random` | `aleatório entre [A] e [B]` | `random(A, B)` | — |
| `math_map` | `mapear [V] de [a,b] para [c,d]` | `map(V, a, b, c, d)` | Função nativa do Arduino |
| `math_constrain` | `restringir [V] entre [A] e [B]` | `constrain(V, A, B)` | Limita o valor a um intervalo |

---

### 🟠 Texto (`blocks_text.js` / `generators_text.js`)

| `type` | Visual | Código gerado | Observações |
|---|---|---|---|
| `text` | `"[texto]"` | string literal com aspas | Campo `TEXT` |
| `text_join` | `criar texto com [A] [B]` | `String(A) + String(B)` | Concatenação via `String()` |
| `text_string_conv` | `converter [V] para texto` | `String(V)` | Converte número em String |
| `lcd_print_line` | `🖥️ Escrever [T] na linha [1/2]` | `lcd_.setCursor(0, N); lcd_.print(T);` | Injeta `#include <LiquidCrystal.h>` e objeto `LiquidCrystal lcd_(31,33,35,30,32,34,36)` automaticamente via `_lcdEnsureSetup()`. Pinos hardcoded para a Caixinha. |
| `lcd_clear_display` | `🖥️ Limpar Display` | `lcd_.clear();` | Também chama `_lcdEnsureSetup()` |

> ⚠️ **Atenção LCD:** os pinos do objeto `LiquidCrystal` (31, 33, 35, 30, 32, 34, 36) estão hardcoded em `generators_text.js` para o kit Caixinha. Se for usar LCD em outro hardware, precisa alterar ali.

---

### 🩷 Variáveis (`blocks_variables.js` / `generators_variables.js`)

| `type` | Visual | Código gerado | Observações |
|---|---|---|---|
| `variables_set` | `definir [var] como [valor]` | Declaração global + `var = valor;` | Detecta tipo automaticamente: `String` se começa com aspas, `float` se tem ponto decimal ou funções trigonométricas, `int` nos outros casos |
| `variables_get` | `[var]` | nome da variável | — |
| `variables_change` | `alterar [var] por [delta]` | `var += delta;` | Cria declaração `int var;` se ainda não existir |

**Detalhe importante do `variables_set`:** se o valor for um número puro (ex: `42`), ele também inicializa a variável no `setup()` via `setups_vars_` para evitar lixo de memória. Se for uma expressão complexa (ex: `analogRead(A0)`), deixa apenas no `loop()`.

---

### 🔵 Entrada (`blocks_entrada.js` / `generators_entrada.js`)

| `type` | Visual | Código gerado | Observações |
|---|---|---|---|
| `io_digital_read` | `ler pino digital [N]` | `digitalRead(N)` | Injeta `pinMode(N, INPUT)` no setup |
| `io_analog_read` | `ler pino analógico [N]` | `analogRead(N)` | Sem pinMode (pinos analógicos não precisam) |
| `time_millis` | `tempo decorrido (ms)` | `millis()` | — |
| `io_pulsein` | `ler pulso pino [N] estado [H/L] timeout [T]` | `pulseIn(N, HIGH, T)` | Injeta `pinMode(N, INPUT)` no setup |
| `io_ultrasonic_read` | `ler distância (cm) ultrassônico: Trigger [T] Echo [E]` | `lerDistanciaUltrassonico(T, E)` | Injeta função auxiliar `lerDistanciaUltrassonico()` nas definitions |
| `hardware_pino` | `🔌 Componente [dropdown]` | número do pino escolhido | Dropdown populado dinamicamente do `localStorage` da montagem |

---

### 🔵 Saída (`blocks_saida.js` / `generators_saida.js`)

| `type` | Visual | Código gerado | Observações |
|---|---|---|---|
| `io_digital_write` | `pino digital [N] estado [S]` | `digitalWrite(N, S);` | Injeta `pinMode(N, OUTPUT)` no setup |
| `io_analog_write` | `pino PWM [N] valor [V]` | `analogWrite(N, V);` | Injeta `pinMode(N, OUTPUT)` no setup. Apenas pinos PWM (~3,5,6,9,10,11 no Uno) |
| `io_pin_mode` | `configurar pino [N] como [modo]` | injeta `pinMode(N, modo)` no setup | Não gera código no loop — só setup |
| `io_serial_print` | `imprimir no serial [texto]` | `Serial.println(texto);` | Injeta `Serial.begin(DB4K_velocidade_serial)` no setup. `DB4K_velocidade_serial` é uma variável global ainda indefinida no código — ver [Armadilhas](#17-armadilhas-e-bugs-conhecidos) |
| `io_tone` | `tocar nota pino [N] freq [F] Hz tempo [D] ms` | `tone(N, F, D);` | Injeta `pinMode(N, OUTPUT)` no setup |
| `io_notone` | `parar som pino [N]` | `noTone(N);` | — |
| `io_high` | `ALTO` | `HIGH` | Constante |
| `io_low` | `BAIXO` | `LOW` | Constante |

---

### 🟡 Sensores (`blocks_sensores.js` / `generators_sensores.js`)

Blocos de alto nível que encapsulam leituras analógicas com faixas pré-definidas. Todos retornam `Boolean`.

| `type` | Visual | Código gerado | Limites / Observações |
|---|---|---|---|
| `sensor_luz_simples` | `💡 Luz [Forte/Ambiente/Fraca] no pino analógico [N]` | expressão booleana com `analogRead(N)` | Forte: `> 700`, Ambiente: `> 300 && <= 700`, Fraca: `<= 300` — valores 0-1023 |
| `sensor_linha_simples` | `👁️ Reflexo [Muito/Médio/Pouco] no pino analógico [N]` | expressão booleana com `analogRead(N)` | Muito (branco): `< 300`, Médio: `300-700`, Pouco (preto): `> 700` |
| `sensor_distancia_simples` | `distância [>/</=] [N] cm ultrassônico: Trigger [T] Echo [E]` | `(lerDistanciaUltrassonico(T, E) OP N)` | Injeta função `lerDistanciaUltrassonico()` nas definitions |
| `sensor_potenciometro_simples` | `potenciômetro [Alto/Médio/Baixo] no pino [N]` | expressão booleana com `analogRead(N)` | Alto: `> 682`, Médio: `341-682`, Baixo: `< 341` |
| `sensor_botao_simples` | `botão [Pressionado/Solto] no pino [N]` | `digitalRead(N) == LOW/HIGH` | Usa `INPUT_PULLUP` — pressionado = LOW |

---

### ⚙️ Servo (`blocks_servo.js` / `generators_servo.js`)

| `type` | Visual | Código gerado | Observações |
|---|---|---|---|
| `servo_write` | `girar servo no pino [N] para [A] graus` | `servo_N.write(A);` | Injeta `#include <Servo.h>`, objeto `Servo servo_N;` e `servo_N.attach(N);` no setup. Nome do objeto baseado no pino (ex: pino 9 → `servo_9`) |
| `servo_read` | `ler ângulo do servo no pino [N]` | `servo_N.read()` | Mesmo processo de inject. Retorna a última posição definida |

---

### 📦 Caixinha (`blocks_caixinha.js` / `generators_caixinha.js`)

Blocos específicos para o kit educacional do IFNMG. Os pinos são mapeados automaticamente.

**LEDs:**

| `type` | Visual | Pinos usados | Observações |
|---|---|---|---|
| `caixinha_led_on` | `ligar LED [Esq/Dir] [Vermelho/Amarelo/Verde]` | Depende da combinação | Extensão `auto_update_porta_led` atualiza o campo `PORTA` automaticamente ao mudar Lado/Cor |
| `caixinha_led_off` | `desligar LED [Esq/Dir] [Vermelho/Amarelo/Verde]` | idem | idem |
| `caixinha_led_blink` | `piscar LED [Esq/Dir] [Cor] velocidade [ms]` | idem | Gera HIGH → delay → LOW → delay |

**Mapeamento de pinos dos LEDs:**

| Lado | Vermelho | Amarelo | Verde |
|---|---|---|---|
| Direita | 9 | 10 | 11 |
| Esquerda | 53 | 51 | 49 |

**Sensores da Caixinha:**

| `type` | Visual | Código gerado | Observações |
|---|---|---|---|
| `caixinha_distancia` | `distância [>/</=] [N] cm` | `lerDistancia() OP N` | Trig=6, Echo=7 fixos. Injeta função `lerDistancia()` nas definitions |
| `caixinha_botao` | `botão [1/2/3/4] [Pressionado/Solto]` | `digitalRead(PORTA) == ESTADO` | Mapeamento: Btn1→15, Btn2→16, Btn3→14, Btn4→17. Extensão `auto_update_porta_botao` atualiza o pino automaticamente |
| `caixinha_luz` | `luminosidade [Claro/Escuro]` | `analogRead(PORTA) OP valor` | Claro: `> 90`, Escuro: `< 70` |

**Buzzer da Caixinha:**

| `type` | Visual | Código gerado |
|---|---|---|
| `caixinha_buzzer_nota` | `tocar nota [dó/ré/...] oitava [N]` | `tone(PORTA, freq);` onde freq = nota × oitava |
| `caixinha_buzzer_silenciar` | `silenciar buzzer` | `noTone(PORTA);` |
| `caixinha_buzzer_sirene` | `sirene velocidade [ms]` | alternância entre `tone(800)` e `tone(500)` com delay |

---

### 🚗 Carrinho (`blocks_carrinho.js` / `generators_carrinho.js`)

Blocos para controle de robô com ponte H (2 motores DC).

| `type` | Visual | Código gerado | Observações |
|---|---|---|---|
| `carrinho_setup` | `⚙️ Configurar Motores — Esq.Frente/Trás e Dir.Frente/Trás` | Declara 4 variáveis globais `car_Esq_Frente`, etc. + `pinMode` no setup | Deve ficar no bloco Setup do Iniciar |
| `carrinho_frente` | `⬆️ Mover para frente` | HIGH+LOW nos 4 pinos corretos | — |
| `carrinho_tras` | `⬇️ Mover para trás` | LOW+HIGH nos 4 pinos corretos | — |
| `carrinho_esquerda` | `↩️ Virar esquerda` | Motor esq. para trás, dir. para frente | — |
| `carrinho_direita` | `↪️ Virar direita` | Motor esq. para frente, dir. para trás | — |
| `carrinho_aleatorio` | `🎲 Virar aleatório` | `random(1,3)` + if/else para direita ou esquerda | Injeta `randomSeed(analogRead(A0))` no setup |
| `carrinho_parar` | `⏹️ Parar` | HIGH em todos os pinos (freio de curto da ponte H) | Comportamento intencional herdado do DB4K original |

---

## 6. O Gerador Arduino (`arduinoGenerator`)

Arquivo principal: `arduinoGenerator_setup.js`

### Ciclo de vida de uma geração

Quando `arduinoGenerator.workspaceToCode(workspace)` é chamado:

1. `init(workspace)` — reseta os três objetos de acumulação (`definitions_`, `setups_vars_`, `setups_`) e o banco de nomes
2. Para cada bloco no workspace, a função registrada em `forBlock[tipo]` é chamada
3. `finish(code)` — monta o código final na ordem correta:

```
// Código Gerado pelo Robôblocks

[definitions_ — includes e variáveis globais]

void setup() {
  [setups_vars_ — inicializações de variáveis]
  [setups_ — configurações de hardware (pinMode, Serial.begin...)]
}

void loop() {
  [código retornado pelos blocos]
}
```

### Funções auxiliares importantes

**`arduinoGenerator.valueToCode(block, inputName, order)`**  
Lê o valor de um input de bloco (encaixe que recebe outro bloco). Retorna a string de código do bloco conectado, ou string vazia se nada estiver conectado. O terceiro argumento controla se parênteses serão adicionados baseado na precedência.

**`arduinoGenerator.statementToCode(block, inputName)`**  
Lê blocos empilhados dentro de um input de declaração (como os blocos dentro de um `if`). Retorna o código concatenado de todos os blocos da pilha.

**`arduinoGenerator.nameDB_.getName(fieldValue, category)`**  
Converte o nome de uma variável de "nome do usuário" para um identificador C++ válido, evitando palavras reservadas. Sempre use isso ao ler `field_variable`.

---

## 7. Interface Principal (`main.js`)

Este arquivo controla toda a lógica da IDE. Está organizado em seções comentadas:

### Inicialização do workspace

```javascript
const workspace = Blockly.inject("blocklyArea", {
  toolbox: document.getElementById("toolbox"),
  // ... opções de zoom, grid, scroll
});
```

O `blocklyArea` é uma `div` no `index.html`. A Toolbox é um elemento XML também no `index.html` com todas as categorias e blocos disponíveis.

**DEFAULT_XML:** o estado inicial do workspace — apenas o bloco "Iniciar" posicionado.

```javascript
const DEFAULT_XML = `<xml><block type="roboblocks_start" x="100" y="50" deletable="false"></block></xml>`;
```

O atributo `deletable="false"` impede o usuário de apagar o bloco principal.

### Change Listener

```javascript
workspace.addChangeListener((e) => {
  if (e.type === Blockly.Events.UI) return; // ignora eventos só de UI (scroll, zoom)
  checkEmptyState();
  currentCode = arduinoGenerator.workspaceToCode(workspace); // regera C++
  monacoLiveEditor?.setValue(currentCode);                   // atualiza Monaco
  localStorage.setItem("roboblocks_autosave", Blockly.Xml.domToText(...)); // autosave
});
```

Todo evento de mudança nos blocos dispara isso. É aqui que o código C++ é regenerado em tempo real.

### Variável global `config`

```javascript
let config = JSON.parse(localStorage.getItem("mymaker_config")) || {
  arduinoPath: "arduino-cli.exe",
  agentUrl: "http://localhost:3000",
};
```

Persistida em `localStorage` com a chave `"mymaker_config"`. Editável pelo modal de configurações (botão ⚙️).

### Sistema de modais

`toggleModal(modalId, show)` — abre/fecha qualquer modal pelo ID. Modais existentes:

| ID | Conteúdo |
|---|---|
| `themeModal` | Seletor de tema |
| `configModal` | Configurações (URL do agente, path do arduino-cli) |
| `errorModal` | Log de erros de compilação com destaque de linha |
| `codeModal` | Código C++ completo para copiar / baixar .ino |

### `showToast(message, type)`

Notificação flutuante no canto da tela. `type` aceita `"success"` (padrão) ou `"error"`.

### `getFinalCode()`

Retorna o código a ser enviado para compilação — prioriza o código do Monaco se o modo de edição manual (`isManualEdit`) estiver ativo, caso contrário usa `currentCode` (gerado pelos blocos).

### `highlightErrors(logOutput)`

Parseia o log de erro do `arduino-cli` para extrair número de linha e destaca essa linha no Monaco Editor com um marcador vermelho.

### Exemplos pré-carregados

Três exemplos em XML embutidos como strings constantes:
- `xmlBlink` — pisca o LED da porta 13
- `xmlServo` — servo oscilando 0°–180°
- `xmlPot` — lê potenciômetro e imprime no serial

Carregados pelo `loadExample(xml)` que pede confirmação antes de limpar o workspace.

---

## 8. Sistema de Temas

### Como funciona

Quatro temas definidos em `themeConfigs` em `main.js`:

```javascript
const themeConfigs = {
  aura:   { name: "aura",   workspaceColor: "#1e1e1e", toolboxColor: "#252526" },
  light:  { name: "light",  workspaceColor: "#f2f2f5", toolboxColor: "#ffffff" },
  void:   { name: "void",   workspaceColor: "#000000", toolboxColor: "#050505" },
  coffee: { name: "coffee", workspaceColor: "#2b211e", toolboxColor: "#3a2c28" },
};
```

`setTheme(themeName)` faz três coisas em sequência:
1. Adiciona classe CSS `theme-[nome]` no `<body>` (controla toda a UI via variáveis CSS)
2. Cria e aplica um tema Blockly via `Blockly.Theme.defineTheme()` (controla workspace e toolbox)
3. Aplica o tema correspondente no Monaco Editor via `monaco.editor.setTheme()`

### Variáveis CSS de tema

Todas as cores da UI são variáveis CSS definidas no `stylesheet.css` por tema. Para alterar uma cor, edite a variável correspondente no bloco `.theme-[nome]`:

```css
.theme-aura {
  --primary: #a277ff;     /* roxo principal */
  --secondary: #61ffca;   /* verde neon */
  --accent: #ffca85;      /* amarelo */
  --bg-main: #15141b;     /* fundo principal */
  --bg-surface: #1e1c2e;  /* superfície de cards/painéis */
  --text-main: #edecee;   /* texto principal */
  --text-muted: #6e6a86;  /* texto secundário */
  --danger: #ff6767;      /* vermelho de erro */
  /* ... */
}
```

### Como adicionar um novo tema

1. Adicionar entrada em `themeConfigs` em `main.js`
2. Criar bloco `.theme-[nome]` com as variáveis CSS em `stylesheet.css`
3. Adicionar `if (config.name === "nome") monaco.editor.setTheme("nome-theme");` nos dois lugares relevantes em `setTheme()`
4. Definir o tema Monaco com `monaco.editor.defineTheme("nome-theme", {...})` dentro do `initMonaco()`
5. Adicionar opção no modal de temas no `index.html`

---

## 9. Monaco Editor e Live Code

O Monaco é carregado de CDN (`cdnjs.cloudflare.com`) via `require.config` / AMD loader. Só é inicializado quando o painel Live Code é aberto pela primeira vez.

### Variáveis de controle

```javascript
let monacoLiveEditor = null; // instância do editor — null até o primeiro open
let isManualEdit = false;    // true quando o usuário digitou manualmente
let isSystemUpdate = false;  // flag para evitar loop: update do sistema → evento → update...
```

### Fluxo de sincronização blocos ↔ Monaco

- **Blocos → Monaco:** o `changeListener` do workspace chama `monacoLiveEditor.setValue(currentCode)` a cada mudança. `isSystemUpdate = true` antes do setValue evita que o evento `onDidChangeModelContent` do Monaco interprete isso como edição manual.

- **Monaco → blocos:** quando o usuário digita no Monaco, `isManualEdit` vira `true`. A partir daí, o `getFinalCode()` passa a retornar o conteúdo do Monaco em vez do código gerado pelos blocos. Um botão "Sincronizar com Blocos" reseta `isManualEdit` para `false` e restaura o código gerado.

### Temas Monaco

Quatro temas definidos em `initMonaco()`:

```javascript
monaco.editor.defineTheme("aura-theme", {
  base: "vs-dark",
  inherit: true,
  rules: [ /* tokenização customizada */ ],
  colors: { "editor.background": "#1e1c2e", /* ... */ }
});
```

---

## 10. Persistência e Autosave

Tudo é salvo no `localStorage` do navegador. Chaves usadas:

| Chave | Conteúdo | Quando é salvo |
|---|---|---|
| `roboblocks_autosave` | XML do workspace (string) | A cada mudança de bloco (change listener) |
| `roboblocks_theme` | Nome do tema ativo (string) | Ao trocar de tema |
| `roboblocks_plataforma` | Plataforma selecionada (`"uno"`, `"mega"`, `"caixinha"`) | Ao selecionar plataforma |
| `roboblocks_montagem` | JSON com componentes e pinos do painel de montagem | A cada mudança na montagem |
| `mymaker_config` | JSON com `arduinoPath` e `agentUrl` | Ao salvar configurações |

### Restauração na inicialização

Na ordem, ao carregar a página:
1. Restaura tema salvo (ou `"aura"` como padrão)
2. Restaura plataforma salva e inicializa a Toolbox correspondente
3. Restaura autosave XML no workspace (ou carrega `DEFAULT_XML` se não houver)

### Salvar / Abrir projeto

- **Salvar:** serializa o workspace para XML e dispara download de `projeto.xml`
- **Abrir:** lê o arquivo `.xml` ou `.rbb` via `FileReader`, parseia o XML e carrega no workspace via `Blockly.Xml.domToWorkspace`

> ⚠️ `localStorage` tem limite de ~5MB e pode ser limpo pelo navegador (modo privado, limpeza de cache). Para projetos importantes, sempre exportar o `.xml`.

---

## 11. O Conector Local (`agent.js`)

Servidor Express mínimo que faz a ponte entre a IDE no browser e o `arduino-cli` instalado na máquina. Roda separado com `node agent.js`.

### Inicialização

Na primeira execução, tenta instalar o core `arduino:avr` via:

```javascript
exec(`"${cliPath}" core install arduino:avr`, ...)
```

O `arduino-cli.exe` deve estar na mesma pasta que `agent.js` (em `static/js/`).

### Endpoints

**`GET /status`**
```json
{ "status": "online", "engine": "arduino-cli", "version": "2.1.0" }
```

**`POST /verify`**
Payload: `{ code: "string C++", board: "uno|mega|nano", arduinoPath: "opcional" }`

1. Salva o código em `sketch_temp/sketch_temp.ino`
2. Executa `arduino-cli compile --fqbn [FQBN] "sketch_temp/"`
3. Retorna `{ success: true/false, output: "log" }`

**`POST /upload`**
Payload: `{ code, board, port: "COM3", arduinoPath: "opcional" }`

1. Salva o código
2. Executa `arduino-cli compile --upload --fqbn [FQBN] -p COM3 "sketch_temp/"`
3. Retorna `{ success: true/false, output: "log" }`

**Modo simulação:** se `board` ou `port` for `"COM_TESTE"`, pula o arduino-cli e retorna sucesso após delay artificial (1,5s para verify, 3s para upload).

### Mapeamento de placas para FQBN

```javascript
function getFQBN(boardName) {
  if (boardName === 'mega') return 'arduino:avr:mega';
  if (boardName === 'nano') return 'arduino:avr:nano';
  return 'arduino:avr:uno'; // padrão
}
```

### Verificação de status pela IDE

A IDE faz polling a cada **2 segundos** via `setInterval(checkAgentStatus, 2000)` atualizando o ponto de status na barra superior.

---

## 12. Monitor Serial

Usa a **Web Serial API** — disponível apenas em Chrome e Edge. Opera completamente no browser, sem passar pelo Conector.

### Fluxo de conexão

```javascript
currentPort = await navigator.serial.requestPort();     // popup de seleção de porta
await currentPort.open({ baudRate: baudRate });          // abre com baud rate selecionado
// Configura dois TextDecoderStream/TextEncoderStream para leitura e escrita
textEncoder.readable.pipeTo(currentPort.writable);
currentPort.readable.pipeTo(textDecoder.writable);
serialWriter = textEncoder.writable.getWriter();
```

O stream de leitura escreve na div `#serialOutput` linha a linha.

### Funcionalidades

- **Baud rate:** dropdown com opções padrão (9600, 115200, etc.)
- **Auto-scroll:** checkbox, mantém o terminal no final das mensagens
- **Timestamp:** checkbox, prefixo de hora em cada linha recebida
- **Limpar:** botão que zera o `innerHTML` do `#serialOutput`
- **Enviar comando:** input de texto + botão Enviar (ou Enter) que escreve via `serialWriter.write()`

### Atualização de portas disponíveis

`updateComPorts()` consulta `navigator.serial.getPorts()` e popula o dropdown de porta COM. Inclui sempre a opção `COM_TESTE` para simulação. O botão 🔄 dispara essa função manualmente.

---

## 13. Painel de Montagem de Hardware

Arquivo: `hardware_assembly.js`

### O que é

Um canvas interativo que exibe a placa Arduino (SVG) e permite adicionar componentes visuais, conectando os pinos do componente aos pinos da placa com fios desenhados em SVG.

O objetivo principal é **visual e pedagógico** — ajuda o aluno a planejar a montagem antes de fazer na prática. A conexão feita aqui também alimenta o bloco `hardware_pino` na Toolbox.

### Estado e variáveis

```javascript
let componentCounter = 0;    // ID incremental para cada componente adicionado
let plataformaAtual = 'uno'; // lida do localStorage na abertura
let zoomScale = 1;           // zoom atual do canvas
let panX = 0, panY = 0;      // offset de pan do canvas
```

### Fluxo ao adicionar um componente

1. `adicionarComponente(tipo)` é chamado (ex: `tipo = "led"`)
2. Gera HTML de um "component card" com: nome editável, imagem SVG do componente, dropdowns de pinos (um por pin do componente), botão de remover
3. Insere no `#componentsContainer`
4. Chama `carregarSvgComponente()` para buscar `src/img/componentes/led.svg` e injetar inline
5. Chama `salvarHardwareConfig()` para persistir

### Sistema de fios

`atualizarConexoes()` é chamada sempre que um dropdown de pino muda. Ela:
1. Limpa o SVG de fios (`#wire-canvas`)
2. Para cada pino de componente com valor selecionado, encontra o elemento SVG correspondente na placa
3. Chama `desenharFio(dotElement, svgPinElement, corFio, wireCanvas)` que calcula coordenadas e desenha uma linha SVG entre o ponto do componente e o pino na placa

### Zoom e Pan

- **Zoom via scroll:** `wheel` event na `hardwareWorkspace` div
- **Zoom via botões:** `alterarZoomManual(fator)` — fator 1.2 para aumentar, 0.8 para diminuir, limites entre 0.3× e 3×
- **Pan:** arrastar o fundo (não sobre cards ou botões)
- Ambos são aplicados via `transform: translate(panX, panY) scale(zoomScale)` no `#assemblyCanvas`

### Persistência da montagem

`salvarHardwareConfig()` percorre todos os component cards, coleta nome + pinos conectados e salva em `localStorage['roboblocks_montagem']` como JSON:

```json
[
  { "nome": "LED Vermelho", "pinos": [{ "label": "Anodo", "pino": "13" }] }
]
```

Esse JSON é lido pelo bloco dinâmico `hardware_pino` para popular seu dropdown.

### Como adicionar um novo tipo de componente

1. Criar `src/img/componentes/[nome].svg` com os pinos marcados como elementos SVG com IDs específicos
2. Em `hardware_assembly.js`, na função `adicionarComponente`, adicionar um `case` ou entrada para o novo tipo, definindo quantos pinos tem e seus labels
3. Adicionar o botão correspondente no HTML do painel de montagem em `index.html`

---

## 14. Sistema de Plataformas

### `iniciarIDE(plataforma)`

Chamada ao clicar em uma das 3 placas na tela de seleção. Ela:
1. Esconde a tela de seleção (`#selector-screen`) e mostra a IDE (`#ide-screen`)
2. Salva `plataforma` no `localStorage`
3. Ajusta o `boardSelect` da barra superior para a placa correta
4. Chama `atualizarToolbox(plataforma)` para mostrar/esconder categorias

### `atualizarToolbox(plataforma)`

Parseia o XML base da Toolbox (guardado em `baseToolboxXML`) e manipula quais categorias ficam visíveis:

| Plataforma | Categorias extras mostradas | Categorias escondidas |
|---|---|---|
| `uno` | — | Caixinha, Carrinho, CDR, Sensores Fáceis |
| `mega` | — | Caixinha, Carrinho, CDR |
| `caixinha` | Caixinha, Sensores Fáceis | Carrinho, CDR |

Depois chama `workspace.updateToolbox()` com o XML modificado.

### Identificador de plataforma no gerador

O gerador de código em si não usa a plataforma diretamente — a plataforma influencia quais blocos ficam disponíveis na Toolbox, e os blocos da Caixinha já têm os pinos corretos hardcoded nos geradores.

---

## 15. Responsividade

`handleResponsiveLayout()` — chamada no `resize` da janela. Usa um breakpoint de **850px**.

Abaixo de 850px: move `#arduinoControlsBlock` e `#actionsBlock` do header para o `#mobileMenuSlot` (menu hambúrguer). Acima: move de volta para os slots no header. Isso é feito por manipulação direta de DOM (`appendChild`), não por CSS — é o que o comentário no código chama de "teletransporte de DOM".

---

## 16. Como Adicionar um Novo Bloco — Passo a Passo

Exemplo completo: adicionar um bloco `led_rgb` que acende um LED RGB.

### Passo 1 — Definição visual

Em `blocks_definition/blocks_saida.js` (ou crie `blocks_definition/blocks_rgb.js`):

```javascript
Blockly.defineBlocksWithJsonArray([
  {
    "type": "led_rgb",
    "message0": "🌈 LED RGB pino R:%1 G:%2 B:%3 cor %4 %5 %6",
    "args0": [
      { "type": "input_value", "name": "PIN_R", "check": "Number" },
      { "type": "input_value", "name": "PIN_G", "check": "Number" },
      { "type": "input_value", "name": "PIN_B", "check": "Number" },
      { "type": "input_value", "name": "VAL_R", "check": "Number" },
      { "type": "input_value", "name": "VAL_G", "check": "Number" },
      { "type": "input_value", "name": "VAL_B", "check": "Number" }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#E91E8C",
    "inputsInline": true,
    "tooltip": "Controla um LED RGB com PWM (0-255 por canal)"
  }
]);
```

### Passo 2 — Gerador de código

Em `blocks_generators/arduinoGenerator/generators_saida.js` (ou novo arquivo):

```javascript
arduinoGenerator.forBlock['led_rgb'] = function(block) {
  const pinR = arduinoGenerator.valueToCode(block, 'PIN_R', arduinoGenerator.ORDER_ATOMIC) || '9';
  const pinG = arduinoGenerator.valueToCode(block, 'PIN_G', arduinoGenerator.ORDER_ATOMIC) || '10';
  const pinB = arduinoGenerator.valueToCode(block, 'PIN_B', arduinoGenerator.ORDER_ATOMIC) || '11';
  const valR = arduinoGenerator.valueToCode(block, 'VAL_R', arduinoGenerator.ORDER_ATOMIC) || '0';
  const valG = arduinoGenerator.valueToCode(block, 'VAL_G', arduinoGenerator.ORDER_ATOMIC) || '0';
  const valB = arduinoGenerator.valueToCode(block, 'VAL_B', arduinoGenerator.ORDER_ATOMIC) || '0';

  // Configura os 3 pinos como OUTPUT no setup — chave única por combinação
  arduinoGenerator.setups_[`setup_rgb_${pinR}_${pinG}_${pinB}`] =
    `pinMode(${pinR}, OUTPUT); pinMode(${pinG}, OUTPUT); pinMode(${pinB}, OUTPUT);`;

  return `analogWrite(${pinR}, ${valR});\nanalogWrite(${pinG}, ${valG});\nanalogWrite(${pinB}, ${valB});\n`;
};
```

### Passo 3 — Registrar na Toolbox

No `index.html`, dentro do elemento `<toolbox>`, na categoria de Saída (ou crie uma categoria nova):

```xml
<category name="💡 Saída" colour="#4A90E2">
  <!-- blocos existentes... -->
  <block type="led_rgb">
    <!-- valores padrão nos inputs (shadow blocks) -->
    <value name="PIN_R"><shadow type="math_number"><field name="NUM">9</field></shadow></value>
    <value name="PIN_G"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
    <value name="PIN_B"><shadow type="math_number"><field name="NUM">11</field></shadow></value>
    <value name="VAL_R"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
    <value name="VAL_G"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
    <value name="VAL_B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
  </block>
</category>
```

### Passo 4 — (Opcional) Criar categoria nova

Se for uma categoria nova, adicione ao `atualizarToolbox()` em `main.js` a lógica de mostrar/esconder conforme a plataforma.

### Passo 5 — (Se criou novo arquivo JS) Incluir no HTML

No `index.html`, adicionar a tag `<script>` na ordem correta — sempre **depois** do `arduinoGenerator_setup.js` e **antes** do `main.js`:

```html
<script src="../static/js/blocks/blocks_definition/blocks_rgb.js"></script>
<script src="../static/js/blocks/blocks_generators/arduinoGenerator/generators_rgb.js"></script>
```

---

## 17. Armadilhas e Bugs Conhecidos

### ⚠️ `DB4K_velocidade_serial` não definida

O gerador de `io_serial_print` referencia:
```javascript
arduinoGenerator.setups_['setup_serial'] = `Serial.begin(${DB4K_velocidade_serial});`;
```

Mas `DB4K_velocidade_serial` **não está definida em lugar nenhum** no código atual. Isso causará um erro de JavaScript silencioso e o `Serial.begin()` não será injetado no setup quando o bloco "imprimir no serial" for usado. **Solução temporária:** definir a variável global no topo de `main.js` ou em um script carregado antes:
```javascript
const DB4K_velocidade_serial = 9600;
```

---

### ⚠️ `main.js` monolítico

Com ~1000 linhas, o arquivo mistura: definição de bloco principal, configuração do workspace, temas, Monaco, serial, upload, autosave, exemplos e responsividade. Qualquer refatoração futura deve separar em módulos ES.

---

### ⚠️ Tipos de variáveis no gerador

O `variables_set` detecta o tipo automaticamente por heurística simples:
- `String` se começa com aspas
- `float` se tem ponto decimal ou funções `sin/cos/sqrt/pow`
- `int` para todo o resto

Se o valor inicial for uma expressão como `analogRead(A0)` que retorna inteiro, o tipo declarado vai ser `int` — o que é correto. Mas se depois o usuário atribuir um float à mesma variável, o C++ vai truncar. Não há verificação de tipo posterior.

---

### ⚠️ `controls_repeat` e conflito de variável de loop

O bloco `controls_repeat` gera um `for` com variável `i` usando `getDistinctName`. Se o usuário aninhar dois `controls_repeat`, o segundo criará `i2` (ou similar). Mas se o usuário também tiver uma variável chamada `i` no workspace, pode haver conflito. Funciona na prática mas é um edge case a observar.

---

### ⚠️ `hardware_pino` e workspace desatualizado

O dropdown do bloco `hardware_pino` é gerado **na criação do bloco**. Se o usuário alterar a montagem depois de já ter colocado o bloco no workspace, o dropdown vai mostrar opções desatualizadas. É necessário remover e readicionar o bloco para atualizar. Isso é uma limitação da API de Blockly para dropdowns dinâmicos.

---

### ⚠️ Conector Windows-only

O `agent.js` usa `arduino-cli.exe` hardcoded. Para funcionar no Linux/macOS, o executável seria `arduino-cli` (sem extensão) e o caminho precisaria ser ajustado. Não há detecção de SO no momento.

---

### ⚠️ Chave de config incorreta

A configuração é salva com `localStorage.setItem("mymaker_config", ...)` mas em alguns lugares do código o projeto ainda é chamado internamente de "MyMaker" (legado). Se isso causar confusão, a chave pode ser renomeada para `"roboblocks_config"` — só lembrar de migrar a chave antiga ou o usuário perde as configurações salvas.

---

<div align="center">

**RoboBlocks** · IFNMG Campus Montes Claros  
*Documentação gerada a partir da leitura direta do código-fonte — Junho 2026*

</div>