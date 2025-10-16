/**
 * =====================================================
 * NAVIGATION HELPER - SISTEMA DUAL AR/VR
 * =====================================================
 * 
 * DESCRIÇÃO:
 * Helper JavaScript para navegação contextual entre galeria AR
 * e galeria VR, mantendo o contexto de origem através de toda
 * a cadeia de navegação.
 * 
 * VERSÃO: 1.0.0
 * DATA: 2025-10-15
 * AUTOR: Zonas 11 Project
 * 
 * =====================================================
 * FUNCIONALIDADES
 * =====================================================
 * 
 * ✅ Detecção automática de origem (AR ou VR)
 * ✅ Propagação de parâmetro ?from= em toda navegação
 * ✅ URLs dinâmicas baseadas em contexto
 * ✅ Compatibilidade reversa (default: AR)
 * ✅ Validação de parâmetros
 * 
 * =====================================================
 * USO
 * =====================================================
 * 
 * HTML:
 * <script src="assets/js/navigation-helper.js"></script>
 * 
 * JavaScript:
 * const source = getNavigationSource();        // 'ar' ou 'vr'
 * const galleryURL = getGalleryURL();          // galeria.html ou galeria-vr.html
 * const obraURL = addSourceParam('obra1.html'); // obra1.html?from=ar ou ?from=vr
 * 
 * =====================================================
 */

/**
 * =====================================================
 * GET NAVIGATION SOURCE - DETECTAR ORIGEM
 * =====================================================
 * 
 * Obtém o parâmetro 'from' da URL atual.
 * 
 * @returns {'ar'|'vr'} - Origem da navegação
 * 
 * EXEMPLOS:
 * - URL: index2.html?from=ar  → Retorna: 'ar'
 * - URL: index2.html?from=vr  → Retorna: 'vr'
 * - URL: index2.html          → Retorna: 'ar' (default)
 * 
 * COMPATIBILIDADE:
 * Se parâmetro ausente ou inválido, assume 'ar' para
 * compatibilidade com versão anterior (V2.8.1).
 */
function getNavigationSource() {
  // Obter parâmetros da URL
  const params = new URLSearchParams(window.location.search);
  const from = params.get('from');
  
  // Validar valor (apenas 'ar' ou 'vr' são aceitos)
  if (from === 'ar' || from === 'vr') {
    console.log(`📍 Navigation Helper: Origem detectada → ${from.toUpperCase()}`);
    return from;
  }
  
  // Default: AR (compatibilidade reversa)
  console.log('📍 Navigation Helper: Origem não especificada, assumindo AR (default)');
  return 'ar';
}

/**
 * =====================================================
 * GET GALLERY URL - RETORNAR URL DA GALERIA
 * =====================================================
 * 
 * Retorna a URL da galeria apropriada baseada na origem.
 * 
 * @param {string|null} source - Origem manual ('ar'|'vr'), ou null para detectar
 * @returns {string} URL completa da galeria
 * 
 * EXEMPLOS:
 * - source = 'ar'  → Retorna: 'https://.../galeria.html'
 * - source = 'vr'  → Retorna: 'https://.../galeria-vr.html'
 * - source = null  → Detecta automaticamente da URL
 * 
 * CONFIGURAÇÃO:
 * Base URL está hardcoded para GitHub Pages.
 * Para desenvolvimento local, modificar baseURL.
 */
function getGalleryURL(source = null) {
  // Usar source fornecido ou detectar automaticamente
  const from = source || getNavigationSource();
  
  // Base URL do projeto (GitHub Pages)
  const baseURL = 'https://rodrigorez.github.io/zonas11/galerias/';
  
  // Retornar URL apropriada
  if (from === 'vr') {
    console.log(`🔙 Navigation Helper: URL galeria VR → ${baseURL}galeria-vr.html`);
    return baseURL + 'galeria-vr.html';
  }
  
  // Default: AR
  console.log(`🔙 Navigation Helper: URL galeria AR → ${baseURL}galeria.html`);
  return baseURL + 'galeria.html';
}

/**
 * =====================================================
 * ADD SOURCE PARAM - ADICIONAR PARÂMETRO À URL
 * =====================================================
 * 
 * Adiciona o parâmetro 'from=' a uma URL, preservando
 * o contexto de navegação.
 * 
 * @param {string} url - URL base (relativa ou absoluta)
 * @param {string|null} source - Origem manual ('ar'|'vr'), ou null para detectar
 * @returns {string} URL com parâmetro ?from=
 * 
 * EXEMPLOS:
 * - url = 'obra1.html', source = 'ar'
 *   → Retorna: 'obra1.html?from=ar'
 * 
 * - url = 'index2.html?other=value', source = 'vr'
 *   → Retorna: 'index2.html?other=value&from=vr'
 * 
 * - url = 'https://example.com/page', source = null (detecta 'ar')
 *   → Retorna: 'https://example.com/page?from=ar'
 * 
 * INTELIGÊNCIA:
 * - Detecta se URL já tem parâmetros (?) → usa &
 * - Se não tem parâmetros → usa ?
 * - Preserva parâmetros existentes
 */
function addSourceParam(url, source = null) {
  // Usar source fornecido ou detectar automaticamente
  const from = source || getNavigationSource();
  
  // Verificar se URL já contém parâmetros
  if (url.includes('?')) {
    // URL já tem parâmetros, usar &
    const newURL = `${url}&from=${from}`;
    console.log(`🔗 Navigation Helper: Adicionado &from=${from} → ${newURL}`);
    return newURL;
  }
  
  // URL não tem parâmetros, usar ?
  const newURL = `${url}?from=${from}`;
  console.log(`🔗 Navigation Helper: Adicionado ?from=${from} → ${newURL}`);
  return newURL;
}

/**
 * =====================================================
 * GET MUNDO URL - URL DO MUNDO COM PARÂMETRO
 * =====================================================
 * 
 * Helper específico para retornar URL de mundos VR
 * com parâmetro de origem.
 * 
 * @param {number} mundoNum - Número do mundo (2-9)
 * @param {string|null} source - Origem manual ('ar'|'vr'), ou null para detectar
 * @returns {string} URL completa do mundo com parâmetro
 * 
 * EXEMPLOS:
 * - mundoNum = 2, source = 'ar'
 *   → Retorna: 'https://.../index2.html?from=ar'
 * 
 * - mundoNum = 5, source = 'vr'
 *   → Retorna: 'https://.../index5.html?from=vr'
 * 
 * VALIDAÇÃO:
 * Se mundoNum inválido (< 2 ou > 9), retorna null e loga erro.
 */
function getMundoURL(mundoNum, source = null) {
  // Validar número do mundo
  if (mundoNum < 2 || mundoNum > 9) {
    console.error(`❌ Navigation Helper: Número de mundo inválido: ${mundoNum} (deve ser 2-9)`);
    return null;
  }
  
  // Usar source fornecido ou detectar automaticamente
  const from = source || getNavigationSource();
  
  // Base URL do projeto
  const baseURL = 'https://rodrigorez.github.io/zonas11/galerias/';
  
  // Construir URL
  const mundoURL = `${baseURL}index${mundoNum}.html?from=${from}`;
  console.log(`🌍 Navigation Helper: URL mundo ${mundoNum} → ${mundoURL}`);
  
  return mundoURL;
}

/**
 * =====================================================
 * GET OBRA URL - URL DA OBRA COM PARÂMETRO
 * =====================================================
 * 
 * Helper específico para retornar URL de obras
 * com parâmetro de origem.
 * 
 * @param {number} obraNum - Número da obra (1-55)
 * @param {string|null} source - Origem manual ('ar'|'vr'), ou null para detectar
 * @returns {string} URL completa da obra com parâmetro
 * 
 * EXEMPLOS:
 * - obraNum = 1, source = 'ar'
 *   → Retorna: 'https://.../obra1.html?from=ar'
 * 
 * - obraNum = 25, source = 'vr'
 *   → Retorna: 'https://.../obra25.html?from=vr'
 * 
 * VALIDAÇÃO:
 * Se obraNum inválido (< 1 ou > 55), retorna null e loga erro.
 */
function getObraURL(obraNum, source = null) {
  // Validar número da obra
  if (obraNum < 1 || obraNum > 55) {
    console.error(`❌ Navigation Helper: Número de obra inválido: ${obraNum} (deve ser 1-55)`);
    return null;
  }
  
  // Usar source fornecido ou detectar automaticamente
  const from = source || getNavigationSource();
  
  // Base URL do projeto
  const baseURL = 'https://rodrigorez.github.io/zonas11/galerias/';
  
  // Construir URL
  const obraURL = `${baseURL}obra${obraNum}.html?from=${from}`;
  console.log(`🖼️ Navigation Helper: URL obra ${obraNum} → ${obraURL}`);
  
  return obraURL;
}

/**
 * =====================================================
 * INICIALIZAÇÃO
 * =====================================================
 */

// Log de carregamento
console.log('📦 Navigation Helper V1.0.0: Carregado com sucesso');
console.log('📋 Funções disponíveis:');
console.log('   - getNavigationSource()');
console.log('   - getGalleryURL(source)');
console.log('   - addSourceParam(url, source)');
console.log('   - getMundoURL(mundoNum, source)');
console.log('   - getObraURL(obraNum, source)');

// Detectar e logar origem automaticamente ao carregar
const currentSource = getNavigationSource();
console.log(`✅ Navigation Helper: Contexto atual → ${currentSource.toUpperCase()}`);
