import { useState, useEffect } from 'react';
import { X, Camera, Bell, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  checkCameraPermission, 
  requestCameraAccess,
  stopCameraStream 
} from '../utils/cameraPermissions';
import { 
  getNotificationPermission, 
  requestNotificationPermission,
  isNotificationSupported 
} from '../utils/browserNotifications';
import { toast } from 'sonner@2.0.3';

type PermissionsModalProps = {
  onClose: () => void;
};

type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

export function PermissionsModal({ onClose }: PermissionsModalProps) {
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('prompt');
  const [notificationStatus, setNotificationStatus] = useState<PermissionStatus>('prompt');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    setLoading(true);

    // Verificar cámara
    const cameraResult = await checkCameraPermission();
    setCameraStatus(cameraResult.status);

    // Verificar notificaciones
    if (!isNotificationSupported()) {
      setNotificationStatus('unsupported');
    } else {
      const notifPermission = getNotificationPermission();
      if (notifPermission === 'granted') {
        setNotificationStatus('granted');
      } else if (notifPermission === 'denied') {
        setNotificationStatus('denied');
      } else {
        setNotificationStatus('prompt');
      }
    }

    setLoading(false);
  };

  const handleRequestCamera = async () => {
    const result = await requestCameraAccess();
    
    if (result.success) {
      setCameraStatus('granted');
      toast.success('Permiso de cámara concedido', {
        description: 'Ahora puedes tomar fotos de tus productos',
      });

      // Cerrar el stream inmediatamente, solo queríamos el permiso
      if (result.stream) {
        stopCameraStream(result.stream);
      }
    } else {
      setCameraStatus('denied');
      toast.error('Permiso denegado', {
        description: result.error || 'No se pudo acceder a la cámara',
      });
    }

    await checkPermissions();
  };

  const handleRequestNotifications = async () => {
    const result = await requestNotificationPermission();
    
    if (result === 'granted') {
      setNotificationStatus('granted');
      toast.success('Notificaciones activadas', {
        description: 'Recibirás alertas de mensajes y pedidos',
      });
    } else {
      setNotificationStatus('denied');
      toast.error('Permiso denegado', {
        description: 'No podrás recibir notificaciones',
      });
    }

    await checkPermissions();
  };

  const openSystemSettings = () => {
    toast.info('Configuración del sistema', {
      description: 'Abre la configuración de tu navegador para cambiar permisos',
      duration: 5000,
    });
  };

  const getStatusColor = (status: PermissionStatus) => {
    switch (status) {
      case 'granted':
        return 'text-emerald-600';
      case 'denied':
        return 'text-red-600';
      case 'prompt':
        return 'text-orange-600';
      case 'unsupported':
        return 'text-gray-400';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: PermissionStatus) => {
    switch (status) {
      case 'granted':
        return 'Concedido';
      case 'denied':
        return 'Denegado';
      case 'prompt':
        return 'Pendiente';
      case 'unsupported':
        return 'No soportado';
      default:
        return 'Desconocido';
    }
  };

  const getStatusIcon = (status: PermissionStatus) => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'denied':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'prompt':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'unsupported':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const allGranted = cameraStatus === 'granted' && notificationStatus === 'granted';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg">Configurar Permisos</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Verificando permisos...
            </div>
          ) : (
            <>
              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <p>
                  Para una mejor experiencia, Gualán Market necesita los siguientes permisos:
                </p>
              </div>

              {/* Permiso de Cámara */}
              <Card className={`p-4 border-2 ${
                cameraStatus === 'granted' 
                  ? 'border-emerald-200 bg-emerald-50/50' 
                  : 'border-gray-200'
              }`}>
                <div className="flex items-start gap-3">
                  <Camera className={`w-6 h-6 mt-0.5 ${
                    cameraStatus === 'granted' ? 'text-emerald-600' : 'text-gray-600'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">Cámara</h3>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(cameraStatus)}
                        <span className={`text-sm font-medium ${getStatusColor(cameraStatus)}`}>
                          {getStatusText(cameraStatus)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Toma fotos profesionales de tus productos directamente desde la app
                    </p>

                    {cameraStatus === 'prompt' && (
                      <Button
                        onClick={handleRequestCamera}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        size="sm"
                      >
                        Activar Cámara
                      </Button>
                    )}

                    {cameraStatus === 'denied' && (
                      <div className="space-y-2">
                        <p className="text-xs text-red-600">
                          Permiso denegado. Actívalo en la configuración de tu navegador.
                        </p>
                        <Button
                          onClick={openSystemSettings}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Ir a Configuración
                        </Button>
                      </div>
                    )}

                    {cameraStatus === 'granted' && (
                      <p className="text-xs text-emerald-600">
                        ✓ Ya puedes tomar fotos de tus productos
                      </p>
                    )}

                    {cameraStatus === 'unsupported' && (
                      <p className="text-xs text-gray-500">
                        Tu navegador no soporta acceso a la cámara
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Permiso de Notificaciones */}
              <Card className={`p-4 border-2 ${
                notificationStatus === 'granted' 
                  ? 'border-emerald-200 bg-emerald-50/50' 
                  : 'border-gray-200'
              }`}>
                <div className="flex items-start gap-3">
                  <Bell className={`w-6 h-6 mt-0.5 ${
                    notificationStatus === 'granted' ? 'text-emerald-600' : 'text-gray-600'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">Notificaciones</h3>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(notificationStatus)}
                        <span className={`text-sm font-medium ${getStatusColor(notificationStatus)}`}>
                          {getStatusText(notificationStatus)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Recibe alertas de nuevos mensajes, pedidos y favoritos
                    </p>

                    {notificationStatus === 'prompt' && (
                      <Button
                        onClick={handleRequestNotifications}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        size="sm"
                      >
                        Activar Notificaciones
                      </Button>
                    )}

                    {notificationStatus === 'denied' && (
                      <div className="space-y-2">
                        <p className="text-xs text-red-600">
                          Permiso denegado. Actívalo en la configuración de tu navegador.
                        </p>
                        <Button
                          onClick={openSystemSettings}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Ir a Configuración
                        </Button>
                      </div>
                    )}

                    {notificationStatus === 'granted' && (
                      <p className="text-xs text-emerald-600">
                        ✓ Recibirás notificaciones importantes
                      </p>
                    )}

                    {notificationStatus === 'unsupported' && (
                      <p className="text-xs text-gray-500">
                        Tu navegador no soporta notificaciones
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Estado General */}
              {allGranted && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm text-emerald-700 font-medium">
                    ¡Todo listo! Gualán Market está configurado
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            {allGranted ? 'Cerrar' : 'Hacerlo Después'}
          </Button>
        </div>
      </Card>
    </div>
  );
}