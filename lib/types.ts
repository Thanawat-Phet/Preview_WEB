// User model
export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  credit: number;
}

// Category model
export interface Category {
  id: string;
  name: string;
  image_url: string;
}

// Product model - stock_content is an array of strings (e.g., game codes)
export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category_id: string;
  stock_content: string[];
}

// Order model
export interface Order {
  id: string;
  user_id: string;
  product_name: string;
  content_delivered: string;
  date: string;
}

// Site configuration
export interface SiteConfig {
  banners: Banner[];
  siteName: string;
  payment: PaymentConfig;
  // Site branding
  branding: {
    siteTitle: string;      // Browser tab title
    logoUrl: string;        // Logo image URL
    themeColor: string;     // Primary theme color (hex)
    accentColor: string;    // Secondary accent color (hex)
  };
  // Social links
  social: {
    discordUrl: string;
    facebookUrl: string;
    facebookPageId: string; // For FB widget
    facebookWidgetEnabled: boolean;
  };
  // Contact info
  contact: {
    email: string;
    line: string;
    phone: string;
  };
}

// Payment configuration
export interface PaymentConfig {
  slip2go: {
    enabled: boolean;
    secretKey: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    accountType: string; // e.g., "01004" for bank account
    qrCodeUrl?: string;
  };
  truemoney: {
    enabled: boolean;
    phoneNumber: string;
  };
}

// Topup transaction record
export interface TopupTransaction {
  id: string;
  user_id: string;
  type: 'slip' | 'truemoney';
  amount: number;
  status: 'pending' | 'success' | 'failed';
  reference?: string;
  transactionId?: string;
  date: string;
}

export interface Banner {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  link?: string;
}

// Session data stored in cookie
export interface SessionData {
  userId: string;
  username: string;
  role: 'admin' | 'user';
}

// Action response types
export interface ActionResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}
