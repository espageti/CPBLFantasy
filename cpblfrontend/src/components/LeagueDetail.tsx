import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FantasyLeague, FantasyTeam, User, baseLink } from "../models";

function LeagueDetail() {
  const { leagueId } = useParams<{leagueId: string}>();
  const [league, setLeague] = useState<FantasyLeague | null>(null);
  const [teams, setTeams] = useState<FantasyTeam[]>([]);
  const [users, setUsers] = useState<{[key: number]: User}>({});
  const [loading, setLoading] = useState<boolean>(true);
  
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
      <div className=" text-white p-6 flex-col place-items-center">
          <div className="text-3xl font-bold mb-6">{league.name}</div>
          <p className="mb-6">Commissioner: {users[league.commissioner]?.username || "Unknown"}</p>
          
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
            {teams.length === 0 && <p className="text-gray-400">No teams in this league yet.</p>}
          </div>
      </div>
    </div>
  );
}

export default LeagueDetail;