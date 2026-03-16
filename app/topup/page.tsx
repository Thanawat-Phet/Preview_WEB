'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getSession, 
  getPaymentConfig, 
  verifySlipPayment, 
  redeemTruemoneyVoucher,
  getUserTopupHistory,
  getCurrentUser 
} from '@/lib/actions';
import type { SessionData, TopupTransaction, User } from '@/lib/types';

type TabType = 'slip' | 'truemoney';

export default function TopupPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('slip');
  const [paymentConfig, setPaymentConfig] = useState<{
    slip2go: { enabled: boolean; bankName: string; accountName: string; accountNumber: string; qrCodeUrl?: string };
    truemoney: { enabled: boolean };
  } | null>(null);
  const [transactions, setTransactions] = useState<TopupTransaction[]>([]);
  
  // Slip upload state
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // TrueMoney voucher state
  const [voucherUrl, setVoucherUrl] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  // Result modal
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<{ success: boolean; message: string; amount?: number } | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const sessionData = await getSession();
    if (!sessionData) {
      router.push('/login');
      return;
    }
    setSession(sessionData);
    
    const [userData, config, history] = await Promise.all([
      getCurrentUser(),
      getPaymentConfig(),
      getUserTopupHistory(),
    ]);
    
    setUser(userData);
    setPaymentConfig(config);
    setTransactions(history);
    setIsLoading(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSlipPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSlipSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slipPreview) return;
    
    setIsUploading(true);
    
    // Send base64 image directly to server action
    const result = await verifySlipPayment(slipPreview);
    
    setResultData({
      success: result.success,
      message: result.message,
      amount: result.data?.amount,
    });
    setShowResult(true);
    setIsUploading(false);
    
    if (result.success) {
      setSlipFile(null);
      setSlipPreview('');
      loadData();
      window.dispatchEvent(new Event('user-data-updated'));  // Trigger navbar update
      router.refresh();
    }
  }

  async function handleVoucherSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!voucherUrl.trim()) return;
    
    setIsRedeeming(true);
    
    const result = await redeemTruemoneyVoucher(voucherUrl);
    
    setResultData({
      success: result.success,
      message: result.message,
      amount: result.data?.amount,
    });
    setShowResult(true);
    setIsRedeeming(false);
    
    if (result.success) {
      setVoucherUrl('');
      loadData();
      window.dispatchEvent(new Event('user-data-updated'));  // Trigger navbar update
      router.refresh();
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Credit Balance */}
        <div className="card p-6 mb-6 gradient-primary text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1 text-black">เติมเงิน</h1>
              <p className="text-purple-600">เติมเครดิตเพื่อซื้อสินค้า</p>
            </div>
            <div className="text-right">
              <p className="text-purple-600 text-sm">ยอดเครดิตปัจจุบัน</p>
              <p className="text-3xl font-bold text-black">${user?.credit.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('slip')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'slip'
                ? 'gradient-primary text-white'
                : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            โอนเงิน / สลิป
          </button>
          <button
            onClick={() => setActiveTab('truemoney')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'truemoney'
                ? 'gradient-primary text-white'
                : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            ซองอังเปา TrueMoney
          </button>
        </div>

        {/* Slip Payment Tab */}
        {activeTab === 'slip' && paymentConfig?.slip2go.enabled && (
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">เติมเงินผ่านการโอนเงิน</h2>
            
            {/* Bank Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 mb-6">
              <h3 className="font-semibold text-purple-800 mb-3">ข้อมูลบัญชีรับโอน</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-purple-600">ธนาคาร</p>
                  <p className="font-semibold text-gray-800">{paymentConfig.slip2go.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-purple-600">ชื่อบัญชี</p>
                  <p className="font-semibold text-gray-800">{paymentConfig.slip2go.accountName}</p>
                </div>
                <div>
                  <p className="text-sm text-purple-600">เลขบัญชี</p>
                  <p className="font-semibold text-gray-800 font-mono">{paymentConfig.slip2go.accountNumber}</p>
                </div>
              </div>
              
              {paymentConfig.slip2go.qrCodeUrl && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-purple-600 mb-2">QR Code สำหรับโอนเงิน</p>
                  <img 
                    src={paymentConfig.slip2go.qrCodeUrl} 
                    alt="QR Code" 
                    className="w-40 h-40 mx-auto rounded-lg border border-purple-200"
                  />
                </div>
              )}
            </div>

            {/* Slip Upload Form */}
            <form onSubmit={handleSlipSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อัพโหลดสลิปการโอนเงิน
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                
                {slipPreview ? (
                  <div className="relative">
                    <img
                      src={slipPreview}
                      alt="Slip Preview"
                      className="w-full max-w-sm mx-auto rounded-xl shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSlipFile(null);
                        setSlipPreview('');
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-500 hover:bg-purple-50 transition-all"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-purple-600 font-medium mb-1">คลิกเพื่อเลือกรูปสลิป</p>
                    <p className="text-gray-500 text-sm">รองรับไฟล์ JPG, PNG</p>
                  </button>
                )}
              </div>
              
              <button
                type="submit"
                disabled={!slipFile || isUploading}
                className="w-full btn-primary py-3"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    กำลังตรวจสอบสลิป...
                  </span>
                ) : (
                  'ยืนยันการเติมเงิน'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Slip disabled message */}
        {activeTab === 'slip' && !paymentConfig?.slip2go.enabled && (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">ระบบเติมเงินผ่านสลิปปิดใช้งานอยู่</h3>
            <p className="text-gray-500">กรุณาติดต่อผู้ดูแลระบบ</p>
          </div>
        )}

        {/* TrueMoney Tab */}
        {activeTab === 'truemoney' && paymentConfig?.truemoney.enabled && (
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">เติมเงินผ่านซองอังเปา TrueMoney</h2>
            
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-5 mb-6">
              <h3 className="font-semibold text-orange-800 mb-2">วิธีใช้งาน</h3>
              <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
                <li>เปิดแอป TrueMoney Wallet</li>
                <li>สร้างซองอังเปาและคัดลอกลิงก์</li>
                <li>วางลิงก์ในช่องด้านล่าง แล้วกดยืนยัน</li>
              </ol>
            </div>

            <form onSubmit={handleVoucherSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ลิงก์ซองอังเปา
                </label>
                <input
                  type="text"
                  value={voucherUrl}
                  onChange={(e) => setVoucherUrl(e.target.value)}
                  placeholder="https://gift.truemoney.com/campaign/?v=..."
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ตัวอย่าง: https://gift.truemoney.com/campaign/?v=abc123xyz
                </p>
              </div>
              
              <button
                type="submit"
                disabled={!voucherUrl.trim() || isRedeeming}
                className="w-full btn-primary py-3"
              >
                {isRedeeming ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    กำลังรับซองอังเปา...
                  </span>
                ) : (
                  'รับซองอังเปา'
                )}
              </button>
            </form>
          </div>
        )}

        {/* TrueMoney disabled message */}
        {activeTab === 'truemoney' && !paymentConfig?.truemoney.enabled && (
          <div className="card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">ระบบซองอังเปาปิดใช้งานอยู่</h3>
            <p className="text-gray-500">กรุณาติดต่อผู้ดูแลระบบ</p>
          </div>
        )}

        {/* Transaction History */}
        {transactions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">ประวัติการเติมเงิน</h2>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.type === 'slip' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      {tx.type === 'slip' ? (
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {tx.type === 'slip' ? 'โอนเงิน/สลิป' : 'ซองอังเปา TrueMoney'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.date).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+${tx.amount.toFixed(2)}</p>
                    <p className={`text-xs ${tx.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.status === 'success' ? 'สำเร็จ' : 'ล้มเหลว'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result Modal */}
      {showResult && resultData && (
        <div className="modal-backdrop" onClick={() => setShowResult(false)}>
          <div className="modal-content text-center" onClick={(e) => e.stopPropagation()}>
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              resultData.success ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {resultData.success ? (
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            
            <h3 className={`text-2xl font-bold mb-2 ${
              resultData.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {resultData.success ? 'เติมเงินสำเร็จ!' : 'เติมเงินไม่สำเร็จ'}
            </h3>
            
            <p className="text-gray-600 mb-4">{resultData.message}</p>
            
            {resultData.success && resultData.amount && (
              <div className="bg-green-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-green-600 mb-1">จำนวนเงินที่เติม</p>
                <p className="text-3xl font-bold text-green-700">${resultData.amount.toFixed(2)}</p>
              </div>
            )}
            
            <button
              onClick={() => setShowResult(false)}
              className="w-full btn-primary"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
