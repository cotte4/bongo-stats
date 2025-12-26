import { supabase } from '../lib/supabase';
import type { Player, Match, MatchRating, MVPRecord, FIFAStats, PlayerMatchStats, MatchEvent } from '../types';
import { DEFAULT_FIFA_STATS } from '../types';

// Database row types (snake_case from Supabase)
interface PlayerRow {
  id: string;
  name: string;
  birthday: string | null;
  bongs: number;
  preferred_foot: string;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
  profile_image: string | null;
}

interface MatchRow {
  id: string;
  date: string;
  time: string | null;
  opponent: string;
  opponent_score: number | null;
  field_name: string | null;
  field_image: string | null;
  net_match_time: number | null;
  stats: Record<string, PlayerMatchStats> | null;
  events: MatchEvent[] | null;
  current_goalkeeper_id: string | null;
}

interface MatchRatingRow {
  id: string;
  match_id: string;
  player_id: string;
  rating: number | null;
  notes: string | null;
}

interface MVPRecordRow {
  id: string;
  match_id: string;
  player_id: string;
  date: string;
  opponent: string;
  rating: number | null;
}

// Transform functions
function playerRowToPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    name: row.name,
    birthday: row.birthday,
    bongs: row.bongs,
    preferredFoot: row.preferred_foot as 'left' | 'right' | 'both',
    fifaStats: {
      ritmo: row.pace,
      tiro: row.shooting,
      pase: row.passing,
      dribbling: row.dribbling,
      defensa: row.defense,
      fisico: row.physical,
    },
    profileImage: row.profile_image,
  };
}

function playerToRow(player: Player): Omit<PlayerRow, 'id'> & { id?: string } {
  return {
    id: player.id,
    name: player.name,
    birthday: player.birthday,
    bongs: player.bongs,
    preferred_foot: player.preferredFoot,
    pace: player.fifaStats.ritmo,
    shooting: player.fifaStats.tiro,
    passing: player.fifaStats.pase,
    dribbling: player.fifaStats.dribbling,
    defense: player.fifaStats.defensa,
    physical: player.fifaStats.fisico,
    profile_image: player.profileImage,
  };
}

function matchRowToMatch(row: MatchRow, playerIds: string[]): Match {
  // Convert stats from object to array format
  const playerStats: PlayerMatchStats[] = playerIds.map(playerId => {
    const statsObj = row.stats?.[playerId];
    if (statsObj) {
      return statsObj;
    }
    // Default empty stats for this player
    return {
      playerId,
      stats: {
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
      },
      isGoalkeeper: row.current_goalkeeper_id === playerId,
    };
  });

  return {
    id: row.id,
    date: row.date,
    time: row.time || '18:00',
    opponent: row.opponent,
    opponentScore: row.opponent_score,
    fieldName: row.field_name || '',
    fieldImage: row.field_image,
    netMatchTime: row.net_match_time,
    playerStats,
    events: row.events || [],
    currentGoalkeeperId: row.current_goalkeeper_id,
  };
}

function matchToRow(match: Match): Omit<MatchRow, 'id'> & { id?: string } {
  // Convert playerStats array to object keyed by playerId
  const stats: Record<string, PlayerMatchStats> = {};
  match.playerStats.forEach(ps => {
    stats[ps.playerId] = ps;
  });

  return {
    id: match.id,
    date: match.date,
    time: match.time,
    opponent: match.opponent,
    opponent_score: match.opponentScore,
    field_name: match.fieldName,
    field_image: match.fieldImage,
    net_match_time: match.netMatchTime,
    stats,
    events: match.events,
    current_goalkeeper_id: match.currentGoalkeeperId,
  };
}

// PLAYERS
export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name');

  if (error) throw error;
  return (data || []).map(playerRowToPlayer);
}

export async function createPlayer(player: Player): Promise<Player> {
  const row = playerToRow(player);
  const { data, error } = await supabase
    .from('players')
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return playerRowToPlayer(data);
}

export async function updatePlayer(player: Player): Promise<Player> {
  const row = playerToRow(player);
  const { data, error } = await supabase
    .from('players')
    .update(row)
    .eq('id', player.id)
    .select()
    .single();

  if (error) throw error;
  return playerRowToPlayer(data);
}

export async function deletePlayer(playerId: string): Promise<void> {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', playerId);

  if (error) throw error;
}

// MATCHES
export async function getMatches(playerIds: string[]): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return (data || []).map(row => matchRowToMatch(row, playerIds));
}

export async function createMatch(match: Match): Promise<Match> {
  const row = matchToRow(match);
  const { data, error } = await supabase
    .from('matches')
    .insert(row)
    .select()
    .single();

  if (error) throw error;

  const playerIds = match.playerStats.map(ps => ps.playerId);
  return matchRowToMatch(data, playerIds);
}

export async function updateMatch(match: Match): Promise<Match> {
  const row = matchToRow(match);
  const { data, error } = await supabase
    .from('matches')
    .update(row)
    .eq('id', match.id)
    .select()
    .single();

  if (error) throw error;

  const playerIds = match.playerStats.map(ps => ps.playerId);
  return matchRowToMatch(data, playerIds);
}

export async function deleteMatch(matchId: string): Promise<void> {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId);

  if (error) throw error;
}

// MATCH RATINGS
export async function getMatchRatings(): Promise<MatchRating[]> {
  const { data, error } = await supabase
    .from('match_ratings')
    .select('*');

  if (error) throw error;

  return (data || []).map((row: MatchRatingRow) => ({
    matchId: row.match_id,
    playerId: row.player_id,
    rating: row.rating || 0,
    notes: row.notes || undefined,
  }));
}

export async function saveMatchRating(rating: MatchRating): Promise<MatchRating> {
  const { data, error } = await supabase
    .from('match_ratings')
    .upsert({
      match_id: rating.matchId,
      player_id: rating.playerId,
      rating: rating.rating,
      notes: rating.notes || null,
    }, {
      onConflict: 'match_id,player_id',
    })
    .select()
    .single();

  if (error) throw error;

  return {
    matchId: data.match_id,
    playerId: data.player_id,
    rating: data.rating || 0,
    notes: data.notes || undefined,
  };
}

export async function deleteMatchRating(matchId: string, playerId: string): Promise<void> {
  const { error } = await supabase
    .from('match_ratings')
    .delete()
    .eq('match_id', matchId)
    .eq('player_id', playerId);

  if (error) throw error;
}

// MVP RECORDS
export async function getMvpRecords(): Promise<MVPRecord[]> {
  const { data, error } = await supabase
    .from('mvp_records')
    .select('*');

  if (error) throw error;

  return (data || []).map((row: MVPRecordRow) => ({
    matchId: row.match_id,
    playerId: row.player_id,
    date: row.date,
    opponent: row.opponent,
    rating: row.rating || 0,
  }));
}

export async function saveMvpRecord(mvp: MVPRecord): Promise<MVPRecord> {
  const { data, error } = await supabase
    .from('mvp_records')
    .upsert({
      match_id: mvp.matchId,
      player_id: mvp.playerId,
      date: mvp.date,
      opponent: mvp.opponent,
      rating: mvp.rating,
    }, {
      onConflict: 'match_id',
    })
    .select()
    .single();

  if (error) throw error;

  return {
    matchId: data.match_id,
    playerId: data.player_id,
    date: data.date,
    opponent: data.opponent,
    rating: data.rating || 0,
  };
}

export async function deleteMvpRecord(matchId: string): Promise<void> {
  const { error } = await supabase
    .from('mvp_records')
    .delete()
    .eq('match_id', matchId);

  if (error) throw error;
}

// Initialize default players if none exist
export async function initializeDefaultPlayers(defaultPlayers: Player[]): Promise<Player[]> {
  const existingPlayers = await getPlayers();

  if (existingPlayers.length === 0) {
    // Create default players with new UUIDs
    const createdPlayers: Player[] = [];
    for (const player of defaultPlayers) {
      const newPlayer = {
        ...player,
        id: crypto.randomUUID(),
      };
      const created = await createPlayer(newPlayer);
      createdPlayers.push(created);
    }
    return createdPlayers;
  }

  return existingPlayers;
}
