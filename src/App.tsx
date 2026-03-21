import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  Cloud, 
  LayoutDashboard, 
  Library, 
  Settings, 
  Plus, 
  HelpCircle, 
  LogOut, 
  Search, 
  Bell, 
  ChevronRight,
  ChevronDown,
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
  File,
  Folder,
  FolderOpen,
  Shield,
  Thermometer,
  HardDrive,
  Server,
  Terminal,
  Bot,
  Box,
  Play,
  Square,
  RefreshCw,
  Save,
  Send
} from 'lucide-react';
import { DASHBOARD_ITEMS, APPS, GAMES } from './constants';
import { AppDefinition, DashboardItem } from './types';

type Page = 'dashboard' | 'library' | 'games' | 'projects' | 'settings' | 'ai-features';
type SortCriteria = 'name' | 'category' | 'type' | 'date';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isSettingsUnlocked, setIsSettingsUnlocked] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleSettingsClick = () => {
    if (isSettingsUnlocked) {
      setCurrentPage('settings');
    } else {
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = (password: string) => {
    if (password === 'admin') {
      setIsSettingsUnlocked(true);
      setShowPasswordModal(false);
      setCurrentPage('settings');
    } else {
      alert('Fel lösenord!');
    }
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
      case 'settings':
        return <SettingsPage onBack={() => setCurrentPage('dashboard')} />;
      case 'ai-features':
        return <AIFeaturesPage onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <DashboardHome onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-surface selection:bg-primary-container selection:text-on-primary-container">
      <AnimatePresence>
        {showPasswordModal && (
          <PasswordModal 
            onClose={() => setShowPasswordModal(false)} 
            onSubmit={handlePasswordSubmit} 
          />
        )}
      </AnimatePresence>

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
          <SidebarLink 
            active={currentPage === 'dashboard'} 
            onClick={() => setCurrentPage('dashboard')}
            icon={<LayoutDashboard size={18} />}
            label="Översikt"
          />
          <SidebarLink 
            active={currentPage === 'projects'} 
            onClick={() => setCurrentPage('projects')}
            icon={<Briefcase size={18} />}
            label="Projekt"
          />
          <SidebarLink 
            active={currentPage === 'library'} 
            onClick={() => setCurrentPage('library')}
            icon={<Library size={18} />}
            label="Appbibliotek"
          />
          <SidebarLink 
            active={currentPage === 'games'} 
            onClick={() => setCurrentPage('games')}
            icon={<Gamepad2 size={18} />}
            label="Spelbibliotek"
          />
          <SidebarLink 
            active={currentPage === 'ai-features'} 
            onClick={() => setCurrentPage('ai-features')}
            icon={<Bot size={18} />}
            label="AI Funktioner"
          />
          <SidebarLink 
            active={currentPage === 'settings'} 
            onClick={handleSettingsClick}
            icon={isSettingsUnlocked ? <Settings size={18} /> : <Lock size={18} />}
            label="Inställningar"
          />
        </nav>

        <div className="mt-auto px-4 space-y-1">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-xs text-white/60 transition-all hover:bg-surface-container">
            <HelpCircle size={14} />
            Support
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-xs text-error/80 transition-all hover:bg-error/5">
            <LogOut size={14} />
            Logga ut
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-surface/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h2 className="font-headline text-xl font-bold tracking-tight text-white">
              {currentPage === 'dashboard' ? 'Hemserver' : 
               currentPage === 'library' ? 'Appbibliotek' : 
               currentPage === 'games' ? 'Spelbibliotek' : 
               currentPage === 'projects' ? 'Projekt' : 
               currentPage === 'ai-features' ? 'AI Funktioner' :
               'Systeminställningar'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input 
                type="text" 
                placeholder="Sök..."
                className="w-64 rounded-full border-none bg-surface-container-lowest py-1.5 pl-10 pr-4 text-xs text-white focus:ring-1 focus:ring-primary/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="rounded-lg p-2 text-white/60 transition-all hover:bg-surface-container hover:text-white">
                <Bell size={20} />
              </button>
              <div className="h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-surface-container-high">
                <img 
                  src="https://picsum.photos/seed/alex/100/100" 
                  alt="Avatar" 
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
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

function DashboardHome({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div className="space-y-12">
      {/* Hero Section - Editorial Style */}
      <section className="relative overflow-hidden rounded-3xl bg-surface-container-low p-12">
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-20">
          <img 
            src="https://picsum.photos/seed/server/800/600" 
            alt="Hero" 
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-container-low to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-primary-container/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-container">
              Systemstatus: Optimal
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-secondary-container shadow-[0_0_8px_#34ff8d]" />
          </div>
          <h1 className="font-headline text-6xl font-black leading-none tracking-tighter text-white mb-6 uppercase">
            AlexCloud <span className="text-primary-container">Plattform</span>
          </h1>
          <p className="text-lg text-white/40 mb-8 max-w-lg leading-relaxed">
            Välkommen till min centrala hubb för infrastruktur, personliga applikationer och datadriven analys. 
            Allt körs säkert på Ubuntu & Docker.
          </p>
          
          <div className="flex items-center gap-8">
            <StatItem icon={<Cpu size={16} />} label="CPU" value="12%" />
            <StatItem icon={<Database size={16} />} label="RAM" value="4.2GB" />
            <StatItem icon={<Activity size={16} />} label="Uptime" value="14d" />
          </div>
        </div>
      </section>

      {/* Main Grid - Professional Data Grid Style */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-headline text-xl font-bold text-white">Aktiva Tjänster</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Sortera efter: Senast använda</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DASHBOARD_ITEMS.map((item) => (
            <DashboardCard 
              key={item.id} 
              item={item} 
              onClick={() => {
                if (item.type === 'page') {
                  onNavigate(item.target as Page);
                }
              }}
            />
          ))}
        </div>
      </section>

      {/* Secondary Section - Quick Links */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl bg-surface-container p-6 border border-white/5">
          <h4 className="font-headline text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Senaste Loggar</h4>
          <div className="space-y-3">
            <LogItem time="14:22" msg="Docker container 'plex' omstartad" type="info" />
            <LogItem time="12:05" msg="Säkerhetskopiering slutförd" type="success" />
            <LogItem time="09:15" msg="Ny inloggning från IP 192.168.1.45" type="warning" />
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
                  <p className="text-[10px] text-white/40">85.226.112.XX</p>
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
                  <span className="text-lg font-bold text-white">42°C</span>
                  <span className="text-[10px] text-secondary-container mb-1">Normal</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-lowest border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive size={14} className="text-primary-container" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Lagring</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-lg font-bold text-white">64%</span>
                  <span className="text-[10px] text-white/20 mb-1">2.4TB kvar</span>
                </div>
              </div>
            </div>

            {/* Load Item */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  <Server className="text-white/40" size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">System Load</p>
                  <p className="text-[10px] text-white/40">Load Avg: 0.45, 0.32, 0.28</p>
                </div>
              </div>
              <div className="h-1 w-16 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary-container w-[45%]" />
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
  const imageSeed = `${item.title.toLowerCase().replace(/\s+/g, '-')}-service`;

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
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${imageSeed}/800/600`} 
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/20 to-transparent" />
        
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
          />
        ))}
      </div>
    </div>
  );
}

function GamesPage({ onBack, favorites, onToggleFavorite }: { onBack: () => void, favorites: string[], onToggleFavorite: (id: string) => void }) {
  const [sortBy, setSortBy] = useState<SortCriteria>('date');
  const sortedGames = sortApps(GAMES, sortBy);

  return (
    <div className="relative -m-8 min-h-screen starfield p-8">
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
              <h1 className="font-headline text-7xl font-black tracking-[0.2em] text-white neon-text uppercase italic">
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

function GameCard({ game, isFavorite, onToggleFavorite }: { game: AppDefinition, isFavorite: boolean, onToggleFavorite: () => void, key?: string }) {
  return (
    <motion.div
      whileHover={{ 
        y: -12,
        scale: 1.05,
      }}
      className="group relative overflow-hidden rounded-3xl bg-[#0d1e25] border border-primary-container/10 neon-border"
    >
      <div className="relative h-56 w-full game-grid-bg overflow-hidden flex items-center justify-center">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
        
        {/* Floating Icon with Glow */}
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
        
        {/* Favorite Button */}
        <button 
          onClick={(e) => {
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
            <span className="h-2 w-2 rounded-full bg-secondary-container animate-pulse shadow-[0_0_8px_#34ff8d]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Online</span>
          </div>
          <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary-container group-hover:translate-x-1 transition-transform">
            SPELA NU
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
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

function AppCard({ app, isFavorite, onToggleFavorite }: { app: AppDefinition, isFavorite: boolean, onToggleFavorite: () => void, key?: string }) {
  // Create a dynamic image seed based on title and category
  const imageSeed = `${app.title.toLowerCase().replace(/\s+/g, '-')}-${app.category.toLowerCase()}`;
  
  return (
    <motion.div
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative overflow-hidden rounded-3xl bg-surface-container shadow-2xl transition-all hover:bg-surface-container-high border border-white/5"
    >
      {/* Favorite Button */}
      <button 
        onClick={(e) => {
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

      <div className="relative h-56 w-full overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${imageSeed}/800/600`} 
          alt={app.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/20 to-transparent" />
        
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

        <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] py-3.5 text-sm font-bold text-white transition-all hover:from-primary-container/20 hover:to-primary/10 hover:border-primary/30 group/btn">
          Öppna Applikation
          <ExternalLink size={16} className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </button>
      </div>
    </motion.div>
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

      if (userRes.ok && reposRes.ok) {
        const userData = await userRes.json();
        const reposData = await reposRes.json();
        setUser(userData);
        setRepos(reposData);
        setError(null);
      } else {
        setUser(null);
        setRepos([]);
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

      {!user ? (
        <div className="rounded-3xl bg-surface-container-low p-16 text-center border border-white/5">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-surface-container text-primary-container shadow-2xl shadow-primary/10">
            <Briefcase size={48} />
          </div>
          <h2 className="font-headline text-4xl font-black text-white mb-6 uppercase tracking-tight">Projektarkiv</h2>
          <p className="text-white/40 max-w-md mx-auto leading-relaxed mb-10">
            Anslut ditt GitHub-konto för att synkronisera dina repon och hantera dina projekt direkt från AlexCloud.
          </p>
          <button 
            onClick={handleConnect}
            className="inline-flex items-center gap-3 rounded-full bg-primary-container px-8 py-4 font-headline text-sm font-black uppercase tracking-widest text-on-primary-container transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/20"
          >
            Anslut GitHub
            <ExternalLink size={18} />
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* User Profile Header */}
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
  const aiTools = [
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
      status: 'coming-soon',
      tags: ['Kreativt', 'Imagen']
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
              <button className="w-full rounded-xl bg-primary-container py-3 text-xs font-bold uppercase tracking-widest text-on-primary-container transition-all hover:scale-105">
                Öppna Verktyg
              </button>
            ) : (
              <div className="w-full rounded-xl bg-white/5 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-white/20">
                Kommer snart
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Featured AI Assistant Preview */}
      <div className="rounded-3xl bg-surface-container p-12 border border-white/5 relative overflow-hidden">
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

function SettingsPage({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'system' | 'docker' | 'files' | 'terminal' | 'ai'>('system');

  const tabs = [
    { id: 'system', label: 'System', icon: <Shield size={18} /> },
    { id: 'docker', label: 'Docker', icon: <Box size={18} /> },
    { id: 'files', label: 'Filer', icon: <FolderOpen size={18} /> },
    { id: 'terminal', label: 'Terminal', icon: <Terminal size={18} /> },
    { id: 'ai', label: 'AI Assistent', icon: <Bot size={18} /> },
  ];

  return (
    <div className="space-y-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-white/40 transition-colors hover:text-white"
      >
        <ArrowLeft size={16} />
        Tillbaka till Översikt
      </button>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sub-navigation */}
        <div className="w-full lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary-container text-on-primary-container shadow-lg shadow-primary/10' 
                  : 'text-white/40 hover:bg-surface-container hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'system' && <SystemTab />}
              {activeTab === 'docker' && <DockerTab />}
              {activeTab === 'files' && <FilesTab />}
              {activeTab === 'terminal' && <TerminalTab />}
              {activeTab === 'ai' && <AITab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SystemTab() {
  const systemFiles = [
    { name: 'package.json', size: '2.4 KB', type: 'config' },
    { name: 'App.tsx', size: '18.2 KB', type: 'code' },
    { name: 'constants.ts', size: '4.1 KB', type: 'data' },
    { name: 'index.css', size: '1.2 KB', type: 'style' },
    { name: 'vite.config.ts', size: '0.8 KB', type: 'config' },
    { name: 'tsconfig.json', size: '1.1 KB', type: 'config' },
  ];

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="rounded-3xl bg-surface-container p-8 border border-white/5">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-headline text-xl font-bold text-white flex items-center gap-3">
            <Folder className="text-primary-container" size={24} />
            Systemfiler
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Root: /home/alex/server</span>
        </div>

        <div className="space-y-2">
          {systemFiles.map((file) => (
            <div key={file.name} className="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest border border-white/5 hover:bg-surface-container-high transition-colors group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-surface-container text-white/40 group-hover:text-primary-container transition-colors">
                  <FileCode size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{file.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">{file.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-white/40">{file.size}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DockerTab() {
  const [containers, setContainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContainers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/docker/containers');
      const data = await res.json();
      setContainers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  const handleAction = async (id: string, action: string) => {
    await fetch('/api/docker/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action })
    });
    fetchContainers();
  };

  return (
    <div className="rounded-3xl bg-surface-container p-8 border border-white/5">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-headline text-xl font-bold text-white flex items-center gap-3">
          <Box className="text-primary-container" size={24} />
          Docker Containrar
        </h3>
        <button onClick={fetchContainers} className="p-2 rounded-full hover:bg-white/5 text-white/40">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/20">
              <th className="pb-4 pl-4">Namn</th>
              <th className="pb-4">Image</th>
              <th className="pb-4">Status</th>
              <th className="pb-4 pr-4 text-right">Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {containers.map((c) => (
              <tr key={c.id} className="group hover:bg-white/5 transition-colors">
                <td className="py-4 pl-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${c.state === 'running' ? 'bg-secondary-container shadow-[0_0_8px_#34ff8d]' : 'bg-error/40'}`} />
                    <span className="text-sm font-bold text-white">{c.name}</span>
                  </div>
                </td>
                <td className="py-4 text-xs text-white/40">{c.image}</td>
                <td className="py-4 text-xs text-white/40">{c.status}</td>
                <td className="py-4 pr-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {c.state === 'running' ? (
                      <button onClick={() => handleAction(c.id, 'stop')} className="p-2 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors">
                        <Square size={14} />
                      </button>
                    ) : (
                      <button onClick={() => handleAction(c.id, 'start')} className="p-2 rounded-lg bg-secondary-container/10 text-secondary-container hover:bg-secondary-container/20 transition-colors">
                        <Play size={14} />
                      </button>
                    )}
                    <button onClick={() => handleAction(c.id, 'restart')} className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 transition-colors">
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilesTab() {
  const [files, setFiles] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState('.');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const fetchFiles = async (path: string) => {
    const res = await fetch(`/api/files/list?path=${encodeURIComponent(path)}`);
    const data = await res.json();
    setFiles(data);
    setCurrentPath(path);
  };

  useEffect(() => {
    fetchFiles('.');
  }, []);

  const handleFileClick = async (file: any) => {
    if (file.isDirectory) {
      fetchFiles(file.path);
    } else {
      const res = await fetch(`/api/files/read?path=${encodeURIComponent(file.path)}`);
      const data = await res.json();
      setSelectedFile(file.path);
      setFileContent(data.content);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    await fetch('/api/files/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: selectedFile, content: fileContent })
    });
    setIsEditing(false);
    setSelectedFile(null);
  };

  return (
    <div className="rounded-3xl bg-surface-container p-8 border border-white/5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-headline text-xl font-bold text-white flex items-center gap-3">
          <FolderOpen className="text-primary-container" size={24} />
          Smart Filhanterare
        </h3>
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/20">
          Sökväg: {currentPath}
        </div>
      </div>

      {isEditing ? (
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white/60">{selectedFile}</span>
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-xs font-bold hover:bg-white/10">Avbryt</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-xs font-bold hover:scale-105 transition-all">
                <Save size={14} /> Spara
              </button>
            </div>
          </div>
          <textarea 
            className="flex-1 rounded-xl bg-surface-container-lowest p-4 font-mono text-sm text-white border border-white/5 focus:ring-1 focus:ring-primary/40 resize-none"
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentPath !== '.' && (
            <button 
              onClick={() => fetchFiles(currentPath.split('/').slice(0, -1).join('/') || '.')}
              className="p-4 rounded-2xl bg-surface-container-lowest border border-white/5 hover:bg-surface-container-high transition-all flex flex-col items-center gap-2 group"
            >
              <Folder className="text-white/20 group-hover:text-primary-container transition-colors" size={32} />
              <span className="text-xs font-bold text-white/40">..</span>
            </button>
          )}
          {files.map((file) => (
            <button 
              key={file.path}
              onClick={() => handleFileClick(file)}
              className="p-4 rounded-2xl bg-surface-container-lowest border border-white/5 hover:bg-surface-container-high transition-all flex flex-col items-center gap-2 group"
            >
              {file.isDirectory ? (
                <Folder className="text-primary-container/60 group-hover:text-primary-container transition-colors" size={32} />
              ) : (
                <File className="text-white/20 group-hover:text-white transition-colors" size={32} />
              )}
              <span className="text-xs font-bold text-white truncate w-full text-center">{file.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TerminalTab() {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>(['AlexCloud Terminal v1.0.0', 'Skriv ett kommando för att börja...']);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output]);

  const handleExec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const currentCmd = command;
    setCommand('');
    setOutput(prev => [...prev, `> ${currentCmd}`]);
    setLoading(true);

    try {
      const res = await fetch('/api/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: currentCmd })
      });
      const data = await res.json();
      setOutput(prev => [...prev, data.output]);
    } catch (err) {
      setOutput(prev => [...prev, 'Fel vid körning av kommando.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-surface-container p-8 border border-white/5 h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-headline text-xl font-bold text-white flex items-center gap-3">
          <Terminal className="text-primary-container" size={24} />
          Inbyggd Terminal
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">alex@core-command:~$</span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 bg-black/40 rounded-2xl p-6 font-mono text-xs text-secondary-container overflow-y-auto space-y-2 border border-white/5"
      >
        {output.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">{line}</div>
        ))}
        {loading && <div className="animate-pulse">Kör...</div>}
      </div>

      <form onSubmit={handleExec} className="mt-6 relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-container font-mono text-sm">$</span>
        <input 
          type="text" 
          className="w-full rounded-xl bg-surface-container-lowest py-4 pl-10 pr-4 font-mono text-sm text-white border border-white/5 focus:ring-1 focus:ring-primary/40"
          placeholder="Skriv kommando..."
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          disabled={loading}
        />
      </form>
    </div>
  );
}

function AITab() {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Hej Alex! Jag är din Core Command AI. Hur kan jag hjälpa dig med din server idag?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userText,
        config: {
          systemInstruction: "Du är en expert på Ubuntu-servrar, Docker och systemadministration. Du hjälper användaren Alex att hantera sin hemserver 'Alex Core Command'. Var teknisk men pedagogisk. Svara på svenska."
        }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || 'Jag kunde inte generera ett svar.' }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: 'Ett fel uppstod vid kommunikation med AI:n. Kontrollera din API-nyckel.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-surface-container p-8 border border-white/5 h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-headline text-xl font-bold text-white flex items-center gap-3">
          <Bot className="text-primary-container" size={24} />
          AI Server Assistent
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Powered by Gemini</span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 p-4"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 text-sm ${
              msg.role === 'user' 
                ? 'bg-primary-container text-on-primary-container' 
                : 'bg-surface-container-lowest text-white/80 border border-white/5'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-container-lowest rounded-2xl p-4 border border-white/5">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-container animate-bounce" />
                <div className="h-1.5 w-1.5 rounded-full bg-primary-container animate-bounce [animation-delay:0.2s]" />
                <div className="h-1.5 w-1.5 rounded-full bg-primary-container animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="mt-6 flex gap-3">
        <input 
          type="text" 
          className="flex-1 rounded-xl bg-surface-container-lowest py-4 px-6 text-sm text-white border border-white/5 focus:ring-1 focus:ring-primary/40"
          placeholder="Fråga om din server..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button 
          type="submit"
          disabled={loading}
          className="p-4 rounded-xl bg-primary-container text-on-primary-container hover:scale-105 transition-all disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}

function PasswordModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (password: string) => void }) {
  const [password, setPassword] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/90 backdrop-blur-sm p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-surface-container p-8 border border-white/10 shadow-2xl"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/10 text-primary-container">
            <Lock size={32} />
          </div>
          <h2 className="font-headline text-2xl font-bold text-white mb-2">Skyddat område</h2>
          <p className="text-white/40 text-sm">Vänligen ange administratörslösenord för att komma åt systeminställningar.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(password); }}>
          <input 
            autoFocus
            type="password" 
            placeholder="Lösenord"
            className="w-full rounded-2xl border-white/10 bg-surface-container-lowest p-4 text-white focus:ring-2 focus:ring-primary-container mb-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-white/10 py-4 text-sm font-bold text-white/60 hover:bg-white/5"
            >
              Avbryt
            </button>
            <button 
              type="submit"
              className="flex-1 rounded-2xl bg-primary-container py-4 text-sm font-bold text-on-primary hover:opacity-90"
            >
              Lås upp
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
