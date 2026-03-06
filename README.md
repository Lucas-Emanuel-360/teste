
https://drive.google.com/file/d/18ukqMfERTMdU9ws2UpNy-H-S4hYHGZ1c/view?usp=drivesdk


<div align="center">

  <img src="https://via.placeholder.com/150/a277ff/ffffff?text=RoboBlocks+IDE" alt="Logo RoboBlocks" width="120" height="120">

  <h1>🚀 RoboBlocks IDE</h1>
  
  <p>
    <b>Uma IDE moderna baseada em blocos para programação de Arduino diretamente do navegador.</b>
  </p>

  <p>
    <a href="#-sobre-o-projeto">Sobre</a> •
    <a href="#-funcionalidades">Funcionalidades</a> •
    <a href="#-como-usar">Como Usar</a> •
    <a href="#-tecnologias">Tecnologias</a> •
    <a href="#-arquitetura">Arquitetura</a>
  </p>

  ![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-a277ff?style=for-the-badge)
  ![License](https://img.shields.io/badge/License-MIT-61ffca?style=for-the-badge&labelColor=15141b)
  ![Version](https://img.shields.io/badge/Version-2.0.0-ffca85?style=for-the-badge&labelColor=15141b)

</div>

---

## 📖 Sobre o Projeto

O **RoboBlocks** é uma ferramenta desenvolvida para facilitar o ensino de robótica e lógica de programação. Diferente da IDE padrão do Arduino, que exige conhecimento de sintaxe C++, o RoboBlocks utiliza uma interface visual de "arrastar e soltar" (baseada no Google Blockly), tornando a programação acessível para crianças e iniciantes.

O diferencial deste projeto é a integração **Web-Hardware**: através de um *Agente Local (Connector)*, o navegador consegue compilar, verificar e enviar o código diretamente para a placa Arduino via USB.

### 📸 Screenshots

| Tema Aura (Dark/Neon) | Tema Light (Clean) |
|:---------------------:|:------------------:|
| <img src="" width="400" alt="Tema Aura"> | <img src="image_d6078d.png" width="400" alt="Tema Light"> |
| *Editor Monaco Integrado (Dark)* | *Interface Clara para Sala de Aula* |

---

## ✨ Funcionalidades

- **🧩 Programação em Blocos:** Interface intuitiva onde a lógica é construída encaixando peças.
- **💻 Editor Híbrido (Monaco):** - Visualize o código C++ gerado em tempo real.
    - **Edição Manual:** Permite digitar código diretamente (para usuários avançados).
    - Syntax Highlighting profissional (mesmo motor do VS Code).
- **⚡ Upload & Verificação:** Compile e envie o código para o Arduino (Uno, Nano, Mega) com um clique.
- **🔌 Monitor Serial Web:** Visualize os dados enviados pelo Arduino em tempo real no navegador.
- **🎨 Temas Personalizados:**
  - `Aura` (Padrão: Roxo/Cyberpunk)
  - `Light` (Claro/GitHub Style)
  - `Void` (Alto Contraste/Matrix)

---

## 🚀 Como Usar

### Pré-requisitos
1. **Arduino IDE** instalada (para fornecer o compilador `arduino_debug.exe`).

### Passo 1: Iniciar o Agente Local
O navegador não pode acessar o USB diretamente por segurança. O Agente faz essa ponte.
