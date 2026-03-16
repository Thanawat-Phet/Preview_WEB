import Link from 'next/link';

export default function RewardsPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-lg p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 gradient-primary rounded-2xl flex items-center justify-center animate-pulse-glow">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Rewards Program</h1>
        <p className="text-gray-500 mb-6">
          Earn points with every purchase and redeem them for exclusive rewards!
        </p>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-700">0</div>
              <div className="text-sm text-gray-500">Points</div>
            </div>
            <div className="w-px h-12 bg-purple-200" />
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-700">$0</div>
              <div className="text-sm text-gray-500">Value</div>
            </div>
          </div>
          <p className="text-xs text-purple-600">
            Earn 1 point for every $1 spent. 100 points = $5 credit
          </p>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-xl border border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <span className="text-xl">🎁</span>
            </div>
            <div className="text-left flex-1">
              <h3 className="font-medium text-gray-800">Welcome Bonus</h3>
              <p className="text-sm text-gray-500">50 points for new members</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Claimed</span>
          </div>
          
          <div className="p-4 rounded-xl border border-gray-200 flex items-center gap-3 opacity-50">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <span className="text-xl">💎</span>
            </div>
            <div className="text-left flex-1">
              <h3 className="font-medium text-gray-800">VIP Status</h3>
              <p className="text-sm text-gray-500">Spend $100 to unlock</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">Locked</span>
          </div>
        </div>
        
        <Link href="/" className="btn-primary inline-block">
          Start Shopping
        </Link>
      </div>
    </div>
  );
}
