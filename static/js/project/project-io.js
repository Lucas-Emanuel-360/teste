// =============================================================
// Salvar/carregar projeto (.xml), exemplos prontos, botão "Apagar tudo".
// =============================================================

document.getElementById("saveBtn").addEventListener("click", () => {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  const blob = new Blob([Blockly.Xml.domToText(xml)], { type: "text/xml" });
  const a = document.createElement("a");
  a.download = "projeto.xml";
  a.href = URL.createObjectURL(blob);
  a.click();
  showToast("Projeto salvo!");
});

document.getElementById("loadBtn").addEventListener("click", () =>
  document.getElementById("loadInput").click(),
);

document.getElementById("loadInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    isLoadingWorkspace = true;
    Blockly.Events.disable();
    try {
      workspace.clear();
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(e.target.result), workspace);
      showToast("Projeto carregado!");
    } catch (err) {
      showToast("Erro ao carregar XML.", "error");
    } finally {
      Blockly.Events.enable();
      isLoadingWorkspace = false;
      saveWorkspaceNow(); // grava o projeto importado imediatamente
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

// Exemplos: usam setup_block + loop_block (STACK)
const xmlBlink = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="setup_block" x="100" y="50" deletable="false" movable="true">
    <statement name="SETUP">
      <block type="io_pin_mode">
        <value name="PIN"><shadow type="math_number"><field name="NUM">13</field></shadow></value>
        <field name="MODE">OUTPUT</field>
      </block>
    </statement>
  </block>
  <block type="loop_block" x="100" y="260" deletable="false" movable="true">
    <statement name="STACK">
      <block type="io_digital_write">
        <value name="PIN"><shadow type="math_number"><field name="NUM">13</field></shadow></value>
        <value name="STATE"><shadow type="io_high"></shadow></value>
        <next>
          <block type="controls_delay">
            <value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
            <next>
              <block type="io_digital_write">
                <value name="PIN"><shadow type="math_number"><field name="NUM">13</field></shadow></value>
                <value name="STATE"><shadow type="io_low"></shadow></value>
                <next>
                  <block type="controls_delay">
                    <value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`;

const xmlServo = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="setup_block" x="100" y="50" deletable="false" movable="true"></block>
  <block type="loop_block" x="100" y="260" deletable="false" movable="true">
    <statement name="STACK">
      <block type="servo_write">
        <value name="PIN"><shadow type="math_number"><field name="NUM">9</field></shadow></value>
        <value name="ANGLE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
        <next>
          <block type="controls_delay">
            <value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
            <next>
              <block type="servo_write">
                <value name="PIN"><shadow type="math_number"><field name="NUM">9</field></shadow></value>
                <value name="ANGLE"><shadow type="math_number"><field name="NUM">180</field></shadow></value>
                <next>
                  <block type="controls_delay">
                    <value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`;

const xmlPot = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="setup_block" x="100" y="50" deletable="false" movable="true"></block>
  <block type="loop_block" x="100" y="260" deletable="false" movable="true">
    <statement name="STACK">
      <block type="io_serial_print">
        <value name="TEXT">
          <block type="io_analog_read">
            <value name="PIN"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
          </block>
        </value>
        <next>
          <block type="controls_delay">
            <value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">100</field></shadow></value>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`;


function loadExample(xml) {
  if (confirm("Isso substituirá seus blocos. Continuar?")) {
    isLoadingWorkspace = true;
    Blockly.Events.disable();
    try {
      workspace.clear();
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
    } finally {
      Blockly.Events.enable();
      isLoadingWorkspace = false;
      workspace.scrollCenter();
      saveWorkspaceNow(); // grava o exemplo carregado imediatamente
    }
  }
}

workspace.registerButtonCallback("LOAD_BLINK", () => loadExample(xmlBlink));
workspace.registerButtonCallback("LOAD_SERVO", () => loadExample(xmlServo));
workspace.registerButtonCallback("LOAD_POT", () => loadExample(xmlPot));

document.getElementById("clearBtn")?.addEventListener("click", () => {
  if (confirm("Apagar tudo?")) {
    isLoadingWorkspace = true;
    Blockly.Events.disable();
    try {
      workspace.clear();
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(DEFAULT_XML), workspace);
    } finally {
      Blockly.Events.enable();
      isLoadingWorkspace = false;
      saveWorkspaceNow(); // grava o estado limpo imediatamente
    }
  }
});
