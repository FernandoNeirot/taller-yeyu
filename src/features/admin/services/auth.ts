import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24h

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "fallback-secret";
}

function getAllowedUsers(): string[] {
  return (process.env.ADMIN_USERS ?? "").split(",").map((u) => u.trim().toLowerCase()).filter(Boolean);
}

function getPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

function encodeToken(username: string): string {
  const payload = `${username}:${Date.now()}:${getSecret()}`;
  return Buffer.from(payload).toString("base64url");
}

function decodeToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const [username, , secret] = decoded.split(":");
    if (secret !== getSecret()) return null;
    return username ?? null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeToken(token);
}

export async function login(username: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const normalizedUser = username.trim().toLowerCase();
  const allowed = getAllowedUsers();

  if (!allowed.includes(normalizedUser)) {
    return { ok: false, error: "Usuario no autorizado" };
  }

  if (password !== getPassword()) {
    return { ok: false, error: "Contraseña incorrecta" };
  }

  const token = encodeToken(normalizedUser);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return { ok: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAdmin() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  return user;
}
