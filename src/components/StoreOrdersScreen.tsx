import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  MessageCircle, 
  Phone, 
  User, 
  FileText, 
  DollarSign, 
  Edit,
  ShoppingBag
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Order, Product, User as UserType, Store } from '../App';
import { ordersAPI, productsAPI, usersAPI } from '../utils/api';
import { notifyOrderConfirmed } from '../utils/notifications';

type StoreOrdersScreenProps = {
  currentUser: UserType;
  store: Store;
  onOpenChat?: (buyerId: string, buyerName: string) => void;
};

type OrderWithDetails = Order & {
  buyer: UserType;
  products: Array<{
    product: Product;
    quantity: number;
    price: number;
    selectedImageIndex?: number;
  }>;
};

// Componente individual para cada pedido pendiente con ajuste de precio
function PendingOrderCard({ 
  order, 
  onConfirm, 
  onCancel, 
  onOpenChat 
}: { 
  order: OrderWithDetails; 
  onConfirm: (orderId: string, adjustedTotal?: number, sellerNotes?: string) => void;
  onCancel: (orderId: string) => void;
  onOpenChat?: (buyerId: string, buyerName: string) => void;
}) {
  const [isAdjustingPrice, setIsAdjustingPrice] = useState(false);
  const [adjustedTotal, setAdjustedTotal] = useState(order.total.toString());
  const [sellerNotes, setSellerNotes] = useState('');

  const handleConfirm = () => {
    const newTotal = parseFloat(adjustedTotal);
    
    // Validar que el precio sea válido
    if (isNaN(newTotal) || newTotal <= 0) {
      alert('Por favor ingresa un precio válido');
      return;
    }

    // Si el precio cambió, requerir una nota
    if (newTotal !== order.total && !sellerNotes.trim()) {
      alert('Por favor agrega una nota explicando el cambio de precio');
      return;
    }

    // Si el precio es diferente, confirmar
    if (newTotal !== order.total) {
      if (!confirm(`¿Confirmar pedido con nuevo total de Q ${newTotal.toFixed(2)}? El comprador será notificado del cambio.`)) {
        return;
      }
      onConfirm(order.id, newTotal, sellerNotes);
    } else {
      onConfirm(order.id);
    }
  };

  return (
    <Card className="p-6">
      {/* Order Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-lg">{order.buyer.name}</span>
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
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-yellow-50 text-yellow-600">
          <Clock className="w-4 h-4" />
          <span>Pendiente</span>
        </div>
      </div>

      {/* Products */}
      <div className="space-y-3 mb-4">
        {order.products.map((item, index) => (
          <div key={index} className="flex gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
              <ImageWithFallback
                src={item.product.images[item.selectedImageIndex ?? 0]}
                alt={item.product.title}
                className="w-full h-full object-cover"
              />
              {item.selectedImageIndex !== undefined && item.product.images.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs px-1 py-0.5 text-center">
                  Ref {item.selectedImageIndex + 1}/{item.product.images.length}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm text-gray-900 truncate">{item.product.title}</h4>
              {item.selectedImageIndex !== undefined && item.product.images.length > 1 && (
                <p className="text-xs text-blue-600 mb-1">
                  📸 Imagen {item.selectedImageIndex + 1} de {item.product.images.length} (referencia del cliente)
                </p>
              )}
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
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-emerald-600 mb-1">Notas del comprador:</p>
              <p className="text-sm text-gray-700">{order.buyerNotes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Price Adjustment Section */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-medium text-blue-900">Ajustar Precio del Pedido</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdjustingPrice(!isAdjustingPrice)}
            className="text-blue-600"
          >
            <Edit className="w-4 h-4 mr-1" />
            {isAdjustingPrice ? 'Cancelar' : 'Editar'}
          </Button>
        </div>

        {!isAdjustingPrice ? (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total actual:</span>
            <span className="text-xl text-emerald-600 font-medium">Q {order.total.toFixed(2)}</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-blue-700 mb-1">Nuevo Total (Q)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={adjustedTotal}
                onChange={(e) => setAdjustedTotal(e.target.value)}
                placeholder="0.00"
                className="text-lg"
              />
              {parseFloat(adjustedTotal) !== order.total && (
                <p className="text-xs text-blue-600 mt-1">
                  Diferencia: Q {(parseFloat(adjustedTotal) - order.total).toFixed(2)}
                  {parseFloat(adjustedTotal) > order.total ? ' más' : ' menos'}
                </p>
              )}
            </div>

            {parseFloat(adjustedTotal) !== order.total && (
              <div>
                <label className="block text-xs text-blue-700 mb-1">
                  Nota para el comprador (explica el cambio) *
                </label>
                <Textarea
                  value={sellerNotes}
                  onChange={(e) => setSellerNotes(e.target.value)}
                  placeholder="Ej: El pedido es para 50 personas en lugar de 30, lo cual requiere más ingredientes y trabajo..."
                  rows={3}
                  className="text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Esta nota se mostrará al comprador junto con el nuevo precio
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buyer Contact */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">Contacto del comprador:</p>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-gray-500" />
          <a
            href={`https://wa.me/502${order.buyer.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            {order.buyer.phone}
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={handleConfirm}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {parseFloat(adjustedTotal) !== order.total ? 'Confirmar con Nuevo Precio' : 'Confirmar Pedido'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (onOpenChat) {
              onOpenChat(order.buyerId, order.buyer.name);
            }
          }}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Contactar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`https://wa.me/502${order.buyer.phone.replace(/\D/g, '')}`, '_blank')}
        >
          <Phone className="w-4 h-4 mr-2" />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCancel(order.id)}
          className="text-red-600 hover:text-red-700"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Rechazar
        </Button>
      </div>

      {/* Status Info */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ Nuevo pedido. Revisa los detalles{order.buyerNotes ? ' y las notas del comprador' : ''}. Ajusta el precio si es necesario antes de confirmar.
        </p>
      </div>
    </Card>
  );
}

export function StoreOrdersScreen({ currentUser, store, onOpenChat }: StoreOrdersScreenProps) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);

  useEffect(() => {
    loadOrders();
  }, [store.id]);

  const loadOrders = async () => {
    try {
      const ordersResult = await ordersAPI.getAll();
      const productsResult = await productsAPI.getAll();
      const usersResult = await usersAPI.getAll();

      if (!ordersResult.success || !productsResult.success || !usersResult.success) {
        setOrders([]);
        return;
      }

      const allOrders = ordersResult.data as Order[];
      const products = productsResult.data as Product[];
      const users = usersResult.data as UserType[];

      // Get orders for current store
      const storeOrders = allOrders
        .filter(order => order.storeId === store.id)
        .map(order => {
          const buyer = users.find(u => u.id === order.buyerId);
          
          if (!buyer) return null;

          const orderProducts = order.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return null;
            return {
              product,
              quantity: item.quantity,
              price: item.price,
              selectedImageIndex: item.selectedImageIndex,
            };
          }).filter(p => p !== null) as OrderWithDetails['products'];

          return {
            ...order,
            buyer,
            products: orderProducts,
          };
        })
        .filter(order => order !== null) as OrderWithDetails[];

      // Sort by date (newest first)
      storeOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setOrders(storeOrders);
    } catch (error) {
      console.error('Error cargando órdenes:', error);
      setOrders([]);
    }
  };

  const confirmOrder = async (orderId: string, adjustedTotal?: number, sellerNotes?: string) => {
    try {
      // Find the order to get buyer details
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Orden no encontrada');
      }
      
      const result = await ordersAPI.update(orderId, {
        status: 'confirmed',
        adjustedTotal: adjustedTotal,
        sellerNotes: sellerNotes,
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Error al confirmar pedido');
      }
      
      await loadOrders();
      
      const priceWasAdjusted = adjustedTotal !== undefined;
      if (priceWasAdjusted) {
        toast.success(`Pedido confirmado con nuevo total de Q ${adjustedTotal!.toFixed(2)}`);
      } else {
        toast.success('Pedido confirmado. Contacta al comprador para coordinar la entrega.');
      }

      // Notify the buyer about order confirmation
      notifyOrderConfirmed(order.buyerId, store.name, orderId, priceWasAdjusted);
    } catch (error) {
      console.error('Error al confirmar pedido:', error);
      toast.error('No se pudo confirmar el pedido');
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm('¿Rechazar este pedido?')) return;

    try {
      const result = await ordersAPI.update(orderId, { status: 'cancelled' });
      if (!result.success) {
        throw new Error(result.error || 'Error al rechazar pedido');
      }
      await loadOrders();
      toast.success('Pedido rechazado');
    } catch (error) {
      console.error('Error al rechazar pedido:', error);
      toast.error('No se pudo rechazar el pedido');
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
      case 'completed': return <ShoppingBag className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl text-gray-900">Pedidos Recibidos</h2>
        {pendingCount > 0 && (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm w-fit">
            {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl text-gray-600 mb-2">
            No hay pedidos
          </h3>
          <p className="text-gray-500">
            Aún no has recibido pedidos en tu tienda
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            order.status === 'pending' ? (
              <PendingOrderCard
                key={order.id}
                order={order}
                onConfirm={confirmOrder}
                onCancel={cancelOrder}
                onOpenChat={onOpenChat}
              />
            ) : (
              <Card key={order.id} className="p-6">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-lg">{order.buyer.name}</span>
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
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                        <ImageWithFallback
                          src={item.product.images[item.selectedImageIndex ?? 0]}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                        {item.selectedImageIndex !== undefined && item.product.images.length > 1 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs px-1 py-0.5 text-center">
                            Ref {item.selectedImageIndex + 1}/{item.product.images.length}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-gray-900 truncate">{item.product.title}</h4>
                        {item.selectedImageIndex !== undefined && item.product.images.length > 1 && (
                          <p className="text-xs text-blue-600 mb-1">
                            📸 Imagen {item.selectedImageIndex + 1} de {item.product.images.length} (referencia del cliente)
                          </p>
                        )}
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
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-emerald-600 mb-1">Notas del comprador:</p>
                        <p className="text-sm text-gray-700">{order.buyerNotes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Seller Notes (if price was adjusted) */}
                {order.sellerNotes && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-blue-600 mb-1">Nota enviada al comprador:</p>
                        <p className="text-sm text-gray-700">{order.sellerNotes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t mb-4">
                  <span className="text-lg">Total</span>
                  <span className="text-xl text-emerald-600">Q {order.total.toFixed(2)}</span>
                </div>

                {/* Buyer Contact */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Contacto del comprador:</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a
                      href={`https://wa.me/502${order.buyer.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      {order.buyer.phone}
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {order.status === 'confirmed' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (onOpenChat) {
                            onOpenChat(order.buyerId, order.buyer.name);
                          }
                        }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contactar Comprador
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://wa.me/502${order.buyer.phone.replace(/\D/g, '')}`, '_blank')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                      <p className="text-sm text-gray-500 flex items-center">
                        ⏳ Esperando confirmación de entrega del comprador
                      </p>
                    </>
                  )}

                  {order.status === 'completed' && (
                    <p className="text-sm text-emerald-600">
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
                {order.status === 'confirmed' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ✓ Pedido confirmado. Coordina la entrega con el comprador. El pedido se completará cuando el comprador confirme que lo recibió.
                    </p>
                  </div>
                )}
              </Card>
            )
          ))}
        </div>
      )}
    </div>
  );
}