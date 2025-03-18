import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import { Link } from "react-router-dom";
import { FantasyLeague, baseLink } from "../models";

function LeagueList() {
  const [leagues, setLeagues] = useState<FantasyLeague[]>([]);
  
  
  useEffect(() => {
    axios.get<FantasyLeague[]>(baseLink + "api/fantasy-leagues/")
      .then((response: AxiosResponse<FantasyLeague[]>) => setLeagues(response.data))
      .catch((error) => console.error(error));
  }, []);
  
  return (
    <div className="min-h-screen min-w-screen bg-gray-900 gap-6">
      <Link to="/" style={{color: '#696969'}} className="hover:text-blue-300 mb-4 inline-block">← Back to home</Link>
      <div className=" text-white p-6 flex-col place-items-center">
        <div className="flex justify-between items-center mb-6">
          <div role="heading" className="text-3xl font-bold">Fantasy Baseball Leagues</div>
          <Link 
            to="/create-league" 
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors duration-200"
          >
            Create League
          </Link>
        </div>
        <div className="h-10"></div>
        <div className="w-full max-w-4xl mx-auto">
          <ul className="space-y-4">
            {leagues.map((league) => (
              <li key={league.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <div className="text-xl font-semibold">{league.name}</div>
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
    </div>
  );
}

export default LeagueList;