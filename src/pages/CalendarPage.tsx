import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TinyWin, { showTinyWin } from "@/components/TinyWin";

const formatMoney = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

const INVESTMENT_DATES = [5, 15, 25];

const SummaryBar = ({ label, current, target, pct, color }: { label: string; current: number; target: number; pct: number; color: string }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-muted-foreground font-bold">{label}</span>
      <span className="text-foreground font-bold">{formatMoney(current)} / {formatMoney(target)} ({Math.round(pct)}%)</span>
    </div>
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 0.8 }} />
    </div>
  </div>
);

const CalendarPage = () => {
  const { t } = useLanguage();
  const { financialSnapshot, calculateSnapshot, awardXP } = useGame();

  useEffect(() => { calculateSnapshot(); }, []);

  const snap = financialSnapshot;
  const isExample = !snap || snap.monthlyIncome === 30000;

  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showSkipMsg, setShowSkipMsg] = useState(false);

  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const calKey = `fingame-calendar-${monthKey}`;

  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem(calKey) || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(calKey, JSON.stringify(completedDays));
  }, [completedDays, calKey]);

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
    if (INVESTMENT_DATES.includes(date)) return "bg-accent";
    const dayOfWeek = (new Date(currentYear, currentMonth, date).getDay() + 6) % 7;
    if (dayOfWeek === 0) return "bg-primary";
    if (dayOfWeek === 6) return "bg-secondary";
    return null;
  };

  const getEventType = (date: number) => {
    if (INVESTMENT_DATES.includes(date)) return "invest";
    const dayOfWeek = (new Date(currentYear, currentMonth, date).getDay() + 6) % 7;
    if (dayOfWeek === 0) return "save";
    if (dayOfWeek === 6) return "checkpoint";
    return null;
  };

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

  const handleDayDone = (date: number) => {
    if (!completedDays.includes(date)) {
      setCompletedDays(prev => [...prev, date]);
      awardXP("complete_quest");
      showTinyWin("✅", "+20 XP — ทำแล้ว!");
    }
    setSelectedDay(null);
  };

  const handleSkip = () => {
    setShowSkipMsg(true);
    if (selectedDay) {
      const eventType = getEventType(selectedDay);
      let amount = 0;
      if (eventType === "invest") amount = Math.round(monthlyInvestment / 3);
      else if (eventType === "save") amount = Math.round(savingsOnly / 4);
      if (amount > 0) {
        const nextMonth = new Date(currentYear, currentMonth + 1, 1);
        const key = `fingame-rollover-${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;
        const existing = Number(localStorage.getItem(key) || 0);
        localStorage.setItem(key, String(existing + amount));
      }
    }
    setTimeout(() => { setShowSkipMsg(false); setSelectedDay(null); }, 2000);
  };

  return (
    <div className="bg-background">
      <TinyWin />
      <div className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        {isExample && (
          <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-3 text-center text-sm text-secondary-foreground">
            ✨ {t("home.exampleNote")}
          </div>
        )}

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
              const isDayDone = completedDays.includes(date);
              return (
                <motion.button
                  key={date}
                  onClick={() => setSelectedDay(isSelected ? null : date)}
                  className={`h-10 rounded-xl text-xs font-bold relative transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : isToday
                      ? "bg-primary/20 text-primary border-2 border-primary/40"
                      : isDayDone
                      ? "bg-primary/10 text-primary/60"
                      : "bg-muted/50 text-foreground hover:bg-muted"
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  {date}
                  {isDayDone && dot && !isSelected && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px]">✅</span>}
                  {!isDayDone && dot && !isSelected && <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${dot}`} />}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Day Detail */}
        <AnimatePresence>
          {selectedDay && getEventType(selectedDay) && (
            <motion.div
              className="card-game border-primary/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-3" />
              <h3 className="font-black text-foreground mb-1">{t(`month.${currentMonth}`)} {selectedDay}, {currentYear}</h3>
              {getEventType(selectedDay) === "invest" && (
                <div className="space-y-2 mt-3">
                  <p className="text-sm font-bold text-accent">📈 {t("cal.investDay")}</p>
                  <p className="text-sm text-foreground">{t("cal.invest")}: {formatMoney(Math.round(monthlyInvestment / 3))}</p>
                  <p className="text-xs text-muted-foreground italic">DCA — {t("cal.dcaTip")}</p>
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
              {!completedDays.includes(selectedDay) && getEventType(selectedDay) !== "checkpoint" && (
                <div className="flex gap-2 mt-3">
                  <motion.button
                    className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDayDone(selectedDay)}
                  >
                    ✅ {t("quest.markDone")}
                  </motion.button>
                  <button
                    className="flex-1 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted"
                    onClick={handleSkip}
                  >
                    {t("cal.skipMonth")}
                  </button>
                </div>
              )}
              {showSkipMsg && (
                <motion.p className="mt-3 text-sm text-primary font-bold text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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
    </div>
  );
};

export default CalendarPage;
