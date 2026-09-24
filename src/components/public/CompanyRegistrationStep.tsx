'use client';

import React, { useState } from 'react';
import { CompanyInfo } from '@/types/mpe';
import { SECTOR_CATEGORIES, BRAZILIAN_STATES } from '@/lib/data/mpeQuestionnaire';
import { isValidCNPJ, formatCNPJ } from '@/lib/utils/validators';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface Props {
  data: CompanyInfo;
  onChange: (data: CompanyInfo) => void;
  onNext: () => void;
}

export default function CompanyRegistrationStep({ data, onChange, onNext }: Props) {
  const [cnpjError, setCnpjError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'cnpj') {
      const formatted = formatCNPJ(value);
      onChange({
        ...data,
        cnpj: formatted,
      });

      // Clear or validate error on typing if 14 digits reached
      const cleanDigits = formatted.replace(/\D/g, '');
      if (cleanDigits.length === 14) {
        if (!isValidCNPJ(formatted)) {
          setCnpjError('CNPJ inválido. Por favor, verifique os números digitados.');
        } else {
          setCnpjError('');
        }
      } else if (cleanDigits.length > 0) {
        setCnpjError('O CNPJ deve conter 14 dígitos válidos.');
      } else {
        setCnpjError('');
      }
      return;
    }

    onChange({
      ...data,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !data.companyName ||
      !data.cnpj ||
      !data.contactName ||
      !data.contactRole ||
      !data.email ||
      !data.phone ||
      !data.sectorCategory ||
      !data.state ||
      !data.city
    ) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validate CNPJ strictly before proceeding
    if (!isValidCNPJ(data.cnpj)) {
      setCnpjError('CNPJ inválido. Por favor, informe um CNPJ válido da Receita Federal.');
      alert('O CNPJ informado é inválido. Por favor, insira um CNPJ válido para prosseguir.');
      return;
    }

    setCnpjError('');
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Progress Step Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E2E7EF] text-xs font-semibold">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#155EEF]">
            <span className="w-6 h-6 rounded-full bg-[#155EEF] text-white flex items-center justify-center text-[11px] font-bold">
              01
            </span>
            <span className="font-bold text-[#172033]">Identificação</span>
          </div>

          <div className="flex items-center gap-2 text-[#667085]">
            <span className="w-6 h-6 rounded-full bg-[#E2E7EF] text-[#667085] flex items-center justify-center text-[11px]">
              02
            </span>
            <span>Autoavaliação</span>
          </div>

          <div className="flex items-center gap-2 text-[#667085]">
            <span className="w-6 h-6 rounded-full bg-[#E2E7EF] text-[#667085] flex items-center justify-center text-[11px]">
              03
            </span>
            <span>Diagnóstico</span>
          </div>
        </div>

        <span className="text-[#667085]">Etapa 1 de 3</span>
      </div>

      {/* Header Info */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-[#172033]">Identificação da empresa</h2>
        <p className="text-sm text-[#667085]">
          Informe os dados institucionais necessários para iniciar o diagnóstico.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 sm:p-8 border border-[#E2E7EF] space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Company Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#172033]">
              Razão Social / Nome da Empresa *
            </label>
            <input
              type="text"
              name="companyName"
              value={data.companyName || ''}
              onChange={handleChange}
              placeholder="Ex: Alfa Soluções Tecnológicas Ltda"
              required
              className="w-full h-12 px-4 text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#172033] placeholder-[#667085] focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 outline-none transition"
            />
          </div>

          {/* Trade Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#172033]">
              Nome Fantasia (Opcional)
            </label>
            <input
              type="text"
              name="tradeName"
              value={data.tradeName || ''}
              onChange={handleChange}
              placeholder="Ex: Alfa Tech"
              className="w-full h-12 px-4 text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#172033] placeholder-[#667085] focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 outline-none transition"
            />
          </div>

          {/* CNPJ with Strict Validation */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#172033]">
              CNPJ (Válido) *
            </label>
            <input
              type="text"
              name="cnpj"
              value={data.cnpj || ''}
              onChange={handleChange}
              placeholder="00.000.000/0001-91"
              maxLength={18}
              required
              className={`w-full h-12 px-4 text-sm bg-white border rounded-lg text-[#172033] placeholder-[#667085] outline-none transition font-mono ${
                cnpjError
                  ? 'border-[#D92D20] focus:border-[#D92D20] focus:ring-2 focus:ring-[#D92D20]/20'
                  : 'border-[#D0D5DD] focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20'
              }`}
            />
            {cnpjError && (
              <div className="flex items-center gap-1.5 text-xs text-[#D92D20] font-medium pt-0.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{cnpjError}</span>
              </div>
            )}
          </div>

          {/* Sector Category */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#172033]">
              Categoria / Setor de Atuação *
            </label>
            <select
              name="sectorCategory"
              value={data.sectorCategory || ''}
              onChange={handleChange}
              required
              className="w-full h-12 px-4 text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#172033] focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 outline-none transition"
            >
              <option value="">Selecione o setor...</option>
              {SECTOR_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#172033]">
              Nome do Responsável *
            </label>
            <input
              type="text"
              name="contactName"
              value={data.contactName || ''}
              onChange={handleChange}
              placeholder="Ex: João Silva"
              required
              className="w-full h-12 px-4 text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#172033] placeholder-[#667085] focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 outline-none transition"
            />
          </div>

          {/* Contact Role */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#172033]">
              Cargo / Função na Empresa *
            </label>
            <input
              type="text"
              name="contactRole"
              value={data.contactRole || ''}
              onChange={handleChange}
              placeholder="Ex: Diretor Geral / Proprietário"
              required
              className="w-full h-12 px-4 text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#172033] placeholder-[#667085] focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 outline-none transition"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#172033]">
              E-mail Institucional *
            </label>
            <input
              type="email"
              name="email"
              value={data.email || ''}
              onChange={handleChange}
              placeholder="diretoria@empresa.com.br"
              required
              className="w-full h-12 px-4 text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#172033] placeholder-[#667085] focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 outline-none transition"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#172033]">
              Telefone / WhatsApp *
            </label>
            <input
              type="tel"
              name="phone"
              value={data.phone || ''}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              required
              className="w-full h-12 px-4 text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#172033] placeholder-[#667085] focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 outline-none transition"
            />
          </div>

          {/* State */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#172033]">
              Estado (UF) *
            </label>
            <select
              name="state"
              value={data.state || ''}
              onChange={handleChange}
              required
              className="w-full h-12 px-4 text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#172033] focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 outline-none transition"
            >
              <option value="">UF...</option>
              {BRAZILIAN_STATES.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#172033]">
              Cidade *
            </label>
            <input
              type="text"
              name="city"
              value={data.city || ''}
              onChange={handleChange}
              placeholder="Ex: São Paulo"
              required
              className="w-full h-12 px-4 text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#172033] placeholder-[#667085] focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 outline-none transition"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-[#E2E7EF] flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto h-12 px-8 bg-[#155EEF] hover:bg-[#0F3D91] text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            Avançar para o Questionário
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
