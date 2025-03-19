import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { baseLink } from '../models';
import { useAuth } from '../context/AuthContext';

function TeamCreate() {
  // Get league ID from URL params
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const { user, authenticatedFetch } = useAuth();
  
  // Form state
  const [teamName, setTeamName] = useState('');
  
  // UI state
  const [league, setLeague] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Fetch league details
  useEffect(() => {
    const fetchLeague = async () => {
      try {
        const response = await fetch(`${baseLink}api/fantasy-leagues/${leagueId}/`);
        if (!response.ok) {
          throw new Error('League not found');
        }
        const data = await response.json();
        setLeague(data);
      } catch (error) {
        console.error('Error fetching league:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeague();
  }, [leagueId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSaving(true);
    
    try {
      // Create team using authenticated fetch
      const response = await authenticatedFetch('api/fantasy-teams/', {
        method: 'POST',
        body: JSON.stringify({
          name: teamName,
          league: parseInt(leagueId as string),
          owner: user?.id
        })
      });
      
      const data = await response.json();
      
      // Navigate to the team detail page
      navigate(`/teams/${data.id}`);
    } catch (error: any) {
      if (error && typeof error === 'object') {
        setErrors(error);
      } else {
        setErrors({ non_field_errors: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 text-white p-6 grid place-items-center">Loading...</div>;
  }
  
  if (!league) {
    return <div className="min-h-screen bg-gray-900 text-white p-6 grid place-items-center">League not found</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <Link to={`/leagues/${leagueId}`} style={{color: '#696969'}} className="hover:text-blue-300 mb-4 inline-block">← Back to League</Link>
      
      <div className="max-w-2xl mx-auto mt-8">
        <div role="heading" className="text-3xl font-bold mb-8 text-center">Join {league.name}</div>
        
        <div className="bg-gray-800 rounded-lg p-8 shadow-lg">
          {errors.non_field_errors && (
            <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
              {errors.non_field_errors}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="teamName" className="block text-gray-300 mb-2">Team Name</label>
              <input
                id="teamName"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className={`w-full bg-gray-700 text-white rounded px-3 py-2 ${errors.name ? 'border border-red-500' : ''}`}
                required
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div className="mt-8">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
              >
                {isSaving ? 'Creating Team...' : 'Join League'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TeamCreate;