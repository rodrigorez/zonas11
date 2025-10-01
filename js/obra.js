/**
 * OBRA.JS - Sistema de Obras Zonas 11
 * Responsável pela lógica específica das páginas de obras individuais
 * 
 * Funcionalidades:
 * - Exibição de fichas técnicas detalhadas
 * - Reprodução de vídeos explicativos
 * - Sistema de navegação entre obras
 * - Galeria de imagens da obra
 * - Compartilhamento social
 * - Controles de acessibilidade
 * 
 * @version 1.0.0
 * @author Zonas 11 Team
 */

// ✅ CONFIGURAÇÃO DA OBRA
let configObra = {
  // Layout
  imagemPrincipalSize: '400px',
  videoPlayerSize: '640x360',
  
  // Cores do tema
  corTitulo: '#2C3E50',
  corTexto: '#34495E',
  corDestaque: '#E74C3C',
  corFundo: '#FFFFFF',
  
  // Animações
  animacaoEntrada: 'fadeIn',
  duracaoAnimacao: '0.5s',
  
  // Responsividade
  breakpointMobile: '768px',
  breakpointTablet: '1024px',
  
  // 🌐 URL BASE PARA DEPLOY
  baseURL: 'https://rodrigorez.github.io/zonas11/'
};

// 🌐 FUNÇÃO PARA GERAR URLs ABSOLUTAS (OTIMIZADA PARA DOCS/)
function gerarURLAbsolutaObra(caminhoRelativo) {
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
  const urlFinal = configObra.baseURL + caminhoLimpo;
  console.log(`🔗 URL obra gerada: ${caminhoRelativo} → ${urlFinal}`);
  return urlFinal;
}

// ✅ CLASSE PARA GERENCIAR DADOS DA OBRA
class GerenciadorObra {
  constructor(dadosObra) {
    this.dados = dadosObra;
    this.videoPlayer = null;
    this.galeriaAtiva = false;
  }
  
  // Carrega dados da obra
  carregarDados() {
    console.log(`📖 Carregando obra: ${this.dados.tituloObra}`);
    console.log(`👨‍🎨 Autor: ${this.dados.autor}`);
    console.log(`🎬 Vídeo: ${this.dados.videoUrl}`);
    
    return this.dados;
  }
  
  // Atualiza título da página
  atualizarTitulo() {
    document.title = `${this.dados.tituloObra} - Zonas 11`;
    
    const tituloElement = document.querySelector('h1');
    if (tituloElement) {
      tituloElement.textContent = this.dados.tituloObra;
    }
  }
  
  // Atualiza informações do autor
  atualizarAutor() {
    const autorElement = document.querySelector('.autor');
    if (autorElement && this.dados.autor) {
      autorElement.textContent = this.dados.autor;
    }
  }
  
  // Atualiza sinopse
  atualizarSinopse() {
    const sinopseElement = document.querySelector('.sinopse');
    if (sinopseElement && this.dados.sinopse) {
      sinopseElement.textContent = this.dados.sinopse;
    }
  }
  
  // Valida dados obrigatórios
  validarDados() {
    const camposObrigatorios = ['tituloObra', 'autor'];
    const camposFaltando = camposObrigatorios.filter(campo => !this.dados[campo]);
    
    if (camposFaltando.length > 0) {
      console.warn(`⚠️ Campos obrigatórios faltando: ${camposFaltando.join(', ')}`);
      return false;
    }
    
    console.log('✅ Dados da obra validados');
    return true;
  }
}

// ✅ SISTEMA DE VÍDEO
class VideoPlayer {
  constructor(videoUrl, containerId) {
    this.videoUrl = videoUrl;
    this.container = document.getElementById(containerId);
    this.player = null;
    this.isPlaying = false;
  }
  
  // Cria player de vídeo
  criarPlayer() {
    if (!this.videoUrl || !this.container) {
      console.warn('⚠️ URL do vídeo ou container não encontrado');
      return;
    }
    
    // Extrai ID do YouTube se for URL do YouTube
    const videoId = this.extrairYouTubeId(this.videoUrl);
    
    if (videoId) {
      this.criarPlayerYouTube(videoId);
    } else {
      this.criarPlayerHTML5();
    }
  }
  
  // Extrai ID do vídeo do YouTube
  extrairYouTubeId(url) {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
  
  // Cria player incorporado do YouTube
  criarPlayerYouTube(videoId) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`;
    iframe.width = '100%';
    iframe.height = '360';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.title = 'Vídeo explicativo da obra';
    
    this.container.appendChild(iframe);
    this.player = iframe;
    
    console.log(`🎬 Player YouTube criado para vídeo: ${videoId}`);
  }
  
  // Cria player HTML5 para vídeos locais
  criarPlayerHTML5() {
    const video = document.createElement('video');
    video.src = this.videoUrl;
    video.controls = true;
    video.width = '100%';
    video.height = '360';
    video.preload = 'metadata';
    
    this.container.appendChild(video);
    this.player = video;
    
    console.log(`🎬 Player HTML5 criado para vídeo: ${this.videoUrl}`);
  }
  
  // Controla reprodução
  play() {
    if (this.player && this.player.play) {
      this.player.play();
      this.isPlaying = true;
    }
  }
  
  pause() {
    if (this.player && this.player.pause) {
      this.player.pause();
      this.isPlaying = false;
    }
  }
}

// ✅ SISTEMA DE NAVEGAÇÃO
class NavegadorObras {
  constructor() {
    this.obraAtual = null;
    this.proximaObra = null;
    this.obraAnterior = null;
  }
  
  // Configura navegação
  configurarNavegacao(obraAtual, listaObras) {
    this.obraAtual = obraAtual;
    
    const indiceAtual = listaObras.findIndex(obra => obra.idObra === obraAtual.idObra);
    
    if (indiceAtual > 0) {
      this.obraAnterior = listaObras[indiceAtual - 1];
    }
    
    if (indiceAtual < listaObras.length - 1) {
      this.proximaObra = listaObras[indiceAtual + 1];
    }
    
    this.criarBotoesNavegacao();
  }
  
  // Cria botões de navegação
  criarBotoesNavegacao() {
    const navContainer = document.querySelector('.navegacao-obras') || this.criarContainerNavegacao();
    
    // Botão obra anterior
    if (this.obraAnterior) {
      const btnAnterior = document.createElement('button');
      btnAnterior.className = 'btn-navegacao btn-anterior';
      btnAnterior.innerHTML = '← Obra Anterior';
      btnAnterior.onclick = () => this.navegarPara(this.obraAnterior.urlObra);
      navContainer.appendChild(btnAnterior);
    }
    
    // Botão voltar ao mundo
    const btnVoltar = document.createElement('button');
    btnVoltar.className = 'btn-navegacao btn-voltar';
    btnVoltar.innerHTML = '🌍 Voltar ao Mundo';
    btnVoltar.onclick = () => this.voltarAoMundo();
    navContainer.appendChild(btnVoltar);
    
    // Botão próxima obra
    if (this.proximaObra) {
      const btnProxima = document.createElement('button');
      btnProxima.className = 'btn-navegacao btn-proxima';
      btnProxima.innerHTML = 'Próxima Obra →';
      btnProxima.onclick = () => this.navegarPara(this.proximaObra.urlObra);
      navContainer.appendChild(btnProxima);
    }
  }
  
  // Cria container de navegação
  criarContainerNavegacao() {
    const container = document.createElement('div');
    container.className = 'navegacao-obras';
    document.body.appendChild(container);
    return container;
  }
  
  // Navega para outra obra
  navegarPara(url) {
    // 🌐 USA URL ABSOLUTA PARA NAVEGAÇÃO
    const urlAbsoluta = gerarURLAbsolutaObra(url);
    console.log(`🚀 Navegando para: ${urlAbsoluta}`);
    window.location.href = urlAbsoluta;
  }
  
  // Volta ao mundo
  voltarAoMundo() {
    // Tenta encontrar URL do mundo no histórico ou define padrão
    const urlMundoRelativa = document.referrer || '../mundos/mundo1_galeria1.html';
    // 🌐 USA URL ABSOLUTA PARA NAVEGAÇÃO
    const urlMundoAbsoluta = gerarURLAbsolutaObra(urlMundoRelativa);
    console.log(`🔙 Voltando ao mundo: ${urlMundoAbsoluta}`);
    window.location.href = urlMundoAbsoluta;
  }
}

// ✅ SISTEMA DE COMPARTILHAMENTO
class CompartilhadorObra {
  constructor(dadosObra) {
    this.dados = dadosObra;
  }
  
  // Gera texto para compartilhamento
  gerarTextoCompartilhamento() {
    return `Confira "${this.dados.tituloObra}" por ${this.dados.autor} na exposição Zonas 11! ${window.location.href}`;
  }
  
  // Compartilha no WhatsApp
  compartilharWhatsApp() {
    const texto = encodeURIComponent(this.gerarTextoCompartilhamento());
    window.open(`https://wa.me/?text=${texto}`, '_blank');
  }
  
  // Compartilha no Twitter
  compartilharTwitter() {
    const texto = encodeURIComponent(this.gerarTextoCompartilhamento());
    window.open(`https://twitter.com/intent/tweet?text=${texto}`, '_blank');
  }
  
  // Copia link
  copiarLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      console.log('✅ Link copiado para área de transferência');
      alert('Link copiado!');
    });
  }
}

// ✅ SISTEMA DE ACESSIBILIDADE
function configurarAcessibilidade() {
  // Adiciona atributos ARIA
  const titulo = document.querySelector('h1');
  if (titulo) {
    titulo.setAttribute('aria-level', '1');
    titulo.setAttribute('role', 'heading');
  }
  
  // Configura navegação por teclado
  document.addEventListener('keydown', (event) => {
    switch(event.key) {
      case 'Escape':
        // Volta ao mundo
        const navegador = new NavegadorObras();
        navegador.voltarAoMundo();
        break;
      case 'ArrowLeft':
        // Obra anterior
        const btnAnterior = document.querySelector('.btn-anterior');
        if (btnAnterior) btnAnterior.click();
        break;
      case 'ArrowRight':
        // Próxima obra
        const btnProxima = document.querySelector('.btn-proxima');
        if (btnProxima) btnProxima.click();
        break;
    }
  });
  
  console.log('♿ Sistema de acessibilidade configurado');
}

// ✅ INICIALIZAÇÃO DA OBRA
async function inicializarObra(dadosObra, listaTodasObras = []) {
  console.log('🎨 === INICIANDO CARREGAMENTO DA OBRA ===');
  
  // Cria gerenciador da obra
  const gerenciador = new GerenciadorObra(dadosObra);
  
  // Valida dados
  if (!gerenciador.validarDados()) {
    console.error('❌ Dados da obra inválidos');
    return;
  }
  
  // Atualiza interface
  gerenciador.atualizarTitulo();
  gerenciador.atualizarAutor();
  gerenciador.atualizarSinopse();
  
  // Configura vídeo se disponível
  if (dadosObra.videoUrl) {
    const videoPlayer = new VideoPlayer(dadosObra.videoUrl, 'video-container');
    videoPlayer.criarPlayer();
  }
  
  // Configura navegação
  if (listaTodasObras.length > 0) {
    const navegador = new NavegadorObras();
    navegador.configurarNavegacao(dadosObra, listaTodasObras);
  }
  
  // Configura compartilhamento
  const compartilhador = new CompartilhadorObra(dadosObra);
  window.compartilharObra = {
    whatsapp: () => compartilhador.compartilharWhatsApp(),
    twitter: () => compartilhador.compartilharTwitter(),
    copiarLink: () => compartilhador.copiarLink()
  };
  
  // Configura acessibilidade
  configurarAcessibilidade();
  
  console.log('✅ Obra totalmente carregada!');
  console.log(`📖 Título: ${dadosObra.tituloObra}`);
  console.log(`👨‍🎨 Autor: ${dadosObra.autor}`);
}

// ✅ EXPORTA FUNCIONALIDADES DA OBRA
window.ObraVirtual = {
  inicializar: inicializarObra,
  GerenciadorObra: GerenciadorObra,
  VideoPlayer: VideoPlayer,
  NavegadorObras: NavegadorObras,
  CompartilhadorObra: CompartilhadorObra,
  config: configObra
};