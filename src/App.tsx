import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cloud,
  LayoutDashboard,
  Library,
  Plus,
  Search,
  Smartphone,
  Download,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
  Briefcase,
  Activity,
  Gamepad2,
  Cpu,
  Database,
  Globe,
  Heart,
  Lock,
  FileCode,
  Thermometer,
  HardDrive,
  Server,
  Bot,
  Users
} from 'lucide-react';
import { DASHBOARD_ITEMS, APPS, GAMES, SHARED_APPS, MOBILE_APPS } from './constants';
import { AppDefinition, DashboardItem, MobileAppDefinition } from './types';

type Page = 'dashboard' | 'library' | 'games' | 'projects' | 'ai-features' | 'private' | 'shared' | 'system' | 'mobile';

// Delas av sidomenyn (desktop) och hamburgermenyn (mobil)
const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Översikt', icon: <LayoutDashboard size={18} /> },
  { page: 'projects', label: 'Projekt', icon: <Briefcase size={18} /> },
  { page: 'library', label: 'Appbibliotek', icon: <Library size={18} /> },
  { page: 'games', label: 'Spelbibliotek', icon: <Gamepad2 size={18} /> },
  { page: 'mobile', label: 'Mobilappar', icon: <Smartphone size={18} /> },
  { page: 'ai-features', label: 'AI Funktioner', icon: <Bot size={18} /> },
  { page: 'private', label: 'Övriga appar', icon: <Lock size={18} /> },
  { page: 'shared', label: 'Andras appar', icon: <Users size={18} /> },
  { page: 'system', label: 'Systemappar', icon: <Server size={18} /> },
];
type SortCriteria = 'name' | 'category' | 'type' | 'date';

export default function App() {
  // #mobile, #games osv. öppnar rätt sida direkt (används av redirects från gamla sajten)
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const hash = window.location.hash.replace('#', '');
    const pages: Page[] = ['dashboard', 'library', 'games', 'projects', 'ai-features', 'private', 'shared', 'system', 'mobile'];
    return (pages as string[]).includes(hash) ? (hash as Page) : 'dashboard';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (page: Page) => {
    setCurrentPage(page);
    setMenuOpen(false);
  };

  // Lås bakgrundsscroll när mobilmenyn är öppen
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('alexcloud-favorites') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('alexcloud-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Sök över alla publika appar och spel (privata/systemappar ligger inte i bundlen)
  const query = searchQuery.trim().toLowerCase();
  const searchResults = query.length >= 2
    ? [
        ...APPS.map((a) => ({ app: a, group: 'App' })),
        ...GAMES.map((a) => ({ app: a, group: 'Spel' })),
        ...SHARED_APPS.map((a) => ({ app: a, group: 'Andras appar' })),
      ]
        .filter(({ app }) =>
          app.title.toLowerCase().includes(query) ||
          app.description.toLowerCase().includes(query) ||
          app.category.toLowerCase().includes(query) ||
          app.tags.some((t) => t.toLowerCase().includes(query))
        )
        .slice(0, 8)
    : [];

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'library':
        return (
          <LibraryPage 
            onBack={() => setCurrentPage('dashboard')} 
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'games':
        return (
          <GamesPage 
            onBack={() => setCurrentPage('dashboard')} 
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'projects':
        return <ProjectsPage onBack={() => setCurrentPage('dashboard')} />;
      case 'private':
        return (
          <ProtectedAppsPage
            endpoint="/api/private-apps"
            title="Övriga appar"
            description="Personliga appar. Ange lösenord för att visa listan."
            onBack={() => setCurrentPage('dashboard')}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'system':
        return (
          <ProtectedAppsPage
            endpoint="/api/system-apps"
            title="Systemappar"
            description="Serververktyg. Ange lösenord för att visa listan."
            onBack={() => setCurrentPage('dashboard')}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'shared':
        return (
          <SharedAppsPage
            onBack={() => setCurrentPage('dashboard')}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'ai-features':
        return <AIFeaturesPage onBack={() => setCurrentPage('dashboard')} />;
      case 'mobile':
        return <MobileAppsPage onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <DashboardHome onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-white/5 bg-surface-container-low py-6 shadow-2xl md:flex z-40">
        <div className="px-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary-container">
              <Cloud className="text-on-primary-container" size={20} />
            </div>
            <div>
              <h1 className="font-headline text-lg font-extrabold tracking-tight text-primary-container">AlexCloud Plattform</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Ledningspanel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.page}
              active={currentPage === item.page}
              onClick={() => navigate(item.page)}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </nav>

      </aside>

      {/* Mobilmeny (hamburgare) */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed left-0 top-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-white/5 bg-surface-container-low py-6 shadow-2xl md:hidden"
            >
              <div className="px-6 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary-container">
                    <Cloud className="text-on-primary-container" size={20} />
                  </div>
                  <div>
                    <h1 className="font-headline text-base font-extrabold tracking-tight text-primary-container">AlexCloud</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Ledningspanel</p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg p-2 text-white/60 hover:bg-surface-container hover:text-white"
                  aria-label="Stäng meny"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sök i mobilmenyn */}
              <div className="px-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input
                    type="text"
                    placeholder="Sök appar och spel..."
                    className="w-full rounded-full border-none bg-surface-container-lowest py-2 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-primary/40"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {query.length >= 2 && (
                  <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-surface-container-high">
                    {searchResults.length === 0 ? (
                      <p className="p-3 text-xs text-white/40">Inga träffar på ”{searchQuery.trim()}”</p>
                    ) : (
                      searchResults.map(({ app, group }) => (
                        <a
                          key={`m-${group}-${app.id}`}
                          href={app.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => { setSearchQuery(''); setMenuOpen(false); }}
                          className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-surface-container-highest"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base" style={{ background: app.banner || 'rgba(255,255,255,0.05)' }}>
                            {app.bannerEmoji || app.icon}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-white">{app.title}</span>
                            <span className="block truncate text-[10px] text-white/40">{group}</span>
                          </span>
                        </a>
                      ))
                    )}
                  </div>
                )}
              </div>

              <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <SidebarLink
                    key={item.page}
                    active={currentPage === item.page}
                    onClick={() => navigate(item.page)}
                    icon={item.icon}
                    label={item.label}
                  />
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-surface/80 px-4 sm:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-lg p-2 text-white/60 transition-colors hover:bg-surface-container hover:text-white md:hidden"
              aria-label="Öppna meny"
            >
              <Menu size={22} />
            </button>
            <h2 className="font-headline text-lg sm:text-xl font-bold tracking-tight text-white truncate">
              {currentPage === 'dashboard' ? 'Hemserver' : 
               currentPage === 'library' ? 'Appbibliotek' : 
               currentPage === 'games' ? 'Spelbibliotek' : 
               currentPage === 'projects' ? 'Projekt' : 
               currentPage === 'ai-features' ? 'AI Funktioner' :
               currentPage === 'mobile' ? 'Mobilappar' :
               'Systeminställningar'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input
                type="text"
                placeholder="Sök appar och spel..."
                className="w-64 rounded-full border-none bg-surface-container-lowest py-1.5 pl-10 pr-4 text-xs text-white focus:ring-1 focus:ring-primary/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchQuery('');
                    setSearchOpen(false);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
              />
              {searchOpen && query.length >= 2 && (
                <div className="absolute right-0 top-full mt-2 w-96 overflow-hidden rounded-2xl border border-white/10 bg-surface-container-high shadow-2xl">
                  {searchResults.length === 0 ? (
                    <p className="p-4 text-xs text-white/40">Inga träffar på ”{searchQuery.trim()}”</p>
                  ) : (
                    searchResults.map(({ app, group }) => (
                      <a
                        key={`${group}-${app.id}`}
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setSearchQuery('')}
                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-container-highest"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg" style={{ background: app.banner || 'rgba(255,255,255,0.05)' }}>
                          {app.bannerEmoji || app.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-white">{app.title}</span>
                          <span className="block truncate text-[10px] text-white/40">{app.description}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/40">
                          {group}
                        </span>
                      </a>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-primary-container font-headline text-sm font-black text-on-primary-container">
                A
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 font-headline text-sm font-medium transition-all ${
        active 
          ? 'border-l-4 border-primary-container bg-surface-container-high text-primary-container' 
          : 'text-white/60 hover:bg-surface-container hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface SystemStats {
  cpuPercent: number;
  ramUsedGb: number;
  ramTotalGb: number;
  uptimeSec: number;
  loadAvg: number[];
  cpuCount: number;
  tempC: number | null;
  diskUsedPercent: number;
  diskFreeGb: number;
  externalIp: string | null;
  events: { time: string; msg: string; type: 'info' | 'success' | 'warning' }[];
}

type LiveStatus = 'up' | 'down';
type AppStatusMap = Record<string, LiveStatus>;

// Hämtar riktig upp/ner-status för publika appar från servern (cachas där i 2 min)
function useAppStatuses(): AppStatusMap {
  const [statuses, setStatuses] = useState<AppStatusMap>({});

  useEffect(() => {
    let cancelled = false;
    const fetchStatuses = async () => {
      try {
        const res = await fetch('/api/app-status');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setStatuses(data.statuses || {});
      } catch {
        // behåll senaste kända värden
      }
    };
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 120000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return statuses;
}

function StatusBadge({ status }: { status?: LiveStatus }) {
  if (!status) return null;
  const up = status === 'up';
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${up ? 'bg-secondary-container shadow-[0_0_8px_#34ff8d] animate-pulse' : 'bg-error shadow-[0_0_8px_#ff4d4d]'}`} />
      <span className={`text-[10px] font-bold uppercase tracking-widest ${up ? 'text-secondary-container' : 'text-error'}`}>
        {up ? 'Online' : 'Offline'}
      </span>
    </span>
  );
}

function formatUptime(sec: number): string {
  const days = Math.floor(sec / 86400);
  if (days >= 1) return `${days}d`;
  const hours = Math.floor(sec / 3600);
  if (hours >= 1) return `${hours}h`;
  return `${Math.floor(sec / 60)}m`;
}

function formatEventTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const hhmm = d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  return sameDay ? hhmm : `${d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })} ${hhmm}`;
}

function DashboardHome({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const appStatuses = useAppStatuses();
  const statusEntries = Object.entries(appStatuses);
  const upCount = statusEntries.filter(([, s]) => s === 'up').length;
  const downApps = statusEntries.filter(([, s]) => s === 'down').map(([id]) => id);

  // Hero-statusen styrs av riktiga värden istället för att alltid säga "Optimal"
  const issues: string[] = [];
  if (downApps.length > 0) issues.push(`${downApps.length} ${downApps.length === 1 ? 'app nere' : 'appar nere'}`);
  if (stats?.tempC != null && stats.tempC >= 75) issues.push('hög temperatur');
  if (stats && stats.loadAvg[0] / stats.cpuCount >= 0.9) issues.push('hög belastning');
  if (stats && stats.diskUsedPercent >= 90) issues.push('disken nästan full');
  const systemOk = issues.length === 0;

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/system-stats');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setStats(data);
      } catch {
        // behåll senaste kända värden
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section - Editorial Style */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-container-low p-6 sm:p-12">
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-30">
          <img
            src="https://databasen.alexcloud.se/assets/f786d29a-0bcd-46d1-b990-eeefd96261b6?width=1200"
            alt="Serverrack med blå belysning"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low to-transparent" />
          <a
            href="https://www.pexels.com/photo/close-up-of-a-blue-server-rack-in-datacenter-37730211/"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2 right-3 text-[9px] text-white/20 hover:text-white/50 transition-colors"
          >
            Foto: panumas nikhomkhai / Pexels
          </a>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
              systemOk ? 'bg-primary-container/20 text-primary-container' : 'bg-error/20 text-error'
            }`}>
              {systemOk ? 'Systemstatus: Optimal' : `Systemstatus: ${issues.join(' · ')}`}
            </span>
            <span className={`h-1.5 w-1.5 rounded-full ${
              systemOk ? 'bg-secondary-container shadow-[0_0_8px_#34ff8d]' : 'bg-error shadow-[0_0_8px_#ff4d4d] animate-pulse'
            }`} />
          </div>
          <h1 className="font-headline text-4xl sm:text-6xl font-black leading-none tracking-tighter text-white mb-6 uppercase">
            AlexCloud <span className="text-primary-container">Plattform</span>
          </h1>
          <p className="text-base sm:text-lg text-white/40 mb-8 max-w-lg leading-relaxed">
            Välkommen till min centrala hubb för infrastruktur, personliga applikationer och datadriven analys. 
            Allt körs säkert på Ubuntu & Docker.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 sm:gap-8">
            <StatItem icon={<Cpu size={16} />} label="CPU" value={stats ? `${stats.cpuPercent}%` : '–'} />
            <StatItem icon={<Database size={16} />} label="RAM" value={stats ? `${stats.ramUsedGb}GB` : '–'} />
            <StatItem icon={<Activity size={16} />} label="Uptime" value={stats ? formatUptime(stats.uptimeSec) : '–'} />
          </div>
        </div>
      </section>

      {/* Main Grid - Professional Data Grid Style */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-headline text-xl font-bold text-white">Aktiva Tjänster</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DASHBOARD_ITEMS.map((item) => (
            <DashboardCard 
              key={item.id} 
              item={item} 
              onClick={() => {
                if (item.type === 'page') {
                  onNavigate(item.target as Page);
                } else {
                  window.open(item.target, '_blank', 'noopener');
                }
              }}
            />
          ))}
        </div>
      </section>

      {/* Secondary Section - Quick Links */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl bg-surface-container p-6 border border-white/5">
          <h4 className="font-headline text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Senaste Händelser</h4>
          <div className="space-y-3">
            {stats ? (
              stats.events.map((ev) => (
                <LogItem key={ev.msg} time={formatEventTime(ev.time)} msg={ev.msg} type={ev.type} />
              ))
            ) : (
              <p className="text-xs text-white/20">Hämtar händelser…</p>
            )}
          </div>
        </div>
        <div className="rounded-2xl bg-surface-container p-6 border border-white/5">
          <h4 className="font-headline text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Server & Nätverk</h4>
          
          <div className="space-y-4">
            {/* Network Item */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-container/10">
                  <Globe className="text-primary-container" size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Extern IP</p>
                  <p className="text-[10px] text-white/40">{stats?.externalIp || '–'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-secondary-container shadow-[0_0_8px_#34ff8d]" />
                <span className="text-[10px] font-bold text-secondary-container uppercase tracking-widest">Ansluten</span>
              </div>
            </div>

            {/* Health Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-surface-container-lowest border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer size={14} className="text-error" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Temperatur</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-lg font-bold text-white">{stats?.tempC != null ? `${stats.tempC}°C` : '–'}</span>
                  {stats?.tempC != null && (
                    <span className={`text-[10px] mb-1 ${stats.tempC < 75 ? 'text-secondary-container' : 'text-error'}`}>
                      {stats.tempC < 75 ? 'Normal' : 'Hög'}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-lowest border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive size={14} className="text-primary-container" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Lagring</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-lg font-bold text-white">{stats ? `${stats.diskUsedPercent}%` : '–'}</span>
                  {stats && (
                    <span className="text-[10px] text-white/20 mb-1">
                      {stats.diskFreeGb >= 1000 ? `${(stats.diskFreeGb / 1000).toFixed(1)}TB` : `${stats.diskFreeGb}GB`} kvar
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tjänster online */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-container/10">
                  <Activity className="text-primary-container" size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Tjänster online</p>
                  <p className="text-[10px] text-white/40">
                    {statusEntries.length === 0
                      ? 'Kontrollerar…'
                      : downApps.length === 0
                        ? `Alla ${statusEntries.length} appar svarar`
                        : `Nere: ${downApps
                            .map((id) => [...APPS, ...GAMES, ...SHARED_APPS].find((a) => a.id === id)?.title || id)
                            .join(', ')}`}
                  </p>
                </div>
              </div>
              {statusEntries.length > 0 && (
                <span className={`text-sm font-bold ${downApps.length === 0 ? 'text-secondary-container' : 'text-error'}`}>
                  {upCount}/{statusEntries.length}
                </span>
              )}
            </div>

            {/* Load Item */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  <Server className="text-white/40" size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">System Load</p>
                  <p className="text-[10px] text-white/40">
                    Load Avg: {stats ? stats.loadAvg.map((l) => l.toFixed(2)).join(', ') : '–'}
                  </p>
                </div>
              </div>
              <div className="h-1 w-16 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-container"
                  style={{ width: `${stats ? Math.min(100, Math.round((stats.loadAvg[0] / stats.cpuCount) * 100)) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-primary-container opacity-60">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function LogItem({ time, msg, type }: { time: string, msg: string, type: 'info' | 'success' | 'warning' }) {
  const colors = {
    info: 'bg-primary-container',
    success: 'bg-secondary-container',
    warning: 'bg-error'
  };
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-white/20 font-mono">{time}</span>
      <span className={`h-1 w-1 rounded-full ${colors[type]}`} />
      <span className="text-white/60">{msg}</span>
    </div>
  );
}

function DashboardCard({ item, onClick }: { item: DashboardItem, onClick: () => void, key?: string }) {
  return (
    <motion.button
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl bg-surface-container text-left shadow-2xl transition-all hover:bg-surface-container-high border border-white/5"
    >
      <div
        className="relative flex h-48 w-full items-center justify-center overflow-hidden"
        style={{ background: item.banner || 'linear-gradient(135deg, #1a1a2e, #16213e)' }}
      >
        {item.bannerEmoji && (
          <span className="text-7xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-125">
            {item.bannerEmoji}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent" />
        
        {/* Type Badge */}
        <div className="absolute left-4 top-4 z-10">
          <div className="rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
            {item.type === 'page' ? 'Sida' : 'Länk'}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container-highest text-2xl shadow-inner">
            {item.icon}
          </div>
          <div>
            <h3 className="font-headline text-xl font-bold text-white">{item.title}</h3>
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${item.status === 'active' ? 'bg-secondary-container shadow-[0_0_8px_#34ff8d]' : 'bg-error'}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{item.status}</span>
            </div>
          </div>
        </div>
        
        <p className="mb-6 text-sm leading-relaxed text-white/60 line-clamp-2">
          {item.subtitle}
        </p>

        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary-container opacity-0 transition-opacity group-hover:opacity-100">
          Öppna {item.type === 'page' ? 'Sida' : 'Länk'}
          <ChevronRight size={12} />
        </div>
      </div>
    </motion.button>
  );
}

function LibraryPage({ onBack, favorites, onToggleFavorite }: { onBack: () => void, favorites: string[], onToggleFavorite: (id: string) => void }) {
  const [sortBy, setSortBy] = useState<SortCriteria>('date');
  const sortedApps = sortApps(APPS, sortBy);
  const statuses = useAppStatuses();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-white/40 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Tillbaka till Översikt
        </button>
        <SortControl current={sortBy} onChange={setSortBy} />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {sortedApps.map((app) => (
          <AppCard
            key={app.id}
            app={app}
            isFavorite={favorites.includes(app.id)}
            onToggleFavorite={() => onToggleFavorite(app.id)}
            liveStatus={statuses[app.id]}
          />
        ))}
      </div>
    </div>
  );
}

function GamesPage({ onBack, favorites, onToggleFavorite }: { onBack: () => void, favorites: string[], onToggleFavorite: (id: string) => void }) {
  const [sortBy, setSortBy] = useState<SortCriteria>('date');
  const sortedGames = sortApps(GAMES, sortBy);
  const statuses = useAppStatuses();

  return (
    <div className="relative -m-4 sm:-m-8 min-h-screen starfield p-4 sm:p-8">
      <div className="relative z-10 space-y-12">
        <div className="flex flex-col gap-8 items-center text-center">
          <button 
            onClick={onBack}
            className="self-start flex items-center gap-2 text-sm font-bold text-white/40 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Tillbaka till Översikt
          </button>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Gamepad2 size={48} className="text-primary-container animate-pulse" />
              <h1 className="font-headline text-4xl sm:text-7xl font-black tracking-[0.15em] sm:tracking-[0.2em] text-white neon-text uppercase italic">
                SPEL<span className="text-primary-container">ARKIVET</span>
              </h1>
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/40">Välj ditt spel och slå rekordet</p>
          </div>

          <div className="w-full flex justify-center">
            <SortControl current={sortBy} onChange={setSortBy} />
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary-container/20 to-transparent" />
          <div className="relative flex justify-center">
            <span className="bg-[#04151c] px-6 text-[10px] font-bold uppercase tracking-[0.4em] text-primary-container">
              // TILLGÄNGLIGA SPEL
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sortedGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isFavorite={favorites.includes(game.id)}
              onToggleFavorite={() => onToggleFavorite(game.id)}
              liveStatus={statuses[game.id]}
            />
          ))}
          
          {/* Coming Soon Placeholder */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/5 bg-white/2 p-12 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 text-white/20">
              <Plus size={32} />
            </div>
            <h3 className="font-headline text-xl font-bold text-white/20">???</h3>
            <p className="text-xs text-white/10">Fler spel på väg. Håll utkik!</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function GameCard({ game, isFavorite, onToggleFavorite, liveStatus }: { game: AppDefinition, isFavorite: boolean, onToggleFavorite: () => void, liveStatus?: LiveStatus, key?: string }) {
  return (
    <motion.a
      href={game.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{
        y: -12,
        scale: 1.05,
      }}
      className="group relative block overflow-hidden rounded-3xl bg-[#0d1e25] border border-primary-container/10 neon-border"
    >
      <div
        className="relative h-56 w-full game-grid-bg overflow-hidden flex items-center justify-center"
        style={game.banner ? { background: game.banner } : undefined}
      >
        {game.bannerImage && (
          <img
            src={game.bannerImage}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        {game.bannerImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1e25] via-transparent to-black/20" />
        )}
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

        {/* Floating Icon with Glow */}
        {!game.bannerImage && (
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative z-10 text-7xl drop-shadow-[0_0_20px_rgba(79,156,255,0.8)]"
          >
            {game.icon}
          </motion.div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute right-4 top-4 z-20"
        >
          <Heart
            size={20}
            className={`transition-all ${isFavorite ? 'fill-primary-container text-primary-container scale-125' : 'text-white/20 hover:text-white hover:scale-110'}`}
          />
        </button>

        {/* Status Badge */}
        <div className="absolute left-4 top-4 z-10">
          <div className="rounded-full bg-primary-container/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-container backdrop-blur-md border border-primary-container/30">
            {game.category}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-2xl font-black italic tracking-tight text-white group-hover:text-primary-container transition-colors">
            {game.title}
          </h3>
          <div className="rounded-md bg-white/5 px-2 py-1 text-[8px] font-bold uppercase tracking-tighter text-white/40 border border-white/5">
            {game.type}
          </div>
        </div>
        
        <p className="text-sm leading-relaxed text-white/40 line-clamp-2">
          {game.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            {liveStatus ? (
              <StatusBadge status={liveStatus} />
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">–</span>
            )}
          </div>
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-container group-hover:translate-x-1 transition-transform">
            SPELA NU
            <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </motion.a>
  );
}

function SortControl({ current, onChange }: { current: SortCriteria, onChange: (c: SortCriteria) => void }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Sortera efter:</span>
      <div className="flex flex-wrap gap-2">
        {(['name', 'category', 'type', 'date'] as SortCriteria[]).map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all ${
              current === c 
                ? 'bg-primary-container text-on-primary shadow-lg shadow-primary/20' 
                : 'bg-white/5 text-white/40 hover:bg-white/10'
            }`}
          >
            {c === 'name' ? 'Namn' : c === 'category' ? 'Kategori' : c === 'type' ? 'Typ' : 'Senast'}
          </button>
        ))}
      </div>
    </div>
  );
}

function sortApps(apps: AppDefinition[], criteria: SortCriteria) {
  return [...apps].sort((a, b) => {
    switch (criteria) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'type':
        return (a.type || '').localeCompare(b.type || '');
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });
}

function AppCard({ app, isFavorite, onToggleFavorite, liveStatus }: { app: AppDefinition, isFavorite: boolean, onToggleFavorite: () => void, liveStatus?: LiveStatus, key?: string }) {
  return (
    <motion.a
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative block overflow-hidden rounded-3xl bg-surface-container shadow-2xl transition-all hover:bg-surface-container-high border border-white/5"
    >
      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="absolute right-4 top-4 z-20"
      >
        <motion.div
          animate={{
            backgroundColor: isFavorite ? 'var(--color-primary-container)' : 'rgba(0, 0, 0, 0.2)',
            color: isFavorite ? 'var(--color-on-primary)' : 'rgba(255, 255, 255, 0.6)',
            scale: isFavorite ? [1, 1.2, 1] : 1
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md shadow-lg transition-colors"
        >
          <Heart 
            size={20} 
            fill={isFavorite ? 'currentColor' : 'none'} 
            className="transition-all duration-300"
          />
        </motion.div>
      </button>

      <div
        className="relative flex h-56 w-full items-center justify-center overflow-hidden"
        style={{ background: app.banner || 'linear-gradient(135deg, #1a1a2e, #16213e)' }}
      >
        {app.bannerImage && (
          <img
            src={app.bannerImage}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        {!app.bannerImage && app.bannerEmoji && (
          <span className="text-8xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-125">
            {app.bannerEmoji}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute left-4 top-4 z-10">
          <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/80 backdrop-blur-md border border-white/10">
            {app.category}
          </span>
        </div>

        <div className="absolute bottom-4 left-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container-highest shadow-2xl text-2xl border border-white/10">
          {app.icon}
        </div>
      </div>

      <div className="p-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-headline text-2xl font-bold text-white tracking-tight">{app.title}</h3>
          <StatusBadge status={liveStatus} />
        </div>
        
        <div className="mb-4 flex flex-wrap gap-2">
          {app.tags.map(tag => (
            <span key={tag} className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/40 border border-white/5">
              {tag}
            </span>
          ))}
        </div>
        
        <p className="mb-8 text-sm leading-relaxed text-white/50 line-clamp-2">
          {app.description}
        </p>

        <span className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] py-3.5 text-sm font-bold text-white transition-all hover:from-primary-container/20 hover:to-primary/10 hover:border-primary/30 group/btn">
          Öppna Applikation
          <ExternalLink size={16} className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </span>
      </div>
    </motion.a>
  );
}

function SharedAppsPage({ onBack, favorites, onToggleFavorite }: { onBack: () => void, favorites: string[], onToggleFavorite: (id: string) => void }) {
  const [sortBy, setSortBy] = useState<SortCriteria>('date');
  const sortedApps = sortApps(SHARED_APPS, sortBy);
  const statuses = useAppStatuses();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-white/40 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Tillbaka till Översikt
        </button>
        {sortedApps.length > 0 && <SortControl current={sortBy} onChange={setSortBy} />}
      </div>

      {sortedApps.length === 0 ? (
        <div className="rounded-3xl bg-surface-container-low p-16 text-center border border-white/5">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container text-primary-container">
            <Users size={40} />
          </div>
          <h2 className="font-headline text-2xl font-bold text-white mb-3">Andras appar</h2>
          <p className="text-white/40 max-w-md mx-auto leading-relaxed">
            Här samlas appar som andra delat med sig av, t.ex. på GitHub. Inga appar är tillagda än.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sortedApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              isFavorite={favorites.includes(app.id)}
              onToggleFavorite={() => onToggleFavorite(app.id)}
              liveStatus={statuses[app.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProtectedAppsPage({ endpoint, title, description, onBack, favorites, onToggleFavorite }: { endpoint: string, title: string, description: string, onBack: () => void, favorites: string[], onToggleFavorite: (id: string) => void }) {
  const [password, setPassword] = useState('');
  const [apps, setApps] = useState<AppDefinition[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setApps(await res.json());
      } else {
        setError('Fel lösenord. Försök igen.');
      }
    } catch (err) {
      setError('Något gick fel. Försök igen.');
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-white/40 transition-colors hover:text-white"
      >
        <ArrowLeft size={16} />
        Tillbaka till Översikt
      </button>

      {!apps ? (
        <div className="mx-auto max-w-md rounded-3xl bg-surface-container p-8 border border-white/10 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/10 text-primary-container">
              <Lock size={32} />
            </div>
            <h2 className="font-headline text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-white/40 text-sm">{description}</p>
          </div>

          <form onSubmit={handleUnlock}>
            <input
              autoFocus
              type="password"
              placeholder="Lösenord"
              className="w-full rounded-2xl border border-white/10 bg-surface-container-lowest p-4 text-white focus:ring-2 focus:ring-primary-container mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {error && <p className="mb-4 text-sm font-bold text-error">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full rounded-2xl bg-primary-container py-4 text-sm font-bold text-on-primary-container hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Låser upp…' : 'Lås upp'}
            </button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              isFavorite={favorites.includes(app.id)}
              onToggleFavorite={() => onToggleFavorite(app.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectsPage({ onBack }: { onBack: () => void }) {
  const [repos, setRepos] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGitHubData = async () => {
    setLoading(true);
    try {
      const [userRes, reposRes] = await Promise.all([
        fetch('/api/github/user'),
        fetch('/api/github/repos')
      ]);

      setUser(userRes.ok ? await userRes.json() : null);
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        setRepos(Array.isArray(reposData) ? reposData : []);
        setError(null);
      } else {
        setRepos([]);
        setError('Kunde inte hämta GitHub-repos');
      }
    } catch (err) {
      console.error("Error fetching GitHub data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitHubData();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        fetchGitHubData();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/auth/github/url');
      const { url } = await response.json();
      window.open(url, 'github_oauth', 'width=600,height=700');
    } catch (err) {
      alert("Kunde inte starta GitHub-anslutning");
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setRepos([]);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-white/40 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Tillbaka till Översikt
        </button>
        {user && (
          <button 
            onClick={handleLogout}
            className="text-[10px] font-bold uppercase tracking-widest text-error/60 hover:text-error transition-colors"
          >
            Koppla ifrån GitHub
          </button>
        )}
      </div>

      {loading ? (
        <div className="rounded-3xl bg-surface-container-low p-16 text-center border border-white/5">
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Hämtar projekt från GitHub…</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* User Profile Header */}
          {user ? (
            <div className="flex items-center justify-between rounded-3xl bg-surface-container p-8 border border-white/5">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-primary-container/20">
                  <img src={user.avatar_url} alt={user.login} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h2 className="font-headline text-2xl font-black text-white">{user.name || user.login}</h2>
                  <p className="text-sm text-white/40">@{user.login} • {user.public_repos} Repositories</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Status</p>
                  <p className="text-sm font-bold text-secondary-container">Synkroniserad</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl bg-surface-container p-8 border border-white/5">
              <div>
                <h2 className="font-headline text-2xl font-black text-white mb-1">Projektarkiv</h2>
                <p className="text-sm text-white/40">
                  {error ? error : 'Publika GitHub-repos för @alexrabnor. Anslut GitHub för att även se privata repos.'}
                </p>
              </div>
              <button
                onClick={handleConnect}
                className="inline-flex items-center gap-3 rounded-full bg-primary-container px-6 py-3 font-headline text-xs font-black uppercase tracking-widest text-on-primary-container transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/20"
              >
                Anslut GitHub
                <ExternalLink size={16} />
              </button>
            </div>
          )}

          {/* Repos Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo) => (
              <motion.a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -4 }}
                className="group p-6 rounded-2xl bg-surface-container border border-white/5 hover:bg-surface-container-high transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-white/5 text-primary-container group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                    <FileCode size={20} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white/20">{repo.language || 'Plain'}</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary-container" />
                  </div>
                </div>
                <h3 className="font-headline text-lg font-bold text-white mb-2 group-hover:text-primary-container transition-colors truncate">
                  {repo.name}
                </h3>
                <p className="text-xs text-white/40 line-clamp-2 mb-6 h-8">
                  {repo.description || 'Ingen beskrivning tillgänglig.'}
                </p>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-white/20">
                  <span>Stars: {repo.stargazers_count}</span>
                  <span>Forks: {repo.forks_count}</span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AIFeaturesPage({ onBack }: { onBack: () => void }) {
  const aiTools: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    status: string;
    tags: string[];
    url?: string;
  }[] = [
    {
      id: 'assistant',
      title: 'AI Assistent',
      description: 'Din personliga server-expert för Ubuntu och Docker.',
      icon: <Bot size={24} />,
      status: 'active',
      tags: ['Gemini', 'Support']
    },
    {
      id: 'prompts',
      title: 'Prompt-bibliotek',
      description: 'Spara och hantera dina bästa prompter för olika AI-modeller.',
      icon: <FileCode size={24} />,
      status: 'active',
      tags: ['Produktivitet', 'Sparat']
    },
    {
      id: 'image-gen',
      title: 'Bildgenerering',
      description: 'Skapa unika bilder med AI direkt i din dashboard.',
      icon: <Cloud size={24} />,
      status: 'active',
      tags: ['Kreativt', 'Imagen'],
      url: 'https://bilder.alexcloud.se/'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-white/40 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Tillbaka till Översikt
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {aiTools.map((tool) => (
          <motion.div
            key={tool.id}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-3xl bg-surface-container p-8 border border-white/5 hover:bg-surface-container-high transition-all"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container-highest text-primary-container shadow-inner group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
              {tool.icon}
            </div>
            
            <h3 className="font-headline text-xl font-bold text-white mb-3">{tool.title}</h3>
            <p className="text-sm text-white/40 leading-relaxed mb-6">
              {tool.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {tool.tags.map(tag => (
                <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {tag}
                </span>
              ))}
            </div>

            {tool.status === 'active' ? (
              tool.url ? (
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-xl bg-primary-container py-3 text-center text-xs font-bold uppercase tracking-widest text-on-primary-container transition-all hover:scale-105"
                >
                  Öppna Verktyg
                </a>
              ) : (
                <button className="w-full rounded-xl bg-primary-container py-3 text-xs font-bold uppercase tracking-widest text-on-primary-container transition-all hover:scale-105">
                  Öppna Verktyg
                </button>
              )
            ) : (
              <div className="w-full rounded-xl bg-white/5 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-white/20">
                Kommer snart
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Featured AI Assistant Preview */}
      <div className="rounded-3xl bg-surface-container p-6 sm:p-12 border border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
          <Bot size={400} className="text-primary-container translate-x-1/4 translate-y-1/4" />
        </div>
        
        <div className="relative z-10 max-w-xl">
          <h2 className="font-headline text-3xl font-black text-white mb-6 uppercase tracking-tight">Behöver du hjälp med servern?</h2>
          <p className="text-white/40 leading-relaxed mb-10">
            Vår inbyggda AI-assistent kan hjälpa dig att felsöka Docker-containrar, 
            skriva terminalkommandon och optimera din serverprestanda.
          </p>
          <button 
            onClick={() => {/* Navigate to assistant tab in settings or similar */}}
            className="inline-flex items-center gap-3 rounded-full bg-secondary-container px-8 py-4 font-headline text-sm font-black uppercase tracking-widest text-on-secondary-container transition-all hover:scale-105"
          >
            Prata med assistenten
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileAppCard({ app }: { app: MobileAppDefinition, key?: string }) {
  const disabled = app.status !== 'active';
  const isApk = app.kind === 'APK';

  const inner = (
    <>
      <div
        className="relative flex h-44 w-full items-center justify-center overflow-hidden"
        style={{ background: app.banner }}
      >
        {app.bannerImage ? (
          <img
            src={app.bannerImage}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <span className="text-7xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-125">
            {app.bannerEmoji}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent" />
        <div className="absolute left-4 top-4 z-10">
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border ${
            isApk
              ? 'bg-black/40 text-white/80 border-white/10'
              : 'bg-primary-container/20 text-primary-container border-primary-container/30'
          }`}>
            {isApk ? 'Android APK' : 'PWA'}
          </span>
        </div>
        <div className="absolute bottom-4 left-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container-highest shadow-2xl text-2xl border border-white/10">
          {app.icon}
        </div>
      </div>

      <div className="p-8">
        <h3 className="mb-3 font-headline text-2xl font-bold text-white tracking-tight">{app.title}</h3>

        <div className="mb-4 flex flex-wrap gap-2">
          {app.tags.map(tag => (
            <span key={tag} className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-bold text-white/40 border border-white/5">
              {tag}
            </span>
          ))}
        </div>

        <p className="mb-8 text-sm leading-relaxed text-white/50 line-clamp-3">
          {app.description}
        </p>

        {disabled ? (
          <span className="flex w-full items-center justify-center rounded-2xl bg-white/5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-white/20">
            Kommer snart
          </span>
        ) : (
          <span className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] py-3.5 text-sm font-bold text-white transition-all hover:from-primary-container/20 hover:to-primary/10 hover:border-primary/30">
            {isApk ? (
              <>
                <Download size={16} />
                Ladda ner APK {app.fileSize && <span className="text-white/40 font-normal">({app.fileSize})</span>}
              </>
            ) : (
              <>
                Öppna &amp; installera
                <ExternalLink size={16} />
              </>
            )}
          </span>
        )}
      </div>
    </>
  );

  const cardClass = `group relative block overflow-hidden rounded-3xl bg-surface-container shadow-2xl border border-white/5 ${
    disabled ? 'opacity-60' : 'transition-all hover:bg-surface-container-high'
  }`;

  if (disabled) {
    return <div className={cardClass}>{inner}</div>;
  }
  return (
    <motion.a
      href={app.url}
      {...(isApk ? { download: true } : { target: '_blank', rel: 'noopener noreferrer' })}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cardClass}
    >
      {inner}
    </motion.a>
  );
}

function MobileAppsPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-white/40 transition-colors hover:text-white"
      >
        <ArrowLeft size={16} />
        Tillbaka till Översikt
      </button>

      <div className="rounded-3xl bg-surface-container-low p-8 border border-white/5">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container/10 text-primary-container">
            <Smartphone size={24} />
          </div>
          <div>
            <h2 className="font-headline text-2xl font-bold text-white">Mobilappar</h2>
            <p className="text-sm text-white/40">Android-appar och PWA:er utvecklade för mobila enheter</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-xs text-white/40 leading-relaxed">
          <div className="rounded-xl bg-surface-container p-4 border border-white/5">
            <p className="font-bold text-white/70 mb-1">📦 APK-filer</p>
            Aktivera "Okända källor" i Android-inställningarna innan installation:
            Inställningar → Säkerhet → Okända källor.
          </div>
          <div className="rounded-xl bg-surface-container p-4 border border-white/5">
            <p className="font-bold text-white/70 mb-1">🌐 PWA-appar</p>
            Android (Chrome): öppna appen → ⋮ → "Installera app".
            iPhone (Safari): dela-ikonen → "Lägg till på hemskärmen".
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {MOBILE_APPS.map((app) => (
          <MobileAppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}
