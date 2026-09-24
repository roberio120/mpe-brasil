'use client';

import React, { useEffect, useRef } from 'react';
import { ShieldCheck, Lock, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onAccept: () => void;
  onClose?: () => void;
}

export default function LgpdConsentModal({ isOpen, onAccept, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const acceptBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      acceptBtnRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onClose) {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby="lgpd-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-[2px] animate-in fade-in duration-150"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-[#E2E7EF] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E2E7EF] flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#155EEF] shrink-0" />
          <h2 id="lgpd-modal-title" className="text-lg font-bold text-[#172033]">
            Termo de Consentimento e Privacidade (LGPD)
          </h2>
        </div>

        {/* Content Scroll */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-[#172033] leading-relaxed">
          <div className="flex items-start gap-3 p-4 bg-[#EFF6FF] rounded-lg border border-[#E2E7EF] text-xs text-[#172033]">
            <Lock className="w-4 h-4 shrink-0 text-[#155EEF] mt-0.5" />
            <div>
              <strong>Confidencialidade Garantida:</strong> Os dados e respostas fornecidos neste questionário são de acesso estritamente restrito à equipe técnica e administradores responsáveis pela avaliação empresarial.
            </div>
          </div>

          <p className="text-sm text-[#667085]">
            Ao prosseguir e preencher este Questionário de Autoavaliação MPE Brasil (baseado no Modelo de Excelência da Gestão® - MEG 19ª Ed.), você concorda com o tratamento dos dados pessoais e empresariais fornecidos, sob as seguintes condições:
          </p>

          <ol className="list-decimal pl-5 space-y-3 text-sm text-[#172033]">
            <li>
              <strong>Finalidade dos Dados:</strong> As informações coletadas serão utilizadas exclusivamente para fins de diagnóstico de maturidade de gestão da empresa, geração de análises estatísticas agregadas e contato por parte da equipe avaliadora.
            </li>
            <li>
              <strong>Sigilo Absoluto:</strong> Nenhuma informação de faturamento, respostas operacionais ou justificativas técnicas será divulgada publicamente ou compartilhada com terceiros sem autorização prévia.
            </li>
            <li>
              <strong>Armazenamento Seguro:</strong> Os dados são armazenados em servidores protegidos com criptografia, controle de acesso por autenticação forte e mecanismos de segurança contra ataques cibernéticos.
            </li>
            <li>
              <strong>Direitos do Titular:</strong> Você poderá, a qualquer momento, solicitar a atualização, correção ou anonimização dos seus dados pessoais cadastrados, em conformidade com o Artigo 18 da LGPD.
            </li>
          </ol>
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-[#F7F9FC] border-t border-[#E2E7EF] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[#667085]">
            Tempo estimado de preenchimento: ~20–25 minutos
          </span>

          <button
            ref={acceptBtnRef}
            onClick={onAccept}
            className="w-full sm:w-auto h-12 px-6 bg-[#155EEF] hover:bg-[#0F3D91] text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
          >
            <Check className="w-4 h-4" />
            Li, concordo e desejo iniciar
          </button>
        </div>
      </div>
    </div>
  );
}
