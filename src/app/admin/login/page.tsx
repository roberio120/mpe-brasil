'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldAlert, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@mpebrasil.com.br');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Credenciais inválidas.');
        setIsLoading(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao conectar ao servidor.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] flex items-center justify-center p-4 selection:bg-[#155EEF] selection:text-white">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#667085] hover:text-[#172033] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao formulário público
        </Link>

        <div className="bg-white rounded-xl p-8 border border-[#E2E7EF] space-y-6">
          <div className="text-center space-y-2">
            <Award className="w-10 h-10 text-[#155EEF] mx-auto" />
            <h1 className="text-2xl font-bold text-[#172033]">Painel Administrativo</h1>
            <p className="text-xs text-[#667085]">
              Acesso restrito aos gestores e avaliadores do Prêmio UNEB Excelência em Gestão
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-[#FEF3F2] border border-[#FECDCA] rounded-lg text-xs text-[#D92D20] flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#D92D20] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#172033]">
                E-mail Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#667085] absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mpebrasil.com.br"
                  required
                  className="w-full h-12 pl-10 pr-4 text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#172033] placeholder-[#667085] focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#172033]">
                Senha Forte
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#667085] absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full h-12 pl-10 pr-4 text-sm bg-white border border-[#D0D5DD] rounded-lg text-[#172033] placeholder-[#667085] focus:border-[#155EEF] focus:ring-2 focus:ring-[#155EEF]/20 outline-none transition"
                />
              </div>
            </div>

            <div className="p-3 bg-[#F7F9FC] border border-[#E2E7EF] rounded-lg text-[11px] text-[#667085] space-y-1">
              <div className="font-bold text-[#172033] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#155EEF]" /> Credenciais de Teste Padrão:
              </div>
              <p>E-mail: <code className="bg-white px-1 rounded border border-[#E2E7EF] font-mono text-[#172033]">admin@mpebrasil.com.br</code></p>
              <p>Senha: <code className="bg-white px-1 rounded border border-[#E2E7EF] font-mono text-[#172033]">Admin123!@#</code></p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#155EEF] hover:bg-[#0F3D91] text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? 'Autenticando...' : 'Entrar no Painel Protegido'}
            </button>
          </form>
        </div>

        <div className="text-center text-[11px] text-[#667085]">
          Sessão com limite de tempo e criptografia (bcrypt + JWT HTTP-Only)
        </div>
      </div>
    </div>
  );
}
