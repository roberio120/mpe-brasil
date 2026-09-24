import { NextRequest, NextResponse } from 'next/server';
import { SubmissionPayload, SubmissionRecord } from '@/types/mpe';
import { calculateDiagnosticReport } from '@/lib/server/diagnosticEngine';
import { saveSubmission } from '@/lib/server/db';
import { isValidCNPJ } from '@/lib/utils/validators';
import { checkRateLimit } from '@/lib/server/rateLimit';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // RATE LIMITING: Max 10 submissions per minute per IP
    const rl = checkRateLimit(req, 10, 60000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas submissões enviadas em curto espaço de tempo. Por favor, aguarde 1 minuto.' },
        { status: 429 }
      );
    }

    const body: SubmissionPayload = await req.json();

    // LGPD Validation
    if (!body.lgpdConsented) {
      return NextResponse.json(
        { error: 'É necessário concordar com os termos da LGPD para enviar.' },
        { status: 400 }
      );
    }

    if (!body.companyInfo?.companyName || !body.companyInfo?.cnpj || !body.companyInfo?.email) {
      return NextResponse.json(
        { error: 'Por favor, preencha as informações obrigatórias da empresa.' },
        { status: 400 }
      );
    }

    // STRICT SERVER-SIDE CNPJ VALIDATION
    if (!isValidCNPJ(body.companyInfo.cnpj)) {
      return NextResponse.json(
        { error: 'O CNPJ informado é inválido. Por favor, forneça um CNPJ válido da Receita Federal.' },
        { status: 400 }
      );
    }

    if (!body.answers || Object.keys(body.answers).length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma resposta foi fornecida.' },
        { status: 400 }
      );
    }

    // SERVER-SIDE SCORING & DIAGNOSTIC CALCULATION
    const diagnosticReport = calculateDiagnosticReport(body.answers);

    const submissionId = `sub_${crypto.randomBytes(8).toString('hex')}`;
    const now = new Date().toISOString();

    const record: SubmissionRecord = {
      id: submissionId,
      companyInfo: body.companyInfo,
      lgpdConsented: body.lgpdConsented,
      lgpdConsentedAt: body.lgpdConsentedAt || now,
      answers: body.answers,
      scoreTotal: diagnosticReport.overallScore,
      maxScoreTotal: diagnosticReport.maxScore,
      scorePercentage: diagnosticReport.overallPercentage,
      maturityLevel: diagnosticReport.maturityLevel,
      diagnosticReport,
      isAnonymized: false,
      submittedAt: now,
      updatedAt: now,
    };

    // Save to DB
    await saveSubmission(record);

    return NextResponse.json(
      {
        success: true,
        submissionId: record.id,
        message: 'Questionário de Autoavaliação enviado com sucesso!',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { error: 'Ocorreu um erro interno ao processar sua resposta.' },
      { status: 500 }
    );
  }
}
