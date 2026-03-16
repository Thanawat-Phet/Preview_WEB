'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getSession,
  fetchProducts,
  fetchCategories,
  getSiteConfig,
  getAllUsers,
  getAllOrders,
  addProduct,
  updateProduct,
  deleteProduct,
  addStockToProduct,
  addCategory,
  deleteCategory,
  addUserCredit,
  updateBanners,
  updatePaymentConfig,
  getAllTopupTransactions,
  updateSiteSettings,
} from '@/lib/actions';
import type { Product, Category, User, Order, Banner, SessionData, SiteConfig, PaymentConfig, TopupTransaction } from '@/lib/types';

type Tab = 'products' | 'categories' | 'users' | 'orders' | 'banners' | 'payment' | 'topups' | 'settings';

export default function AdminPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('products');
  
  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [topupTransactions, setTopupTransactions] = useState<TopupTransaction[]>([]);
  
  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  
  // Selected items for editing
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  
  // Form states
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const router = useRouter();

  const loadData = useCallback(async () => {
    const [productsData, categoriesData, usersData, ordersData, configData, topupsData] = await Promise.all([
      fetchProducts(),
      fetchCategories(),
      getAllUsers(),
      getAllOrders(),
      getSiteConfig(),
      getAllTopupTransactions(),
    ]);
    
    setProducts(productsData);
    setCategories(categoriesData);
    setUsers(usersData);
    setOrders(ordersData);
    setConfig(configData);
    setTopupTransactions(topupsData);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      const sessionData = await getSession();
      if (!sessionData || sessionData.role !== 'admin') {
        router.push('/login');
        return;
      }
      setSession(sessionData);
      await loadData();
      setIsLoading(false);
    }
    
    checkAuth();
  }, [router, loadData]);

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'products',
      label: 'Products',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      id: 'users',
      label: 'Users',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'banners',
      label: 'Banners',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'payment',
      label: 'Payment',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: 'topups',
      label: 'Topups',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Message Toast */}
      {message && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-xl shadow-lg animate-slide-in ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {message.text}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-500 mt-1">Manage your store</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'gradient-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card p-6">
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Products</h2>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setShowProductModal(true);
                  }}
                  className="btn-primary"
                >
                  Add Product
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Product</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Price</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Stock</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Category</th>
                      <th className="text-right py-3 px-4 text-gray-600 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <span className="font-medium text-gray-800">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">${product.price.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.stock_content.length === 0
                              ? 'bg-red-100 text-red-700'
                              : product.stock_content.length <= 3
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {product.stock_content.length} items
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {categories.find(c => c.id === product.category_id)?.name || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowStockModal(true);
                              }}
                              className="p-2 rounded-lg hover:bg-purple-100 text-purple-600"
                              title="Add Stock"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowProductModal(true);
                              }}
                              className="p-2 rounded-lg hover:bg-blue-100 text-blue-600"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this product?')) {
                                  const result = await deleteProduct(product.id);
                                  if (result.success) {
                                    showMessage('success', 'Product deleted');
                                    loadData();
                                  } else {
                                    showMessage('error', result.message);
                                  }
                                }
                              }}
                              className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="btn-primary"
                >
                  Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white text-sm font-bold">
                        {category.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{category.name}</span>
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this category?')) {
                          const result = await deleteCategory(category.id);
                          if (result.success) {
                            showMessage('success', 'Category deleted');
                            loadData();
                          } else {
                            showMessage('error', result.message);
                          }
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Users</h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Username</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Role</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Credit</th>
                      <th className="text-right py-3 px-4 text-gray-600 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-800">{user.username}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800">${user.credit.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowCreditModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg text-sm bg-green-100 text-green-700 hover:bg-green-200"
                            >
                              Add Credit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">All Orders</h2>

              {orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Order ID</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">User</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Product</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Content</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-sm text-gray-600">{order.id.slice(0, 8)}...</td>
                          <td className="py-3 px-4 text-gray-600">
                            {users.find(u => u.id === order.user_id)?.username || order.user_id}
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-800">{order.product_name}</td>
                          <td className="py-3 px-4">
                            <code className="px-2 py-1 rounded bg-gray-100 text-sm">{order.content_delivered}</code>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {new Date(order.date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">No orders yet</div>
              )}
            </div>
          )}

          {/* Banners Tab */}
          {activeTab === 'banners' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Banners</h2>
                <button
                  onClick={() => {
                    setSelectedBanner(null);
                    setShowBannerModal(true);
                  }}
                  className="btn-primary"
                >
                  Add Banner
                </button>
              </div>

              <div className="space-y-4">
                {config?.banners.map((banner, index) => (
                  <div key={banner.id} className="p-4 rounded-xl border border-gray-200 flex items-center gap-4">
                    <div 
                      className="w-32 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url(${banner.image_url})` }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{banner.title}</h3>
                      <p className="text-sm text-gray-500">{banner.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedBanner(banner);
                          setShowBannerModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-blue-100 text-blue-600"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to delete this banner?')) {
                            const newBanners = config.banners.filter((_, i) => i !== index);
                            const result = await updateBanners(newBanners);
                            if (result.success) {
                              showMessage('success', 'Banner deleted');
                              loadData();
                            } else {
                              showMessage('error', result.message);
                            }
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Settings Tab */}
          {activeTab === 'payment' && config && (
            <PaymentSettingsTab
              config={config}
              onSave={async (payment) => {
                const result = await updatePaymentConfig(payment);
                if (result.success) {
                  showMessage('success', result.message);
                  loadData();
                } else {
                  showMessage('error', result.message);
                }
              }}
            />
          )}

          {/* Topups Tab */}
          {activeTab === 'topups' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Topup Transactions</h2>

              {topupTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">ID</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">User</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Type</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topupTransactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-sm text-gray-600">{tx.id.slice(0, 8)}...</td>
                          <td className="py-3 px-4 text-gray-600">
                            {users.find(u => u.id === tx.user_id)?.username || tx.user_id}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              tx.type === 'slip'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {tx.type === 'slip' ? 'Slip' : 'TrueMoney'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-green-600">${tx.amount.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              tx.status === 'success'
                                ? 'bg-green-100 text-green-700'
                                : tx.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {new Date(tx.date).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">No topup transactions yet</div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && config && (
            <SiteSettingsTab
              config={config}
              onSave={async (settings) => {
                const result = await updateSiteSettings(settings);
                if (result.success) {
                  showMessage('success', result.message);
                  loadData();
                } else {
                  showMessage('error', result.message);
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          product={selectedProduct}
          categories={categories}
          onClose={() => setShowProductModal(false)}
          onSave={async (data) => {
            let result;
            if (selectedProduct) {
              result = await updateProduct(
                selectedProduct.id,
                data.name,
                data.price,
                data.imageUrl,
                data.categoryId,
                data.stockContent
              );
            } else {
              result = await addProduct(
                data.name,
                data.price,
                data.imageUrl,
                data.categoryId,
                data.stockContent || ''
              );
            }
            
            if (result.success) {
              showMessage('success', result.message);
              setShowProductModal(false);
              loadData();
            } else {
              showMessage('error', result.message);
            }
          }}
        />
      )}

      {/* Stock Modal */}
      {showStockModal && selectedProduct && (
        <StockModal
          product={selectedProduct}
          onClose={() => setShowStockModal(false)}
          onSave={async (stockContent) => {
            const result = await addStockToProduct(selectedProduct.id, stockContent);
            if (result.success) {
              showMessage('success', result.message);
              setShowStockModal(false);
              loadData();
            } else {
              showMessage('error', result.message);
            }
          }}
        />
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          onClose={() => setShowCategoryModal(false)}
          onSave={async (name, imageUrl) => {
            const result = await addCategory(name, imageUrl);
            if (result.success) {
              showMessage('success', result.message);
              setShowCategoryModal(false);
              loadData();
            } else {
              showMessage('error', result.message);
            }
          }}
        />
      )}

      {/* Credit Modal */}
      {showCreditModal && selectedUser && (
        <CreditModal
          user={selectedUser}
          onClose={() => setShowCreditModal(false)}
          onSave={async (amount) => {
            const result = await addUserCredit(selectedUser.id, amount);
            if (result.success) {
              showMessage('success', result.message);
              setShowCreditModal(false);
              loadData();
            } else {
              showMessage('error', result.message);
            }
          }}
        />
      )}

      {/* Banner Modal */}
      {showBannerModal && config && (
        <BannerModal
          banner={selectedBanner}
          onClose={() => setShowBannerModal(false)}
          onSave={async (bannerData) => {
            let newBanners: Banner[];
            if (selectedBanner) {
              newBanners = config.banners.map(b => 
                b.id === selectedBanner.id ? { ...b, ...bannerData } : b
              );
            } else {
              newBanners = [...config.banners, { id: Date.now().toString(), ...bannerData }];
            }
            
            const result = await updateBanners(newBanners);
            if (result.success) {
              showMessage('success', 'Banner saved');
              setShowBannerModal(false);
              loadData();
            } else {
              showMessage('error', result.message);
            }
          }}
        />
      )}
    </div>
  );
}

// Product Modal Component
function ProductModal({
  product,
  categories,
  onClose,
  onSave,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: { name: string; price: number; imageUrl: string; categoryId: string; stockContent?: string }) => void;
}) {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [categoryId, setCategoryId] = useState(product?.category_id || categories[0]?.id || '');
  const [stockContent, setStockContent] = useState(product?.stock_content.join('\n') || '');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content max-w-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {product ? 'Edit Product' : 'Add Product'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
              placeholder="Product name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="input-field"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="input-field"
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="input-field"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Content (one code per line)
            </label>
            <textarea
              value={stockContent}
              onChange={e => setStockContent(e.target.value)}
              className="input-field min-h-[120px]"
              placeholder="CODE-001&#10;CODE-002&#10;CODE-003"
            />
            <p className="text-xs text-gray-500 mt-1">
              Each line will become one item in stock
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => onSave({
              name,
              price: parseFloat(price),
              imageUrl,
              categoryId,
              stockContent,
            })}
            className="flex-1 btn-primary"
          >
            {product ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Stock Modal Component
function StockModal({
  product,
  onClose,
  onSave,
}: {
  product: Product;
  onClose: () => void;
  onSave: (stockContent: string) => void;
}) {
  const [stockContent, setStockContent] = useState('');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Add Stock</h2>
        <p className="text-gray-500 text-sm mb-4">Adding stock to: {product.name}</p>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock Codes (one per line)
          </label>
          <textarea
            value={stockContent}
            onChange={e => setStockContent(e.target.value)}
            className="input-field min-h-[200px]"
            placeholder="Paste your codes here, one per line:&#10;CODE-001&#10;CODE-002&#10;CODE-003"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">
            Current stock: {product.stock_content.length} items
          </p>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => onSave(stockContent)}
            className="flex-1 btn-primary"
            disabled={!stockContent.trim()}
          >
            Add Stock
          </button>
        </div>
      </div>
    </div>
  );
}

// Category Modal Component
function CategoryModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (name: string, imageUrl: string) => void;
}) {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add Category</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
              placeholder="Category name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => onSave(name, imageUrl)}
            className="flex-1 btn-primary"
            disabled={!name.trim()}
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  );
}

// Credit Modal Component
function CreditModal({
  user,
  onClose,
  onSave,
}: {
  user: User;
  onClose: () => void;
  onSave: (amount: number) => void;
}) {
  const [amount, setAmount] = useState('');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Add Credit</h2>
        <p className="text-gray-500 text-sm mb-4">
          Adding credit to: {user.username} (Current: ${user.credit.toFixed(2)})
        </p>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="input-field"
            placeholder="0.00"
            step="0.01"
            min="0"
            autoFocus
          />
        </div>
        
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => onSave(parseFloat(amount))}
            className="flex-1 btn-primary"
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Add Credit
          </button>
        </div>
      </div>
    </div>
  );
}

// Banner Modal Component
function BannerModal({
  banner,
  onClose,
  onSave,
}: {
  banner: Banner | null;
  onClose: () => void;
  onSave: (data: Omit<Banner, 'id'>) => void;
}) {
  const [title, setTitle] = useState(banner?.title || '');
  const [subtitle, setSubtitle] = useState(banner?.subtitle || '');
  const [imageUrl, setImageUrl] = useState(banner?.image_url || '');
  const [link, setLink] = useState(banner?.link || '');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {banner ? 'Edit Banner' : 'Add Banner'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input-field"
              placeholder="Banner title"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              className="input-field"
              placeholder="Banner subtitle"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="input-field"
              placeholder="https://example.com/banner.jpg"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
            <input
              type="url"
              value={link}
              onChange={e => setLink(e.target.value)}
              className="input-field"
              placeholder="https://example.com/page"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-secondary">
            Cancel
          </button>
          <button
            onClick={() => onSave({ title, subtitle, image_url: imageUrl, link })}
            className="flex-1 btn-primary"
            disabled={!title.trim() || !imageUrl.trim()}
          >
            {banner ? 'Save Changes' : 'Add Banner'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Payment Settings Tab Component
function PaymentSettingsTab({
  config,
  onSave,
}: {
  config: SiteConfig;
  onSave: (payment: PaymentConfig) => void;
}) {
  const [payment, setPayment] = useState<PaymentConfig>(config.payment);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    await onSave(payment);
    setIsSaving(false);
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Payment Settings</h2>

      {/* Slip2Go Settings */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Slip2Go (Bank Transfer)</h3>
              <p className="text-sm text-gray-500">ตั้งค่าข้อมูลบัญชีธนาคารสำหรับรับโอนเงิน</p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={payment.slip2go.enabled}
              onChange={(e) => setPayment({
                ...payment,
                slip2go: { ...payment.slip2go, enabled: e.target.checked }
              })}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-sm text-gray-600">Enable</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
            <input
              type="password"
              value={payment.slip2go.secretKey}
              onChange={(e) => setPayment({
                ...payment,
                slip2go: { ...payment.slip2go, secretKey: e.target.value }
              })}
              className="input-field"
              placeholder="Slip2Go Secret Key"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
            <input
              type="text"
              value={payment.slip2go.bankName}
              onChange={(e) => setPayment({
                ...payment,
                slip2go: { ...payment.slip2go, bankName: e.target.value }
              })}
              className="input-field"
              placeholder="ธนาคารกสิกรไทย"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
            <input
              type="text"
              value={payment.slip2go.accountName}
              onChange={(e) => setPayment({
                ...payment,
                slip2go: { ...payment.slip2go, accountName: e.target.value }
              })}
              className="input-field"
              placeholder="ชื่อบัญชี"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
            <input
              type="text"
              value={payment.slip2go.accountNumber}
              onChange={(e) => setPayment({
                ...payment,
                slip2go: { ...payment.slip2go, accountNumber: e.target.value }
              })}
              className="input-field"
              placeholder="xxx-x-xxxxx-x"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select
              value={payment.slip2go.accountType}
              onChange={(e) => setPayment({
                ...payment,
                slip2go: { ...payment.slip2go, accountType: e.target.value }
              })}
              className="input-field"
            >
              <option value="01004">ธนาคารกสิกรไทย (KBank)</option>
              <option value="01002">ธนาคารกรุงเทพ (BBL)</option>
              <option value="01006">ธนาคารกรุงไทย (KTB)</option>
              <option value="01014">ธนาคารไทยพาณิชย์ (SCB)</option>
              <option value="01025">ธนาคารกรุงศรีอยุธยา (BAY)</option>
              <option value="01069">ธนาคารทหารไทยธนชาต (TTB)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">QR Code URL (optional)</label>
            <input
              type="url"
              value={payment.slip2go.qrCodeUrl || ''}
              onChange={(e) => setPayment({
                ...payment,
                slip2go: { ...payment.slip2go, qrCodeUrl: e.target.value }
              })}
              className="input-field"
              placeholder="https://example.com/qrcode.jpg"
            />
          </div>
        </div>
      </div>

      {/* TrueMoney Settings */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">TrueMoney (ซองอังเปา)</h3>
              <p className="text-sm text-gray-500">ตั้งค่าเบอร์โทรสำหรับรับซองอังเปา</p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={payment.truemoney.enabled}
              onChange={(e) => setPayment({
                ...payment,
                truemoney: { ...payment.truemoney, enabled: e.target.checked }
              })}
              className="w-4 h-4 text-orange-600 rounded"
            />
            <span className="text-sm text-gray-600">Enable</span>
          </label>
        </div>

        <div className="p-4 rounded-xl bg-gray-50">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={payment.truemoney.phoneNumber}
              onChange={(e) => setPayment({
                ...payment,
                truemoney: { ...payment.truemoney, phoneNumber: e.target.value }
              })}
              className="input-field"
              placeholder="08xxxxxxxx"
            />
            <p className="text-xs text-gray-500 mt-1">
              เบอร์โทรศัพท์ที่ลงทะเบียน TrueMoney Wallet
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary min-w-[150px]"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
}

// Site Settings Tab Component
function SiteSettingsTab({
  config,
  onSave,
}: {
  config: SiteConfig;
  onSave: (settings: { siteName: string; branding: SiteConfig['branding']; social: SiteConfig['social']; contact: SiteConfig['contact'] }) => Promise<void>;
}) {
  const [siteName, setSiteName] = useState(config.siteName);
  const [branding, setBranding] = useState(config.branding);
  const [social, setSocial] = useState(config.social);
  const [contact, setContact] = useState(config.contact);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    await onSave({ siteName, branding, social, contact });
    setIsSaving(false);
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Site Settings</h2>

      {/* Site Branding */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Site Branding</h3>
            <p className="text-sm text-gray-500">ปรับแต่งชื่อและสีของเว็บไซต์</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="input-field"
              placeholder="XDNZ Store"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Browser Title</label>
            <input
              type="text"
              value={branding.siteTitle}
              onChange={(e) => setBranding({ ...branding, siteTitle: e.target.value })}
              className="input-field"
              placeholder="XDNZ Store - Digital Goods Shop"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input
              type="url"
              value={branding.logoUrl}
              onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
              className="input-field"
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={branding.themeColor}
                onChange={(e) => setBranding({ ...branding, themeColor: e.target.value })}
                className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={branding.themeColor}
                onChange={(e) => setBranding({ ...branding, themeColor: e.target.value })}
                className="input-field flex-1"
                placeholder="#7c3aed"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={branding.accentColor}
                onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={branding.accentColor}
                onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                className="input-field flex-1"
                placeholder="#a855f7"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Social Links</h3>
            <p className="text-sm text-gray-500">ลิงก์โซเชียลมีเดียต่างๆ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discord URL</label>
            <input
              type="url"
              value={social.discordUrl}
              onChange={(e) => setSocial({ ...social, discordUrl: e.target.value })}
              className="input-field"
              placeholder="https://discord.gg/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
            <input
              type="url"
              value={social.facebookUrl}
              onChange={(e) => setSocial({ ...social, facebookUrl: e.target.value })}
              className="input-field"
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Page ID (For Widget)</label>
            <input
              type="text"
              value={social.facebookPageId}
              onChange={(e) => setSocial({ ...social, facebookPageId: e.target.value })}
              className="input-field"
              placeholder="100xxxxxxxxx"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer mt-6">
              <input
                type="checkbox"
                checked={social.facebookWidgetEnabled}
                onChange={(e) => setSocial({ ...social, facebookWidgetEnabled: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Enable Facebook Widget on Home</span>
            </label>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Contact Us</h3>
            <p className="text-sm text-gray-500">ข้อมูลติดต่อแอดมิน</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              className="input-field"
              placeholder="admin@xdnz.store"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Line ID</label>
            <input
              type="text"
              value={contact.line}
              onChange={(e) => setContact({ ...contact, line: e.target.value })}
              className="input-field"
              placeholder="@xdnzstore"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              className="input-field"
              placeholder="08xxxxxxxx"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary min-w-[150px]"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
}
