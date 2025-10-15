// 🎯 SISTEMA DE DETECÇÃO DE PLATAFORMAS - ZONAS 11
// Sistema modular e extensível para múltiplas plataformas de mídia
// Mantém YouTube como padrão (83% das obras) e permite fácil expansão

class PlatformDetector {
  constructor() {
    this.platforms = {
      // 📹 YouTube (PADRÃO LEGADO - 83% das obras)
      youtube: {
        patterns: [
          /youtu\.be\/([^?]+)/,                    // youtu.be/VIDEO_ID
          /youtube\.com\/watch\?v=([^&]+)/,        // youtube.com/watch?v=VIDEO_ID
          /youtube\.com\/embed\/([^?]+)/           // youtube.com/embed/VIDEO_ID
        ],
        embed: (id) => `https://www.youtube.com/embed/${id}?controls=1&autoplay=1`,
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        allowfullscreen: true,
        priority: 1 // Alta prioridade (padrão)
      },

      // 🎨 p5.js Editor (EXPANSÃO ATUAL - 17% das obras)
      p5js: {
        patterns: [
          /editor\.p5js\.org\/.*\/full\/([^?]+)/    // editor.p5js.org/user/full/SKETCH_ID
        ],
        embed: (url) => url, // Usa URL direta para p5.js
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        allowfullscreen: true,
        priority: 2
      },

      // 🔧 TEMPLATES PARA FUTURAS PLATAFORMAS
      
      // Vimeo (preparado para expansão)
      vimeo: {
        patterns: [
          /vimeo\.com\/([0-9]+)(?:\/[a-zA-Z0-9]+)?/,  // Suporta URLs com token adicional
          /player\.vimeo\.com\/video\/([0-9]+)/
        ],
        embed: (id) => `https://player.vimeo.com/video/${id}?autoplay=1&color=FF5722`,
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        allowfullscreen: true,
        priority: 3
      },

      // OpenProcessing (preparado para expansão)
      openprocessing: {
        patterns: [
          /openprocessing\.org\/sketch\/([0-9]+)/
        ],
        embed: (id) => `https://openprocessing.org/sketch/${id}/embed/`,
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        allowfullscreen: true,
        priority: 4
      },

      // Shadertoy (preparado para expansão)
      shadertoy: {
        patterns: [
          /shadertoy\.com\/view\/([a-zA-Z0-9]+)/
        ],
        embed: (id) => `https://shadertoy.com/embed/${id}?gui=false&paused=false`,
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        allowfullscreen: true,
        priority: 5
      }
    };
  }

  /**
   * Detecta a plataforma da URL fornecida
   * @param {string} url - URL da mídia
   * @returns {Object} - Objeto com plataforma, config e match
   */
  detectPlatform(url) {
    const platforms = Object.entries(this.platforms)
      .sort(([,a], [,b]) => a.priority - b.priority); // Ordena por prioridade

    for (const [platform, config] of platforms) {
      for (const pattern of config.patterns) {
        const match = url.match(pattern);
        if (match) {
          console.log(`🎯 Plataforma detectada: ${platform}`, { url, match: match[1] });
          return { platform, config, match };
        }
      }
    }
    
    // Fallback para YouTube (mantém compatibilidade com legado)
    console.log('⚠️ Plataforma não detectada, usando YouTube como padrão', { url });
    return { 
      platform: 'youtube', 
      config: this.platforms.youtube, 
      match: null 
    };
  }

  /**
   * Gera iframe HTML com parâmetros específicos da plataforma
   * @param {string} url - URL da mídia
   * @param {string} title - Título da obra
   * @returns {string} - HTML do iframe
   */
  generateIframe(url, title) {
    const detection = this.detectPlatform(url);
    const { platform, config, match } = detection;
    
    let src;
    
    // Lógica específica por plataforma
    switch (platform) {
      case 'youtube':
        src = match ? config.embed(match[1]) : url;
        break;
      case 'p5js':
        src = config.embed(url); // p5.js usa URL completa, não apenas ID
        break;
      case 'vimeo':
      case 'openprocessing':
      case 'shadertoy':
        src = match ? config.embed(match[1]) : config.embed(url);
        break;
      default:
        src = url; // Fallback para URL direta
    }

    // Template HTML otimizado para performance
    return `<iframe 
      src="${src}" 
      allow="${config.allow}" 
      ${config.allowfullscreen ? 'allowfullscreen' : ''} 
      title="${title}"
      loading="lazy"
      data-platform="${platform}">
    </iframe>`;
  }

  /**
   * Inicializa automaticamente todos os containers de vídeo na página
   * Busca por elementos com classe 'video-container' ou ID 'video-container'
   */
  initializeAll() {
    const containers = document.querySelectorAll('[data-url], .video-container[data-url], #video-container[data-url]');
    
    containers.forEach(container => {
      const url = container.dataset.url;
      const titleElement = document.querySelector('.titulo, .title, h1, h2');
      const title = titleElement ? titleElement.textContent : 'Obra de Arte';
      
      if (url) {
        container.innerHTML = this.generateIframe(url, title);
        console.log(`✅ Container inicializado:`, { url, title, platform: this.detectPlatform(url).platform });
      }
    });
  }

  /**
   * Adiciona nova plataforma ao sistema (extensibilidade)
   * @param {string} name - Nome da plataforma
   * @param {Object} config - Configuração da plataforma
   */
  addPlatform(name, config) {
    this.platforms[name] = {
      priority: Object.keys(this.platforms).length + 1,
      ...config
    };
    console.log(`🆕 Nova plataforma adicionada: ${name}`);
  }
}

// 🚀 INICIALIZAÇÃO GLOBAL
// Disponibiliza globalmente para uso em qualquer página
window.PlatformDetector = PlatformDetector;

// Auto-inicialização quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  const detector = new PlatformDetector();
  detector.initializeAll();
});

// 📊 ESTATÍSTICAS DE USO (console)
console.log('🎯 Sistema de Detecção de Plataformas carregado');
console.log('📊 Plataformas suportadas:', Object.keys(new PlatformDetector().platforms));