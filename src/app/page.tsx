'use client';

import React, { useState, useEffect } from 'react';
import { CompanyInfo, QuestionAnswer } from '@/types/mpe';
import LgpdConsentModal from '@/components/public/LgpdConsentModal';
import CompanyRegistrationStep from '@/components/public/CompanyRegistrationStep';
import QuestionnaireWizard from '@/components/public/QuestionnaireWizard';
import ThankYouScreen from '@/components/public/ThankYouScreen';
import {
  ShieldCheck,
  Clock,
  Lock,
  ArrowRight,
  CheckCircle2,
  LogIn,
} from 'lucide-react';
import Link from 'next/link';

export default function PublicHomePage() {
  const [stage, setStage] = useState<'landing' | 'company' | 'wizard' | 'completed'>('landing');
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [showLgpdModal, setShowLgpdModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: '',
    tradeName: '',
    cnpj: '',
    contactName: '',
    contactRole: '',
    email: '',
    phone: '',
    sectorCategory: '',
    state: '',
    city: '',
  });

  const [answers, setAnswers] = useState<Record<number, QuestionAnswer>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mpe_autoavaliacao_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.companyInfo) setCompanyInfo(parsed.companyInfo);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.lgpdAccepted) setLgpdAccepted(parsed.lgpdAccepted);
      }
    } catch (e) {
      console.error('Failed to load draft:', e);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(answers).length > 0 || companyInfo.companyName) {
      localStorage.setItem(
        'mpe_autoavaliacao_draft',
        JSON.stringify({ companyInfo, answers, lgpdAccepted })
      );
    }
  }, [companyInfo, answers, lgpdAccepted]);

  const handleStartFlow = () => {
    if (!lgpdAccepted) {
      setShowLgpdModal(true);
    } else {
      setStage('company');
    }
  };

  const handleLgpdAccept = () => {
    setLgpdAccepted(true);
    setShowLgpdModal(false);
    setStage('company');
  };

  const handleAnswerChange = (questionId: number, answer: QuestionAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmitQuestionnaire = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        companyInfo,
        lgpdConsented: lgpdAccepted,
        lgpdConsentedAt: new Date().toISOString(),
        answers,
      };

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erro ao enviar respostas.');
        setIsSubmitting(false);
        return;
      }

      setSubmissionId(data.submissionId);
      localStorage.removeItem('mpe_autoavaliacao_draft');
      setStage('completed');
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao enviar o questionário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setStage('landing');
    setSubmissionId('');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] font-sans selection:bg-[#155EEF] selection:text-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E7EF] h-16 sm:h-20 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Prêmio UNEB Excelência em Gestão"
              className="h-9 w-9 object-contain"
            />
            <div>
              <span className="font-extrabold text-base text-[#172033]">
                Prêmio UNEB Excelência em Gestão
              </span>
              <span className="hidden sm:inline text-xs text-[#667085] ml-2">
                Autoavaliação de Gestão • MEG 19ª Ed.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="hidden md:flex items-center gap-1.5 text-[#667085]">
              <ShieldCheck className="w-4 h-4 text-[#155EEF]" />
              Ambiente Seguro LGPD
            </div>

            <Link
              href="/admin/login"
              className="px-3.5 py-2 text-[#667085] hover:text-[#172033] border border-[#D0D5DD] hover:border-[#172033] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Acesso Administrativo
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <LgpdConsentModal
          isOpen={showLgpdModal}
          onAccept={handleLgpdAccept}
          onClose={() => setShowLgpdModal(false)}
        />

        {/* STAGE 0: Landing */}
        {stage === 'landing' && (
          <div className="space-y-16">
            {/* Hero Section */}
            <div className="space-y-8 max-w-3xl">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#172033] leading-tight">
                  Diagnóstico de Gestão e Competitividade Empresarial
                </h1>

                <p className="text-base sm:text-lg text-[#667085] leading-relaxed max-w-2xl">
                  Avalie a maturidade da sua empresa com base no Modelo de Excelência da Gestão (MEG 19ª Ed.) e identifique oportunidades de melhoria em liderança, estratégias, pessoas, processos e resultados.
                </p>
              </div>

              {/* Information Line with Vertical Thin Dividers */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 py-4 border-y border-[#E2E7EF] text-sm text-[#172033]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#155EEF]" />
                  <span><strong>20–25 min</strong>, Tempo estimado</span>
                </div>

                <div className="hidden sm:block w-px h-4 bg-[#E2E7EF]" />

                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#155EEF]" />
                  <span><strong>LGPD</strong>, Dados protegidos</span>
                </div>

                <div className="hidden sm:block w-px h-4 bg-[#E2E7EF]" />

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#155EEF]" />
                  <span><strong>37 questões</strong>, 8 critérios do MEG</span>
                </div>
              </div>

              {/* CTA Button */}
              <div>
                <button
                  onClick={handleStartFlow}
                  className="w-full sm:w-auto h-13 px-8 bg-[#155EEF] hover:bg-[#0F3D91] text-white font-semibold text-base rounded-lg transition-colors flex items-center justify-center gap-3 cursor-pointer"
                >
                  Começar minha autoavaliação
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Como Funciona Section */}
            <div className="space-y-6 pt-4 border-t border-[#E2E7EF]">
              <h2 className="text-lg font-bold text-[#172033]">Como funciona</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <span className="text-3xl font-bold text-[#155EEF]">01</span>
                  <h3 className="font-bold text-base text-[#172033]">Responda</h3>
                  <p className="text-sm text-[#667085] leading-relaxed">
                    Questões objetivas apresentadas de forma simples e guiada.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-3xl font-bold text-[#155EEF]">02</span>
                  <h3 className="font-bold text-base text-[#172033]">Analise</h3>
                  <p className="text-sm text-[#667085] leading-relaxed">
                    Suas respostas são organizadas conforme os critérios do MEG.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-3xl font-bold text-[#155EEF]">03</span>
                  <h3 className="font-bold text-base text-[#172033]">Identifique oportunidades</h3>
                  <p className="text-sm text-[#667085] leading-relaxed">
                    Visualize pontos de atenção e oportunidades de melhoria.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 1: Company Registration */}
        {stage === 'company' && (
          <CompanyRegistrationStep
            data={companyInfo}
            onChange={setCompanyInfo}
            onNext={() => setStage('wizard')}
          />
        )}

        {/* STAGE 2: Questionnaire Wizard */}
        {stage === 'wizard' && (
          <QuestionnaireWizard
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onBackToInfo={() => setStage('company')}
            onSubmit={handleSubmitQuestionnaire}
            isSubmitting={isSubmitting}
          />
        )}

        {/* STAGE 3: Completed Thank You */}
        {stage === 'completed' && (
          <ThankYouScreen
            companyName={companyInfo.companyName}
            submissionId={submissionId}
            onRestart={handleRestart}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E2E7EF] py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-[#667085] space-y-1">
          <img
            src="/logo.png"
            alt="Prêmio UNEB Excelência em Gestão"
            className="h-8 w-8 object-contain mx-auto mb-1"
          />
          <p className="font-semibold text-[#172033]">Prêmio UNEB Excelência em Gestão • Autoavaliação de Gestão</p>
          <p>MEG 19ª Ed. • Política de Privacidade • Termos de Uso em conformidade com a LGPD</p>
        </div>
      </footer>
    </div>
  );
}
