import React from 'react';
import { Player, FantasyRoster } from '../models';

interface PlayerCardProps {
  player: Player;
  roster: FantasyRoster;
}

function PlayerCard({ player, roster }: PlayerCardProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
      <div className="flex-shrink-0 w-20 h-20 mr-10 relative">
        <div className="w-full h-full bg-gray-700 rounded-full overflow-hidden">
          {player.profile_image ? (
            <img 
              src={player.profile_image} 
              alt={player.name}   
              className="w-fit h-fit object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-xl">{player.name.charAt(0)}</span>
            </div>
          )}
        </div>
      </div> 
      <div className="w-3"></div>
      <div className="flex-grow">
        <div className="text-xl font-semibold">{player.name}</div>
        {roster?.position && (
          <p className="text-blue-400 font-medium mt-1">{roster.position}</p>
        )}
        {roster && (
          <p className="text-gray-400 text-sm mt-2">
            {`${roster.start_date} - ${roster.end_date || "Present"}`}
          </p>
        )}
      </div>
    </div>
  );
}

export default PlayerCard;