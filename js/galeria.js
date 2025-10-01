/**
 * GALERIA.JS - Sistema de Galeria AR/VR Zonas 11
 * Responsável pela lógica específica das galerias de arte
 * 
 * Funcionalidades:
 * - Configuração de marcadores AR
 * - Sistema de cores aleatórias para mundos
 * - Navegação entre marcadores e mundos
 * - Carregamento dinâmico de configurações
 * 
 * @version 1.0.0
 * @author Zonas 11 Team
 */

// ✅ CONFIGURAÇÃO INICIAL PADRÃO
let currentConfig = {
  // Caixas de colisão (precisão 5 casas decimais)
  boxWidth: 2.50000,
  boxHeight: 3.00000,
  boxDepth: 2.50000,
  // Configurações AR
  detectionDistance: 2.0,
  globalScale: 1.0,
  // Interface
  primaryColor: '#FF5722',
  secondaryColor: '#2196F3',
  // 🌐 URL BASE PARA DEPLOY (SOMENTE DOCS/)
  baseURL: 'https://rodrigorez.github.io/zonas11/'
};

// ✅ SISTEMA DE DEBUG VISUAL
let debugMode = false;

// 🌐 FUNÇÃO PARA GERAR URLs ABSOLUTAS (OTIMIZADA PARA DOCS/)
function gerarURLAbsoluta(caminhoRelativo) {
  // Remove qualquer prefixo relativo
  let caminhoLimpo = caminhoRelativo.replace(/^(\.\.\/|\.\/)*/, '');
  
  // Se já é uma URL absoluta, retorna como está
  if (caminhoRelativo.startsWith('http')) {
    return caminhoRelativo;
  }
  
  // DETECTA AMBIENTE: Local vs Deploy
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' ||
                  window.location.protocol === 'file:';
  
  if (isLocal) {
    // Ambiente local: usa caminhos relativos
    console.log(`🔗 URL local gerada: ${caminhoRelativo} → ${caminhoLimpo}`);
    return caminhoLimpo;
  } else {
    // Ambiente deploy: usa URLs absolutas
    const urlFinal = currentConfig.baseURL + caminhoLimpo;
    console.log(`🔗 URL absoluta gerada: ${caminhoRelativo} → ${urlFinal}`);
    return urlFinal;
  }
}

// ✅ GERAÇÃO DE CORES SÓLIDAS ALEATÓRIAS DETERMINÍSTICAS
function gerarCorSolidaAleatoria(indice) {
  // Paleta de cores sólidas vibrantes (determinista baseada no índice)
  const coresSolidas = [
    '#FF3030', // Vermelho vibrante
    '#00FF00', // Verde néon
    '#0080FF', // Azul elétrico
    '#FF8000', // Laranja brilhante
    '#FF00FF', // Magenta
    '#00FFFF', // Ciano
    '#FFFF00', // Amarelo
    '#8000FF', // Roxo
    '#FF0080', // Rosa choque
    '#80FF00', // Verde lima
    '#FF4000', // Vermelho alaranjado
    '#0040FF'  // Azul cobalto
  ];
  
  // Retorna cor baseada no índice (sempre a mesma cor para o mesmo mundo)
  const cor = coresSolidas[indice % coresSolidas.length];
  console.log(`🎨 Mundo ${indice + 1}: Cor gerada = ${cor}`);
  return cor;
}

// ✅ FUNÇÃO PARA CARREGAR CONFIGURAÇÃO DO SERVIDOR
async function loadConfigFromServerSync() {
  // 📝 Para ambiente local (file://), pula tentativa de API
  if (window.location.protocol === 'file:') {
    console.log('📝 Ambiente local detectado - usando configuração padrão');
    return false;
  }
  
  try {
    console.log('🔄 Fazendo requisição para /api/config...');
    const response = await fetch('/api/config');
    const result = await response.json();
    
    if (result.success) {
      const serverConfig = result.config;
      console.log('📦 Configuração recebida do servidor:', serverConfig);
      
      // ✅ ATUALIZA currentConfig com valores do servidor (JSON)
      currentConfig.boxWidth = serverConfig.configuracaoAR?.tamanhoMarcadorLargura || serverConfig.configuracaoAR?.tamanhoMarcador || 1.0;
      currentConfig.boxHeight = serverConfig.configuracaoAR?.tamanhoMarcadorAltura || serverConfig.configuracaoAR?.tamanhoMarcador || 1.0;
      currentConfig.boxDepth = serverConfig.configuracaoAR?.tamanhoMarcadorProfundidade || serverConfig.configuracaoAR?.tamanhoMarcador || 1.0;
      currentConfig.detectionDistance = serverConfig.configuracaoAR?.distanciaDeteccao || 2.0;
      currentConfig.primaryColor = serverConfig.interface?.corPrimaria || '#FF5722';
      currentConfig.secondaryColor = serverConfig.interface?.corSecundaria || '#2196F3';
      
      console.log('✅ currentConfig atualizada com valores do JSON:', currentConfig);
      
      return true;
    } else {
      console.warn('⚠️ Resposta da API sem sucesso:', result);
      return false;
    }
  } catch (error) {
    console.warn('⚠️ Erro ao carregar config do servidor:', error.message);
    console.warn('🔄 Usando valores padrão');
    return false;
  }
}

// ✅ CRIAÇÃO DE MARCADORES AR
function criarMarcadoresAR(marcadores, container) {
  if (!Array.isArray(marcadores)) {
    console.error("❌ Erro: Array MARCADORES não encontrado ou inválido.");
    return;
  }

  marcadores.forEach((m, index) => {
    const markerEl = document.createElement('a-marker');
    markerEl.setAttribute('id', `marker-${index}`);
    
    // Define o tipo de marcador
    if (['hiro', 'kanji'].includes(m.tipoMarcador)) {
      markerEl.setAttribute('preset', m.tipoMarcador);
    } else if (m.tipoMarcador.startsWith('barcode-')) {
      const value = m.tipoMarcador.split('-')[1];
      markerEl.setAttribute('type', 'barcode');
      markerEl.setAttribute('value', value);
    } else {
      console.warn(`⚠️ Tipo de marcador desconhecido: ${m.tipoMarcador}`);
      return;
    }

    // ✅ CONTAINER PRINCIPAL
    const containerEl = document.createElement('a-entity');
    containerEl.setAttribute('id', `container-${index}`);
    
    // ✅ MODELO 3D COM COR SÓLIDA ALEATÓRIA
    const modelEl = document.createElement('a-entity');
    // 🌐 USA URL ABSOLUTA DIRETA (SERVIDOR DOCS/)
    const urlModelo = gerarURLAbsoluta(m.modelo3D);
    modelEl.setAttribute('gltf-model', urlModelo);
    modelEl.setAttribute('scale', `${m.escalaModelo} ${m.escalaModelo} ${m.escalaModelo}`);
    modelEl.setAttribute('data-original-scale', m.escalaModelo);
    modelEl.setAttribute('id', `model-${index}`);
    
    console.log(`🎯 Modelo ${index + 1}: ${urlModelo}`);
    console.log(`📁 Servidor docs/: Caminhos absolutos otimizados`);
    
    // 🎨 GERA COR SÓLIDA ALEATÓRIA PARA ESTE MUNDO
    const corSolida = gerarCorSolidaAleatoria(index);
    
    // Aguarda o modelo carregar para aplicar a cor
    modelEl.addEventListener('model-loaded', () => {
      console.log(`🎨 Aplicando cor ${corSolida} ao modelo ${index + 1}`);
      
      // Aplica cor sólida a todo o modelo
      const mesh = modelEl.getObject3D('mesh');
      if (mesh) {
        mesh.traverse((child) => {
          if (child.isMesh) {
            // Cria material com cor sólida
            child.material = new THREE.MeshStandardMaterial({
              color: corSolida,
              metalness: 0.3,
              roughness: 0.7
            });
            console.log(`  ✅ Cor aplicada ao mesh: ${child.name || 'unnamed'}`);
          }
        });
      } else {
        console.warn(`⚠️ Mesh não encontrado para modelo ${index + 1}`);
      }
    });
    
    // ✅ ÁREA DE CLIQUE INVISÍVEL
    const clickAreaEl = document.createElement('a-box');
    
    console.log(`🎯 Criando caixa de clique ${index + 1}:`);
    console.log(`   - Aplicando width: ${currentConfig.boxWidth}`);
    console.log(`   - Aplicando height: ${currentConfig.boxHeight}`);
    console.log(`   - Aplicando depth: ${currentConfig.boxDepth}`);
    
    clickAreaEl.setAttribute('width', currentConfig.boxWidth);
    clickAreaEl.setAttribute('height', currentConfig.boxHeight);
    clickAreaEl.setAttribute('depth', currentConfig.boxDepth);
    clickAreaEl.setAttribute('material', 'opacity: 0; transparent: true');
    clickAreaEl.setAttribute('class', 'clickable');
    clickAreaEl.setAttribute('id', `clickarea-${index}`);
    
    // ✅ ANIMAÇÃO DE ROTAÇÃO se ativada
    if (m.animacaoRotacao === 'true') {
      const duracao = 5000 / (parseFloat(m.velocidadeRotacao) || 1.0);
      modelEl.setAttribute('animation', `property: rotation; to: 0 360 0; loop: true; dur: ${duracao}; easing: linear`);
    }
    
    // ✅ EVENTO DE CLIQUE COM FEEDBACK VISUAL
    clickAreaEl.addEventListener('click', () => {
      console.log(`🔥 CLIQUE DETECTADO! Marcador ${index + 1}: ${m.nomeMarcador}`);
      console.log(`📍 Tipo: ${m.tipoMarcador} | Modelo: ${urlModelo}`);
      
      // FEEDBACK VISUAL IMEDIATO
      modelEl.setAttribute('animation__click', 'property: scale; to: 1.3 1.3 1.3; dur: 200; easing: easeOutQuad');
      
      // Efeito de pulso
      setTimeout(() => {
        modelEl.setAttribute('animation__reset', `property: scale; to: ${m.escalaModelo} ${m.escalaModelo} ${m.escalaModelo}; dur: 200; easing: easeInQuad`);
      }, 200);
      
      // Navegação após feedback visual
      setTimeout(() => {
        const urlMundo = gerarURLAbsoluta(m.urlMundo);
        console.log(`🚀 Navegando para: ${urlMundo}`);
        navegarParaMundo(urlMundo);
      }, 500);
    });
    
    // Hover effect para feedback visual
    clickAreaEl.addEventListener('mouseenter', () => {
      modelEl.setAttribute('animation__hover', `property: scale; to: ${parseFloat(m.escalaModelo) * 1.1} ${parseFloat(m.escalaModelo) * 1.1} ${parseFloat(m.escalaModelo) * 1.1}; dur: 150`);
    });
    
    clickAreaEl.addEventListener('mouseleave', () => {
      modelEl.setAttribute('animation__unhover', `property: scale; to: ${m.escalaModelo} ${m.escalaModelo} ${m.escalaModelo}; dur: 150`);
    });
    
    // ✅ MONTAGEM DA ESTRUTURA
    containerEl.appendChild(modelEl);
    containerEl.appendChild(clickAreaEl);
    markerEl.appendChild(containerEl);
    container.appendChild(markerEl);
    
    console.log(`✅ Marcador ${index + 1} (${m.nomeMarcador}) - CRIADO:`);
    console.log(`   - Container ID: container-${index}`);
    console.log(`   - Modelo ID: model-${index}`);
    console.log(`   - Clique ID: clickarea-${index}`);
    console.log(`   🎨 Cor do mundo: ${corSolida}`);
    console.log(`➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️➡️`);
  });
}

// ✅ FUNÇÃO DE NAVEGAÇÃO OTIMIZADA
function navegarParaMundo(url) {
  window.location.href = url;
}

// ✅ ATUALIZAÇÃO DE STATUS DE CARREGAMENTO
function updateLoadingStatus(message) {
  const loadingDetails = document.querySelector('.loading-details');
  if (loadingDetails) {
    loadingDetails.textContent = message;
    console.log('📱 Status:', message);
  }
}

// ✅ INICIALIZAÇÃO DA GALERIA
async function inicializarGaleria(marcadores) {
  console.log('🚀 === INICIANDO CARREGAMENTO DA GALERIA ===');
  
  // STEP 1: Aguarda A-Frame estar pronto
  console.log('🔧 STEP 1: Aguardando A-Frame carregar...');
  updateLoadingStatus('Carregando bibliotecas AR/VR...');
  
  function waitForAFrameComplete() {
    return new Promise((resolve) => {
      function checkAFrame() {
        if (typeof AFRAME !== 'undefined' && 
            AFRAME.components && 
            AFRAME.components['gltf-model'] &&
            AFRAME.components.material &&
            document.querySelector('a-scene')) {
          
          const scene = document.querySelector('a-scene');
          
          if (scene.hasLoaded) {
            console.log('✅ A-Frame completamente carregado!');
            resolve();
            return;
          }
          
          scene.addEventListener('loaded', () => {
            console.log('✅ A-Frame scene loaded!');
            setTimeout(resolve, 200);
          }, { once: true });
          
        } else {
          console.log('⏳ Aguardando A-Frame dependencies...');
          setTimeout(checkAFrame, 100);
        }
      }
      
      checkAFrame();
    });
  }
  
  await waitForAFrameComplete();
  
  // STEP 2: Carrega configuração
  console.log('📡 STEP 2: Carregando configuração...');
  updateLoadingStatus('Carregando configurações personalizadas...');
  const configLoaded = await loadConfigFromServerSync();
  
  if (configLoaded) {
    console.log('✅ Configuração carregada com sucesso!');
  } else {
    console.log('⚠️ Usando configuração padrão');
  }
  
  // STEP 3: Cria marcadores
  console.log('🌿 STEP 3: Criando marcadores AR...');
  updateLoadingStatus('Criando elementos 3D...');
  
  const container = document.querySelector('#markers-container');
  criarMarcadoresAR(marcadores, container);
  
  // STEP 4: Finaliza carregamento
  console.log('✅ === CARREGAMENTO CONCLUÍDO ===');
  updateLoadingStatus('Finalizando...');
  
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    setTimeout(() => {
      loadingIndicator.classList.add('hidden');
      console.log('✅ Indicador de carregamento removido');
    }, 500);
  }
  
  console.log('🎉 Galeria totalmente carregada e funcionando!');
}

// ✅ EXPORTA FUNÇÃO PRINCIPAL
window.GaleriaAR = {
  inicializar: inicializarGaleria,
  gerarCor: gerarCorSolidaAleatoria,
  navegarPara: navegarParaMundo,
  currentConfig: currentConfig
};