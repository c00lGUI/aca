import { useMemo } from "react";
import { motion } from "motion/react";
import { 
  BarChart3, 
  Clock, 
  Target, 
  Zap, 
  Calendar,
  Award
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Language, translations } from "../translations";
import { analyticsService } from "../services/analyticsService";

export default function Analytics({ language }: { language: Language }) {
  const t = useMemo(() => translations[language], [language]);
  const statsData = useMemo(() => analyticsService.getStats(), []);
  const chartData = useMemo(() => analyticsService.getActivityData(), []);

  const stats = [
    { label: t.totalStudyTime, value: `${statsData.totalHours}h`, icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: t.topicsMastered, value: statsData.topicsMastered.toString(), icon: Target, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: t.quizAccuracy, value: `${statsData.accuracy}%`, icon: BarChart3, color: "text-green-400", bg: "bg-green-500/10" },
    { label: t.studyStreak, value: `${statsData.streak} days`, icon: Zap, color: "text-orange-400", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto p-8 md:p-16 lg:p-24 custom-scrollbar relative">
      <div className="max-w-7xl mx-auto space-y-20">
        <header className="space-y-4">
          <h1 className="text-5xl font-bold text-white tracking-tight">{t.analytics}</h1>
          <p className="text-gray-500 font-medium text-lg tracking-tight">{t.testKnowledge}</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel rounded-[32px] p-8 space-y-6"
            >
              <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center shadow-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{stat.label}</p>
                <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 glass-panel rounded-[40px] p-10 md:p-12 space-y-12 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                <Calendar className="w-6 h-6 text-blue-400" />
                {t.studyActivity}
              </h2>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{t.hours}</span>
                </div>
              </div>
            </div>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                    }}
                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorHours)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel rounded-[40px] p-10 md:p-12 space-y-10 shadow-2xl">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <Award className="w-6 h-6 text-purple-400" />
              {t.achievements}
            </h2>
            <div className="space-y-6">
              {[
                { title: "Early Bird", desc: "Study before 8 AM", progress: 100, icon: "🌅" },
                { title: "Night Owl", desc: "Study after 10 PM", progress: 65, icon: "🦉" },
                { title: "Quiz Master", desc: "10 perfect scores", progress: 40, icon: "🎯" },
                { title: "Consistent", desc: "7 day streak", progress: 85, icon: "🔥" },
              ].map((ach) => (
                <div key={ach.title} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{ach.icon}</span>
                      <div>
                        <p className="font-bold text-white tracking-tight">{ach.title}</p>
                        <p className="text-xs text-gray-500 font-medium">{ach.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-400">{ach.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]" 
                      style={{ width: `${ach.progress}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
