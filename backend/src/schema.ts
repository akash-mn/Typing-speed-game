export const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    email: String!
    username: String!
    createdAt: String!
    bestTimeMs: Int
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type GameResult {
    id: ID!
    timeMs: Int!
    errorCount: Int!
    isNewBest: Boolean!
    createdAt: String!
    user: User!
  }

  """
  Result of submitting a completed game. Mirrors the assignment's
  Success / Failure ("Try Again") outcome directly.
  """
  type SubmitGameResultPayload {
    result: GameResult!
    outcome: GameOutcome!
    previousBestMs: Int
  }

  enum GameOutcome {
    SUCCESS
    FAILURE
  }

  type LeaderboardEntry {
    rank: Int!
    username: String!
    bestTimeMs: Int!
    achievedAt: String!
  }

  type Query {
    """Currently authenticated user, or null if not logged in."""
    me: User

    """Top results ranked by fastest completion time (each user's best run)."""
    leaderboard(limit: Int = 10): [LeaderboardEntry!]!

    """The authenticated user's own game history, most recent first."""
    myResults(limit: Int = 20): [GameResult!]!
  }

  type Mutation {
    guest: AuthPayload!
    register(email: String!, username: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    """
    Submit a completed game run. timeMs is the total elapsed time in
    milliseconds, already including the 0.5s penalty per incorrect key press.
    """
    submitGameResult(timeMs: Int!, errorCount: Int!): SubmitGameResultPayload!
  }
`;
