// =============================================================
// ui-responsive.js
// Move blocos de UI entre desktop/mobile conforme largura de tela.
// =============================================================

function handleResponsiveLayout() {
  const width = window.innerWidth;
  const mobileBreakpoint = 850;

  const controlsBlock = document.getElementById("arduinoControlsBlock");
  const actionsBlock = document.getElementById("actionsBlock");
  const desktopControlsSlot = document.getElementById("desktopControlsSlot");
  const desktopActionsSlot = document.getElementById("desktopActionsSlot");
  const mobileMenuSlot = document.getElementById("mobileMenuSlot");

  if (width <= mobileBreakpoint) {
    if (controlsBlock.parentElement !== mobileMenuSlot) {
      mobileMenuSlot.appendChild(controlsBlock);
      mobileMenuSlot.appendChild(actionsBlock);
    }
  } else {
    if (controlsBlock.parentElement !== desktopControlsSlot) {
      desktopControlsSlot.appendChild(controlsBlock);
      desktopActionsSlot.appendChild(actionsBlock);
    }
  }
}
window.addEventListener("resize", handleResponsiveLayout);