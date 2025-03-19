export interface FantasyTeam {
  id: number;
  name: string;
  owner: number;
  league: number;
}

export interface FantasyRoster {
  id: number;
  player: number;
  start_date: string;
  end_date: string | null;
  position: string | null;
}

export interface Player {
  id: number;
  name: string;
  profile_image?: string;
}

export interface User {
  id: number;
  username: string;
  profile_image?: string;
}

export interface FantasyLeague {
  id: number;
  name: string;
  commissioner: number;  //All foreign keys are numbers
  start_date: string;    // Date stored as ISO string "YYYY-MM-DD"
  end_date: string;      // Date stored as ISO string "YYYY-MM-DD"
  public: boolean;       
  scoring_system: 'ROT'; // Currently only 'ROT' (Rotisserie) supported
  settings: {
    draftType?: 'snake' | 'auction';
    draftOrder?: 'manual' | 'random' | 'reverse_standings';
    lineupChanges?: 'daily' | 'weekly';
    maxTeams?: number;
    // Add other settings as needed
  };
}

export interface GameStats {
  id: number;
  game: number;
  player: number;
  role: string;
  position: string;
  stats: { [key: string]: number };
}

export interface Game {
  id: number;
  game_number: number;
  date: Date;
  home_team: number;
  away_team: number;
}
export const baseLink = "http://localhost:8000/";
