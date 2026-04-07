import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrainCircuit, CheckCircle2, XCircle, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { Language, translations } from "../translations";
import { analyticsService } from "../services/analyticsService";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const mockQuestions: Question[] = [
  {
    id: 1,
    question: "What is the primary function of a React Hook?",
    options: [
      "To style components",
      "To use state and other React features in functional components",
      "To manage database connections",
      "To handle server-side routing"
    ],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "Which hook is used for side effects in React?",
    options: ["useState", "useContext", "useEffect", "useReducer"],
    correctAnswer: 2
  },
  {
    id: 3,
    question: "What does JSX stand for?",
    options: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript X-platform"],
    correctAnswer: 0
  }
];

export default function Quiz({ language }: { language: Language }) {
  const [currentStep, setCurrentStep] = useState<"start" | "quiz" | "result">("start");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const t = useMemo(() => translations[language], [language]);

  const handleStart = () => {
    setCurrentStep("quiz");
    setCurrentQuestionIdx(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
  };

  const handleOptionSelect = (idx: number) => {
    if (showFeedback) return;
    setSelectedOption(idx);
    setShowFeedback(true);
    if (idx === mockQuestions[currentQuestionIdx].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < mockQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setCurrentStep("result");
      // Save real result
      analyticsService.addQuizResult(score, mockQuestions.length);
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 md:p-16 lg:p-24 custom-scrollbar flex flex-col items-center justify-center relative">
      <div className="max-w-3xl w-full">
        <AnimatePresence mode="wait">
          {currentStep === "start" && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel rounded-2xl md:rounded-[40px] p-8 md:p-24 text-center space-y-8 md:space-y-12 shadow-2xl"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto border border-blue-500/20 shadow-lg">
                <BrainCircuit className="w-8 h-8 md:w-12 md:h-12 text-blue-400" />
              </div>
              <div className="space-y-2 md:space-y-4">
                <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{t.aiQuizGenerator}</h1>
                <p className="text-gray-500 text-sm md:text-lg font-medium tracking-tight">{t.testKnowledge}</p>
              </div>
              <button
                onClick={handleStart}
                className="w-full py-4 md:py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl md:rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 md:gap-3 group text-sm md:text-lg"
              >
                {t.startQuiz}
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </motion.div>
          )}

          {currentStep === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 md:space-y-12"
            >
              <div className="flex items-center justify-between gap-4 md:gap-8">
                <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 bg-white/5 border border-white/10 rounded-full shrink-0">
                  <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                    {t.question} {currentQuestionIdx + 1} / {mockQuestions.length}
                  </span>
                </div>
                <div className="h-1 md:h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIdx + 1) / mockQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="glass-panel rounded-2xl md:rounded-[40px] p-6 md:p-16 space-y-8 md:space-y-12 shadow-2xl">
                <h2 className="text-xl md:text-3xl font-bold text-white leading-tight tracking-tight">
                  {mockQuestions[currentQuestionIdx].question}
                </h2>

                <div className="grid gap-4 md:gap-6">
                  {mockQuestions[currentQuestionIdx].options.map((option, idx) => {
                    const isCorrect = idx === mockQuestions[currentQuestionIdx].correctAnswer;
                    const isSelected = idx === selectedOption;
                    
                    let stateStyles = "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10";
                    if (showFeedback) {
                      if (isCorrect) stateStyles = "bg-green-500/10 border-green-500/30 text-green-400";
                      else if (isSelected) stateStyles = "bg-red-500/10 border-red-500/30 text-red-400";
                      else stateStyles = "bg-white/5 border-white/10 text-gray-600 opacity-50";
                    } else if (isSelected) {
                      stateStyles = "bg-blue-500/10 border-blue-500/30 text-blue-400";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={showFeedback}
                        className={`w-full flex items-center justify-between p-6 rounded-2xl border text-left transition-all ${stateStyles} group`}
                      >
                        <span className="text-base font-medium">{option}</span>
                        {showFeedback && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-400" />}
                        {showFeedback && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-400" />}
                      </button>
                    );
                  })}
                </div>

                {showFeedback && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleNext}
                    className="w-full py-5 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-3 text-lg shadow-xl shadow-white/5"
                  >
                    {currentQuestionIdx === mockQuestions.length - 1 ? t.finishQuiz : t.nextQuestion}
                    <ArrowRight className="w-6 h-6" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-3xl p-12 text-center space-y-8"
            >
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
                  <Sparkles className="w-12 h-12 text-blue-400" />
                </div>
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {Math.round((score / mockQuestions.length) * 100)}%
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Quiz Completed!</h1>
                <p className="text-gray-500">You scored {score} out of {mockQuestions.length} correct.</p>
              </div>
              <div className="grid gap-3">
                <button
                  onClick={handleStart}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
                <button
                  onClick={() => setCurrentStep("start")}
                  className="w-full py-4 bg-white/5 text-gray-400 font-bold rounded-2xl hover:bg-white/10 transition-all"
                >
                  Back to Hub
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
