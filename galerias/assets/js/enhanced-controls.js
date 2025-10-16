/**
 * =====================================================
 * ENHANCED CONTROLS - COMPONENTE MODULAR DE CONTROLES VR
 * =====================================================
 * 
 * DESCRIÇÃO:
 * Componente A-Frame extensível para controles aprimorados em ambientes VR.
 * Projetado para fácil expansão futura com novos tipos de movimento.
 * 
 * VERSÃO: 1.0.0
 * DATA: 2025-10-15
 * AUTOR: rodrigoRez.art
 * 
 * =====================================================
 * FUNCIONALIDADES IMPLEMENTADAS
 * =====================================================
 * 
 * ✅ ROTAÇÃO (Q/E):
 *    - Tecla Q/q: Rotação anti-horária (esquerda)
 *    - Tecla E/e: Rotação horária (direita)
 *    - Velocidade configurável
 *    - Suporte maiúscula/minúscula
 * 
 * ✅ MOVIMENTO (WASD):
 *    - Movimento relativo à câmera (camera-relative)
 *    - W/S: Frente/Trás
 *    - A/D: Esquerda/Direita
 * 
 * ✅ CONTROLES DE MOUSE (DESKTOP):
 *    - Botão ESQUERDO (drag horizontal): Rotação Y (yaw)
 *    - Botão ESQUERDO (drag vertical): Pitch (olhar cima/baixo)
 *    - Botão DIREITO (drag vertical): Movimento frente/trás
 *    - Prioridade: Mouse > Teclado
 * 
 * ✅ CONTROLES DE TOQUE (MOBILE):
 *    - 1 DEDO (horizontal): Rotação Y (yaw)
 *    - 1 DEDO (vertical): Pitch (olhar cima/baixo)
 *    - 2 DEDOS (vertical): Movimento frente/trás
 *    - Prioridade: Toque > Giroscópio
 * 
 * ✅ GIROSCÓPIO (DEVICE ORIENTATION):
 *    - Rotação Y (yaw) via sensor do celular
 *    - Pitch (olhar cima/baixo) via sensor do celular
 *    - Calibração automática na primeira leitura
 *    - Suavização configurável (anti-tremor)
 *    - Desabilitado temporariamente durante toque manual
 * 
 * 🔮 PREPARADO PARA FUTURO:
 *    - Correr (Shift + WASD)
 *    - Pular (Espaço)
 *    - Agachar (Ctrl/C)
 *    - Sprint toggle
 *    - Voo (modo criativo)
 * 
 * =====================================================
 * USO
 * =====================================================
 * 
 * HTML:
 * <a-entity camera look-controls wasd-controls 
 *           enhanced-controls="rotationSpeed: 45; enableRotation: true">
 * </a-entity>
 * 
 * PARÂMETROS:
 * - enableRotation: true/false (padrão: true)
 * - rotationSpeed: graus/segundo (padrão: 45)
 * - enableRun: true/false (padrão: false) [FUTURO]
 * - enableJump: true/false (padrão: false) [FUTURO]
 * - runMultiplier: multiplicador velocidade (padrão: 2) [FUTURO]
 * - jumpHeight: altura do pulo em metros (padrão: 1.5) [FUTURO]
 * 
 * =====================================================
 * ARQUITETURA MODULAR
 * =====================================================
 * 
 * O componente é dividido em módulos independentes:
 * 
 * 1. init()           - Inicialização e setup
 * 2. setupRotation()  - Configuração rotação Q/E
 * 3. setupRun()       - [FUTURO] Configuração corrida
 * 4. setupJump()      - [FUTURO] Configuração pulo
 * 5. tick()           - Loop de atualização contínua
 * 6. updateRotation() - Aplicar rotação suave
 * 7. remove()         - Limpeza de event listeners
 * 
 * Cada módulo pode ser ativado/desativado independentemente
 * via parâmetros do schema.
 * 
 * =====================================================
 */

// =====================================================
// CONSTANTES DE CONFIGURAÇÃO (NÚMEROS MÁGICOS)
// =====================================================
// Centralize aqui valores fixos para fácil manutenção futura.
// Evita "números mágicos" espalhados pelo código.
//
// 🛠️ COMO USAR:
// - Para ajustar sensibilidade de rotação do mouse, modifique MOUSE_ROTATION_SENSITIVITY
// - Para desativar logs de debug, altere ENABLE_*_DEBUG_LOGS para false
// - Valores recomendados estão documentados em comentários abaixo de cada constante
//
// ⚠️ ATENÇÃO:
// - Não altere ROTATION_FULL_CIRCLE e ROTATION_MIN (matemática de normalização)
// - Mudanças em MOVEMENT_THRESHOLD podem afetar responsividade

const ENHANCED_CONTROLS_CONFIG = {
  // ===== SENSIBILIDADES DE MOUSE =====
  MOUSE_ROTATION_SENSITIVITY: 0.3,    // Sensibilidade rotação horizontal (botão esquerdo)
  // Valores menores = rotação mais suave
  // Valores maiores = rotação mais responsiva
  // Recomendado: 0.1 a 0.5
  // Padrão: 0.3 (balanço entre precisão e velocidade)
  
  // ===== SENSIBILIDADES DE TOQUE (MOBILE) =====
  TOUCH_ROTATION_SENSITIVITY: 0.2,    // Sensibilidade rotação horizontal (1 dedo)
  // Valores menores = rotação mais suave no mobile
  // Valores maiores = rotação mais responsiva
  // Recomendado: 0.1 a 0.3 (mobile precisa ser mais suave que mouse)
  // Padrão: 0.2
  
  TOUCH_MOVEMENT_SENSITIVITY: 0.015,  // Sensibilidade movimento (2 dedos)
  // Similar ao mouseDragSpeed, mas para toque
  // Padrão: 0.015 (50% mais sensível que mouse)
  
  // ===== SENSIBILIDADE DE GIROSCÓPIO (DEVICE ORIENTATION) =====
  GYRO_ROTATION_ENABLED: true,        // Ativar rotação Y via giroscópio
  // true = giroscópio controla yaw (rotação horizontal)
  // false = apenas look-controls (pitch manual)
  
  GYRO_ROTATION_SMOOTHING: 0.15,      // Suavização da rotação do giroscópio
  // Valores menores = mais suave, mais atraso
  // Valores maiores = mais responsivo, mais tremia
  // Recomendado: 0.05 a 0.2
  // Padrão: 0.15 (mais responsivo para mobile)
  
  GYRO_DISABLE_DURATION: 1000,        // Tempo (ms) que giroscópio fica desabilitado após toque
  // Evita conflito entre toque manual e giroscópio
  // Padrão: 1000ms (1 segundo) - aumentado para evitar instabilidade
  
  // ===== NORMALIZAÇÃO DE ROTAÇÃO =====
  ROTATION_FULL_CIRCLE: 360,          // Graus em círculo completo (NÃO ALTERAR)
  ROTATION_MIN: 0,                    // Rotação mínima para normalização (NÃO ALTERAR)
  
  // ===== LIMITES DE MOVIMENTO =====
  MOVEMENT_THRESHOLD: 0,              // Delta mínimo para processar movimento (pixels)
  // Valores maiores = menos sensível a micro-movimentos do mouse
  // 0 = processa qualquer movimento detectado
  // Recomendado: 0 para máxima responsividade, 1-2 para evitar jitter
  
  // ===== DEBUG E LOGGING =====
  ENABLE_MOUSE_DEBUG_LOGS: false,      // Mostrar logs de eventos do mouse (mousedown/move/up)
  ENABLE_TOUCH_DEBUG_LOGS: false,      // Mostrar logs de eventos de toque (touchstart/move/end)
  ENABLE_GYRO_DEBUG_LOGS: false,       // Mostrar logs de giroscópio (muito verboso)
  ENABLE_ROTATION_DEBUG_LOGS: false,   // Mostrar logs de rotação Y em graus
  ENABLE_MOVEMENT_DEBUG_LOGS: false,   // Mostrar logs de movimento X/Z (verboso, pode afetar performance)
  ENABLE_UPDATE_ROTATION_DEBUG: true   // DEBUG ESPECIAL: Logs detalhados de updateRotation
};

// =====================================================

AFRAME.registerComponent('enhanced-controls', {
  /**
   * =====================================================
   * SCHEMA - CONFIGURAÇÃO DO COMPONENTE
   * =====================================================
   * 
   * Define todos os parâmetros configuráveis.
   * Novos recursos devem adicionar seus parâmetros aqui.
   */
  schema: {
    // ===== ROTAÇÃO (Q/E) - IMPLEMENTADO =====
    enableRotation: { 
      type: 'boolean', 
      default: true,
      description: 'Ativa/desativa rotação com Q/E'
    },
    rotationSpeed: { 
      type: 'number', 
      default: 45,
      description: 'Velocidade de rotação em graus/segundo'
    },
    
    // ===== MOVIMENTO (WASD) - IMPLEMENTADO =====
    enableMovement: {
      type: 'boolean',
      default: true,
      description: 'Ativa/desativa movimento WASD relativo à rotação'
    },
    moveSpeed: {
      type: 'number',
      default: 3,
      description: 'Velocidade de movimento em m/s'
    },
    
    // ===== MOVIMENTO COM MOUSE (DRAG) - IMPLEMENTADO =====
    enableMouseDrag: {
      type: 'boolean',
      default: true,
      description: 'Ativa/desativa movimento com botão direito do mouse'
    },
    mouseDragSpeed: {
      type: 'number',
      default: 0.01,
      description: 'Sensibilidade do movimento com mouse (multiplicador)'
    },
    
    // ===== CONTROLES DE TOQUE (MOBILE) - IMPLEMENTADO =====
    enableTouchControls: {
      type: 'boolean',
      default: true,
      description: 'Ativa/desativa controles de toque para dispositivos móveis'
    },
    touchRotationSpeed: {
      type: 'number',
      default: 0.2,
      description: 'Sensibilidade de rotação com toque (1 dedo)'
    },
    touchMoveSpeed: {
      type: 'number',
      default: 0.015,
      description: 'Sensibilidade de movimento com toque (2 dedos)'
    },
    
    // ===== GIROSCÓPIO (DEVICE ORIENTATION) - IMPLEMENTADO =====
    enableGyroRotation: {
      type: 'boolean',
      default: true,
      description: 'Ativa/desativa rotação Y via giroscópio (mobile)'
    },
    gyroSmoothing: {
      type: 'number',
      default: 0.1,
      description: 'Suavização da rotação do giroscópio (0.05-0.15)'
    },
    
    // ===== CORRIDA (SHIFT) - PREPARADO PARA FUTURO =====
    enableRun: { 
      type: 'boolean', 
      default: false,
      description: '[FUTURO] Ativa/desativa corrida com Shift'
    },
    runMultiplier: { 
      type: 'number', 
      default: 2.0,
      description: '[FUTURO] Multiplicador de velocidade ao correr'
    },
    
    // ===== PULO (SPACE) - PREPARADO PARA FUTURO =====
    enableJump: { 
      type: 'boolean', 
      default: false,
      description: '[FUTURO] Ativa/desativa pulo com Espaço'
    },
    jumpHeight: { 
      type: 'number', 
      default: 1.5,
      description: '[FUTURO] Altura do pulo em metros'
    },
    jumpDuration: { 
      type: 'number', 
      default: 400,
      description: '[FUTURO] Duração do pulo em milissegundos'
    },
    
    // ===== AGACHAR (CTRL/C) - PREPARADO PARA FUTURO =====
    enableCrouch: { 
      type: 'boolean', 
      default: false,
      description: '[FUTURO] Ativa/desativa agachar com Ctrl/C'
    },
    crouchHeight: { 
      type: 'number', 
      default: 0.8,
      description: '[FUTURO] Altura ao agachar (0-1 = porcentagem)'
    }
  },

  /**
   * =====================================================
   * INIT - INICIALIZAÇÃO DO COMPONENTE
   * =====================================================
   * 
   * Executado uma vez quando o componente é anexado.
   * Configura estado inicial e chama setup de cada módulo.
   */
  init: function () {
    console.log('🎮 Enhanced Controls: Inicializando...');
    
    // Referência à entidade (geralmente a câmera)
    this.el = this.el;
    
    // Estado interno do componente
    this.state = {
      // Rotação (Q/E)
      rotatingLeft: false,      // Tecla Q pressionada?
      rotatingRight: false,     // Tecla E pressionada?
      currentRotation: 0,       // Rotação acumulada em Y
      
      // Movimento (WASD)
      movingForward: false,     // Tecla W pressionada?
      movingBackward: false,    // Tecla S pressionada?
      movingLeft: false,        // Tecla A pressionada?
      movingRight: false,       // Tecla D pressionada?
      
      // Movimento com Mouse (Drag)
      isDragging: false,        // Botão pressionado?
      dragButton: null,         // Qual botão? (0=esquerdo, 2=direito)
      lastMouseX: 0,            // Posição X anterior do mouse
      lastMouseY: 0,            // Posição Y anterior do mouse
      lastMouseInteraction: -10000,  // Timestamp última interação com mouse (iniciar no passado)
      
      // Controles de Toque (Mobile)
      isTouching: false,        // Tela está sendo tocada?
      touchCount: 0,            // Quantos dedos na tela?
      lastTouchX: 0,            // Posição X do primeiro toque
      lastTouchY: 0,            // Posição Y do primeiro toque
      touch2X: 0,               // Posição X do segundo toque
      touch2Y: 0,               // Posição Y do segundo toque
      lastTouchInteraction: -10000,  // Timestamp última interação com toque (iniciar no passado)
      
      // Giroscópio (Device Orientation)
      gyroActive: false,        // Giroscópio ativo?
      gyroAlpha: 0,             // Ângulo alpha (yaw) do giroscópio
      gyroBeta: 0,              // Ângulo beta (pitch) do giroscópio
      gyroInitialAlpha: null,   // Alpha inicial (calibração)
      gyroInitialBeta: null,    // Beta inicial (calibração)
      gyroTargetRotation: 0,    // Rotação alvo (suavizada)
      gyroTargetPitch: 0,       // Pitch alvo (suavizado)
      
      // Sincronização Teclado ↔ Mouse
      keyboardHasSynced: false, // Flag: teclado já sincronizou após mouse?
      
      // Corrida (SHIFT) - FUTURO
      isRunning: false,         // Shift pressionado?
      
      // Pulo (SPACE) - FUTURO
      isJumping: false,         // No ar?
      jumpStartTime: 0,         // Timestamp início do pulo
      initialHeight: 0,         // Altura antes do pulo
      
      // Agachar (CTRL) - FUTURO
      isCrouching: false        // Agachado?
    };
    
    // Bind de funções (necessário para removeEventListener)
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onDeviceOrientation = this.onDeviceOrientation.bind(this);
    
    // Configurar módulos ativos
    if (this.data.enableRotation) {
      this.setupRotation();
    }
    
    if (this.data.enableMovement) {
      this.setupMovement();
    }
    
    if (this.data.enableMouseDrag) {
      this.setupMouseDrag();
    }
    
    if (this.data.enableTouchControls) {
      this.setupTouchControls();
    }
    
    if (this.data.enableGyroRotation) {
      this.setupGyroRotation();
    }
    
    // Módulos futuros (comentados até implementação)
    // if (this.data.enableRun) {
    //   this.setupRun();
    // }
    // if (this.data.enableJump) {
    //   this.setupJump();
    // }
    // if (this.data.enableCrouch) {
    //   this.setupCrouch();
    // }
    
    // ===== DESABILITAR YAW DO LOOK-CONTROLS =====
    // Enhanced-controls assume controle total da rotação Y (yaw)
    // Look-controls continua gerenciando pitch (olhar cima/baixo)
    this.disableLookControlsYaw();
    
    console.log('✅ Enhanced Controls: Inicializado com sucesso');
    console.log('📋 Configuração:', {
      rotação: this.data.enableRotation ? `${this.data.rotationSpeed}°/s` : 'desativada',
      corrida: this.data.enableRun ? 'ativada (FUTURO)' : 'desativada',
      pulo: this.data.enableJump ? 'ativado (FUTURO)' : 'desativado'
    });
  },
  
  /**
   * =====================================================
   * DISABLE LOOK-CONTROLS YAW - DESABILITAR ROTAÇÃO Y
   * =====================================================
   * 
   * Desabilita o controle de yaw (rotação horizontal) do look-controls,
   * mantendo apenas o pitch (olhar cima/baixo).
   * 
   * Isso evita conflito entre look-controls e enhanced-controls.
   */
  disableLookControlsYaw: function () {
    console.log('🔒 Enhanced Controls: Desabilitando yaw do look-controls...');
    
    // Aguardar próximo tick para garantir que look-controls foi inicializado
    setTimeout(() => {
      const lookControls = this.el.components['look-controls'];
      
      if (lookControls) {
        // Desabilitar yaw (rotação horizontal)
        if (lookControls.pitchObject && lookControls.yawObject) {
          // Congelar rotação Y do yawObject
          lookControls.yawObject.rotation.y = 0;
          
          // Interceptar método updateOrientation para bloquear yaw
          const originalUpdate = lookControls.updateOrientation.bind(lookControls);
          lookControls.updateOrientation = function() {
            const currentYaw = this.yawObject.rotation.y;
            originalUpdate();
            this.yawObject.rotation.y = currentYaw; // Forçar yaw a permanecer inalterado
          };
          
          console.log('✅ Look-controls yaw DESABILITADO (enhanced-controls assume controle)');
          console.log('✅ Look-controls pitch MANTIDO (olhar cima/baixo funcional)');
        } else {
          console.warn('⚠️ pitchObject/yawObject não encontrados em look-controls');
        }
      } else {
        console.log('🚨 look-controls não encontrado (OK se não estiver sendo usado)');
      }
    }, 100);
  },

  /**
   * =====================================================
   * SETUP ROTATION - CONFIGURAÇÃO DO MÓDULO DE ROTAÇÃO
   * =====================================================
   * 
   * Configura event listeners para teclas Q e E.
   * Suporta maiúsculas e minúsculas.
   */
  setupRotation: function () {
    console.log('🔄 Enhanced Controls: Configurando rotação Q/E');
    
    // Adicionar event listeners globais
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    
    // Obter rotação inicial da câmera
    const rotation = this.el.getAttribute('rotation');
    if (rotation) {
      this.state.currentRotation = rotation.y || 0;
    }
    
    console.log('✅ Rotação configurada: Q (esquerda) | E (direita)');
  },
  
  /**
   * =====================================================
   * SETUP MOVEMENT - CONFIGURAÇÃO DO MÓDULO DE MOVIMENTO
   * =====================================================
   * 
   * Desativa wasd-controls padrão e configura movimento custom.
   * Movimento é relativo à rotação Y da câmera.
   */
  setupMovement: function () {
    console.log('🎮 Enhanced Controls: Configurando movimento WASD relativo');
    
    // Desativar wasd-controls padrão (usa coordenadas globais)
    this.el.removeAttribute('wasd-controls');
    
    console.log('✅ Movimento configurado: WASD relativo à rotação');
    console.log('⚠️ wasd-controls padrão desativado (usando movimento custom)');
  },
  
  /**
   * =====================================================
   * SETUP MOUSE DRAG - CONFIGURAÇÃO DE MOVIMENTO COM MOUSE
   * =====================================================
   * 
   * Configura event listeners para movimento com botão direito do mouse.
   * Permite arrastar para mover a câmera no plano XZ.
   */
  setupMouseDrag: function () {
    console.log('🖘️ Enhanced Controls: Configurando movimento com mouse');
    
    // Obter referência ao canvas da cena
    this.canvas = this.el.sceneEl.canvas;
    
    if (!this.canvas) {
      console.error('❌ Canvas não encontrado! Mouse drag não funcionará.');
      return;
    }
    
    console.log('✅ Canvas encontrado:', this.canvas);
    
    // Adicionar event listeners DIRETAMENTE no canvas (prioridade máxima)
    this.canvas.addEventListener('mousedown', this.onMouseDown, { capture: true });
    this.canvas.addEventListener('mousemove', this.onMouseMove, { capture: true });
    this.canvas.addEventListener('mouseup', this.onMouseUp, { capture: true });
    
    // Prevenir menu de contexto DIRETAMENTE no canvas
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, { capture: true });
    
    console.log('✅ Movimento com mouse configurado:');
    console.log('   - Botão ESQUERDO: Rotação Y (horizontal) + Pitch (vertical)');
    console.log('   - Botão DIREITO: Movimento frente/trás (vertical)');
    console.log('⚠️ Listeners registrados com {capture: true} para prioridade máxima');
  },
  
  /**
   * =====================================================
   * SETUP TOUCH CONTROLS - CONFIGURAÇÃO DE CONTROLES DE TOQUE
   * =====================================================
   * 
   * Configura event listeners para controles de toque em dispositivos móveis.
   * - 1 DEDO: Rotação Y (yaw) - horizontal
   * - 2 DEDOS: Movimento frente/trás - vertical
   * 
   * Funciona em paralelo com look-controls (giroscópio).
   */
  setupTouchControls: function () {
    console.log('👆 Enhanced Controls: Configurando controles de toque (mobile)');
    
    // Obter referência ao canvas da cena
    if (!this.canvas) {
      this.canvas = this.el.sceneEl.canvas;
    }
    
    if (!this.canvas) {
      console.error('❌ Canvas não encontrado! Touch controls não funcionarão.');
      return;
    }
    
    console.log('✅ Canvas encontrado para touch:', this.canvas);
    
    // Adicionar event listeners de toque DIRETAMENTE no canvas
    this.canvas.addEventListener('touchstart', this.onTouchStart, { capture: true, passive: false });
    this.canvas.addEventListener('touchmove', this.onTouchMove, { capture: true, passive: false });
    this.canvas.addEventListener('touchend', this.onTouchEnd, { capture: true, passive: false });
    this.canvas.addEventListener('touchcancel', this.onTouchEnd, { capture: true, passive: false });
    
    console.log('✅ Controles de toque configurados:');
    console.log('   - 1 DEDO (horizontal): Rotação Y (yaw)');
    console.log('   - 2 DEDOS (vertical): Movimento frente/trás');
    console.log('   - Look-controls (giroscópio): Pitch automático');
    console.log('⚠️ Touch listeners com {capture: true, passive: false}');
  },
  
  /**
   * =====================================================
   * SETUP GYRO ROTATION - CONFIGURAÇÃO DE ROTAÇÃO VIA GIROSCÓPIO
   * =====================================================
   * 
   * Configura DeviceOrientationEvent para capturar rotação Y (yaw).
   * Funciona em paralelo com look-controls (pitch).
   * 
   * IMPORTANTE:
   * - iOS 13+ requer permissão explícita (DeviceOrientationEvent.requestPermission)
   * - Android funciona automaticamente
   * - Alpha (yaw) é calibrado na primeira leitura
   */
  setupGyroRotation: function () {
    console.log('🧭 Enhanced Controls: Configurando rotação via giroscópio');
    
    // Verificar se DeviceOrientationEvent existe
    if (!window.DeviceOrientationEvent) {
      console.warn('⚠️ DeviceOrientationEvent não suportado neste dispositivo');
      return;
    }
    
    // iOS 13+ requer permissão explícita
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      console.log('📱 iOS detectado - solicitar permissão ao usuário');
      
      // Criar botão temporário para solicitar permissão (iOS exige interação do usuário)
      const requestPermission = () => {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', this.onDeviceOrientation, true);
              console.log('✅ Permissão de giroscópio concedida (iOS)');
              this.state.gyroActive = true;
            } else {
              console.warn('❌ Permissão de giroscópio negada');
            }
          })
          .catch(error => {
            console.error('❌ Erro ao solicitar permissão de giroscópio:', error);
          });
      };
      
      // Adicionar listener de clique em qualquer lugar da tela
      this.canvas = this.canvas || this.el.sceneEl.canvas;
      if (this.canvas) {
        this.canvas.addEventListener('click', requestPermission, { once: true });
        console.log('👆 Toque na tela para ativar giroscópio (iOS)');
      }
    } else {
      // Android e navegadores modernos
      window.addEventListener('deviceorientation', this.onDeviceOrientation, true);
      console.log('✅ Giroscópio listener configurado (aguardando dados)');
      // NÃO marcar gyroActive aqui - só após receber primeiro evento
    }
    
    console.log('✅ Rotação via giroscópio configurada:');
    console.log('   - Alpha (yaw): Rotação Y horizontal');
    console.log('   - Look-controls: Pitch (cima/baixo)');
    console.log(`   - Suavização: ${this.data.gyroSmoothing}`);
  },
  
  /**
   * =====================================================
   * ON MOUSE DOWN - DETECÇÃO DE CLIQUE DO MOUSE
   * =====================================================
   * 
   * Inicia drag quando qualquer botão é pressionado.
   */
  onMouseDown: function (event) {
    if (ENHANCED_CONTROLS_CONFIG.ENABLE_MOUSE_DEBUG_LOGS) {
      console.log(`🖘️ onMouseDown chamado! Botão: ${event.button}`);
    }
    
    // Botão esquerdo (0) OU direito (2) = iniciar drag
    if (event.button === 0 || event.button === 2) {
      this.state.isDragging = true;
      this.state.dragButton = event.button; // Armazenar qual botão foi pressionado
      this.state.lastMouseX = event.clientX;
      this.state.lastMouseY = event.clientY;
      
      // Prevenir comportamento padrão apenas para botão direito
      if (event.button === 2) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      if (ENHANCED_CONTROLS_CONFIG.ENABLE_MOUSE_DEBUG_LOGS) {
        const buttonName = event.button === 0 ? 'ESQUERDO' : 'DIREITO';
        console.log(`✅ Drag INICIADO (${buttonName}) em:`, event.clientX, event.clientY);
        console.log('🎯 Estado isDragging:', this.state.isDragging);
      }
    }
  },
  
  /**
   * =====================================================
   * ON MOUSE MOVE - MOVIMENTO DO MOUSE
   * =====================================================
   * 
   * Aplica ações baseadas no botão pressionado:
   * - Botão ESQUERDO: Rotação Y (horizontal) + Pitch via look-controls (vertical)
   * - Botão DIREITO: Movimento frente/trás (vertical)
   */
  onMouseMove: function (event) {
    if (!this.state.isDragging) return;
    
    // Registrar timestamp de interação (desabilita teclado temporariamente)
    this.state.lastMouseInteraction = performance.now();
    
    // RESETAR flag de sincronização do teclado (permitir nova sincronização futura)
    this.state.keyboardHasSynced = false;
    
    // Calcular delta do mouse
    const deltaX = event.clientX - this.state.lastMouseX;
    const deltaY = event.clientY - this.state.lastMouseY;
    
    if (ENHANCED_CONTROLS_CONFIG.ENABLE_MOUSE_DEBUG_LOGS) {
      const buttonName = this.state.dragButton === 0 ? 'ESQUERDO' : 'DIREITO';
      console.log(`🖘️ Mouse delta (${buttonName}): X=${deltaX}, Y=${deltaY}`);
    }
    
    // ===== BOTÃO ESQUERDO (0): ROTAÇÃO Y + PITCH =====
    if (this.state.dragButton === 0) {
      // HORIZONTAL = Rotação Y (substituindo yaw do look-controls)
      if (Math.abs(deltaX) > ENHANCED_CONTROLS_CONFIG.MOVEMENT_THRESHOLD) {
        const rotationDelta = -deltaX * ENHANCED_CONTROLS_CONFIG.MOUSE_ROTATION_SENSITIVITY;
        
        this.state.currentRotation += rotationDelta;
        
        // Normalizar rotação (0-360)
        this.state.currentRotation = this.state.currentRotation % ENHANCED_CONTROLS_CONFIG.ROTATION_FULL_CIRCLE;
        if (this.state.currentRotation < ENHANCED_CONTROLS_CONFIG.ROTATION_MIN) {
          this.state.currentRotation += ENHANCED_CONTROLS_CONFIG.ROTATION_FULL_CIRCLE;
        }
        
        // Aplicar rotação Y (yaw)
        const rotation = this.el.getAttribute('rotation');
        this.el.setAttribute('rotation', {
          x: rotation.x,                    // Pitch (look-controls mantém)
          y: this.state.currentRotation,    // Yaw (enhanced-controls)
          z: rotation.z
        });
        
        if (ENHANCED_CONTROLS_CONFIG.ENABLE_ROTATION_DEBUG_LOGS) {
          console.log(`🔄 Rotação Y: ${this.state.currentRotation.toFixed(1)}°`);
        }
      }
      
      // VERTICAL: Deixar look-controls gerenciar pitch (não interferir)
      // Look-controls já aplica pitch automaticamente
    }
    
    // ===== BOTÃO DIREITO (2): MOVIMENTO FRENTE/TRÁS =====
    else if (this.state.dragButton === 2) {
      // Prevenir look-controls de interferir
      event.preventDefault();
      event.stopPropagation();
      
      // VERTICAL = Movimento frontal (W/S)
      if (Math.abs(deltaY) > ENHANCED_CONTROLS_CONFIG.MOVEMENT_THRESHOLD) {
        const position = this.el.getAttribute('position');
        const rotationRad = THREE.MathUtils.degToRad(this.state.currentRotation);
        
        const forwardX = Math.sin(rotationRad);
        const forwardZ = Math.cos(rotationRad);
        
        const movementSensitivity = this.data.mouseDragSpeed;
        const moveX = -forwardX * deltaY * movementSensitivity;
        const moveZ = -forwardZ * deltaY * movementSensitivity;
        
        this.el.setAttribute('position', {
          x: position.x + moveX,
          y: position.y,
          z: position.z + moveZ
        });
        
        if (ENHANCED_CONTROLS_CONFIG.ENABLE_MOVEMENT_DEBUG_LOGS) {
          console.log(`➡️ Movimento: X=${moveX.toFixed(3)}, Z=${moveZ.toFixed(3)}`);
        }
      }
    }
    
    // Atualizar posição anterior do mouse
    this.state.lastMouseX = event.clientX;
    this.state.lastMouseY = event.clientY;
  },
  
  /**
   * =====================================================
   * ON MOUSE UP - SOLTAR BOTÃO DO MOUSE
   * =====================================================
   * 
   * Finaliza drag quando qualquer botão é solto.
   */
  onMouseUp: function (event) {
    if (ENHANCED_CONTROLS_CONFIG.ENABLE_MOUSE_DEBUG_LOGS) {
      console.log(`🖘️ onMouseUp chamado! Botão: ${event.button}`);
    }
    
    // Qualquer botão (0 ou 2)
    if (event.button === 0 || event.button === 2) {
      this.state.isDragging = false;
      
      if (ENHANCED_CONTROLS_CONFIG.ENABLE_MOUSE_DEBUG_LOGS) {
        const buttonName = event.button === 0 ? 'ESQUERDO' : 'DIREITO';
        console.log(`✅ Drag FINALIZADO (${buttonName})`);
        console.log('🎯 Estado isDragging:', this.state.isDragging);
      }
    }
  },
  
  /**
   * =====================================================
   * ON TOUCH START - DETECÇÃO DE INÍCIO DE TOQUE
   * =====================================================
   * 
   * Captura toques na tela e armazena posições iniciais.
   * - 1 dedo: Prepara para rotação
   * - 2 dedos: Prepara para movimento
   */
  onTouchStart: function (event) {
    if (ENHANCED_CONTROLS_CONFIG.ENABLE_TOUCH_DEBUG_LOGS) {
      console.log(`👆 onTouchStart! Toques: ${event.touches.length}`);
    }
    
    // Registrar timestamp IMEDIATAMENTE ao tocar
    this.state.lastTouchInteraction = performance.now();
    
    this.state.isTouching = true;
    this.state.touchCount = event.touches.length;
    
    // Armazenar posição do primeiro toque
    if (event.touches.length >= 1) {
      this.state.lastTouchX = event.touches[0].clientX;
      this.state.lastTouchY = event.touches[0].clientY;
    }
    
    // Armazenar posição do segundo toque (para movimento com 2 dedos)
    if (event.touches.length >= 2) {
      this.state.touch2X = event.touches[1].clientX;
      this.state.touch2Y = event.touches[1].clientY;
      
      // Prevenir zoom/scroll ao usar 2 dedos
      event.preventDefault();
    }
    
    if (ENHANCED_CONTROLS_CONFIG.ENABLE_TOUCH_DEBUG_LOGS) {
      console.log(`✅ Touch INICIADO com ${this.state.touchCount} dedo(s)`);
    }
  },
  
  /**
   * =====================================================
   * ON TOUCH MOVE - MOVIMENTO DE TOQUE
   * =====================================================
   * 
   * Aplica ações baseadas no número de dedos:
   * - 1 DEDO (horizontal): Rotação Y (yaw)
   * - 2 DEDOS (vertical): Movimento frente/trás
   */
  onTouchMove: function (event) {
    if (!this.state.isTouching) return;
    
    // Registrar timestamp de interação (desabilita giroscópio temporariamente)
    this.state.lastTouchInteraction = performance.now();
    
    // Atualizar contagem de toques
    this.state.touchCount = event.touches.length;
    
    // ===== 1 DEDO: ROTAÇÃO Y (YAW) + PITCH =====
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.state.lastTouchX;
      const deltaY = touch.clientY - this.state.lastTouchY;
      
      if (ENHANCED_CONTROLS_CONFIG.ENABLE_TOUCH_DEBUG_LOGS) {
        console.log(`👆 Touch delta (1 dedo): X=${deltaX}, Y=${deltaY}`);
      }
      
      const rotation = this.el.getAttribute('rotation');
      let rotationChanged = false;
      
      // HORIZONTAL = Rotação Y (YAW)
      if (Math.abs(deltaX) > ENHANCED_CONTROLS_CONFIG.MOVEMENT_THRESHOLD) {
        const rotationDelta = deltaX * ENHANCED_CONTROLS_CONFIG.TOUCH_ROTATION_SENSITIVITY;  // CORRIGIDO: remover sinal negativo
        
        this.state.currentRotation += rotationDelta;
        
        // Normalizar rotação (0-360)
        this.state.currentRotation = this.state.currentRotation % ENHANCED_CONTROLS_CONFIG.ROTATION_FULL_CIRCLE;
        if (this.state.currentRotation < ENHANCED_CONTROLS_CONFIG.ROTATION_MIN) {
          this.state.currentRotation += ENHANCED_CONTROLS_CONFIG.ROTATION_FULL_CIRCLE;
        }
        
        rotationChanged = true;
        
        if (ENHANCED_CONTROLS_CONFIG.ENABLE_ROTATION_DEBUG_LOGS) {
          console.log(`🔄 Rotação Y (touch): ${this.state.currentRotation.toFixed(1)}°`);
        }
      }
      
      // VERTICAL = Pitch (OLHAR CIMA/BAIXO)
      let newPitch = rotation.x;
      if (Math.abs(deltaY) > ENHANCED_CONTROLS_CONFIG.MOVEMENT_THRESHOLD) {
        const pitchSensitivity = ENHANCED_CONTROLS_CONFIG.TOUCH_ROTATION_SENSITIVITY;
        const pitchDelta = deltaY * pitchSensitivity;  // CORRIGIDO: remover sinal negativo
        
        newPitch = rotation.x + pitchDelta;
        
        // Limitar pitch a -90 a 90 graus (evitar virar de cabeça para baixo)
        newPitch = Math.max(-90, Math.min(90, newPitch));
        
        rotationChanged = true;
        
        if (ENHANCED_CONTROLS_CONFIG.ENABLE_ROTATION_DEBUG_LOGS) {
          console.log(`🔄 Pitch (touch): ${newPitch.toFixed(1)}°`);
        }
      }
      
      // Aplicar rotação completa (yaw + pitch)
      if (rotationChanged) {
        this.el.setAttribute('rotation', {
          x: newPitch,                      // Pitch (enhanced-controls com toque)
          y: this.state.currentRotation,    // Yaw (enhanced-controls)
          z: rotation.z
        });
      }
      
      // Atualizar posição
      this.state.lastTouchX = touch.clientX;
      this.state.lastTouchY = touch.clientY;
    }
    
    // ===== 2 DEDOS: MOVIMENTO FRENTE/TRÁS =====
    else if (event.touches.length === 2) {
      // Prevenir zoom/scroll
      event.preventDefault();
      event.stopPropagation();
      
      // Calcular ponto médio entre os dois dedos
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      
      const midX = (touch1.clientX + touch2.clientX) / 2;
      const midY = (touch1.clientY + touch2.clientY) / 2;
      
      // Calcular delta do ponto médio
      const lastMidX = (this.state.lastTouchX + this.state.touch2X) / 2;
      const lastMidY = (this.state.lastTouchY + this.state.touch2Y) / 2;
      
      const deltaX = midX - lastMidX;
      const deltaY = midY - lastMidY;
      
      if (ENHANCED_CONTROLS_CONFIG.ENABLE_TOUCH_DEBUG_LOGS) {
        console.log(`👆 Touch delta (2 dedos): X=${deltaX}, Y=${deltaY}`);
      }
      
      // VERTICAL = Movimento frente/trás
      if (Math.abs(deltaY) > ENHANCED_CONTROLS_CONFIG.MOVEMENT_THRESHOLD) {
        const position = this.el.getAttribute('position');
        const rotationRad = THREE.MathUtils.degToRad(this.state.currentRotation);
        
        const forwardX = Math.sin(rotationRad);
        const forwardZ = Math.cos(rotationRad);
        
        const movementSensitivity = ENHANCED_CONTROLS_CONFIG.TOUCH_MOVEMENT_SENSITIVITY;
        const moveX = -forwardX * deltaY * movementSensitivity;
        const moveZ = -forwardZ * deltaY * movementSensitivity;
        
        this.el.setAttribute('position', {
          x: position.x + moveX,
          y: position.y,
          z: position.z + moveZ
        });
        
        if (ENHANCED_CONTROLS_CONFIG.ENABLE_MOVEMENT_DEBUG_LOGS) {
          console.log(`➡️ Movimento (touch): X=${moveX.toFixed(3)}, Z=${moveZ.toFixed(3)}`);
        }
      }
      
      // Atualizar posições dos dois toques
      this.state.lastTouchX = touch1.clientX;
      this.state.lastTouchY = touch1.clientY;
      this.state.touch2X = touch2.clientX;
      this.state.touch2Y = touch2.clientY;
    }
  },
  
  /**
   * =====================================================
   * ON TOUCH END - FINALIZAÇÃO DE TOQUE
   * =====================================================
   * 
   * Chamado quando dedos são retirados da tela.
   */
  onTouchEnd: function (event) {
    if (ENHANCED_CONTROLS_CONFIG.ENABLE_TOUCH_DEBUG_LOGS) {
      console.log(`👆 onTouchEnd! Toques restantes: ${event.touches.length}`);
    }
    
    // Se ainda há toques, atualizar estado
    if (event.touches.length > 0) {
      this.state.touchCount = event.touches.length;
      
      // Atualizar posições dos toques restantes
      this.state.lastTouchX = event.touches[0].clientX;
      this.state.lastTouchY = event.touches[0].clientY;
      
      if (event.touches.length >= 2) {
        this.state.touch2X = event.touches[1].clientX;
        this.state.touch2Y = event.touches[1].clientY;
      }
    } else {
      // Nenhum toque restante
      this.state.isTouching = false;
      this.state.touchCount = 0;
      
      if (ENHANCED_CONTROLS_CONFIG.ENABLE_TOUCH_DEBUG_LOGS) {
        console.log('✅ Touch FINALIZADO');
      }
    }
  },
  
  /**
   * =====================================================
   * ON DEVICE ORIENTATION - CAPTURA DE ORIENTAÇÃO DO DISPOSITIVO
   * =====================================================
   * 
   * Captura eventos de giroscópio para controlar rotação Y (yaw) e X (pitch).
   * 
   * Parâmetros do evento:
   * - alpha: Rotação em torno do eixo Z (yaw) - 0 a 360 graus
   * - beta: Rotação em torno do eixo X (pitch) - -180 a 180 graus
   * - gamma: Rotação em torno do eixo Y (roll) - -90 a 90 graus
   * 
   * Usamos:
   * - ALPHA para controlar rotação Y (yaw)
   * - BETA para controlar pitch (olhar cima/baixo)
   */
  onDeviceOrientation: function (event) {
    // Verificar se dados do giroscópio estão disponíveis
    if (event.alpha === null || event.alpha === undefined ||
        event.beta === null || event.beta === undefined) {
      // Desktop sem giroscópio - não marcar como ativo
      return;
    }
    
    // MARCAR GIROSCÓPIO COMO ATIVO apenas quando receber dados reais
    if (!this.state.gyroActive) {
      this.state.gyroActive = true;
      console.log('✅ Giroscópio ATIVADO - dados recebidos do sensor');
    }
    
    // CALIBRAÇÃO: Armazenar valores iniciais na primeira leitura
    if (this.state.gyroInitialAlpha === null) {
      this.state.gyroInitialAlpha = event.alpha;
      this.state.gyroInitialBeta = event.beta;
      console.log(`🧭 Giroscópio calibrado - Alpha: ${event.alpha.toFixed(1)}°, Beta: ${event.beta.toFixed(1)}°`);
    }
    
    // ===== CALCULAR YAW (ALPHA) - MESMA LÓGICA DO PITCH =====
    let relativeAlpha = event.alpha - this.state.gyroInitialAlpha;
    
    // Normalizar para -180 a 180 (igual ao pitch)
    if (relativeAlpha > 180) {
      relativeAlpha -= 360;
    } else if (relativeAlpha < -180) {
      relativeAlpha += 360;
    }
    
    // Usar valor direto (mesma abordagem do pitch)
    this.state.gyroTargetRotation = relativeAlpha;
    
    // ===== CALCULAR PITCH (BETA) - IGUAL AO ANTERIOR =====
    let relativeBeta = event.beta - this.state.gyroInitialBeta;
    
    // Limitar pitch a -90 a 90 graus
    relativeBeta = Math.max(-90, Math.min(90, relativeBeta));
    
    // Usar valor direto
    this.state.gyroTargetPitch = relativeBeta;
    
    if (ENHANCED_CONTROLS_CONFIG.ENABLE_GYRO_DEBUG_LOGS) {
      console.log(`🧭 Gyro - Alpha: ${event.alpha.toFixed(1)}°, Beta: ${event.beta.toFixed(1)}°`);
      console.log(`     Target Yaw: ${this.state.gyroTargetRotation.toFixed(1)}°, Pitch: ${this.state.gyroTargetPitch.toFixed(1)}°`);
    }
  },

  /**
   * =====================================================
   * ON KEY DOWN - DETECÇÃO DE TECLA PRESSIONADA
   * =====================================================
   * 
   * Chamado quando qualquer tecla é pressionada.
   * Atualiza o estado do componente conforme a tecla.
   */
  onKeyDown: function (event) {
    // Prevenir ações repetidas (keydown contínuo)
    if (event.repeat) return;
    
    const key = event.key.toLowerCase();
    
    // ===== ROTAÇÃO (Q/E) =====
    if (this.data.enableRotation) {
      if (key === 'q') {
        this.state.rotatingLeft = true;
        console.log('⬅️ Rotação esquerda ativada');
      } else if (key === 'e') {
        this.state.rotatingRight = true;
        console.log('➡️ Rotação direita ativada');
      }
    }
    
    // ===== MOVIMENTO (WASD) =====
    if (this.data.enableMovement) {
      if (key === 'w') {
        this.state.movingForward = true;
      } else if (key === 's') {
        this.state.movingBackward = true;
      } else if (key === 'a') {
        this.state.movingLeft = true;
      } else if (key === 'd') {
        this.state.movingRight = true;
      }
    }
    
    // ===== CORRIDA (SHIFT) - FUTURO =====
    // if (this.data.enableRun && event.shiftKey) {
    //   this.state.isRunning = true;
    //   console.log('🏃 Corrida ativada');
    // }
    
    // ===== PULO (SPACE) - FUTURO =====
    // if (this.data.enableJump && key === ' ') {
    //   if (!this.state.isJumping) {
    //     this.startJump();
    //   }
    // }
    
    // ===== AGACHAR (CTRL/C) - FUTURO =====
    // if (this.data.enableCrouch && (event.ctrlKey || key === 'c')) {
    //   this.state.isCrouching = true;
    //   console.log('🧎 Agachado');
    // }
  },

  /**
   * =====================================================
   * ON KEY UP - DETECÇÃO DE TECLA SOLTA
   * =====================================================
   * 
   * Chamado quando qualquer tecla é solta.
   * Desativa o estado correspondente.
   */
  onKeyUp: function (event) {
    const key = event.key.toLowerCase();
    
    // ===== ROTAÇÃO (Q/E) =====
    if (this.data.enableRotation) {
      if (key === 'q') {
        this.state.rotatingLeft = false;
        console.log('⬅️ Rotação esquerda desativada');
      } else if (key === 'e') {
        this.state.rotatingRight = false;
        console.log('➡️ Rotação direita desativada');
      }
    }
    
    // ===== MOVIMENTO (WASD) =====
    if (this.data.enableMovement) {
      if (key === 'w') {
        this.state.movingForward = false;
      } else if (key === 's') {
        this.state.movingBackward = false;
      } else if (key === 'a') {
        this.state.movingLeft = false;
      } else if (key === 'd') {
        this.state.movingRight = false;
      }
    }
    
    // ===== CORRIDA (SHIFT) - FUTURO =====
    // if (this.data.enableRun && !event.shiftKey) {
    //   this.state.isRunning = false;
    //   console.log('🚶 Corrida desativada');
    // }
    
    // ===== AGACHAR (CTRL/C) - FUTURO =====
    // if (this.data.enableCrouch && (event.ctrlKey || key === 'c')) {
    //   this.state.isCrouching = false;
    //   console.log('🧍 De pé');
    // }
  },

  /**
   * =====================================================
   * TICK - LOOP DE ATUALIZAÇÃO (60 FPS)
   * =====================================================
   * 
   * Executado a cada frame (~16ms a 60 FPS).
   * Aplica transformações suaves baseadas no estado.
   * 
   * @param {number} time - Tempo total desde início (ms)
   * @param {number} timeDelta - Tempo desde último frame (ms)
   */
  tick: function (time, timeDelta) {
    // Converter timeDelta de ms para segundos
    const deltaSeconds = timeDelta / 1000;
    
    // ===== ATUALIZAR ROTAÇÃO =====
    if (this.data.enableRotation) {
      this.updateRotation(deltaSeconds);
    }
    
    // ===== ATUALIZAR MOVIMENTO =====
    if (this.data.enableMovement) {
      this.updateMovement(deltaSeconds);
    }
    
    // Mouse drag não precisa de update no tick (usa eventos)
    
    // ===== ATUALIZAR PULO - FUTURO =====
    // if (this.data.enableJump && this.state.isJumping) {
    //   this.updateJump(time);
    // }
    
    // ===== ATUALIZAR AGACHAR - FUTURO =====
    // if (this.data.enableCrouch) {
    //   this.updateCrouch(deltaSeconds);
    // }
  },

  /**
   * =====================================================
   * UPDATE ROTATION - APLICAR ROTAÇÃO SUAVE
   * =====================================================
   * 
   * Calcula e aplica rotação baseada no estado atual.
   * Usa deltaSeconds para movimento frame-independent.
   * 
   * SISTEMA DE PRIORIDADES (NOVO):
   * 
   * MOBILE:
   *   PRIORIDADE 1: Toque (1 dedo) - controle manual direto
   *   PRIORIDADE 2: Giroscópio - quando não há toque recente
   * 
   * DESKTOP:
   *   PRIORIDADE 1: Mouse (botão esquerdo) - controle manual direto
   *   PRIORIDADE 2: Teclado (Q/E) - quando não há mouse recente
   * 
   * Lógica: Se controle manual foi usado nos últimos 500ms,
   * desabilita controle automático (giroscópio/teclado).
   * 
   * @param {number} deltaSeconds - Tempo desde último frame (s)
   */
  updateRotation: function (deltaSeconds) {
    const currentTime = performance.now();
    
    // Verificar se houve interação manual recente
    const timeSinceMouseInteraction = currentTime - this.state.lastMouseInteraction;
    const timeSinceTouchInteraction = currentTime - this.state.lastTouchInteraction;
    const disableDuration = ENHANCED_CONTROLS_CONFIG.GYRO_DISABLE_DURATION;
    
    // Flags de controle
    const mouseRecentlyUsed = timeSinceMouseInteraction < disableDuration;
    const touchRecentlyUsed = timeSinceTouchInteraction < disableDuration;
    const touchCurrentlyActive = this.state.isTouching;  // Verifica se está tocando AGORA
    
    // ===== DEBUG: Log detalhado do estado =====
    if (ENHANCED_CONTROLS_CONFIG.ENABLE_UPDATE_ROTATION_DEBUG) {
      const rotation = this.el.getAttribute('rotation');
      console.log('=== updateRotation DEBUG ===');
      console.log(`Rotação atual Y: ${rotation.y.toFixed(2)}°`);
      console.log(`currentRotation (state): ${this.state.currentRotation.toFixed(2)}°`);
      console.log(`gyroActive: ${this.state.gyroActive}`);
      console.log(`mouseRecentlyUsed: ${mouseRecentlyUsed} (${timeSinceMouseInteraction.toFixed(0)}ms)`);
      console.log(`touchRecentlyUsed: ${touchRecentlyUsed} (${timeSinceTouchInteraction.toFixed(0)}ms)`);
      console.log(`rotatingLeft: ${this.state.rotatingLeft}, rotatingRight: ${this.state.rotatingRight}`);
    }
    
    // ===== PRIORIDADE 1 (MOBILE): TOQUE =====
    // Toque controla rotação diretamente via onTouchMove
    // Apenas desabilita giroscópio se necessário
    
    // ===== PRIORIDADE 2 (MOBILE): GIROSCÓPIO =====
    // Apenas se NÃO houver toque ativo E nem toque recente
    if (this.data.enableGyroRotation && 
        this.state.gyroActive && 
        this.state.gyroInitialAlpha !== null &&
        !touchCurrentlyActive &&
        !touchRecentlyUsed) {
      
      if (ENHANCED_CONTROLS_CONFIG.ENABLE_UPDATE_ROTATION_DEBUG) {
        console.log('🧭 GIROSCÓPIO está controlando!');
        console.log(`  gyroTargetRotation: ${this.state.gyroTargetRotation.toFixed(2)}°`);
        console.log(`  gyroTargetPitch: ${this.state.gyroTargetPitch.toFixed(2)}°`);
      }
      
      const smoothing = this.data.gyroSmoothing;
      const rotation = this.el.getAttribute('rotation');
      
      // ===== YAW (HORIZONTAL) - MESMA LÓGICA DO PITCH =====
      const currentYaw = rotation.y;
      const yawDiff = this.state.gyroTargetRotation - currentYaw;
      
      // Normalizar diferença para -180 a 180 (caminho mais curto)
      let normalizedYawDiff = yawDiff;
      if (normalizedYawDiff > 180) {
        normalizedYawDiff -= 360;
      } else if (normalizedYawDiff < -180) {
        normalizedYawDiff += 360;
      }
      
      // Aplicar suavização YAW (igual ao pitch)
      const newYaw = currentYaw + (normalizedYawDiff * smoothing);
      
      // ===== PITCH (VERTICAL) - MESMA LÓGICA =====
      const currentPitch = rotation.x;
      const pitchDiff = this.state.gyroTargetPitch - currentPitch;
      const newPitch = currentPitch + (pitchDiff * smoothing);
      
      // Aplicar ambos YAW + PITCH
      this.el.setAttribute('rotation', {
        x: newPitch,    // Pitch (giroscópio suavizado)
        y: newYaw,      // Yaw (giroscópio suavizado)
        z: rotation.z
      });
      
      if (ENHANCED_CONTROLS_CONFIG.ENABLE_UPDATE_ROTATION_DEBUG) {
        console.log(`  Aplicado - newYaw: ${newYaw.toFixed(2)}°, newPitch: ${newPitch.toFixed(2)}°`);
      }
      
      // Atualizar currentRotation para manter sincronia
      this.state.currentRotation = newYaw;
    }
    // ===== PRIORIDADE 1 (DESKTOP): MOUSE =====
    // Mouse controla rotação diretamente via onMouseMove
    // Apenas desabilita teclado se necessário
    
    // ===== PRIORIDADE 2 (DESKTOP): TECLADO (Q/E) =====
    // Apenas se não houver mouse recente E giroscópio inativo E TECLAS PRESSIONADAS
    else if (!mouseRecentlyUsed && !this.state.gyroActive) {
      
      // 🔍 VERIFICAR SE ALGUMA TECLA ESTÁ PRESSIONADA
      const anyKeyPressed = this.state.rotatingLeft || this.state.rotatingRight;
      
      if (ENHANCED_CONTROLS_CONFIG.ENABLE_UPDATE_ROTATION_DEBUG) {
        console.log(`⌨️ Bloco teclado acessado - anyKeyPressed: ${anyKeyPressed}`);
      }
      
      // SÓ APLICAR se alguma tecla estiver pressionada
      if (anyKeyPressed) {
        
        // Obter rotação atual UMA VEZ (para usar em vários lugares)
        const rotation = this.el.getAttribute('rotation');
        
        // 🔄 SINCRONIZAR currentRotation APENAS NA PRIMEIRA TECLA após mouse
        // Usa flag para sincronizar UMA VEZ e não a cada frame
        if (!this.state.keyboardHasSynced) {
          const rotationYDiff = Math.abs(rotation.y - this.state.currentRotation);
          
          if (rotationYDiff > 0.1) {
            if (ENHANCED_CONTROLS_CONFIG.ENABLE_UPDATE_ROTATION_DEBUG) {
              console.log(`🔄 SINCRONIZANDO currentRotation (PRIMEIRA VEZ): ${this.state.currentRotation.toFixed(2)}° → ${rotation.y.toFixed(2)}°`);
            }
            this.state.currentRotation = rotation.y;
          }
          this.state.keyboardHasSynced = true; // Marca como sincronizado
        }
      
      if (ENHANCED_CONTROLS_CONFIG.ENABLE_UPDATE_ROTATION_DEBUG) {
        console.log('⌨️ TECLADO está controlando!');
      }
      // Calcular quanto rotacionar neste frame
      const rotationAmount = this.data.rotationSpeed * deltaSeconds;
      
      if (ENHANCED_CONTROLS_CONFIG.ENABLE_UPDATE_ROTATION_DEBUG) {
        console.log(`  rotationAmount: ${rotationAmount.toFixed(4)}°`);
      }
      
      // Atualizar rotação acumulada conforme teclas pressionadas
      if (this.state.rotatingLeft) {
        this.state.currentRotation += rotationAmount;
        if (ENHANCED_CONTROLS_CONFIG.ENABLE_UPDATE_ROTATION_DEBUG) {
          console.log(`  Q pressionado: ${this.state.currentRotation.toFixed(2)}°`);
        }
      }
      if (this.state.rotatingRight) {
        this.state.currentRotation -= rotationAmount;
        if (ENHANCED_CONTROLS_CONFIG.ENABLE_UPDATE_ROTATION_DEBUG) {
          console.log(`  E pressionado: ${this.state.currentRotation.toFixed(2)}°`);
        }
      }
      
      // Normalizar rotação (manter entre 0-360)
      const beforeNormalization = this.state.currentRotation;
      this.state.currentRotation = this.state.currentRotation % ENHANCED_CONTROLS_CONFIG.ROTATION_FULL_CIRCLE;
      if (this.state.currentRotation < ENHANCED_CONTROLS_CONFIG.ROTATION_MIN) {
        this.state.currentRotation += ENHANCED_CONTROLS_CONFIG.ROTATION_FULL_CIRCLE;
      }
      
      if (ENHANCED_CONTROLS_CONFIG.ENABLE_UPDATE_ROTATION_DEBUG && beforeNormalization !== this.state.currentRotation) {
        console.log(`  ⚠️ NORMALIZAÇÃO: ${beforeNormalization.toFixed(2)}° → ${this.state.currentRotation.toFixed(2)}°`);
      }
      
      // ===== APLICAR ROTAÇÃO DO TECLADO =====
      // Reutilizar a variável 'rotation' já obtida antes
      
      if (ENHANCED_CONTROLS_CONFIG.ENABLE_UPDATE_ROTATION_DEBUG) {
        console.log(`  Aplicando - Y antes: ${rotation.y.toFixed(2)}°, Y depois: ${this.state.currentRotation.toFixed(2)}°`);
      }
      
      this.el.setAttribute('rotation', {
        x: rotation.x,                    // Pitch (look-controls)
        y: this.state.currentRotation,    // Yaw (teclado)
        z: rotation.z
      });
      } // FIM if (anyKeyPressed)
      else {
        if (ENHANCED_CONTROLS_CONFIG.ENABLE_UPDATE_ROTATION_DEBUG) {
          console.log('  ⚠️ Bloco teclado acessado MAS nenhuma tecla pressionada - IGNORANDO');
        }
      }
    } // FIM else if (!mouseRecentlyUsed && !gyroActive)
    else {
      if (ENHANCED_CONTROLS_CONFIG.ENABLE_UPDATE_ROTATION_DEBUG) {
        console.log('❌ NENHUM CONTROLE ativo (idle)');
      }
    }
    
    if (ENHANCED_CONTROLS_CONFIG.ENABLE_UPDATE_ROTATION_DEBUG) {
      console.log('=== FIM updateRotation ===\n');
    }
  },
  
  /**
   * =====================================================
   * UPDATE MOVEMENT - APLICAR MOVIMENTO RELATIVO
   * =====================================================
   * 
   * Calcula e aplica movimento baseado na rotação Y atual.
   * CORREÇÃO: W sempre move para frente RELATIVO ao olhar,
   * não em coordenadas globais.
   * 
   * @param {number} deltaSeconds - Tempo desde último frame (s)
   */
  updateMovement: function (deltaSeconds) {
    // Calcular distância a mover neste frame
    const moveDistance = this.data.moveSpeed * deltaSeconds;
    
    // Obter posição atual
    const position = this.el.getAttribute('position');
    
    // Converter rotação Y para radianos (Three.js R125+)
    const rotationRad = THREE.MathUtils.degToRad(this.state.currentRotation);
    
    // Calcular vetores de direção baseados na rotação atual
    // FRENTE/TRÁS: baseado na rotação Y
    const forwardX = Math.sin(rotationRad);
    const forwardZ = Math.cos(rotationRad);
    
    // ESQUERDA/DIREITA: perpendicular à direção frontal
    const rightX = Math.cos(rotationRad);
    const rightZ = -Math.sin(rotationRad);
    
    // Aplicar movimento baseado nas teclas pressionadas
    let deltaX = 0;
    let deltaZ = 0;
    
    if (this.state.movingForward) {
      deltaX -= forwardX * moveDistance;  // W: sempre para frente
      deltaZ -= forwardZ * moveDistance;
    }
    if (this.state.movingBackward) {
      deltaX += forwardX * moveDistance;  // S: sempre para trás
      deltaZ += forwardZ * moveDistance;
    }
    if (this.state.movingLeft) {
      deltaX -= rightX * moveDistance;    // A: sempre para esquerda
      deltaZ -= rightZ * moveDistance;
    }
    if (this.state.movingRight) {
      deltaX += rightX * moveDistance;    // D: sempre para direita
      deltaZ += rightZ * moveDistance;
    }
    
    // Aplicar nova posição
    this.el.setAttribute('position', {
      x: position.x + deltaX,
      y: position.y,                      // Y inalterado (sem voo)
      z: position.z + deltaZ
    });
  },

  /**
   * =====================================================
   * REMOVE - LIMPEZA DO COMPONENTE
   * =====================================================
   * 
   * Executado quando o componente é removido.
   * Remove event listeners para evitar memory leaks.
   */
  remove: function () {
    console.log('🗑️ Enhanced Controls: Removendo event listeners');
    
    // Remover event listeners de teclado
    if (this.data.enableRotation || this.data.enableMovement) {
      window.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('keyup', this.onKeyUp);
    }
    
    // Remover event listeners de mouse do canvas
    if (this.data.enableMouseDrag && this.canvas) {
      this.canvas.removeEventListener('mousedown', this.onMouseDown, { capture: true });
      this.canvas.removeEventListener('mousemove', this.onMouseMove, { capture: true });
      this.canvas.removeEventListener('mouseup', this.onMouseUp, { capture: true });
    }
    
    // Remover event listeners de toque do canvas
    if (this.data.enableTouchControls && this.canvas) {
      this.canvas.removeEventListener('touchstart', this.onTouchStart, { capture: true });
      this.canvas.removeEventListener('touchmove', this.onTouchMove, { capture: true });
      this.canvas.removeEventListener('touchend', this.onTouchEnd, { capture: true });
      this.canvas.removeEventListener('touchcancel', this.onTouchEnd, { capture: true });
    }
    
    // Remover event listener de giroscópio
    if (this.data.enableGyroRotation) {
      window.removeEventListener('deviceorientation', this.onDeviceOrientation, true);
    }
    
    console.log('✅ Enhanced Controls: Removido com sucesso');
  }

  /**
   * =====================================================
   * MÉTODOS FUTUROS (PREPARADOS PARA IMPLEMENTAÇÃO)
   * =====================================================
   */
  
  // setupRun: function () {
  //   console.log('🏃 Enhanced Controls: Configurando corrida');
  //   // Modificar velocidade do wasd-controls quando Shift pressionado
  // },
  
  // setupJump: function () {
  //   console.log('🦘 Enhanced Controls: Configurando pulo');
  //   // Configurar física de pulo (parábola)
  // },
  
  // setupCrouch: function () {
  //   console.log('🧎 Enhanced Controls: Configurando agachar');
  //   // Modificar altura da câmera
  // },
  
  // startJump: function () {
  //   console.log('⬆️ Pulando!');
  //   this.state.isJumping = true;
  //   this.state.jumpStartTime = performance.now();
  //   const position = this.el.getAttribute('position');
  //   this.state.initialHeight = position.y;
  // },
  
  // updateJump: function (time) {
  //   // Calcular posição Y baseada em física de pulo (parábola)
  //   const elapsed = time - this.state.jumpStartTime;
  //   const progress = elapsed / this.data.jumpDuration;
  //   
  //   if (progress >= 1) {
  //     // Pulo completo
  //     this.state.isJumping = false;
  //     const position = this.el.getAttribute('position');
  //     this.el.setAttribute('position', {
  //       x: position.x,
  //       y: this.state.initialHeight,
  //       z: position.z
  //     });
  //   } else {
  //     // Aplicar parábola: y = -4h(x-0.5)² + h
  //     const height = -4 * this.data.jumpHeight * Math.pow(progress - 0.5, 2) + this.data.jumpHeight;
  //     const position = this.el.getAttribute('position');
  //     this.el.setAttribute('position', {
  //       x: position.x,
  //       y: this.state.initialHeight + height,
  //       z: position.z
  //     });
  //   }
  // },
  
  // updateCrouch: function (deltaSeconds) {
  //   const position = this.el.getAttribute('position');
  //   const targetHeight = this.state.isCrouching 
  //     ? this.state.initialHeight * this.data.crouchHeight 
  //     : this.state.initialHeight;
  //   
  //   // Interpolação suave
  //   const newHeight = position.y + (targetHeight - position.y) * deltaSeconds * 5;
  //   this.el.setAttribute('position', {
  //     x: position.x,
  //     y: newHeight,
  //     z: position.z
  //   });
  // }
});

console.log('📦 Enhanced Controls: Componente registrado com sucesso');
