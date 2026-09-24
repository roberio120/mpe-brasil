import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/server/auth';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 401 });
  }

  const dbPath = path.join(process.cwd(), 'data', 'db.json');

  if (!fs.existsSync(dbPath)) {
    return NextResponse.json({ error: 'Banco de dados não localizado.' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(dbPath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="backup_mpe_brasil_${timestamp}.json"`,
    },
  });
}
