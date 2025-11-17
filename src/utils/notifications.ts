import type { Notification } from '../App';
import { showAppNotification, isAppInFocus } from './browserNotifications';

export function createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
  const notificationsStr = localStorage.getItem('notifications');
  const notifications: Notification[] = notificationsStr ? JSON.parse(notificationsStr) : [];

  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };

  notifications.push(newNotification);
  localStorage.setItem('notifications', JSON.stringify(notifications));

  console.log('📢 Notificación creada:', newNotification);
  
  // Mostrar notificación del navegador si la app NO está en foco
  if (!isAppInFocus()) {
    showAppNotification(
      notification.type,
      notification.title,
      notification.message,
      { id: newNotification.id, screen: getScreenForNotification(notification.type) }
    );
  }
}

// Determinar a qué pantalla navegar según el tipo de notificación
function getScreenForNotification(type: Notification['type']): string {
  switch (type) {
    case 'order':
    case 'order_confirmed':
    case 'price_adjusted':
      return 'orders';
    case 'message':
      return 'messages';
    case 'favorite':
      return 'store';
    default:
      return 'home';
  }
}

// Crear notificación de nuevo pedido (para vendedor)
export function notifyNewOrder(
  storeOwnerId: string,
  buyerName: string,
  orderId: string,
  total: number
) {
  createNotification({
    userId: storeOwnerId,
    type: 'order',
    title: '🎉 Nuevo Pedido Recibido',
    message: `${buyerName} realizó un pedido por Q ${total.toFixed(2)}`,
    relatedId: orderId,
    data: {
      orderId,
    },
  });
}

// Crear notificación de pedido confirmado (para comprador)
export function notifyOrderConfirmed(
  buyerId: string,
  storeName: string,
  orderId: string,
  priceAdjusted: boolean = false
) {
  createNotification({
    userId: buyerId,
    type: priceAdjusted ? 'price_adjusted' : 'order_confirmed',
    title: priceAdjusted ? '⚠️ Precio Ajustado' : '✅ Pedido Confirmado',
    message: priceAdjusted 
      ? `${storeName} confirmó tu pedido con un nuevo precio. Revisa los detalles.`
      : `${storeName} confirmó tu pedido. Coordina la entrega.`,
    relatedId: orderId,
    data: {
      orderId,
    },
  });
}

// Crear notificación de nuevo mensaje
export function notifyNewMessage(
  receiverId: string,
  senderName: string,
  conversationId: string,
  senderId: string,
  messagePreview: string
) {
  // Evitar notificaciones duplicadas recientes (últimos 5 segundos)
  const notificationsStr = localStorage.getItem('notifications');
  if (notificationsStr) {
    const notifications: Notification[] = JSON.parse(notificationsStr);
    const recentNotification = notifications.find(
      n => 
        n.userId === receiverId &&
        n.type === 'message' &&
        n.data?.conversationId === conversationId &&
        !n.read &&
        (Date.now() - new Date(n.createdAt).getTime()) < 5000
    );
    
    if (recentNotification) {
      console.log('📢 Notificación de mensaje reciente ya existe, saltando...');
      return;
    }
  }

  createNotification({
    userId: receiverId,
    type: 'message',
    title: `💬 Mensaje de ${senderName}`,
    message: messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview,
    relatedId: conversationId,
    data: {
      conversationId,
      otherUserId: senderId,
      otherUserName: senderName,
    },
  });
}

// Crear notificación de favorito (para vendedor)
export function notifyProductFavorited(
  storeOwnerId: string,
  userName: string,
  productId: string,
  productTitle: string
) {
  createNotification({
    userId: storeOwnerId,
    type: 'favorite',
    title: '❤️ Producto agregado a favoritos',
    message: `A ${userName} le gustó "${productTitle}"`,
    relatedId: productId,
    data: {
      productId,
      productTitle,
    },
  });
}

// Limpiar notificaciones antiguas (más de 7 días)
export function cleanOldNotifications() {
  const notificationsStr = localStorage.getItem('notifications');
  if (!notificationsStr) return;

  const notifications: Notification[] = JSON.parse(notificationsStr);
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  const filtered = notifications.filter(n => {
    const notifTime = new Date(n.createdAt).getTime();
    return notifTime > sevenDaysAgo;
  });

  localStorage.setItem('notifications', JSON.stringify(filtered));
}