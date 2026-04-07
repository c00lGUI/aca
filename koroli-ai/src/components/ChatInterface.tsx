import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Send, 
  User, 
  Bot, 
  Sparkles, 
  Loader2, 
  Code, 
  Copy, 
  Check, 
  Paperclip, 
  X, 
  FileText, 
  Image as ImageIcon,
  Camera,
  StickyNote,
  Save,
  Mic,
  Volume2,
  VolumeX,
  Zap,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { studyAssistant, FilePart } from "../services/gemini";
import { Language, translations } from "../translations";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
  files?: FilePart[];
  isStreaming?: boolean;
}

const CodeBlock = ({ children, className }: { children: any; className?: string }) => {
  const [copied, setCopied] = useState(false);
  const language = className?.replace("language-", "") || "text";

  const onCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6">
      <div className="absolute right-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onCopy}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-2"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          <span className="text-[10px] font-bold uppercase tracking-widest">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <div className="absolute left-4 top-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest pointer-events-none">
        {language}
      </div>
      <pre className={`${className} !mt-0 !bg-black/40 !p-8 !pt-14 rounded-2xl border border-white/5 overflow-x-auto custom-scrollbar`}>
        <code>{children}</code>
      </pre>
    </div>
  );
};

export default function ChatInterface({ 
  waterfallEnabled = true,
  language,
  selectedModel = "gemini-3-flash-preview"
}: { 
  waterfallEnabled?: boolean;
  language: Language;
  selectedModel?: string;
}) {
  const t = useMemo(() => translations[language], [language]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      text: t.aiGreeting,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FilePart[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem("koroli_notes") || "";
  });
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSaveNotes = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    localStorage.setItem("koroli_notes", notes);
  }, [notes]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: FilePart[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await convertToBase64(file);
      newFiles.push({
        mimeType: file.type,
        data: base64.split(',')[1]
      });
    }
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSpeech = (text: string, id: string) => {
    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeakingMessageId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingMessageId(id);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && selectedFiles.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
      timestamp: new Date(),
      files: selectedFiles.length > 0 ? [...selectedFiles] : undefined
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    const currentFiles = [...selectedFiles];
    setSelectedFiles([]);
    setIsLoading(true);

    const history = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: m.text,
      files: m.files
    }));

    const response = await studyAssistant(input, history, currentFiles, selectedModel);

    if (waterfallEnabled) {
      // Waterfall (Typewriter) Animation
      const botMessageId = (Date.now() + 1).toString();
      const botMessage: Message = {
        id: botMessageId,
        role: "bot",
        text: "",
        timestamp: new Date(),
        isStreaming: true
      };
      
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);

      let currentText = "";
      const words = response.split(" ");
      for (let i = 0; i < words.length; i++) {
        currentText += (i === 0 ? "" : " ") + words[i];
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === botMessageId ? { ...msg, text: currentText } : msg
          )
        );
        await new Promise(resolve => setTimeout(resolve, 30)); // Waterfall speed
      }
      
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMessageId ? { ...msg, isStreaming: false } : msg
        )
      );
    } else {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full bg-[#0a0a0a] relative overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Header (Desktop Only) */}
        <header className="hidden md:flex h-20 border-b border-white/5 items-center justify-between px-12 bg-black/20 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                {selectedModel === "gemini-3-flash-preview" ? t.modelUltra : 
                 selectedModel === "gemini-3.1-pro-preview" ? t.modelPro : t.modelFlash}
              </span>
            </div>
            <button 
              onClick={() => {
                setIsSummarizing(true);
                setTimeout(() => setIsSummarizing(false), 2000);
              }}
              className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full hover:bg-purple-500/20 transition-all group"
            >
              {isSummarizing ? (
                <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-purple-400" />
              )}
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{t.summarizePdf}</span>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsVoiceActive(!isVoiceActive)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                isVoiceActive ? "bg-red-500/20 text-red-400" : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <Mic className={`w-4 h-4 ${isVoiceActive ? "animate-pulse" : ""}`} />
              <span className="text-xs font-bold uppercase tracking-widest">{t.voiceMode}</span>
            </button>
            <button 
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                showNotes ? "bg-blue-500 text-white" : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <StickyNote className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">{t.quickNotes}</span>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-20 space-y-8 md:space-y-12 custom-scrollbar pb-40 md:pb-48">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 md:gap-8 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "bot" && (
                  <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/10 shrink-0">
                    <Bot className="text-white w-5 h-5 md:w-7 md:h-7" />
                  </div>
                )}
                
                <div className={`max-w-[90%] md:max-w-[75%] space-y-2 md:space-y-3 ${message.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`p-4 md:p-8 rounded-2xl md:rounded-3xl text-sm md:text-base leading-relaxed ${
                    message.role === "user" 
                      ? "bg-blue-600/10 border border-blue-500/30 text-white shadow-xl shadow-blue-600/5" 
                      : "glass-panel text-gray-200"
                  }`}>
                    {message.files && message.files.length > 0 && (
                      <div className="flex flex-wrap gap-4 mb-6">
                        {message.files.map((file, idx) => (
                          <div key={idx} className="relative group">
                            {file.mimeType.startsWith("image/") ? (
                              <img 
                                src={`data:${file.mimeType};base64,${file.data}`} 
                                alt="Attached" 
                                className="max-w-full md:max-w-[300px] max-h-[300px] rounded-2xl border border-white/10"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl border border-white/10">
                                <FileText className="w-5 h-5 text-blue-400" />
                                <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[150px]">
                                  {file.mimeType.split('/')[1]} File
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="markdown-body prose prose-invert prose-base max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            return !inline ? (
                              <CodeBlock className={className}>{children}</CodeBlock>
                            ) : (
                              <code className="bg-white/10 px-1.5 py-0.5 rounded text-blue-400 font-mono text-sm" {...props}>
                                {children}
                              </code>
                            );
                          },
                          img({ node, ...props }: any) {
                            return (
                              <img 
                                {...props} 
                                className="max-w-full h-auto rounded-2xl border border-white/10 my-4" 
                                referrerPolicy="no-referrer"
                              />
                            );
                          }
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                      {message.isStreaming && (
                        <motion.span 
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                          className="inline-block w-2 h-5 bg-blue-400 ml-1 align-middle"
                        />
                      )}
                    </div>
                    {message.role === "bot" && !message.isStreaming && (
                      <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                        <button 
                          onClick={() => toggleSpeech(message.text, message.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
                            speakingMessageId === message.id 
                              ? "bg-blue-500/20 text-blue-400" 
                              : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300"
                          }`}
                        >
                          {speakingMessageId === message.id ? (
                            <>
                              <VolumeX className="w-4 h-4" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">{t.stop}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-4 h-4" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">{t.speak}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-600 uppercase font-bold tracking-[0.2em] px-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {message.role === "user" && (
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                    <User className="text-gray-400 w-6 h-6 md:w-7 md:h-7" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-6 justify-start"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/10 shrink-0">
                <Loader2 className="text-white w-6 h-6 md:w-7 md:h-7 animate-spin" />
              </div>
              <div className="glass-panel p-5 md:p-6 rounded-3xl flex items-center gap-4">
                <div className="flex gap-1.5">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-blue-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-blue-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-blue-400 rounded-full" />
                </div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Koroli is thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 md:p-12 lg:p-16 pt-0 bg-gradient-to-t from-[#020205] via-[#020205] to-transparent z-10">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* File Previews */}
            <AnimatePresence>
              {selectedFiles.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex flex-wrap gap-4 p-5 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl"
                >
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative group">
                      {file.mimeType.startsWith("image/") ? (
                        <img 
                          src={`data:${file.mimeType};base64,${file.data}`} 
                          alt="Preview" 
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-2xl border border-white/10"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-2xl flex flex-col items-center justify-center border border-white/10">
                          <FileText className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
                          <span className="text-[10px] font-bold mt-2 uppercase">{file.mimeType.split('/')[1]}</span>
                        </div>
                      )}
                      <button 
                        onClick={() => removeFile(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
              <div className="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-3xl p-2 md:p-4 shadow-2xl">
                <input 
                  type="file" 
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,application/pdf,text/*"
                />
                <input 
                  type="file" 
                  ref={cameraInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                />
                
                <div className="flex items-center">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 md:p-3 text-gray-500 hover:text-white transition-colors"
                    title="Attach Files"
                  >
                    <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button 
                    onClick={() => setIsVoiceActive(!isVoiceActive)}
                    className={`p-1.5 md:p-3 transition-colors ${isVoiceActive ? "text-red-400" : "text-gray-500 hover:text-white"}`}
                    title="Voice Input"
                  >
                    <Mic className={`w-4 h-4 md:w-5 md:h-5 ${isVoiceActive ? "animate-pulse" : ""}`} />
                  </button>
                </div>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={t.typeMessage}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-600 px-2 md:px-4 py-2 md:py-3 text-sm md:text-base"
                />
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && selectedFiles.length === 0) || isLoading}
                  className={`p-2 md:p-3 rounded-xl transition-all ${
                    (input.trim() || selectedFiles.length > 0) && !isLoading 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95" 
                      : "text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <p className="text-center text-[8px] md:text-[10px] text-gray-600 mt-4 uppercase tracking-[0.2em] font-bold">
            Koroli AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>

      {/* Quick Notes Sidebar (Cool Feature) */}
      <AnimatePresence>
        {showNotes && (
          <motion.div 
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="w-80 bg-[#0a0a0a] border-l border-white/10 flex flex-col z-20 shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm uppercase tracking-widest">{t.quickNotes}</h3>
              </div>
              <button 
                onClick={() => setShowNotes(false)}
                className="p-1 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-6">
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
                className="w-full h-full bg-transparent border-none focus:ring-0 text-sm text-gray-300 resize-none placeholder:text-gray-700 custom-scrollbar"
              />
            </div>
            <div className="p-6 border-t border-white/5 space-y-4">
              <button 
                onClick={handleSaveNotes}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 transition-all group"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest text-white">{t.saving}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-white">{t.saveNotes}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
