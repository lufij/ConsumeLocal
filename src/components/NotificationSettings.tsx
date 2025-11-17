import { useState, useEffect } from 'react';
import { Bell, Volume2, VolumeX, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import {
  getNotificationSettings,
  saveNotificationSettings,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
  isNotificationSupported,
  type NotificationSettings as Settings,
} from '../utils/browserNotifications';

export function NotificationSettings() {
  const [settings, setSettings] = useState<Settings>(getNotificationSettings());
  const [permission, setPermission] = useState(getNotificationPermission());
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Actualizar estado de permisos
    setPermission(getNotificationPermission());
  }, []);

  const handleToggle = (key: keyof Settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
    
    toast.success('Configuración guardada');
  };

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    
    try {
      const result = await requestNotificationPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('¡Notificaciones activadas!');
        // Enviar notificación de prueba
        setTimeout(() => {
          sendTestNotification();
        }, 500);
      } else if (result === 'denied') {
        toast.error('Permisos denegados', {
          description: 'Puedes activarlos desde la configuración de tu navegador',
        });
      }
    } catch (error) {
      toast.error('Error al solicitar permisos');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleTestNotification = () => {
    if (permission !== 'granted') {
      toast.error('Debes activar los permisos primero');
      return;
    }
    
    sendTestNotification();
    toast.success('Notificación de prueba enviada');
  };

  if (!isNotificationSupported()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} />
            Notificaciones
          </CardTitle>
          <CardDescription>
            Tu navegador no soporta notificaciones del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Las notificaciones dentro de la app seguirán funcionando normalmente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell size={20} />
          Notificaciones
        </CardTitle>
        <CardDescription>
          Configura cómo quieres recibir notificaciones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado de permisos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Permisos del navegador</p>
              <p className="text-sm text-gray-500">
                {permission === 'granted' && '✅ Activados'}
                {permission === 'denied' && '❌ Bloqueados'}
                {permission === 'default' && '⚪ Sin configurar'}
              </p>
            </div>
            
            {permission === 'default' && (
              <Button
                onClick={handleRequestPermission}
                disabled={isRequesting}
                size="sm"
              >
                {isRequesting ? 'Solicitando...' : 'Activar'}
              </Button>
            )}
            
            {permission === 'granted' && (
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Check size={20} className="text-green-600" />
              </div>
            )}
            
            {permission === 'denied' && (
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <X size={20} className="text-red-600" />
              </div>
            )}
          </div>

          {permission === 'denied' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                Los permisos están bloqueados. Para activarlos:
              </p>
              <ol className="text-sm text-red-700 mt-2 ml-4 space-y-1 list-decimal">
                <li>Toca el icono 🔒 en la barra de direcciones</li>
                <li>Busca "Notificaciones"</li>
                <li>Cambia a "Permitir"</li>
                <li>Recarga la página</li>
              </ol>
            </div>
          )}

          {permission === 'granted' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotification}
              className="w-full"
            >
              Enviar notificación de prueba
            </Button>
          )}
        </div>

        <Separator />

        {/* Activar/desactivar notificaciones */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Notificaciones activas</p>
            <p className="text-sm text-gray-500">
              Activar o desactivar todas las notificaciones
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={() => handleToggle('enabled')}
          />
        </div>

        <Separator />

        {/* Tipos de notificaciones */}
        <div className="space-y-4">
          <p className="text-sm font-medium">Tipos de notificaciones</p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">🛒 Pedidos</p>
                <p className="text-xs text-gray-500">Nuevos pedidos y actualizaciones</p>
              </div>
              <Switch
                checked={settings.orders}
                onCheckedChange={() => handleToggle('orders')}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">💬 Mensajes</p>
                <p className="text-xs text-gray-500">Mensajes del chat</p>
              </div>
              <Switch
                checked={settings.messages}
                onCheckedChange={() => handleToggle('messages')}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">⭐ Favoritos</p>
                <p className="text-xs text-gray-500">Productos guardados</p>
              </div>
              <Switch
                checked={settings.favorites}
                onCheckedChange={() => handleToggle('favorites')}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">💰 Ajustes de precio</p>
                <p className="text-xs text-gray-500">Cambios en el total del pedido</p>
              </div>
              <Switch
                checked={settings.priceAdjustments}
                onCheckedChange={() => handleToggle('priceAdjustments')}
                disabled={!settings.enabled}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Sonido */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium flex items-center gap-2">
              {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              Sonido
            </p>
            <p className="text-sm text-gray-500">
              Reproducir sonido al recibir notificaciones
            </p>
          </div>
          <Switch
            checked={settings.soundEnabled}
            onCheckedChange={() => handleToggle('soundEnabled')}
            disabled={!settings.enabled}
          />
        </div>

        {/* Información adicional */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Las notificaciones aparecerán cuando la app esté en segundo plano.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
