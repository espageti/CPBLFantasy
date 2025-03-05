import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FantasyTeam, FantasyRoster, Player, baseLink } from "../models";
import PlayerCard from "./PlayerCard";

function TeamDetail() {
  const { teamId } = useParams<{teamId: string}>();
  const [team, setTeam] = useState<FantasyTeam | null>(null);
  const [rosters, setRosters] = useState<FantasyRoster[]>([]);
  const [players, setPlayers] = useState<Record<number, Player>>({});
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const teamResponse = await axios.get<FantasyTeam>(`${baseLink}fantasy-teams/${teamId}/`);
        setTeam(teamResponse.data);
        
        const rosterResponse = await axios.get<FantasyRoster[]>(`${baseLink}fantasy-rosters/?fantasy_team_id=${teamId}`);
        setRosters(rosterResponse.data);
        
        // Fetch player details for each roster entry
        for (const roster of rosterResponse.data) {
          const playerResponse = await axios.get<Player>(`${baseLink}players/${roster.player}/`);
          setPlayers(prev => ({ ...prev, [roster.player]: playerResponse.data }));
        }
      } catch (error) {
        console.error("Error fetching team details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamDetails();
  }, [teamId]);
  
  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-6 grid place-items-center">Loading...</div>;
  
  if (!team) return <div className="min-h-screen bg-gray-900 text-white p-6 grid place-items-center">Team not found</div>;
  
  return (
    <div className="min-h-screen min-w-screen bg-gray-900 text-white p-6">
      <Link to={`/leagues/${team.league}`} className="text-blue-400 hover:text-blue-300 mb-4 inline-block">← Back to League</Link>
      <h1 className="text-3xl font-bold mb-6">{team.name}</h1>
      <p className="mb-6">Owner: {team.owner}</p>
      
      <h2 className="text-2xl font-semibold mb-4">Roster</h2>
      <div className="w-full max-w-4xl">
        <ul className="space-y-8">
          {rosters.length > 0 ? (
            rosters.map((roster) => (
              <li key={roster.id}>
                {players[roster.player] ? (
                  <PlayerCard 
                    player={players[roster.player]} 
                    roster={roster}
                  />
                ) : (
                  <div className="bg-gray-800 p-3 rounded-lg">Loading player data...</div>
                )}
              </li>
            ))
          ) : (
            <p className="text-gray-400">No players on roster</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default TeamDetail;