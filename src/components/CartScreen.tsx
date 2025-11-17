import { ShoppingCart, Trash2, Plus, Minus, MessageSquare, ArrowLeft, Store as StoreIcon, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import type { User, Product, CartItem, Store, Order } from '../App';
import { productsAPI, storesAPI, ordersAPI } from '../utils/api';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { notifyNewOrder } from '../utils/notifications';

type CartScreenProps = {
  currentUser: User;
  onCartUpdate: () => void;
};

type CartItemWithProduct = CartItem & {
  product: Product;
  store: Store;
};

export function CartScreen({ currentUser, onCartUpdate }: CartScreenProps) {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [buyerNotes, setBuyerNotes] = useState('');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const cartStr = localStorage.getItem('cart');
    if (!cartStr) {
      setCartItems([]);
      return;
    }

    try {
      // Cargar productos y tiendas desde Supabase
      const productsResult = await productsAPI.getAll();
      const storesResult = await storesAPI.getAll();

      if (!productsResult.success || !storesResult.success) {
        setCartItems([]);
        return;
      }

      const cart: CartItem[] = JSON.parse(cartStr);
      const products = productsResult.data as Product[];
      const stores = storesResult.data as Store[];

      const itemsWithProduct = cart
        .map(item => {
          const product = products.find(p => p.id === item.productId);
          const store = stores.find(s => s.id === item.storeId);
          if (product && store) {
            return { ...item, product, store };
          }
          return null;
        })
        .filter(item => item !== null) as CartItemWithProduct[];

      setCartItems(itemsWithProduct);
    } catch (error) {
      console.error('Error cargando carrito:', error);
      setCartItems([]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const cartStr = localStorage.getItem('cart');
    if (!cartStr) return;

    const cart: CartItem[] = JSON.parse(cartStr);
    const itemIndex = cart.findIndex(item => item.productId === productId);

    if (itemIndex >= 0) {
      cart[itemIndex].quantity += delta;
      if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
      }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    onCartUpdate();
    loadCart();
  };

  const removeItem = (productId: string, selectedImageIndex?: number) => {
    const cartStr = localStorage.getItem('cart');
    if (!cartStr) return;

    const cart: CartItem[] = JSON.parse(cartStr);
    const updatedCart = cart.filter(item => item.productId !== productId || item.selectedImageIndex !== selectedImageIndex);

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    onCartUpdate();
    loadCart();
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    try {
      // Group items by store
      const ordersByStore = new Map<string, CartItemWithProduct[]>();
      cartItems.forEach(item => {
        const storeItems = ordersByStore.get(item.storeId) || [];
        storeItems.push(item);
        ordersByStore.set(item.storeId, storeItems);
      });

      // Create orders in Supabase
      for (const [storeId, items] of ordersByStore.entries()) {
        const orderTotal = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        
        const order: Order = {
          id: Date.now().toString() + Math.random(),
          buyerId: currentUser.id,
          storeId,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            selectedImageIndex: item.selectedImageIndex,
          })),
          total: orderTotal,
          status: 'pending',
          createdAt: new Date().toISOString(),
          buyerNotes: buyerNotes.trim() || undefined,
        };
        
        // Guardar orden en Supabase
        const result = await ordersAPI.create(order);
        if (!result.success) {
          throw new Error(result.error || 'Error al crear orden');
        }
        
        // Notify store owner about new order (still using localStorage for notifications)
        const store = items[0].store;
        if (store) {
          notifyNewOrder(
            store.userId,
            currentUser.name,
            order.id,
            orderTotal
          );
        }
      }

      // Clear cart and notes
      localStorage.setItem('cart', JSON.stringify([]));
      setBuyerNotes('');
      onCartUpdate();
      setCartItems([]);

      toast.success('¡Pedido realizado con éxito!', {
        description: 'El vendedor recibirá tu solicitud',
      });
    } catch (error) {
      console.error('Error creando pedido:', error);
      toast.error('Error al realizar el pedido', {
        description: 'Por favor intenta nuevamente',
      });
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <Card className="p-8 sm:p-12 text-center">
          <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl text-gray-600 mb-2">Tu carrito está vacío</h2>
          <p className="text-sm sm:text-base text-gray-500">
            Explora productos y agrégalos a tu carrito
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <h2 className="text-xl sm:text-2xl text-gray-900 mb-4 sm:mb-6">Mi Carrito</h2>

      <div className="space-y-4 mb-6">
        {cartItems.map((item, index) => (
          <Card key={`${item.productId}-${item.selectedImageIndex ?? 0}-${index}`} className="p-4">
            <div className="flex gap-3 sm:gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                <ImageWithFallback
                  src={item.product.images[item.selectedImageIndex ?? 0]}
                  alt={item.product.title}
                  className="w-full h-full object-cover"
                />
                {item.selectedImageIndex !== undefined && item.product.images.length > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-emerald-600 text-white text-xs px-1 py-0.5 text-center">
                    Ref: Img {item.selectedImageIndex + 1}/{item.product.images.length}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg text-gray-900 mb-1 line-clamp-2">
                  {item.product.title}
                </h3>
                
                {/* Categoría */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                    {item.product.category}
                  </span>
                </div>
                
                {item.selectedImageIndex !== undefined && item.product.images.length > 1 && (
                  <p className="text-xs text-emerald-600 mb-2">
                    📸 Imagen {item.selectedImageIndex + 1} de {item.product.images.length} como referencia
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                  <StoreIcon className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{item.store.name}</span>
                </div>
                
                <p className="text-lg sm:text-xl text-emerald-600 mb-3">
                  Q {item.product.price.toFixed(2)}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.productId, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max="999"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQty = parseInt(e.target.value);
                        if (!isNaN(newQty) && newQty > 0 && newQty <= 999) {
                          const diff = newQty - item.quantity;
                          updateQuantity(item.productId, diff);
                        }
                      }}
                      className="w-14 sm:w-16 text-center h-9"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.productId, 1)}
                      disabled={item.quantity >= 999}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.productId, item.selectedImageIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>Q {total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Envío</span>
            <span>Por coordinar</span>
          </div>
          <div className="border-t pt-3 flex justify-between text-xl">
            <span>Total</span>
            <span className="text-emerald-600">Q {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Notas del comprador */}
        <div className="mb-6 space-y-2">
          <Label htmlFor="buyer-notes" className="flex items-center gap-2 text-gray-700">
            <MessageSquare className="w-4 h-4" />
            Notas adicionales (opcional)
          </Label>
          <Textarea
            id="buyer-notes"
            placeholder="Especifica detalles como dirección de entrega, horario preferido, instrucciones especiales, etc."
            value={buyerNotes}
            onChange={(e) => setBuyerNotes(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 text-right">
            {buyerNotes.length}/500 caracteres
          </p>
        </div>

        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          onClick={handleCheckout}
        >
          Realizar Pedido
        </Button>

        <p className="text-xs text-gray-500 text-center mt-4">
          El vendedor se pondrá en contacto contigo para confirmar el pedido y
          coordinar la entrega
        </p>
      </Card>
    </div>
  );
}