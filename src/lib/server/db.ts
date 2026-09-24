import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { SubmissionRecord, AdminUser } from '@/types/mpe';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DbSchema {
  admins: (AdminUser & { passwordHash: string })[];
  submissions: SubmissionRecord[];
}

// Initial Admin User Credentials
const DEFAULT_ADMIN_EMAIL = 'admin@mpebrasil.com.br';
const DEFAULT_ADMIN_PASS = 'Admin123!@#';

function ensureDataFile(): DbSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(DEFAULT_ADMIN_PASS, salt);

    const initialData: DbSchema = {
      admins: [
        {
          id: 'admin-1',
          email: DEFAULT_ADMIN_EMAIL,
          name: 'Administrador MPE Brasil',
          role: 'superadmin',
          twoFactorEnabled: false,
          passwordHash,
        },
      ],
      submissions: [],
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content) as DbSchema;
  } catch (error) {
    console.error('Error reading db file, re-initializing:', error);
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(DEFAULT_ADMIN_PASS, salt);
    const initialData: DbSchema = {
      admins: [
        {
          id: 'admin-1',
          email: DEFAULT_ADMIN_EMAIL,
          name: 'Administrador MPE Brasil',
          role: 'superadmin',
          twoFactorEnabled: false,
          passwordHash,
        },
      ],
      submissions: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function writeDb(data: DbSchema): void {
  ensureDataFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getAdminByEmail(email: string) {
  const db = ensureDataFile();
  return db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
}

export async function toggleAdmin2FA(email: string): Promise<boolean> {
  const db = ensureDataFile();
  const admin = db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (admin) {
    admin.twoFactorEnabled = !admin.twoFactorEnabled;
    writeDb(db);
    return admin.twoFactorEnabled;
  }
  return false;
}

export async function saveSubmission(record: SubmissionRecord): Promise<void> {
  const db = ensureDataFile();
  db.submissions.unshift(record);
  writeDb(db);
}

export async function getAllSubmissions(filters?: {
  search?: string;
  sector?: string;
  state?: string;
  maturity?: string;
}): Promise<SubmissionRecord[]> {
  const db = ensureDataFile();
  let list = [...db.submissions];

  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (sub) =>
        sub.companyInfo.companyName.toLowerCase().includes(s) ||
        sub.companyInfo.cnpj.includes(s) ||
        sub.companyInfo.contactName.toLowerCase().includes(s) ||
        sub.companyInfo.city.toLowerCase().includes(s)
    );
  }

  if (filters?.sector) {
    list = list.filter((sub) => sub.companyInfo.sectorCategory === filters.sector);
  }

  if (filters?.state) {
    list = list.filter((sub) => sub.companyInfo.state === filters.state);
  }

  if (filters?.maturity) {
    list = list.filter((sub) => sub.maturityLevel === filters.maturity);
  }

  return list;
}

export async function getSubmissionById(id: string): Promise<SubmissionRecord | null> {
  const db = ensureDataFile();
  return db.submissions.find((sub) => sub.id === id) || null;
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const db = ensureDataFile();
  const index = db.submissions.findIndex((sub) => sub.id === id);
  if (index !== -1) {
    db.submissions.splice(index, 1);
    writeDb(db);
    return true;
  }
  return false;
}

export async function anonymizeSubmission(id: string): Promise<boolean> {
  const db = ensureDataFile();
  const sub = db.submissions.find((s) => s.id === id);
  if (sub) {
    sub.isAnonymized = true;
    sub.companyInfo.companyName = `Empresa Anonimizada #${id.slice(0, 6)}`;
    sub.companyInfo.tradeName = 'Anonimizado LGPD';
    sub.companyInfo.cnpj = '00.000.000/0000-00';
    sub.companyInfo.contactName = 'Contato Anonimizado';
    sub.companyInfo.email = 'anonimizado@lgpd.local';
    sub.companyInfo.phone = '(00) 00000-0000';
    sub.updatedAt = new Date().toISOString();
    writeDb(db);
    return true;
  }
  return false;
}

export async function getDashboardStats() {
  const db = ensureDataFile();
  const subs = db.submissions;

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
    // Maturity
    const mat = sub.maturityLevel as keyof typeof maturityDistribution;
    if (maturityDistribution[mat] !== undefined) {
      maturityDistribution[mat]++;
    }

    // Sector
    const sec = sub.companyInfo.sectorCategory;
    sectorCounts[sec] = (sectorCounts[sec] || 0) + 1;

    // Criteria averages
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

  // Top Sector
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
