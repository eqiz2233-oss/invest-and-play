import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Target,
  TrendingUp,
  Wallet,
  Zap,
  Calendar as CalendarIcon,
} from "lucide-react";

interface DayPlan {
  date: number;
  savingsTarget: number;
  spendingLimit: number;
  investmentAmount: number;
  isInvestmentDay: boolean;
  mission?: string;
}

interface WeekPlan {
  weekNumber: number;
  savingsTarget: number;
  spendingLimit: number;
  investmentAmount: number;
  days: DayPlan[];
  mission: string;
}

interface MonthPlan {
  month: number;
  year: number;
  totalIncome: number;
  plannedSavings: number;
  plannedInvestment: number;
  maxSpending: number;
  weeks: WeekPlan[];
}

const INVESTMENT_DATES = [5, 15, 25];

const FinancialCalendar = () => {
  const navigate = useNavigate();
  const { financialSnapshot, calculateSnapshot } = useGame();
  const { t } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear] = useState(() => new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null);
  const [view, setView] = useState<"calendar" | "weekly">("calendar");

  useEffect(() => {
    calculateSnapshot();
  }, []);

  const snap = financialSnapshot;

  const weekdays = [
    t("weekday.mon"), t("weekday.tue"), t("weekday.wed"),
    t("weekday.thu"), t("weekday.fri"), t("weekday.sat"), t("weekday.sun"),
  ];

  const missions = [
    t("cal.mission1"), t("cal.mission2"), t("cal.mission3"),
    t("cal.mission4"), t("cal.mission5"),
  ];

  const monthPlan: MonthPlan | null = useMemo(() => {
    if (!snap) return null;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthlyInvestment = snap.monthlySavings > 0 ? Math.round(snap.monthlySavings * 0.4) : 0;
    const monthlySavingsOnly = snap.monthlySavings - monthlyInvestment;
    const maxSpending = snap.monthlyIncome - snap.monthlySavings;

    const weeklySavings = Math.round(monthlySavingsOnly / 4);
    const weeklyInvestment = Math.round(monthlyInvestment / 4);
    const weeklySpending = Math.round(maxSpending / 4);
    const dailySavings = Math.round(monthlySavingsOnly / daysInMonth);
    const dailySpending = Math.round(maxSpending / daysInMonth);

    const days: DayPlan[] = Array.from({ length: daysInMonth }, (_, i) => {
      const date = i + 1;
      const isInvestmentDay = INVESTMENT_DATES.includes(date);
      const investPerDay = isInvestmentDay
        ? Math.round(monthlyInvestment / INVESTMENT_DATES.filter(d => d <= daysInMonth).length)
        : 0;

      return {
        date,
        savingsTarget: dailySavings,
        spendingLimit: dailySpending,
        investmentAmount: investPerDay,
        isInvestmentDay,
        mission: isInvestmentDay
          ? t("cal.investmentDay")
          : date % 7 === 0
          ? t("cal.weekCheckpoint")
          : undefined,
      };
    });

    const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
    const weeks: WeekPlan[] = [];
    let weekDays: DayPlan[] = [];
    let weekNum = 1;

    days.forEach((day, i) => {
      weekDays.push(day);
      const dayOfWeek = (firstDayOfWeek + i) % 7;
      if (dayOfWeek === 6 || i === days.length - 1) {
        weeks.push({
          weekNumber: weekNum,
          savingsTarget: weeklySavings,
          spendingLimit: weeklySpending,
          investmentAmount: weeklyInvestment,
          days: [...weekDays],
          mission: missions[weekNum - 1] || missions[0],
        });
        weekDays = [];
        weekNum++;
      }
    });

    return {
      month: currentMonth,
      year: currentYear,
      totalIncome: snap.monthlyIncome,
      plannedSavings: monthlySavingsOnly,
      plannedInvestment: monthlyInvestment,
      maxSpending,
      weeks,
    };
  }, [snap, currentMonth, currentYear, t]);

  if (!snap || !monthPlan) return null;

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-black text-foreground">{t("cal.actionPlan")}</h1>
            <p className="text-xs text-muted-foreground">{t("cal.questSchedule")}</p>
          </div>
          <LanguageToggle />
          <div className="flex gap-1 bg-muted rounded-xl p-1">
            <button
              onClick={() => setView("calendar")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                view === "calendar" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView("weekly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                view === "weekly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        <motion.div
          className="card-game mb-6 bg-primary/5 border-primary/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(m => m > 0 ? m - 1 : 11)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <h2 className="font-black text-foreground">
              {t(`month.${currentMonth}`)} {currentYear}
            </h2>
            <button
              onClick={() => setCurrentMonth(m => m < 11 ? m + 1 : 0)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-card rounded-xl p-3 border border-border">
              <Wallet className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">{t("cal.save")}</p>
              <p className="font-black text-foreground text-sm">{formatMoney(monthPlan.plannedSavings)}</p>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border">
              <TrendingUp className="w-4 h-4 mx-auto mb-1 text-accent" />
              <p className="text-xs text-muted-foreground">{t("cal.invest")}</p>
              <p className="font-black text-foreground text-sm">{formatMoney(monthPlan.plannedInvestment)}</p>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border">
              <Zap className="w-4 h-4 mx-auto mb-1 text-secondary" />
              <p className="text-xs text-muted-foreground">{t("cal.spendMax")}</p>
              <p className="font-black text-foreground text-sm">{formatMoney(monthPlan.maxSpending)}</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {view === "calendar" ? (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="card-game mb-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekdays.map(d => (
                    <div key={d} className="text-center text-xs font-bold text-muted-foreground py-1">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-10" />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const date = i + 1;
                    const isToday = isCurrentMonth && today.getDate() === date;
                    const isInvestment = INVESTMENT_DATES.includes(date);
                    const dayData = monthPlan.weeks.flatMap(w => w.days).find(d => d.date === date);
                    const isSelected = selectedDay?.date === date;

                    return (
                      <motion.button
                        key={date}
                        onClick={() => setSelectedDay(dayData || null)}
                        className={`h-10 rounded-xl text-xs font-bold relative transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                            : isToday
                            ? "bg-primary/20 text-primary border-2 border-primary/40"
                            : isInvestment
                            ? "bg-accent/10 text-accent border border-accent/30"
                            : "bg-muted/50 text-foreground hover:bg-muted"
                        }`}
                        whileTap={{ scale: 0.9 }}
                      >
                        {date}
                        {isInvestment && !isSelected && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence>
                {selectedDay && (
                  <motion.div
                    className="card-game border-primary/20"
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">📅</span>
                      <h3 className="font-black text-foreground">
                        {t(`month.${currentMonth}`)} {selectedDay.date}
                      </h3>
                    </div>

                    {selectedDay.mission && (
                      <div className="bg-primary/5 rounded-xl p-3 mb-3 text-sm font-bold text-foreground">
                        {selectedDay.mission}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">{t("cal.saveToday")}</span>
                        <span className="font-bold text-primary">{formatMoney(selectedDay.savingsTarget)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-sm text-muted-foreground">{t("cal.spendingLimit")}</span>
                        <span className="font-bold text-foreground">{formatMoney(selectedDay.spendingLimit)}</span>
                      </div>
                      {selectedDay.isInvestmentDay && (
                        <div className="flex justify-between items-center py-2 border-b border-border">
                          <span className="text-sm text-muted-foreground">{t("cal.investToday")}</span>
                          <span className="font-bold text-accent">{formatMoney(selectedDay.investmentAmount)}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-3 italic">
                      {t("cal.onTrack")}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {monthPlan.weeks.map((week, i) => (
                <motion.div
                  key={week.weekNumber}
                  className="card-game"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-black text-primary">W{week.weekNumber}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-sm">
                        {t("cal.weekMission").replace("{n}", String(week.weekNumber))}
                      </h3>
                      <p className="text-xs text-muted-foreground">{week.mission}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-primary/5 rounded-lg p-2">
                      <p className="text-[10px] text-muted-foreground font-bold">{t("cal.save").toUpperCase()}</p>
                      <p className="text-sm font-black text-primary">{formatMoney(week.savingsTarget)}</p>
                    </div>
                    <div className="bg-accent/5 rounded-lg p-2">
                      <p className="text-[10px] text-muted-foreground font-bold">{t("cal.invest").toUpperCase()}</p>
                      <p className="text-sm font-black text-accent">{formatMoney(week.investmentAmount)}</p>
                    </div>
                    <div className="bg-secondary/10 rounded-lg p-2">
                      <p className="text-[10px] text-muted-foreground font-bold">{t("cal.spendMax").toUpperCase()}</p>
                      <p className="text-sm font-black text-secondary-foreground">{formatMoney(week.spendingLimit)}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 mt-3">
                    {week.days.map(day => (
                      <div
                        key={day.date}
                        className={`flex-1 h-1.5 rounded-full ${
                          day.isInvestmentDay ? "bg-accent" : "bg-primary/30"
                        }`}
                        title={`Day ${day.date}`}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-muted-foreground italic">
            {t("cal.philosophy")}
          </p>
          <motion.button
            className="btn-playful bg-primary text-primary-foreground px-8 py-3 w-full mt-4"
            onClick={() => navigate("/dashboard")}
            whileHover={{ scale: 1.02 }}
          >
            {t("cal.backToLevels")}
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
};

export default FinancialCalendar;
