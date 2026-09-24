import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromRequest } from '@/lib/server/auth';
import { getAllSubmissions } from '@/lib/server/db';
import { QUESTIONS } from '@/lib/data/mpeQuestionnaire';
import { sanitizeExcelRow } from '@/lib/utils/excelSanitizer';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 401 });
  }

  const submissions = await getAllSubmissions();

  // Sheet 1: General Submissions Summary (Sanitizing formula injection)
  const summaryRows = submissions.map((sub) =>
    sanitizeExcelRow({
      'ID Resposta': sub.id,
      'Data de Envio': new Date(sub.submittedAt).toLocaleString('pt-BR'),
      'Razão Social / Empresa': sub.companyInfo.companyName,
      'Nome Fantasia': sub.companyInfo.tradeName || '',
      CNPJ: sub.companyInfo.cnpj,
      'Nome do Responsável': sub.companyInfo.contactName,
      Cargo: sub.companyInfo.contactRole,
      'E-mail': sub.companyInfo.email,
      Telefone: sub.companyInfo.phone,
      Setor: sub.companyInfo.sectorCategory,
      Estado: sub.companyInfo.state,
      Cidade: sub.companyInfo.city,
      'Pontuação Total (Máx 111)': sub.scoreTotal,
      'Maturidade (%)': `${sub.scorePercentage}%`,
      'Nível de Maturidade': sub.maturityLevel,
      'Anonimizado LGPD': sub.isAnonymized ? 'Sim' : 'Não',
    })
  );

  // Sheet 2: Dimension Scores
  const dimensionRows = submissions.map((sub) => {
    const dims = sub.diagnosticReport?.dimensions || ({} as any);
    return sanitizeExcelRow({
      'ID Resposta': sub.id,
      Empresa: sub.companyInfo.companyName,
      'Pontuação Geral': sub.scoreTotal,
      '1. Liderança (Máx 18)': dims.lideranca?.score ?? 0,
      '2. Estratégias e Planos (Máx 12)': dims.estrategias?.score ?? 0,
      '3. Clientes (Máx 15)': dims.clientes?.score ?? 0,
      '4. Sociedade (Máx 9)': dims.sociedade?.score ?? 0,
      '5. Informações e Conhecimento (Máx 12)': dims.informacoes?.score ?? 0,
      '6. Pessoas (Máx 15)': dims.pessoas?.score ?? 0,
      '7. Processos (Máx 12)': dims.processos?.score ?? 0,
      '8. Resultados (Máx 18)': dims.resultados?.score ?? 0,
    });
  });

  // Sheet 3: Full Detailed Answers
  const detailedAnswersRows: any[] = [];
  submissions.forEach((sub) => {
    QUESTIONS.forEach((q) => {
      const ans = sub.answers[q.id];
      const opt = ans ? q.options.find((o) => o.id === ans.selectedOptionId) : null;
      detailedAnswersRows.push(
        sanitizeExcelRow({
          'ID Resposta': sub.id,
          Empresa: sub.companyInfo.companyName,
          'Nº Questão': q.id,
          Critério: q.criteriaName,
          'Título da Questão': q.title,
          'Opção Selecionada': ans ? ans.selectedOptionId.toUpperCase() : 'Não respondida',
          'Pontos da Resposta': opt ? opt.points : 0,
          'Texto da Opção': opt ? opt.text : '',
          Justificativa: ans?.justificationText || '',
          'Tabela Resultados / Dados': ans?.resultData ? JSON.stringify(ans.resultData) : '',
        })
      );
    });
  });

  // Create workbook
  const wb = XLSX.utils.book_new();

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  const wsDimensions = XLSX.utils.json_to_sheet(dimensionRows);
  const wsDetails = XLSX.utils.json_to_sheet(detailedAnswersRows);

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo Respondentes');
  XLSX.utils.book_append_sheet(wb, wsDimensions, 'Pontuação por Critério');
  XLSX.utils.book_append_sheet(wb, wsDetails, 'Respostas Completas');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Diagnosticos_MPE_Brasil_${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
