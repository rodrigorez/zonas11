/**
 * MUNDO.JS - Sistema de Mundos VR Zonas 11
 * Responsável pela lógica específica dos mundos virtuais 3D
 * 
 * Funcionalidades:
 * - Renderização de ambientes VR
 * - Posicionamento de obras no espaço 3D
 * - Sistema de iluminação e atmosfera
 * - Navegação entre obras no mundo
 * - Controles de câmera e movimento
 * - Sistema de animações ambientais
 * 
 * @version 1.0.0
 * @author Zonas 11 Team
 */

// ✅ CONFIGURAÇÃO DO MUNDO VR
let configMundo = {
  // Iluminação
  ambientLight: '#404040',
  directionalLight: '#ffffff',
  lightIntensity: 1.0,
  
  // Câmera
  cameraPosition: '0 1.6 3',
  cameraRotation: '0 0 0',
  fov: 80,
  
  // Física e movimentação
  gravity: -9.8,
  speed: 3.0,
  jumpHeight: 5.0,
  
  // Atmosfera
  fog: true,
  fogColor: '#7EC0EE',
  fogNear: 5,
  fogFar: 30,
  
  // Background
  backgroundColor: '#87CEEB',
  
  // 🌐 URL BASE PARA DEPLOY
  baseURL: 'https://rodrigorez.github.io/zonas11/'
};

// 🌐 FUNÇÃO PARA GERAR URLs ABSOLUTAS (OTIMIZADA PARA DOCS/)
function gerarURLAbsolutaMundo(caminhoRelativo) {
  // Remove qualquer prefixo relativo
  let caminhoLimpo = caminhoRelativo.replace(/^(\.\.\/|\.\/)*/, '');
  
  // Se já é uma URL absoluta, retorna como está
  if (caminhoRelativo.startsWith('http')) {
    return caminhoRelativo;
  }
  
  // Garante que os assets estejam em assets/ (dentro de docs/)
  if (caminhoLimpo.includes('assets/3d/') || caminhoLimpo.includes('assets/img/')) {
    // Já está no formato correto
  } else if (caminhoLimpo.startsWith('models/')) {
    caminhoLimpo = caminhoLimpo.replace('models/', 'assets/3d/');
  } else if (caminhoLimpo.includes('.glb')) {
    caminhoLimpo = 'assets/3d/' + caminhoLimpo;
  }
  
  // Combina com base URL (docs/ é a raiz do servidor)
  const urlFinal = configMundo.baseURL + caminhoLimpo;
  console.log(`🔗 URL mundo gerada: ${caminhoRelativo} → ${urlFinal}`);
  return urlFinal;
}

// ✅ SISTEMA DE POSICIONAMENTO DE OBRAS
class PosicionadorObras {
  constructor() {
    this.posicoes = [];
    this.obrasPosicionadas = new Map();
  }
  
  // Gera posições em grid para as obras
  gerarGrid(numeroObras, espacamento = 4) {
    const posicoes = [];
    const cols = Math.ceil(Math.sqrt(numeroObras));
    const rows = Math.ceil(numeroObras / cols);
    
    for (let i = 0; i < numeroObras; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      const x = (col - (cols - 1) / 2) * espacamento;
      const z = (row - (rows - 1) / 2) * espacamento * -1;
      const y = 1.5; // Altura padrão
      
      posicoes.push({ x, y, z, rotacao: '0 0 0' });
    }
    
    console.log(`🏗️ Grid gerado: ${cols}x${rows} para ${numeroObras} obras`);
    return posicoes;
  }
  
  // Posiciona obra no mundo
  posicionarObra(obraData, index, posicao) {
    console.log(`📍 Posicionando obra ${index + 1}: ${obraData.nomeObra}`);
    console.log(`   - Posição: ${posicao.x}, ${posicao.y}, ${posicao.z}`);
    
    this.obrasPosicionadas.set(index, {
      ...obraData,
      posicao: posicao,
      index: index
    });
    
    return posicao;
  }
}

// ✅ SISTEMA DE ILUMINAÇÃO DINÂMICA
class SistemaIluminacao {
  constructor() {
    this.luzes = [];
  }
  
  // Configura iluminação ambiente
  configurarIluminacaoAmbiente(cena) {
    // Luz ambiente
    const ambientLight = document.createElement('a-light');
    ambientLight.setAttribute('type', 'ambient');
    ambientLight.setAttribute('color', configMundo.ambientLight);
    ambientLight.setAttribute('intensity', '0.4');
    cena.appendChild(ambientLight);
    
    // Luz direcional (sol)
    const directionalLight = document.createElement('a-light');
    directionalLight.setAttribute('type', 'directional');
    directionalLight.setAttribute('position', '5 10 5');
    directionalLight.setAttribute('color', configMundo.directionalLight);
    directionalLight.setAttribute('intensity', configMundo.lightIntensity);
    directionalLight.setAttribute('cast-shadow', 'true');
    cena.appendChild(directionalLight);
    
    console.log('💡 Sistema de iluminação configurado');
    return { ambientLight, directionalLight };
  }
  
  // Adiciona iluminação pontual para obras
  adicionarLuzObra(posicao, cor = '#ffffff', intensidade = 0.8) {
    const light = document.createElement('a-light');
    light.setAttribute('type', 'point');
    light.setAttribute('position', `${posicao.x} ${posicao.y + 2} ${posicao.z}`);
    light.setAttribute('color', cor);
    light.setAttribute('intensity', intensidade);
    light.setAttribute('distance', '8');
    light.setAttribute('decay', '2');
    
    return light;
  }
}

// ✅ SISTEMA DE CRIAÇÃO DE OBRAS NO MUNDO
function criarObraNoMundo(obraData, posicao, index) {
  console.log(`🎨 Criando obra no mundo: ${obraData.nomeObra}`);
  
  // Container da obra
  const obraContainer = document.createElement('a-entity');
  obraContainer.setAttribute('id', `obra-${index}`);
  obraContainer.setAttribute('position', `${posicao.x} ${posicao.y} ${posicao.z}`);
  obraContainer.setAttribute('rotation', obraData.rotacao || '0 0 0');
  
  // Modelo 3D da obra
  const modelo = document.createElement('a-entity');
  // 🌐 USA URL ABSOLUTA DIRETA (SERVIDOR DOCS/)
  const urlModeloObra = gerarURLAbsolutaMundo(obraData.modeloObra);
  modelo.setAttribute('gltf-model', urlModeloObra);
  modelo.setAttribute('scale', obraData.escala || '1 1 1');
  modelo.setAttribute('class', 'obra-interativa');
  modelo.setAttribute('data-obra-id', obraData.idObra);
  
  console.log(`🎯 Modelo obra ${index + 1}: ${urlModeloObra}`);
  console.log(`📁 Servidor docs/: Caminhos absolutos otimizados`);

  // Animação de rotação se especificada
  if (obraData.velocidadeAnimacao && parseFloat(obraData.velocidadeAnimacao) > 0) {
    const duracao = 10000 / parseFloat(obraData.velocidadeAnimacao);
    modelo.setAttribute('animation', 
      `property: rotation; to: 0 360 0; loop: true; dur: ${duracao}; easing: linear`);
  }
  
  // Área de clique para interação
  const areaClique = document.createElement('a-box');
  areaClique.setAttribute('width', '2');
  areaClique.setAttribute('height', '3');
  areaClique.setAttribute('depth', '2');
  areaClique.setAttribute('material', 'opacity: 0; transparent: true');
  areaClique.setAttribute('class', 'obra-clickable');
  
  // Evento de clique
  areaClique.addEventListener('click', () => {
    console.log(`🔥 Obra clicada: ${obraData.nomeObra}`);
    // 🌐 USA URL ABSOLUTA PARA NAVEGAÇÃO
    const urlObraAbsoluta = gerarURLAbsolutaMundo(obraData.urlObra);
    console.log(`🚀 Navegando para obra: ${urlObraAbsoluta}`);
    navegarParaObra(urlObraAbsoluta);
  });
  
  // Hover effect
  areaClique.addEventListener('mouseenter', () => {
    modelo.setAttribute('scale', '1.1 1.1 1.1');
    console.log(`👆 Hover na obra: ${obraData.nomeObra}`);
  });
  
  areaClique.addEventListener('mouseleave', () => {
    modelo.setAttribute('scale', obraData.escala || '1 1 1');
  });
  
  // Monta estrutura
  obraContainer.appendChild(modelo);
  obraContainer.appendChild(areaClique);
  
  console.log(`✅ Obra ${index + 1} criada na posição (${posicao.x}, ${posicao.y}, ${posicao.z})`);
  return obraContainer;
}

// ✅ SISTEMA DE ATMOSFERA E AMBIENTE
function configurarAtmosfera(cena) {
  // Sky
  const sky = document.createElement('a-sky');
  sky.setAttribute('color', configMundo.backgroundColor);
  if (configMundo.fog) {
    sky.setAttribute('material', `fog: true; fogColor: ${configMundo.fogColor}; fogNear: ${configMundo.fogNear}; fogFar: ${configMundo.fogFar}`);
  }
  cena.appendChild(sky);
  
  // Plano do chão
  const ground = document.createElement('a-plane');
  ground.setAttribute('position', '0 0 0');
  ground.setAttribute('rotation', '-90 0 0');
  ground.setAttribute('width', '50');
  ground.setAttribute('height', '50');
  ground.setAttribute('color', '#2F4F4F');
  ground.setAttribute('material', 'roughness: 0.8; metalness: 0.1');
  ground.setAttribute('shadow', 'receive: true');
  cena.appendChild(ground);
  
  console.log('🌍 Atmosfera do mundo configurada');
  return { sky, ground };
}

// ✅ NAVEGAÇÃO PARA OBRA
function navegarParaObra(urlObra) {
  console.log(`🚀 Navegando para obra: ${urlObra}`);
  window.location.href = urlObra;
}

// ✅ SISTEMA DE CÂMERA E CONTROLES
function configurarCamera(cena) {
  const camera = document.createElement('a-camera');
  camera.setAttribute('position', configMundo.cameraPosition);
  camera.setAttribute('rotation', configMundo.cameraRotation);
  camera.setAttribute('fov', configMundo.fov);
  camera.setAttribute('wasd-controls', 'enabled: true');
  camera.setAttribute('look-controls', 'enabled: true');
  camera.setAttribute('cursor', 'rayOrigin: mouse');
  
  cena.appendChild(camera);
  console.log('📷 Câmera configurada');
  return camera;
}

// ✅ INICIALIZAÇÃO DO MUNDO
async function inicializarMundo(obrasData, configPersonalizada = {}) {
  console.log('🌍 === INICIANDO CARREGAMENTO DO MUNDO ===');
  
  // Aplica configurações personalizadas
  configMundo = { ...configMundo, ...configPersonalizada };
  
  // Aguarda A-Frame estar pronto
  function waitForAFrame() {
    return new Promise((resolve) => {
      function checkAFrame() {
        if (typeof AFRAME !== 'undefined' && document.querySelector('a-scene')) {
          const scene = document.querySelector('a-scene');
          if (scene.hasLoaded) {
            resolve();
          } else {
            scene.addEventListener('loaded', resolve, { once: true });
          }
        } else {
          setTimeout(checkAFrame, 100);
        }
      }
      checkAFrame();
    });
  }
  
  await waitForAFrame();
  
  const cena = document.querySelector('a-scene');
  
  // Configura atmosfera
  configurarAtmosfera(cena);
  
  // Configura iluminação
  const sistemaLuz = new SistemaIluminacao();
  sistemaLuz.configurarIluminacaoAmbiente(cena);
  
  // Configura câmera
  configurarCamera(cena);
  
  // Posiciona obras
  const posicionador = new PosicionadorObras();
  const posicoesGrid = posicionador.gerarGrid(obrasData.length);
  
  obrasData.forEach((obra, index) => {
    const posicao = posicoesGrid[index];
    posicionador.posicionarObra(obra, index, posicao);
    
    const obraElement = criarObraNoMundo(obra, posicao, index);
    cena.appendChild(obraElement);
    
    // Adiciona luz para a obra
    const luzObra = sistemaLuz.adicionarLuzObra(posicao, '#ffffff', 0.6);
    cena.appendChild(luzObra);
  });
  
  console.log('✅ Mundo VR totalmente carregado!');
  console.log(`📊 Total de obras posicionadas: ${obrasData.length}`);
}

// ✅ EXPORTA FUNCIONALIDADES DO MUNDO
window.MundoVR = {
  inicializar: inicializarMundo,
  configurarAtmosfera: configurarAtmosfera,
  criarObra: criarObraNoMundo,
  navegarParaObra: navegarParaObra,
  PosicionadorObras: PosicionadorObras,
  SistemaIluminacao: SistemaIluminacao,
  config: configMundo
};