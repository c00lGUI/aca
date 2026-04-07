import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, Timer, Play, Pause, RotateCcw } from "lucide-react";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import ChatInterface from "./components/ChatInterface";
import Quiz from "./components/Quiz";
import Analytics from "./components/Analytics";
import Playground from "./components/Playground";
import Resources from "./components/Resources";
import Settings from "./components/Settings";
import Summarizer from "./components/Summarizer";
import Flashcards from "./components/Flashcards";
import { Language, translations } from "./translations";
import { analyticsService } from "./services/analyticsService";

const StarBackground = () => {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; duration: string }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: `${Math.random() * 3 + 2}s`
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            "--duration": star.duration
          } as any}
        />
      ))}
      <div className="nebula-glow w-[600px] h-[600px] bg-blue-600/10 top-[-10%] left-[-10%]" />
      <div className="nebula-glow w-[800px] h-[800px] bg-purple-600/10 bottom-[-20%] right-[-20%]" />
    </div>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [waterfallEnabled, setWaterfallEnabled] = useState(true);
  const [username, setUsername] = useState("Koroli User");
  const [language, setLanguage] = useState<Language>("English");
  const [fontSize, setFontSize] = useState("Medium");
  const [selectedModel, setSelectedModel] = useState("gemini-3-flash-preview");
  
  const t = useMemo(() => translations[language], [language]);

  // Study time tracking
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const interval = setInterval(() => {
      // Track 1 minute of study time
      analyticsService.addSession(1);
    }, 60000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab("chat");
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fontSizeClass = useMemo(() => {
    switch (fontSize) {
      case "Small": return "text-sm";
      case "Large": return "text-lg";
      default: return "text-base";
    }
  }, [fontSize]);

  return (
    <div className={`min-h-screen bg-[#020205] text-white selection:bg-blue-500/30 font-sans ${fontSizeClass}`}>
      <StarBackground />
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10"
          >
            <Login onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-screen overflow-hidden relative z-10"
          >
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {(isSidebarOpen || window.innerWidth >= 768) && (
                <Sidebar 
                  activeTab={activeTab} 
                  setActiveTab={(tab) => {
                    setActiveTab(tab);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }} 
                  onLogout={handleLogout} 
                  onClose={() => setIsSidebarOpen(false)}
                  username={username}
                  language={language}
                  isCollapsed={isSidebarCollapsed}
                  setIsCollapsed={setIsSidebarCollapsed}
                />
              )}
            </AnimatePresence>
            
            <main className="flex-1 relative overflow-hidden flex flex-col">
              {/* Mobile Header */}
              <header className="md:hidden h-16 border-b border-white/10 flex items-center px-4 bg-black/40 backdrop-blur-md shrink-0">
                <button 
                  onClick={toggleSidebar}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <h1 className="ml-4 font-bold text-lg tracking-tight">Koroli Ai</h1>
              </header>

              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeTab === "chat" && (
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      className="h-full"
                    >
                      <ChatInterface 
                        waterfallEnabled={waterfallEnabled} 
                        language={language} 
                        selectedModel={selectedModel}
                      />
                    </motion.div>
                  )}

                  {activeTab === "summarizer" && (
                    <motion.div
                      key="summarizer"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      className="h-full"
                    >
                      <Summarizer language={language} />
                    </motion.div>
                  )}

                  {activeTab === "flashcards" && (
                    <motion.div
                      key="flashcards"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      className="h-full"
                    >
                      <Flashcards language={language} />
                    </motion.div>
                  )}

                  {activeTab === "quiz" && (
                    <motion.div
                      key="quiz"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      className="h-full"
                    >
                      <Quiz language={language} />
                    </motion.div>
                  )}
                  
                  {activeTab === "resources" && (
                    <motion.div
                      key="resources"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      className="h-full"
                    >
                      <Resources language={language} />
                    </motion.div>
                  )}

                  {activeTab === "programming" && (
                    <motion.div
                      key="programming"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      className="h-full"
                    >
                      <ChatInterface 
                        waterfallEnabled={waterfallEnabled} 
                        language={language} 
                        selectedModel={selectedModel}
                      />
                    </motion.div>
                  )}

                  {activeTab === "playground" && (
                    <motion.div
                      key="playground"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      className="h-full"
                    >
                      <Playground language={language} />
                    </motion.div>
                  )}

                  {activeTab === "analytics" && (
                    <motion.div
                      key="analytics"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      className="h-full"
                    >
                      <Analytics language={language} />
                    </motion.div>
                  )}

                  {activeTab === "settings" && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      className="h-full"
                    >
                      <Settings 
                        waterfallEnabled={waterfallEnabled} 
                        setWaterfallEnabled={setWaterfallEnabled} 
                        username={username}
                        setUsername={setUsername}
                        language={language}
                        setLanguage={setLanguage}
                        fontSize={fontSize}
                        setFontSize={setFontSize}
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
