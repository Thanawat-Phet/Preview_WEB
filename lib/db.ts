import { Pool, PoolClient } from 'pg';
import { User, Product, Category, Order, SiteConfig, TopupTransaction } from './types';

// ============================================
// PostgreSQL Connection Pool (reads from .env)
// ============================================
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_DATABASE || 'dbstore',
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
});

// Helper: run a query
async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}

// Helper: run a single-row query
async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

// ============================================
// Database Schema Initialization
// ============================================

const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    credit NUMERIC NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    image_url TEXT NOT NULL DEFAULT '',
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS stock_items (
    id SERIAL PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_sold BOOLEAN NOT NULL DEFAULT FALSE,
    sold_at TIMESTAMPTZ
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    content_delivered TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS site_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS topup_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    reference TEXT,
    transaction_id TEXT,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
];

// Default seed data
const DEFAULT_USERS: User[] = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin', credit: 9999 },
  { id: '2', username: 'user', password: 'user123', role: 'user', credit: 100 },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Game Codes', image_url: '/images/category-games.png' },
  { id: '2', name: 'Gift Cards', image_url: '/images/category-gifts.png' },
  { id: '3', name: 'Subscriptions', image_url: '/images/category-subs.png' },
  { id: '4', name: 'Top-Up', image_url: '/images/category-topup.png' },
];

interface DefaultProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category_id: string;
  stock_content: string[];
}

const DEFAULT_PRODUCTS: DefaultProduct[] = [
  {
    id: '1', name: 'Steam Wallet $10', price: 10,
    image_url: 'https://placehold.co/300x200/7c3aed/white?text=Steam+$10',
    category_id: '2',
    stock_content: ['STEAM-CODE-001', 'STEAM-CODE-002', 'STEAM-CODE-003'],
  },
  {
    id: '2', name: 'Netflix Premium 1 Month', price: 15,
    image_url: 'https://placehold.co/300x200/7c3aed/white?text=Netflix',
    category_id: '3',
    stock_content: ['NETFLIX-001', 'NETFLIX-002'],
  },
  {
    id: '3', name: 'Spotify Premium 1 Month', price: 12,
    image_url: 'https://placehold.co/300x200/7c3aed/white?text=Spotify',
    category_id: '3',
    stock_content: ['SPOTIFY-001', 'SPOTIFY-002', 'SPOTIFY-003', 'SPOTIFY-004'],
  },
  {
    id: '4', name: 'Discord Nitro 1 Month', price: 10,
    image_url: 'https://placehold.co/300x200/7c3aed/white?text=Discord+Nitro',
    category_id: '3',
    stock_content: ['NITRO-001'],
  },
  {
    id: '5', name: 'Mobile Legends Diamonds 100', price: 5,
    image_url: 'https://placehold.co/300x200/7c3aed/white?text=ML+Diamonds',
    category_id: '4',
    stock_content: ['ML-DIA-001', 'ML-DIA-002', 'ML-DIA-003'],
  },
  {
    id: '6', name: 'PUBG Mobile UC 600', price: 10,
    image_url: 'https://placehold.co/300x200/7c3aed/white?text=PUBG+UC',
    category_id: '4',
    stock_content: ['PUBG-UC-001', 'PUBG-UC-002'],
  },
];

const DEFAULT_CONFIG: SiteConfig = {
  siteName: 'XDNZ Store',
  banners: [
    { id: '1', image_url: 'https://placehold.co/1200x400/7c3aed/white?text=Welcome+to+XDNZ+Store', title: 'Welcome to XDNZ Store', subtitle: 'Your one-stop shop for digital goods' },
    { id: '2', image_url: 'https://placehold.co/1200x400/8b5cf6/white?text=Hot+Deals+This+Week', title: 'Hot Deals This Week', subtitle: 'Up to 50% off on selected items' },
    { id: '3', image_url: 'https://placehold.co/1200x400/a855f7/white?text=New+Arrivals', title: 'New Arrivals', subtitle: 'Check out our latest products' },
  ],
  payment: {
    slip2go: {
      enabled: true,
      secretKey: 'M6hNgodeWm2PhDhVVRTv5gPelaw42b8k5MjtUrka5mI=',
      bankName: 'ธนาคารกสิกรไทย',
      accountName: 'XDNZ Store',
      accountNumber: 'xxx-x-xxxxx-x',
      accountType: '01004',
      qrCodeUrl: '',
    },
    truemoney: { enabled: true, phoneNumber: '08xxxxxxxx' },
  },
  branding: { siteTitle: 'XDNZ Store - Digital Goods Shop', logoUrl: '', themeColor: '#7c3aed', accentColor: '#a855f7' },
  social: { discordUrl: '', facebookUrl: '', facebookPageId: '', facebookWidgetEnabled: false },
  contact: { email: 'admin@xdnz.store', line: '@xdnzstore', phone: '' },
};

// ============================================
// Initialization
// ============================================

let _initPromise: Promise<void> | null = null;

export async function initializeStorage(): Promise<void> {
  if (_initPromise) return _initPromise;
  _initPromise = _doInit();
  return _initPromise;
}

async function _doInit(): Promise<void> {

  // Create tables one by one to avoid pg_type conflicts
  for (const stmt of SCHEMA_STATEMENTS) {
    await pool.query(stmt);
  }

  // Seed users if empty
  const userCount = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM users');
  if (userCount && parseInt(userCount.count) === 0) {
    for (const u of DEFAULT_USERS) {
      await pool.query(
        'INSERT INTO users (id, username, password, role, credit) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
        [u.id, u.username, u.password, u.role, u.credit],
      );
    }
  }

  // Seed categories if empty
  const catCount = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM categories');
  if (catCount && parseInt(catCount.count) === 0) {
    for (const c of DEFAULT_CATEGORIES) {
      await pool.query(
        'INSERT INTO categories (id, name, image_url) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
        [c.id, c.name, c.image_url],
      );
    }
  }

  // Seed products + stock if empty
  const prodCount = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM products');
  if (prodCount && parseInt(prodCount.count) === 0) {
    for (const p of DEFAULT_PRODUCTS) {
      await pool.query(
        'INSERT INTO products (id, name, price, image_url, category_id) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
        [p.id, p.name, p.price, p.image_url, p.category_id],
      );
      for (const code of p.stock_content) {
        await pool.query(
          'INSERT INTO stock_items (product_id, content) VALUES ($1,$2)',
          [p.id, code],
        );
      }
    }
  }

  // Seed config if empty
  const cfgCount = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM site_config');
  if (cfgCount && parseInt(cfgCount.count) === 0) {
    await pool.query(
      'INSERT INTO site_config (key, value) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      ['main', JSON.stringify(DEFAULT_CONFIG)],
    );
  }

  // initialization complete (promise stored, so this only runs once)
}

// ============================================
// Generate ID
// ============================================

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// ============================================
// USER helpers
// ============================================