import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCsrfToken } from '../axiosConfig';
import { baseLink } from '../models';

function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Get CSRF token when component mounts
  useEffect(() => {
    getCsrfToken();
  }, []);     


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Basic validation
    if (password1 !== password2) {
      setErrors({password2: "Passwords don't match"});
      return;
    }
    
    setIsLoading(true);

    try {
      // Prepare signup data
      const signupData = {
        username,
        email,
        password1,
        password2
      };
      
      // Get a fresh CSRF token
      await getCsrfToken();
      
      // Get the CSRF token from cookie
      const cookies = document.cookie.split(';');
      const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrftoken='));
      const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : '';
      
      // For some reason, only fetch works, not axios. that's weird.
      const response = await fetch(baseLink + 'accounts/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        credentials: 'include',
        body: JSON.stringify(signupData)
      });
      
      if (!response.status.toString().startsWith('2')) {
        console.error('Signup failed with status:', response.status);
        console.log('Response data:', response.statusText);
        throw new Error('Signup failed');
      }
      
      console.log('signup successful');
      navigate('/login', { state: { message: 'Account created successfully! Please log in.' } });
      return;
    } catch (customErr: any) {
      console.error('signup failed:', customErr);
      
      if (!Object.keys(errors).length) {
        setErrors({non_field_errors: 'An error occurred. Please try again.'});
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="text-blue-400 hover:text-blue-300 mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>
          
          {errors.non_field_errors && (
            <div className="bg-red-900/50 border border-red-500 text-red-100 px-4 py-3 rounded mb-4">
              {errors.non_field_errors}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 
                  ${errors.username ? 'border border-red-500' : ''}`}
                required
              />
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.email ? 'border border-red-500' : ''}`}
                required
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div className="mb-4">
              <label htmlFor="password1" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password1"
                type="password"
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
                className={`w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.password1 ? 'border border-red-500' : ''}`}
                required
              />
              {errors.password1 && <p className="text-red-400 text-xs mt-1">{errors.password1}</p>}
            </div>
            
            <div className="mb-6">
              <label htmlFor="password2" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                id="password2"
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                className={`w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.password2 ? 'border border-red-500' : ''}`}
                required
              />
              {errors.password2 && <p className="text-red-400 text-xs mt-1">{errors.password2}</p>}
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded transition-colors duration-200 font-medium disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;