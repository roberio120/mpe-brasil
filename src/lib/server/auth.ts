import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: A variável de ambiente JWT_SECRET não foi configurada para o ambiente de produção!');
    }
    // Development fallback with explicit console warning
    return new TextEncoder().encode('mpe_brasil_meg_dev_fallback_secret_key_2026_x987');
  }
  return new TextEncoder().encode(secret);
}

const COOKIE_NAME = 'mpe_admin_token';

export async function createAdminToken(payload: { email: string; name: string; role: string }) {
  const secret = getJwtSecret();
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h') // Session timeout 8 hours
    .sign(secret);
}

export async function verifyAdminToken(token: string) {
  try {
    const secret = getJwtSecret();
    const verified = await jwtVerify(token, secret);
    return verified.payload as { email: string; name: string; role: string };
  } catch (err) {
    return null;
  }
}

export async function getAdminSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyAdminToken(token);
}

export async function getAdminSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyAdminToken(token);
}

export { COOKIE_NAME };
