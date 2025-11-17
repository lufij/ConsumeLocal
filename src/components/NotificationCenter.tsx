import { useState, useEffect } from 'react';
import { X, ShoppingCart, MessageCircle, Heart, CheckCircle, DollarSign, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { cn } from './ui/utils';
import type { Notification } from '../App';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onClearAll: () => void;
}

export function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
}: NotificationCenterProps) {
  const [sortedNotifications, setSortedNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Ordenar por fecha (más recientes primero)
    const sorted = [...notifications].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setSortedNotifications(sorted);
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="text-emerald-600" size={20} />;
      case 'order_confirmed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'message':
        return <MessageCircle className="text-blue-600" size={20} />;
      case 'favorite':
        return <Heart className="text-red-600" size={20} />;
      case 'price_adjusted':
        return <DollarSign className="text-orange-600" size={20} />;
      default:
        return <ShoppingCart className="text-gray-600" size={20} />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Ahora';
    if (diffInMins < 60) return `Hace ${diffInMins} min`;
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    
    return date.toLocaleDateString('es-GT', { day: '2-digit', month: 'short' });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    onNotificationClick(notification);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Notificaciones</SheetTitle>
              <SheetDescription>
                {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X size={20} />
            </Button>
          </div>
          
          {notifications.length > 0 && (
            <div className="flex gap-2 mt-3">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  className="flex-1"
                >
                  Marcar todas como leídas
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                className="flex-1"
              >
                Limpiar todo
              </Button>
            </div>
          )}
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          {sortedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ShoppingCart size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-600 mb-1">No tienes notificaciones</p>
              <p className="text-gray-400 text-sm">
                Aquí aparecerán tus pedidos y mensajes
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'group relative p-4 rounded-lg border transition-all cursor-pointer',
                    'hover:bg-gray-50 active:bg-gray-100',
                    notification.read 
                      ? 'bg-white border-gray-200' 
                      : 'bg-emerald-50 border-emerald-200'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Badge de no leído */}
                  {!notification.read && (
                    <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-emerald-600" />
                  )}

                  <div className={cn('flex gap-3', !notification.read && 'ml-4')}>
                    {/* Icono */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm mb-1',
                        notification.read ? 'text-gray-900' : 'font-medium text-gray-900'
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNotification(notification.id);
                      }}
                      className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                        'opacity-0 group-hover:opacity-100 transition-opacity',
                        'hover:bg-red-100 active:bg-red-200'
                      )}
                    >
                      <Trash2 size={14} className="text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
