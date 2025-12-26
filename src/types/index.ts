export interface FIFAStats {
  ritmo: number; // Pace (0-100)
  tiro: number; // Shooting (0-100)
  dribbling: number; // Dribbling (0-100)
  fisico: number; // Physical (0-100)
  defensa: number; // Defense (0-100)
  pase: number; // Passing (0-100)
}

export interface Player {
  id: string;
  name: string;
  birthday: string | null;
  bongs: number;
  preferredFoot: 'left' | 'right' | 'both';
  fifaStats: FIFAStats;
  profileImage: string | null;
}

export interface PlayerStats {
  goals: number;
  assists: number;
  shotsOnTarget: number;
  shotsOffTarget: number;
  passesCompleted: number;
  passesMissed: number;
  interceptions: number;
  tackles: number;
  fouls: number;
  dribbles: number;
  // Goalkeeper stats
  saves: number;
  goalsConceded: number;
}

export type StatKey = keyof PlayerStats;

export interface MatchEvent {
  id: string;
  timestamp: number;
  playerId: string;
  stat: StatKey;
  value: 1 | -1; // +1 for add, -1 for undo
}

export interface PlayerMatchStats {
  playerId: string;
  stats: PlayerStats;
  isGoalkeeper: boolean;
}

export interface Match {
  id: string;
  date: string;
  time: string;
  opponent: string;
  opponentScore: number | null;
  fieldName: string;
  fieldImage: string | null;
  netMatchTime: number | null; // Tiempo neto de partido in minutes
  playerStats: PlayerMatchStats[];
  events: MatchEvent[];
  currentGoalkeeperId: string | null;
}

export interface MatchRating {
  matchId: string;
  playerId: string;
  rating: number; // 0-100 scale
  notes?: string;
}

export interface MVPRecord {
  matchId: string;
  playerId: string;
  date: string;
  opponent: string;
  rating: number;
}

export interface AppState {
  players: Player[];
  matches: Match[];
  currentMatchId: string | null;
  matchRatings: MatchRating[];
  mvpRecords: MVPRecord[];
}

export const STAT_CONFIG: Record<StatKey, { label: string; shortLabel: string; key: string; isGkStat: boolean }> = {
  goals: { label: 'Goal', shortLabel: 'GOL', key: 'G', isGkStat: false },
  assists: { label: 'Assist', shortLabel: 'AST', key: 'A', isGkStat: false },
  shotsOnTarget: { label: 'Shot on Target', shortLabel: 'SOT', key: 'S', isGkStat: false },
  shotsOffTarget: { label: 'Shot off Target', shortLabel: 'MIS', key: 'X', isGkStat: false },
  passesCompleted: { label: 'Pass Completed', shortLabel: 'PAS', key: 'P', isGkStat: false },
  passesMissed: { label: 'Pass Missed', shortLabel: 'M.P', key: 'M', isGkStat: false },
  interceptions: { label: 'Interception', shortLabel: 'INT', key: 'I', isGkStat: false },
  tackles: { label: 'Tackle', shortLabel: 'TCK', key: 'T', isGkStat: false },
  fouls: { label: 'Foul', shortLabel: 'FOU', key: 'F', isGkStat: false },
  dribbles: { label: 'Dribble', shortLabel: 'DRB', key: 'D', isGkStat: false },
  saves: { label: 'Save', shortLabel: 'SAV', key: 'V', isGkStat: true },
  goalsConceded: { label: 'Goal Conceded', shortLabel: 'CON', key: 'C', isGkStat: true },
};

export const DEFAULT_FIFA_STATS: FIFAStats = {
  ritmo: 50,
  tiro: 50,
  dribbling: 50,
  fisico: 50,
  defensa: 50,
  pase: 50,
};

export const DEFAULT_PLAYERS: Player[] = [
  { 
    id: '1', 
    name: 'Tonga',
    birthday: null,
    bongs: 0,
    preferredFoot: 'right',
    fifaStats: { ...DEFAULT_FIFA_STATS },
    profileImage: null,
  },
  { 
    id: '2', 
    name: 'Bul',
    birthday: null,
    bongs: 0,
    preferredFoot: 'right',
    fifaStats: { ...DEFAULT_FIFA_STATS },
    profileImage: null,
  },
  { 
    id: '3', 
    name: 'Pinky',
    birthday: null,
    bongs: 0,
    preferredFoot: 'right',
    fifaStats: { ...DEFAULT_FIFA_STATS },
    profileImage: null,
  },
  { 
    id: '4', 
    name: 'Was',
    birthday: null,
    bongs: 0,
    preferredFoot: 'right',
    fifaStats: { ...DEFAULT_FIFA_STATS },
    profileImage: null,
  },
  { 
    id: '5', 
    name: 'Wai',
    birthday: null,
    bongs: 0,
    preferredFoot: 'right',
    fifaStats: { ...DEFAULT_FIFA_STATS },
    profileImage: null,
  },
];

export const EMPTY_STATS: PlayerStats = {
  goals: 0,
  assists: 0,
  shotsOnTarget: 0,
  shotsOffTarget: 0,
  passesCompleted: 0,
  passesMissed: 0,
  interceptions: 0,
  tackles: 0,
  fouls: 0,
  dribbles: 0,
  saves: 0,
  goalsConceded: 0,
};
