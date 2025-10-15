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
   * ON MOUSE DOWN - DETECÇÃO DE CLIQUE DO MOUSE
   * =====================================================
   * 
   * Inicia drag quando qualquer botão é pressionado.
   */
  onMouseDown: function (event) {
    console.log(`🖘️ onMouseDown chamado! Botão: ${event.button}`);
    
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
      
      const buttonName = event.button === 0 ? 'ESQUERDO' : 'DIREITO';
      console.log(`✅ Drag INICIADO (${buttonName}) em:`, event.clientX, event.clientY);
      console.log('🎯 Estado isDragging:', this.state.isDragging);
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
    
    // Calcular delta do mouse
    const deltaX = event.clientX - this.state.lastMouseX;
    const deltaY = event.clientY - this.state.lastMouseY;
    
    const buttonName = this.state.dragButton === 0 ? 'ESQUERDO' : 'DIREITO';
    console.log(`🖘️ Mouse delta (${buttonName}): X=${deltaX}, Y=${deltaY}`);
    
    // ===== BOTÃO ESQUERDO (0): ROTAÇÃO Y + PITCH =====
    if (this.state.dragButton === 0) {
      // HORIZONTAL = Rotação Y (substituindo yaw do look-controls)
      if (Math.abs(deltaX) > 0) {
        const rotationSensitivity = 0.3;
        const rotationDelta = -deltaX * rotationSensitivity;
        
        this.state.currentRotation += rotationDelta;
        
        // Normalizar rotação (0-360)
        this.state.currentRotation = this.state.currentRotation % 360;
        if (this.state.currentRotation < 0) {
          this.state.currentRotation += 360;
        }
        
        // Aplicar rotação Y (yaw)
        const rotation = this.el.getAttribute('rotation');
        this.el.setAttribute('rotation', {
          x: rotation.x,                    // Pitch (look-controls mantém)
          y: this.state.currentRotation,    // Yaw (enhanced-controls)
          z: rotation.z
        });
        
        console.log(`🔄 Rotação Y: ${this.state.currentRotation.toFixed(1)}°`);
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
      if (Math.abs(deltaY) > 0) {
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
        
        console.log(`➡️ Movimento: X=${moveX.toFixed(3)}, Z=${moveZ.toFixed(3)}`);
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
    console.log(`🖘️ onMouseUp chamado! Botão: ${event.button}`);
    
    // Qualquer botão (0 ou 2)
    if (event.button === 0 || event.button === 2) {
      this.state.isDragging = false;
      const buttonName = event.button === 0 ? 'ESQUERDO' : 'DIREITO';
      console.log(`✅ Drag FINALIZADO (${buttonName})`);
      console.log('🎯 Estado isDragging:', this.state.isDragging);
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
   * IMPORTANTE: Sempre aplica currentRotation para manter posição,
   * não apenas quando teclas estão pressionadas.
   * 
   * @param {number} deltaSeconds - Tempo desde último frame (s)
   */
  updateRotation: function (deltaSeconds) {
    // Calcular quanto rotacionar neste frame
    const rotationAmount = this.data.rotationSpeed * deltaSeconds;
    
    // Atualizar rotação acumulada conforme teclas pressionadas
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
    
    // SEMPRE aplicar rotação à entidade (não só quando teclas pressionadas)
    // Isso mantém a rotação acumulada mesmo após soltar as teclas
    const rotation = this.el.getAttribute('rotation');
    this.el.setAttribute('rotation', {
      x: rotation.x,                    // Pitch (look-controls)
      y: this.state.currentRotation,    // Yaw (enhanced-controls) - SEMPRE APLICADO
      z: rotation.z                     // Roll (não usado)
    });
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
