// Setup del manifest para PWA
// Crea el link tag del manifest dinámicamente

export function setupManifest() {
  // Verificar si ya existe
  const existingManifest = document.querySelector('link[rel="manifest"]');
  if (existingManifest) {
    console.log('✅ Manifest ya configurado');
    return;
  }

  // Crear el manifest como data URL si el archivo no está disponible
  const manifestData = {
    name: "Gualán Market - Tu Mercado Local",
    short_name: "Gualán Market",
    description: "Mercado virtual de Gualán, Zacapa, Guatemala. Compra y vende productos locales de forma segura.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#10b981",
    background_color: "#ffffff",
    categories: ["shopping", "business", "lifestyle"],
    scope: "/",
    lang: "es-GT",
    dir: "ltr",
    icons: [
      {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2310b981;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23059669;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='192' height='192' fill='url(%23grad)'/%3E%3Crect x='30' y='40' width='132' height='100' rx='8' fill='none' stroke='white' stroke-width='8'/%3E%3Cline x1='30' y1='60' x2='162' y2='60' stroke='white' stroke-width='8'/%3E%3Cline x1='96' y1='40' x2='96' y2='60' stroke='white' stroke-width='8'/%3E%3Ccircle cx='65' cy='110' r='12' fill='white'/%3E%3Ccircle cx='127' cy='110' r='12' fill='white'/%3E%3C/svg%3E",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2310b981;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23059669;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='512' height='512' fill='url(%23grad)'/%3E%3Crect x='80' y='100' width='352' height='270' rx='20' fill='none' stroke='white' stroke-width='20'/%3E%3Cline x1='80' y1='160' x2='432' y2='160' stroke='white' stroke-width='20'/%3E%3Cline x1='256' y1='100' x2='256' y2='160' stroke='white' stroke-width='20'/%3E%3Ccircle cx='175' cy='290' r='30' fill='white'/%3E%3Ccircle cx='337' cy='290' r='30' fill='white'/%3E%3C/svg%3E",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable"
      }
    ],
    shortcuts: [
      {
        name: "Inicio",
        short_name: "Inicio",
        description: "Ver productos disponibles",
        url: "/?source=shortcut",
        icons: [
          {
            src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2310b981;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23059669;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='192' height='192' fill='url(%23grad)'/%3E%3Cpath d='M96 50 L50 85 L50 140 L142 140 L142 85 Z' fill='white'/%3E%3C/svg%3E",
            sizes: "192x192"
          }
        ]
      },
      {
        name: "Mi Tienda",
        short_name: "Tienda",
        description: "Administrar mi tienda",
        url: "/?screen=store&source=shortcut",
        icons: [
          {
            src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2310b981;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23059669;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='192' height='192' fill='url(%23grad)'/%3E%3Crect x='30' y='40' width='132' height='100' rx='8' fill='none' stroke='white' stroke-width='8'/%3E%3C/svg%3E",
            sizes: "192x192"
          }
        ]
      },
      {
        name: "Carrito",
        short_name: "Carrito",
        description: "Ver mi carrito de compras",
        url: "/?screen=cart&source=shortcut",
        icons: [
          {
            src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2310b981;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23059669;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='192' height='192' fill='url(%23grad)'/%3E%3Crect x='30' y='40' width='132' height='100' rx='8' fill='none' stroke='white' stroke-width='8'/%3E%3Ccircle cx='65' cy='160' r='12' fill='white'/%3E%3Ccircle cx='127' cy='160' r='12' fill='white'/%3E%3C/svg%3E",
            sizes: "192x192"
          }
        ]
      }
    ],
    related_applications: [],
    prefer_related_applications: false
  };

  try {
    // Intentar usar el manifest.json externo primero
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    
    // Verificar si el archivo existe
    fetch('/manifest.json')
      .then(response => {
        if (response.ok) {
          console.log('✅ Usando manifest.json externo');
          document.head.appendChild(link);
        } else {
          throw new Error('Manifest externo no disponible');
        }
      })
      .catch(() => {
        console.log('⚠️ Manifest externo no disponible, usando inline');
        // Usar manifest inline
        const manifestBlob = new Blob([JSON.stringify(manifestData)], { type: 'application/json' });
        const manifestURL = URL.createObjectURL(manifestBlob);
        
        const inlineLink = document.createElement('link');
        inlineLink.rel = 'manifest';
        inlineLink.href = manifestURL;
        document.head.appendChild(inlineLink);
        
        console.log('✅ Manifest inline configurado');
      });
  } catch (error) {
    console.error('❌ Error al configurar manifest:', error);
  }
}

// Configurar meta tags para PWA
export function setupPWAMetaTags() {
  const metaTags = [
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: 'Gualán Market' },
    { name: 'theme-color', content: '#10b981' },
    { name: 'background-color', content: '#ffffff' },
  ];

  metaTags.forEach(({ name, content }) => {
    const existing = document.querySelector(`meta[name="${name}"]`);
    if (!existing) {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    }
  });

  console.log('✅ Meta tags PWA configurados');
}

// Apple Touch Icons
export function setupAppleTouchIcons() {
  const iconSVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2310b981;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23059669;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='192' height='192' fill='url(%23grad)'/%3E%3Crect x='30' y='40' width='132' height='100' rx='8' fill='none' stroke='white' stroke-width='8'/%3E%3Cline x1='30' y1='60' x2='162' y2='60' stroke='white' stroke-width='8'/%3E%3Cline x1='96' y1='40' x2='96' y2='60' stroke='white' stroke-width='8'/%3E%3Ccircle cx='65' cy='110' r='12' fill='white'/%3E%3Ccircle cx='127' cy='110' r='12' fill='white'/%3E%3C/svg%3E";

  const sizes = ['180x180', '167x167', '152x152', '120x120'];
  
  sizes.forEach(size => {
    const existing = document.querySelector(`link[rel="apple-touch-icon"][sizes="${size}"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = 'apple-touch-icon';
      link.sizes = size;
      link.href = iconSVG;
      document.head.appendChild(link);
    }
  });

  console.log('✅ Apple Touch Icons configurados');
}

// Inicializar todo
export function initializePWASetup() {
  if (typeof window === 'undefined') return;
  
  setupManifest();
  setupPWAMetaTags();
  setupAppleTouchIcons();
}
