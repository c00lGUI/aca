import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Upload, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Language, translations } from "../translations";
import { studyAssistant } from "../services/gemini";

export default function Summarizer({ language }: { language: Language }) {
  const [file, setFile] = useState<{ name: string; data: string; mimeType: string } | null>(null);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const t = useMemo(() => translations[language], [language]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(",")[1];
      setFile({
        name: uploadedFile.name,
        data: base64,
        mimeType: uploadedFile.type
      });
    };
    reader.readAsDataURL(uploadedFile);
  };

  const generateSummary = async () => {
    if (!file) return;
    setIsLoading(true);
    setError("");
    setSummary("");

    try {
      const prompt = "Please provide a detailed, bullet-point summary of this PDF document. Focus on the key concepts and main takeaways.";
      const response = await studyAssistant(prompt, [], [file]);
      setSummary(response);
    } catch (err) {
      setError("Failed to generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col p-4 md:p-12 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto w-full space-y-8 md:space-y-12">
        <header className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight">{t.summarizer}</h1>
          </div>
          <p className="text-gray-500 text-sm md:text-lg font-medium tracking-tight">
            Upload any PDF and get an instant, high-quality summary powered by Koroli AI.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Upload Section */}
          <div className="space-y-4 md:space-y-6">
            <div className="glass-panel border border-white/5 rounded-2xl md:rounded-[32px] p-6 md:p-8 space-y-6 md:space-y-8">
              <div className="space-y-1 md:space-y-2">
                <h3 className="text-lg md:text-xl font-bold text-white">{t.uploadPdf}</h3>
                <p className="text-xs md:text-sm text-gray-500">Maximum file size: 10MB</p>
              </div>

              <label className="block">
                <div className={`relative group cursor-pointer border-2 border-dashed rounded-xl md:rounded-[24px] p-8 md:p-12 transition-all ${
                  file ? "border-blue-500/50 bg-blue-500/5" : "border-white/10 hover:border-white/20 bg-white/5"
                }`}>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf"
                    onChange={handleFileUpload}
                  />
                  <div className="flex flex-col items-center gap-3 md:gap-4 text-center">
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all ${
                      file ? "bg-blue-500 text-white" : "bg-white/5 text-gray-500 group-hover:text-gray-300"
                    }`}>
                      {file ? <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" /> : <Upload className="w-6 h-6 md:w-8 md:h-8" />}
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-sm md:text-base text-gray-200">{file ? file.name : "Click to browse"}</p>
                      <p className="text-[10px] md:text-xs text-gray-500">or drag and drop your PDF here</p>
                    </div>
                  </div>
                </div>
              </label>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <button
                onClick={generateSummary}
                disabled={!file || isLoading}
                className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                  !file || isLoading
                    ? "bg-white/5 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {t.summarize}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Section */}
          <div className="space-y-6">
            <div className="glass-panel border border-white/5 rounded-[32px] p-8 h-full min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white">{t.summary}</h3>
                {summary && (
                  <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold text-green-400 uppercase tracking-widest">
                    Ready
                  </div>
                )}
              </div>

              <div className="flex-1 relative">
                <AnimatePresence mode="wait">
                  {summary ? (
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed"
                    >
                      {summary.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-700">
                        <FileText className="w-8 h-8" />
                      </div>
                      <p className="text-gray-600 font-medium">{t.noPdf}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
