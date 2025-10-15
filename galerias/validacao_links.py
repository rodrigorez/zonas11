#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VALIDAÇÃO COMPLETA DE LINKS INTERNOS - ZONAS 11 V2.8
Verifica todos os links de navegação seguindo a lógica: Galeria → Mundo → Obra
Foco crítico: Botões "Voltar" das obras e objetos clicáveis dos mundos
"""

import re
import os
from pathlib import Path
from typing import Dict, List, Tuple

# Mapeamento esperado: Obra → Mundo VR correto
MAPA_OBRAS_MUNDOS = {
    # Mundo 1 (index2.html): Obras 1-7
    **{i: 'index2.html' for i in range(1, 8)},
    # Mundo 2 (index3.html): Obras 8-14
    **{i: 'index3.html' for i in range(8, 15)},
    # Mundo 3 (index4.html): Obras 15-21
    **{i: 'index4.html' for i in range(15, 22)},
    # Mundo 4 (index5.html): Obras 22-28
    **{i: 'index5.html' for i in range(22, 29)},
    # Mundo 5 (index6.html): Obras 29-37
    **{i: 'index6.html' for i in range(29, 38)},
    # Mundo 6 (index7.html): Obras 38-42
    **{i: 'index7.html' for i in range(38, 43)},
}

# Mapeamento: Marcador → Mundo VR
MAPA_MARCADORES_MUNDOS = {
    'barcode-0': 'index2.html',
    'barcode-1': 'index3.html',
    'barcode-2': 'index4.html',
    'barcode-3': 'index5.html',
    'barcode-4': 'index6.html',
    'barcode-5': 'index7.html',
}

# Mapeamento: Mundo → Obras
MAPA_MUNDOS_OBRAS = {
    'index2.html': list(range(1, 8)),
    'index3.html': list(range(8, 15)),
    'index4.html': list(range(15, 22)),
    'index5.html': list(range(22, 29)),
    'index6.html': list(range(29, 38)),
    'index7.html': list(range(38, 43)),
}

class ValidadorLinks:
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.erros = []
        self.avisos = []
        self.sucessos = 0
        
    def extrair_link_voltar(self, html_content: str) -> List[str]:
        """Extrai todos os links dos botões 'Voltar'"""
        pattern = r"onclick=\"window\.location\.href='([^']+)'\"[^>]*>.*?Voltar"
        return re.findall(pattern, html_content, re.IGNORECASE)
    
    def extrair_url_mundo_galeria(self, html_content: str) -> str:
        """Extrai URL da esfera 'Voltar' para galeria nos mundos VR"""
        pattern = r"url:\s*['\"]([^'\"]*galeria[^'\"]*)['\"]"
        match = re.search(pattern, html_content)
        return match.group(1) if match else None
    
    def extrair_urls_mundo_obras(self, html_content: str, mundo: str) -> List[Tuple[int, str]]:
        """Extrai URLs de redirecionamento para obras nos mundos VR"""
        # Identifica o range de obras do mundo
        obras = MAPA_MUNDOS_OBRAS.get(mundo, [])
        if not obras:
            return []
        
        pattern = r"url:\s*`([^`]*obra\$\{i\}\.html[^`]*)`"
        match = re.search(pattern, html_content)
        
        if match:
            url_template = match.group(1).replace('${i}', '{i}')
            return [(i, url_template.format(i=i)) for i in obras]
        return []
    
    def extrair_urls_galeria_mundos(self, html_content: str) -> Dict[str, str]:
        """Extrai URLs dos marcadores para mundos VR na galeria"""
        urls = {}
        for marcador, mundo_esperado in MAPA_MARCADORES_MUNDOS.items():
            pattern = rf"'{marcador}-marker'.*?url:\s*['\"]([^'\"]+)['\"]"
            match = re.search(pattern, html_content, re.DOTALL)
            if match:
                urls[marcador] = match.group(1)
        return urls
    
    def validar_obra(self, num_obra: int) -> Dict:
        """Valida links de uma obra individual"""
        arquivo = self.base_path / f"obra{num_obra}.html"
        resultado = {
            'arquivo': arquivo.name,
            'numero': num_obra,
            'mundo_esperado': MAPA_OBRAS_MUNDOS.get(num_obra),
            'erros': [],
            'avisos': [],
            'ok': True
        }
        
        if not arquivo.exists():
            resultado['erros'].append(f"❌ Arquivo não encontrado: {arquivo.name}")
            resultado['ok'] = False
            return resultado
        
        with open(arquivo, 'r', encoding='utf-8') as f:
            conteudo = f.read()
        
        links_voltar = self.extrair_link_voltar(conteudo)
        
        if not links_voltar:
            resultado['erros'].append(f"⚠️ Nenhum botão 'Voltar' encontrado")
            resultado['ok'] = False
        else:
            mundo_esperado = resultado['mundo_esperado']
            for idx, link in enumerate(links_voltar, 1):
                if mundo_esperado not in link:
                    resultado['erros'].append(
                        f"❌ Botão {idx}: Link incorreto\n"
                        f"   Esperado: .../{mundo_esperado}\n"
                        f"   Encontrado: {link}"
                    )
                    resultado['ok'] = False
                else:
                    self.sucessos += 1
        
        return resultado
    
    def validar_mundo(self, mundo: str) -> Dict:
        """Valida links de um mundo VR"""
        arquivo = self.base_path / mundo
        resultado = {
            'arquivo': mundo,
            'erros': [],
            'avisos': [],
            'ok': True
        }
        
        if not arquivo.exists():
            resultado['erros'].append(f"❌ Arquivo não encontrado: {mundo}")
            resultado['ok'] = False
            return resultado
        
        with open(arquivo, 'r', encoding='utf-8') as f:
            conteudo = f.read()
        
        # Validar link da esfera "Voltar" para galeria
        url_galeria = self.extrair_url_mundo_galeria(conteudo)
        if not url_galeria:
            resultado['erros'].append("❌ Link da esfera 'Voltar' para galeria não encontrado")
            resultado['ok'] = False
        elif 'galeria.html' not in url_galeria:
            resultado['erros'].append(
                f"❌ Link da esfera 'Voltar' incorreto\n"
                f"   Esperado: .../galeria.html\n"
                f"   Encontrado: {url_galeria}"
            )
            resultado['ok'] = False
        else:
            self.sucessos += 1
        
        # Validar links para obras
        urls_obras = self.extrair_urls_mundo_obras(conteudo, mundo)
        obras_esperadas = MAPA_MUNDOS_OBRAS.get(mundo, [])
        
        if not urls_obras:
            resultado['erros'].append(f"❌ Links para obras não encontrados")
            resultado['ok'] = False
        elif len(urls_obras) != len(obras_esperadas):
            resultado['avisos'].append(
                f"⚠️ Quantidade de obras diferente\n"
                f"   Esperado: {len(obras_esperadas)} obras\n"
                f"   Encontrado: {len(urls_obras)} links"
            )
        else:
            for num_obra, url in urls_obras:
                if f"obra{num_obra}.html" not in url:
                    resultado['erros'].append(
                        f"❌ Link obra {num_obra} incorreto: {url}"
                    )
                    resultado['ok'] = False
                else:
                    self.sucessos += 1
        
        return resultado
    
    def validar_galeria(self) -> Dict:
        """Valida links da galeria AR"""
        arquivo = self.base_path / "galeria.html"
        resultado = {
            'arquivo': 'galeria.html',
            'erros': [],
            'avisos': [],
            'ok': True
        }
        
        if not arquivo.exists():
            resultado['erros'].append("❌ Arquivo galeria.html não encontrado")
            resultado['ok'] = False
            return resultado
        
        with open(arquivo, 'r', encoding='utf-8') as f:
            conteudo = f.read()
        
        urls_marcadores = self.extrair_urls_galeria_mundos(conteudo)
        
        for marcador, mundo_esperado in MAPA_MARCADORES_MUNDOS.items():
            if marcador not in urls_marcadores:
                resultado['erros'].append(
                    f"❌ Marcador {marcador} não encontrado"
                )
                resultado['ok'] = False
            else:
                url = urls_marcadores[marcador]
                if mundo_esperado not in url:
                    resultado['erros'].append(
                        f"❌ Marcador {marcador}: Link incorreto\n"
                        f"   Esperado: .../{mundo_esperado}\n"
                        f"   Encontrado: {url}"
                    )
                    resultado['ok'] = False
                else:
                    self.sucessos += 1
        
        return resultado
    
    def gerar_relatorio(self):
        """Gera relatório completo de validação"""
        print("="*80)
        print("🔍 RELATÓRIO DE VALIDAÇÃO DE LINKS INTERNOS - ZONAS 11 V2.8")
        print("="*80)
        print()
        
        # 1. VALIDAR GALERIA AR
        print("📱 1. VALIDAÇÃO DA GALERIA AR (galeria.html)")
        print("-"*80)
        resultado_galeria = self.validar_galeria()
        self._print_resultado(resultado_galeria)
        print()
        
        # 2. VALIDAR MUNDOS VR
        print("🌍 2. VALIDAÇÃO DOS MUNDOS VR (index2-7.html)")
        print("-"*80)
        for mundo in ['index2.html', 'index3.html', 'index4.html', 
                      'index5.html', 'index6.html', 'index7.html']:
            resultado_mundo = self.validar_mundo(mundo)
            self._print_resultado(resultado_mundo)
        print()
        
        # 3. VALIDAR OBRAS (CRÍTICO)
        print("🖼️ 3. VALIDAÇÃO DAS OBRAS (obra1-42.html) - ⚠️ CRÍTICO")
        print("-"*80)
        
        erros_por_mundo = {}
        for num_obra in range(1, 43):
            resultado_obra = self.validar_obra(num_obra)
            
            if not resultado_obra['ok']:
                mundo = resultado_obra['mundo_esperado']
                if mundo not in erros_por_mundo:
                    erros_por_mundo[mundo] = []
                erros_por_mundo[mundo].append(resultado_obra)
        
        if erros_por_mundo:
            print("❌ ERROS ENCONTRADOS:")
            print()
            for mundo, obras_erro in erros_por_mundo.items():
                print(f"  🌍 {mundo}:")
                for resultado in obras_erro:
                    print(f"    📄 {resultado['arquivo']}:")
                    for erro in resultado['erros']:
                        print(f"      {erro}")
                print()
        else:
            print("✅ TODAS AS 42 OBRAS VALIDADAS COM SUCESSO!")
            print()
        
        # 4. RESUMO FINAL
        print("="*80)
        print("📊 RESUMO FINAL")
        print("="*80)
        print(f"✅ Links corretos: {self.sucessos}")
        
        total_erros = len([r for r in [resultado_galeria] if not r['ok']])
        total_erros += len(erros_por_mundo)
        
        if total_erros == 0:
            print("🎉 NENHUM ERRO ENCONTRADO - NAVEGAÇÃO 100% FUNCIONAL!")
        else:
            print(f"❌ Total de arquivos com erros: {total_erros}")
        
        print("="*80)
    
    def _print_resultado(self, resultado: Dict):
        """Imprime resultado de validação formatado"""
        status = "✅" if resultado['ok'] else "❌"
        print(f"{status} {resultado['arquivo']}")
        
        if resultado['erros']:
            for erro in resultado['erros']:
                print(f"  {erro}")
        
        if resultado['avisos']:
            for aviso in resultado['avisos']:
                print(f"  {aviso}")
        
        if resultado['ok']:
            print("  ✅ Todos os links corretos")
        print()

if __name__ == "__main__":
    # Executa validação
    base_path = Path(__file__).parent
    validador = ValidadorLinks(base_path)
    validador.gerar_relatorio()
