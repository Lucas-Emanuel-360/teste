// =============================================================
// Funções genéricas de modal e toast. 
// =============================================================

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function toggleModal(modalId, show) {
  const modal = document.getElementById(modalId);
  if (show) {
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("modal-visible"), 10);
  } else {
    modal.classList.remove("modal-visible");
    setTimeout(() => {
      if (!modal.classList.contains("modal-visible")) modal.style.display = "none";
    }, 300);
  }
}

function showErrorModal(logOutput) {
  document.getElementById("errorMessageText").innerText = logOutput;
  toggleModal("errorModal", true);
}

document.getElementById("closeErrorBtn").addEventListener("click", () => toggleModal("errorModal", false));
document.getElementById("viewErrorInCodeBtn").addEventListener("click", () => {
  toggleModal("errorModal", false);
  toggleModal("codeModal", true);
});