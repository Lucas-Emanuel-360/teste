# RoboBlocks — Documentação Técnica

> **Versão do documento:** rascunho v1.0  
> **Status do projeto:** Em desenvolvimento ativo  
> **Última atualização:** Junho 2026

---

# Visão Geral do Projeto

O **RoboBlocks** é uma IDE baseada em blocos visuais para programação de placas Arduino, rodando inteiramente no navegador. O objetivo é tornar a programação de robótica acessível a iniciantes e estudantes — especialmente no contexto do **IFNMG** — sem exigir conhecimento de sintaxe C++.

O usuário monta a lógica arrastando e encaixando blocos visuais (via Google Blockly). A IDE traduz esse diagrama em código C++ válido para Arduino em tempo real. Para compilar e enviar o código para a placa física via USB, a IDE se comunica com um **agente local** (processo Node.js separado) que usa o `arduino-cli` internamente.

### Tecnologias principais

| Camada | Tecnologia |
|---|---|
| Interface visual (IDE) | HTML + CSS + JavaScript (vanilla) |
| Motor de blocos | Google Blockly |
| Editor de código | Monaco Editor (mesmo motor do VS Code) |
| Geração de código | Gerador customizado Arduino (extensão do Blockly) |
| Agente local (bridge USB) | Node.js + Express |
| Compilador/Upload | arduino-cli (binário embutido) |
| Monitor Serial | Web Serial API (Chrome/Edge) |

### Arquitetura resumida

```
Navegador (IDE)
│
├── Blockly Workspace  →  arduinoGenerator  →  Código C++ (Monaco)
│
└── fetch() HTTP  ──►  Agente Local (agent.js : porta 3000)
                              │
                        arduino-cli.exe
                              │
                         Arduino (USB)
```

A IDE roda como HTML estático (`interface/index.html`). O agente é um processo separado que precisa estar rodando na máquina do usuário para que compile e faça upload funcione.

---

# Funcionalidades Principais

### Seleção de plataforma

Na tela inicial, o usuário escolhe uma das três plataformas antes de entrar na IDE:

- **Arduino Uno** — uso geral, sensores avulsos, lógica básica.
- **Arduino Mega** — projetos mais complexos com mais pinos digitais e analógicos.
- **Caixinha Educacional** — kit montado do IFNMG com mapeamento de pinos fixo (LEDs, botões, buzzer já pré-configurados). Usa Arduino Mega internamente.

A escolha da plataforma define quais categorias de blocos aparecem na Toolbox e qual placa é usada pelo gerador de código.

### Editor de blocos (Blockly Workspace)

- Workspace com scroll, zoom e snap automático entre blocos.
- **Bloco "Iniciar"** fixo e não deletável — funciona como ponto de entrada, com dois slots: `Configuração (Setup)` e `Repetir para Sempre (Loop)`, espelhando a estrutura de um sketch Arduino.
- Criação de variáveis via botão `[+]` embutido no bloco Iniciar.
- Suporte a funções (procedures) com e sem retorno, incluindo passagem de parâmetros.
- Estado vazio com mensagem orientativa ("Arraste os blocos aqui para começar").

### Categorias de blocos disponíveis

| Categoria | Conteúdo |
|---|---|
| **Lógica** | Condicionais if/else, operadores booleanos |
| **Matemática** | Operações aritméticas, funções numéricas |
| **Texto** | Concatenação, conversão de tipos |
| **Variáveis** | Criar, ler e atribuir variáveis |
| **Controles** | Loops (repetir N vezes, enquanto), delay |
| **Entrada** | Leitura digital e analógica, Serial print/read |
| **Saída** | Escrita digital, PWM, Serial print |
| **Sensores** | LDR (luz), sensor de linha (TCRT5000), sensor de distância (ultrassônico) |
| **Servo** | Controle de ângulo de servomotor |
| **Caixinha** | LEDs (esq/dir/cor), botões, buzzer — com mapeamento de pinos automático |
| **Carrinho** | Setup de Ponte H, mover frente/trás/esquerda/direita, parar |
| **Funções** | Definir e chamar funções customizadas |

### Geração de código em tempo real (Live Code)

- Painel lateral abre com o botão **"👁️ Live Code"**.
- Exibe o código C++ gerado pelos blocos em tempo real conforme o usuário edita.
- Editor Monaco com syntax highlighting de C++.
- **Modo de edição manual:** o usuário pode digitar no editor e desacoplar da geração automática temporariamente.
- Botão **"▶ Código"** abre uma modal com o código final completo para cópia.
- Botão **"⬇ .ino"** para download direto do arquivo `.ino`.

### Temas visuais

Quatro temas disponíveis, aplicados simultaneamente à UI, ao workspace do Blockly e ao Monaco Editor:

- **Aura** (padrão) — dark, roxo/neon.
- **Light** — claro, estilo GitHub.
- **Void** — preto absoluto, alto contraste.
- **Coffee** — dark quente, tons terrosos.

Preferência salva em `localStorage`.

### Compilação e upload (via Agente Local)

Requer o **RoboBlocks Connector** (`agent.js`) rodando localmente:

- Botão **"✔️ Verificar"** — compila o código sem fazer upload, reportando erros de sintaxe.
- Botão **"🚀 Enviar"** — compila e envia para a placa na porta COM selecionada.
- Seletor de porta COM com detecção automática via Web Serial API e opção de modo simulação (`COM_TESTE`) para testar sem hardware.
- Indicador de status do conector (ponto colorido na barra superior: verde = online, cinza = offline).
- Erros de compilação são exibidos em uma modal com o log completo do arduino-cli, e linhas com erro são destacadas no Monaco.

### Monitor Serial Web

- Ativado pelo botão **"🔌 Monitor"**.
- Abre um painel sobreposto ao workspace com terminal de entrada/saída.
- Usa a **Web Serial API** do navegador (requer Chrome ou Edge).
- Funcionalidades: seleção de baud rate, auto-scroll, timestamp por mensagem, botão de limpar, envio de comandos para a placa via input de texto (Enter ou botão "Enviar").

### Painel de Montagem de Hardware

- Ativado pelo botão **"⚙️ Montagem"** (ícone de chip).
- Exibe a imagem vetorial da placa selecionada (Uno ou Mega, renderizada via SVG injetado).
- Permite adicionar componentes (ex: LED) e conectar seus pinos a pinos da placa via interface drag-and-drop com fios roteados.
- Suporte a zoom (scroll ou botões +/−) e pan (arrastar o fundo).
- Estado da montagem é salvo e restaurado automaticamente.

### Persistência local

- **Autosave:** o workspace é salvo automaticamente em `localStorage` a cada alteração.
- **Salvar/Abrir projeto:** exporta e importa o estado do workspace em formato XML (`.xml` / `.rbb`).
- Plataforma selecionada e tema são restaurados ao reabrir a página.

---

# Guia de Uso Técnico / Como Mexe

### Pré-requisitos para uso completo

1. **Navegador:** Chrome ou Edge (necessário para Web Serial API e compilação).
2. **RoboBlocks Connector:** baixar e executar o `agent.js` (ou o `.exe` compilado) na máquina local antes de usar Verificar/Enviar.
   ```bash
   # Na pasta static/js/
   npm install
   node agent.js
   ```
   O agente sobe na porta `3000`. A URL padrão (`http://localhost:3000`) pode ser alterada nas configurações da IDE (ícone ⚙️ → campo "URL do Conector").

3. **Arduino conectado via USB** (opcional para só editar blocos; necessário para upload).

### Fluxo de uso básico

1. Abrir `interface/index.html` no navegador.
2. Selecionar a plataforma (Uno, Mega ou Caixinha).
3. Arrastar blocos da **Toolbox** (painel esquerdo) para o **workspace** central.
4. Encaixar os blocos dentro do bloco "Iniciar" nos slots de Setup ou Loop.
5. Acompanhar o código gerado no painel **Live Code** (botão superior direito).
6. Com o Conector rodando, selecionar a porta COM e clicar em **Verificar** ou **Enviar**.

### Estrutura de arquivos relevante

```
projeto/
├── interface/
│   ├── index.html          # Ponto de entrada da IDE (abrir no navegador)
│   └── stylesheet.css      # Estilos e temas da interface
│
├── static/js/
│   ├── main.js             # Lógica principal da IDE, temas, workspace, upload
│   ├── hardware_assembly.js # Painel de montagem virtual de hardware
│   ├── virtualBoards.js    # Carregamento dinâmico dos SVGs das placas
│   ├── agent.js            # Agente local (servidor Express — roda separado)
│   ├── package.json        # Dependências do agente (Express, cors, etc.)
│   │
│   └── blocks/
│       ├── blocks_definition/     # Definição visual dos blocos (JSON + Blockly API)
│       │   ├── blocks_caixinha.js
│       │   ├── blocks_carrinho.js
│       │   ├── blocks_controls.js
│       │   ├── blocks_entrada.js
│       │   ├── blocks_saida.js
│       │   ├── blocks_sensores.js
│       │   ├── blocks_servo.js
│       │   └── ...
│       │
│       └── blocks_generators/arduinoGenerator/   # Tradução bloco → código C++
│           ├── arduinoGenerator_setup.js          # Setup do gerador (includes, protótipos)
│           ├── generators_caixinha.js
│           ├── generators_carrinho.js
│           └── ...
│
└── src/img/
    ├── Uno.svg             # SVG da placa Arduino Uno (injetado dinamicamente)
    ├── Mega.svg            # SVG da placa Arduino Mega
    ├── Caixinha.png        # Imagem do kit educacional
    └── componentes/        # SVGs de componentes para o painel de montagem
```

### Como adicionar um novo bloco

Criar/editar os dois arquivos correspondentes à categoria do bloco:

**1. Definição visual** (`blocks_definition/blocks_[categoria].js`):
```javascript
Blockly.defineBlocksWithJsonArray([
  {
    "type": "nome_unico_do_bloco",
    "message0": "Texto do bloco %1",
    "args0": [{ "type": "input_value", "name": "PARAM", "check": "Number" }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#HEX",
    "tooltip": "Descrição para o usuário."
  }
]);
```

**2. Gerador de código** (`blocks_generators/arduinoGenerator/generators_[categoria].js`):
```javascript
arduinoGenerator.forBlock["nome_unico_do_bloco"] = function(block) {
  const param = arduinoGenerator.valueToCode(block, "PARAM", arduinoGenerator.ORDER_NONE) || "0";
  return `minhaFuncao(${param});\n`;
};
```

**3. Registrar no toolbox** (dentro do `<toolbox>` no `index.html`):
```xml
<block type="nome_unico_do_bloco"></block>
```

### Comunicação IDE ↔ Agente Local

O frontend faz requisições HTTP para o agente em `http://localhost:3000`:

| Endpoint | Método | Payload | Descrição |
|---|---|---|---|
| `/status` | GET | — | Verifica se o agente está online |
| `/verify` | POST | `{ code, board }` | Compila o sketch sem upload |
| `/upload` | POST | `{ code, board, port }` | Compila e envia para a placa |

O campo `board` aceita: `"uno"`, `"mega"`, `"nano"`. A porta `"COM_TESTE"` ativa o modo simulação (sem hardware real).

---

# Status do Desenvolvimento

O projeto está em **fase de desenvolvimento ativo**. A estrutura central está funcional, mas várias áreas ainda estão em construção ou planejadas. Considere este documento um retrato do estado atual — não uma especificação final.

### O que está funcional hoje

- Fluxo completo de blocos → geração de código → upload via agente.
- Todas as categorias de blocos listadas acima.
- Temas visuais e persistência de sessão.
- Monitor Serial Web.
- Painel de montagem virtual (em uso ativo, mas em expansão).
- Suporte a Arduino Uno, Mega e Caixinha Educacional.

### O que está em andamento ou incompleto

- **Painel de montagem:** catálogo de componentes é pequeno (somente LED implementado com arquivo `.af`/`.svg`). Mais componentes serão adicionados.
- **Caixinha Educacional:** mapeamento de pinos está hardcoded nos blocos; pode precisar de revisão conforme o hardware evolui.
- **Agente Local:** atualmente Windows-only (usa `arduino-cli.exe`). Suporte a Linux/macOS não implementado.
- **Modo Offline completo:** depende do Conector rodando localmente; não há fallback.
- **Testes automatizados:** ausentes. Todo teste é manual.
- **README:** contém placeholders (imagens faltando, seções incompletas).

### Pontos de atenção para novos desenvolvedores

- O `main.js` é atualmente monolítico (~1.000 linhas). Refatoração em módulos está implicitamente necessária conforme o projeto cresce.
- A geração de código usa tipos C++ genéricos (`float` para variáveis de funções). Projetos que precisem de tipos específicos (`int`, `String`) vão requerer ajuste no gerador.
- O autosave usa `localStorage`, que tem limite de ~5MB e é limpo pelo navegador. Para projetos maiores, considerar exportação explícita como fluxo padrão.
- A URL do agente (`http://localhost:3000`) é configurável pela UI, mas não há mecanismo de descoberta automática.
