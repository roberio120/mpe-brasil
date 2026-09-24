import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/server/auth';
import { getSubmissionById, anonymizeSubmission, deleteSubmission } from '@/lib/server/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 401 });
  }

  const { id } = await params;
  const submission = await getSubmissionById(id);

  if (!submission) {
    return NextResponse.json({ error: 'Resposta não encontrada.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, submission });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  if (body.action === 'anonymize') {
    const ok = await anonymizeSubmission(id);
    if (ok) {
      return NextResponse.json({ success: true, message: 'Dados anonimizados com sucesso segundo a LGPD.' });
    }
  }

  return NextResponse.json({ error: 'Falha ao atualizar.' }, { status: 400 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteSubmission(id);

  if (deleted) {
    return NextResponse.json({ success: true, message: 'Registro excluído com sucesso.' });
  }

  return NextResponse.json({ error: 'Registro não encontrado.' }, { status: 404 });
}
