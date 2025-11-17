import { useState, useEffect } from 'react';
import { Package, Store as StoreIcon, Clock, CheckCircle, XCircle, MessageCircle, ChevronLeft, ArrowLeft, Phone, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import type { User, Order, Product, Store as StoreType } from '../App';
import { ordersAPI, productsAPI, storesAPI, usersAPI } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

type OrdersScreenProps = {
  currentUser: User;
  onOpenChat?: (storeUserId: string, storeName: string) => void;
  onBack?: () => void;
};

type OrderWithDetails = Order & {
  store: StoreType;
  products: Array<{
    product: Product;
    quantity: number;
    price: number;
  }>;
  storeOwnerPhone?: string;
};

export function OrdersScreen({ currentUser, onOpenChat, onBack }: OrdersScreenProps) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);

  useEffect(() => {
    loadOrders();
  }, [currentUser.id]);

  const loadOrders = async () => {
    try {
      const ordersResult = await ordersAPI.getAll();
      const productsResult = await productsAPI.getAll();
      const storesResult = await storesAPI.getAll();
      const usersResult = await usersAPI.getAll();

      if (!ordersResult.success || !productsResult.success || !storesResult.success) {
        setOrders([]);
        return;
      }

      const allOrders = ordersResult.data as Order[];
      const products = productsResult.data as Product[];
      const stores = storesResult.data as StoreType[];
      const users = usersResult.success ? usersResult.data as User[] : [];

      // Get orders for current buyer
      const userOrders = allOrders
        .filter(order => order.buyerId === currentUser.id)
        .map(order => {
          const store = stores.find(s => s.id === order.storeId);
          const storeOwner = users.find(u => u.id === store?.userId);
          
          if (!store) return null;

          const orderProducts = order.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return null;
            return {
              product,
              quantity: item.quantity,
              price: item.price,
            };
          }).filter(p => p !== null) as OrderWithDetails['products'];

          return {
            ...order,
            store,
            products: orderProducts,
            storeOwnerPhone: storeOwner?.phone,
          };
        })
        .filter(order => order !== null) as OrderWithDetails[];

      // Sort by date (newest first)
      userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setOrders(userOrders);
    } catch (error) {
      console.error('Error cargando órdenes:', error);
      setOrders([]);
    }
  };

  const confirmReceived = async (orderId: string) => {
    try {
      const result = await ordersAPI.update(orderId, { status: 'completed' });
      if (!result.success) {
        throw new Error(result.error || 'Error al confirmar pedido');
      }
      await loadOrders();
      toast.success('¡Pedido completado! Gracias por tu compra.');
    } catch (error) {
      console.error('Error confirmando pedido:', error);
      toast.error('Error al confirmar pedido');
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm('¿Estás seguro de cancelar este pedido?')) return;

    try {
      const result = await ordersAPI.update(orderId, { status: 'cancelled' });
      if (!result.success) {
        throw new Error(result.error || 'Error al cancelar pedido');
      }
      await loadOrders();
      toast.success('Pedido cancelado');
    } catch (error) {
      console.error('Error cancelando pedido:', error);
      toast.error('Error al cancelar pedido');
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'confirmed': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-emerald-600 bg-emerald-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <Package className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header con botón Volver */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        {onBack && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-1 sm:gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver</span>
          </Button>
        )}
        <h2 className="text-xl sm:text-2xl text-gray-900">Mis Pedidos</h2>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl text-gray-600 mb-2">
            No hay pedidos
          </h3>
          <p className="text-gray-500">
            Aún no has realizado ningún pedido
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className="p-6">
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <StoreIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-lg">{order.store.name}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Pedido #{order.id.slice(0, 8)} • {new Date(order.createdAt).toLocaleDateString('es-GT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span>{getStatusText(order.status)}</span>
                </div>
              </div>

              {/* Products */}
              <div className="space-y-3 mb-4">
                {order.products.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <ImageWithFallback
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm text-gray-900 truncate">{item.product.title}</h4>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x Q {item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-sm text-gray-900">
                      Q {(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Buyer Notes */}
              {order.buyerNotes && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-blue-600 mb-1">Notas del comprador:</p>
                      <p className="text-sm text-gray-700">{order.buyerNotes}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Seller Notes (if price was adjusted) */}
              {order.sellerNotes && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-yellow-700 mb-1 font-medium">
                        {order.adjustedTotal ? '⚠️ El vendedor ajustó el precio del pedido:' : 'Nota del vendedor:'}
                      </p>
                      <p className="text-sm text-gray-700">{order.sellerNotes}</p>
                      {order.adjustedTotal && (
                        <p className="text-xs text-yellow-700 mt-2">
                          El precio se ajustó para reflejar los cambios solicitados.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t mb-4">
                <span className="text-lg">Total</span>
                <span className="text-xl text-emerald-600">Q {order.total.toFixed(2)}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {order.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (onOpenChat) {
                          onOpenChat(order.store.userId, order.store.name);
                        }
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contactar Vendedor
                    </Button>
                    {order.storeOwnerPhone && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.open(`https://wa.me/502${order.storeOwnerPhone!.replace(/\D/g, '')}`, '_blank');
                        }}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelOrder(order.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancelar Pedido
                    </Button>
                  </>
                )}
                
                {order.status === 'confirmed' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (onOpenChat) {
                          onOpenChat(order.store.userId, order.store.name);
                        }
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contactar Vendedor
                    </Button>
                    {order.storeOwnerPhone && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.open(`https://wa.me/502${order.storeOwnerPhone!.replace(/\D/g, '')}`, '_blank');
                        }}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => confirmReceived(order.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar Recibido
                    </Button>
                  </>
                )}

                {order.status === 'completed' && (
                  <p className="text-sm text-gray-500">
                    ✓ Pedido completado el {new Date(order.createdAt).toLocaleDateString('es-GT')}
                  </p>
                )}

                {order.status === 'cancelled' && (
                  <p className="text-sm text-red-600">
                    ✗ Pedido cancelado
                  </p>
                )}
              </div>

              {/* Status Info */}
              {order.status === 'pending' && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⏳ Esperando confirmación del vendedor. Te notificaremos cuando el vendedor acepte tu pedido.
                  </p>
                </div>
              )}
              
              {order.status === 'confirmed' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ✓ El vendedor ha confirmado tu pedido. Coordina la entrega y confirma cuando lo recibas.
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}