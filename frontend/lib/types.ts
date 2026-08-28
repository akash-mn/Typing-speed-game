export interface User {
  id: string;
  email: string;
  username: string;
  bestTimeMs: number | null;
  createdAt: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface GameResult {
  id: string;
  timeMs: number;
  errorCount: number;
  isNewBest: boolean;
  createdAt: string;
}

export type GameOutcome = "SUCCESS" | "FAILURE";

export interface SubmitGameResultPayload {
  result: GameResult;
  outcome: GameOutcome;
  previousBestMs: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  bestTimeMs: number;
  achievedAt: string;
}

export interface GraphQLErrorItem {
  message: string;
  extensions?: { code?: string; fieldErrors?: Record<string, string[]> };
}
