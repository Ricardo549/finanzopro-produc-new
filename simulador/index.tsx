
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Building2, 
  Wallet, 
  Sparkles, 
  Target,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-card rounded-3xl p-5 shadow-sm border border-border transition-colors ${className}`}>
    {children}
  </div>
);

interface SimulatorsPageProps {
  t: any;
  isPro: boolean;
  language: string;
}

const SimulatorsPage: React.FC<SimulatorsPageProps> = ({ t, isPro, language }) => {
  // Navigation Tabs for modes
  const [mode, setMode] = useState<'investment' | 'finance' | 'consortium' | 'compare'>('compare');
  
  // Unified Inputs for Comparison
  const [goal, setGoal] = useState('50000'); // Meta
  const [months, setMonths] = useState('60'); // Prazo
  
  // Rates for Comparison
  const [rateInv, setRateInv] = useState('1.0'); // 1% ao mês
  const [rateFin, setRateFin] = useState('1.8'); // 1.8% ao mês (aprox 23% a.a)
  const [rateCons, setRateCons] = useState('15'); // 15% taxa adm total

  // Individual Simulators State (Legacy/Specific)
  const [val1, setVal1] = useState('1000');
  const [val2, setVal2] = useState('200');
  const [val3, setVal3] = useState('12');
  const [val4, setVal4] = useState('1');
  const [financeType, setFinanceType] = useState<'SAC' | 'PRICE'>('SAC');
  const [specificResult, setSpecificResult] = useState<any>(null);

  // Derived Data for Chart
  const [chartData, setChartData] = useState<any[]>([]);

  // Calculate Comparison Data
  useEffect(() => {
    const target = parseFloat(goal) || 0;
    const term = parseInt(months) || 1;
    const rInv = (parseFloat(rateInv) || 0) / 100;
    const rFin = (parseFloat(rateFin) || 0) / 100;
    const rCons = (parseFloat(rateCons) || 0) / 100;

    if (target <= 0 || term <= 0) return;

    // 1. Investment Strategy: How much to deposit monthly to reach Goal?
    // FV = PMT * (((1 + r)^n - 1) / r) => PMT = FV / (((1 + r)^n - 1) / r)
    // Detailed: If we want to reach 'target', how much we pay out of pocket?
    // Cost = PMT * term.
    let invPmt = 0;
    if (rInv > 0) {
      invPmt = target / (((Math.pow(1 + rInv, term) - 1) / rInv));
    } else {
      invPmt = target / term;
    }
    const costInv = invPmt * term;

    // 2. Consortium Strategy: Pay target + fee over term.
    // Total Cost = Target * (1 + fee)
    const costCons = target * (1 + rCons);

    // 3. Financing Strategy (PRICE for simplicity in comparison): 
    // Loan = Target. Calculate PMT. Total = PMT * term.
    let finPmt = 0;
    if (rFin > 0) {
      finPmt = target * (rFin * Math.pow(1 + rFin, term)) / (Math.pow(1 + rFin, term) - 1);
    } else {
      finPmt = target / term;
    }
    const costFin = finPmt * term;

    setChartData([
      { name: language === 'pt-br' ? 'Investindo' : 'Investing', cost: costInv, color: '#10b981', label: 'Mais Barato' }, // Emerald
      { name: language === 'pt-br' ? 'Consórcio' : 'Consortium', cost: costCons, color: '#f59e0b', label: '' }, // Amber
      { name: language === 'pt-br' ? 'Financiamento' : 'Financing', cost: costFin, color: '#f43f5e', label: 'Mais Caro' }, // Rose
    ]);

  }, [goal, months, rateInv, rateFin, rateCons, language]);

  // Calculate Individual Simulator
  const calculateSpecific = () => {
    const v1 = parseFloat(val1) || 0;
    const v2 = parseFloat(val2) || 0;
    const v3 = parseInt(val3) || 0;
    const v4 = (parseFloat(val4) || 0) / 100;

    let total = 0;
    let monthly = 0;
    let detail = '';

    if (mode === 'investment') {
      // Future Value
      total = v1 * Math.pow(1 + v4, v3) + v2 * ((Math.pow(1 + v4, v3) - 1) / v4);
      detail = `Total acumulado em ${v3} meses.`;
    } else if (mode === 'finance') {
      const v4_calc = v2 / 100 / 12; // taxa anual -> mensal aprox
      if (financeType === 'PRICE') {
        const pmt = v1 * (v4_calc * Math.pow(1 + v4_calc, v3)) / (Math.pow(1 + v4_calc, v3) - 1);
        total = pmt * v3;
        monthly = pmt;
        detail = `Parcela fixa (PRICE) de R$ ${pmt.toFixed(2)}`;
      } else {
        const amort = v1 / v3;
        const firstPmt = amort + (v1 * v4_calc);
        // Aprox total for simplified view
        total = (firstPmt + amort + (amort * v4_calc)) / 2 * v3;
        monthly = firstPmt;
        detail = `Primeira parcela (SAC) de R$ ${firstPmt.toFixed(2)}`;
      }
    } else if (mode === 'consortium') {
      total = v1 + (v1 * v2 / 100);
      monthly = total / v3;
      detail = `Parcela estimada de R$ ${monthly.toFixed(2)} (Sem juros)`;
    }
    setSpecificResult({ total, monthly, detail });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(language === 'pt-br' ? 'pt-BR' : 'en-US', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="p-6 space-y-6 pb-24 animate-slide-up">
      <header>
        <h2 className="text-2xl font-black text-foreground">{t.title}</h2>
        <p className="text-xs text-muted font-bold mt-1">{language === 'pt-br' ? 'Ferramentas de Decisão Financeira' : 'Financial Decision Tools'}</p>
        
        <div className="grid grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mt-4">
          {[
            { id: 'compare', icon: BarChart3, label: 'Comparar' },
            { id: 'investment', icon: TrendingUp, label: t.investment },
            { id: 'finance', icon: Building2, label: t.finance },
            { id: 'consortium', icon: Wallet, label: t.consortium }
          ].map(m => (
            <button 
              key={m.id} 
              onClick={() => { setMode(m.id as any); setSpecificResult(null); }} 
              className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${mode === m.id ? 'bg-card shadow-sm text-primary ring-2 ring-primary/10' : 'text-muted hover:text-foreground'}`}
            >
              <m.icon size={18} />
              <span className="text-[8px] font-black uppercase text-center leading-tight">{m.label}</span>
            </button>
          ))}
        </div>
      </header>

      {mode === 'compare' ? (
        <div className="space-y-6 animate-slide-up">
          <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none relative overflow-hidden">
            <div className="relative z-10 space-y-4">
               <div className="flex items-center gap-2">
                 <Target className="text-amber-300" size={24} />
                 <h3 className="font-black text-lg uppercase tracking-wider">{language === 'pt-br' ? 'Defina sua Meta' : 'Set your Goal'}</h3>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[9px] font-bold text-white/70 uppercase tracking-widest">{language === 'pt-br' ? 'Valor do Bem (R$)' : 'Value (R$)'}</label>
                   <input 
                    type="number" 
                    value={goal} 
                    onChange={e => setGoal(e.target.value)} 
                    className="w-full bg-white/10 border border-white/20 p-3 rounded-xl outline-none font-black text-xl text-white placeholder-white/30 focus:bg-white/20 transition-all"
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[9px] font-bold text-white/70 uppercase tracking-widest">{language === 'pt-br' ? 'Prazo (Meses)' : 'Term (Months)'}</label>
                   <input 
                    type="number" 
                    value={months} 
                    onChange={e => setMonths(e.target.value)} 
                    className="w-full bg-white/10 border border-white/20 p-3 rounded-xl outline-none font-black text-xl text-white placeholder-white/30 focus:bg-white/20 transition-all"
                   />
                 </div>
               </div>

               {/* Advanced Rates Toggle/Inputs could go here, simplified for UI */}
               <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-[8px] text-white/60 uppercase">{language === 'pt-br' ? 'Rentabilidade' : 'Yield'}</p>
                    <input value={rateInv} onChange={e => setRateInv(e.target.value)} className="w-full bg-transparent text-center font-bold text-xs text-emerald-300 outline-none" placeholder="1.0" />
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] text-white/60 uppercase">{language === 'pt-br' ? 'Taxa Adm' : 'Adm Fee'}</p>
                    <input value={rateCons} onChange={e => setRateCons(e.target.value)} className="w-full bg-transparent text-center font-bold text-xs text-amber-300 outline-none" placeholder="15" />
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] text-white/60 uppercase">{language === 'pt-br' ? 'Juros Fin.' : 'Loan Interest'}</p>
                    <input value={rateFin} onChange={e => setRateFin(e.target.value)} className="w-full bg-transparent text-center font-bold text-xs text-rose-300 outline-none" placeholder="1.8" />
                  </div>
               </div>
            </div>
            <Sparkles className="absolute -top-10 -right-10 text-white/5 rotate-45" size={200} />
          </Card>

          <Card className="space-y-2">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-black text-foreground text-sm uppercase flex items-center gap-2">
                 <BarChart3 size={16} className="text-primary"/> 
                 {language === 'pt-br' ? 'Custo Total para Atingir a Meta' : 'Total Cost to Reach Goal'}
               </h3>
             </div>
             
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card shadow-xl border border-border p-3 rounded-xl">
                              <p className="text-xs font-black text-foreground mb-1">{payload[0].payload.name}</p>
                              <p className="text-primary font-bold">{formatCurrency(payload[0].value as number)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="cost" radius={[8, 8, 0, 0]} animationDuration={1000}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList dataKey="cost" position="top" formatter={(val: number) => `R$ ${(val/1000).toFixed(1)}k`} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#64748b' }} />
                    </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>

             <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2 border border-border">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{t.analyze}</p>
                <div className="flex gap-3 text-xs leading-relaxed">
                   <div className="min-w-1 w-1 bg-primary rounded-full"></div>
                   <p className="text-muted italic">
                      {language === 'pt-br' 
                        ? `Brother, se liga: Pagaríamos ${formatCurrency(chartData[2]?.cost)} financiando, mas apenas ${formatCurrency(chartData[0]?.cost)} se tivermos paciência para investir. Uma economia de ${formatCurrency(chartData[2]?.cost - chartData[0]?.cost)}!`
                        : `Brother, look: We'd pay ${formatCurrency(chartData[2]?.cost)} by financing, but only ${formatCurrency(chartData[0]?.cost)} if we invest patiently. That's ${formatCurrency(chartData[2]?.cost - chartData[0]?.cost)} in savings!`}
                   </p>
                </div>
             </div>
          </Card>
        </div>
      ) : (
        /* Legacy Modes */
        <Card className="space-y-4 animate-slide-up">
           <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest">{mode === 'investment' ? t.initial : (mode === 'finance' ? 'Valor Total' : 'Valor do Bem')}</label>
              <input type="number" value={val1} onChange={e => setVal1(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-border p-3 rounded-xl outline-none font-bold text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest">{mode === 'investment' ? t.monthly : (mode === 'finance' ? 'Taxa Anual (%)' : 'Taxa Adm (%)')}</label>
              <input type="number" value={val2} onChange={e => setVal2(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-border p-3 rounded-xl outline-none font-bold text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[10px] font-black text-muted uppercase tracking-widest">{language === 'pt-br' ? 'Meses' : 'Months'}</label><input type="number" value={val3} onChange={e => setVal3(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-border p-3 rounded-xl outline-none font-bold text-sm" /></div>
            {mode === 'finance' ? (
              <div className="space-y-1"><label className="text-[10px] font-black text-muted uppercase tracking-widest">Sistema</label><select value={financeType} onChange={e => setFinanceType(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-900 border border-border p-3 rounded-xl outline-none font-bold text-sm"><option value="SAC">SAC</option><option value="PRICE">PRICE</option></select></div>
            ) : mode === 'investment' ? (
              <div className="space-y-1"><label className="text-[10px] font-black text-muted uppercase tracking-widest">Taxa Mensal (%)</label><input type="number" value={val4} onChange={e => setVal4(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-border p-3 rounded-xl outline-none font-bold text-sm" /></div>
            ) : (
               <div className="space-y-1"><label className="text-[10px] font-black text-muted uppercase tracking-widest">Reserva (%)</label><input type="number" value="2" disabled className="w-full bg-slate-100 dark:bg-slate-800 border border-border p-3 rounded-xl outline-none font-bold text-sm opacity-50" /></div>
            )}
          </div>
          <button onClick={calculateSpecific} className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">{language === 'pt-br' ? 'Calcular' : 'Calculate'}</button>
          
          {specificResult && (
             <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-primary/20 text-center space-y-2 animate-slide-up">
                <p className="text-[10px] font-black text-muted uppercase">{t.result}</p>
                <h3 className="text-3xl font-black text-primary">{formatCurrency(specificResult.total)}</h3>
                <p className="text-[10px] font-bold text-muted">{specificResult.detail}</p>
             </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default SimulatorsPage;
