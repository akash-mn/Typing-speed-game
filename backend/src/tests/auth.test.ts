import { describe, it, expect, beforeEach, afterAll } from "bun:test";
import { execute, resetDatabase, testPrisma } from "./setup";

const REGISTER = /* GraphQL */ `
  mutation Register($email: String!, $username: String!, $password: String!) {
    register(email: $email, username: $username, password: $password) {
      token
      user {
        id
        email
        username
        bestTimeMs
      }
    }
  }
`;

const LOGIN = /* GraphQL */ `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
      }
    }
  }
`;

const GUEST = /* GraphQL */ `
  mutation Guest {
    guest {
      token
      user {
        id
        email
        username
        bestTimeMs
      }
    }
  }
`;

describe("auth (integration, real Postgres)", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
    await testPrisma.$disconnect();
  });

  it("registers a new user, hashing the password and returning a JWT", async () => {
    const result = await execute(REGISTER, {
      email: "jane@example.com",
      username: "jane_doe",
      password: "supersecret1",
    });

    expect(result.errors).toBeUndefined();
    const data = result.data?.register as any;
    expect(data.token).toBeTruthy();
    expect(data.user.email).toBe("jane@example.com");
    expect(data.user.username).toBe("jane_doe");
    expect(data.user.bestTimeMs).toBeNull();

    const stored = await testPrisma.user.findUnique({ where: { email: "jane@example.com" } });
    expect(stored).not.toBeNull();
    expect(stored!.passwordHash).not.toBe("supersecret1"); // never store plaintext
  });

  it("rejects registration with an invalid email", async () => {
    const result = await execute(REGISTER, {
      email: "not-an-email",
      username: "someone",
      password: "supersecret1",
    });

    expect(result.data?.register).toBeNull();
    expect(result.errors?.[0]?.extensions?.code).toBe("BAD_USER_INPUT");
  });

  it("rejects duplicate email registration with a meaningful error", async () => {
    await execute(REGISTER, {
      email: "dupe@example.com",
      username: "dupe_one",
      password: "supersecret1",
    });

    const result = await execute(REGISTER, {
      email: "dupe@example.com",
      username: "dupe_two",
      password: "supersecret1",
    });

    expect(result.data?.register).toBeNull();
    expect(result.errors?.[0]?.extensions?.code).toBe("CONFLICT");
    expect(result.errors?.[0]?.message).toMatch(/already exists/i);
  });

  it("logs in with correct credentials and rejects incorrect ones", async () => {
    await execute(REGISTER, {
      email: "login@example.com",
      username: "login_user",
      password: "correct-password",
    });

    const good = await execute(LOGIN, { email: "login@example.com", password: "correct-password" });
    expect(good.errors).toBeUndefined();
    expect((good.data?.login as any).user.email).toBe("login@example.com");

    const bad = await execute(LOGIN, { email: "login@example.com", password: "wrong-password" });
    expect(bad.data?.login).toBeNull();
    expect(bad.errors?.[0]?.extensions?.code).toBe("BAD_USER_INPUT");
  });

  it("creates a persisted guest account with a unique username", async () => {
    const result = await execute(GUEST);

    expect(result.errors).toBeUndefined();
    const guest = result.data?.guest as any;
    expect(guest.token).toBeTruthy();
    expect(guest.user.username).toMatch(/^guest[a-f0-9]{6}$/);
    expect(guest.user.email).toBe(`${guest.user.username}@guest.local`);

    const stored = await testPrisma.user.findUnique({ where: { id: guest.user.id } });
    expect(stored).not.toBeNull();
    expect(stored!.passwordHash).not.toBe("");
  });
});
