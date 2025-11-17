# ⚡ GENERAR ICONOS - INICIO RÁPIDO

## 🎯 3 Pasos Simples (3 minutos)

### 1️⃣ Extrae tu logo

```bash
npm run dev
```

- Abre: http://localhost:5173
- Click derecho en el logo → "Guardar imagen como..."
- Guárdalo donde quieras

### 2️⃣ Genera los iconos

Ve a: **https://www.pwabuilder.com/imageGenerator**

- Sube el logo
- Click "Generate"
- Click "Download"

### 3️⃣ Copia al proyecto

```bash
# Descomprime el ZIP
cd ~/Downloads
unzip pwa-images.zip -d pwa-icons

# Copia los PNG
cd /ruta/a/tu/proyecto
cp ~/Downloads/pwa-icons/*.png public/icons/
```

O arrastra manualmente los archivos PNG a `public/icons/`

---

## ✅ Verifica

```bash
# ¿Tienes 9 archivos?
ls public/icons/*.png | wc -l

# Verificador automático
node scripts/check-deployment-ready.js
```

Si todo está ✅, continúa:

```bash
git add public/icons/*.png
git commit -m "feat: add PWA icons"
git push origin main
```

---

## 📚 Más Información

- **Instrucciones detalladas:** `/ICONOS_PASO_A_PASO.md`
- **Todos los métodos:** `/GENERAR_ICONOS_RAPIDO.md`
- **Resumen completo:** `/LEER_PRIMERO_ICONOS.md`

---

**⏱️ Tiempo:** 3 minutos  
**⭐ Dificultad:** Muy fácil  
**🚀 Siguiente:** Deployment a Vercel
