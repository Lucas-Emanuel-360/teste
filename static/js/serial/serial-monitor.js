// =============================================================
// Web Serial API: conexão, leitura/escrita, portas COM.
// =============================================================

const serialMonitor = document.getElementById("serialMonitor");
let currentPort = null;
let serialWriter = null;
let reader = null;
let lineBuffer = "";

document.getElementById("connectSerialBtn").addEventListener("click", async () => {
  if (!navigator.serial) return alert("Use Chrome ou Edge para Serial.");

  const baudRate = parseInt(document.getElementById("baudRateSelect").value);

  try {
    currentPort = await navigator.serial.requestPort();
    await currentPort.open({ baudRate: baudRate });
    serialMonitor.classList.add("open");
    const output = document.getElementById("serialOutput");
    output.innerHTML += `<div style="color: var(--secondary); border-bottom: 1px dashed #333; padding-bottom: 5px;">>>> Conectado (${baudRate} baud) 🔌</div>`;

    const textEncoder = new TextEncoderStream();
    textEncoder.readable.pipeTo(currentPort.writable);
    serialWriter = textEncoder.writable.getWriter();

    const textDecoder = new TextDecoderStream();
    currentPort.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        const addTimestamp = document.getElementById("timestampCheck").checked;
        const autoScroll = document.getElementById("autoScrollCheck").checked;

        if (addTimestamp) {
          lineBuffer += value;
          if (lineBuffer.includes("\n")) {
            const lines = lineBuffer.split("\n");
            lineBuffer = lines.pop();
            const time = new Date().toLocaleTimeString();
            lines.forEach(
              (l) => (output.innerHTML += `<span style="color:#555">[${time}]</span> ${l}<br>`),
            );
          }
        } else {
          output.innerHTML += value.replace(/\n/g, "<br>");
        }

        if (autoScroll) output.scrollTop = output.scrollHeight;
      }
    }
  } catch (e) {
    console.log("Erro Serial:", e);
  }
});

document.getElementById("sendSerialBtn").addEventListener("click", async () => {
  if (!serialWriter) return showToast("A porta serial não está conectada.", "error");
  const inputEl = document.getElementById("serialInputText");
  const dataToSend = inputEl.value + "\n";
  try {
    await serialWriter.write(dataToSend);
    inputEl.value = "";
  } catch (e) {
    showToast("Falha ao enviar dado.", "error");
  }
});

document.getElementById("serialInputText").addEventListener("keypress", function (e) {
  if (e.key === "Enter") document.getElementById("sendSerialBtn").click();
});

document.getElementById("closeSerialBtn").addEventListener("click", async () => {
  serialMonitor.classList.remove("open");
  if (reader) {
    await reader.cancel();
    reader = null;
  }
  if (serialWriter) {
    await serialWriter.close();
    serialWriter = null;
  }
  if (currentPort) {
    await currentPort.close();
    currentPort = null;
  }
});
document
  .getElementById("clearSerialBtn")
  .addEventListener("click", () => (document.getElementById("serialOutput").innerHTML = ""));

// -------------------------------------------------------------
// NOTA: este arquivo NÃO gerencia mais o select #portInput.
// Esse select é exclusivo do fluxo de Verificar/Enviar via Conector
// (arduino-cli), gerenciado em connector/connector-status.js
// (refreshPorts). O Monitor Serial usa a Web Serial API de forma
// independente — connectSerialBtn chama navigator.serial.requestPort()
// diretamente (o próprio navegador mostra o seletor de porta nativo),
// sem nunca ler o valor de #portInput.
//
// Antes havia uma função updateComPorts() aqui que também escrevia
// em #portInput com uma lista de portas fake (baseada em
// navigator.serial.getPorts()) e registrava seu próprio listener no
// mesmo botão #refreshPortsBtn. Como #portInput nunca era lido por
// este arquivo, esse código só existia para conflitar com
// connector-status.js: os dois listeners disputavam quem por último
// escrevia no <select>, e a lista de portas ficava inconsistente
// dependendo da ordem/tempo das chamadas assíncronas. Removido.
// -------------------------------------------------------------