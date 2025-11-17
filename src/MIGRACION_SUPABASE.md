# 🚀 Migración a Supabase - Progreso

## ✅ Completado

### 1. Servidor Backend
- ✅ Creadas todas las rutas API en `/supabase/functions/server/index.tsx`
  - Users (GET, POST, PUT)
  - Products (GET, POST, PUT, DELETE)
  - Stores (GET, POST, PUT)
  - Orders (GET, POST, PUT)
  - Chats (GET, POST)
  - Favorites (GET, POST, DELETE)
  - Reviews (GET, POST)
  - Product of the Day (GET, POST)

### 2. Frontend API Client
- ✅ Creado `/utils/api.ts` con funciones para llamar al backend
- ✅ Creado `/utils/supabase/client.ts` con configuración de Supabase

### 3. Componentes Migrados
- ✅ **AuthScreen.tsx** - Login y registro usando Supabase API

## ⏳ Pendiente

### Componentes Principales a Migrar:
1. **App.tsx** - Cargar usuario actual desde Supabase
2. **HomeScreen.tsx** - Cargar productos y tiendas desde API
3. **AddProduct.tsx** - Crear productos vía API
4. **MyStore.tsx** - Gestionar tienda vía API
5. **StoreSetup.tsx** - Crear tienda vía API  
6. **Cart Screen.tsx** - Crear órdenes vía API
7. **OrdersScreen.tsx** - Cargar órdenes desde API
8. **StoreOrdersScreen.tsx** - Cargar órdenes de tienda desde API
9. **ChatScreen.tsx** - Cargar chats desde API
10. **ChatConversation.tsx** - Enviar mensajes vía API
11. **FavoritesScreen.tsx** - Gestionar favoritos vía API
12. **ProductCard.tsx** - Toggle favoritos vía API
13. **ProductDetail.tsx** - Cargar reviews desde API
14. **AddReviewModal.tsx** - Crear reviews vía API
15. **ReviewsList.tsx** - Cargar reviews desde API
16. **ProductOfTheDayForm.tsx** - Gestionar producto del día vía API
17. **ProfileEditScreen.tsx** - Actualizar perfil vía API
18. **StoreView.tsx** - Cargar información de tienda vía API

### Utilidades a Actualizar:
- `utils/favorites.ts` - Migrar a API
- `utils/reviews.ts` - Migrar a API
- `utils/productOfTheDay.tsx` - Migrar a API
- `utils/share.tsx` - Actualizar contador de usuarios

## 🎯 Estrategia de Datos

Usando KV Store de Supabase:
```
users → Array de usuarios
products → Array de productos
stores → Array de tiendas
orders → Array de órdenes
chats → Array de conversaciones con mensajes
favorites_<userId> → Array de IDs de productos favoritos por usuario
reviews_<productId> → Array de reviews por producto
productOfTheDay → Objeto con producto del día
```

## 🔧 Próximos Pasos

1. Migrar App.tsx para cargar estado inicial desde Supabase
2. Migrar HomeScreen para mostrar productos/tiendas reales
3. Migrar componentes de gestión de productos y tiendas
4. Migrar sistema de órdenes y chat
5. Migrar favoritos y reviews
6. Probar toda la aplicación end-to-end
7. Eliminar código de localStorage obsoleto

## 📝 Notas Importantes

- **CORS está habilitado** en el servidor para todas las rutas
- **Autenticación** usa Bearer token con publicAnonKey
- **Manejo de errores** incluido en todas las rutas API
- **Logging** activado en el servidor para debugging
- Las imágenes se guardan como base64 en los objetos (perfecto para KV store)
