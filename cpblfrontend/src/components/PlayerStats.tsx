import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Player, GameStats, Game, baseLink } from '../models';

// Define an interface for our aggregated batting statistics
interface PlayerBattingStats {
  player: Player;
  games: number;
  atBats: number;
  runs: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbis: number;
  hitByPitches: number;
  strikeouts: number;
  walks: number;
  stolenBases: number;
  sacrificeFlies: number; 
  sacrificeBunts: number;
  plateAppearances: number;
  battingAverage: number;
  onBasePercentage: number;
  sluggingPercentage: number; 
  ops: number;
}

// Define an interface for our aggregated pitching statistics
interface PlayerPitchingStats {
  player: Player;
  games: number;
  inningsPitched: number;
  hits: number;
  runs: number;
  earnedRuns: number;
  walks: number;
  strikeouts: number;
  homeRuns: number;
  battersForced: number;
  pitchCount: number;
  era: number;
  whip: number;
}

// Group by year and player ID
interface BattingStatsMap {
  [year: string]: {
    [playerId: number]: PlayerBattingStats;
  };
}

interface PitchingStatsMap {
  [year: string]: {
    [playerId: number]: PlayerPitchingStats;
  };
}

type StatType = 'batting' | 'pitching';

function PlayerStats() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [games, setGames] = useState<Record<number, Game>>({});
  const [battingStats, setBattingStats] = useState<BattingStatsMap>({});
  const [pitchingStats, setPitchingStats] = useState<PitchingStatsMap>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<StatType>('batting');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all needed data
        const playersResponse = await axios.get<Player[]>(`${baseLink}players/`);
        const gamesResponse = await axios.get<Game[]>(`${baseLink}games/`);
        const statsResponse = await axios.get<GameStats[]>(`${baseLink}game-stats/`);
        
        setPlayers(playersResponse.data);
        
        // Convert games array to a map for easier lookup
        const gamesMap = gamesResponse.data.reduce((acc, game) => {
          acc[game.id] = game;
          return acc;
        }, {} as Record<number, Game>);
        
        setGames(gamesMap);
        setGameStats(statsResponse.data);
        
        // Extract available years from games
        const years = new Set<string>();
        gamesResponse.data.forEach(game => {
          if (game.date) {
            const year = new Date(game.date).getFullYear().toString();
            years.add(year);
          }
        });
        
        const yearsList = Array.from(years).sort((a, b) => b.localeCompare(a));
        setAvailableYears(yearsList);
        
        // Set default year to most recent
        if (yearsList.length > 0) {
          setSelectedYear(yearsList[0]);
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    // Process stats when data is available
    if (players.length > 0 && Object.keys(games).length > 0 && gameStats.length > 0) {
      // Process batting stats
      const aggregatedBatting: BattingStatsMap = {};
      const aggregatedPitching: PitchingStatsMap = {};
      
      // Filter for batting stats only
      const battingStatItems = gameStats.filter(stat => stat.role === "batter");
      
      battingStatItems.forEach(stat => {
        // Skip if we can't determine the year
        const game = games[stat.game];
        if (!game || !game.date) return;
        
        const year = new Date(game.date).getFullYear().toString();
        
        // Initialize year in aggregated stats if not exists
        if (!aggregatedBatting[year]) {
          aggregatedBatting[year] = {};
        }
        
        // Initialize player in that year if not exists
        if (!aggregatedBatting[year][stat.player]) {
          const playerData = players.find(p => p.id === stat.player);
          if (!playerData) return; // Skip if player not found
          
          aggregatedBatting[year][stat.player] = {
            player: playerData,
            games: 0,
            atBats: 0,
            runs: 0,
            hits: 0,
            doubles: 0,
            triples: 0,
            homeRuns: 0,
            rbis: 0,
            hitByPitches: 0,
            strikeouts: 0,
            walks: 0,
            stolenBases: 0,
            sacrificeFlies: 0,  // Initialize new fields
            sacrificeBunts: 0,
            plateAppearances: 0,
            battingAverage: 0,
            onBasePercentage: 0,
            sluggingPercentage: 0,
            ops: 0
          };
        }
        
        // Update player's stats with current game stats using the correct keys
        const playerYearStats = aggregatedBatting[year][stat.player];
        playerYearStats.games++;
        
        // Extract stats using the keys from the example
        const { stats } = stat;
        playerYearStats.atBats += stats["AB"] || 0;
        playerYearStats.runs += stats["R"] || 0;
        playerYearStats.hits += stats["H"] || 0;
        playerYearStats.doubles += stats["2B"] || 0;
        playerYearStats.triples += stats["3B"] || 0;
        playerYearStats.homeRuns += stats["HR"] || 0;
        playerYearStats.rbis += stats["RBI"] || 0;
        playerYearStats.strikeouts += stats["SO"] || 0;
        playerYearStats.walks += stats["BB"] || 0;
        playerYearStats.stolenBases += stats["SB"] || 0;
        playerYearStats.hitByPitches += stats["HBP"] || 0;
        playerYearStats.sacrificeFlies += stats["SF"] || 0;  // Add these lines
        playerYearStats.sacrificeBunts += stats["SAC"] || 0;
      });
      
      // Filter for pitching stats
      const pitchingStatItems = gameStats.filter(stat => stat.role === "pitcher");
      
      pitchingStatItems.forEach(stat => {
        // Skip if we can't determine the year
        const game = games[stat.game];
        if (!game || !game.date) return;
        
        const year = new Date(game.date).getFullYear().toString();
        
        // Initialize year in aggregated stats if not exists
        if (!aggregatedPitching[year]) {
          aggregatedPitching[year] = {};
        }
        
        // Initialize player in that year if not exists
        if (!aggregatedPitching[year][stat.player]) {
          const playerData = players.find(p => p.id === stat.player);
          if (!playerData) return; // Skip if player not found
          
          aggregatedPitching[year][stat.player] = {
            player: playerData,
            games: 0,
            inningsPitched: 0,
            hits: 0,
            runs: 0,
            earnedRuns: 0,
            walks: 0,
            strikeouts: 0,
            homeRuns: 0,
            battersForced: 0,
            pitchCount: 0,
            era: 0,
            whip: 0
          };
        }
        
        // Update pitcher's stats with current game stats
        const pitcherYearStats = aggregatedPitching[year][stat.player];
        pitcherYearStats.games++;
        
        // Extract stats using the keys from the pitcher example
        const { stats } = stat;
        pitcherYearStats.inningsPitched += stats["IP"] || 0;
        pitcherYearStats.hits += stats["H"] || 0;
        pitcherYearStats.runs += stats["R"] || 0;
        pitcherYearStats.earnedRuns += stats["ER"] || 0;
        pitcherYearStats.walks += stats["BB"] || 0;
        pitcherYearStats.strikeouts += stats["SO"] || 0;
        pitcherYearStats.homeRuns += stats["HR"] || 0;
        pitcherYearStats.battersForced += stats["BF"] || 0;
        pitcherYearStats.pitchCount += stats["NP"] || 0;
      });
      
      // Calculate derived batting statistics
      Object.keys(aggregatedBatting).forEach(year => {
        Object.keys(aggregatedBatting[year]).forEach(playerId => {
          const stats = aggregatedBatting[year][Number(playerId)];
          
          // Batting average = hits / at-bats
          stats.battingAverage = stats.atBats > 0 
            ? Number((stats.hits / stats.atBats).toFixed(3)) 
            : 0;
            
          // Calculate plate appearances
          stats.plateAppearances = stats.atBats + stats.walks + 
            stats.hitByPitches + stats.sacrificeFlies + stats.sacrificeBunts;

          // On-base percentage = (hits + walks + HBP) / (at-bats + walks + HBP + SF)
          // Note: SAC bunts are not included in OBP calculation per baseball rules
          const obpDenominator = stats.atBats + stats.walks + stats.hitByPitches + stats.sacrificeFlies;
          stats.onBasePercentage = obpDenominator > 0 
            ? Number(((stats.hits + stats.walks + stats.hitByPitches) / obpDenominator).toFixed(3)) 
            : 0;
            
          // Slugging percentage = (1B + 2*2B + 3*3B + 4*HR) / AB
          const singles = stats.hits - stats.doubles - stats.triples - stats.homeRuns;
          const totalBases = singles + (2 * stats.doubles) + (3 * stats.triples) + (4 * stats.homeRuns);
          stats.sluggingPercentage = stats.atBats > 0 
            ? Number((totalBases / stats.atBats).toFixed(3)) 
            : 0;
            
          // OPS = OBP + SLG
          stats.ops = Number((stats.onBasePercentage + stats.sluggingPercentage).toFixed(3));
        });
      });
      
      // Calculate derived pitching statistics
      Object.keys(aggregatedPitching).forEach(year => {
        Object.keys(aggregatedPitching[year]).forEach(playerId => {
          const stats = aggregatedPitching[year][Number(playerId)];
          
          // ERA = (Earned Runs / Innings Pitched) * 9
          stats.era = stats.inningsPitched > 0 
            ? Number(((stats.earnedRuns / stats.inningsPitched) * 9).toFixed(2))
            : 0;
            
          // WHIP = (Walks + Hits) / Innings Pitched
          stats.whip = stats.inningsPitched > 0 
            ? Number(((stats.walks + stats.hits) / stats.inningsPitched).toFixed(2))
            : 0;
        });
      });
      
      setBattingStats(aggregatedBatting);
      setPitchingStats(aggregatedPitching);
    }
  }, [players, games, gameStats]);
  
  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-6 grid place-items-center">Loading...</div>;
  
  // Get stats for selected year based on active tab
const playerBattingStatsForYear = selectedYear && battingStats[selectedYear] 
    ? Object.values(battingStats[selectedYear])
            .sort((a, b) => b.battingAverage - a.battingAverage)
            .filter(stats => (stats.plateAppearances / 120) >= 3.1) // Use plateAppearances instead
    : [];
    
  const playerPitchingStatsForYear = selectedYear && pitchingStats[selectedYear] 
    ? Object.values(pitchingStats[selectedYear])
        .sort((a, b) => a.era - b.era)  // Sort by ERA, lowest first
        .filter(stats => (stats.inningsPitched/120) >= 1.0) // Only show pitchers with minimum innings
    : [];
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">← Back to Home</Link>
        <h1 className="text-3xl font-bold mb-6">Player Statistics</h1>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <label htmlFor="yearSelect" className="mr-2">Select Year:</label>
            <select 
              id="yearSelect"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-2"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="flex">
            <button 
              className={`px-4 py-2 rounded-l-lg ${activeTab === 'batting' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              onClick={() => setActiveTab('batting')}
            >
              Batting
            </button>
            <button 
              className={`px-4 py-2 rounded-r-lg ${activeTab === 'pitching' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              onClick={() => setActiveTab('pitching')}
            >
              Pitching
            </button>
          </div>
        </div>
        
        {/* Batting Stats Table */}
        {activeTab === 'batting' && (
          <div className="overflow-hidden rounded-lg border border-gray-700">
            <div className="overflow-y-auto max-h-[70vh]">
              <table className="min-w-full bg-gray-800">
                <thead className="bg-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left">Player</th>
                    <th className="px-4 py-3 text-center">G</th>
                    <th className="px-4 py-3 text-center">PA</th> {/* Add PA column */}
                    <th className="px-4 py-3 text-center">AB</th>
                    <th className="px-4 py-3 text-center">R</th>
                    <th className="px-4 py-3 text-center">H</th>
                    <th className="px-4 py-3 text-center">2B</th>
                    <th className="px-4 py-3 text-center">3B</th>
                    <th className="px-4 py-3 text-center">HR</th>
                    <th className="px-4 py-3 text-center">RBI</th>
                    <th className="px-4 py-3 text-center">SB</th>
                    <th className="px-4 py-3 text-center">BB</th>
                    <th className="px-4 py-3 text-center">HBP</th>
                    <th className="px-4 py-3 text-center">SF</th> {/* Add SF column */}
                    <th className="px-4 py-3 text-center">SAC</th> {/* Add SAC column */}
                    <th className="px-4 py-3 text-center">SO</th>
                    <th className="px-4 py-3 text-center">AVG</th>
                    <th className="px-4 py-3 text-center">OBP</th>
                    <th className="px-4 py-3 text-center">SLG</th>
                    <th className="px-4 py-3 text-center">OPS</th>
                  </tr>
                </thead>
                <tbody>
                  {playerBattingStatsForYear.length > 0 ? (
                    playerBattingStatsForYear.map(stats => (
                      <tr key={stats.player.id} className="border-t border-gray-700 hover:bg-gray-700">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {stats.player.profile_image && (
                              <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                                <img 
                                  src={stats.player.profile_image}
                                  alt={stats.player.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            {stats.player.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">{stats.games}</td>
                        <td className="px-4 py-3 text-center">{stats.plateAppearances}</td> {/* Add PA value */}
                        <td className="px-4 py-3 text-center">{stats.atBats}</td>
                        <td className="px-4 py-3 text-center">{stats.runs}</td>
                        <td className="px-4 py-3 text-center">{stats.hits}</td>
                        <td className="px-4 py-3 text-center">{stats.doubles}</td>
                        <td className="px-4 py-3 text-center">{stats.triples}</td>
                        <td className="px-4 py-3 text-center">{stats.homeRuns}</td>
                        <td className="px-4 py-3 text-center">{stats.rbis}</td>
                        <td className="px-4 py-3 text-center">{stats.stolenBases}</td>
                        <td className="px-4 py-3 text-center">{stats.walks}</td>
                        <td className="px-4 py-3 text-center">{stats.hitByPitches}</td> {/* Add this cell */}
                        <td className="px-4 py-3 text-center">{stats.sacrificeFlies}</td> {/* Add SF value */}
                        <td className="px-4 py-3 text-center">{stats.sacrificeBunts}</td> {/* Add SAC value */}
                        <td className="px-4 py-3 text-center">{stats.strikeouts}</td>
                        <td className="px-4 py-3 text-center font-medium">{stats.battingAverage.toFixed(3).replace(/^0+/, '')}</td>
                        <td className="px-4 py-3 text-center">{stats.onBasePercentage.toFixed(3).replace(/^0+/, '')}</td>
                        <td className="px-4 py-3 text-center">{stats.sluggingPercentage.toFixed(3).replace(/^0+/, '')}</td>
                        <td className="px-4 py-3 text-center font-medium">{stats.ops.toFixed(3).replace(/^0+/, '')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={20} className="px-4 py-3 text-center">No batting statistics available for this year.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Pitching Stats Table */}
        {activeTab === 'pitching' && (
          <div className="overflow-hidden rounded-lg border border-gray-700">
            <div className="overflow-y-auto max-h-[70vh]">
              <table className="min-w-full bg-gray-800">
                <thead className="bg-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left">Player</th>
                    <th className="px-4 py-3 text-center">G</th>
                    <th className="px-4 py-3 text-center">IP</th>
                    <th className="px-4 py-3 text-center">H</th>
                    <th className="px-4 py-3 text-center">R</th>
                    <th className="px-4 py-3 text-center">ER</th>
                    <th className="px-4 py-3 text-center">BB</th>
                    <th className="px-4 py-3 text-center">SO</th>
                    <th className="px-4 py-3 text-center">HR</th>
                    <th className="px-4 py-3 text-center">BF</th>
                    <th className="px-4 py-3 text-center">NP</th>
                    <th className="px-4 py-3 text-center">ERA</th>
                    <th className="px-4 py-3 text-center">WHIP</th>
                  </tr>
                </thead>
                <tbody>
                  {playerPitchingStatsForYear.length > 0 ? (
                    playerPitchingStatsForYear.map(stats => (
                      <tr key={stats.player.id} className="border-t border-gray-700 hover:bg-gray-700">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            {stats.player.profile_image && (
                              <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                                <img 
                                  src={stats.player.profile_image}
                                  alt={stats.player.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            {stats.player.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">{stats.games}</td>
                        <td className="px-4 py-3 text-center">{Math.floor(stats.inningsPitched) + '.' + Math.round((stats.inningsPitched % 1) * 3)}</td>
                        <td className="px-4 py-3 text-center">{stats.hits}</td>
                        <td className="px-4 py-3 text-center">{stats.runs}</td>
                        <td className="px-4 py-3 text-center">{stats.earnedRuns}</td>
                        <td className="px-4 py-3 text-center">{stats.walks}</td>
                        <td className="px-4 py-3 text-center">{stats.strikeouts}</td>
                        <td className="px-4 py-3 text-center">{stats.homeRuns}</td>
                        <td className="px-4 py-3 text-center">{stats.battersForced}</td>
                        <td className="px-4 py-3 text-center">{stats.pitchCount}</td>
                        <td className="px-4 py-3 text-center font-medium">{stats.era.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center font-medium">{stats.whip.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={13} className="px-4 py-3 text-center">No pitching statistics available for this year.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerStats;