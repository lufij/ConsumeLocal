# 🔄 MIGRACIÓN A SUPABASE - DATOS REALES

**IMPORTANTE**: Esta aplicación ahora usa **DATOS REALES** almacenados en Supabase. Ya NO usa datos demo ni localStorage.

---

## 🎯 CAMBIOS PRINCIPALES

### ❌ ANTES (Datos Demo)
- ✅ LocalStorage para usuarios
- ✅ LocalStorage para productos
- ✅ LocalStorage para tiendas
- ✅ LocalStorage para mensajes
- ✅ Usuarios y productos demo pre-cargados

### ✅ AHORA (Datos Reales)
- ✅ Supabase para usuarios
- ✅ Supabase para productos
- ✅ Supabase para tiendas
- ✅ Supabase para mensajes
- ❌ **SIN usuarios demo**
- ❌ **SIN productos demo**
- ❌ **SIN tiendas demo**

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS SUPABASE

### Tablas Requeridas

#### 1. `users` (Usuarios)
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  has_store BOOLEAN DEFAULT FALSE,
  store_id UUID REFERENCES stores(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índice para búsqueda rápida por teléfono
CREATE INDEX idx_users_phone ON users(phone);
```

#### 2. `stores` (Tiendas)
```sql
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo VARCHAR(500),
  location VARCHAR(255) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índice para búsqueda por usuario
CREATE INDEX idx_stores_user_id ON stores(user_id);
```

#### 3. `products` (Productos)
```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  images TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER DEFAULT 0,
  is_product_of_day BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para búsqueda
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_products_is_product_of_day ON products(is_product_of_day);
```

#### 4. `messages` (Chat)
```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para búsqueda de conversaciones
CREATE INDEX idx_messages_from_user ON messages(from_user_id);
CREATE INDEX idx_messages_to_user ON messages(to_user_id);
CREATE INDEX idx_messages_product ON messages(product_id);
```

#### 5. `cart_items` (Carrito)
```sql
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  buyer_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Índice para carrito de usuario
CREATE INDEX idx_cart_user_id ON cart_items(user_id);
```

#### 6. `notifications` (Notificaciones)
```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_title VARCHAR(255),
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índice para notificaciones de usuario
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

---

## 🔐 ROW LEVEL SECURITY (RLS)

### Habilitar RLS en todas las tablas

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

### Políticas de Seguridad

#### Users
```sql
-- Cualquiera puede leer usuarios (para ver perfiles de tiendas)
CREATE POLICY "Users are viewable by everyone" 
  ON users FOR SELECT 
  USING (true);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile" 
  ON users FOR INSERT 
  WITH CHECK (auth.uid() = id);
```

#### Stores
```sql
-- Cualquiera puede ver tiendas
CREATE POLICY "Stores are viewable by everyone" 
  ON stores FOR SELECT 
  USING (true);

-- Solo el dueño puede crear su tienda
CREATE POLICY "Users can create own store" 
  ON stores FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Solo el dueño puede actualizar su tienda
CREATE POLICY "Users can update own store" 
  ON stores FOR UPDATE 
  USING (auth.uid() = user_id);

-- Solo el dueño puede eliminar su tienda
CREATE POLICY "Users can delete own store" 
  ON stores FOR DELETE 
  USING (auth.uid() = user_id);
```

#### Products
```sql
-- Cualquiera puede ver productos
CREATE POLICY "Products are viewable by everyone" 
  ON products FOR SELECT 
  USING (true);

-- Solo el dueño de la tienda puede crear productos
CREATE POLICY "Store owners can create products" 
  ON products FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = store_id 
      AND stores.user_id = auth.uid()
    )
  );

-- Solo el dueño puede actualizar sus productos
CREATE POLICY "Store owners can update own products" 
  ON products FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = store_id 
      AND stores.user_id = auth.uid()
    )
  );

-- Solo el dueño puede eliminar sus productos
CREATE POLICY "Store owners can delete own products" 
  ON products FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = store_id 
      AND stores.user_id = auth.uid()
    )
  );
```

#### Messages
```sql
-- Los usuarios solo pueden ver sus propios mensajes
CREATE POLICY "Users can view own messages" 
  ON messages FOR SELECT 
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Los usuarios pueden enviar mensajes
CREATE POLICY "Users can send messages" 
  ON messages FOR INSERT 
  WITH CHECK (auth.uid() = from_user_id);

-- Los usuarios pueden actualizar mensajes que recibieron (marcar como leído)
CREATE POLICY "Users can update received messages" 
  ON messages FOR UPDATE 
  USING (auth.uid() = to_user_id);
```

#### Cart Items
```sql
-- Los usuarios solo pueden ver su propio carrito
CREATE POLICY "Users can view own cart" 
  ON cart_items FOR SELECT 
  USING (auth.uid() = user_id);

-- Los usuarios pueden agregar a su carrito
CREATE POLICY "Users can add to own cart" 
  ON cart_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar su carrito
CREATE POLICY "Users can update own cart" 
  ON cart_items FOR UPDATE 
  USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar de su carrito
CREATE POLICY "Users can delete from own cart" 
  ON cart_items FOR DELETE 
  USING (auth.uid() = user_id);
```

#### Notifications
```sql
-- Los usuarios solo pueden ver sus notificaciones
CREATE POLICY "Users can view own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

-- Sistema puede crear notificaciones (usar service_role key)
CREATE POLICY "System can create notifications" 
  ON notifications FOR INSERT 
  WITH CHECK (true);

-- Los usuarios pueden marcar como leídas
CREATE POLICY "Users can update own notifications" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);
```

---

## 🔑 VARIABLES DE ENTORNO

Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# NO incluir la service_role_key en el frontend
# Solo usarla en el backend (Edge Functions)
```

⚠️ **IMPORTANTE**: 
- Agrega `.env` al `.gitignore` (ya está incluido)
- NUNCA subas las keys a GitHub
- La `anon_key` es segura para el frontend
- La `service_role_key` SOLO para backend

---

## 📦 INSTALACIÓN DE SUPABASE CLIENT

La dependencia ya está incluida en `package.json`, pero si necesitas reinstalar:

```bash
npm install @supabase/supabase-js
```

---

## 🔧 CONFIGURACIÓN DE SUPABASE CLIENT

### Crear archivo de configuración

Crea `/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para TypeScript
export type User = {
  id: string;
  phone: string;
  name: string;
  has_store: boolean;
  store_id?: string;
  created_at: string;
  updated_at: string;
};

export type Store = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  logo?: string;
  location: string;
  verified: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  store_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  in_stock: boolean;
  stock_quantity: number;
  is_product_of_day: boolean;
  views: number;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  product_id?: string;
  content: string;
  read: boolean;
  created_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  buyer_note?: string;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  product_id?: string;
  product_title?: string;
  store_id?: string;
  created_at: string;
};
```

---

## 🔄 MIGRACIÓN DE CÓDIGO

### ❌ ELIMINAR: Datos Demo

Busca y elimina todo el código que crea datos demo:

```typescript
// ❌ ELIMINAR ESTO:
const demoUsers = [...]
const demoStores = [...]
const demoProducts = [...]

// ❌ ELIMINAR inicialización de datos demo
useEffect(() => {
  // Código que crea usuarios/productos demo
  localStorage.setItem('users', JSON.stringify(demoUsers));
  localStorage.setItem('products', JSON.stringify(demoProducts));
}, []);
```

### ✅ REEMPLAZAR: Con llamadas a Supabase

#### Ejemplo: Obtener Productos

**ANTES (LocalStorage):**
```typescript
const productsStr = localStorage.getItem('products');
const products = productsStr ? JSON.parse(productsStr) : [];
setProducts(products);
```

**DESPUÉS (Supabase):**
```typescript
import { supabase } from '../lib/supabase';

// Obtener todos los productos
const { data: products, error } = await supabase
  .from('products')
  .select('*')
  .eq('in_stock', true)
  .order('created_at', { ascending: false });

if (error) {
  console.error('Error fetching products:', error);
  toast.error('Error al cargar productos');
} else {
  setProducts(products || []);
}
```

#### Ejemplo: Crear Producto

**ANTES (LocalStorage):**
```typescript
const newProduct = {
  id: Date.now().toString(),
  ...productData
};
const products = JSON.parse(localStorage.getItem('products') || '[]');
products.push(newProduct);
localStorage.setItem('products', JSON.stringify(products));
```

**DESPUÉS (Supabase):**
```typescript
const { data: newProduct, error } = await supabase
  .from('products')
  .insert([{
    store_id: currentStore.id,
    name: productData.name,
    description: productData.description,
    price: productData.price,
    category: productData.category,
    images: productData.images,
    in_stock: true,
    stock_quantity: productData.stock
  }])
  .select()
  .single();

if (error) {
  console.error('Error creating product:', error);
  toast.error('Error al crear producto');
} else {
  toast.success('Producto creado exitosamente');
  // Actualizar estado local
  setProducts([...products, newProduct]);
}
```

#### Ejemplo: Autenticación

**ANTES (LocalStorage):**
```typescript
const user = {
  id: Date.now().toString(),
  phone: phoneNumber,
  name: userName,
  hasStore: false
};
localStorage.setItem('currentUser', JSON.stringify(user));
```

**DESPUÉS (Supabase Auth):**
```typescript
// Registro con auth por teléfono (OTP)
const { data, error } = await supabase.auth.signInWithOtp({
  phone: phoneNumber,
  options: {
    data: {
      name: userName
    }
  }
});

if (error) {
  toast.error('Error al enviar código');
} else {
  toast.success('Código enviado a tu teléfono');
  // Mostrar input para OTP
}

// Verificar OTP
const { data: session, error: verifyError } = await supabase.auth.verifyOtp({
  phone: phoneNumber,
  token: otpCode,
  type: 'sms'
});

if (verifyError) {
  toast.error('Código inválido');
} else {
  // Usuario autenticado
  const user = session.user;
  
  // Crear registro en tabla users si no existe
  const { data: userData, error: userError } = await supabase
    .from('users')
    .upsert([{
      id: user.id,
      phone: phoneNumber,
      name: userName,
      has_store: false
    }])
    .select()
    .single();
    
  setCurrentUser(userData);
}
```

---

## 🔄 REALTIME SUBSCRIPTIONS

Para actualizaciones en tiempo real (chat, notificaciones):

```typescript
// Suscribirse a nuevos mensajes
const messageSubscription = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `to_user_id=eq.${currentUser.id}`
    },
    (payload) => {
      console.log('Nuevo mensaje:', payload.new);
      setMessages(prev => [...prev, payload.new as Message]);
      toast.info('Nuevo mensaje recibido');
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(messageSubscription);
};
```

---

## 📸 STORAGE PARA IMÁGENES

### Crear Bucket

```sql
-- En el dashboard de Supabase, crear bucket público:
-- Name: product-images
-- Public: true
```

### Subir Imágenes

```typescript
// Subir foto de producto
const uploadProductImage = async (file: File, productId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}-${Date.now()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  // Obtener URL pública
  const { data: publicUrl } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return publicUrl.publicUrl;
};

// Usar en el componente
const handlePhotoCapture = async (file: File) => {
  const imageUrl = await uploadProductImage(file, productId);
  if (imageUrl) {
    // Actualizar producto con nueva imagen
    const { error } = await supabase
      .from('products')
      .update({
        images: [...product.images, imageUrl]
      })
      .eq('id', productId);
      
    if (!error) {
      toast.success('Foto agregada');
    }
  }
};
```

---

## 🔍 BÚSQUEDA Y FILTROS

```typescript
// Búsqueda de productos por nombre
const searchProducts = async (searchTerm: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .eq('in_stock', true);
    
  return data || [];
};

// Filtrar por categoría
const filterByCategory = async (category: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('in_stock', true);
    
  return data || [];
};

// Productos de una tienda
const getStoreProducts = async (storeId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });
    
  return data || [];
};
```

---

## 📝 CHECKLIST DE MIGRACIÓN

### Backend (Supabase)
- [ ] Crear proyecto en Supabase
- [ ] Crear todas las tablas (users, stores, products, messages, cart_items, notifications)
- [ ] Habilitar RLS en todas las tablas
- [ ] Configurar políticas de seguridad
- [ ] Crear bucket para imágenes (`product-images`)
- [ ] Configurar autenticación por teléfono (OTP)
- [ ] Copiar URL y anon key

### Frontend
- [ ] Crear archivo `.env` con keys de Supabase
- [ ] Crear `/src/lib/supabase.ts`
- [ ] Eliminar TODO el código de datos demo
- [ ] Eliminar inicialización de localStorage con datos demo
- [ ] Reemplazar `localStorage.getItem('products')` con llamadas a Supabase
- [ ] Reemplazar `localStorage.getItem('users')` con Supabase Auth
- [ ] Reemplazar `localStorage.getItem('stores')` con llamadas a Supabase
- [ ] Implementar autenticación real con OTP
- [ ] Implementar upload de imágenes a Storage
- [ ] Implementar realtime para chat
- [ ] Implementar realtime para notificaciones

### Testing
- [ ] Probar registro de usuario nuevo
- [ ] Probar login con OTP
- [ ] Probar creación de tienda
- [ ] Probar subida de productos con imágenes
- [ ] Probar búsqueda y filtros
- [ ] Probar carrito de compras
- [ ] Probar chat en tiempo real
- [ ] Probar notificaciones en tiempo real
- [ ] Probar que NO hay datos demo visibles

---

## 🚀 DEPLOY CON SUPABASE

### Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - `VITE_SUPABASE_URL`: Tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY`: Tu anon key

4. Redeploy:
```bash
git push origin main
```

---

## ⚠️ IMPORTANTE

### ❌ NO MOSTRAR DATOS DEMO

Asegúrate de que NO hay:
- ❌ Usuarios demo pre-cargados
- ❌ Productos demo pre-cargados
- ❌ Tiendas demo pre-cargadas
- ❌ Mensajes demo pre-cargados

### ✅ SOLO DATOS REALES

- ✅ Usuarios reales registrados desde la app
- ✅ Productos reales creados por usuarios
- ✅ Tiendas reales creadas por usuarios
- ✅ Mensajes reales entre usuarios

### 🔒 SEGURIDAD

- ✅ RLS habilitado en todas las tablas
- ✅ Políticas de seguridad configuradas
- ✅ Usuarios solo pueden ver/editar sus datos
- ✅ Service role key SOLO en backend
- ✅ Anon key en frontend es segura

---

## 📚 RECURSOS

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Supabase Storage**: https://supabase.com/docs/guides/storage
- **Supabase Realtime**: https://supabase.com/docs/guides/realtime
- **RLS Policies**: https://supabase.com/docs/guides/auth/row-level-security

---

🇬🇹 **Gualán Market - Ahora con Datos Reales**
