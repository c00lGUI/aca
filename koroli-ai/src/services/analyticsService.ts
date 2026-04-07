export interface StudySession {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // in minutes
}

export interface QuizResult {
  id: string;
  score: number;
  totalQuestions: number;
  date: number;
}

export const analyticsService = {
  getSessions: (): StudySession[] => {
    const data = localStorage.getItem("study_sessions");
    return data ? JSON.parse(data) : [];
  },

  addSession: (duration: number) => {
    const sessions = analyticsService.getSessions();
    const newSession: StudySession = {
      id: Date.now().toString(),
      startTime: Date.now() - duration * 60 * 1000,
      endTime: Date.now(),
      duration
    };
    localStorage.setItem("study_sessions", JSON.stringify([newSession, ...sessions]));
  },

  getQuizResults: (): QuizResult[] => {
    const data = localStorage.getItem("quiz_results");
    return data ? JSON.parse(data) : [];
  },

  addQuizResult: (score: number, totalQuestions: number) => {
    const results = analyticsService.getQuizResults();
    const newResult: QuizResult = {
      id: Date.now().toString(),
      score,
      totalQuestions,
      date: Date.now()
    };
    localStorage.setItem("quiz_results", JSON.stringify([newResult, ...results]));
  },

  getStats: () => {
    const sessions = analyticsService.getSessions();
    const results = analyticsService.getQuizResults();

    const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    const totalCorrect = results.reduce((acc, r) => acc + r.score, 0);
    const totalQuestions = results.reduce((acc, r) => acc + r.totalQuestions, 0);
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Simple streak calculation (days with at least one session)
    const uniqueDays = new Set(sessions.map(s => new Date(s.endTime).toDateString()));
    const streak = uniqueDays.size;

    return {
      totalHours,
      topicsMastered: results.length,
      accuracy,
      streak
    };
  },

  getActivityData: () => {
    const sessions = analyticsService.getSessions();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const activity = days.map(day => ({ name: day, hours: 0 }));

    sessions.forEach(session => {
      const dayIndex = new Date(session.endTime).getDay();
      activity[dayIndex].hours += session.duration / 60;
    });

    // Reorder to start from Monday
    const mondayFirst = [...activity.slice(1), activity[0]];
    return mondayFirst.map(d => ({ ...d, hours: Number(d.hours.toFixed(1)) }));
  }
};
