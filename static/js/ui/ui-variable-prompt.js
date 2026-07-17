// =============================================================
// Substitui o prompt nativo do Blockly para nomear variáveis
// por um modal customizado, reaproveitando o sistema de modais
// já existente (toggleModal / classes .modal-visible).
// =============================================================

Blockly.dialog.setPrompt((message, defaultValue, callback) => {
  const modal = document.getElementById("varNameModal");
  const input = document.getElementById("varNameInput");
  const messageEl = document.getElementById("varNameMessage");
  const confirmBtn = document.getElementById("varNameConfirmBtn");
  const cancelBtn = document.getElementById("varNameCancelBtn");

  messageEl.textContent = message;
  input.value = defaultValue || "";

  toggleModal("varNameModal", true);
  setTimeout(() => input.focus(), 50);

  function cleanup(result) {
    toggleModal("varNameModal", false);
    confirmBtn.removeEventListener("click", onConfirm);
    cancelBtn.removeEventListener("click", onCancel);
    input.removeEventListener("keydown", onKeydown);
    callback(result);
  }

  function onConfirm() {
    cleanup(input.value.trim() || null);
  }

  function onCancel() {
    cleanup(null);
  }

  function onKeydown(e) {
    if (e.key === "Enter") onConfirm();
    if (e.key === "Escape") onCancel();
  }

  confirmBtn.addEventListener("click", onConfirm);
  cancelBtn.addEventListener("click", onCancel);
  input.addEventListener("keydown", onKeydown);
});