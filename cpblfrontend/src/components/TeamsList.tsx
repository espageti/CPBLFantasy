import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { FantasyTeam, FantasyRoster, Player, baseLink } from "../models";

function TeamsList() {
  const [teams, setTeams] = useState<FantasyTeam[]>([]);
  const [rosters, setRosters] = useState<Record<number, FantasyRoster[]>>({});
  const [players, setPlayers] = useState<Record<number, Player>>({});

  useEffect(() => {
    axios.get<FantasyTeam[]>(baseLink + "fantasy-teams/")
      .then((response: AxiosResponse<FantasyTeam[]>) => setTeams(response.data))
      .catch((error) => console.error(error));
  }, []);

  const fetchPlayer = async (playerId: number) => {
    if (!players[playerId]) {
      try {
        const response = await axios.get<Player>(baseLink + `players/${playerId}/`);
        setPlayers(prev => ({ ...prev, [playerId]: response.data }));
      } catch (error) {
        console.error("Error fetching player:", error);
      }
    }
  };

  const fetchRosters = async (teamId: number) => {
    if (!rosters[teamId]) {
      try {
        const response = await axios.get<FantasyRoster[]>(baseLink + `fantasy-rosters/?fantasy_team_id=${teamId}`);
        setRosters(prev => ({ ...prev, [teamId]: response.data }));
        response.data.forEach(roster => fetchPlayer(roster.player));
      } catch (error) {
        console.error("Error fetching rosters:", error);
      }
    }
  };

  return (
    <div className="min-h-screen min-w-screen bg-gray-900 text-white p-6 grid place-items-center">
      <h1 className="text-3xl font-bold text-center mb-6">Fantasy Baseball Teams</h1>
      <div className="w-full max-w-4xl mx-auto">
        <ul className="space-y-4">
          {teams.map((team) => (
            <li key={team.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{team.name}</h2>
                <div className="space-x-2">
                  <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
                    onClick={() => fetchRosters(team.id)}
                  >
                    Show Rosters
                  </button>
                </div>
              </div>
              {rosters[team.id] && (
                <ul className="mt-3 space-y-2">
                  {rosters[team.id].length > 0 ? (
                    rosters[team.id].map((roster) => (
                      <li key={roster.id} className="bg-gray-700 p-2 rounded">
                        {players[roster.player]
                          ? `${players[roster.player].name} (${roster.start_date} - ${roster.end_date || "Present"})`
                          : "Loading..."}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400">No players on roster</li>
                  )}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TeamsList;