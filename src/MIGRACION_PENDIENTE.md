# 🔄 Migración Pendiente - Componentes Restantes

## ✅ Ya Migrados

1. **AuthScreen.tsx** - Login/Registro ✅
2. **HomeScreen.tsx** - Listado de productos ✅  
3. **AddProduct.tsx** - Crear/Editar productos ✅

## 📋 Pendientes de Migración

### Críticos (Funcionalidad Core):

#### 1. **MyStore.tsx**
```typescript
// Cambiar línea ~84:
const result = await storesAPI.getAll();
const allStores = result.success ? result.data as Store[] : [];

// Cambiar línea ~89:
const result = await productsAPI.getAll();
const allProducts = result.success ? result.data as Product[] : [];

// Cambiar línea ~199 (deleteProduct):
await productsAPI.delete(productId);
```

#### 2. **StoreSetup.tsx**
```typescript
// Cambiar la función handleSubmit (~línea 40):
import { storesAPI, usersAPI } from '../utils/api';

// En handleSubmit:
const newStore: Store = { ... };
const result = await storesAPI.create(newStore);

// Actualizar usuario:
await usersAPI.update(currentUser.id, { hasStore: true, storeId: newStore.id });
```

#### 3. **CartScreen.tsx**
```typescript
// Cambiar loadCart (~línea 30):
const productsResult = await productsAPI.getAll();
const storesResult = await storesAPI.getAll();

// handleCreateOrder (~línea 90):
const result = await ordersAPI.create(order);
```

#### 4. **OrdersScreen.tsx** y **StoreOrdersScreen.tsx**
```typescript
// Cargar órdenes:
const result = await ordersAPI.getAll();
const allOrders = result.success ? result.data as Order[] : [];

// Actualizar orden:
await ordersAPI.update(orderId, { status: newStatus });
```

#### 5. **ChatScreen.tsx** y **ChatConversation.tsx**
```typescript
// ChatScreen - loadChats:
const result = await chatsAPI.getAll();

// ChatConversation - sendMessage:
await chatsAPI.sendMessage(conversationId, message);
```

### Secundarios (Features Adicionales):

#### 6. **FavoritesScreen.tsx**
```typescript
import { favoritesAPI } from '../utils/api';

// loadFavorites:
const result = await favoritesAPI.get(currentUser.id);
```

#### 7. **ProductCard.tsx**
```typescript
// toggleFavorite:
if (isFavorite) {
  await favoritesAPI.remove(userId, productId);
} else {
  await favoritesAPI.add(userId, productId);
}
```

#### 8. **ProductDetail.tsx**, **AddReviewModal.tsx**, **ReviewsList.tsx**
```typescript
import { reviewsAPI } from '../utils/api';

// ProductDetail - loadReviews:
const result = await reviewsAPI.getByProduct(productId);

// AddReviewModal - submitReview:
await reviewsAPI.create(productId, review);
```

#### 9. **ProductOfTheDayForm.tsx**
```typescript
import { productOfTheDayAPI, productsAPI } from '../utils/api';

// Al crear producto del día:
const result = await productsAPI.create(product);
await productOfTheDayAPI.set({ productId: result.data.id, date: new Date() });
```

#### 10. **ProfileEditScreen.tsx**
```typescript
import { usersAPI } from '../utils/api';

// handleSave:
await usersAPI.update(currentUser.id, { name: newName });
```

#### 11. **StoreView.tsx**
```typescript
// loadStoreData:
const storesResult = await storesAPI.getAll();
const productsResult = await productsAPI.getAll();
```

### Utilidades:

#### 12. **utils/productOfTheDay.tsx**
```typescript
// initializeAutoCleanup y cleanupExpiredProducts:
const result = await productsAPI.getAll();
// Filtrar expirados y actualizar cada uno con:
await productsAPI.delete(product.id);
```

#### 13. **utils/share.tsx**
```typescript
import { usersAPI } from './api';

// shareApp:
const result = await usersAPI.getAll();
const userCount = result.success ? result.data.length : 0;
```

## 🎯 Patrón de Migración

### Antes (localStorage):
```typescript
const productsStr = localStorage.getItem('products');
const products: Product[] = productsStr ? JSON.parse(productsStr) : [];

// Modificar
products.push(newProduct);

// Guardar
localStorage.setItem('products', JSON.stringify(products));
```

### Después (Supabase API):
```typescript
// Leer
const result = await productsAPI.getAll();
const products = result.success ? result.data as Product[] : [];

// Crear
await productsAPI.create(newProduct);

// Actualizar
await productsAPI.update(productId, updates);

// Eliminar
await productsAPI.delete(productId);
```

## 📝 Notas

- **IMPORTANTE**: Todos los imports de API deben ser: `import { productsAPI, storesAPI, etc } from '../utils/api';`
- Todas las operaciones son asíncronas - usar `async/await`
- Manejar errores con try/catch y mostrar toasts
- El KV store es compartido entre todos los usuarios - ¡esto permite sincronización real!
- localStorage del carrito se mantiene local (por ahora) para mejor UX

## ⚡ Prioridad de Migración

1. **CRÍTICO**: MyStore, StoreSetup, CartScreen
2. **IMPORTANTE**: OrdersScreen, StoreOrdersScreen, ChatScreen
3. **NICE TO HAVE**: Favoritos, Reviews, ProductOfTheDay
