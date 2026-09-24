'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SubmissionRecord } from '@/types/mpe';
import { SECTOR_CATEGORIES, BRAZILIAN_STATES } from '@/lib/data/mpeQuestionnaire';
import {
  Award,
  LogOut,
  ShieldCheck,
  Search,
  FileSpreadsheet,
  Building2,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  Eye,
  Download,
} from 'lucide-react';
import Link from 'next/link';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [stats, setStats] = useState<any>(null);

  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [maturityFilter, setMaturityFilter] = useState('');

  const [twoFactor, setTwoFactor] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const meRes = await fetch('/api/admin/me');
      const meData = await meRes.json();

      if (!meRes.ok || !meData.authenticated) {
        router.push('/admin/login');
        return;
      }

      setAdminUser(meData.user);
      setTwoFactor(meData.user.twoFactorEnabled);

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (sectorFilter) params.append('sector', sectorFilter);
      if (stateFilter) params.append('state', stateFilter);
      if (maturityFilter) params.append('maturity', maturityFilter);

      const subRes = await fetch(`/api/admin/submissions?${params.toString()}`);
      const subData = await subRes.json();

      if (subRes.ok) {
        setSubmissions(subData.submissions || []);
        setStats(subData.stats || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, sectorFilter, stateFilter, maturityFilter]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleToggle2FA = async () => {
    try {
      const res = await fetch('/api/admin/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-2fa' }),
      });
      const data = await res.json();
      if (res.ok) {
        setTwoFactor(data.twoFactorEnabled);
        alert(`Verificação em duas etapas (2FA) ${data.twoFactorEnabled ? 'ATIVADA' : 'DESATIVADA'}.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const radarData = stats?.criteriaAverages
    ? [
        { subject: 'Liderança', score: stats.criteriaAverages.lideranca, fullMark: 100 },
        { subject: 'Estratégias', score: stats.criteriaAverages.estrategias, fullMark: 100 },
        { subject: 'Clientes', score: stats.criteriaAverages.clientes, fullMark: 100 },
        { subject: 'Sociedade', score: stats.criteriaAverages.sociedade, fullMark: 100 },
        { subject: 'Informação', score: stats.criteriaAverages.informacoes, fullMark: 100 },
        { subject: 'Pessoas', score: stats.criteriaAverages.pessoas, fullMark: 100 },
        { subject: 'Processos', score: stats.criteriaAverages.processos, fullMark: 100 },
        { subject: 'Resultados', score: stats.criteriaAverages.resultados, fullMark: 100 },
      ]
    : [];

  const barData = stats?.maturityDistribution
    ? [
        { name: 'Inicial', count: stats.maturityDistribution.Inicial, color: '#D92D20' },
        { name: 'Em Desenv.', count: stats.maturityDistribution['Em Desenvolvimento'], color: '#F79009' },
        { name: 'Intermediário', count: stats.maturityDistribution.Intermediário, color: '#155EEF' },
        { name: 'Avançado', count: stats.maturityDistribution.Avançado, color: '#7A5AF8' },
        { name: 'Excelência', count: stats.maturityDistribution.Excelência, color: '#12B76A' },
      ]
    : [];

  if (isLoading && !adminUser) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] text-[#172033] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#667085]">
          <RefreshCw className="w-5 h-5 animate-spin text-[#155EEF]" />
          <span>Carregando Painel Administrativo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] font-sans flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-white border-b border-[#E2E7EF] h-16 sm:h-20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-[#155EEF]" />
            <div>
              <span className="font-extrabold text-base text-[#172033]">
                Prêmio UNEB Excelência em Gestão
              </span>
              <span className="hidden md:inline text-xs text-[#667085] ml-3 border-l border-[#E2E7EF] pl-3">
                Diagnósticos MEG 19ª Edição
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 2FA Toggle */}
            <button
              onClick={handleToggle2FA}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer ${
                twoFactor
                  ? 'bg-[#EFF6FF] text-[#155EEF] border-[#155EEF]/30'
                  : 'bg-white text-[#667085] border-[#D0D5DD] hover:text-[#172033]'
              }`}
              title="Alternar Verificação em 2 Etapas"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              2FA: {twoFactor ? 'Ativado' : 'Desativado'}
            </button>

            {/* Export Excel */}
            <a
              href="/api/admin/export-excel"
              target="_blank"
              download
              className="px-3.5 py-1.5 bg-[#155EEF] hover:bg-[#0F3D91] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Exportar Excel
            </a>

            {/* Backup Full JSON */}
            <a
              href="/api/admin/backup"
              target="_blank"
              download
              className="px-3.5 py-1.5 bg-white border border-[#D0D5DD] hover:border-[#172033] text-[#172033] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              title="Baixar Backup Completo do Banco de Dados"
            >
              <Download className="w-3.5 h-3.5 text-[#155EEF]" />
              Backup JSON
            </a>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-[#667085] hover:text-[#D92D20] bg-white border border-[#D0D5DD] rounded-lg transition-colors cursor-pointer"
              title="Encerrar Sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-[#E2E7EF] space-y-2">
            <div className="flex items-center justify-between text-[#667085]">
              <span className="text-xs font-semibold uppercase tracking-wider">Total de Diagnósticos</span>
              <Building2 className="w-4 h-4 text-[#155EEF]" />
            </div>
            <div className="text-3xl font-bold text-[#172033]">{stats?.totalSubmissions || 0}</div>
            <p className="text-xs text-[#667085]">Empresas participantes registradas</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E7EF] space-y-2">
            <div className="flex items-center justify-between text-[#667085]">
              <span className="text-xs font-semibold uppercase tracking-wider">Média de Pontuação</span>
              <TrendingUp className="w-4 h-4 text-[#12B76A]" />
            </div>
            <div className="text-3xl font-bold text-[#172033]">
              {stats?.avgScore || 0} <span className="text-xs text-[#667085] font-normal">/ 111 pts</span>
            </div>
            <p className="text-xs text-[#12B76A] font-semibold">
              Maturidade Média: {stats?.avgPercentage || 0}%
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E7EF] space-y-2">
            <div className="flex items-center justify-between text-[#667085]">
              <span className="text-xs font-semibold uppercase tracking-wider">Setor Predominante</span>
              <Building2 className="w-4 h-4 text-[#155EEF]" />
            </div>
            <div className="text-base font-bold text-[#172033] truncate">{stats?.topSector || 'N/A'}</div>
            <p className="text-xs text-[#667085]">Maior volume de respondentes</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E7EF] space-y-2">
            <div className="flex items-center justify-between text-[#667085]">
              <span className="text-xs font-semibold uppercase tracking-wider">Segurança & LGPD</span>
              <ShieldCheck className="w-4 h-4 text-[#12B76A]" />
            </div>
            <div className="text-sm font-bold text-[#12B76A] flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Senhas Bcrypt + JWT
            </div>
            <p className="text-xs text-[#667085]">Anonimização habilitada</p>
          </div>
        </div>

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart: MEG 8 Criteria Averages */}
          <div className="bg-white p-6 rounded-xl border border-[#E2E7EF] space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Média Geral nos 8 Critérios do MEG®</h2>
              <p className="text-xs text-[#667085]">Percentual de maturidade atingido por critério (%)</p>
            </div>
            <div className="h-64 w-full">
              {stats?.totalSubmissions > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#E2E7EF" />
                    <PolarAngleAxis dataKey="subject" stroke="#667085" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#D0D5DD" fontSize={10} />
                    <Radar name="Maturidade %" dataKey="score" stroke="#155EEF" fill="#155EEF" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-[#667085]">
                  Nenhum diagnóstico registrado até o momento.
                </div>
              )}
            </div>
          </div>

          {/* Bar Chart: Maturity Level Distribution */}
          <div className="bg-white p-6 rounded-xl border border-[#E2E7EF] space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#172033]">Distribuição por Faixa de Maturidade</h2>
              <p className="text-xs text-[#667085]">Classificação das empresas avaliadas no sistema</p>
            </div>
            <div className="h-64 w-full">
              {stats?.totalSubmissions > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E7EF" />
                    <XAxis dataKey="name" stroke="#667085" fontSize={10} />
                    <YAxis stroke="#667085" fontSize={10} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E7EF', borderRadius: '8px', color: '#172033' }}
                      itemStyle={{ color: '#172033', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-[#667085]">
                  Aguardando primeiras submissões.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Respondents Table Section */}
        <div className="bg-white rounded-xl border border-[#E2E7EF] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#172033]">Lista de Empresas Respondentes</h2>
              <p className="text-xs text-[#667085]">Busca, filtros e acesso aos relatórios diagnósticos</p>
            </div>

            <button
              onClick={fetchData}
              className="p-2 text-[#667085] hover:text-[#172033] bg-white border border-[#D0D5DD] rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
              title="Atualizar lista"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#667085] absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por Empresa, CNPJ, Cidade..."
                className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-[#D0D5DD] rounded-lg outline-none focus:border-[#155EEF] text-[#172033] placeholder-[#667085]"
              />
            </div>

            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg outline-none focus:border-[#155EEF] text-[#172033]"
            >
              <option value="">Todos os Setores...</option>
              {SECTOR_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg outline-none focus:border-[#155EEF] text-[#172033]"
            >
              <option value="">Todas as UFs...</option>
              {BRAZILIAN_STATES.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>

            <select
              value={maturityFilter}
              onChange={(e) => setMaturityFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs bg-white border border-[#D0D5DD] rounded-lg outline-none focus:border-[#155EEF] text-[#172033]"
            >
              <option value="">Todas as Maturidades...</option>
              <option value="Inicial">Inicial (0-25%)</option>
              <option value="Em Desenvolvimento">Em Desenvolvimento (26-50%)</option>
              <option value="Intermediário">Intermediário (51-75%)</option>
              <option value="Avançado">Avançado (76-90%)</option>
              <option value="Excelência">Excelência (91-100%)</option>
            </select>
          </div>

          {/* Submissions Table */}
          <div className="overflow-x-auto rounded-lg border border-[#E2E7EF]">
            <table className="w-full text-left text-xs text-[#172033]">
              <thead className="bg-[#F7F9FC] text-[#667085] font-semibold uppercase tracking-wider border-b border-[#E2E7EF]">
                <tr>
                  <th className="p-3.5">Empresa / CNPJ</th>
                  <th className="p-3.5">Responsável / Contato</th>
                  <th className="p-3.5">Setor & UF</th>
                  <th className="p-3.5">Pontuação Total</th>
                  <th className="p-3.5">Maturidade MEG</th>
                  <th className="p-3.5">Data Envio</th>
                  <th className="p-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E7EF]">
                {submissions.length > 0 ? (
                  submissions.map((sub) => {
                    let badgeColor = 'bg-[#FEF3F2] text-[#D92D20] border-[#FECDCA]';
                    if (sub.maturityLevel === 'Em Desenvolvimento')
                      badgeColor = 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]';
                    else if (sub.maturityLevel === 'Intermediário')
                      badgeColor = 'bg-[#EFF6FF] text-[#155EEF] border-[#B2DDFF]';
                    else if (sub.maturityLevel === 'Avançado')
                      badgeColor = 'bg-[#F9F5FF] text-[#6941C6] border-[#E9D7FE]';
                    else if (sub.maturityLevel === 'Excelência')
                      badgeColor = 'bg-[#ECFDF3] text-[#027A48] border-[#ABE5C6]';

                    return (
                      <tr key={sub.id} className="hover:bg-[#F7F9FC] transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-[#172033]">{sub.companyInfo.companyName}</div>
                          <div className="text-[11px] text-[#667085] font-mono">{sub.companyInfo.cnpj}</div>
                        </td>
                        <td className="p-3.5">
                          <div>{sub.companyInfo.contactName}</div>
                          <div className="text-[11px] text-[#667085]">{sub.companyInfo.email}</div>
                        </td>
                        <td className="p-3.5">
                          <div>{sub.companyInfo.sectorCategory}</div>
                          <div className="text-[11px] text-[#667085]">
                            {sub.companyInfo.city} - {sub.companyInfo.state}
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-[#172033]">
                          {sub.scoreTotal} <span className="text-[10px] text-[#667085] font-normal">/ 111 pts</span>
                          <div className="text-[10px] text-[#155EEF] font-mono">({sub.scorePercentage}%)</div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                            {sub.maturityLevel}
                          </span>
                        </td>
                        <td className="p-3.5 text-[#667085]">
                          {new Date(sub.submittedAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-3.5 text-right">
                          <Link
                            href={`/admin/submissions/${sub.id}`}
                            className="px-3 py-1.5 bg-[#155EEF] hover:bg-[#0F3D91] text-white font-semibold rounded-md text-xs transition-colors inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" /> Ver Diagnóstico
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#667085]">
                      Nenhum registro encontrado com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
