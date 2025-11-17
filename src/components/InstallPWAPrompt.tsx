import { useState, useEffect } from 'react';
import { X, Download, Share, Plus, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  detectPlatform,
  isAppInstalled,
  shouldShowInstallPrompt,
  saveInstallPromptDismissed,
  saveInstallationState,
  type BeforeInstallPromptEvent,
} from '../utils/pwa';

type InstallPWAPromptProps = {
  onInstalled?: () => void;
  onDismissed?: () => void;
};

export function InstallPWAPrompt({ onInstalled, onDismissed }: InstallPWAPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop' | 'unknown'>('unknown');
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Detectar plataforma
    const detectedPlatform = detectPlatform();
    setPlatform(detectedPlatform);

    // Verificar si debemos mostrar el prompt
    const canShow = shouldShowInstallPrompt();
    if (!canShow) {
      return;
    }

    // Solo mostrar para iOS, en Android usamos FloatingInstallButton
    if (detectedPlatform === 'ios') {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Para Android, no mostrar este componente ya que FloatingInstallButton lo maneja
    // Solo escuchar el evento de instalación
    const handleAppInstalled = () => {
      console.log('✅ App instalada exitosamente');
      setShowPrompt(false);
      saveInstallationState(true);
      onInstalled?.();
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    setIsInstalling(true);

    try {
      // Mostrar el prompt nativo de instalación
      await deferredPrompt.prompt();

      // Esperar la respuesta del usuario
      const { outcome } = await deferredPrompt.userChoice;
      console.log('👤 Usuario eligió:', outcome);

      if (outcome === 'accepted') {
        console.log('✅ Usuario aceptó la instalación');
        saveInstallationState(true);
        setShowPrompt(false);
        onInstalled?.();
      } else {
        console.log('❌ Usuario rechazó la instalación');
        saveInstallPromptDismissed();
        setShowPrompt(false);
        onDismissed?.();
      }
    } catch (error) {
      console.error('❌ Error al instalar:', error);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    saveInstallPromptDismissed();
    onDismissed?.();
  };

  const handleIOSInstructionsOpen = () => {
    setShowIOSInstructions(true);
  };

  const handleIOSInstructionsClose = () => {
    setShowIOSInstructions(false);
    setShowPrompt(false);
    saveInstallPromptDismissed();
    onDismissed?.();
  };

  if (!showPrompt) {
    return null;
  }

  // Prompt para iOS con instrucciones
  if (platform === 'ios') {
    return (
      <>
        {/* Banner pequeño */}
        {!showIOSInstructions && (
          <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
            <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 shadow-2xl border-0">
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1">Instalar Gualán Market</h3>
                  <p className="text-sm text-emerald-50 mb-3">
                    Instala la app en tu iPhone para acceso rápido y notificaciones
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleIOSInstructionsOpen}
                      className="bg-white text-emerald-700 hover:bg-emerald-50"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Ver instrucciones
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismiss}
                      className="text-white hover:bg-white/20"
                    >
                      Ahora no
                    </Button>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Modal con instrucciones completas para iOS */}
        {showIOSInstructions && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <Card className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold">Instalar en iPhone</h2>
                  <button
                    onClick={handleIOSInstructionsClose}
                    className="text-white/80 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-sm text-emerald-50">
                  Sigue estos pasos para instalar Gualán Market
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Paso 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      Toca el botón "Compartir"
                    </h3>
                    <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                      <div className="text-center">
                        <Share className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-600">
                          Botón en la barra inferior del Safari
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paso 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      Selecciona "Agregar a pantalla de inicio"
                    </h3>
                    <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-3">
                      <Plus className="w-10 h-10 text-gray-700 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        Busca esta opción en el menú que aparece
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paso 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      Confirma tocando "Agregar"
                    </h3>
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg p-3 text-center font-bold">
                      Agregar
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm text-emerald-900">
                    <span className="font-bold">✓ ¡Listo!</span> La app aparecerá en tu pantalla de inicio y podrás usarla como cualquier otra aplicación.
                  </p>
                </div>

                <Button
                  onClick={handleIOSInstructionsClose}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                >
                  Entendido
                </Button>
              </div>
            </Card>
          </div>
        )}
      </>
    );
  }

  // Prompt para Android con instalación automática
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <Card className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 shadow-2xl border-0">
        <div className="flex items-start gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold mb-1">Instalar Gualán Market</h3>
            <p className="text-sm text-emerald-50 mb-3">
              Instala la app para acceso rápido, notificaciones y funciona sin conexión
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleInstallClick}
                disabled={isInstalling || !deferredPrompt}
                className="bg-white text-emerald-700 hover:bg-emerald-50"
              >
                <Download className="w-4 h-4 mr-1" />
                {isInstalling ? 'Instalando...' : 'Instalar'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-white hover:bg-white/20"
              >
                Ahora no
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </Card>
    </div>
  );
}