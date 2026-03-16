'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { buyProduct, getSession } from '@/lib/actions';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{ success: boolean; message: string; content?: string } | null>(null);
  const router = useRouter();

  const stockCount = product.stock_content.length;
  const stockStatus = stockCount === 0 ? 'out' : stockCount <= 3 ? 'low' : 'available';

  async function handleBuy() {
    setIsLoading(true);
    
    // Check if logged in
    const session = await getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    const result = await buyProduct(product.id);
    
    setPurchaseResult({
      success: result.success,
      message: result.message,
      content: result.data?.content,
    });
    setShowModal(true);
    setIsLoading(false);
    
    if (result.success) {
      window.dispatchEvent(new Event('user-data-updated'));  // Trigger navbar update
      router.refresh();
    }
  }

  return (
    <>
      <div className="card overflow-hidden flex flex-col">
        {/* Product Image */}
        <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-purple-50">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          {/* Stock Badge */}
          <div className={`absolute top-3 right-3 stock-badge ${
            stockStatus === 'out' ? 'stock-out' : 
            stockStatus === 'low' ? 'stock-low' : 'stock-available'
          }`}>
            {stockStatus === 'out' ? 'Out of Stock' : `${stockCount} in stock`}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between mt-auto pt-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              ${product.price.toFixed(2)}
            </span>
            <button
              onClick={handleBuy}
              disabled={isLoading || stockCount === 0}
              className="btn-primary text-sm px-4 py-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing
                </span>
              ) : stockCount === 0 ? (
                'Sold Out'
              ) : (
                'Buy Now'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Purchase Result Modal */}
      {showModal && purchaseResult && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              purchaseResult.success ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {purchaseResult.success ? (
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            
            <h3 className={`text-xl font-bold text-center mb-2 ${
              purchaseResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {purchaseResult.success ? 'Purchase Successful!' : 'Purchase Failed'}
            </h3>
            
            <p className="text-center text-gray-600 mb-4">
              {purchaseResult.message}
            </p>
            
            {purchaseResult.content && (
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 mb-4">
                <p className="text-sm text-purple-600 mb-2 font-medium">Your code/content:</p>
                <div className="bg-white rounded-lg p-3 font-mono text-center text-lg font-bold text-purple-800 break-all">
                  {purchaseResult.content}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(purchaseResult.content!)}
                  className="mt-2 w-full text-sm text-purple-600 hover:text-purple-800 flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy to clipboard
                </button>
              </div>
            )}
            
            <button
              onClick={() => setShowModal(false)}
              className="w-full btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
