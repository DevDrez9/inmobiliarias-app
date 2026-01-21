import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.JOSE_SECRET || "default-secret-key";
const key = new TextEncoder().encode(secretKey);

export interface SessionData {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
  expires: Date;
}

export async function encrypt(payload: SessionData) {
  return await new SignJWT(payload as any) // jose types are a bit loose or require specific payload structures, casting for simplicity in this MVP
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionData;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<SessionData | null> {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request: any) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Extend expiration
  const parsed = await decrypt(session);
  if (!parsed) return;

  parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const res = await encrypt(parsed);

  // Note: This function helps middleware update the cookie response if needed
  // implementation varies depending on where it's called
}
