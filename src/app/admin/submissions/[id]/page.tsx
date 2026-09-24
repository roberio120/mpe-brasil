'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { SubmissionRecord, CriteriaId } from '@/types/mpe';
import { QUESTIONS, MEG_CRITERIA } from '@/lib/data/mpeQuestionnaire';
import {
  ArrowLeft,
  Building2,
  User,
  MapPin,
  Calendar,
  Award,
  Printer,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Check,
} from 'lucide-react';
import Link from 'next/link';

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [submission, setSubmission] = useState<SubmissionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'answers'>('diagnostic');

  const fetchSubmission = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions/${resolvedParams.id}`);
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao carregar submissão.');
        router.push('/admin/dashboard');
        return;
      }
      setSubmission(data.submission);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
  }, [resolvedParams.id]);

  const handleAnonymize = async () => {
    if (
      !confirm(
        'Tem certeza que deseja anonimizar os dados pessoais desta empresa em conformidade com a LGPD? Esta ação irá mascarar a razão social, CNPJ e contato.'
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/submissions/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'anonymize' }),
      });
      if (res.ok) {
        alert('Dados anonimizados com sucesso!');
        fetchSubmission();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Atenção: Esta ação excluirá permanentemente esta resposta do banco de dados.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/submissions/${resolvedParams.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('Registro excluído!');
        router.push('/admin/dashboard');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (isLoading || !submission) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] text-[#172033] flex items-center justify-center">
        <div className="text-[#667085]">Carregando relatório de diagnóstico...</div>
      </div>
    );
  }

  const report = submission.diagnosticReport;
  const dims = report?.dimensions || ({} as any);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] font-sans print:bg-white">
      {/* Top Header Controls (Hidden on Print) */}
      <header className="bg-white border-b border-[#E2E7EF] h-16 sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#667085] hover:text-[#172033] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintPDF}
              className="px-4 py-2 bg-[#155EEF] hover:bg-[#0F3D91] text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Exportar PDF
            </button>

            {!submission.isAnonymized && (
              <button
                onClick={handleAnonymize}
                className="px-3.5 py-2 bg-white text-[#667085] border border-[#D0D5DD] hover:text-[#172033] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Anonimizar segundo a LGPD"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#155EEF]" />
                Anonimizar LGPD
              </button>
            )}

            <button
              onClick={handleDelete}
              className="p-2 text-[#667085] hover:text-[#D92D20] bg-white border border-[#D0D5DD] rounded-lg transition-colors cursor-pointer"
              title="Excluir Registro"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Company Header Card */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#E2E7EF] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E2E7EF]">
            <div>
              <span className="text-xs font-bold text-[#155EEF] uppercase tracking-wider block mb-1">
                Diagnóstico Oficial MPE Brasil (MEG® 19ª Ed.)
              </span>
              <h1 className="text-2xl font-bold text-[#172033]">
                {submission.companyInfo.companyName}
              </h1>
              {submission.companyInfo.tradeName && (
                <p className="text-sm text-[#667085]">
                  Nome Fantasia: {submission.companyInfo.tradeName}
                </p>
              )}
            </div>

            {/* Score Summary Box */}
            <div className="p-4 bg-[#F7F9FC] rounded-lg border border-[#E2E7EF] flex items-center gap-6">
              <div>
                <span className="text-xs font-semibold text-[#667085] block">Pontuação Total</span>
                <span className="text-2xl font-bold text-[#172033]">
                  {submission.scoreTotal} <span className="text-xs text-[#667085] font-normal">/ 111 pts</span>
                </span>
                <span className="block text-xs font-bold text-[#155EEF]">
                  ({submission.scorePercentage}% de Maturidade)
                </span>
              </div>

              <div className="border-l border-[#E2E7EF] pl-6">
                <span className="text-xs font-semibold text-[#667085] block">Nível de Gestão</span>
                <span className="inline-block px-3 py-1 bg-[#EFF6FF] text-[#155EEF] border border-[#155EEF]/30 text-xs font-bold rounded-md mt-1">
                  {submission.maturityLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Subheader Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#172033]">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#155EEF] shrink-0" />
              <div>
                <span className="text-[#667085] block text-[10px]">CNPJ</span>
                <strong className="font-mono">{submission.companyInfo.cnpj}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#155EEF] shrink-0" />
              <div>
                <span className="text-[#667085] block text-[10px]">Responsável</span>
                <strong>{submission.companyInfo.contactName} ({submission.companyInfo.contactRole})</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#155EEF] shrink-0" />
              <div>
                <span className="text-[#667085] block text-[10px]">Setor / UF</span>
                <strong>{submission.companyInfo.sectorCategory} • {submission.companyInfo.city}/{submission.companyInfo.state}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#155EEF] shrink-0" />
              <div>
                <span className="text-[#667085] block text-[10px]">Data do Diagnóstico</span>
                <strong>{new Date(submission.submittedAt).toLocaleDateString('pt-BR')}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher (Hidden on Print) */}
        <div className="flex items-center gap-3 border-b border-[#E2E7EF] pb-3 print:hidden">
          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'diagnostic'
                ? 'bg-[#155EEF] text-white'
                : 'bg-white text-[#667085] border border-[#D0D5DD] hover:text-[#172033]'
            }`}
          >
            <Award className="w-4 h-4" /> Relatório Diagnóstico MEG
          </button>

          <button
            onClick={() => setActiveTab('answers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'answers'
                ? 'bg-[#155EEF] text-white'
                : 'bg-white text-[#667085] border border-[#D0D5DD] hover:text-[#172033]'
            }`}
          >
            <FileText className="w-4 h-4" /> Inspeção de Respostas e Justificativas (37 Questões)
          </button>
        </div>

        {/* TAB 1: DIAGNOSTIC REPORT */}
        {activeTab === 'diagnostic' && (
          <div className="space-y-8">
            {/* 1. Resultado Geral */}
            <div className="bg-white rounded-xl p-6 border border-[#E2E7EF] space-y-3">
              <h2 className="text-lg font-bold text-[#172033]">1. Síntese do Nível de Maturidade</h2>
              <p className="text-sm text-[#667085] leading-relaxed">
                {report?.maturityDescription}
              </p>
            </div>

            {/* 2. Critérios Avaliados: Lista Ordenada dos 8 Critérios com Barra Horizontal Azul */}
            <div className="bg-white rounded-xl p-6 border border-[#E2E7EF] space-y-4">
              <h2 className="text-lg font-bold text-[#172033]">2. Desempenho por Critério do MEG®</h2>
              <div className="space-y-4">
                {(Object.keys(MEG_CRITERIA) as CriteriaId[]).map((cid) => {
                  const meta = MEG_CRITERIA[cid];
                  const dim = dims[cid];
                  if (!dim) return null;

                  return (
                    <div key={cid} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#172033] font-bold">{meta.name}</span>
                        <span className="text-[#667085]">
                          {dim.score} / {dim.maxScore} pts ({dim.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#E2E7EF] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#155EEF] h-full rounded-full transition-all duration-300"
                          style={{ width: `${dim.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Pontos Fortes Observados */}
            <div className="bg-white rounded-xl p-6 border border-[#E2E7EF] space-y-4">
              <h2 className="text-lg font-bold text-[#172033]">3. Pontos Fortes Identificados</h2>
              <div className="space-y-3">
                {(Object.keys(MEG_CRITERIA) as CriteriaId[]).map((cid) => {
                  const dim = dims[cid];
                  if (!dim || !dim.strengths || dim.strengths.length === 0) return null;

                  return (
                    <div key={cid} className="space-y-1">
                      <div className="text-xs font-bold text-[#155EEF]">{dim.criteriaName}</div>
                      <ul className="space-y-1 pl-1">
                        {dim.strengths.map((s: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-[#172033]">
                            <Check className="w-4 h-4 text-[#12B76A] shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Oportunidades de Melhoria */}
            <div className="bg-white rounded-xl p-6 border border-[#E2E7EF] space-y-4">
              <h2 className="text-lg font-bold text-[#172033]">4. Oportunidades de Melhoria</h2>
              <div className="space-y-3">
                {(Object.keys(MEG_CRITERIA) as CriteriaId[]).map((cid) => {
                  const dim = dims[cid];
                  if (!dim || !dim.opportunities || dim.opportunities.length === 0) return null;

                  return (
                    <div key={cid} className="space-y-1">
                      <div className="text-xs font-bold text-[#155EEF]">{dim.criteriaName}</div>
                      <ul className="space-y-1 pl-1">
                        {dim.opportunities.map((o: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-[#172033]">
                            <AlertTriangle className="w-4 h-4 text-[#F79009] shrink-0 mt-0.5" />
                            <span>{o}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Recomendações Estratégicas por Prioridade */}
            <div className="bg-white rounded-xl p-6 border border-[#E2E7EF] space-y-4">
              <h2 className="text-lg font-bold text-[#172033]">5. Recomendações Estratégicas</h2>
              <div className="space-y-4">
                {(Object.keys(MEG_CRITERIA) as CriteriaId[]).map((cid) => {
                  const dim = dims[cid];
                  if (!dim || !dim.recommendations || dim.recommendations.length === 0) return null;

                  return (
                    <div key={cid} className="space-y-1.5 p-3.5 bg-[#F7F9FC] rounded-lg border border-[#E2E7EF]">
                      <div className="text-xs font-bold text-[#172033]">{dim.criteriaName}</div>
                      <ul className="space-y-1 pl-1">
                        {dim.recommendations.map((r: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-[#667085]">
                            <Lightbulb className="w-4 h-4 text-[#155EEF] shrink-0 mt-0.5" />
                            <span className="text-[#172033]">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FULL ANSWERS INSPECTION */}
        {activeTab === 'answers' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#172033]">Inspeção das 37 Respostas e Justificativas</h2>

            <div className="space-y-4">
              {QUESTIONS.map((q) => {
                const ans = submission.answers[q.id];
                const opt = ans ? q.options.find((o) => o.id === ans.selectedOptionId) : null;

                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-xl p-6 border border-[#E2E7EF] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-[#155EEF] uppercase">{q.criteriaName}</span>
                        <h3 className="text-sm font-bold text-[#172033] mt-0.5">{q.title}</h3>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-3 py-1 bg-[#F7F9FC] text-[#172033] text-xs font-semibold rounded-md border border-[#E2E7EF]">
                          {opt ? `${opt.points} pts (Opção ${opt.id.toUpperCase()})` : 'Não Respondida'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#F7F9FC] rounded-lg border border-[#E2E7EF] text-xs text-[#172033]">
                      <strong>Resposta Selecionada:</strong> {opt ? opt.text : 'Nenhuma'}
                    </div>

                    {ans?.justificationText && (
                      <div className="p-3 bg-[#EFF6FF] rounded-lg border border-[#155EEF]/20 text-xs text-[#172033] space-y-1">
                        <strong className="block text-[#155EEF]">Justificativa Apresentada pela Empresa:</strong>
                        <p className="whitespace-pre-wrap">{ans.justificationText}</p>
                      </div>
                    )}

                    {ans?.resultData && (
                      <div className="p-3 bg-[#F7F9FC] rounded-lg border border-[#E2E7EF] text-xs text-[#172033] space-y-1">
                        <strong className="block text-[#172033]">Dados do Histórico de Resultados:</strong>
                        <div className="flex flex-wrap gap-4 pt-1 font-mono">
                          {ans.resultData.year1 && <span>Ano 1: {ans.resultData.year1}</span>}
                          {ans.resultData.year2 && <span>Ano 2: {ans.resultData.year2}</span>}
                          {ans.resultData.year3 && <span>Ano 3: {ans.resultData.year3}</span>}
                          {ans.resultData.calculatedMarginPercent && (
                            <span>Margem Calculada: {ans.resultData.calculatedMarginPercent}%</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
