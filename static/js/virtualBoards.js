// =============================================================
// GERENCIADOR DE HARDWARE VIRTUAL (SVG FETCH)
// =============================================================

/**
 * Função que busca um arquivo SVG na pasta e o injeta como código vivo no HTML.
 * @param {string} nomeDoArquivo - Nome do arquivo sem a extensão (ex: 'Uno')
 * @param {string} containerId - ID da div vazia onde o SVG será injetado
 */
async function carregarPlacaVirtual(nomeDoArquivo, containerId) {
    const container = document.getElementById(containerId);
    
    // Coloca um ícone de carregamento enquanto busca
    container.innerHTML = `<span class="loading-spinner" style="border-top-color: var(--primary);"></span>`;
    
    try {
        const resposta = await fetch(`../src/img/${nomeDoArquivo}.svg`);
        
        if (!resposta.ok) {
            throw new Error(`Placa ${nomeDoArquivo} não encontrada.`);
        }
        
        // Lê o código bruto do SVG
        const codigoSvg = await resposta.text();
        
        // Injeta na página (O vidro quebra aqui, o CSS agora tem acesso total!)
        container.innerHTML = codigoSvg;
        console.log(`🔌 [RoboBlocks] Hardware Virtual carregado: ${nomeDoArquivo}`);
        
    } catch (erro) {
        console.error("Erro ao carregar o SVG:", erro);
        container.innerHTML = `<p style="color: var(--danger); font-size: 12px;">Falha ao carregar placa.</p>`;
    }
}

// Inicia as buscas assim que a página terminar de carregar os elementos
window.addEventListener('DOMContentLoaded', () => {
    // Carrega o Arduino Uno e o Mega nos seus respectivos espaços
    carregarPlacaVirtual('Uno', 'board-uno');
    carregarPlacaVirtual('Mega', 'board-mega');
    
    // Nota: A Caixinha é PNG, então ela continua como <img> normal lá no HTML.
});