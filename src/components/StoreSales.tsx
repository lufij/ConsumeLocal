import { useState, useEffect } from 'react';
import { ShoppingBag, User, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import type { Order, Product, User as UserType } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

type StoreSalesProps = {
  storeId: string;
};

type OrderWithDetails = Order & {
  buyer: UserType;
  products: Array<{
    product: Product;
    quantity: number;
    price: number;
  }>;
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function StoreSales({ storeId }: StoreSalesProps) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);

  useEffect(() => {
    loadOrders();
  }, [storeId]);

  const loadOrders = () => {
    const ordersStr = localStorage.getItem('orders');
    const productsStr = localStorage.getItem('products');
    const usersStr = localStorage.getItem('users');

    if (!ordersStr || !productsStr || !usersStr) {
      setOrders([]);
      return;
    }

    const allOrders: Order[] = JSON.parse(ordersStr);
    const allProducts: Product[] = JSON.parse(productsStr);
    const allUsers: UserType[] = JSON.parse(usersStr);

    // Filter orders for this store
    const storeOrders = allOrders.filter(order => order.storeId === storeId);

    // Enrich with buyer and product details
    const ordersWithDetails: OrderWithDetails[] = storeOrders
      .map(order => {
        const buyer = allUsers.find(u => u.id === order.buyerId);
        if (!buyer) return null;

        const products = order.items
          .map(item => {
            const product = allProducts.find(p => p.id === item.productId);
            if (!product) return null;
            return {
              product,
              quantity: item.quantity,
              price: item.price,
            };
          })
          .filter(p => p !== null) as OrderWithDetails['products'];

        return {
          ...order,
          buyer,
          products,
        };
      })
      .filter(order => order !== null) as OrderWithDetails[];

    // Sort by date (newest first)
    ordersWithDetails.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setOrders(ordersWithDetails);
  };

  const updateOrderStatus = (
    orderId: string,
    status: Order['status']
  ) => {
    const ordersStr = localStorage.getItem('orders');
    if (!ordersStr) return;

    const allOrders: Order[] = JSON.parse(ordersStr);
    const orderIndex = allOrders.findIndex(o => o.id === orderId);

    if (orderIndex >= 0) {
      allOrders[orderIndex].status = status;
      localStorage.setItem('orders', JSON.stringify(allOrders));
      loadOrders();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-GT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (orders.length === 0) {
    return (
      <Card className="p-12 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl text-gray-600 mb-2">
          No has recibido ventas aún
        </h3>
        <p className="text-gray-500">
          Cuando los clientes compren tus productos, verás sus pedidos aquí
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl text-gray-900">Pedidos Recibidos</h3>
        <span className="bg-emerald-100 text-emerald-800 px-3 py-2 rounded-full">
          {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
        </span>
      </div>

      {orders.map(order => (
        <Card key={order.id} className="p-6">
          {/* Order Header */}
          <div className="flex items-start justify-between mb-4 pb-4 border-b">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-lg text-gray-900">
                  Pedido #{order.id.slice(0, 8)}
                </h4>
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    STATUS_COLORS[order.status]
                  }`}
                >
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{order.buyer.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl text-emerald-600">
                Q {order.total.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-3 mb-4">
            {order.products.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <ImageWithFallback
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-gray-900 truncate">
                    {item.product.title}
                  </h5>
                  <p className="text-sm text-gray-600">
                    Cantidad: {item.quantity} × Q {item.price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-600">
                    Q {(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Buyer Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h5 className="text-sm text-gray-900 mb-2">
              Información del Comprador
            </h5>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Nombre:</span> {order.buyer.name}
              </p>
              <p>
                <span className="font-medium">Teléfono:</span>{' '}
                {order.buyer.phone}
              </p>
            </div>
          </div>

          {/* Actions */}
          {order.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => updateOrderStatus(order.id, 'confirmed')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Pedido
              </Button>
              <Button
                variant="outline"
                onClick={() => updateOrderStatus(order.id, 'cancelled')}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
          {order.status === 'confirmed' && (
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => updateOrderStatus(order.id, 'completed')}
            >
              <Package className="w-4 h-4 mr-2" />
              Marcar como Completado
            </Button>
          )}
          {(order.status === 'completed' || order.status === 'cancelled') && (
            <div className="text-center text-sm text-gray-500">
              {order.status === 'completed'
                ? '✓ Pedido completado'
                : '✗ Pedido cancelado'}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
