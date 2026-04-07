import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Code, 
  Calculator, 
  FlaskConical, 
  History, 
  Languages, 
  ExternalLink,
  Search,
  Plus,
  X,
  Trash2
} from "lucide-react";
import { Language, translations } from "../translations";

interface ResourceItem {
  id: string;
  title: string;
  type: string;
  date: string;
  url?: string;
}

export default function Resources({ language }: { language: Language }) {
  const t = useMemo(() => translations[language], [language]);

  const [materials, setMaterials] = useState<ResourceItem[]>(() => {
    const saved = localStorage.getItem("koroli_resources");
    return saved ? JSON.parse(saved) : [
      { id: "1", title: "Calculus III: Vector Fields", type: "Math", date: "2 hours ago" },
      { id: "2", title: "React Hooks Deep Dive", type: "CS", date: "Yesterday" },
      { id: "3", title: "Organic Chemistry: Alkanes", type: "Science", date: "3 days ago" },
      { id: "4", title: "Modern European History", type: "History", date: "Last week" },
    ];
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("Math");

  useEffect(() => {
    localStorage.setItem("koroli_resources", JSON.stringify(materials));
  }, [materials]);

  const categories = [
    { id: "math", icon: Calculator, label: "Mathematics", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { id: "science", icon: FlaskConical, label: "Science", color: "bg-green-500/10 text-green-400 border-green-500/20" },
    { id: "cs", icon: Code, label: "Comp Sci", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    { id: "history", icon: History, label: "History", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
    { id: "lang", icon: Languages, label: "Languages", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  ];

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const newItem: ResourceItem = {
      id: Date.now().toString(),
      title: newTitle,
      type: newType,
      date: "Just now"
    };
    setMaterials([newItem, ...materials]);
    setNewTitle("");
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  return (
    <div className="flex-1 h-full bg-[#020205] overflow-y-auto p-8 md:p-16 lg:p-24 custom-scrollbar relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
      
      <AnimatePresence>
        {isAdding && (
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
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Add Material</h3>
                <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Title</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Quantum Physics Basics"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Category</label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                  >
                    <option value="Math">Math</option>
                    <option value="Science">Science</option>
                    <option value="CS">Computer Science</option>
                    <option value="History">History</option>
                    <option value="Languages">Languages</option>
                  </select>
                </div>
              </div>
              <button 
                onClick={handleAdd}
                className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors shadow-lg shadow-white/5"
              >
                Add to Library
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-20 relative z-10">
        <header className="flex items-end justify-between gap-12">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-white tracking-tight">{t.resources}</h1>
            <p className="text-gray-500 font-medium text-lg tracking-tight">Access your study materials and learning paths</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-white text-black px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 hover:bg-gray-200 transition-all shadow-xl shadow-white/5 shrink-0"
          >
            <Plus className="w-5 h-5" />
            Add Material
          </button>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`flex flex-col items-center justify-center p-6 rounded-3xl border transition-all hover:scale-105 active:scale-95 ${cat.color}`}
            >
              <cat.icon className="w-8 h-8 mb-3" />
              <span className="text-xs font-bold uppercase tracking-widest">{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="space-y-6">
            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">
              Recent Materials
            </h2>
            <div className="space-y-4">
              {materials.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{item.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{item.type} • {item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="p-2 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ExternalLink className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors" />
                  </div>
                </div>
              ))}
              {materials.length === 0 && (
                <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                  <p className="text-gray-600 text-sm">No materials added yet.</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl shadow-lg shadow-blue-600/10 group cursor-pointer hover:scale-[1.02] transition-transform">
                <h3 className="text-white font-bold mb-2">Flashcards</h3>
                <p className="text-blue-100 text-xs leading-relaxed opacity-80">Review your active decks and test your knowledge.</p>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-3xl shadow-lg shadow-purple-600/10 group cursor-pointer hover:scale-[1.02] transition-transform">
                <h3 className="text-white font-bold mb-2">Study Plan</h3>
                <p className="text-purple-100 text-xs leading-relaxed opacity-80">Check your upcoming deadlines and goals.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl col-span-2 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors">
                <div className="space-y-1">
                  <h3 className="text-white font-bold">Library Explorer</h3>
                  <p className="text-gray-500 text-xs">Browse millions of academic papers and books.</p>
                </div>
                <Search className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
