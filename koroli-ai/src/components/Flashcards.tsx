import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrainCircuit, Sparkles, Loader2, ChevronLeft, ChevronRight, RotateCcw, Plus, Trash2 } from "lucide-react";
import { Language, translations } from "../translations";
import { studyAssistant } from "../services/gemini";

interface Flashcard {
  front: string;
  back: string;
}

export default function Flashcards({ language }: { language: Language }) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState("");
  const t = useMemo(() => translations[language], [language]);

  const generateCards = async () => {
    if (!topic) return;
    setIsLoading(true);
    try {
      const prompt = `Generate 5 flashcards for the topic: "${topic}". 
      Return the response as a JSON array of objects with "front" and "back" properties. 
      Example: [{"front": "Question", "back": "Answer"}]`;
      
      const response = await studyAssistant(prompt);
      // Basic JSON extraction
      const jsonStr = response.match(/\[.*\]/s)?.[0];
      if (jsonStr) {
        const newCards = JSON.parse(jsonStr);
        setCards(newCards);
        setCurrentIndex(0);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="flex-1 h-full flex flex-col p-4 md:p-12 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto w-full space-y-8 md:space-y-12">
        <header className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">{t.flashcards}</h1>
          </div>
          <p className="text-gray-500 text-sm md:text-lg font-medium tracking-tight">
            Master any subject with AI-generated flashcards.
          </p>
        </header>

        {cards.length === 0 ? (
          <div className="glass-panel border border-white/5 rounded-2xl md:rounded-[32px] p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-6 md:space-y-8">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/5 flex items-center justify-center text-gray-700">
              <Plus className="w-8 h-8 md:w-12 md:h-12" />
            </div>
            <div className="space-y-2 md:space-y-4 max-w-md">
              <h3 className="text-xl md:text-2xl font-bold text-white">Ready to start?</h3>
              <p className="text-sm md:text-gray-500">Enter a topic and Koroli AI will generate a set of flashcards to help you study.</p>
            </div>
            <div className="w-full max-w-md space-y-4">
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Quantum Physics, French Vocabulary, React Hooks..."
                className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
              />
              <button
                onClick={generateCards}
                disabled={!topic || isLoading}
                className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 md:gap-3 transition-all text-sm md:text-base ${
                  !topic || isLoading
                    ? "bg-white/5 text-gray-600 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700 shadow-xl shadow-purple-600/20"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                    {t.generateFlashcards}
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12">
            {/* Flashcard Display */}
            <div className="flex flex-col items-center gap-8 md:gap-12">
              <div 
                className="relative w-full max-w-2xl aspect-[16/10] cursor-pointer perspective-1000"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <motion.div 
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="w-full h-full relative preserve-3d"
                >
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden glass-panel border border-white/10 rounded-2xl md:rounded-[40px] p-6 md:p-12 flex flex-col items-center justify-center text-center shadow-2xl">
                    <span className="absolute top-4 md:top-8 left-4 md:left-8 text-[8px] md:text-[10px] font-bold text-purple-400 uppercase tracking-widest">{t.flashcardFront}</span>
                    <h3 className="text-lg md:text-3xl font-bold text-white leading-tight">{cards[currentIndex].front}</h3>
                    <p className="absolute bottom-4 md:bottom-8 text-[8px] md:text-xs text-gray-600 font-bold uppercase tracking-widest">Click to flip</p>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 glass-panel border border-purple-500/20 rounded-2xl md:rounded-[40px] p-6 md:p-12 flex flex-col items-center justify-center text-center shadow-2xl bg-purple-500/5">
                    <span className="absolute top-4 md:top-8 left-4 md:left-8 text-[8px] md:text-[10px] font-bold text-purple-400 uppercase tracking-widest">{t.flashcardBack}</span>
                    <p className="text-sm md:text-2xl text-gray-200 leading-relaxed">{cards[currentIndex].back}</p>
                    <p className="absolute bottom-4 md:bottom-8 text-[8px] md:text-xs text-gray-600 font-bold uppercase tracking-widest">Click to flip back</p>
                  </div>
                </motion.div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-8">
                <button 
                  onClick={prevCard}
                  className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-bold text-white tracking-tight">{currentIndex + 1} / {cards.length}</p>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Cards Remaining</p>
                </div>
                <button 
                  onClick={nextCard}
                  className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button 
                  onClick={() => setCards([])}
                  className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-bold flex items-center gap-3 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                  Clear All
                </button>
                <button 
                  onClick={() => {
                    setCurrentIndex(0);
                    setIsFlipped(false);
                  }}
                  className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 font-bold flex items-center gap-3 hover:bg-white/10 hover:text-white transition-all"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
