export const REGISTER_MUTATION = /* GraphQL */ `
  mutation Register($email: String!, $username: String!, $password: String!) {
    register(email: $email, username: $username, password: $password) {
      token
      user {
        id
        email
        username
        bestTimeMs
        createdAt
      }
    }
  }
`;

export const GUEST_MUTATION = /* GraphQL */ `
  mutation Guest {
    guest {
      token
      user {
        id
        email
        username
        bestTimeMs
        createdAt
      }
    }
  }
`;

export const LOGIN_MUTATION = /* GraphQL */ `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        username
        bestTimeMs
        createdAt
      }
    }
  }
`;

export const ME_QUERY = /* GraphQL */ `
  query Me {
    me {
      id
      email
      username
      bestTimeMs
      createdAt
    }
  }
`;

export const SUBMIT_GAME_RESULT_MUTATION = /* GraphQL */ `
  mutation SubmitGameResult($timeMs: Int!, $errorCount: Int!) {
    submitGameResult(timeMs: $timeMs, errorCount: $errorCount) {
      outcome
      previousBestMs
      result {
        id
        timeMs
        errorCount
        isNewBest
        createdAt
      }
    }
  }
`;

export const LEADERBOARD_QUERY = /* GraphQL */ `
  query Leaderboard($limit: Int) {
    leaderboard(limit: $limit) {
      rank
      username
      bestTimeMs
      achievedAt
    }
  }
`;

export const MY_RESULTS_QUERY = /* GraphQL */ `
  query MyResults($limit: Int) {
    myResults(limit: $limit) {
      id
      timeMs
      errorCount
      isNewBest
      createdAt
    }
  }
`;
