'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { LogOut, User, Shield } from 'lucide-react';

export default function Layout({ children, userRole = 'USER' }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const checkAuth = async () => {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='));
      
      console.log('Layout: Token found:', !!token);
      
      if (token) {
        try {
          // Manual decode untuk client side (lebih simple)
          const payload = JSON.parse(atob(token.split('=')[1].split('.')[1]));
          console.log('Layout: User payload:', payload);
          setUser(payload);
        } catch (e) {
          console.error('Token decode error:', e);
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    console.log('Logout clicked!');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setUser(null);
    router.push('/login');
  };

  // Prevent hydration errors
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-primary-600">
                  Bursa Makanan dan Snack Rapat
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                href="/"
                className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Bursa Makanan dan Snack Rapat
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 text-gray-700">
                    {user.role === 'ADMIN' ? <Shield size={20} /> : <User size={20} />}
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full font-medium">
                      {user.role}
                    </span>
                  </div>
                  
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                    >
                      Admin Panel
                    </Link>
                  )}
                  
                  <Link
                    href="/"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Home
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-800 font-medium transition-colors duration-200"
                  >
                    <LogOut size={18} />
                    <span className="text-sm">Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}