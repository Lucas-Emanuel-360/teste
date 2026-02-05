<div align="center">

  <img src="https://via.placeholder.com/150/a277ff/ffffff?text=RoboBlocks+IDE" alt="Logo RoboBlocks" width="120" height="120">

  <h1>🚀 RoboBlocks IDE</h1>
  
  <p>
    <b>Uma IDE moderna baseada em blocos para programação de Arduino diretamente do navegador.</b>
  </p>

  <p>
    <a href="#-funcionalidades">Funcionalidades</a> •
    <a href="#-como-usar">Como Usar</a> •
    <a href="#-tecnologias">Tecnologias</a> •
    <a href="#-arquitetura">Arquitetura</a>
  </p>

  ![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-a277ff?style=for-the-badge)
  ![License](https://img.shields.io/badge/License-MIT-61ffca?style=for-the-badge&labelColor=15141b)
  ![Version](https://img.shields.io/badge/Version-1.0.0-ffca85?style=for-the-badge&labelColor=15141b)

</div>

---

## 📖 Sobre o Projeto

O **RoboBlocks** é uma ferramenta desenvolvida para facilitar o ensino de robótica e lógica de programação. Diferente da IDE padrão do Arduino, que exige conhecimento de sintaxe C++, o RoboBlocks utiliza uma interface visual de "arrastar e soltar" (baseada no Google Blockly), tornando a programação acessível para crianças e iniciantes.

O diferencial deste projeto é a integração **Web-Hardware**: através de um *Agente Local (Connector)*, o navegador consegue compilar e enviar o código diretamente para a placa Arduino via USB.

### 📸 Screenshots

<div style = "text-align=center">
  <img src="image_a44a21.png" alt="Interface Principal - Tema Aura" width="800">
  <br>
  <em>Interface Principal com o tema escuro "Aura"</em>
</div>

---

## ✨ Funcionalidades

- **🧩 Programação em Blocos:** Interface intuitiva onde a lógica é construída encaixando peças.
- **⚡ Upload Direto:** Envie o código para o Arduino (Uno, Nano, Mega) com apenas um clique.
- **🔌 Monitor Serial Web:** Visualize os dados enviados pelo Arduino em tempo real no navegador.
- **🎨 Temas Personalizados:**
  - `Aura` (Padrão: Roxo/Escuro)
  - `Light` (Claro/Clean)
  - `Void` (Alto Contraste/OLED)
- **💻 Visualizador de Código:** Veja o código C++ sendo gerado em tempo real enquanto monta os blocos.
- **🛠️ Modo Simulação:** Teste o fluxo de envio sem precisar da placa conectada.

---

## 🏗 Arquitetura do Sistema

O projeto funciona em duas partes que conversam entre si:

1.  **Frontend (Web):** A interface onde o usuário monta os blocos. Feita em HTML/JS puro, roda no navegador.
2.  **Backend (Agente Local):** Um serviço em Node.js (ou executável `.exe`) que roda no computador do usuário. Ele serve como uma "ponte":
    * Recebe o código C++ do navegador via HTTP.
    * Salva o arquivo `.ino`.
    * Chama o `arduino_debug.exe` (CLI) para compilar e fazer o upload via USB.

```mermaid
graph LR
    A[Navegador Web] -- JSON (Código + Porta) --> B[Agente Local (Porta 3000)]
    B -- Cria Arquivo --> C[sketch_temp.ino]
    B -- Executa Comando --> D[Arduino CLI / Debug]
    D -- Upload via USB --> E[Placa Arduino]