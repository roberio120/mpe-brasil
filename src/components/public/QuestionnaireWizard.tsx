'use client';

import React, { useState } from 'react';
import { QUESTIONS, MEG_CRITERIA } from '@/lib/data/mpeQuestionnaire';
import { QuestionAnswer, ResultTableData } from '@/types/mpe';
import {
  HelpCircle,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  Send,
  Save,
  AlertCircle,
  FileSpreadsheet,
  Calculator,
  Check,
} from 'lucide-react';

interface Props {
  answers: Record<number, QuestionAnswer>;
  onAnswerChange: (questionId: number, answer: QuestionAnswer) => void;
  onBackToInfo: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function QuestionnaireWizard({
  answers,
  onAnswerChange,
  onBackToInfo,
  onSubmit,
  isSubmitting,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(true);

  const currentQuestion = QUESTIONS[currentIndex];
  const currentCriteria = MEG_CRITERIA[currentQuestion.criteriaId];
  const currentAnswer = answers[currentQuestion.id] || {
    questionId: currentQuestion.id,
    selectedOptionId: undefined,
  };

  const totalQuestions = QUESTIONS.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const [savedToast, setSavedToast] = useState(false);

  const handleOptionSelect = (optionId: 'a' | 'b' | 'c' | 'd') => {
    const updated: QuestionAnswer = {
      ...currentAnswer,
      questionId: currentQuestion.id,
      selectedOptionId: optionId,
    };
    onAnswerChange(currentQuestion.id, updated);
    triggerAutoSaveToast();
  };

  const handleJustificationChange = (text: string) => {
    const updated: QuestionAnswer = {
      ...currentAnswer,
      justificationText: text,
    };
    onAnswerChange(currentQuestion.id, updated);
    triggerAutoSaveToast();
  };

  const handleResultDataChange = (field: keyof ResultTableData, value: string) => {
    const currentRes = currentAnswer.resultData || {};
    const updatedRes = { ...currentRes, [field]: value };

    if (currentQuestion.isProfitMargin && (field === 'annualRevenue' || field === 'totalCostsAndExpenses')) {
      const rev = parseFloat(updatedRes.annualRevenue?.replace(',', '.') || '0');
      const costs = parseFloat(updatedRes.totalCostsAndExpenses?.replace(',', '.') || '0');
      if (rev > 0) {
        const margin = ((rev - costs) / rev) * 100;
        updatedRes.calculatedMarginPercent = margin.toFixed(2);
      }
    }

    onAnswerChange(currentQuestion.id, {
      ...currentAnswer,
      resultData: updatedRes,
    });
    triggerAutoSaveToast();
  };

  const triggerAutoSaveToast = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);
  };

  const validateCurrentStep = (): boolean => {
    if (!currentAnswer.selectedOptionId) {
      alert('Por favor, selecione uma das opções de resposta para avançar.');
      return false;
    }

    if (
      currentQuestion.justificationRequiredFor &&
      currentQuestion.justificationRequiredFor.includes(currentAnswer.selectedOptionId as any)
    ) {
      if (!currentAnswer.justificationText || currentAnswer.justificationText.trim().length < 5) {
        alert(
          'Para a alternativa selecionada (c ou d), é obrigatória a apresentação de justificativa com informações sobre as práticas da empresa.'
        );
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBackToInfo();
    }
  };

  const isJustificationRequired =
    currentQuestion.justificationRequiredFor &&
    currentAnswer.selectedOptionId &&
    currentQuestion.justificationRequiredFor.includes(currentAnswer.selectedOptionId as any);

  const isResultsTableRequired =
    currentQuestion.requiresResultsTable &&
    currentAnswer.selectedOptionId &&
    ['b', 'c', 'd'].includes(currentAnswer.selectedOptionId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Thin Blue Progress Bar */}
      <div className="bg-white rounded-xl p-6 border border-[#E2E7EF] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider block">
              Autoavaliação de Gestão
            </span>
            <span className="text-sm font-bold text-[#172033]">
              Questão {currentIndex + 1 < 10 ? `0${currentIndex + 1}` : currentIndex + 1} de {totalQuestions}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {savedToast && (
              <span className="text-xs text-[#12B76A] font-semibold flex items-center gap-1">
                <Save className="w-3.5 h-3.5" /> Progresso salvo
              </span>
            )}
            <span className="text-xs font-bold text-[#155EEF]">{progressPercent}% concluído</span>
          </div>
        </div>

        {/* Thin Blue Progress Bar with accessibility attributes */}
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="w-full bg-[#E2E7EF] h-1.5 rounded-full overflow-hidden"
        >
          <div
            className="bg-[#155EEF] h-full transition-all duration-200 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#E2E7EF] space-y-6">
        {/* Criterion Label & Question H2 */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[#155EEF] uppercase tracking-wider">
            Critério: {currentCriteria.name}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172033] leading-snug">
            {currentQuestion.title}
          </h2>
        </div>

        {/* Support Explanation & Examples Box */}
        <div className="bg-[#F7F9FC] rounded-lg border border-[#E2E7EF] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#EFF6FF]/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#155EEF] uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              Entenda o que a pergunta quer dizer & Exemplos práticos
            </div>
            <span className="text-xs text-[#667085] font-semibold">
              {showExplanation ? 'Ocultar' : 'Exibir'}
            </span>
          </button>

          {showExplanation && (
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-[#E2E7EF] text-sm text-[#172033] leading-relaxed">
              <p>{currentQuestion.explanation}</p>
              {currentQuestion.example && (
                <div className="flex items-start gap-2.5 p-3.5 bg-white rounded-lg border border-[#E2E7EF] text-xs text-[#172033]">
                  <Lightbulb className="w-4 h-4 shrink-0 text-[#155EEF] mt-0.5" />
                  <div>{currentQuestion.example}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Options List */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-[#667085] uppercase tracking-wider">
            Selecione a alternativa correspondente à sua empresa:
          </label>
          <div className="space-y-3" role="radiogroup" aria-label={currentQuestion.title}>
            {currentQuestion.options.map((option) => {
              const isSelected = currentAnswer.selectedOptionId === option.id;

              return (
                <div
                  key={option.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => handleOptionSelect(option.id)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleOptionSelect(option.id);
                    }
                  }}
                  className={`p-4 sm:p-5 rounded-lg border transition-all cursor-pointer flex items-start gap-3.5 min-h-[52px] ${
                    isSelected
                      ? 'border-[#155EEF] bg-[#EFF6FF] text-[#172033]'
                      : 'border-[#E2E7EF] bg-white hover:border-[#D0D5DD] text-[#172033]'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-[#155EEF] bg-[#155EEF] text-white'
                          : 'border-[#D0D5DD] bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="flex-1 text-sm font-medium leading-relaxed">
                    {option.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mandatory Justification Textarea */}
        {isJustificationRequired && (
          <div className="p-4 bg-[#F7F9FC] rounded-lg border border-[#E2E7EF] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#172033]">
              <AlertCircle className="w-4 h-4 text-[#155EEF]" />
              Justificativa Obrigatória (para alternativa {currentAnswer.selectedOptionId?.toUpperCase()})
            </div>
            <p className="text-xs text-[#667085]">
              {currentQuestion.justificationPrompt ||
                'Apresente informações e evidências sobre as práticas de gestão adotadas pela empresa.'}
            </p>
            <textarea
              rows={4}
              value={currentAnswer.justificationText || ''}
              onChange={(e) => handleJustificationChange(e.target.value)}
              placeholder="Descreva detalhadamente as práticas e meios utilizados pela sua empresa..."
              required
              className="w-full p-3 text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#172033] placeholder-[#667085] focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 outline-none transition"
            />
          </div>
        )}

        {/* Results Table Input for Q32 to Q36 */}
        {isResultsTableRequired && (
          <div className="p-4 bg-[#F7F9FC] rounded-lg border border-[#E2E7EF] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#172033]">
              <FileSpreadsheet className="w-4 h-4 text-[#155EEF]" />
              Tabela de Histórico de Resultados (Últimos 3 Anos)
            </div>
            <p className="text-xs text-[#667085]">
              {currentQuestion.resultsTableHelp ||
                'Informe os valores apurados pela empresa para avaliação da tendência.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Ano 1 (Ex: 2023)
                </label>
                <input
                  type="text"
                  value={currentAnswer.resultData?.year1 || ''}
                  onChange={(e) => handleResultDataChange('year1', e.target.value)}
                  placeholder="Ex: 85%"
                  className="w-full h-10 px-3 text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#172033] placeholder-[#667085] outline-none focus:border-[#155EEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Ano 2 (Ex: 2024)
                </label>
                <input
                  type="text"
                  value={currentAnswer.resultData?.year2 || ''}
                  onChange={(e) => handleResultDataChange('year2', e.target.value)}
                  placeholder="Ex: 88%"
                  className="w-full h-10 px-3 text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#172033] placeholder-[#667085] outline-none focus:border-[#155EEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Ano 3 (Ex: 2025)
                </label>
                <input
                  type="text"
                  value={currentAnswer.resultData?.year3 || ''}
                  onChange={(e) => handleResultDataChange('year3', e.target.value)}
                  placeholder="Ex: 92%"
                  className="w-full h-10 px-3 text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#172033] placeholder-[#667085] outline-none focus:border-[#155EEF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Profit Margin Calculator for Q37 */}
        {currentQuestion.isProfitMargin && currentAnswer.selectedOptionId && currentAnswer.selectedOptionId !== 'a' && (
          <div className="p-4 bg-[#F7F9FC] rounded-lg border border-[#E2E7EF] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#172033]">
              <Calculator className="w-4 h-4 text-[#155EEF]" />
              Prêmio UNEB Excelência em Gestão · Calculadora de Margem de Lucro
            </div>
            <p className="text-xs text-[#667085]">
              Fórmula MPE: Margem (%) = &#123;[Receita Bruta - (Custos + Despesas Totais)] ÷ Receita Bruta&#125; × 100
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Receita Anual Bruta (R$)
                </label>
                <input
                  type="text"
                  value={currentAnswer.resultData?.annualRevenue || ''}
                  onChange={(e) => handleResultDataChange('annualRevenue', e.target.value)}
                  placeholder="Ex: 500000"
                  className="w-full h-10 px-3 text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#172033] placeholder-[#667085] outline-none focus:border-[#155EEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Custos + Despesas Totais (R$)
                </label>
                <input
                  type="text"
                  value={currentAnswer.resultData?.totalCostsAndExpenses || ''}
                  onChange={(e) => handleResultDataChange('totalCostsAndExpenses', e.target.value)}
                  placeholder="Ex: 400000"
                  className="w-full h-10 px-3 text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#172033] placeholder-[#667085] outline-none focus:border-[#155EEF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Margem Calculada
                </label>
                <div className="h-10 px-3 flex items-center text-sm font-bold text-[#155EEF] bg-white border border-[#D0D5DD] rounded-lg">
                  {currentAnswer.resultData?.calculatedMarginPercent
                    ? `${currentAnswer.resultData.calculatedMarginPercent}%`
                    : 'Aguardando valores...'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Controls */}
        <div className="pt-6 border-t border-[#E2E7EF] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrev}
            className="w-full sm:w-auto h-12 px-6 bg-white hover:bg-[#F7F9FC] text-[#172033] border border-[#D0D5DD] font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto h-12 px-8 bg-[#155EEF] hover:bg-[#0F3D91] text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Próxima Pergunta
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (validateCurrentStep()) onSubmit();
              }}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 px-8 bg-[#12B76A] hover:bg-[#0E9355] text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Enviando Diagnóstico...' : 'Finalizar e Enviar Questionário'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
