import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div>
      <nav className="bg-gray-800 text-white py-5 px-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <span className="text-blue-400">CPBL</span> Fantasy
          </Link>
          
          <div className="space-x-6">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">Welcome, <span className="text-white font-semibold">{user?.username}</span></span>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-500 py-2 px-4 rounded transition duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4"> {/* Use gap instead of space-x */}
                <Link to="/login" className="hover:text-blue-300 transition duration-200 px-3 py-2">Login</Link>
                <Link to="/signup" className="bg-blue-600 hover:bg-blue-500 min-w-[70px] text-center py-2 px-4 rounded transition duration-200">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      <div className="h-1 bg-blue-900 shadow-md"></div>
    </div>
  );
}

export default Navbar;