/**
 * GENERATE.JS - Gerador Automático de Páginas HTML - Zonas 11
 * Sistema otimizado para servidor docs/ com URLs absolutas
 * 
 * @version 2.0.0
 * @author Zonas 11 Team
 */

// 🌐 CONFIGURAÇÃO GLOBAL (SOMENTE DOCS/)
const CONFIG = {
  baseURL: 'https://rodrigorez.github.io/zonas11/',
  servidor: 'docs/', // Raiz do servidor
  caminhoAssets: 'assets/',
  caminhoCSV: '../csv/',
  performance: true, // Prioriza performance sobre efeitos
  debug: false // Oculta controles de desenvolvimento
};

// 📄 TEMPLATE BASE PARA GALERIA AR
const TEMPLATE_GALERIA = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITULO_GALERIA}} - Zonas 11</title>
    
    <!-- A-Frame e AR.js -->
    <script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/jeromeetienne/AR.js@3.4.5/aframe/build/aframe-ar.min.js"></script>
    
    <style>
        body { margin: 0; overflow: hidden; font-family: Arial, sans-serif; }
        
        /* Interface oculta por padrão (preferência do usuário) */
        .dev-controls { display: none; }
        .loading-indicator { 
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8); color: white; padding: 20px;
            border-radius: 8px; text-align: center; font-size: 16px;
            z-index: 1000;
        }
        .loading-indicator.hidden { display: none; }
        
        /* Performance otimizada */
        a-scene { 
            background: transparent;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
        }
    </style>
</head>
<body>
    <!-- Indicador de carregamento -->
    <div id="loading-indicator" class="loading-indicator">
        <div>🎯 Carregando Galeria AR...</div>
        <div class="loading-details" style="font-size: 12px; margin-top: 10px;">
            Iniciando experiência imersiva
        </div>
    </div>

    <!-- Cena AR -->
    <a-scene 
        embedded 
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;">
        
        <!-- Container dos marcadores -->
        <a-entity id="markers-container"></a-entity>
        
        <!-- Câmera -->
        <a-entity camera></a-entity>
    </a-scene>

    <!-- Módulo JavaScript -->
    <script src="js/galeria.js"></script>
    
    <script>
        // 📊 DADOS DOS MARCADORES (CAMINHOS ABSOLUTOS)
        const MARCADORES_GALERIA = [
            {{DADOS_MARCADORES}}
        ];
        
        // 🚀 INICIALIZAÇÃO AUTOMÁTICA
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('🎯 Iniciando Galeria AR - Zonas 11');
            console.log('📁 Servidor: docs/ (URLs absolutas)');
            
            // Aguarda recursos carregarem
            setTimeout(async () => {
                if (window.GaleriaAR && window.GaleriaAR.inicializar) {
                    await window.GaleriaAR.inicializar(MARCADORES_GALERIA);
                } else {
                    console.error('❌ Módulo GaleriaAR não carregado');
                }
            }, 1000);
        });
    </script>
</body>
</html>`;

// 📄 TEMPLATE BASE PARA MUNDO VR
const TEMPLATE_MUNDO = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITULO_MUNDO}} - Zonas 11</title>
    
    <!-- A-Frame -->
    <script src="https://aframe.io/releases/1.7.0/aframe.min.js"></script>
    
    <style>
        body { 
            margin: 0; 
            overflow: hidden; 
            font-family: Arial, sans-serif;
            background: url('{{FUNDO_MUNDO}}') center/cover;
        }
        
        /* Performance otimizada */
        a-scene { 
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
        }
    </style>
</head>
<body>
    <!-- Cena VR -->
    <a-scene background="color: {{COR_FUNDO}}">
        <!-- Assets -->
        <a-assets>
            {{ASSETS_OBRAS}}
        </a-assets>
        
        <!-- Container das obras -->
        <a-entity id="obras-container"></a-entity>
    </a-scene>

    <!-- Módulo JavaScript -->
    <script src="../js/mundo.js"></script>
    
    <script>
        // 📊 DADOS DAS OBRAS (CAMINHOS ABSOLUTOS)
        const OBRAS_MUNDO = [
            {{DADOS_OBRAS}}
        ];
        
        // 🚀 INICIALIZAÇÃO AUTOMÁTICA
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('🌍 Iniciando Mundo VR - {{TITULO_MUNDO}}');
            
            if (window.MundoVR && window.MundoVR.inicializar) {
                await window.MundoVR.inicializar(OBRAS_MUNDO);
            }
        });
    </script>
</body>
</html>`;

// 📄 TEMPLATE BASE PARA OBRA
const TEMPLATE_OBRA = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITULO_OBRA}} - Zonas 11</title>
    
    <style>
        body { 
            margin: 0; 
            font-family: Arial, sans-serif;
            background: url('{{FUNDO_OBRA}}') center/cover;
            overflow-y: auto; /* Habilita rolagem */
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: rgba(255,255,255,0.95);
            min-height: 100vh;
        }
        
        h1 { color: #2C3E50; margin-bottom: 10px; }
        .autor { color: #7F8C8D; font-size: 18px; margin-bottom: 20px; }
        .sinopse { line-height: 1.6; margin-bottom: 30px; }
        .video-container { margin: 20px 0; }
        
        /* Navegação */
        .navegacao-obras {
            margin-top: 40px;
            text-align: center;
        }
        
        .btn-navegacao {
            margin: 0 10px;
            padding: 12px 24px;
            background: #3498DB;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .btn-navegacao:hover {
            background: #2980B9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>{{TITULO_OBRA}}</h1>
        <div class="autor">{{AUTOR_OBRA}}</div>
        <div class="sinopse">{{SINOPSE_OBRA}}</div>
        
        <!-- Container de vídeo -->
        <div id="video-container" class="video-container"></div>
        
        <!-- Navegação será inserida dinamicamente -->
    </div>

    <!-- Módulo JavaScript -->
    <script src="../js/obra.js"></script>
    
    <script>
        // 📊 DADOS DA OBRA
        const DADOS_OBRA = {
            idObra: '{{ID_OBRA}}',
            tituloObra: '{{TITULO_OBRA}}',
            autor: '{{AUTOR_OBRA}}',
            sinopse: '{{SINOPSE_OBRA}}',
            videoUrl: '{{VIDEO_URL}}'
        };
        
        // 🚀 INICIALIZAÇÃO AUTOMÁTICA
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('📖 Carregando obra: {{TITULO_OBRA}}');
            
            if (window.ObraVirtual && window.ObraVirtual.inicializar) {
                await window.ObraVirtual.inicializar(DADOS_OBRA);
            }
        });
    </script>
</body>
</html>`;

// 🔧 FUNÇÃO PARA GERAR GALERIA
function gerarGaleria(dadosMarcadores, nomeArquivo = 'index.html') {
    console.log('🏗️ Gerando galeria principal...');
    
    // Processa dados dos marcadores
    const marcadoresJS = dadosMarcadores.map(m => {
        return `{
            idGaleria: "${m.idGaleria}",
            idMarcador: "${m.idMarcador}",
            tipoMarcador: "${m.tipoMarcador}",
            nomeMarcador: "${m.nomeMarcador}",
            modelo3D: "${m.modelo3D}",
            escalaModelo: "${m.escalaModelo}",
            animacaoRotacao: "${m.animacaoRotacao}",
            velocidadeRotacao: "${m.velocidadeRotacao}",
            corTema: "${m.corTema}",
            urlMundo: "${m.urlMundo}"
        }`;
    }).join(',\n            ');
    
    // Substitui placeholders
    let html = TEMPLATE_GALERIA
        .replace('{{TITULO_GALERIA}}', 'Galeria Principal')
        .replace('{{DADOS_MARCADORES}}', marcadoresJS);
    
    return { arquivo: nomeArquivo, conteudo: html };
}

// 🔧 FUNÇÃO PARA GERAR MUNDO
function gerarMundo(dadosObras, nomeMundo, corFundo = '#87CEEB') {
    console.log(`🌍 Gerando mundo: ${nomeMundo}...`);
    
    // Processa assets das obras
    const assets = dadosObras.map((obra, index) => 
        `<a-asset-item id="modelo-${index}" src="${CONFIG.baseURL}${obra.modeloObra}"></a-asset-item>`
    ).join('\n            ');
    
    // Processa dados das obras
    const obrasJS = dadosObras.map(obra => {
        return `{
            idObra: "${obra.idObra}",
            nomeObra: "${obra.tituloObra}",
            modeloObra: "${obra.modeloObra}",
            escala: "1.0 1.0 1.0",
            urlObra: "obras/obra${obra.idObra}.html"
        }`;
    }).join(',\n            ');
    
    // Substitui placeholders
    let html = TEMPLATE_MUNDO
        .replace('{{TITULO_MUNDO}}', nomeMundo)
        .replace('{{FUNDO_MUNDO}}', `${CONFIG.baseURL}assets/img/fundo_mundo01.jpg`)
        .replace('{{COR_FUNDO}}', corFundo)
        .replace('{{ASSETS_OBRAS}}', assets)
        .replace('{{DADOS_OBRAS}}', obrasJS);
    
    return { arquivo: `mundos/${nomeMundo.toLowerCase().replace(/\s+/g, '')}.html`, conteudo: html };
}

// 🔧 FUNÇÃO PARA GERAR OBRA
function gerarObra(dadosObra) {
    console.log(`📖 Gerando obra: ${dadosObra.tituloObra}...`);
    
    // Substitui placeholders
    let html = TEMPLATE_OBRA
        .replace(/{{ID_OBRA}}/g, dadosObra.idObra)
        .replace(/{{TITULO_OBRA}}/g, dadosObra.tituloObra)
        .replace(/{{AUTOR_OBRA}}/g, dadosObra.autor)
        .replace(/{{SINOPSE_OBRA}}/g, dadosObra.sinopse)
        .replace(/{{VIDEO_URL}}/g, dadosObra.videoUrl || '')
        .replace('{{FUNDO_OBRA}}', `${CONFIG.baseURL}assets/img/fundo_mundo01.jpg`);
    
    return { arquivo: `obras/obra${dadosObra.idObra}.html`, conteudo: html };
}

// 🚀 EXPORTA FUNÇÕES PRINCIPAIS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        gerarGaleria,
        gerarMundo,
        gerarObra,
        CONFIG
    };
} else {
    window.GeneradorZonas11 = {
        gerarGaleria,
        gerarMundo,
        gerarObra,
        CONFIG
    };
}