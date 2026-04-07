import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Globe, 
  Cpu, 
  CreditCard,
  ChevronRight,
  Sparkles,
  Type,
  Zap,
  Trash2
} from "lucide-react";
import { Language, translations } from "../translations";

export default function Settings({ 
  waterfallEnabled, 
  setWaterfallEnabled,
  username,
  setUsername,
  language,
  setLanguage,
  fontSize,
  setFontSize,
  selectedModel,
  setSelectedModel
}: { 
  waterfallEnabled: boolean; 
  setWaterfallEnabled: (val: boolean) => void;
  username: string;
  setUsername: (val: string) => void;
  language: Language;
  setLanguage: (val: Language) => void;
  fontSize: string;
  setFontSize: (val: string) => void;
  selectedModel: string;
  setSelectedModel: (val: string) => void;
}) {
  const [speed, setSpeed] = useState("Fast");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const t = useMemo(() => translations[language], [language]);

  const sections = [
    {
      title: t.userProfile,
      items: [
        { 
          icon: User, 
          label: t.profileInfo, 
          value: username,
          onClick: () => {
            setIsEditingUsername(true);
            setTempUsername(username);
          }
        },
        { icon: CreditCard, label: t.subscriptionPlan, value: t.lightingTier, accent: "text-blue-400" },
      ]
    },
    {
      title: t.preferences,
      items: [
        { 
          icon: Moon, 
          label: t.darkMode, 
          value: darkMode ? t.alwaysOn : t.off, 
          toggle: true,
          onClick: () => setDarkMode(!darkMode)
        },
        { 
          icon: Bell, 
          label: t.notifications, 
          value: notifications ? t.enabled : t.disabled, 
          toggle: true,
          onClick: () => setNotifications(!notifications)
        },
        { 
          icon: Globe, 
          label: t.language, 
          value: language, 
          onClick: () => setLanguage(language === "English" ? "Romanian" : "English") 
        },
        { 
          icon: Type, 
          label: t.fontSize, 
          value: t[fontSize.toLowerCase() as keyof typeof t] as string || fontSize,
          onClick: () => {
            const sizes = ["Small", "Medium", "Large"];
            const next = sizes[(sizes.indexOf(fontSize) + 1) % sizes.length];
            setFontSize(next);
          }
        },
      ]
    },
    {
      title: t.aiConfig,
      items: [
        { 
          icon: Cpu, 
          label: t.modelVersion, 
          value: selectedModel === "gemini-3-flash-preview" ? t.modelUltra : 
                 selectedModel === "gemini-3.1-pro-preview" ? t.modelPro : t.modelFlash,
          onClick: () => {
            const models = ["gemini-3-flash-preview", "gemini-3.1-pro-preview", "gemini-flash-latest"];
            const next = models[(models.indexOf(selectedModel) + 1) % models.length];
            setSelectedModel(next);
          }
        },
        { 
          icon: Zap, 
          label: t.responseSpeed, 
          value: speed === "Fast" ? t.fast : t.balanced,
          onClick: () => setSpeed(prev => prev === "Fast" ? "Balanced" : "Fast")
        },
        { 
          icon: Sparkles, 
          label: t.waterfallAnimation, 
          value: waterfallEnabled ? t.enabled : t.disabled, 
          toggle: true,
          onClick: () => setWaterfallEnabled(!waterfallEnabled)
        },
      ]
    },
    {
      title: t.spaceTheme,
      items: [
        { icon: Sparkles, label: t.starBackground, value: t.enabled, toggle: true },
        { icon: Zap, label: t.nebulaEffects, value: "High Quality", toggle: true },
      ]
    },
    {
      title: t.securityData,
      items: [
        { icon: Shield, label: "Two-Factor Auth", value: t.disabled },
        { 
          icon: Trash2, 
          label: t.clearChat, 
          value: "Action", 
          accent: "text-red-400",
          onClick: () => {
            if (window.confirm("Are you sure you want to clear all chat history?")) {
              window.location.reload();
            }
          }
        },
      ]
    }
  ];

  return (
    <div className="flex-1 h-full bg-[#0a0a0a] overflow-y-auto p-8 md:p-16 lg:p-24 custom-scrollbar relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <AnimatePresence>
        {isEditingUsername && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 w-full max-w-md space-y-6 shadow-2xl"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">{t.editUsername}</h3>
                <p className="text-gray-500 text-sm">How should Koroli AI address you?</p>
              </div>
              <input 
                type="text" 
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditingUsername(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={() => {
                    setUsername(tempUsername);
                    setIsEditingUsername(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                  {t.saveChanges}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-4xl mx-auto space-y-16 relative z-10">
        <header className="space-y-4">
          <h1 className="text-5xl font-bold text-white tracking-tight">{t.settings}</h1>
          <p className="text-gray-500 font-medium text-lg tracking-tight">Manage your account and app preferences</p>
        </header>

        <div className="space-y-16">
          {sections.map((section) => (
            <section key={section.title} className="space-y-6">
              <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] ml-4">
                {section.title}
              </h2>
              <div className="glass-panel border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                {section.items.map((item, i) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className={`w-full flex items-center justify-between p-6 md:p-8 hover:bg-white/5 transition-all group ${
                      i !== section.items.length - 1 ? "border-b border-white/5" : ""
                    } ${item.onClick ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-blue-400 transition-all group-hover:scale-110">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <span className="text-lg font-bold text-gray-200 tracking-tight">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-bold uppercase tracking-widest ${item.accent || "text-gray-500"}`}>
                        {item.value}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-gray-400 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="pt-12 pb-8 text-center space-y-4">
          <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em]">
            Koroli AI v1.0.0 (Build 2026.04.07)
          </p>
          <div className="flex items-center justify-center gap-6">
            <button className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{t.termsOfService}</button>
            <button className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{t.privacyPolicy}</button>
            <button className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{t.support}</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
