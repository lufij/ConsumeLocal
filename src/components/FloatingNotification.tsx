import { useState, useEffect } from 'react';
import { Bell, X, Package, MessageCircle, Heart, DollarSign, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import type { Notification } from '../App';

type FloatingNotificationProps = {
  userId: string;
  onNavigate: (notification: Notification) => void;
};

export function FloatingNotification({ userId, onNavigate }: FloatingNotificationProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // Poll for new notifications every 2 seconds
    const interval = setInterval(loadNotifications, 2000);
    
    return () => clearInterval(interval);
  }, [userId]);

  const loadNotifications = () => {
    const notificationsStr = localStorage.getItem('notifications');
    if (!notificationsStr) {
      setNotifications([]);
      return;
    }

    const allNotifications: Notification[] = JSON.parse(notificationsStr);
    const userNotifications = allNotifications
      .filter(n => n.userId === userId && !n.read)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setNotifications(userNotifications);
  };

  const markAsRead = (notificationId: string) => {
    const notificationsStr = localStorage.getItem('notifications');
    if (!notificationsStr) return;

    const allNotifications: Notification[] = JSON.parse(notificationsStr);
    const updated = allNotifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    
    localStorage.setItem('notifications', JSON.stringify(updated));
    loadNotifications();
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setShowList(false);
    onNavigate(notification);
  };

  const markAllAsRead = () => {
    const notificationsStr = localStorage.getItem('notifications');
    if (!notificationsStr) return;

    const allNotifications: Notification[] = JSON.parse(notificationsStr);
    const updated = allNotifications.map(n => 
      n.userId === userId ? { ...n, read: true } : n
    );
    
    localStorage.setItem('notifications', JSON.stringify(updated));
    loadNotifications();
    setShowList(false);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5 text-yellow-600" />;
      case 'order_confirmed':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'price_adjusted':
        return <DollarSign className="w-5 h-5 text-blue-600" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-600" />;
      case 'favorite':
        return <Heart className="w-5 h-5 text-pink-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Ahora';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
    return `Hace ${Math.floor(seconds / 86400)}d`;
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Notification Button */}
      <button
        onClick={() => setShowList(!showList)}
        className="fixed bottom-24 right-4 z-50 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full p-4 shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-110 animate-bounce"
        style={{ animationDuration: '2s' }}
      >
        <div className="relative">
          <Bell className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        </div>
      </button>

      {/* Notification List */}
      {showList && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-emerald-50">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-gray-900">
                  Notificaciones ({notifications.length})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-emerald-600"
                  >
                    Marcar todas
                  </Button>
                )}
                <button
                  onClick={() => setShowList(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="w-full p-4 border-b hover:bg-gray-50 transition-colors text-left flex gap-3 items-start"
                >
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {notification.title}
                      </h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {getTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {notification.message}
                    </p>
                    {notification.type === 'order' && (
                      <div className="mt-2 inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        Nuevo Pedido
                      </div>
                    )}
                    {notification.type === 'message' && (
                      <div className="mt-2 inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        Nuevo Mensaje
                      </div>
                    )}
                    {notification.type === 'favorite' && (
                      <div className="mt-2 inline-block px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded">
                        ❤️ Favorito
                      </div>
                    )}
                    {notification.type === 'order_confirmed' && (
                      <div className="mt-2 inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded">
                        Pedido Confirmado
                      </div>
                    )}
                    {notification.type === 'price_adjusted' && (
                      <div className="mt-2 inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        Precio Ajustado
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t bg-gray-50 text-center">
              <p className="text-xs text-gray-500">
                Toca una notificación para ver los detalles
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
