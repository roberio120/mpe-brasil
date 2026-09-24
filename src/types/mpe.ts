export type CriteriaId = 
  | 'lideranca'
  | 'estrategias'
  | 'clientes'
  | 'sociedade'
  | 'informacoes'
  | 'pessoas'
  | 'processos'
  | 'resultados';

export interface Option {
  id: 'a' | 'b' | 'c' | 'd';
  text: string;
  points: number; // a=0, b=1, c=2, d=3
}

export interface Question {
  id: number;
  criteriaId: CriteriaId;
  criteriaName: string;
  title: string;
  explanation: string;
  example?: string;
  justificationRequiredFor?: ('c' | 'd')[];
  justificationPrompt?: string;
  requiresResultsTable?: boolean; // For Q32-Q36
  resultsTableHelp?: string;
  isProfitMargin?: boolean; // For Q37
  options: Option[];
}

export interface CriteriaInfo {
  id: CriteriaId;
  name: string;
  description: string;
  questionRange: [number, number];
  maxPoints: number;
}

export interface CompanyInfo {
  companyName: string;
  tradeName?: string;
  cnpj: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  sectorCategory: string; // e.g. Agronegócio, Comércio, Indústria, etc.
  state: string;
  city: string;
  annualRevenueRange?: string;
  employeeCount?: number;
}

export interface ResultTableData {
  year1?: string;
  year2?: string;
  year3?: string;
  trend?: 'desfavoravel' | 'favoravel' | 'constante_favoravel' | '';
  // For margin of profit Q37
  annualRevenue?: string;
  totalCostsAndExpenses?: string;
  calculatedMarginPercent?: string;
}

export interface QuestionAnswer {
  questionId: number;
  selectedOptionId: 'a' | 'b' | 'c' | 'd';
  justificationText?: string;
  resultData?: ResultTableData;
}

export interface SubmissionPayload {
  companyInfo: CompanyInfo;
  lgpdConsented: boolean;
  lgpdConsentedAt: string;
  answers: Record<number, QuestionAnswer>;
}

export interface DimensionScore {
  criteriaId: CriteriaId;
  criteriaName: string;
  score: number;
  maxScore: number;
  percentage: number;
  maturityLevel: string;
  strengths: string[];
  opportunities: string[];
  recommendations: string[];
}

export interface DiagnosticReport {
  overallScore: number;
  maxScore: number;
  overallPercentage: number;
  maturityLevel: 'Inicial' | 'Em Desenvolvimento' | 'Intermediário' | 'Avançado' | 'Excelência';
  maturityDescription: string;
  dimensions: Record<CriteriaId, DimensionScore>;
  priorityActions: string[];
  generatedAt: string;
}

export interface SubmissionRecord {
  id: string;
  companyInfo: CompanyInfo;
  lgpdConsented: boolean;
  lgpdConsentedAt: string;
  answers: Record<number, QuestionAnswer>;
  scoreTotal: number;
  maxScoreTotal: number;
  scorePercentage: number;
  maturityLevel: string;
  diagnosticReport: DiagnosticReport;
  isAnonymized: boolean;
  submittedAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
  twoFactorEnabled: boolean;
}
