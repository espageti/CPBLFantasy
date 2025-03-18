import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { baseLink } from '../models';
import { useAuth } from '../context/AuthContext';

function LeagueCreate() {
  // Get authenticatedFetch from context
  const { user, authenticatedFetch } = useAuth();
  
  // Form state
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [public_, setPublic] = useState(true);
  const [scoringSystem, setScoringSystem] = useState('ROT');
  const [settings, setSettings] = useState({
    draftType: 'snake',
    draftOrder: 'random',
    lineupChanges: 'daily',
    maxTeams: 10
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);
    
    try {
      // Use authenticatedFetch instead of manual fetch
      const response = await authenticatedFetch('api/fantasy-leagues/', {
        method: 'POST',
        body: JSON.stringify({
          name,
          commissioner: user.id,
          start_date: startDate,
          end_date: endDate,
          public: public_,
          scoring_system: scoringSystem,
          settings: JSON.stringify(settings)
        })
      });

      const data = await response.json();
      
      // Redirect to the newly created league
      navigate(`/leagues/${data.id}`);
    } catch (error: any) {
      if (error && typeof error === 'object') {
        setErrors(error);
      } else {
        setErrors({ non_field_errors: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <Link to="/leagues" style={{color: '#696969'}} className="hover:text-blue-300 mb-4 inline-block">← Back to Leagues</Link>
      
      <div className="max-w-2xl mx-auto mt-8">
        <div role="heading" className="text-3xl font-bold mb-8 text-center">Create New League</div>
        
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
          {errors.non_field_errors && (
            <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
              {errors.non_field_errors}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-gray-300 mb-2">League Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full bg-gray-700 text-white rounded px-3 py-2 ${errors.name ? 'border border-red-500' : ''}`}
                required
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="startDate" className="block text-gray-300 mb-2">Start Date</label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full bg-gray-700 text-white rounded px-3 py-2 ${errors.start_date ? 'border border-red-500' : ''}`}
                  required
                />
                {errors.start_date && <p className="text-red-400 text-sm mt-1">{errors.start_date}</p>}
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-gray-300 mb-2">End Date</label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full bg-gray-700 text-white rounded px-3 py-2 ${errors.end_date ? 'border border-red-500' : ''}`}
                  required
                />
                {errors.end_date && <p className="text-red-400 text-sm mt-1">{errors.end_date}</p>}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Scoring System</label>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    id="rot"
                    type="radio"
                    name="scoringSystem"
                    value="ROT"
                    checked={scoringSystem === 'ROT'}
                    onChange={(e) => setScoringSystem(e.target.value)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600"
                  />
                  <label htmlFor="rot" className="ml-2 text-gray-300">Rotisserie</label>
                </div>
              </div>
              {errors.scoring_system && <p className="text-red-400 text-sm mt-1">{errors.scoring_system}</p>}
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">League Settings</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 bg-gray-900 p-4 rounded">
                <div>
                  <label htmlFor="draftType" className="block text-gray-400 mb-1 text-sm">Draft Type</label>
                  <select
                    id="draftType"
                    value={settings.draftType}
                    onChange={(e) => setSettings({...settings, draftType: e.target.value})}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  >
                    <option value="snake">Snake</option>
                    <option value="auction">Auction</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="draftOrder" className="block text-gray-400 mb-1 text-sm">Draft Order</label>
                  <select
                    id="draftOrder"
                    value={settings.draftOrder}
                    onChange={(e) => setSettings({...settings, draftOrder: e.target.value})}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  >
                    <option value="random">Random</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="lineupChanges" className="block text-gray-400 mb-1 text-sm">Lineup Changes</label>
                  <select
                    id="lineupChanges"
                    value={settings.lineupChanges}
                    onChange={(e) => setSettings({...settings, lineupChanges: e.target.value})}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="maxTeams" className="block text-gray-400 mb-1 text-sm">Max Teams</label>
                  <input
                    id="maxTeams"
                    type="number"
                    min="2"
                    max="30"
                    value={settings.maxTeams}
                    onChange={(e) => setSettings({...settings, maxTeams: parseInt(e.target.value)})}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center">
                <input
                  id="isPublic"
                  type="checkbox"
                  checked={public_}
                  onChange={(e) => setPublic(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600"
                />
                <label htmlFor="isPublic" className="ml-2 text-gray-300">Public League (visible to everyone)</label>
              </div>
              {errors.public && <p className="text-red-400 text-sm mt-1">{errors.public}</p>}
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors duration-200"
              >
                {isLoading ? 'Creating...' : 'Create League'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LeagueCreate;