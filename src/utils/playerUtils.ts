import type { Match, PlayerStats, MatchRating, MVPRecord } from '../types';
import { EMPTY_STATS } from '../types';

/**
 * Calculate career totals for a player across all matches
 */
export function calculateCareerTotals(playerId: string, matches: Match[]): PlayerStats {
  return matches.reduce(
    (totals, match) => {
      const playerMatchStats = match.playerStats.find((ps) => ps.playerId === playerId);
      if (!playerMatchStats) return totals;

      return {
        goals: totals.goals + playerMatchStats.stats.goals,
        assists: totals.assists + playerMatchStats.stats.assists,
        shotsOnTarget: totals.shotsOnTarget + playerMatchStats.stats.shotsOnTarget,
        shotsOffTarget: totals.shotsOffTarget + playerMatchStats.stats.shotsOffTarget,
        passesCompleted: totals.passesCompleted + playerMatchStats.stats.passesCompleted,
        passesMissed: totals.passesMissed + playerMatchStats.stats.passesMissed,
        interceptions: totals.interceptions + playerMatchStats.stats.interceptions,
        tackles: totals.tackles + playerMatchStats.stats.tackles,
        fouls: totals.fouls + playerMatchStats.stats.fouls,
        dribbles: totals.dribbles + playerMatchStats.stats.dribbles,
        saves: totals.saves + playerMatchStats.stats.saves,
        goalsConceded: totals.goalsConceded + playerMatchStats.stats.goalsConceded,
      };
    },
    { ...EMPTY_STATS }
  );
}

/**
 * Get recent matches for a player (sorted by date, newest first)
 */
export function getRecentMatches(playerId: string, matches: Match[], limit: number = 10): Match[] {
  return matches
    .filter((match) => {
      const playerMatchStats = match.playerStats.find((ps) => ps.playerId === playerId);
      return playerMatchStats !== undefined;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

/**
 * Get player stats for a specific match
 */
export function getPlayerMatchStats(playerId: string, match: Match): PlayerStats | null {
  const playerMatchStats = match.playerStats.find((ps) => ps.playerId === playerId);
  return playerMatchStats?.stats || null;
}

/**
 * Calculate average match rating for a player
 */
export function calculateAverageRating(playerId: string, matchRatings: MatchRating[]): number {
  const playerRatings = matchRatings.filter((mr) => mr.playerId === playerId);
  if (playerRatings.length === 0) return 0;

  const sum = playerRatings.reduce((acc, mr) => acc + mr.rating, 0);
  return Math.round(sum / playerRatings.length);
}

/**
 * Get MVP matches for a player
 */
export function getMVPMatches(playerId: string, mvpRecords: MVPRecord[]): MVPRecord[] {
  return mvpRecords
    .filter((mvp) => mvp.playerId === playerId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get match rating for a specific match
 */
export function getMatchRating(
  playerId: string,
  matchId: string,
  matchRatings: MatchRating[]
): MatchRating | null {
  return matchRatings.find((mr) => mr.playerId === playerId && mr.matchId === matchId) || null;
}

/**
 * Calculate overall FIFA rating (average of all 6 stats)
 */
export function calculateOverallRating(fifaStats: { ritmo: number; tiro: number; dribbling: number; fisico: number; defensa: number; pase: number }): number {
  const sum = fifaStats.ritmo + fifaStats.tiro + fifaStats.dribbling + fifaStats.fisico + fifaStats.defensa + fifaStats.pase;
  return Math.round(sum / 6);
}

/**
 * Get number of matches played
 */
export function getMatchesPlayed(playerId: string, matches: Match[]): number {
  return matches.filter((match) => {
    const playerMatchStats = match.playerStats.find((ps) => ps.playerId === playerId);
    return playerMatchStats !== undefined;
  }).length;
}

/**
 * Format birthday for display
 */
export function formatBirthday(birthday: string | null): string {
  if (!birthday) return 'Not set';
  const date = new Date(birthday);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Get preferred foot label
 */
export function getPreferredFootLabel(foot: 'left' | 'right' | 'both'): string {
  switch (foot) {
    case 'left':
      return 'Left';
    case 'right':
      return 'Right';
    case 'both':
      return 'Both';
    default:
      return 'Not set';
  }
}

