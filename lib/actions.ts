'use server';

import { cookies } from 'next/headers';
import {
  getUsers,
  saveUsers,
  getProducts,
  saveProducts,
  getCategories,
  saveCategories,
  getOrders,
  saveOrders,
  getConfig,
  saveConfig,
  generateId,
  initializeStorage,
  getTopupTransactions,
  saveTopupTransactions,
} from './db';
import { User, Product, Category, Order, SessionData, ActionResponse, Banner, SiteConfig, PaymentConfig, TopupTransaction } from './types';

// Cookie name for session
const SESSION_COOKIE = 'xdnz_session';

// Initialize storage on first action
let initialized = false;
async function ensureInitialized() {
  if (!initialized) {
    await initializeStorage();
    initialized = true;
  }
}

// ============================================
// AUTH ACTIONS
// ============================================

export async function login(username: string, password: string): Promise<ActionResponse<SessionData>> {
  await ensureInitialized();
  
  const users = await getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return { success: false, message: 'Invalid username or password' };
  }
  
  const session: SessionData = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
  
  return { success: true, message: 'Login successful', data: session };
}

export async function register(username: string, password: string): Promise<ActionResponse<SessionData>> {
  await ensureInitialized();
  
  if (username.length < 3) {
    return { success: false, message: 'Username must be at least 3 characters' };
  }
  
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters' };
  }
  
  const users = await getUsers();
  const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  
  if (existingUser) {
    return { success: false, message: 'Username already taken' };
  }
  
  const newUser: User = {
    id: generateId(),
    username,
    password,
    role: 'user',
    credit: 50, // Starting credit
  };
  
  users.push(newUser);
  await saveUsers(users);
  
  const session: SessionData = {
    userId: newUser.id,
    username: newUser.username,
    role: newUser.role,
  };
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });
  
  return { success: true, message: 'Registration successful', data: session };
}

export async function logout(): Promise<ActionResponse> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return { success: true, message: 'Logged out successfully' };
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    return JSON.parse(sessionCookie.value) as SessionData;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  await ensureInitialized();
  
  const session = await getSession();
  if (!session) return null;
  
  const users = await getUsers();
  return users.find(u => u.id === session.userId) || null;
}

// ============================================
// PRODUCT ACTIONS
// ============================================

export async function addProduct(
  name: string,
  price: number,
  imageUrl: string,
  categoryId: string,
  stockContent: string
): Promise<ActionResponse<Product>> {
  await ensureInitialized();
  
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { success: false, message: 'Unauthorized' };
  }
  
  // Split stock content by newlines
  const stockItems = stockContent
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  const newProduct: Product = {
    id: generateId(),
    name,
    price,
    image_url: imageUrl,
    category_id: categoryId,
    stock_content: stockItems,
  };
  
  const products = await getProducts();
  products.push(newProduct);
  await saveProducts(products);
  
  return { success: true, message: 'Product added successfully', data: newProduct };
}

export async function updateProduct(
  id: string,
  name: string,
  price: number,
  imageUrl: string,
  categoryId: string,
  stockContent?: string
): Promise<ActionResponse<Product>> {
  await ensureInitialized();
  
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { success: false, message: 'Unauthorized' };
  }
  
  const products = await getProducts();
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return { success: false, message: 'Product not found' };
  }
  
  products[productIndex] = {
    ...products[productIndex],
    name,
    price,
    image_url: imageUrl,
    category_id: categoryId,
  };
  
  // If stock content provided, update it
  if (stockContent !== undefined) {
    const stockItems = stockContent
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    products[productIndex].stock_content = stockItems;
  }
  
  await saveProducts(products);
  
  return { success: true, message: 'Product updated successfully', data: products[productIndex] };
}

export async function deleteProduct(id: string): Promise<ActionResponse> {
  await ensureInitialized();
  
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { success: false, message: 'Unauthorized' };
  }
  
  const products = await getProducts();
  const filtered = products.filter(p => p.id !== id);
  
  if (filtered.length === products.length) {
    return { success: false, message: 'Product not found' };
  }
  
  await saveProducts(filtered);
  return { success: true, message: 'Product deleted successfully' };
}

export async function addStockToProduct(id: string, stockContent: string): Promise<ActionResponse> {
  await ensureInitialized();
  
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { success: false, message: 'Unauthorized' };
  }
  
  const products = await getProducts();
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return { success: false, message: 'Product not found' };
  }
  
  const stockItems = stockContent
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  product.stock_content.push(...stockItems);
  await saveProducts(products);
  
  return { success: true, message: `Added ${stockItems.length} items to stock` };
}

// ============================================
// BUY PRODUCT ACTION
// ============================================

export async function buyProduct(productId: string): Promise<ActionResponse<{ content: string }>> {
  await ensureInitialized();
  
  const session = await getSession();
  if (!session) {
    return { success: false, message: 'Please login to purchase' };
  }
  
  const users = await getUsers();
  const user = users.find(u => u.id === session.userId);
  
  if (!user) {
    return { success: false, message: 'User not found' };
  }
  
  const products = await getProducts();
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return { success: false, message: 'Product not found' };
  }
  
  if (product.stock_content.length === 0) {
    return { success: false, message: 'Product is out of stock' };
  }
  
  if (user.credit < product.price) {
    return { success: false, message: 'Insufficient credit' };
  }
  
  // Deduct credit
  user.credit -= product.price;
  
  // Pop the first item from stock
  const deliveredContent = product.stock_content.shift()!;
  
  // Create order
  const order: Order = {
    id: generateId(),
    user_id: user.id,
    product_name: product.name,
    content_delivered: deliveredContent,
    date: new Date().toISOString(),
  };
  
  // Save all changes
  await saveUsers(users);
  await saveProducts(products);
  
  const orders = await getOrders();
  orders.push(order);
  await saveOrders(orders);
  
  return { 
    success: true, 
    message: 'Purchase successful!', 
    data: { content: deliveredContent } 
  };
}

// ============================================
// CATEGORY ACTIONS
// ============================================

export async function addCategory(name: string, imageUrl: string): Promise<ActionResponse<Category>> {
  await ensureInitialized();
  
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { success: false, message: 'Unauthorized' };
  }
  
  const newCategory: Category = {
    id: generateId(),
    name,
    image_url: imageUrl,
  };
  
  const categories = await getCategories();
  categories.push(newCategory);
  await saveCategories(categories);
  
  return { success: true, message: 'Category added successfully', data: newCategory };
}

export async function deleteCategory(id: string): Promise<ActionResponse> {
  await ensureInitialized();
  
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { success: false, message: 'Unauthorized' };
  }
  
  const categories = await getCategories();
  const filtered = categories.filter(c => c.id !== id);
  await saveCategories(filtered);
  
  return { success: true, message: 'Category deleted successfully' };
}

// ============================================
// ORDER ACTIONS
// ============================================

export async function getUserOrders(): Promise<Order[]> {
  await ensureInitialized();
  
  const session = await getSession();
  if (!session) return [];
  
  const orders = await getOrders();
  return orders.filter(o => o.user_id === session.userId).reverse();
}

export async function getAllOrders(): Promise<Order[]> {
  await ensureInitialized();
  
  const session = await getSession();
  if (!session || session.role !== 'admin') return [];
  
  const orders = await getOrders();
  return orders.reverse();
}

// ============================================