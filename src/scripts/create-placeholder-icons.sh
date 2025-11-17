#!/bin/bash

# Script para crear iconos PNG placeholder usando ImageMagick
# Si ImageMagick no está instalado, usa el generador HTML en su lugar

echo "🎨 Creando iconos PNG placeholder para Gualán Market..."
echo ""

# Verificar si ImageMagick está instalado
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick no está instalado."
    echo ""
    echo "📝 Usa una de estas opciones:"
    echo ""
    echo "   1. Abre public/icons/icon-generator.html en tu navegador"
    echo "   2. Usa PWA Builder: https://www.pwabuilder.com/imageGenerator"
    echo ""
    echo "   O instala ImageMagick:"
    echo "   - macOS: brew install imagemagick"
    echo "   - Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   - Windows: https://imagemagick.org/script/download.php"
    echo ""
    exit 1
fi

# Crear directorio si no existe
mkdir -p public/icons

# Tamaños de iconos
sizes=(72 96 128 144 152 192 384 512)

# Crear cada icono
for size in "${sizes[@]}"; do
    echo "📦 Generando icon-${size}x${size}.png..."
    
    convert -size ${size}x${size} \
        gradient:#10b981-#059669 \
        -strokewidth $((size / 12)) \
        -stroke white \
        -fill none \
        \( -clone 0 \
           -draw "roundrectangle $((size/6)),$((size/4)) $((size*5/6)),$((size*3/4)) $((size/20)),$((size/20))" \
           -draw "line $((size/6)),$((size/3)) $((size*5/6)),$((size/3))" \
           -draw "line $((size/2)),$((size/4)) $((size/2)),$((size/3))" \
        \) \
        -flatten \
        -fill white \
        -draw "circle $((size/3)),$((size*2/3)) $((size/3-size/12)),$((size*2/3))" \
        -draw "circle $((size*2/3)),$((size*2/3)) $((size*2/3-size/12)),$((size*2/3))" \
        public/icons/icon-${size}x${size}.png
    
    echo "✅ Creado: icon-${size}x${size}.png"
done

# Crear icono maskable (igual que el de 512)
echo "📦 Generando maskable-icon-512x512.png..."
cp public/icons/icon-512x512.png public/icons/maskable-icon-512x512.png
echo "✅ Creado: maskable-icon-512x512.png"

echo ""
echo "🎉 ¡Todos los iconos PNG han sido creados!"
echo ""
echo "📁 Ubicación: public/icons/"
echo "📊 Total: 9 archivos PNG"
echo ""
echo "✅ Verifica con: npm run check-deployment"
echo ""
