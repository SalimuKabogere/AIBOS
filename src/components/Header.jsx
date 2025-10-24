import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/home', label: 'My Tasks' },
    { path: '/categories', label: 'Categories' }
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-black font-oswald">TaskMaster</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`font-oswald transition-colors ${
                  location.pathname === item.path
                    ? 'text-black font-bold border-b-2 border-black pb-1'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 font-oswald">
              Welcome back!
            </span>
            <button
              onClick={handleLogout}
              className="bg-black text-white px-4 py-2 rounded-lg font-oswald hover:bg-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`font-oswald text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'text-black font-bold'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;