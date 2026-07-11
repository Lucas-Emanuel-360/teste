// =============================================================
// ui-menu.js
// Botões do menu lateral (hambúrguer). Depende de ui-modals.js
// (usa toggleModal).
// =============================================================

document.getElementById("menuBtn").addEventListener("click", () =>
  document.getElementById("sideMenu").classList.add("open"),
);
document.getElementById("closeMenuBtn").addEventListener("click", () =>
  document.getElementById("sideMenu").classList.remove("open"),
);

document.getElementById("openThemeModalBtn").addEventListener("click", () => {
  document.getElementById("sideMenu").classList.remove("open");
  toggleModal("themeModal", true);
});
document.getElementById("closeThemeBtn").addEventListener("click", () => toggleModal("themeModal", false));