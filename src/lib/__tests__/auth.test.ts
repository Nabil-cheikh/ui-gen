// @vitest-environment node
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { SignJWT } from "jose";

vi.mock("server-only", () => ({}));

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

async function createToken(payload: Record<string, unknown>, expiresIn = "7d") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

beforeEach(() => {
  vi.resetModules();
  mockCookieStore.get.mockReset();
  mockCookieStore.set.mockReset();
  mockCookieStore.delete.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("getSession returns null when no auth cookie exists", async () => {
  mockCookieStore.get.mockReturnValue(undefined);

  const { getSession } = await import("@/lib/auth");
  const session = await getSession();

  expect(session).toBeNull();
  expect(mockCookieStore.get).toHaveBeenCalledWith("auth-token");
});

test("getSession returns session payload for a valid token", async () => {
  const token = await createToken({
    userId: "user-123",
    email: "test@example.com",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
  mockCookieStore.get.mockReturnValue({ value: token });

  const { getSession } = await import("@/lib/auth");
  const session = await getSession();

  expect(session).not.toBeNull();
  expect(session!.userId).toBe("user-123");
  expect(session!.email).toBe("test@example.com");
});

test("getSession returns null for an expired token", async () => {
  const token = await createToken(
    {
      userId: "user-123",
      email: "test@example.com",
    },
    "0s"
  );

  // Small delay to ensure token is expired
  await new Promise((r) => setTimeout(r, 10));

  mockCookieStore.get.mockReturnValue({ value: token });

  const { getSession } = await import("@/lib/auth");
  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns null for an invalid token", async () => {
  mockCookieStore.get.mockReturnValue({ value: "not-a-valid-jwt" });

  const { getSession } = await import("@/lib/auth");
  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns null for a token signed with a different secret", async () => {
  const wrongSecret = new TextEncoder().encode("wrong-secret-key");
  const token = await new SignJWT({ userId: "user-123", email: "test@example.com" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(wrongSecret);

  mockCookieStore.get.mockReturnValue({ value: token });

  const { getSession } = await import("@/lib/auth");
  const session = await getSession();

  expect(session).toBeNull();
});
