import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/server/auth';
import { getAllSubmissions, getDashboardStats } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Acesso negado. Autenticação necessária.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const sector = searchParams.get('sector') || undefined;
  const state = searchParams.get('state') || undefined;
  const maturity = searchParams.get('maturity') || undefined;

  const submissions = await getAllSubmissions({ search, sector, state, maturity });
  const stats = await getDashboardStats();

  return NextResponse.json({
    success: true,
    stats,
    submissions,
  });
}
