import { PrismaClient } from '@prisma/client';
import { SubmissionRecord, AdminUser, CompanyInfo } from '@/types/mpe';

const prisma = new PrismaClient();

type SubmissionRow = Awaited<ReturnType<typeof prisma.submission.findFirst>>;

function rowToRecord(row: SubmissionRow): SubmissionRecord {
  if (!row || !row.recordJson) {
    throw new Error(`Submission ${row?.id} sem recordJson`);
  }
  return JSON.parse(row.recordJson) as SubmissionRecord;
}

export async function getAdminByEmail(
  email: string
): Promise<(AdminUser & { passwordHash: string }) | null> {
  const admin = await prisma.adminUser.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  });
  if (!admin) return null;
  return admin as AdminUser & { passwordHash: string };
}

export async function toggleAdmin2FA(email: string): Promise<boolean> {
  const admin = await prisma.adminUser.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  });
  if (!admin) return false;
  const updated = await prisma.adminUser.update({
    where: { id: admin.id },
    data: { twoFactorEnabled: !admin.twoFactorEnabled },
  });
  return updated.twoFactorEnabled;
}

export async function saveSubmission(record: SubmissionRecord): Promise<void> {
  const { companyInfo } = record;
  await prisma.submission.create({
    data: {
      id: record.id,
      companyName: companyInfo.companyName,
      tradeName: companyInfo.tradeName ?? null,
      cnpj: companyInfo.cnpj,
      contactName: companyInfo.contactName,
      contactRole: companyInfo.contactRole,
      email: companyInfo.email,
      phone: companyInfo.phone,
      sectorCategory: companyInfo.sectorCategory,
      state: companyInfo.state,
      city: companyInfo.city,
      lgpdConsented: record.lgpdConsented,
      lgpdConsentedAt: new Date(record.lgpdConsentedAt),
      answersJson: JSON.stringify(record.answers),
      scoreTotal: record.scoreTotal,
      maxScoreTotal: record.maxScoreTotal,
      scorePercentage: record.scorePercentage,
      maturityLevel: record.maturityLevel,
      diagnosticJson: JSON.stringify(record.diagnosticReport),
      recordJson: JSON.stringify(record),
      isAnonymized: record.isAnonymized,
      submittedAt: new Date(record.submittedAt),
    },
  });
}

export async function getAllSubmissions(filters?: {
  search?: string;
  sector?: string;
  state?: string;
  maturity?: string;
}): Promise<SubmissionRecord[]> {
  const rows = await prisma.submission.findMany({
    where: {
      ...(filters?.search
        ? {
            OR: [
              { companyName: { contains: filters.search, mode: 'insensitive' as const } },
              { cnpj: { contains: filters.search } },
              { contactName: { contains: filters.search, mode: 'insensitive' as const } },
              { city: { contains: filters.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(filters?.sector ? { sectorCategory: filters.sector } : {}),
      ...(filters?.state ? { state: filters.state } : {}),
      ...(filters?.maturity ? { maturityLevel: filters.maturity } : {}),
    },
    orderBy: { submittedAt: 'desc' },
  });
  return rows.map(rowToRecord);
}

export async function getSubmissionById(id: string): Promise<SubmissionRecord | null> {
  const row = await prisma.submission.findUnique({ where: { id } });
  if (!row) return null;
  return rowToRecord(row);
}

export async function deleteSubmission(id: string): Promise<boolean> {
  try {
    await prisma.submission.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function anonymizeSubmission(id: string): Promise<boolean> {
  const row = await prisma.submission.findUnique({ where: { id } });
  if (!row) return false;

  const record = rowToRecord(row);
  const updated = { ...record, updatedAt: new Date().toISOString() };
  updated.isAnonymized = true;
  updated.companyInfo = {
    ...updated.companyInfo,
    companyName: `Empresa Anonimizada #${id.slice(0, 6)}`,
    tradeName: 'Anonimizado LGPD',
    cnpj: '00.000.000/0000-00',
    contactName: 'Contato Anonimizado',
    email: 'anonimizado@lgpd.local',
    phone: '(00) 00000-0000',
  } as CompanyInfo;

  await prisma.submission.update({
    where: { id },
    data: {
      companyName: updated.companyInfo.companyName,
      tradeName: 'Anonimizado LGPD',
      cnpj: '00.000.000/0000-00',
      contactName: 'Contato Anonimizado',
      email: 'anonimizado@lgpd.local',
      phone: '(00) 00000-0000',
      isAnonymized: true,
      recordJson: JSON.stringify(updated),
      updatedAt: new Date(updated.updatedAt),
    },
  });

  return true;
}

export async function getDashboardStats() {
  const subs = await getAllSubmissions();

  const totalSubmissions = subs.length;
  if (totalSubmissions === 0) {
    return {
      totalSubmissions: 0,
      avgScore: 0,
      avgPercentage: 0,
      topSector: 'Nenhum',
      maturityDistribution: {
        Inicial: 0,
        'Em Desenvolvimento': 0,
        Intermediário: 0,
        Avançado: 0,
        Excelência: 0,
      },
      criteriaAverages: {
        lideranca: 0,
        estrategias: 0,
        clientes: 0,
        sociedade: 0,
        informacoes: 0,
        pessoas: 0,
        processos: 0,
        resultados: 0,
      },
    };
  }

  const totalScoreSum = subs.reduce((acc, curr) => acc + curr.scoreTotal, 0);
  const avgScore = Math.round((totalScoreSum / totalSubmissions) * 10) / 10;
  const avgPercentage = Math.round((avgScore / 111) * 100);

  const maturityDistribution = {
    Inicial: 0,
    'Em Desenvolvimento': 0,
    Intermediário: 0,
    Avançado: 0,
    Excelência: 0,
  };

  const sectorCounts: Record<string, number> = {};
  const criteriaSums = {
    lideranca: 0,
    estrategias: 0,
    clientes: 0,
    sociedade: 0,
    informacoes: 0,
    pessoas: 0,
    processos: 0,
    resultados: 0,
  };

  subs.forEach((sub) => {
    const mat = sub.maturityLevel as keyof typeof maturityDistribution;
    if (maturityDistribution[mat] !== undefined) {
      maturityDistribution[mat]++;
    }

    const sec = sub.companyInfo.sectorCategory;
    sectorCounts[sec] = (sectorCounts[sec] || 0) + 1;

    if (sub.diagnosticReport && sub.diagnosticReport.dimensions) {
      Object.keys(criteriaSums).forEach((k) => {
        const key = k as keyof typeof criteriaSums;
        const dim = sub.diagnosticReport.dimensions[key];
        if (dim) {
          criteriaSums[key] += dim.percentage;
        }
      });
    }
  });

  let topSector = 'N/A';
  let maxSectorCount = 0;
  Object.entries(sectorCounts).forEach(([sec, count]) => {
    if (count > maxSectorCount) {
      maxSectorCount = count;
      topSector = sec;
    }
  });

  const criteriaAverages = {
    lideranca: Math.round(criteriaSums.lideranca / totalSubmissions),
    estrategias: Math.round(criteriaSums.estrategias / totalSubmissions),
    clientes: Math.round(criteriaSums.clientes / totalSubmissions),
    sociedade: Math.round(criteriaSums.sociedade / totalSubmissions),
    informacoes: Math.round(criteriaSums.informacoes / totalSubmissions),
    pessoas: Math.round(criteriaSums.pessoas / totalSubmissions),
    processos: Math.round(criteriaSums.processos / totalSubmissions),
    resultados: Math.round(criteriaSums.resultados / totalSubmissions),
  };

  return {
    totalSubmissions,
    avgScore,
    avgPercentage,
    topSector,
    maturityDistribution,
    criteriaAverages,
  };
}

export async function getBackupSnapshot() {
  const admins = await prisma.adminUser.findMany({ orderBy: { createdAt: 'asc' } });
  const submissions = (await prisma.submission.findMany({ orderBy: { submittedAt: 'desc' } })).map(
    rowToRecord
  );
  return {
    admins: admins.map((a) => ({
      id: a.id,
      email: a.email,
      name: a.name,
      role: a.role,
      twoFactorEnabled: a.twoFactorEnabled,
      passwordHash: a.passwordHash,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
    submissions,
  };
}