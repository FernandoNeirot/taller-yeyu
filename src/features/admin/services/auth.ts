import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_USERS_COLLECTION,
  getAdminFirestore,
} from "@/lib/firebase-admin";
import { verifyPassword } from "./password";

const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24;
const AUTH_ERROR = "Usuario o contraseña incorrectos";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "dev-admin-session-secret";
  }
  throw new Error("Falta ADMIN_SESSION_SECRET en el entorno.");
}

function encodeToken(username: string): string {
  const issuedAt = Date.now().toString();
  const payload = `${username}:${issuedAt}`;
  const signature = createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");

  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

function decodeToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const [username, issuedAt, signature] = decoded.split(":");
    if (!username || !issuedAt || !signature) return null;

    const expected = createHmac("sha256", getSecret())
      .update(`${username}:${issuedAt}`)
      .digest("base64url");

    if (signature !== expected) return null;
    return username;
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

export async function login(
  username: string,
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  const normalizedUser = username.trim().toLowerCase();
  if (!normalizedUser || !password) {
    return { ok: false, error: AUTH_ERROR };
  }

  try {
    const snapshot = await getAdminFirestore()
      .collection(ADMIN_USERS_COLLECTION)
      .doc(normalizedUser)
      .get();

    const data = snapshot.data();
    if (!snapshot.exists || !data || data.active === false) {
      return { ok: false, error: AUTH_ERROR };
    }

    const valid = await verifyPassword(
      password,
      String(data.salt ?? ""),
      String(data.passwordHash ?? ""),
    );

    if (!valid) {
      return { ok: false, error: AUTH_ERROR };
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
  } catch (error) {
    console.error("Admin login failed:", error);
    return {
      ok: false,
      error: "No se pudo iniciar sesión. Probá de nuevo en un momento.",
    };
  }
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
