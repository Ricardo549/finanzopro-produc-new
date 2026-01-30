
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Home,
  Calculator,
  PlusCircle,
  FileText,
  User,
  Target,
  TrendingUp,
  Coffee,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Scan,
  MessageSquare,
  Sparkles,
  Plus,
  Check,
  X,
  PieChart as PieIcon,
  BarChart3,
  TrendingDown,
  Info,
  Wallet,
  Calendar as CalendarIcon,
  Clock,
  TrendingUp as TrendingUpIcon,
  Tag,
  Camera,
  RefreshCw,
  Repeat,
  History,
  Filter,
  ArrowRight,
  Zap,
  Maximize,
  Settings,
  Moon,
  Sun,
  Monitor,
  Globe,
  Palette,
  ShieldCheck,
  Lock,
  LogOut,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  CreditCard,
  QrCode,
  Bitcoin,
  Award,
  Building2,
  Percent
} from 'lucide-react';
import { callFinanzoAI } from './services/geminiService';
import { Transaction, Project, ChartDataPoint } from './types';
import SimulatorsPage from './simulador';

// --- CONFIGURAÇÃO DE CORES ---

const PALETTE_MAP: Record<string, string> = {
  indigo: '#4f46e5',
  emerald: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b',
  slate: '#475569',
  violet: '#8b5cf6',
};

// --- TRADUÇÕES COMPLETAS ---

const TRANSLATIONS: Record<string, any> = {
  'pt-br': {
    nav: { home: 'Home', sim: 'Simular', entries: 'Faturas', admin: 'Ajustes' },
    dash: { greet: 'Fala, brother!', sub: 'Bora decolar hoje?', mission: 'Missão de Hoje', coffee_title: 'Desafio do Café ☕', coffee_text: 'Mano, se liga: se trocar o café da rua por um em casa hoje, você aporta **R$ 15** a mais no seu projeto. Partiu?', coffee_cta: 'Aceitar Desafio', income: 'RECEITAS', expense: 'DESPESAS', projects: 'Projetos Ativos', view_all: 'Ver todos' },
    entries: { title: 'Lançamentos', sub: 'Se liga no que tá saindo da conta...', scanner: 'Scanner IA', manual: 'Manual', camera: 'Câmera', text: 'Texto', upload: 'Arquivo', open_scanner: 'Abrir Scanner', scan_cta: 'DETECTAR AGORA', history: 'Histórico', filters: 'Filtros', start: 'Início', end: 'Fim', save: 'Salvar no Fluxo', desc_placeholder: 'Ex: Churrasco da Firma', val_placeholder: '0,00', launch_cta: 'Lançar Agora', category: 'Categoria', freq: 'Frequência', once: 'Única', monthly: 'Mensal', yearly: 'Anual', paste_info: 'Clique para upload ou cole (Ctrl+V)' },
    admin: { title: 'Ajustes da Firma', sub: 'Configure sua experiência, brother.', level: 'Nível Investidor Pro', style: 'Aparência e Estilo', theme: 'Tema do App', theme_light: 'Claro', theme_dark: 'Escuro', theme_hybrid: 'Híbrido', color: 'Cor da Firma', lang: 'Idioma', current_lang: 'Português (Brasil)', security: 'Segurança e Blindagem', biometrics: 'Login Biométrico', '2fa': 'Autenticação 2FA', pass: 'Alterar Senha de Acesso', logout: 'Sair da Firma' },
    sim: { title: 'Simuladores', investment: 'Investimento', finance: 'Financiamento', consortium: 'Consórcio', initial: 'Valor Inicial', monthly: 'Valor Mensal', result: 'Resultado Estimado', analyze: 'Veredito Brother IA' }
  },
  'en': {
    nav: { home: 'Home', sim: 'Simulate', entries: 'Bills', admin: 'Settings' },
    dash: { greet: 'Hey, brother!', sub: 'Ready to take off?', mission: 'Today\'s Mission', coffee_title: 'Coffee Challenge ☕', coffee_text: 'Look, if you swap that street coffee for one at home today, you save **$15** more for your project. Deal?', coffee_cta: 'Accept Challenge', income: 'INCOME', expense: 'EXPENSES', projects: 'Active Projects', view_all: 'View all' },
    entries: { title: 'Transactions', sub: 'Watch what\'s leaving your account...', scanner: 'AI Scanner', manual: 'Manual', camera: 'Camera', text: 'Text', upload: 'File', open_scanner: 'Open Scanner', scan_cta: 'DETECT NOW', history: 'History', filters: 'Filters', start: 'Start', end: 'End', save: 'Save to Flow', desc_placeholder: 'Ex: Company BBQ', val_placeholder: '0.00', launch_cta: 'Launch Now', category: 'Category', freq: 'Frequency', once: 'Once', monthly: 'Monthly', yearly: 'Yearly', paste_info: 'Click to upload or paste (Ctrl+V)' },
    admin: { title: 'HQ Settings', sub: 'Setup your experience, brother.', level: 'Pro Investor Level', style: 'Style & Appearance', theme: 'App Theme', theme_light: 'Light', theme_dark: 'Dark', theme_hybrid: 'Hybrid', color: 'Company Color', lang: 'Language', current_lang: 'English (US)', security: 'Security & Shield', biometrics: 'Biometric Login', '2fa': '2FA Auth', pass: 'Change Password', logout: 'Logout' },
    sim: { title: 'Simulators', investment: 'Investment', finance: 'Financing', consortium: 'Consortium', initial: 'Initial Value', monthly: 'Monthly Value', result: 'Estimated Result', analyze: 'AI Brother Verdict' }
  }
};

// --- COMPONENTES DE UI ---

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-card rounded-3xl p-5 shadow-sm border border-border transition-colors ${className}`}>
    {children}
  </div>
);

const ProgressBar: React.FC<{ progress: number, color?: string }> = ({ progress, color = "bg-primary" }) => (
  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
    <div className="h-full bg-primary transition-all duration-700" style={{ width: `${Math.min(100, progress)}%` }} />
  </div>
);

// --- TELA DE LOGIN ---

const LoginPage: React.FC<{ onLogin: (isPro: boolean) => void, onUpgrade: () => void, language: string }> = ({ onLogin, onUpgrade, language }) => (
  <div className="min-h-screen bg-background flex flex-col p-10 justify-center animate-slide-up text-foreground">
    <div className="mb-14 text-center">
      <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary/30 mb-8 mx-auto">
        <TrendingUp size={40} />
      </div>
      <h1 className="text-4xl font-black tracking-tighter mb-2">Finanzo <span className="text-primary">Pro</span></h1>
      <p className="text-muted font-medium text-sm">{language === 'pt-br' ? 'Seu consultor financeiro "brother".' : 'Your financial advisor "brother".'}</p>
    </div>
    <div className="space-y-4 max-w-sm mx-auto w-full">
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 mb-2">
        <Sparkles size={18} className="text-emerald-500" />
        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Acesso Pro Detectado</span>
      </div>
      <input type="email" placeholder="E-mail" defaultValue="brother@finanzo.pro" className="w-full bg-card border border-border p-5 rounded-3xl outline-none text-foreground focus:ring-2 focus:ring-primary/40 transition-all shadow-sm" />
      <input type="password" placeholder="Senha" defaultValue="********" className="w-full bg-card border border-border p-5 rounded-3xl outline-none text-foreground focus:ring-2 focus:ring-primary/40 transition-all shadow-sm" />
      <button onClick={() => onLogin(true)} className="w-full bg-primary text-white p-5 rounded-3xl font-black text-lg shadow-xl shadow-primary/20 active:scale-[0.98] transition-all">
        {language === 'pt-br' ? 'Entrar como Pro' : 'Enter as Pro'}
      </button>
    </div>
  </div>
);

// --- DASHBOARD ---

const Dashboard: React.FC<{ t: any, isPro: boolean }> = ({ t, isPro }) => {
  const [projects] = useState<Project[]>([
    { id: '1', name: t.projects === 'Active Projects' ? 'Emergency Fund' : 'Reserva Emergência', targetAmount: 20000, currentAmount: 14500, icon: '🛡️' },
    { id: '2', name: t.projects === 'Active Projects' ? 'New Car' : 'Carro Novo', targetAmount: 85000, currentAmount: 32000, icon: '🚗' }
  ]);
  return (
    <div className="p-6 space-y-6 pb-24 animate-slide-up">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-muted text-xs font-black uppercase tracking-widest">{t.greet}</h2>
          <p className="text-2xl font-black text-foreground">{t.sub}</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
          <Award size={14} className="text-primary" />
          <span className="text-[9px] font-black text-primary uppercase">Membro Pro</span>
        </div>
      </header>
      <Card className="bg-primary text-white border-none shadow-primary/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3"><Sparkles size={18} className="text-amber-300" /><span className="text-xs font-black uppercase tracking-wider opacity-80">{t.mission}</span></div>
          <h3 className="text-lg font-bold mb-2">{t.coffee_title}</h3>
          <p className="text-white/80 text-sm mb-4 leading-relaxed">{t.coffee_text}</p>
          <button className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-xl text-xs font-black active:scale-95 transition-all">{t.coffee_cta}</button>
        </div>
        <Coffee className="absolute -right-6 -bottom-6 opacity-10 rotate-12" size={160} />
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col gap-1 border-emerald-500/10 bg-emerald-500/[0.02]"><ArrowUpRight size={20} className="text-emerald-500 mb-1" /><span className="text-[10px] text-muted font-black uppercase">{t.income}</span><span className="text-lg font-black text-foreground">R$ 12.450</span></Card>
        <Card className="flex flex-col gap-1 border-rose-500/10 bg-rose-500/[0.02]"><ArrowDownLeft size={20} className="text-rose-500 mb-1" /><span className="text-[10px] text-muted font-black uppercase">{t.expense}</span><span className="text-lg font-black text-foreground">R$ 4.120</span></Card>
      </div>
      <section className="space-y-4">
        <h3 className="font-black text-foreground flex items-center gap-2 text-xs uppercase"><Target size={18} className="text-primary" /> {t.projects}</h3>
        {projects.map(p => (
          <Card key={p.id} className="active:scale-[0.99] transition-transform cursor-pointer">
            <div className="flex items-center gap-4 mb-3">
              <div className="text-2xl">{p.icon}</div>
              <div className="flex-1"><h4 className="font-bold text-foreground text-sm">{p.name}</h4><p className="text-[10px] text-muted font-bold uppercase">Meta: R$ {p.targetAmount.toLocaleString()}</p></div>
              <span className="text-sm font-black text-primary">{Math.round((p.currentAmount / p.targetAmount) * 100)}%</span>
            </div>
            <ProgressBar progress={(p.currentAmount / p.targetAmount) * 100} />
          </Card>
        ))}
      </section>
    </div>
  );
};

// --- SIMULATORS ---



// --- ENTRIES (FULL PRO SCANNER) ---

const EntriesPage: React.FC<{ t: any, isPro: boolean }> = ({ t, isPro }) => {
  const [activeTab, setActiveTab] = useState<'Manual' | 'Scanner'>('Manual');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Extra');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const [categoriesList, setCategoriesList] = useState(['Essencial', 'Estilo de Vida', 'Investimento', 'Extra']);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', description: t.title === 'Transactions' ? 'Monthly Grocery' : 'Mercado Mensal', amount: 850.40, date: '2023-10-25', category: 'Essencial', establishment: 'Pão de Açúcar' },
    { id: '2', description: t.title === 'Transactions' ? 'Streaming' : 'Assinatura Stream', amount: 55.90, date: '2023-10-24', category: 'Lazer', establishment: 'Netflix' },
  ]);

  const handleManualPost = () => {
    if (!description || !amount) return;

    let finalCategory = selectedCategory;
    if (selectedCategory === 'custom') {
      finalCategory = newCategoryName.trim() || 'Outro';
      // Adicionar à lista se for nova
      if (!categoriesList.includes(finalCategory)) {
        setCategoriesList(prev => [...prev, finalCategory]);
      }
    }

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      description,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      category: finalCategory,
      establishment: ''
    };

    setTransactions(prev => [newTx, ...prev]);

    // Reset Form
    setDescription('');
    setAmount('');
    setSelectedCategory(finalCategory); // Deixar a recém criada selecionada
    setNewCategoryName('');
    setShowNewCategoryInput(false);
  };

  return (
    <div className="p-6 space-y-6 pb-24 animate-slide-up">
      <header><h2 className="text-2xl font-black text-foreground">{t.title}</h2></header>
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
        {(['Manual', 'Scanner'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? 'bg-card shadow-sm text-primary' : 'text-muted'}`}>{tab === 'Scanner' ? t.scanner : t.manual}</button>
        ))}
      </div>
      {activeTab === 'Scanner' ? (
        <Card className="py-12 text-center space-y-6 flex flex-col items-center">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-emerald-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-24 h-24 bg-card border-2 border-primary border-dashed rounded-[2rem] flex items-center justify-center text-primary group-active:scale-90 transition-all">
              <Camera size={40} />
            </div>
          </div>
          <div>
            <p className="text-xs font-black text-foreground uppercase tracking-widest">{t.open_scanner}</p>
            <p className="text-[10px] text-muted mt-1 px-8">Posicione o cupom no centro da câmera para leitura via IA Finanzo.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            <button className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-border text-muted active:scale-95 transition-all"><Upload size={14} /> <span className="text-[9px] font-black uppercase">Arquivo</span></button>
            <button className="flex items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-border text-muted active:scale-95 transition-all"><MessageSquare size={14} /> <span className="text-[9px] font-black uppercase">Texto</span></button>
          </div>
        </Card>
      ) : (
        <Card className="space-y-4">
          <input value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl outline-none text-foreground border border-border text-sm" placeholder={t.desc_placeholder} />

          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">{t.category}</label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={e => {
                  setSelectedCategory(e.target.value);
                  setShowNewCategoryInput(e.target.value === 'custom');
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl outline-none text-foreground border border-border text-sm appearance-none cursor-pointer pr-10"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="custom">+ Criar nova categoria...</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={16} />
            </div>

            {showNewCategoryInput && (
              <div className="flex gap-2 animate-slide-up">
                <input
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl outline-none text-foreground border-2 border-primary/30 text-sm"
                  placeholder="Ex: Assinaturas, Hobby..."
                  autoFocus
                />
                <button onClick={() => { setShowNewCategoryInput(false); setSelectedCategory('Extra'); }} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-muted hover:text-rose-500 transition-colors">
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-xl outline-none font-black text-lg text-foreground border border-border" placeholder="0,00" />

          <button onClick={handleManualPost} className="w-full bg-primary text-white p-4 rounded-3xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">{t.launch_cta}</button>
        </Card>
      )}
      <section className="space-y-3">
        {transactions.map(tx => (
          <div key={tx.id} className="flex items-center gap-4 p-4 bg-card rounded-3xl border border-border shadow-sm active:scale-98 transition-transform cursor-pointer">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-primary bg-primary/10"><Tag size={18} /></div>
            <div className="flex-1"><h4 className="font-bold text-foreground text-xs">{tx.description}</h4><p className="text-[9px] font-bold text-muted uppercase">{tx.category}</p></div>
            <span className="font-black text-sm">R$ {tx.amount.toFixed(2)}</span>
          </div>
        ))}
      </section>
    </div>
  );
};

// --- SETTINGS PAGE ---

const SettingsPage: React.FC<{
  primaryColor: string, setPrimaryColor: (c: string) => void,
  secondaryColor: string, setSecondaryColor: (c: string) => void, // NEW
  theme: string, setTheme: (t: string) => void,
  language: 'pt-br' | 'en', setLanguage: (l: 'pt-br' | 'en') => void,
  t: any, onLogout: () => void
}> = ({ primaryColor, setPrimaryColor, secondaryColor, setSecondaryColor, theme, setTheme, language, setLanguage, t, onLogout }) => {
  const [biometrics, setBiometrics] = useState(true);

  return (
    <div className="p-6 space-y-8 pb-24 animate-slide-up">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground">{t.title}</h2>
          <p className="text-muted text-sm font-medium">{t.sub}</p>
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20"><User size={24} /></div>
      </header>

      <div className="p-4 bg-gradient-to-r from-primary to-emerald-500 rounded-3xl text-white shadow-xl shadow-primary/20 flex items-center justify-between">
        <div>
          <h4 className="font-black uppercase text-xs tracking-widest flex items-center gap-2"><Award size={14} /> {t.level}</h4>
          <p className="text-[10px] opacity-90 mt-1">Benefícios vitalícios ativos na firma.</p>
        </div>
        <div className="bg-white/20 px-3 py-1.5 rounded-xl border border-white/30 backdrop-blur-md">
          <span className="text-[9px] font-black uppercase">PRO</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2"><Palette size={14} /> {t.style}</h4>
          <Card className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-foreground">{t.theme}</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ id: 'light', label: t.theme_light, icon: Sun }, { id: 'dark', label: t.theme_dark, icon: Moon }].map((th) => (
                  <button key={th.id} onClick={() => setTheme(th.id)} className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all active:scale-95 ${theme === th.id ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-50 dark:bg-slate-800 border-border text-muted hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                    <th.icon size={16} /> <span className="text-[10px] font-black uppercase">{th.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-foreground">Cor 1 (Primária)</label>
              <div className="flex flex-wrap gap-4">
                {Object.keys(PALETTE_MAP).map((p) => (
                  <button key={`pri-${p}`} onClick={() => setPrimaryColor(p)} style={{ backgroundColor: PALETTE_MAP[p] }} className={`w-10 h-10 rounded-full transition-all active:scale-90 ${primaryColor === p ? 'ring-4 ring-offset-2 ring-primary scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'}`} />
                ))}
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-border">
              <label className="text-xs font-bold text-foreground">Cor 2 (Secundária)</label>
              <div className="flex flex-wrap gap-4">
                {Object.keys(PALETTE_MAP).map((p) => (
                  <button key={`sec-${p}`} onClick={() => setSecondaryColor(p)} style={{ backgroundColor: PALETTE_MAP[p] }} className={`w-10 h-10 rounded-full transition-all active:scale-90 ${secondaryColor === p ? 'ring-4 ring-offset-2 ring-primary scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'}`} />
                ))}
              </div>
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14} /> {t.security}</h4>
          <Card className="space-y-4">
            <div className="flex items-center justify-between py-1 cursor-pointer" onClick={() => setBiometrics(!biometrics)}>
              <span className="text-xs font-bold">{t.biometrics}</span>
              <div className={`w-10 h-6 rounded-full transition-colors relative ${biometrics ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${biometrics ? 'right-1' : 'left-1'}`}></div></div>
            </div>
            <button className="w-full flex items-center justify-between py-1 border-t border-border pt-4 text-left active:opacity-70 transition-opacity"><span className="text-xs font-bold">{t.pass}</span><ChevronRight size={16} className="text-muted" /></button>
          </Card>
        </div>
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2"><Globe size={14} /> {t.lang}</h4>
          <Card className="flex items-center justify-between py-4 cursor-pointer active:bg-slate-50 dark:active:bg-slate-800 transition-colors" onClick={() => setLanguage(language === 'pt-br' ? 'en' : 'pt-br')}>
            <span className="text-xs font-bold">{t.current_lang}</span>
            <div className="flex items-center gap-1 text-primary"><RefreshCw size={14} className="animate-spin-slow" /><span className="text-[9px] font-black uppercase">{language === 'pt-br' ? 'Trocar' : 'Switch'}</span></div>
          </Card>
        </div>
        <button onClick={onLogout} className="w-full py-5 bg-rose-500/10 text-rose-500 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 mt-4 active:scale-95 transition-all hover:bg-rose-500/20"><LogOut size={18} /> {t.logout}</button>
      </div>
    </div>
  );
};

// --- APP ROOT ---

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPro, setIsPro] = useState(true);
  const [currentPage, setCurrentPage] = useState<'home' | 'sim' | 'entries' | 'admin'>('home');
  const [primaryColor, setPrimaryColor] = useState('indigo');
  const [secondaryColor, setSecondaryColor] = useState('rose'); // Default secondary
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState<'pt-br' | 'en'>('pt-br');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const t = useMemo(() => TRANSLATIONS[language], [language]);

  useEffect(() => {
    setResolvedTheme(theme as 'light' | 'dark');
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const color = PALETTE_MAP[primaryColor] || PALETTE_MAP.indigo;
    const colorSec = PALETTE_MAP[secondaryColor] || PALETTE_MAP.rose;
    root.style.setProperty('--primary-color', color);
    root.style.setProperty('--secondary-color', colorSec);
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('--background', '#0f172a');
      root.style.setProperty('--foreground', '#f8fafc');
      root.style.setProperty('--card', '#1e293b');
      root.style.setProperty('--border', '#334155');
      root.style.setProperty('--muted', '#94a3b8');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--background', '#fcfdfe');
      root.style.setProperty('--foreground', '#0f172a');
      root.style.setProperty('--card', '#ffffff');
      root.style.setProperty('--border', '#f1f5f9');
      root.style.setProperty('--muted', '#64748b');
    }
  }, [primaryColor, resolvedTheme]);

  const GlobalStyles = () => (
    <style>{`
      :root { --primary-color: #4f46e5; --secondary-color: #f43f5e; --background: #fcfdfe; --foreground: #0f172a; --card: #ffffff; --border: #f1f5f9; --muted: #64748b; }
      .dark { --background: #0f172a; --foreground: #f8fafc; --card: #1e293b; --border: #334155; --muted: #94a3b8; }
      body { background-color: var(--background); color: var(--foreground); transition: background-color 0.3s, color 0.3s; overflow-x: hidden; }
      .bg-background { background-color: var(--background); }
      .bg-card { background-color: var(--card); }
      .text-foreground { color: var(--foreground); }
      .text-muted { color: var(--muted); }
      .border-border { border-color: var(--border); }
      .bg-primary { background-image: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); background-color: var(--primary-color); }
      .text-primary { color: var(--primary-color); }
      .text-gradient { background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .border-primary { border-color: var(--primary-color); }
      .bg-primary\\/10 { background-color: rgba(79, 70, 229, 0.1); }
      .bg-primary\\/20 { background-color: rgba(79, 70, 229, 0.2); }
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      @keyframes bounce-short { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
      .animate-bounce-short { animation: bounce-short 1s ease-in-out infinite; }
    `}</style>
  );

  if (!isAuthenticated) return (
    <>
      <GlobalStyles />
      <LoginPage onLogin={(pro) => { setIsAuthenticated(true); setIsPro(pro); }} onUpgrade={() => { }} language={language} />
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground max-w-md mx-auto relative shadow-2xl flex flex-col border-x border-border transition-colors duration-300">
      <GlobalStyles />
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {currentPage === 'home' && <Dashboard t={t.dash} isPro={isPro} />}
        {currentPage === 'sim' && <SimulatorsPage t={t.sim} isPro={isPro} language={language} />}
        {currentPage === 'entries' && <EntriesPage t={t.entries} isPro={isPro} />}
        {currentPage === 'admin' && (
          <SettingsPage
            primaryColor={primaryColor}
            setPrimaryColor={setPrimaryColor}
            secondaryColor={secondaryColor}
            setSecondaryColor={setSecondaryColor}
            theme={theme}
            setTheme={setTheme}
            language={language}
            setLanguage={setLanguage}
            t={t.admin}
            onLogout={() => setIsAuthenticated(false)}
          />
        )}
      </div>

      <button onClick={() => setCurrentPage('entries')} className={`fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-[1.5rem] shadow-xl flex items-center justify-center transition-all active:scale-90 z-20 ${currentPage === 'entries' ? 'scale-0' : 'scale-100 hover:scale-110'}`}><PlusCircle size={28} /></button>

      <nav className="sticky bottom-0 bg-card/90 backdrop-blur-xl border-t border-border p-4 flex justify-between px-8 z-30 safe-area-bottom">
        {[
          { id: 'home', icon: Home, label: t.nav.home },
          { id: 'sim', icon: Calculator, label: t.nav.sim },
          { id: 'entries', icon: FileText, label: t.nav.entries },
          { id: 'admin', icon: Settings, label: t.nav.admin }
        ].map(item => (
          <button key={item.id} onClick={() => setCurrentPage(item.id as any)} className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${currentPage === item.id ? 'text-primary' : 'text-muted hover:text-slate-500'}`}><item.icon size={22} className={currentPage === item.id ? 'animate-bounce-short' : ''} /><span className="text-[9px] font-black uppercase">{item.label}</span></button>
        ))}
      </nav>
    </div>
  );
};

export default App;
