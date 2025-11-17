import { useState, useEffect } from 'react';
import { Download, Settings, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { PermissionsModal } from './PermissionsModal';
import { toast } from 'sonner@2.0.3';
import { 
  checkCameraPermission, 
} from '../utils/cameraPermissions';
import { 
  getNotificationPermission, 
  isNotificationSupported 
} from '../utils/browserNotifications';

export function FloatingInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [allPermissionsGranted, setAllPermissionsGranted] = useState(false);

  // Función para revisar si todos los permisos están concedidos
  const checkAllPermissions = async () => {
    console.log('🔍 Revisando permisos...');
    
    // Verificar cámara
    const cameraResult = await checkCameraPermission();
    const cameraGranted = cameraResult.status === 'granted';
    console.log('  📷 Cámara:', cameraGranted ? 'Concedida ✅' : 'No concedida ❌');

    // Verificar notificaciones
    let notificationGranted = false;
    if (isNotificationSupported()) {
      const notifPermission = getNotificationPermission();
      notificationGranted = notifPermission === 'granted';
      console.log('  🔔 Notificaciones:', notificationGranted ? 'Concedidas ✅' : 'No concedidas ❌');
    } else {
      // Si no están soportadas, las consideramos "ok"
      notificationGranted = true;
      console.log('  🔔 Notificaciones: No soportadas (se ignoran)');
    }

    const allGranted = cameraGranted && notificationGranted;
    console.log('  ✅ Todos los permisos concedidos:', allGranted);
    
    setAllPermissionsGranted(allGranted);
    return allGranted;
  };

  useEffect(() => {
    console.log('🔍 FloatingInstallButton montado');
    
    // Detectar si es iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
    console.log('📱 Dispositivo iOS detectado:', iOS);

    // Verificar si ya está instalada
    const checkInstalled = async () => {
      // Modo standalone indica que está instalada
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (navigator as any).standalone === true;
      
      console.log('🔍 Verificando instalación:');
      console.log('  - Standalone:', isStandalone);
      console.log('  - iOS Standalone:', isIOSStandalone);
      
      const installed = isStandalone || isIOSStandalone;
      setIsInstalled(installed);
      
      // Si ya está instalada, verificar permisos
      if (installed) {
        console.log('✅ App ya instalada, revisando permisos...');
        const allGranted = await checkAllPermissions();
        
        // Solo mostrar el botón si faltan permisos
        if (!allGranted) {
          console.log('⚠️ Faltan permisos, mostrando botón');
          setShowButton(true);
        } else {
          console.log('✅ Todos los permisos concedidos, ocultando botón');
          setShowButton(false);
        }
      }
    };

    checkInstalled();

    // Listener para el evento beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('✅ ¡Evento beforeinstallprompt capturado! PWA es instalable');
      setDeferredPrompt(e);
      setShowButton(true);
      setDebugInfo('Prompt disponible');
      
      toast.success('¡App lista para instalar!', {
        description: 'Ya puedes instalar Gualán Market',
        duration: 3000,
      });
    };

    // Listener para cuando se instala la app
    const handleAppInstalled = async () => {
      console.log('🎉 PWA instalada exitosamente');
      setDeferredPrompt(null);
      setIsInstalled(true);
      setDebugInfo('Instalada');
      
      toast.success('¡App instalada!', {
        description: 'Gualán Market está en tu pantalla de inicio',
      });

      // Después de instalar, ofrecer configurar permisos
      setTimeout(() => {
        setShowPermissions(true);
      }, 1000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // En iOS, siempre mostrar el botón si no está instalada
    if (iOS && !isInstalled) {
      console.log('📱 iOS detectado, mostrando botón de instalación');
      setShowButton(true);
      setDebugInfo('iOS - Manual');
    }

    // IMPORTANTE: Mostrar el botón después de 2 segundos si no hay evento
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled && !iOS) {
        console.log('⚠️ Fallback: Mostrando botón después de 2 segundos');
        console.log('  - User Agent:', navigator.userAgent);
        console.log('  - Service Worker:', 'serviceWorker' in navigator);
        setShowButton(true);
        setDebugInfo('Fallback - No prompt');
      }
    }, 2000);

    // Revisar permisos cada 3 segundos
    const permissionsInterval = setInterval(async () => {
      if (isInstalled) {
        const allGranted = await checkAllPermissions();
        
        // Si todos los permisos están concedidos, ocultar el botón
        if (allGranted) {
          console.log('✅ Todos los permisos concedidos, ocultando botón');
          setShowButton(false);
        } else if (!showButton) {
          console.log('⚠️ Faltan permisos, mostrando botón');
          setShowButton(true);
        }
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(fallbackTimer);
      clearInterval(permissionsInterval);
    };
  }, [isInstalled, showButton]);

  const handleInstallClick = async () => {
    console.log('🔘 Botón de instalación presionado');
    console.log('📱 isIOS:', isIOS);
    console.log('💾 deferredPrompt:', deferredPrompt);
    console.log('✅ isInstalled:', isInstalled);
    
    if (isIOS) {
      // En iOS, mostrar instrucciones
      toast.info('Instalación en iOS', {
        description: 'Toca el botón Compartir y luego "Agregar a pantalla de inicio"',
        duration: 6000,
      });
      return;
    }

    if (!deferredPrompt) {
      console.log('⚠️ No hay prompt de instalación disponible');
      toast.warning('Instalación no disponible', {
        description: 'Tu navegador no soporta la instalación de PWA o ya está instalada',
        duration: 4000,
      });
      return;
    }

    try {
      // Mostrar el prompt de instalación nativo
      console.log('🚀 Mostrando prompt de instalación...');
      await deferredPrompt.prompt();

      // Esperar a que el usuario responda
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`👤 Respuesta del usuario: ${outcome}`);

      if (outcome === 'accepted') {
        console.log('✅ Usuario aceptó instalar');
        toast.success('Instalando...', {
          description: 'Gualán Market se está instalando',
        });
      } else {
        console.log('❌ Usuario rechazó instalar');
        toast.info('Instalación cancelada', {
          description: 'Puedes instalar la app en cualquier momento',
        });
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('❌ Error al instalar:', error);
      toast.error('Error', {
        description: 'No se pudo completar la instalación',
      });
    }
  };

  const handlePermissionsClick = async () => {
    setShowPermissions(true);
  };

  const handleClosePermissions = async () => {
    setShowPermissions(false);
    
    // Revisar permisos después de cerrar el modal
    const allGranted = await checkAllPermissions();
    
    // Si todos los permisos están concedidos, ocultar el botón
    if (allGranted && isInstalled) {
      console.log('✅ Todos los permisos concedidos, ocultando botón');
      setShowButton(false);
      
      toast.success('¡Configuración completa!', {
        description: 'Gualán Market está listo para usar',
        duration: 2000,
      });
    }
  };

  // No mostrar si no debe mostrarse el botón
  if (!showButton) {
    return null;
  }

  return (
    <>
      {/* Botón Flotante */}
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          onClick={isInstalled ? handlePermissionsClick : handleInstallClick}
          className={`
            ${isInstalled 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-emerald-600 hover:bg-emerald-700'
            }
            text-white shadow-lg hover:shadow-xl transition-all duration-300
            flex items-center gap-3 px-6 py-7 rounded-full
            animate-bounce
          `}
          style={{
            animation: isInstalled ? 'none' : 'bounce 2s infinite'
          }}
        >
          {isInstalled ? (
            <>
              <Settings className="w-7 h-7" />
              <span className="hidden sm:inline text-lg">Permisos</span>
            </>
          ) : (
            <>
              <Download className="w-7 h-7" />
              <span className="hidden sm:inline text-lg">Instalar App</span>
              <Smartphone className="w-7 h-7 sm:hidden" />
            </>
          )}
        </Button>
      </div>

      {/* Modal de Permisos */}
      {showPermissions && (
        <PermissionsModal onClose={handleClosePermissions} />
      )}
    </>
  );
}