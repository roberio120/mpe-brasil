import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/server/auth';
import { getBackupSnapshot } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 401 });
  }

  const snapshot = await getBackupSnapshot();
  const body = JSON.stringify(snapshot, null, 2);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="backup_mpe_brasil_${timestamp}.json"`,
    },
  });
}