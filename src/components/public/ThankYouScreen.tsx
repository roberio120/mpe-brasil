'use client';

import React from 'react';
import { Check, ShieldCheck, Building2, ArrowLeft } from 'lucide-react';

interface Props {
  companyName: string;
  submissionId: string;
  onRestart: () => void;
}

export default function ThankYouScreen({ companyName, submissionId, onRestart }: Props) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center py-8">
      <div className="bg-white rounded-xl p-8 sm:p-12 border border-[#E2E7EF] space-y-6">
        <div className="w-16 h-16 bg-[#EFF6FF] text-[#155EEF] rounded-full flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#172033]">
          Questionário Enviado com Sucesso!
        </h1>

        <p className="text-sm text-[#667085] max-w-lg mx-auto leading-relaxed">
          Obrigado por concluir a autoavaliação da <strong className="text-[#172033]">{companyName}</strong>. Suas respostas foram salvas com segurança e enviadas para análise técnica.
        </p>

        <div className="p-4 bg-[#F7F9FC] rounded-lg border border-[#E2E7EF] text-xs text-[#667085] flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#155EEF] shrink-0" />
            <span>Protocolo de Registro: <strong className="font-mono text-[#172033]">{submissionId}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-[#12B76A] font-semibold">
            <ShieldCheck className="w-4 h-4" /> Dados Criptografados (LGPD)
          </div>
        </div>

        <div className="p-5 bg-[#EFF6FF] rounded-lg border border-[#E2E7EF] text-xs text-[#172033] text-left space-y-2">
          <h3 className="font-bold text-sm text-[#172033]">Próximos passos</h3>
          <p className="text-[#667085]">
            Nossa equipe de consultores em gestão empresarial processará os dados nos 8 critérios do Modelo de Excelência da Gestão® (MEG 19ª Ed.) e consolidará o relatório oficial de diagnóstico da sua empresa.
          </p>
          <p className="text-[#667085]">
            Em breve, os avaliadores entrarão em contato para os próximos passos e devolutiva técnica personalizada.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={onRestart}
            className="h-11 px-6 bg-white hover:bg-[#F7F9FC] text-[#172033] border border-[#D0D5DD] font-semibold text-xs rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
}
