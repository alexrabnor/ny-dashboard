import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  ExternalLink,
  ArrowLeft,
  Briefcase,
  Activity,
  Cpu,
  Database,
  Globe,
  Heart
} from 'lucide-react';
import { DASHBOARD_ITEMS, APPS } from './constants';
import { AppDefinition, DashboardItem } from './types';

type Page = 'dashboard' | 'library' | 'projects';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

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
      case 'projects':
        return <ProjectsPage onBack={() => setCurrentPage('dashboard')} />;
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
              <h1 className="font-headline text-lg font-extrabold tracking-tight text-primary-container">AlexCloud</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Executive Suite</p>
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
            active={false} 
            onClick={() => {}}
            icon={<Settings size={18} />}
            label="Inställningar"
          />
        </nav>

        <div className="mt-auto px-4 space-y-1">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-container to-primary py-3 font-bold text-on-primary shadow-lg shadow-primary/10 transition-opacity hover:opacity-90">
            <Plus size={18} />
            Nytt Projekt
          </button>
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
              {currentPage === 'dashboard' ? 'Hemserver' : currentPage === 'library' ? 'Appbibliotek' : 'Projekt'}
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
          <h1 className="font-headline text-6xl font-black leading-none tracking-tighter text-white mb-6">
            ALEX <span className="text-primary-container">EXECUTIVE</span><br />
            HOME SERVER
          </h1>
          <p className="text-lg text-white/40 mb-8 max-w-lg leading-relaxed">
            Välkommen till din centrala hubb för infrastruktur, personliga applikationer och datadriven analys. 
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
          <h4 className="font-headline text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Nätverksstatus</h4>
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest">
            <div className="flex items-center gap-3">
              <Globe className="text-primary-container" size={20} />
              <div>
                <p className="text-sm font-bold text-white">Extern IP</p>
                <p className="text-xs text-white/40">85.226.112.XX</p>
              </div>
            </div>
            <span className="text-xs font-bold text-secondary-container">Ansluten</span>
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

function DashboardCard({ item, onClick }: { item: DashboardItem, onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group relative flex flex-col items-start rounded-2xl bg-surface-container p-6 text-left transition-all hover:bg-surface-container-high hover:shadow-2xl hover:shadow-primary/5 border border-white/5"
    >
      <div className="absolute right-4 top-4">
        <div className={`glow-dot ${item.status === 'active' ? 'text-secondary-container bg-secondary-container' : 'text-error bg-error'}`} />
      </div>
      
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-highest text-xl transition-transform group-hover:scale-110">
        {item.icon}
      </div>

      <h3 className="font-headline text-lg font-bold text-white mb-1">{item.title}</h3>
      <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">{item.subtitle}</p>
      
      <div className="mt-6 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary-container opacity-0 transition-opacity group-hover:opacity-100">
        Öppna {item.type === 'page' ? 'Sida' : 'Länk'}
        <ChevronRight size={12} />
      </div>
    </motion.button>
  );
}

function LibraryPage({ onBack, favorites, onToggleFavorite }: { onBack: () => void, favorites: string[], onToggleFavorite: (id: string) => void }) {
  return (
    <div className="space-y-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-white/40 transition-colors hover:text-white"
      >
        <ArrowLeft size={16} />
        Tillbaka till Översikt
      </button>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {APPS.map((app) => (
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

function AppCard({ app, isFavorite, onToggleFavorite }: { app: AppDefinition, isFavorite: boolean, onToggleFavorite: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-3xl bg-surface-container shadow-2xl transition-all hover:bg-surface-container-high border border-white/5"
    >
      {/* Favorite Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className={`absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all ${
          isFavorite 
            ? 'bg-primary-container text-on-primary shadow-lg shadow-primary/20' 
            : 'bg-black/20 text-white/60 hover:bg-black/40 hover:text-white'
        }`}
      >
        <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} className={isFavorite ? 'scale-110' : ''} />
      </button>

      <div className="relative h-56 w-full overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${app.imageSeed}/800/600`} 
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
  return (
    <div className="space-y-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-white/40 transition-colors hover:text-white"
      >
        <ArrowLeft size={16} />
        Tillbaka till Översikt
      </button>

      <div className="rounded-2xl bg-surface-container-low p-12 text-center border border-white/5">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container text-primary-container shadow-2xl shadow-primary/10">
          <Briefcase size={40} />
        </div>
        <h2 className="font-headline text-3xl font-bold text-white mb-4">Projektarkiv</h2>
        <p className="text-white/40 max-w-md mx-auto leading-relaxed">
          Här samlas alla dina aktiva utvecklingsprojekt synkade från GitHub och lokala repon. 
          Redo för nästa stora commit.
        </p>
      </div>
    </div>
  );
}
