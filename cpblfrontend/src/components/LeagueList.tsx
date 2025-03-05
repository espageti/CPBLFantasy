import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { Link } from "react-router-dom";
import { FantasyLeague, baseLink } from "../models";

function LeagueList() {
  const [leagues, setLeagues] = useState<FantasyLeague[]>([]);
  
  useEffect(() => {
    axios.get<FantasyLeague[]>(baseLink + "fantasy-leagues/")
      .then((response: AxiosResponse<FantasyLeague[]>) => setLeagues(response.data))
      .catch((error) => console.error(error));
  }, []);
  
  return (
    <div className="min-h-screen min-w-screen bg-gray-900 text-white p-6 grid place-items-center">
      <Link to={`/`} className="text-blue-400 hover:text-blue-300 mb-4 inline-block">← Back to Home</Link>
      <h1 className="text-3xl font-bold text-center mb-6">Fantasy Baseball Leagues</h1>
      <div className="w-full max-w-4xl mx-auto">
        <ul className="space-y-4">
          {leagues.map((league) => (
            <li key={league.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{league.name}</h2>
                <Link 
                  to={`/leagues/${league.id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
                >
                  View League
                </Link>
              </div>
              <p className="text-gray-400">Commissioner: {league.commissioner}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default LeagueList;