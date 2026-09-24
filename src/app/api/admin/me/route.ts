import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/server/auth';
import { getAdminByEmail, toggleAdmin2FA } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const admin = await getAdminByEmail(session.email);
  return NextResponse.json({
    authenticated: true,
    user: {
      email: session.email,
      name: session.name,
      role: session.role,
      twoFactorEnabled: admin?.twoFactorEnabled || false,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { action } = await req.json();
  if (action === 'toggle-2fa') {
    const newState = await toggleAdmin2FA(session.email);
    return NextResponse.json({ success: true, twoFactorEnabled: newState });
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
}
