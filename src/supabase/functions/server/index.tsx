import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-5d0cb103/health", (c) => {
  return c.json({ status: "ok" });
});

// ============================================
// USERS ENDPOINTS
// ============================================

// Get all users
app.get("/make-server-5d0cb103/users", async (c) => {
  try {
    const users = await kv.get("users") || [];
    return c.json({ success: true, data: users });
  } catch (error) {
    console.error("Error getting users:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get user by phone (login)
app.get("/make-server-5d0cb103/users/:phone", async (c) => {
  try {
    const phone = c.req.param("phone");
    const users = await kv.get("users") || [];
    const user = users.find((u: any) => u.phone === phone);
    
    if (!user) {
      return c.json({ success: false, error: "Usuario no encontrado" }, 404);
    }
    
    return c.json({ success: true, data: user });
  } catch (error) {
    console.error("Error getting user by phone:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create user (register)
app.post("/make-server-5d0cb103/users", async (c) => {
  try {
    const body = await c.req.json();
    const { phone, name } = body;
    
    if (!phone || !name) {
      return c.json({ success: false, error: "Teléfono y nombre son requeridos" }, 400);
    }
    
    const users = await kv.get("users") || [];
    
    // Check if user already exists
    const existingUser = users.find((u: any) => u.phone === phone);
    if (existingUser) {
      return c.json({ success: false, error: "Usuario ya existe" }, 409);
    }
    
    const newUser = {
      id: Date.now().toString(),
      phone,
      name,
      hasStore: false,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    await kv.set("users", users);
    
    return c.json({ success: true, data: newUser }, 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update user
app.put("/make-server-5d0cb103/users/:id", async (c) => {
  try {
    const userId = c.req.param("id");
    const body = await c.req.json();
    
    const users = await kv.get("users") || [];
    const userIndex = users.findIndex((u: any) => u.id === userId);
    
    if (userIndex === -1) {
      return c.json({ success: false, error: "Usuario no encontrado" }, 404);
    }
    
    users[userIndex] = { ...users[userIndex], ...body, updatedAt: new Date().toISOString() };
    await kv.set("users", users);
    
    return c.json({ success: true, data: users[userIndex] });
  } catch (error) {
    console.error("Error updating user:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// PRODUCTS ENDPOINTS
// ============================================

// Helper function to check if a product of the day has expired
function isProductExpired(product: any): boolean {
  if (!product.isProductOfTheDay || !product.expiresAt) {
    return false;
  }
  
  const now = new Date();
  const expiresAt = new Date(product.expiresAt);
  
  return now > expiresAt;
}

// Get all products (auto-deactivating expired products of the day)
app.get("/make-server-5d0cb103/products", async (c) => {
  try {
    const allProducts = await kv.get("products") || [];
    
    // Auto-deactivate expired products of the day
    let needsUpdate = false;
    const updatedProducts = allProducts.map((product: any) => {
      // Si es producto del día, está activo, pero ya expiró -> desactivarlo
      if (product.isProductOfTheDay && product.inStock && isProductExpired(product)) {
        console.log(`⏰ Auto-desactivando producto del día expirado: ${product.title}`);
        needsUpdate = true;
        return { ...product, inStock: false };
      }
      return product;
    });
    
    // Save if any product was deactivated
    if (needsUpdate) {
      await kv.set("products", updatedProducts);
      console.log('✅ Productos del día expirados desactivados automáticamente');
    }
    
    return c.json({ success: true, data: updatedProducts });
  } catch (error) {
    console.error("Error getting products:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create product
app.post("/make-server-5d0cb103/products", async (c) => {
  try {
    const body = await c.req.json();
    
    const products = await kv.get("products") || [];
    const newProduct = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    products.push(newProduct);
    await kv.set("products", products);
    
    return c.json({ success: true, data: newProduct }, 201);
  } catch (error) {
    console.error("Error creating product:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update product
app.put("/make-server-5d0cb103/products/:id", async (c) => {
  try {
    const productId = c.req.param("id");
    const body = await c.req.json();
    
    const products = await kv.get("products") || [];
    const productIndex = products.findIndex((p: any) => p.id === productId);
    
    if (productIndex === -1) {
      return c.json({ success: false, error: "Producto no encontrado" }, 404);
    }
    
    products[productIndex] = { ...products[productIndex], ...body, updatedAt: new Date().toISOString() };
    await kv.set("products", products);
    
    return c.json({ success: true, data: products[productIndex] });
  } catch (error) {
    console.error("Error updating product:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete product
app.delete("/make-server-5d0cb103/products/:id", async (c) => {
  try {
    const productId = c.req.param("id");
    
    const products = await kv.get("products") || [];
    const filteredProducts = products.filter((p: any) => p.id !== productId);
    
    if (products.length === filteredProducts.length) {
      return c.json({ success: false, error: "Producto no encontrado" }, 404);
    }
    
    await kv.set("products", filteredProducts);
    
    return c.json({ success: true, message: "Producto eliminado" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Reactivate product of the day (resets expiration to end of current day)
app.post("/make-server-5d0cb103/products/:id/reactivate-product-of-day", async (c) => {
  try {
    const productId = c.req.param("id");
    
    const products = await kv.get("products") || [];
    const productIndex = products.findIndex((p: any) => p.id === productId);
    
    if (productIndex === -1) {
      return c.json({ success: false, error: "Producto no encontrado" }, 404);
    }
    
    const product = products[productIndex];
    
    // Verificar que sea un producto del día
    if (!product.isProductOfTheDay) {
      return c.json({ success: false, error: "Este producto no es un producto del día" }, 400);
    }
    
    // Calcular nueva fecha de expiración (23:59:59 de hoy en Guatemala GMT-6)
    const now = new Date();
    const guatemalaOffset = -6 * 60; // -6 horas en minutos
    const localOffset = now.getTimezoneOffset(); // Diferencia del servidor con UTC
    const guatemalaTime = new Date(now.getTime() + (guatemalaOffset - localOffset) * 60 * 1000);
    
    // Establecer a las 23:59:59.999
    guatemalaTime.setHours(23, 59, 59, 999);
    const newExpiresAt = guatemalaTime.toISOString();
    
    // Actualizar producto: activar y nueva fecha de expiración
    products[productIndex] = {
      ...product,
      inStock: true,
      expiresAt: newExpiresAt,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set("products", products);
    
    console.log(`🔄 Producto del día reactivado: ${product.title} - Expira: ${newExpiresAt}`);
    
    return c.json({ 
      success: true, 
      data: products[productIndex],
      message: `Producto reactivado hasta las 23:59 de hoy`
    });
  } catch (error) {
    console.error("Error reactivating product of the day:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// STORES ENDPOINTS
// ============================================

// Get all stores
app.get("/make-server-5d0cb103/stores", async (c) => {
  try {
    const stores = await kv.get("stores") || [];
    return c.json({ success: true, data: stores });
  } catch (error) {
    console.error("Error getting stores:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create store
app.post("/make-server-5d0cb103/stores", async (c) => {
  try {
    const body = await c.req.json();
    
    const stores = await kv.get("stores") || [];
    const newStore = {
      ...body,
      createdAt: new Date().toISOString(),
    };
    
    stores.push(newStore);
    await kv.set("stores", stores);
    
    return c.json({ success: true, data: newStore }, 201);
  } catch (error) {
    console.error("Error creating store:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update store
app.put("/make-server-5d0cb103/stores/:id", async (c) => {
  try {
    const storeId = c.req.param("id");
    const body = await c.req.json();
    
    const stores = await kv.get("stores") || [];
    const storeIndex = stores.findIndex((s: any) => s.id === storeId);
    
    if (storeIndex === -1) {
      return c.json({ success: false, error: "Tienda no encontrada" }, 404);
    }
    
    stores[storeIndex] = { ...stores[storeIndex], ...body, updatedAt: new Date().toISOString() };
    await kv.set("stores", stores);
    
    return c.json({ success: true, data: stores[storeIndex] });
  } catch (error) {
    console.error("Error updating store:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// ORDERS ENDPOINTS
// ============================================

// Get all orders
app.get("/make-server-5d0cb103/orders", async (c) => {
  try {
    const orders = await kv.get("orders") || [];
    return c.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error getting orders:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create order
app.post("/make-server-5d0cb103/orders", async (c) => {
  try {
    const body = await c.req.json();
    
    const orders = await kv.get("orders") || [];
    const newOrder = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    orders.push(newOrder);
    await kv.set("orders", orders);
    
    return c.json({ success: true, data: newOrder }, 201);
  } catch (error) {
    console.error("Error creating order:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update order
app.put("/make-server-5d0cb103/orders/:id", async (c) => {
  try {
    const orderId = c.req.param("id");
    const body = await c.req.json();
    
    const orders = await kv.get("orders") || [];
    const orderIndex = orders.findIndex((o: any) => o.id === orderId);
    
    if (orderIndex === -1) {
      return c.json({ success: false, error: "Orden no encontrada" }, 404);
    }
    
    orders[orderIndex] = { ...orders[orderIndex], ...body, updatedAt: new Date().toISOString() };
    await kv.set("orders", orders);
    
    return c.json({ success: true, data: orders[orderIndex] });
  } catch (error) {
    console.error("Error updating order:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// CHATS ENDPOINTS
// ============================================

// Get all chats
app.get("/make-server-5d0cb103/chats", async (c) => {
  try {
    const chats = await kv.get("chats") || [];
    return c.json({ success: true, data: chats });
  } catch (error) {
    console.error("Error getting chats:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Send message (create/update chat)
app.post("/make-server-5d0cb103/chats", async (c) => {
  try {
    const body = await c.req.json();
    const { conversationId, message } = body;
    
    const chats = await kv.get("chats") || [];
    const chatIndex = chats.findIndex((ch: any) => ch.id === conversationId);
    
    if (chatIndex === -1) {
      // Create new chat
      const newChat = {
        id: conversationId,
        messages: [{ ...message, id: Date.now().toString(), timestamp: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
      };
      chats.push(newChat);
    } else {
      // Add message to existing chat
      chats[chatIndex].messages.push({
        ...message,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      });
    }
    
    await kv.set("chats", chats);
    
    return c.json({ success: true, data: chatIndex === -1 ? chats[chats.length - 1] : chats[chatIndex] });
  } catch (error) {
    console.error("Error sending message:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// LAST SEEN ENDPOINTS (Migrado a Supabase KV)
// ============================================

// Get all lastSeen for a user
app.get("/make-server-5d0cb103/last-seen/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const lastSeenData = await kv.get(`lastSeen:${userId}`) || {};
    return c.json({ success: true, data: lastSeenData });
  } catch (error) {
    console.error("Error getting lastSeen:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Set lastSeen for a conversation
app.post("/make-server-5d0cb103/last-seen", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, conversationId, timestamp } = body;
    
    if (!userId || !conversationId || !timestamp) {
      return c.json({ success: false, error: "userId, conversationId y timestamp son requeridos" }, 400);
    }
    
    // Obtener lastSeen existente
    const lastSeenData = await kv.get(`lastSeen:${userId}`) || {};
    
    // Actualizar el lastSeen de esta conversación
    lastSeenData[conversationId] = timestamp;
    
    // Guardar de vuelta
    await kv.set(`lastSeen:${userId}`, lastSeenData);
    
    return c.json({ success: true, data: lastSeenData });
  } catch (error) {
    console.error("Error setting lastSeen:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// FAVORITES ENDPOINTS
// ============================================

// Get favorites for a user
app.get("/make-server-5d0cb103/favorites/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const favorites = await kv.get(`favorites_${userId}`) || [];
    return c.json({ success: true, data: favorites });
  } catch (error) {
    console.error("Error getting favorites:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Add favorite
app.post("/make-server-5d0cb103/favorites", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, productId } = body;
    
    const favorites = await kv.get(`favorites_${userId}`) || [];
    
    if (!favorites.includes(productId)) {
      favorites.push(productId);
      await kv.set(`favorites_${userId}`, favorites);
    }
    
    return c.json({ success: true, data: favorites });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Remove favorite
app.delete("/make-server-5d0cb103/favorites/:userId/:productId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const productId = c.req.param("productId");
    
    const favorites = await kv.get(`favorites_${userId}`) || [];
    const filteredFavorites = favorites.filter((id: string) => id !== productId);
    
    await kv.set(`favorites_${userId}`, filteredFavorites);
    
    return c.json({ success: true, data: filteredFavorites });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// REVIEWS ENDPOINTS
// ============================================

// Get reviews for a product
app.get("/make-server-5d0cb103/reviews/product/:productId", async (c) => {
  try {
    const productId = c.req.param("productId");
    const reviews = await kv.get(`reviews_product_${productId}`) || [];
    return c.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error getting product reviews:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get reviews for a store
app.get("/make-server-5d0cb103/reviews/store/:storeId", async (c) => {
  try {
    const storeId = c.req.param("storeId");
    const reviews = await kv.get(`reviews_store_${storeId}`) || [];
    return c.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error getting store reviews:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create review
app.post("/make-server-5d0cb103/reviews", async (c) => {
  try {
    const body = await c.req.json();
    const { storeId, productId, userId, userName, rating, comment } = body;
    
    const newReview = {
      id: Date.now().toString(),
      storeId,
      productId,
      userId,
      userName,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    
    // Save review to store's reviews
    if (storeId) {
      const storeReviews = await kv.get(`reviews_store_${storeId}`) || [];
      storeReviews.push(newReview);
      await kv.set(`reviews_store_${storeId}`, storeReviews);
    }
    
    // Save review to product's reviews if productId exists
    if (productId) {
      const productReviews = await kv.get(`reviews_product_${productId}`) || [];
      productReviews.push(newReview);
      await kv.set(`reviews_product_${productId}`, productReviews);
    }
    
    return c.json({ success: true, data: newReview }, 201);
  } catch (error) {
    console.error("Error creating review:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// PRODUCT OF THE DAY ENDPOINTS
// ============================================

// Get product of the day
app.get("/make-server-5d0cb103/product-of-the-day", async (c) => {
  try {
    const productOfTheDay = await kv.get("productOfTheDay");
    return c.json({ success: true, data: productOfTheDay });
  } catch (error) {
    console.error("Error getting product of the day:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Set product of the day
app.post("/make-server-5d0cb103/product-of-the-day", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("productOfTheDay", body);
    return c.json({ success: true, data: body });
  } catch (error) {
    console.error("Error setting product of the day:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

Deno.serve(app.fetch);