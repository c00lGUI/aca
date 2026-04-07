import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { 
  MessageSquare, 
  BookOpen, 
  Settings as SettingsIcon, 
  LogOut, 
  Sparkles,
  Search,
  Code,
  X,
  Plus,
  BrainCircuit,
  BarChart3,
  Terminal,
  Users,
  ChevronLeft,
  ChevronRight,
  LayoutGrid
} from "lucide-react";
import { Language, translations } from "../translations";

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onLogout,
  onClose,
  username,
  language,
  isCollapsed,
  setIsCollapsed
}: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void; 
  onLogout: () => void;
  onClose?: () => void;
  username: string;
  language: Language;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}) {
  const t = useMemo(() => translations[language], [language]);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(true);

  const tabs = [
    { id: "chat", icon: MessageSquare, label: t.chat },
    { id: "summarizer", icon: Sparkles, label: t.summarizer },
    { id: "flashcards", icon: BrainCircuit, label: t.flashcards },
    { id: "quiz", icon: BrainCircuit, label: t.quiz },
  ];

  const secondaryTabs = [
    { id: "resources", icon: BookOpen, label: t.resources },
    { id: "programming", icon: Code, label: "Programming" },
    { id: "playground", icon: Terminal, label: t.playground },
    { id: "analytics", icon: BarChart3, label: t.analytics },
    { id: "settings", icon: SettingsIcon, label: t.settings },
  ];

  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ 
        x: 0, 
        opacity: 1,
        width: isCollapsed ? "80px" : "288px"
      }}
      exit={{ x: -300, opacity: 0 }}
      className="fixed inset-y-0 left-0 bg-black/40 backdrop-blur-3xl border-r border-white/10 flex flex-col p-4 z-50 md:relative md:translate-x-0 transition-all duration-300 ease-in-out"
    >
      {/* Collapse Toggle (Desktop) */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3 top-10 w-6 h-6 bg-blue-600 rounded-full items-center justify-center text-white shadow-lg z-50 hover:bg-blue-700 transition-colors"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className={`flex items-center justify-between mb-10 px-2 ${isCollapsed ? "justify-center" : ""}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity" />
            <div className="relative w-10 h-10 bg-black border border-white/10 rounded-xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20" />
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 4v16M7 12h4l6-8M11 12l6 8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="10" className="opacity-20" />
              </svg>
            </div>
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-lg font-bold text-white tracking-tight whitespace-nowrap">Koroli Ai</h2>
              <div className="flex items-center gap-1 text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                <Sparkles className="w-2.5 h-2.5" />
                Lighting
              </div>
            </motion.div>
          )}
        </div>
        {!isCollapsed && (
          <button 
            onClick={onClose}
            className="md:hidden p-2 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
        {!isCollapsed && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder={t.search}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
          </div>
        )}

        <div className={`flex items-center justify-between mb-4 ml-2 ${isCollapsed ? "justify-center ml-0" : ""}`}>
          {!isCollapsed ? (
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
              Navigation
            </div>
          ) : (
            <div className="h-px w-8 bg-white/10" />
          )}
        </div>

        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={isCollapsed ? tab.label : ""}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative ${
              activeTab === tab.id 
                ? "bg-white/10 text-white" 
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            } ${isCollapsed ? "justify-center px-0" : ""}`}
          >
            <tab.icon className={`w-5 h-5 shrink-0 ${activeTab === tab.id ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"}`} />
            {!isCollapsed && <span className="font-medium text-sm tracking-tight whitespace-nowrap">{tab.label}</span>}
            {activeTab === tab.id && !isCollapsed && (
              <motion.div 
                layoutId="active-indicator"
                className="ml-auto w-1 h-5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"
              />
            )}
          </button>
        ))}
      </div>

      <div className="pt-4 border-t border-white/5 space-y-4">
        {/* Quick Actions Toggle */}
        {!isCollapsed && (
          <button 
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className="w-full flex items-center justify-between px-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] hover:text-gray-300 transition-colors"
          >
            Quick Actions
            <LayoutGrid className={`w-3 h-3 transition-transform ${isQuickActionsOpen ? "rotate-0" : "rotate-180"}`} />
          </button>
        )}

        <AnimatePresence>
          {(isQuickActionsOpen || isCollapsed) && (
            <motion.div 
              initial={isCollapsed ? { opacity: 1 } : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`grid gap-2 px-1 ${isCollapsed ? "grid-cols-1" : "grid-cols-5"}`}
            >
              {secondaryTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={`flex items-center justify-center p-2.5 rounded-xl transition-all ${
                    activeTab === tab.id 
                      ? "bg-blue-500/20 text-blue-400" 
                      : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`flex items-center gap-3 px-2 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
            {username.substring(0, 2).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{username}</p>
              <p className="text-xs text-gray-500 truncate">Lighting Plan</p>
            </div>
          )}
        </div>
        
        <button 
          onClick={onLogout}
          title={isCollapsed ? t.logout : ""}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all group ${isCollapsed ? "justify-center px-0" : ""}`}
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
          {!isCollapsed && <span className="font-medium text-sm tracking-tight">{t.logout}</span>}
        </button>
      </div>
    </motion.div>
  );
}
