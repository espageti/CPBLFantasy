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
        const teamResponse = await axios.get<FantasyTeam>(`${baseLink}api/fantasy-teams/${teamId}/`);
        setTeam(teamResponse.data);
        
        const rosterResponse = await axios.get<FantasyRoster[]>(`${baseLink}api/fantasy-rosters/?fantasy_team_id=${teamId}`);
        setRosters(rosterResponse.data);
        
        // Fetch player details for each roster entry
        for (const roster of rosterResponse.data) {
          const playerResponse = await axios.get<Player>(`${baseLink}api/players/${roster.player}/`);
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
      <div role="heading" className="text-3xl font-bold mb-6">{team.name}</div>
      <p className="mb-6">Owner: {team.owner}</p>
      
      <div className="text-2xl font-semibold mb-4">Roster</div>
      <div className="w-full max-w-4xl">
        <div className="flex flex-col gap-2">
          {rosters.map((roster) => (
            <div key={roster.id}>
              <PlayerCard player={players[roster.player]} roster={roster} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeamDetail;