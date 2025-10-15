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
 * AUTOR: Zonas 11 Project
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
    
    // Configurar módulos ativos
    if (this.data.enableRotation) {
      this.setupRotation();
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
    
    console.log('✅ Enhanced Controls: Inicializado com sucesso');
    console.log('📋 Configuração:', {
      rotação: this.data.enableRotation ? `${this.data.rotationSpeed}°/s` : 'desativada',
      corrida: this.data.enableRun ? 'ativada (FUTURO)' : 'desativada',
      pulo: this.data.enableJump ? 'ativado (FUTURO)' : 'desativado'
    });
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
   * @param {number} deltaSeconds - Tempo desde último frame (s)
   */
  updateRotation: function (deltaSeconds) {
    // Calcular quanto rotacionar neste frame
    const rotationAmount = this.data.rotationSpeed * deltaSeconds;
    
    // Aplicar rotação conforme teclas pressionadas
    if (this.state.rotatingLeft) {
      this.state.currentRotation += rotationAmount;
    }
    if (this.state.rotatingRight) {
      this.state.currentRotation -= rotationAmount;
    }
    
    // Normalizar rotação (manter entre 0-360)
    this.state.currentRotation = this.state.currentRotation % 360;
    if (this.state.currentRotation < 0) {
      this.state.currentRotation += 360;
    }
    
    // Aplicar rotação à entidade (preservar X e Z)
    if (this.state.rotatingLeft || this.state.rotatingRight) {
      const rotation = this.el.getAttribute('rotation');
      this.el.setAttribute('rotation', {
        x: rotation.x,
        y: this.state.currentRotation,
        z: rotation.z
      });
    }
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
    
    // Remover event listeners de rotação
    if (this.data.enableRotation) {
      window.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('keyup', this.onKeyUp);
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
