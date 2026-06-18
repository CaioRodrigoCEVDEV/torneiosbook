import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminUser } from "./tournament-types";
import { prisma } from "./prisma";

const COOKIE_NAME = "arena_fc_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const DEFAULT_SECRET = "arena-fc-local-session-secret";

function getSecret() {
  return process.env.SESSION_SECRET?.trim() || DEFAULT_SECRET;
}

function signPayload(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function createSessionToken(adminId: string) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `${adminId}.${issuedAt}`;
  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [adminId, issuedAtRaw, signature] = parts;
  const issuedAt = Number(issuedAtRaw);

  if (!adminId || !Number.isInteger(issuedAt)) {
    return null;
  }

  const expected = signPayload(`${adminId}.${issuedAt}`);

  if (!safeEqual(expected, signature)) {
    return null;
  }

  if (Math.floor(Date.now() / 1000) - issuedAt > SESSION_TTL_SECONDS) {
    return null;
  }

  return { adminId, issuedAt };
}

export async function setAdminSession(adminId: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, createSessionToken(adminId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(value);
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const session = await getAdminSession();

  if (!session) {
    return null;
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.adminId },
  });

  if (!admin) {
    return null;
  }

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    createdAt: admin.createdAt.toISOString(),
    updatedAt: admin.updatedAt.toISOString(),
  };
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

export async function authenticateAdmin(email: string, password: string) {
  const admin = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!admin) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, admin.passwordHash);

  if (!passwordMatches) {
    return null;
  }

  return admin;
}
