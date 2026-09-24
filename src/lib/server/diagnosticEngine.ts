import { QuestionAnswer, DiagnosticReport, DimensionScore, CriteriaId } from '@/types/mpe';
import { QUESTIONS, MEG_CRITERIA } from '@/lib/data/mpeQuestionnaire';

export function calculateDiagnosticReport(answers: Record<number, QuestionAnswer>): DiagnosticReport {
  let overallScore = 0;
  const maxScore = 111;

  // Initialize dimension tracker
  const dimensionTracker: Record<CriteriaId, { score: number; maxScore: number; questionCount: number }> = {
    lideranca: { score: 0, maxScore: 18, questionCount: 6 },
    estrategias: { score: 0, maxScore: 12, questionCount: 4 },
    clientes: { score: 0, maxScore: 15, questionCount: 5 },
    sociedade: { score: 0, maxScore: 9, questionCount: 3 },
    informacoes: { score: 0, maxScore: 12, questionCount: 4 },
    pessoas: { score: 0, maxScore: 15, questionCount: 5 },
    processos: { score: 0, maxScore: 12, questionCount: 4 },
    resultados: { score: 0, maxScore: 18, questionCount: 6 },
  };

  // Iterate over questions and sum points
  QUESTIONS.forEach((q) => {
    const ans = answers[q.id];
    let pts = 0;
    if (ans) {
      const option = q.options.find((opt) => opt.id === ans.selectedOptionId);
      if (option) {
        pts = option.points;
      }
    }
    overallScore += pts;
    dimensionTracker[q.criteriaId].score += pts;
  });

  const overallPercentage = Math.round((overallScore / maxScore) * 100);

  // Determine maturity stage
  let maturityLevel: 'Inicial' | 'Em Desenvolvimento' | 'Intermediário' | 'Avançado' | 'Excelência';
  let maturityDescription = '';

  if (overallPercentage <= 25) {
    maturityLevel = 'Inicial';
    maturityDescription = 'A gestão da empresa é incipiente e predominantemente reativa. As práticas de gestão ainda não estão formalizadas nem padronizadas. Recomendam-se ações estruturantes básicas em liderança e controles financeiros.';
  } else if (overallPercentage <= 50) {
    maturityLevel = 'Em Desenvolvimento';
    maturityDescription = 'A empresa possui práticas de gestão informais ou pontuais. Há iniciativas de controle, mas ainda faltam planejamento estratégico formal, acompanhamento contínuo de indicadores e processos padronizados.';
  } else if (overallPercentage <= 75) {
    maturityLevel = 'Intermediário';
    maturityDescription = 'A empresa possui um bom nível de formalização. Os processos principais estão padronizados, a visão e os indicadores estão definidos e há preocupação com a satisfação dos clientes e colaboradores.';
  } else if (overallPercentage <= 90) {
    maturityLevel = 'Avançado';
    maturityDescription = 'A empresa demonstra elevada maturidade de gestão alinhada ao MEG. Práticas inovadoras, medição rigorosa de resultados históricos, responsabilidade social ativa e foco em melhoria contínua.';
  } else {
    maturityLevel = 'Excelência';
    maturityDescription = 'A empresa atinge o patamar de referência em excelência da gestão (Classe Mundial). Apresenta cultura de inovação consolidade, visão sistêmica, sustentabilidade financeira e resultados favoráveis constantes nos 3 anos.';
  }

  // Generate dimension analysis
  const dimensions: Record<CriteriaId, DimensionScore> = {} as any;
  const priorityActions: string[] = [];

  (Object.keys(MEG_CRITERIA) as CriteriaId[]).forEach((cid) => {
    const meta = MEG_CRITERIA[cid];
    const track = dimensionTracker[cid];
    const pct = Math.round((track.score / track.maxScore) * 100);

    let dimMaturity = 'Inicial';
    if (pct > 75) dimMaturity = 'Excelência';
    else if (pct > 50) dimMaturity = 'Consolidado';
    else if (pct > 25) dimMaturity = 'Em Desenvolvimento';

    const strengths: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    // Analyze specific criterion
    if (pct >= 66) {
      strengths.push(`Práticas consistentes no critério de ${meta.name}, demonstrando maturidade e alinhamento estratégico.`);
    } else if (pct >= 33) {
      strengths.push(`Existem iniciativas pontuais e consciência sobre a importância de ${meta.name}.`);
      opportunities.push(`Formalizar e registrar por escrito as normas, rotinas e ferramentas de ${meta.name}.`);
      recommendations.push(`Estabelecer rotinas periódicas de análise e acompanhamento para o critério de ${meta.name}.`);
    } else {
      opportunities.push(`Ausência ou fragilidade acentuada de métodos estruturados no critério de ${meta.name}.`);
      recommendations.push(`Prioridade Alta: Implementar plano de ação básico para introduzir padronização e indicadores em ${meta.name}.`);
      priorityActions.push(`Ação Prioritária em ${meta.name}: Desenvolver e comunicar diretrizes formais para toda a equipe.`);
    }

    // Dynamic tailored recommendations based on questions
    if (cid === 'lideranca' && track.score < 9) {
      recommendations.push('Formalizar a declaração da Missão por escrito e promover reuniões mensais de alinhamento com os colaboradores.');
    }
    if (cid === 'estrategias' && track.score < 6) {
      recommendations.push('Definir a Visão de Futuro (onde a empresa quer estar em 3 anos) e criar 3 indicadores estratégicos com metas quantitativas.');
    }
    if (cid === 'clientes' && track.score < 8) {
      recommendations.push('Implantar pesquisa periódica de satisfação de clientes (NPS) e canal formal para registro de reclamações.');
    }
    if (cid === 'processos' && track.score < 6) {
      recommendations.push('Documentar os Procedimentos Operacionais Padrão (POP) dos processos chave e instituir fluxo de caixa diário e orçamento anual.');
    }
    if (cid === 'resultados' && track.score < 9) {
      recommendations.push('Construir histórico de indicadores de 3 anos para produtividade por colaborador, satisfação de cliente e margem de lucro.');
    }

    dimensions[cid] = {
      criteriaId: cid,
      criteriaName: meta.name,
      score: track.score,
      maxScore: track.maxScore,
      percentage: pct,
      maturityLevel: dimMaturity,
      strengths,
      opportunities,
      recommendations,
    };
  });

  if (priorityActions.length === 0) {
    priorityActions.push('Manter a sistemática de melhoria contínua e realizar benchmarking com empresas líderes do setor.');
  }

  return {
    overallScore,
    maxScore,
    overallPercentage,
    maturityLevel,
    maturityDescription,
    dimensions,
    priorityActions,
    generatedAt: new Date().toISOString(),
  };
}
