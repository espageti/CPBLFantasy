import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FantasyLeague, FantasyTeam, User, baseLink } from "../models";
import { useAuth } from "../context/AuthContext";

function LeagueDetail() {
  const { leagueId } = useParams<{leagueId: string}>();
  const [league, setLeague] = useState<FantasyLeague | null>(null);
  const [teams, setTeams] = useState<FantasyTeam[]>([]);
  const [users, setUsers] = useState<{[key: number]: User}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Check if current user already has a team in this league
  const userHasTeam = teams.some(team => team.owner === user?.id);
  
  // Check if league is full
  const isLeagueFull = league?.settings?.maxTeams && teams.length >= league.settings.maxTeams;
  
  // Add join league handler
  const handleJoinLeague = () => {
    navigate(`/create-team/${leagueId}`);
  };
  
  useEffect(() => {
    const fetchLeague = async () => {
        try {
            const leagueResponse = await axios.get<FantasyLeague>(`${baseLink}api/fantasy-leagues/${leagueId}/`);
            setLeague(leagueResponse.data);
            
            const teamsResponse = await axios.get<FantasyTeam[]>(`${baseLink}api/fantasy-teams/?league=${leagueId}`);
            setTeams(teamsResponse.data);

            const userIds = new Set<number>();
            
            // Add commissioner ID
            if (leagueResponse.data.commissioner) {
                userIds.add(leagueResponse.data.commissioner);
            }
            
            // Add team owner IDs
            teamsResponse.data.forEach(team => {
                if (team.owner) {
                    userIds.add(team.owner);
                }
            });

            // Only fetch data for these specific users
            if (userIds.size > 0) {
                const userIdsParam = Array.from(userIds).join(',');
                const usersResponse = await axios.get<User[]>(`${baseLink}api/users/?ids=${userIdsParam}`);
                
                // Convert users array to a map/dictionary for easier lookup
                const usersMap = usersResponse.data.reduce((acc, user) => {
                    acc[user.id] = user;
                    return acc;
                }, {} as {[key: number]: User});
                
                setUsers(usersMap);
            }
        } catch (error) {
            console.error("Error fetching league details:", error);
        } finally {
            setLoading(false);
        }
    };
    
    fetchLeague();
    
}, [leagueId]);
  
  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-6 grid place-items-center">Loading...</div>;
  
  if (!league) return <div className="min-h-screen bg-gray-900 text-white p-6 grid place-items-center">League not found</div>;
  
  return (
    <div className="min-h-screen min-w-screen bg-gray-900">
      <Link to="/leagues" style={{color: '#696969'}} className="hover:text-blue-300 mb-4 inline-block">← Back to Leagues</Link>
      <div className="text-white p-6 flex-col place-items-center">
          <div className="flex justify-between items-center mb-6">
            <div className="text-3xl font-bold">{league.name}</div>
            
            {/* Join League Button - only show if user is logged in, doesn't have a team, and league isn't full */}
            {isAuthenticated && !userHasTeam && !isLeagueFull && (
              <button
                onClick={handleJoinLeague}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors duration-200"
              >
                Join League
              </button>
            )}
            
            {/* Show message if league is full */}
            {isAuthenticated && !userHasTeam && isLeagueFull && (
              <div className="text-yellow-500">League is full</div>
            )}
          </div>
          
          <p className="mb-6">Commissioner: {users[league.commissioner]?.username || "Unknown"}</p>
          
          {/* League settings/info */}
          <div className="mb-8 bg-gray-800 p-4 rounded-lg">
            <p>Start Date: {new Date(league.start_date).toLocaleDateString()}</p>
            <p>End Date: {new Date(league.end_date).toLocaleDateString()}</p>
            <p>Scoring: {league.scoring_system === 'ROT' ? 'Rotisserie' : league.scoring_system}</p>
            <p>Teams: {teams.length}{league.settings?.maxTeams ? ` / ${league.settings.maxTeams}` : ''}</p>
          </div>
          
          <div className="text-2xl font-semibold mb-4">Teams</div>
          <div className="w-full max-w-4xl">
            <ul className="space-y-4">
              {teams.map((team) => (
                <li key={team.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                  <div className="text-xl font-semibold">{team.name}</div>
                  <p className="text-gray-400">Owner: {users[team.owner]?.username || "Unknown"}</p>
                  <Link 
                    to={`/teams/${team.id}`}
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg inline-block"
                  >
                    View Team
                  </Link>
                </li>
              ))}
            </ul>
            {teams.length === 0 && <p className="text-gray-400">No teams in this league yet. Be the first to join!</p>}
          </div>
      </div>
    </div>
  );
}

export default LeagueDetail;