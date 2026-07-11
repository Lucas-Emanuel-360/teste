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

async function updateComPorts() {
  const portSelect = document.getElementById("portInput");
  portSelect.innerHTML = '<option value="">Porta COM</option>';
  const fakeOption = document.createElement("option");
  fakeOption.value = "COM_TESTE";
  fakeOption.text = "🛠️ Porta Virtual (Teste)";
  fakeOption.style.color = "orange";
  portSelect.appendChild(fakeOption);

  if (!navigator.serial) return;
  try {
    const ports = await navigator.serial.getPorts();
    ports.forEach((port, index) => {
      const info = port.getInfo();
      const vid = info.usbVendorId;
      let label = `Porta ${index + 1}`;
      if (vid === 0x2341) label += " (Arduino)";
      else if (vid) label += ` (USB ${vid})`;
      const option = document.createElement("option");
      option.value = `COM${index + 3}`;
      option.text = label;
      portSelect.appendChild(option);
    });
    const addOption = document.createElement("option");
    addOption.value = "SEARCH";
    addOption.text = "➕ Nova Porta...";
    addOption.style.color = "#61ffca";
    portSelect.appendChild(addOption);
  } catch (err) {
    console.error("Erro portas:", err);
  }
}

document.getElementById("refreshPortsBtn").addEventListener("click", updateComPorts);
document.getElementById("portInput").addEventListener("change", async (e) => {
  if (e.target.value === "SEARCH") {
    try {
      await navigator.serial.requestPort();
      await updateComPorts();
      const select = document.getElementById("portInput");
      if (select.options.length > 2) select.selectedIndex = select.options.length - 2;
    } catch (err) {
      e.target.value = "";
    }
  }
});
updateComPorts();