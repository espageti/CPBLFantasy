// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { baseLink } from '../models';

// function LogoutPage() {
//   const [error, setError] = useState('');
//   const [isLoggingOut, setIsLoggingOut] = useState(false);
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     setIsLoggingOut(true);
//     try {
//       const token = localStorage.getItem('token');
      
//       if (token) {
//         await axios.post(`${baseLink}accounts/logout/`, {}, {
//           headers: {
//             Authorization: `Token ${token}`
//           }
//         });
        
//         // Clear token from storage
//         localStorage.removeItem('token');
//         delete axios.defaults.headers.common['Authorization'];
//       }
      
//       // Redirect to home page after logout
//       navigate('/', { state: { message: 'You have been successfully logged out.' } });
//     } catch (err) {
//       setError('Failed to log out. Please try again.');
//       setIsLoggingOut(false);
//     }
//   };

//   const cancelLogout = () => {
//     navigate(-1);
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
//       <div className="w-full max-w-md">
//         <div className="bg-gray-800 rounded-lg p-8 shadow-lg text-center">
//           <h1 className="text-3xl font-bold mb-6">Log Out</h1>
          
//           {error && (
//             <div className="bg-red-900/50 border border-red-500 text-red-100 px-4 py-3 rounded mb-4">
//               {error}
//             </div>
//           )}
          
//           <p className="mb-8">Are you sure you want to log out?</p>
          
//           <div className="flex justify-center gap-4">
//             <button
//               onClick={handleLogout}
//               disabled={isLoggingOut}
//               className="bg-red-600 hover:bg-red-500 text-white py-2 px-6 rounded transition-colors duration-200 font-medium disabled:opacity-50"
//             >
//               {isLoggingOut ? 'Logging out...' : 'Log Out'}
//             </button>
            
//             <button
//               onClick={cancelLogout}
//               disabled={isLoggingOut}
//               className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-6 rounded transition-colors duration-200 font-medium"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
        
//         <div className="mt-8 text-center">
//           <Link to="/" className="text-blue-400 hover:text-blue-300">
//             Back to Home
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default LogoutPage;