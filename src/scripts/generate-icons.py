#!/usr/bin/env python3
"""
Script para generar iconos PWA desde el logo de Gualán Market

Requisitos:
    pip install Pillow

Uso:
    python3 scripts/generate-icons.py

El script buscará el logo en /public/logo-source.png y generará
los 9 iconos necesarios en /public/icons/
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("❌ ERROR: Pillow no está instalado")
    print("\n📦 Para instalar:")
    print("   pip install Pillow")
    print("   # o")
    print("   pip3 install Pillow")
    print("\n💡 O usa una alternativa:")
    print("   - Abre: public/icons/generate-icons-from-logo.html")
    print("   - O usa: https://www.pwabuilder.com/imageGenerator\n")
    sys.exit(1)

# Configuración
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
LOGO_PATH = PROJECT_ROOT / 'public' / 'logo-source.png'
OUTPUT_DIR = PROJECT_ROOT / 'public' / 'icons'

ICON_SIZES = [
    {'size': 72, 'name': 'icon-72x72.png'},
    {'size': 96, 'name': 'icon-96x96.png'},
    {'size': 128, 'name': 'icon-128x128.png'},
    {'size': 144, 'name': 'icon-144x144.png'},
    {'size': 152, 'name': 'icon-152x152.png'},
    {'size': 192, 'name': 'icon-192x192.png'},
    {'size': 384, 'name': 'icon-384x384.png'},
    {'size': 512, 'name': 'icon-512x512.png'},
    {'size': 512, 'name': 'maskable-icon-512x512.png', 'maskable': True}
]

def check_logo():
    """Verificar que existe el logo"""
    if not LOGO_PATH.exists():
        print(f"❌ ERROR: No se encontró el logo en: {LOGO_PATH}")
        print("\n📝 Para extraer el logo:")
        print("1. Corre el proyecto: npm run dev")
        print("2. Abre http://localhost:5173 en el navegador")
        print("3. Abre DevTools (F12) → Network")
        print("4. Recarga la página")
        print("5. Busca el archivo .png del logo")
        print("6. Click derecho → Open in new tab → Guardar")
        print(f"7. Guarda como: {LOGO_PATH}")
        print("\n💡 O usa el método alternativo:")
        print("   - Ve a: https://www.pwabuilder.com/imageGenerator")
        print("   - Sube tu logo y descarga los iconos\n")
        sys.exit(1)

def create_output_dir():
    """Crear directorio de salida si no existe"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def generate_icon(image, size, maskable=False):
    """Generar un icono individual"""
    if maskable:
        # Para maskable, agregar padding del 10%
        padding = int(size * 0.1)
        image_size = size - (padding * 2)
        
        # Crear canvas con fondo verde oscuro
        icon = Image.new('RGB', (size, size), color='#1e4620')
        
        # Redimensionar logo y centrarlo con padding
        resized = image.resize((image_size, image_size), Image.Resampling.LANCZOS)
        icon.paste(resized, (padding, padding))
    else:
        # Sin padding para iconos normales
        icon = image.resize((size, size), Image.Resampling.LANCZOS)
    
    return icon

def generate_all_icons():
    """Generar todos los iconos"""
    print("🎨 Generando iconos PWA desde tu logo...\n")
    print(f"📂 Logo: {LOGO_PATH}")
    print(f"📂 Destino: {OUTPUT_DIR}\n")
    
    # Verificaciones
    check_logo()
    create_output_dir()
    
    try:
        # Cargar imagen
        print("⏳ Cargando logo...")
        logo = Image.open(LOGO_PATH)
        
        # Convertir a RGBA si no lo está
        if logo.mode != 'RGBA':
            logo = logo.convert('RGBA')
        
        print(f"✅ Logo cargado: {logo.width}x{logo.height}px")
        
        # Advertencia si el logo es muy pequeño
        if logo.width < 512 or logo.height < 512:
            print(f"⚠️  ADVERTENCIA: El logo es pequeño ({logo.width}x{logo.height}px)")
            print("   Se recomienda un logo de al menos 512x512px para mejor calidad")
        
        print()
        
        # Generar cada icono
        for icon_spec in ICON_SIZES:
            size = icon_spec['size']
            name = icon_spec['name']
            maskable = icon_spec.get('maskable', False)
            
            output_path = OUTPUT_DIR / name
            icon = generate_icon(logo, size, maskable)
            icon.save(output_path, 'PNG', optimize=True)
            
            print(f"✅ Generado: {name} ({size}x{size}px)")
        
        print("\n✨ ¡Todos los iconos generados exitosamente!")
        print("\n📋 Próximos pasos:")
        print("1. Verifica los iconos: ls -lh public/icons/*.png")
        print("2. Verifica el deployment: node scripts/check-deployment-ready.js")
        print("3. Haz commit: git add public/icons/*.png")
        print("4. Push: git push origin main")
        print("5. Deploy en Vercel siguiendo: DEPLOYMENT_INSTRUCTIONS.md\n")
        
    except Exception as error:
        print(f"❌ Error generando iconos: {error}")
        print("\n💡 Alternativa: Usa PWA Builder")
        print("   https://www.pwabuilder.com/imageGenerator\n")
        sys.exit(1)

if __name__ == '__main__':
    generate_all_icons()
