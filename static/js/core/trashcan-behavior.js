// =============================================================
// Mantém a animação da lixeira, mas impede que blocos excluídos
// fiquem armazenados/recuperáveis. A animação é disparada pelo
// próprio Blockly no evento de exclusão — nós só interceptamos
// DEPOIS, limpando o array de conteúdo, sem tocar em nenhuma
// configuração de capacidade (que é o que matava a animação antes).
// =============================================================

workspace.addChangeListener((e) => {
  if (e.type !== Blockly.Events.BLOCK_DELETE) return;

  // Espera o Blockly terminar de processar a animação/o registro
  // do conteúdo antes de limpar — senão corremos o risco de
  // interromper a animação no meio.
  setTimeout(() => {
    const trashcan = workspace.trashcan;
    if (!trashcan) return;

    // Ajuste o nome da propriedade/método conforme o que aparecer
    // no console.log do Passo 2 acima. Exemplos mais prováveis:
    if (typeof trashcan.emptyContents === "function") {
      trashcan.emptyContents();
    } else if (Array.isArray(trashcan.contents_)) {
      trashcan.contents_.length = 0;
    } else {
      console.warn(
        "[RoboBlocks] Não encontrei a propriedade de conteúdo da lixeira. " +
        "Rode o diagnóstico do console e ajuste este arquivo."
      );
    }
  }, 300); // um pouco depois da animação de "flap" (~200-250ms típico)
});