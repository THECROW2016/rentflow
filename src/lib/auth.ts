import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function getJwtKey() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 32) {
    return new TextEncoder().encode(secret);
  }
  return new TextEncoder().encode("dev-only-insecure-secret-change-me-now!!");
}

export type OrganizationRole = "OWNER" | "ADMIN" | "MANAGER" | "STAFF";

export type SessionUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  organizationName: string;
  role: OrganizationRole;
};

const GUEST: SessionUser = {
  id: "guest",
  email: "guest@rentflow.local",
  firstName: "Guest",
  lastName: "User",
  organizationId: "guest",
  organizationName: "RentFlow",
  role: "OWNER",
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: SessionUser) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtKey());
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtKey());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

/** Always returns a session — uses cookie if present, else first org / guest. */
export async function getSession(): Promise<SessionUser> {
  try {
    const store = await cookies();
    const token = store.get("rentflow_session")?.value;
    if (token) {
      const user = await verifyToken(token);
      if (user) return user;
    }
  } catch {
    /* no cookies available */
  }

  try {
    const org = await prisma.organization.findFirst({
      orderBy: { createdAt: "asc" },
      include: {
        members: {
          take: 1,
          include: { user: true },
        },
      },
    });
    if (org) {
      const member = org.members[0];
      if (member) {
        return {
          id: member.user.id,
          email: member.user.email,
          firstName: member.user.firstName,
          lastName: member.user.lastName,
          organizationId: org.id,
          organizationName: org.name,
          role: member.role as OrganizationRole,
        };
      }
      return {
        ...GUEST,
        organizationId: org.id,
        organizationName: org.name,
      };
    }
  } catch {
    /* DB not ready */
  }

  return GUEST;
}

export async function setSession(user: SessionUser) {
  const token = await createToken(user);
  const store = await cookies();
  store.set("rentflow_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete("rentflow_session");
}

export function hasRole(session: SessionUser, roles: OrganizationRole[]) {
  return roles.includes(session.role);
}
