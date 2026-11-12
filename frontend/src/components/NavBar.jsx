import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function NavBar(){
  const {user, logout} = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const nav = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('👋 Successfully logged out!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    nav('/login');
    setIsMobileMenuOpen(false);
  };

  const isActiveLink = (path) => location.pathname === path;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-200'
          : 'bg-gradient-to-r from-green-500 to-green-600 shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center space-x-3 group hover:scale-105 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:rotate-12 ${
                  isScrolled ? 'bg-green-500' : 'bg-white'
                }`}>
                  <span className={`font-bold text-lg transition-colors duration-300 ${
                    isScrolled ? 'text-white' : 'text-green-600'
                  }`}>💊</span>
                </div>
                <span className={`font-bold text-xl transition-colors duration-300 ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`}>
                  MediCare
                </span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isScrolled
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span className={`block w-5 h-0.5 transition-all duration-300 ${
                    isScrolled ? 'bg-gray-600' : 'bg-white'
                  } ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                  <span className={`block w-5 h-0.5 transition-all duration-300 ${
                    isScrolled ? 'bg-gray-600' : 'bg-white'
                  } ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                  <span className={`block w-5 h-0.5 transition-all duration-300 ${
                    isScrolled ? 'bg-gray-600' : 'bg-white'
                  } ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
                </div>
              </button>
            </div>

            {/* Main Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/browse"
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  isScrolled
                    ? isActiveLink('/browse')
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                    : isActiveLink('/browse')
                      ? 'text-green-200 bg-white/20'
                      : 'text-white hover:text-green-100 hover:bg-white/10'
                }`}
              >
                Browse Medicines
                <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 transition-all duration-300 ${
                  isActiveLink('/browse') ? 'w-full bg-current' : 'group-hover:w-1/2'
                }`}></span>
              </Link>
              <Link
                to="/cart"
                onClick={() => {
                  setIsCartAnimating(true);
                  setTimeout(() => setIsCartAnimating(false), 600);
                }}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group ${
                  isScrolled
                    ? isActiveLink('/cart')
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                    : isActiveLink('/cart')
                      ? 'text-green-200 bg-white/20'
                      : 'text-white hover:text-green-100 hover:bg-white/10'
                }`}
              >
                <span className={`transition-transform duration-300 ${isCartAnimating ? 'scale-125' : ''}`}>
                  🛒 Cart
                </span>
                <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 transition-all duration-300 ${
                  isActiveLink('/cart') ? 'w-full bg-current' : 'group-hover:w-1/2'
                }`}></span>
              </Link>
              {user?.role==='ADMIN' && (
                <Link
                  to="/admin"
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group ${
                    isScrolled
                      ? isActiveLink('/admin')
                        ? 'text-green-600 bg-green-50 shadow-md'
                        : 'text-gray-700 hover:text-green-600 hover:bg-green-50 hover:shadow-md'
                      : isActiveLink('/admin')
                        ? 'text-green-200 bg-white/30 shadow-lg'
                        : 'text-white hover:text-green-100 hover:bg-white/20 hover:shadow-md'
                  }`}
                >
                  ⚙️ Admin Panel
                  <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 transition-all duration-300 ${
                    isActiveLink('/admin') ? 'w-full bg-current' : 'group-hover:w-1/2'
                  }`}></span>
                </Link>
              )}
            </div>

            {/* Dark Mode Toggle & User Actions */}
            <div className="flex items-center space-x-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isScrolled
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-white hover:bg-white/20'
                }`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {!user ? (
                <>
                  <Link
                    to="/login"
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isScrolled
                        ? 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                        : 'text-white hover:text-green-100 hover:bg-white/10'
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                      isScrolled
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-white text-green-600 hover:bg-gray-50'
                    }`}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className={`hidden sm:flex items-center space-x-2 px-3 py-2 rounded-xl ${
                    isScrolled ? 'bg-gray-100' : 'bg-white/10'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      user.role === 'ADMIN' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      isScrolled ? 'text-gray-700' : 'text-white'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
                      isScrolled
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-xl transition-all duration-300 ${
            isMobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'
          }`}>
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/browse"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActiveLink('/browse')
                    ? 'bg-green-500 text-white'
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                }`}
              >
                📋 Browse Medicines
              </Link>
              <Link
                to="/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActiveLink('/cart')
                    ? 'bg-green-500 text-white'
                    : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                }`}
              >
                🛒 Cart
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActiveLink('/admin')
                      ? 'bg-green-500 text-white'
                      : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                  }`}
                >
                  ⚙️ Admin Panel
                </Link>
              )}
              <hr className="border-gray-200" />
              {!user ? (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="px-4 py-2 text-center text-gray-600">
                    Welcome, <span className="font-medium text-gray-900">{user.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-3 text-center bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
