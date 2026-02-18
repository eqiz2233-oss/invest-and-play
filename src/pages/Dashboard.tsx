import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";
import { levels } from "@/data/levels";
import LanguageToggle from "@/components/LanguageToggle";
import {
  Star, Flame, ChevronRight, ChevronLeft, Trophy, Lock, Home, Calendar, ScrollText,
} from "lucide-react";

// ─── Helpers ───
const getWeekKey = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
};

const INVESTMENT_DATES = [5, 15, 25];

const formatMoney = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

const daysLeftInMonth = () => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return end.getDate() - now.getDate();
};

// ─── Dashboard ───
const Dashboard = () => {
  const navigate = useNavigate();
  const {
    xp, streak, levels: levelProgress, startLevel, resetAll,
    financialSnapshot, calculateSnapshot, questStatuses, completeQuest, skipQuest, monthlyLogs,
  } = useGame();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"home" | "calendar" | "history">("home");

  useEffect(() => {
    calculateSnapshot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const snap = financialSnapshot;
  const isExample = !snap || snap.monthlyIncome === 30000;

  const tabs = [
    { id: "home" as const, icon: Home, label: t("tab.home") },
    { id: "calendar" as const, icon: Calendar, label: t("tab.calendar") },
    { id: "history" as const, icon: ScrollText, label: t("tab.history") },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm">💰</span>
            </div>
            <span className="font-black text-foreground">FinGame</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <div className="xp-badge"><Star className="w-3.5 h-3.5" />{xp} XP</div>
            <div className="streak-badge"><Flame className="w-3.5 h-3.5" />{streak}</div>
          </div>
        </div>
        {/* Desktop tabs */}
        <div className="hidden md:flex container mx-auto px-4 border-t border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 max-w-lg">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div key="home" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <HomeTab snap={snap} isExample={isExample} />
            </motion.div>
          )}
          {activeTab === "calendar" && (
            <motion.div key="calendar" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <CalendarTab snap={snap} isExample={isExample} />
            </motion.div>
          )}
          {activeTab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <HistoryTab />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-card border-t border-border">
        <div className="flex justify-around items-center py-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div className="w-6 h-0.5 rounded-full bg-primary" layoutId="tabIndicator" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

// ═══════════════════════════════════
// TAB 1: HOME (Quest Board)
// ═══════════════════════════════════
const HomeTab = ({ snap, isExample }: { snap: ReturnType<typeof useGame>["financialSnapshot"]; isExample: boolean }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    xp, streak, levels: levelProgress, startLevel, resetAll,
    questStatuses, completeQuest, skipQuest,
  } = useGame();

  const completedCount = levelProgress.filter(l => l.status === "complete").length;
  const monthlySavings = snap?.monthlySavings ?? 10000;
  const monthlyExpenses = snap?.monthlyExpenses ?? 20000;
  const savingsRate = snap?.savingsRate ?? 33;
  const savingsTarget = monthlySavings;
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthProgress = (dayOfMonth / daysInMonth) * 100;
  const remaining = daysLeftInMonth();

  const weekKey = getWeekKey();
  const isInvestmentWeek = INVESTMENT_DATES.some(d => {
    const diff = d - dayOfMonth;
    return diff >= 0 && diff < 7;
  });

  const weeklyQuests = useMemo(() => {
    const quests = [
      {
        id: "save_week",
        icon: "💰",
        title: t("home.questSave"),
        amount: Math.round(monthlySavings / 4),
        description: "",
        type: "save",
      },
      {
        id: "invest_check",
        icon: "📈",
        title: t("home.questReview"),
        amount: null as number | null,
        description: "",
        type: "review",
      },
      {
        id: "expense_log",
        icon: "🧾",
        title: t("home.questTrack"),
        amount: Math.round(monthlyExpenses / 4),
        description: "",
        type: "track",
      },
    ] as Array<{ id: string; icon: string; title: string; amount: number | null; description: string; type: string }>;
    if (isInvestmentWeek) {
      quests.push({
        id: "invest_this_week",
        icon: "🏦",
        title: t("home.questInvest"),
        amount: Math.round((monthlySavings * 0.4) / 3),
        description: "DCA",
        type: "invest",
      });
    }
    return quests;
  }, [monthlySavings, monthlyExpenses, isInvestmentWeek, t]);

  const getQuestStatus = (questId: string) =>
    questStatuses.find(q => q.questId === questId && q.weekKey === weekKey)?.status || "todo";

  const [confettiQuest, setConfettiQuest] = useState<string | null>(null);

  const handleComplete = (questId: string) => {
    completeQuest(questId, weekKey);
    setConfettiQuest(questId);
    setTimeout(() => setConfettiQuest(null), 1500);
  };

  const borderColor = (type: string) => {
    switch (type) {
      case "save": return "border-l-[hsl(var(--primary))]";
      case "invest": return "border-l-[hsl(var(--accent))]";
      case "track": return "border-l-[hsl(var(--secondary))]";
      default: return "border-l-[hsl(var(--muted-foreground))]";
    }
  };

  // Active level
  const activeLevel = levelProgress.find(l => l.status === "active");
  const activeLevelData = activeLevel ? levels.find(l => l.id === activeLevel.levelId) : null;
  const levelQuestionsDone = activeLevel?.answers.length || 0;
  const levelQuestionsTotal = activeLevelData?.questions.length || 0;

  return (
    <div className="space-y-6">
      {isExample && (
        <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-3 text-center text-sm text-secondary-foreground">
          ✨ {t("home.exampleNote")}
        </div>
      )}

      {/* Section A: Monthly Mission */}
      <div className="card-game bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="font-black text-foreground text-lg">🎯 {t("home.monthlyMission")}</h2>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">💰 {t("cal.save")}</span>
                <span className="font-bold text-foreground">{formatMoney(savingsTarget)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">🛍️ {t("cal.spendMax")}</span>
                <span className="font-bold text-foreground">{formatMoney(monthlyExpenses)}</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="progress-track h-2">
                <motion.div
                  className="progress-fill h-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(monthProgress, 100)}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{remaining} {t("home.daysLeft")}</p>
            </div>
          </div>
          {/* Circular progress */}
          <div className="relative w-16 h-16 shrink-0 ml-4">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
              <motion.circle
                cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                strokeDasharray={`${monthProgress} ${100 - monthProgress}`}
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 100" }}
                animate={{ strokeDasharray: `${monthProgress} ${100 - monthProgress}` }}
                transition={{ duration: 1 }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-foreground">
              {Math.round(monthProgress)}%
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate("/snapshot")}
          className="mt-3 text-xs font-bold text-primary hover:underline"
        >
          {t("home.viewSnapshot")}
        </button>
      </div>

      {/* Section B: Weekly Quests */}
      <div>
        <h3 className="font-black text-foreground mb-3">📋 {t("home.weeklyQuests")}</h3>
        <div className="space-y-3">
          {weeklyQuests.map(quest => {
            const status = getQuestStatus(quest.id);
            const isDone = status === "done";
            const isSkipped = status === "skipped";

            return (
              <motion.div
                key={quest.id}
                className={`relative card-game py-4 border-l-4 ${borderColor(quest.type)} transition-colors ${
                  isDone ? "bg-primary/5" : isSkipped ? "bg-muted/50 opacity-60" : ""
                }`}
                layout
              >
                {/* Confetti */}
                {confettiQuest === quest.id && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          left: `${30 + Math.random() * 40}%`,
                          top: "50%",
                          backgroundColor: ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))"][i % 3],
                        }}
                        initial={{ y: 0, opacity: 1, scale: 1 }}
                        animate={{ y: -60 - Math.random() * 40, x: (Math.random() - 0.5) * 80, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    ))}
                  </div>
                )}

                {/* XP float */}
                {confettiQuest === quest.id && (
                  <motion.div
                    className="absolute top-2 right-4 text-sm font-black text-primary"
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -30 }}
                    transition={{ duration: 1 }}
                  >
                    +10 XP
                  </motion.div>
                )}

                <div className="flex items-center gap-3">
                  <span className="text-2xl">{quest.icon}</span>
                  <div className="flex-1">
                    <p className={`font-bold text-foreground text-sm ${isDone ? "line-through opacity-60" : ""}`}>
                      {quest.title}
                    </p>
                    {quest.amount !== null && (
                      <p className="text-xs text-muted-foreground">{formatMoney(quest.amount)}</p>
                    )}
                  </div>
                  {isDone ? (
                    <span className="text-primary font-bold text-sm">✅</span>
                  ) : isSkipped ? (
                    <span className="text-muted-foreground text-xs">{t("quest.skip")}</span>
                  ) : (
                    <div className="flex gap-2">
                      <motion.button
                        className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleComplete(quest.id)}
                      >
                        {t("quest.markDone")}
                      </motion.button>
                      <button
                        className="px-2 py-1.5 rounded-xl text-xs text-muted-foreground hover:bg-muted transition-colors"
                        onClick={() => skipQuest(quest.id, weekKey, quest.amount || 0)}
                      >
                        {t("quest.skip")}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Section C: Current Level */}
      {activeLevelData && (
        <motion.div
          className="card-game cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => { startLevel(activeLevelData.id); navigate(`/level/${activeLevelData.id}`); }}
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeLevelData.emoji}</span>
            <div className="flex-1">
              <span className="text-xs font-bold text-muted-foreground uppercase">Level {activeLevelData.id}</span>
              <h3 className="font-bold text-foreground">{t(`level${activeLevelData.id}.title`)}</h3>
              <div className="progress-track h-2 mt-2">
                <div className="progress-fill h-2" style={{ width: `${levelQuestionsTotal > 0 ? (levelQuestionsDone / levelQuestionsTotal) * 100 : 0}%` }} />
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </motion.div>
      )}

      {/* All Levels Link */}
      <motion.div
        className="card-game cursor-pointer hover:border-primary/30 transition-colors"
        onClick={() => navigate("/levels")}
        whileHover={{ y: -2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎮</span>
            <div>
              <h3 className="font-bold text-foreground text-sm">{t("home.allLevels")}</h3>
              <p className="text-xs text-muted-foreground">{completedCount}/5 {t("dash.levelsComplete")}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </motion.div>

      {/* Plan CTA */}
      <motion.button
        className="w-full btn-playful bg-primary text-primary-foreground py-4 text-lg"
        onClick={() => navigate("/plan")}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {t("plan.startPlanning")}
      </motion.button>

      {/* Quick Stats */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1 text-muted-foreground">⭐ {xp} XP</span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">🔥 {streak} {t("home.daysLeft").split(" ")[0] === "days" ? "days" : "วัน"}</span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">💰 {Math.round(savingsRate)}%</span>
      </div>

      {/* Reset */}
      <div className="text-center">
        <button
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          onClick={() => { if (window.confirm(t("dash.resetConfirm"))) resetAll(); }}
        >
          {t("dash.resetProgress")}
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════
// TAB 2: CALENDAR
// ═══════════════════════════════════
const CalendarTab = ({ snap, isExample }: { snap: ReturnType<typeof useGame>["financialSnapshot"]; isExample: boolean }) => {
  const { t } = useLanguage();
  const { skipQuest } = useGame();
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showSkipMsg, setShowSkipMsg] = useState(false);

  const monthlySavings = snap?.monthlySavings ?? 10000;
  const monthlyExpenses = snap?.monthlyExpenses ?? 20000;
  const monthlyInvestment = Math.round(monthlySavings * 0.4);
  const savingsOnly = monthlySavings - monthlyInvestment;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

  const weekdays = [
    t("weekday.mon"), t("weekday.tue"), t("weekday.wed"),
    t("weekday.thu"), t("weekday.fri"), t("weekday.sat"), t("weekday.sun"),
  ];

  const getDotColor = (date: number) => {
    if (INVESTMENT_DATES.includes(date)) return "bg-accent"; // blue
    const dayOfWeek = (new Date(currentYear, currentMonth, date).getDay() + 6) % 7;
    if (dayOfWeek === 0) return "bg-primary"; // Monday = green savings
    if (dayOfWeek === 6) return "bg-secondary"; // Sunday = yellow checkpoint
    return null;
  };

  const getEventType = (date: number) => {
    if (INVESTMENT_DATES.includes(date)) return "invest";
    const dayOfWeek = (new Date(currentYear, currentMonth, date).getDay() + 6) % 7;
    if (dayOfWeek === 0) return "save";
    if (dayOfWeek === 6) return "checkpoint";
    return null;
  };

  // Mock progress (in real app, would use actual tracked data)
  const savingsProgress = isCurrentMonth ? Math.min(100, (today.getDate() / daysInMonth) * 100 * 0.9) : 80;
  const investProgress = isCurrentMonth ? Math.min(100, (today.getDate() / daysInMonth) * 100 * 0.7) : 67;
  const expenseProgress = isCurrentMonth ? Math.min(100, (today.getDate() / daysInMonth) * 100 * 0.85) : 78;

  const getEncouragement = () => {
    const avg = (savingsProgress + investProgress) / 2;
    if (avg >= 80) return "🚀 " + t("cal.encourage80");
    if (avg >= 50) return "🔥 " + t("cal.encourage50");
    return "💪 " + t("cal.encourageStart");
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  const handleSkip = () => {
    setShowSkipMsg(true);
    setTimeout(() => setShowSkipMsg(false), 3000);
  };

  return (
    <div className="space-y-6">
      {isExample && (
        <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-3 text-center text-sm text-secondary-foreground">
          ✨ {t("home.exampleNote")}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="card-game">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h2 className="font-black text-foreground">{t(`month.${currentMonth}`)} {currentYear}</h2>
          <button onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} className="h-10" />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const date = i + 1;
            const isToday = isCurrentMonth && today.getDate() === date;
            const dot = getDotColor(date);
            const isSelected = selectedDay === date;

            return (
              <motion.button
                key={date}
                onClick={() => setSelectedDay(isSelected ? null : date)}
                className={`h-10 rounded-xl text-xs font-bold relative transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : isToday
                    ? "bg-primary/20 text-primary border-2 border-primary/40"
                    : "bg-muted/50 text-foreground hover:bg-muted"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {date}
                {dot && !isSelected && (
                  <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${dot}`} />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Day Detail Bottom Sheet */}
      <AnimatePresence>
        {selectedDay && getEventType(selectedDay) && (
          <motion.div
            className="card-game border-primary/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-3" />
            <h3 className="font-black text-foreground mb-1">
              {t(`month.${currentMonth}`)} {selectedDay}, {currentYear}
            </h3>
            {getEventType(selectedDay) === "invest" && (
              <div className="space-y-2 mt-3">
                <p className="text-sm font-bold text-accent">📈 {t("cal.investDay")}</p>
                <p className="text-sm text-foreground">{t("cal.invest")}: {formatMoney(Math.round(monthlyInvestment / 3))}</p>
                <p className="text-xs text-muted-foreground italic">DCA — {t("cal.dcaTip")}</p>
                <div className="flex gap-2 mt-3">
                  <motion.button
                    className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
                    whileTap={{ scale: 0.95 }}
                  >
                    ✅ {t("quest.markDone")}
                  </motion.button>
                  <button
                    className="flex-1 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
                    onClick={handleSkip}
                  >
                    {t("cal.skipMonth")}
                  </button>
                </div>
              </div>
            )}
            {getEventType(selectedDay) === "save" && (
              <div className="mt-3">
                <p className="text-sm font-bold text-primary">💰 {t("cal.saveDay")}</p>
                <p className="text-sm text-foreground mt-1">{formatMoney(Math.round(savingsOnly / 4))}</p>
              </div>
            )}
            {getEventType(selectedDay) === "checkpoint" && (
              <div className="mt-3">
                <p className="text-sm font-bold text-secondary-foreground">🎉 {t("cal.checkpoint")}</p>
              </div>
            )}

            {showSkipMsg && (
              <motion.p
                className="mt-3 text-sm text-primary font-bold text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {t("cal.skipConfirm")}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Month Summary */}
      <div className="card-game">
        <h3 className="font-black text-foreground mb-3">{t(`month.${currentMonth}`)} {currentYear}</h3>
        <div className="space-y-3">
          <SummaryBar label={t("cal.save")} current={Math.round(savingsOnly * savingsProgress / 100)} target={savingsOnly} pct={savingsProgress} color="bg-primary" />
          <SummaryBar label={t("cal.invest")} current={Math.round(monthlyInvestment * investProgress / 100)} target={monthlyInvestment} pct={investProgress} color="bg-accent" />
          <SummaryBar label={t("cal.spendMax")} current={Math.round(monthlyExpenses * expenseProgress / 100)} target={monthlyExpenses} pct={expenseProgress} color="bg-secondary" />
        </div>
        <p className="text-sm font-bold text-center mt-4">{getEncouragement()}</p>
      </div>
    </div>
  );
};

const SummaryBar = ({ label, current, target, pct, color }: { label: string; current: number; target: number; pct: number; color: string }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-muted-foreground font-bold">{label}</span>
      <span className="text-foreground font-bold">{formatMoney(current)} / {formatMoney(target)} ({Math.round(pct)}%)</span>
    </div>
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 0.8 }}
      />
    </div>
  </div>
);

// ═══════════════════════════════════
// TAB 3: HISTORY
// ═══════════════════════════════════
const HistoryTab = () => {
  const { t } = useLanguage();
  const { xp, monthlyLogs, streak } = useGame();

  const monthsActive = monthlyLogs.length;
  const streakMonths = monthlyLogs.filter(l => l.status === "success" || l.status === "adjusted").length;

  const statusConfig: Record<string, { badge: string; color: string; borderColor: string }> = {
    success: { badge: `✅ ${t("history.success")}`, color: "bg-primary/10 text-primary", borderColor: "border-l-[hsl(var(--primary))]" },
    adjusted: { badge: `⚡ ${t("history.adjusted")}`, color: "bg-secondary/10 text-secondary-foreground", borderColor: "border-l-[hsl(var(--secondary))]" },
    trying: { badge: `💪 ${t("history.trying")}`, color: "bg-[hsl(25,90%,55%)]/10 text-[hsl(25,90%,45%)]", borderColor: "border-l-[hsl(25,90%,55%)]" },
    rollover: { badge: `🔄 ${t("history.rollover")}`, color: "bg-accent/10 text-accent", borderColor: "border-l-[hsl(var(--accent))]" },
  };

  // Month name helper
  const getMonthName = (key: string) => {
    const [y, m] = key.split("-");
    const monthIdx = parseInt(m) - 1;
    return `${t(`month.${monthIdx}`)} ${y}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-game text-center">
        <h2 className="font-black text-foreground text-lg">📜 {t("history.title")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {monthsActive} {t("history.monthsActive")} | ⭐ {xp} XP
        </p>
      </div>

      {/* Streak */}
      <div className="card-game">
        <h3 className="font-bold text-foreground mb-2">🔥 {t("history.streak")}</h3>
        <div className="flex items-center gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-3 rounded-full ${i < streakMonths ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          {["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."].map((m, i) => (
            <span key={i} className="text-[8px] text-muted-foreground">{m}</span>
          ))}
        </div>
      </div>

      {/* Monthly Cards or Empty State */}
      {monthlyLogs.length === 0 ? (
        <div className="card-game text-center py-10">
          <span className="text-4xl">🌱</span>
          <h3 className="font-black text-foreground mt-3">{t("history.empty")}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t("history.emptySub")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {monthlyLogs.map(log => {
            const cfg = statusConfig[log.status] || statusConfig.trying;
            const savPct = log.targetSavings > 0 ? (log.actualSavings / log.targetSavings) * 100 : 0;
            return (
              <motion.div
                key={log.monthKey}
                className={`card-game border-l-4 ${cfg.borderColor}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-foreground">{getMonthName(log.monthKey)}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cfg.color}`}>{cfg.badge}</span>
                </div>
                <SummaryBar label={t("cal.save")} current={log.actualSavings} target={log.targetSavings} pct={savPct} color="bg-primary" />
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span>🏆 +{log.xpEarned} XP</span>
                  {log.rolloverAmount > 0 && (
                    <span>→ {t("history.rollover")} +{formatMoney(log.rolloverAmount)}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
