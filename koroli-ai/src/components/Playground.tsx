import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Terminal, Play, RotateCcw, Copy, Check, Code2, Sparkles } from "lucide-react";
import { Language, translations } from "../translations";

export default function Playground({ language }: { language: Language }) {
  const t = useMemo(() => translations[language], [language]);

  const [code, setCode] = useState(`// Welcome to Koroli AI Playground
// Write your code here and see the output

function greet(name) {
  console.log("Hello, " + name + "!");
}

greet("Koroli User");`);

  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setOutput("");
    
    // Mocking code execution for the playground
    setTimeout(() => {
      try {
        // In a real app, we'd use a sandboxed environment
        // For this demo, we'll just mock the output based on common patterns
        if (code.includes("console.log")) {
          const matches = code.match(/console\.log\((.*)\)/g);
          if (matches) {
            const results = matches.map(m => {
              const content = m.match(/console\.log\((.*)\)/)?.[1];
              return content?.replace(/['"]/g, "") || "";
            });
            setOutput(results.join("\n") + "\n\n[Execution Successful]");
          } else {
            setOutput("[Execution Successful]");
          }
        } else {
          setOutput("[Execution Successful]");
        }
      } catch (err) {
        setOutput("Error: " + (err as Error).message);
      }
      setIsRunning(false);
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col bg-[#020205] relative">
      <header className="h-20 border-b border-white/5 flex items-center justify-between px-12 bg-black/40 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
            <Terminal className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">{t.playground}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setCode("")}
            className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleRun}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {isRunning ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            {t.runCode}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col border-r border-white/10 bg-black/20">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/5">
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">main.js</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full bg-transparent p-6 text-sm font-mono text-blue-100 placeholder:text-gray-700 focus:outline-none resize-none custom-scrollbar"
          />
        </div>

        {/* Output Area */}
        <div className="w-1/3 flex flex-col bg-black/40">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/5">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.output}</span>
          </div>
          <div className="flex-1 p-6 font-mono text-sm overflow-y-auto custom-scrollbar">
            {isRunning ? (
              <div className="flex items-center gap-2 text-gray-500 italic">
                <Sparkles className="w-4 h-4 animate-pulse text-blue-400" />
                Executing...
              </div>
            ) : output ? (
              <pre className="text-green-400/90 whitespace-pre-wrap leading-relaxed">{output}</pre>
            ) : (
              <div className="text-gray-700 italic">Run your code to see the output here.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
