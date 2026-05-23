import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, 
  Briefcase, Calendar, CheckCircle, AlertCircle, Users, 
  Activity, Sparkles, SlidersHorizontal, BarChart3, HelpCircle, 
  Coins, ShoppingBag, ShieldAlert, CheckSquare, RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { InsuranceCase, InsuranceType } from '../types';

interface BusinessReportsProps {
  cases: InsuranceCase[];
  onClose: () => void;
  agencyName?: string;
  typeColors?: Record<InsuranceType, string>;
}

export default function BusinessReports({ cases, onClose, agencyName = 'BIMA Agency', typeColors }: BusinessReportsProps) {
  // Filters for the reports engine
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Available seasons/years dynamic discovery
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    cases.forEach(c => {
      if (c.policyDate) {
        const yr = c.policyDate.split('-')[0];
        if (yr) years.add(yr);
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [cases]);

  // Filtered dataset specifically for calculation inside reports
  const filteredCasesForReports = useMemo(() => {
    return cases.filter(c => {
      const yearMatch = selectedYear === 'all' || (c.policyDate && c.policyDate.startsWith(selectedYear));
      const categoryMatch = selectedCategory === 'all' || c.insuranceType === selectedCategory;
      return yearMatch && categoryMatch;
    });
  }, [cases, selectedYear, selectedCategory]);

  // 1. High-Level Summary Cards Calculations
  const metrics = useMemo(() => {
    let rawPremium = 0;
    let totalWithGst = 0;
    let grossBrokerage = 0;
    let myShare = 0;
    let agentShareTotal = 0;
    let agentSharePaid = 0;
    let agentShareUnpaid = 0;
    
    filteredCasesForReports.forEach(c => {
      rawPremium += c.premiumAmount;
      totalWithGst += c.totalAmountWithGst;
      grossBrokerage += c.totalCommissionReceived;
      myShare += c.myCommissionAmount;
      agentShareTotal += c.agentCommissionAmount;
      
      if (c.agentCommissionAmount > 0) {
        if (c.agentPaymentStatus === 'paid') {
          agentSharePaid += c.agentCommissionAmount;
        } else {
          agentShareUnpaid += c.agentCommissionAmount;
        }
      }
    });

    return {
      rawPremium,
      totalWithGst,
      grossBrokerage,
      myShare,
      agentShareTotal,
      agentSharePaid,
      agentShareUnpaid,
      avgCommissionRate: grossBrokerage && rawPremium ? (grossBrokerage / rawPremium) * 100 : 0
    };
  }, [filteredCasesForReports]);

  // 2. Chronological Monthly Trend Aggregation (brokerage vs kept vs agent)
  const monthlyTrendData = useMemo(() => {
    const monthlyGroups: Record<string, { monthKey: string; monthLabel: string; gross: number; advisor: number; agent: number; count: number }> = {};
    
    // Seed groups to ensure chronological sorting
    // Format policyDate: YYYY-MM-DD
    filteredCasesForReports.forEach(c => {
      if (!c.policyDate) return;
      const [year, month] = c.policyDate.split('-');
      if (!year || !month) return;
      
      const key = `${year}-${month}`;
      const monthsMap: Record<string, string> = {
        '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
        '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
      };
      
      const label = `${monthsMap[month] || month} ${year.slice(2)}`;
      
      if (!monthlyGroups[key]) {
        monthlyGroups[key] = {
          monthKey: key,
          monthLabel: label,
          gross: 0,
          advisor: 0,
          agent: 0,
          count: 0
        };
      }
      
      monthlyGroups[key].gross += c.totalCommissionReceived;
      monthlyGroups[key].advisor += c.myCommissionAmount;
      monthlyGroups[key].agent += c.agentCommissionAmount;
      monthlyGroups[key].count += 1;
    });

    // Convert to sorted array
    return Object.values(monthlyGroups).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [filteredCasesForReports]);

  // 3. Category distribution (Motor, Health, Life, Loan)
  const categoryChartData = useMemo(() => {
    const categoryTotals: Record<string, { name: string; value: number; color: string; count: number }> = {
      motor: { name: 'Motor', value: 0, color: '#3b82f6', count: 0 },
      health: { name: 'Health', value: 0, color: '#10b981', count: 0 },
      life: { name: 'Life', value: 0, color: '#f59e0b', count: 0 },
      loan: { name: 'Loan Protection', value: 0, color: '#8b5cf6', count: 0 }
    };
    
    filteredCasesForReports.forEach(c => {
      const type = c.insuranceType;
      if (categoryTotals[type]) {
        categoryTotals[type].value += c.totalCommissionReceived;
        categoryTotals[type].count += 1;
      }
    });

    return Object.values(categoryTotals).filter(item => item.value > 0);
  }, [filteredCasesForReports]);

  // 4. Sub-Agent Payment Settlement Health Status
  const agentPaymentChartData = useMemo(() => {
    return [
      { name: 'Settled / Paid', value: Math.round(metrics.agentSharePaid), color: '#10b981' },
      { name: 'Outstanding', value: Math.round(metrics.agentShareUnpaid), color: '#f59e0b' }
    ].filter(v => v.value > 0);
  }, [metrics]);

  // Insurer Provider Leaderboard
  const insurerBreakdown = useMemo(() => {
    const insurers: Record<string, { provider: string; activePolicies: number; netPremium: number; brokerage: number }> = {};
    
    filteredCasesForReports.forEach(c => {
      const provider = c.companyName || 'Unknown Provider';
      if (!insurers[provider]) {
        insurers[provider] = {
          provider,
          activePolicies: 0,
          netPremium: 0,
          brokerage: 0
        };
      }
      insurers[provider].activePolicies += 1;
      insurers[provider].netPremium += c.premiumAmount;
      insurers[provider].brokerage += c.totalCommissionReceived;
    });

    return Object.values(insurers).sort((a, b) => b.brokerage - a.brokerage).slice(0, 5);
  }, [filteredCasesForReports]);

  // Format currency in Indian notation
  const formatCurrency = (val: number) => {
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  // Dynamic colors for the donut charts
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#14b8a6'];

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-2xl text-xs space-y-1.5 font-sans leading-none">
          <p className="font-bold border-b border-slate-800 pb-1 mb-1 text-slate-300">{label}</p>
          {payload.map((pld: any) => (
            <div key={pld.name} className="flex items-center gap-2 justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: pld.fill || pld.color }} />
                <span className="text-slate-400 capitalize">{pld.name}:</span>
              </span>
              <span className="font-semibold font-mono">{formatCurrency(pld.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 lg:p-8 relative space-y-8 shadow-xl animate-fadeIn">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl text-white">
              <BarChart3 className="w-5 h-5" />
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Dynamic Business Reports</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 font-sans tracking-tight flex items-center gap-2">
            <span>Advisor Portfolio Performance</span>
            <span className="text-slate-300 font-normal">|</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-mono tracking-tight capitalize">{agencyName}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Real-time analytical graphs mapping brokerage earnings, sub-agent commissions, and operational margins.</p>
        </div>

        {/* Action Controls & Close */}
        <div className="flex items-center gap-2 self-start md:self-center">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-slate-200/50"
          >
            <span>Close Reports</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Analytical Filters Control Bar */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-tight">Interactive Filters</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Year filtering selection */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Calendar Years</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr} Portfolio</option>
              ))}
            </select>
          </div>

          {/* Category filtering selector */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Category Products</option>
              <option value="motor">🏍 Motor Insurance Only</option>
              <option value="health">💖 Health Insurance Only</option>
              <option value="life">🛡 Life Insurance Only</option>
              <option value="loan">💰 Loan Protection Only</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(selectedYear !== 'all' || selectedCategory !== 'all') && (
            <button
              onClick={() => { setSelectedYear('all'); setSelectedCategory('all'); }}
              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Portfolio Performance KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
        {/* Total Collected Premium */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] uppercase font-bold tracking-wider">Premium Vol. (With GST)</span>
              <Coins className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span className="text-base md:text-xl font-bold font-mono tracking-tight text-slate-800 mt-1 block">
              {formatCurrency(metrics.totalWithGst)}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-sans border-t border-slate-200/30 pt-1.5">
            Base raw: {formatCurrency(metrics.rawPremium)}
          </p>
        </div>

        {/* Gross Portfolio Brokerage */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-indigo-700">
              <span className="text-[10px] uppercase font-bold tracking-wider">Gross Brokerage Rec.</span>
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <span className="text-base md:text-xl font-extrabold font-mono tracking-tight text-indigo-900 mt-1 block">
              {formatCurrency(metrics.grossBrokerage)}
            </span>
          </div>
          <p className="text-[10px] text-indigo-600 mt-2 font-semibold font-sans border-t border-slate-200/30 pt-1.5">
            Average margin: {metrics.avgCommissionRate.toFixed(1)}% of Net
          </p>
        </div>

        {/* Net Revenue Kept (My Revenue) */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-4 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-emerald-100">
              <span className="text-[10px] uppercase font-bold tracking-wider">My Kept Net Revenue</span>
              <CheckSquare className="w-3.5 h-3.5 text-emerald-200" />
            </div>
            <span className="text-base md:text-xl font-extrabold font-mono tracking-tight mt-1 block">
              {formatCurrency(metrics.myShare)}
            </span>
          </div>
          <p className="text-[10px] text-emerald-100 mt-2 border-t border-emerald-500/30 pt-1.5 flex items-center justify-between">
            <span>Rentability efficiency:</span>
            <span>{metrics.grossBrokerage ? Math.round((metrics.myShare / metrics.grossBrokerage) * 100) : 0}%</span>
          </p>
        </div>

        {/* Sub-Agent Distributed Commission & Balances */}
        <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] uppercase font-bold tracking-wider">Sub-Agent Share</span>
              <Users className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <span className="text-base md:text-xl font-extrabold font-mono tracking-tight text-orange-400 mt-1 block">
              {formatCurrency(metrics.agentShareTotal)}
            </span>
          </div>
          <div className="text-[9px] text-slate-300 mt-2 border-t border-slate-800 pt-1.5 flex justify-between gap-1">
            <span className="text-teal-400">Paid: {formatCurrency(metrics.agentSharePaid)}</span>
            <span className="text-amber-400 font-bold animate-pulse">Pending: {formatCurrency(metrics.agentShareUnpaid)}</span>
          </div>
        </div>
      </div>

      {/* No Data Fallback */}
      {filteredCasesForReports.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl space-y-2">
          <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-600">No cases found in this filter range.</p>
          <p className="text-[10px] text-slate-400">Restore or add active policy records to begin analytics modeling.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 4. Primary Chart: Monthly Trend Analytics */}
          <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-indigo-500" /> Monthly Brokerage & Payout Distributions
                </h3>
                <p className="text-[10px] text-slate-400">Chronological analysis of incoming provider payouts mapped against kept shares and agent commissions.</p>
              </div>
            </div>

            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyTrendData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorAdvisor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="monthLabel" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    fontWeight={600} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle" 
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" name="Incoming Payouts" dataKey="gross" stroke="#3b82f6" strokeWidth={1} fillOpacity={1} fill="url(#colorGross)" />
                  <Bar name="Kept net commission" dataKey="advisor" fill="url(#colorAdvisor)" radius={[4, 4, 0, 0]} barSize={28} />
                  <Line type="monotone" name="Sub-Agent commission" dataKey="agent" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 1 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5. Sub Charts Columns (Category Split & Payout Distribution) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Column A: Product split distribution */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> Commission by Product Type
                </h4>
                <p className="text-[10px] text-slate-400 mb-4">Percentage allocation of total incoming brokerage across sectors.</p>
              </div>

              {categoryChartData.length === 0 ? (
                <div className="text-center p-6 text-slate-400 text-xs italic">No sector data to map</div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-44 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total earned</span>
                      <span className="text-xs font-bold font-mono text-slate-800">{formatCurrency(metrics.grossBrokerage)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 w-full mt-2 text-[10px] border-t border-slate-50 pt-3">
                    {categoryChartData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-1.5 justify-start">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-500 font-semibold truncate capitalize">{entry.name}</span>
                        <span className="font-mono text-slate-400 text-[9px]">({entry.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chart Column B: Sub-Agent Settlement Health */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> Sub-Agent Payment Settlement
                </h4>
                <p className="text-[10px] text-slate-400 mb-4">Visual status index mapping settled sub-agent payouts against outstanding dues.</p>
              </div>

              {metrics.agentShareTotal === 0 ? (
                <div className="text-center p-8 bg-slate-50 rounded-2xl text-slate-400 text-xs italic">
                  No sub-agent commissions computed in this range.
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-44 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={agentPaymentChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {agentPaymentChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Dues</span>
                      <span className="text-xs font-bold font-mono text-slate-850">{formatCurrency(metrics.agentShareTotal)}</span>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-around w-full mt-2 text-[10px] border-t border-slate-50 pt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-slate-500 font-semibold">Paid:</span>
                      <span className="font-mono text-emerald-600 font-bold">{formatCurrency(metrics.agentSharePaid)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-slate-500 font-semibold">Outstanding:</span>
                      <span className="font-mono text-amber-600 font-bold">{formatCurrency(metrics.agentShareUnpaid)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chart Column C: Real Insurer Breakdown Tracker */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" /> Top Insurance Providers
                </h4>
                <p className="text-[10px] text-slate-400 mb-4">Provider companies ranked by gross brokerage generated.</p>
              </div>

              {insurerBreakdown.length === 0 ? (
                <div className="text-center p-6 text-slate-400 text-xs italic">No provider data</div>
              ) : (
                <div className="space-y-2.5">
                  {insurerBreakdown.map((item, idx) => {
                    const pctOfTotal = metrics.grossBrokerage ? Math.round((item.brokerage / metrics.grossBrokerage) * 100) : 0;
                    return (
                      <div key={item.provider} className="text-xs space-y-1">
                        <div className="flex justify-between font-semibold text-slate-705">
                          <span className="text-[11px] truncate">{idx + 1}. {item.provider}</span>
                          <span className="font-mono text-[10px] text-indigo-700">{formatCurrency(item.brokerage)}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${pctOfTotal}%` }} 
                          />
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-slate-400">
                          <span>{item.activePolicies} policy records</span>
                          <span>{pctOfTotal}% share</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* 6. Dynamic Narrative Bullet Advisory Box */}
          <div className="bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-200/40 p-4 rounded-2xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-tight">System Smart Summary & Portfolio Insights</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-600 leading-relaxed">
                <div>
                  <p>• <strong>Most Lucrative Segment:</strong> {categoryChartData.length > 0 
                    ? `Commission is highest in the ${categoryChartData.sort((a,b) => b.value - a.value)[0]?.name} insurance block (${formatCurrency(categoryChartData[0]?.value)} total brokerage earnings).` 
                    : 'Add policy records to identify your most profitable product class.'}
                  </p>
                  <p className="mt-1">• <strong>Outstanding Agent Debt:</strong> {metrics.agentShareUnpaid > 0 
                    ? `You currently have ${formatCurrency(metrics.agentShareUnpaid)} in outstanding commission obligations due to sub-agents. Active settlement is recommended.` 
                    : 'Sub-agent accounts are fully settled. Commission debt standing is currently clear!'}
                  </p>
                </div>
                <div>
                  <p>• <strong>Volume Capacity metrics:</strong> Your portfolio has generated {filteredCasesForReports.length} insurance policies with a total collected volume premium of close to {formatCurrency(metrics.totalWithGst)} (with taxes included).</p>
                  <p className="mt-1">• <strong>Brokerage Efficiency:</strong> Your average brokerage rate is approximately <strong>{metrics.avgCommissionRate.toFixed(1)}%</strong> on base premium amounts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
