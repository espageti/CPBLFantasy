import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white flex flex-col items-center justify-center p-6">

        <div role="heading" className="text-4xl font-bold flex items-center">
          <span className="text-blue-400">CPBL</span> Fantasy Baseball
        </div>
        
        <p className="text-xl text-gray-300 mb-8">
        Manage your Chinese Professional Baseball League fantasy teams and leagues
      </p>
      
      <div className="flex flex-col sm:flex-row gap-6 justify-center">
        <Link 
          to="/leagues" 
          className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-lg text-xl font-medium transition-colors duration-200 shadow-lg"
        >
          View Leagues
        </Link>
        
        <Link 
          to="/teams" 
          className="bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-lg text-xl font-medium transition-colors duration-200 shadow-lg"
        >
          View Teams
        </Link>
        
        <Link 
          to="/player-stats" 
          className="bg-green-700 hover:bg-green-600 px-8 py-4 rounded-lg text-xl font-medium transition-colors duration-200 shadow-lg"
        >
          Player Statistics
        </Link>
      </div>
    </div>
  );
}

export default HomePage;