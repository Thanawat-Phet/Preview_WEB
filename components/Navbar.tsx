'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession, logout, getCurrentUser } from '@/lib/actions';
import type { SessionData, User } from '@/lib/types';

export default function Navbar() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    loadSession();
  }, [pathname]);  // Reload session when pathname changes

  // Listen for custom refresh events (triggered after login, purchase, topup)
  useEffect(() => {
    function handleUserUpdate() {
      loadSession();
    }
    
    window.addEventListener('user-data-updated', handleUserUpdate);
    return () => window.removeEventListener('user-data-updated', handleUserUpdate);
  }, []);

  async function loadSession() {
    const sessionData = await getSession();
    setSession(sessionData);
    if (sessionData) {
      const userData = await getCurrentUser();
      setUser(userData);
    } else {
      setUser(null);
    }
  }

  async function handleLogout() {
    await logout();
    setSession(null);
    setUser(null);
    router.push('/');
    router.refresh();
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/#products', label: 'Shop' },
    { href: '/topup', label: 'Top-up' },
    { href: '/rewards', label: 'Rewards' },
  ];

  return (
    <nav className="navbar sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">X</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              XDNZ
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                {user && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-dark">
                    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-purple-700">${user.credit.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Hi, {session.username}</span>
                  {session.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      className="px-3 py-1.5 text-sm rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link href="/login" className="btn-primary text-sm">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`nav-link ${pathname === link.href ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
              {session ? (
                <>
                  {user && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass-dark">
                      <span className="text-sm text-gray-600">Credit:</span>
                      <span className="font-semibold text-purple-700">${user.credit.toFixed(2)}</span>
                    </div>
                  )}
                  {session.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="nav-link"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="nav-link"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left nav-link text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  href="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary text-center"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
