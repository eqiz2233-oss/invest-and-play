import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";
import TinyWin, { showTinyWin } from "@/components/TinyWin";
import { Sparkles, LayoutGrid, GitCommitHorizontal } from "lucide-react";

const formatMoney = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

const WEEKDAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Monthly Grid Calendar ───
const MonthlyGridCalendar = ({ monthlySavings, monthlyExpenses }: { monthlySavings: number; monthlyExpenses: number }) => {
  const { lang } = useLanguage();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0

  const monthName = new Intl.DateTimeFormat(lang === "th" ? "th-TH" : "en-US", { month: "long", year: "numeric" }).format(now);
  const weekdayHeaders = lang === "th"
    ? ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"]
    : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  // Task markers
  const investDays = new Set([5, 15, 25]);
  const saveDays = new Set(Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(d => d % 7 === 1));

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="card-game">
      <h3 className="font-black text-foreground mb-3 text-center">{monthName}</h3>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdayHeaders.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const isToday = day === today;
          const isPast = day < today;
          const hasInvest = investDays.has(day);
          const hasSave = saveDays.has(day);

          return (
            <div
              key={day}
              className={`relative flex flex-col items-center justify-center rounded-lg py-1 min-h-[36px] text-xs font-bold transition-colors ${
                isToday
                  ? "bg-primary text-primary-foreground"
                  : isPast
                  ? "bg-muted/50 text-muted-foreground"
                  : "text-foreground hover:bg-muted/50"
              }`}
            >
              <span>{day}</span>
              <div className="flex gap-0.5 mt-0.5">
                {hasSave && <div className={`w-1 h-1 rounded-full ${isToday ? "bg-primary-foreground/80" : "bg-primary"}`} />}
                {hasInvest && <div className={`w-1 h-1 rounded-full ${isToday ? "bg-primary-foreground/80" : "bg-accent"}`} />}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-3 justify-center text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> {lang === "th" ? "วันออม" : "Save day"}</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent inline-block" /> {lang === "th" ? "วันลงทุน" : "Invest day"}</span>
      </div>
    </div>
  );
};

// ─── Progress Timeline Calendar ───
const TimelineCalendar = ({
  selectedPlan, financialSnapshot, planAnswers,
}: {
  selectedPlan: string | null;
  financialSnapshot: ReturnType<typeof useGame>["financialSnapshot"];
  planAnswers: ReturnType<typeof useGame>["planAnswers"];
}) => {
  const { lang } = useLanguage();
  const snap = financialSnapshot;

  const durationText = (months: number) => {
    const y = Math.floor(months / 12);
    const m = Math.round(months % 12);
    const d = Math.round((months - Math.floor(months)) * 30);
    const parts: string[] = [];
    if (y > 0) parts.push(lang === "th" ? `${y} ปี` : `${y} yr${y !== 1 ? "s" : ""}`);
    if (m > 0) parts.push(lang === "th" ? `${m} เดือน` : `${m} mo`);
    if (d > 0 && y === 0) parts.push(lang === "th" ? `${d} วัน` : `${d} d`);
    return parts.join(" ") || "-";
  };

  const monthlySavings = snap?.monthlySavings ?? 0;

  let remainingMonths = 0;
  let goalLabel = "";
  let goalAmount = 0;

  if (selectedPlan === "retirement" && snap) {
    remainingMonths = (snap.retirementAge - snap.currentAge) * 12;
    goalLabel = lang === "th" ? "เกษียณอายุ" : "Retire at";
    goalAmount = snap.retirementFund;
  } else if (selectedPlan === "goal") {
    const ga = planAnswers.find(a => a.questionId === "saving_goal");
    goalAmount = ga ? Number(ga.value) : (snap?.annualSavings ?? 0) * 3;
    remainingMonths = monthlySavings > 0 ? goalAmount / monthlySavings : 0;
    goalLabel = lang === "th" ? "เป้าหมาย" : "Goal";
  } else {
    const ga = planAnswers.find(a => a.questionId === "saving_goal");
    goalAmount = ga ? Number(ga.value) : (snap?.annualSavings ?? 0) * 2;
    remainingMonths = monthlySavings > 0 ? goalAmount / monthlySavings : 0;
    goalLabel = lang === "th" ? "เป้าออม" : "Saving goal";
  }

  const now = new Date();
  const goalDate = new Date(now.getFullYear(), now.getMonth() + Math.ceil(remainingMonths), 1);
  const goalDateStr = new Intl.DateTimeFormat(lang === "th" ? "th-TH" : "en-US", { month: "long", year: "numeric" }).format(goalDate);

  const progressMonths = snap?.annualSavings ? Math.min(remainingMonths, (snap.existingSavings || 0) / monthlySavings) : 0;
  const progressPct = remainingMonths > 0 ? Math.min(100, (progressMonths / remainingMonths) * 100) : 0;

  const milestones = [
    { pct: 0, label: lang === "th" ? "เริ่มต้น" : "Start", done: true },
    { pct: 25, label: "25%", done: progressPct >= 25 },
    { pct: 50, label: "50%", done: progressPct >= 50 },
    { pct: 75, label: "75%", done: progressPct >= 75 },
    { pct: 100, label: "🏆", done: progressPct >= 100 },
  ];

  return (
    <div className="card-game space-y-5">
      {/* Main time display */}
      <div className="text-center">
        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">
          {lang === "th" ? "เวลาที่เหลือ" : "Time remaining"}
        </p>
        <p className="text-4xl font-black text-foreground">{durationText(remainingMonths)}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {goalLabel}: {new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(goalAmount)}
        </p>
        <p className="text-xs text-primary font-bold mt-1">
          📅 {lang === "th" ? "ถึงเป้าประมาณ" : "Estimated date:"} {goalDateStr}
        </p>
      </div>

      {/* Timeline bar */}
      <div>
        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {milestones.map((m, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full border-2 ${m.done ? "bg-primary border-primary" : "bg-muted border-border"}`} />
              <span className={`text-[9px] font-bold mt-1 ${m.done ? "text-primary" : "text-muted-foreground"}`}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="bg-muted/50 rounded-xl p-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground font-bold">{lang === "th" ? "ออมต่อเดือน" : "Monthly saving"}</span>
          <span className="font-black text-foreground">{formatMoney(monthlySavings)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground font-bold">{lang === "th" ? "ออมต่อวัน" : "Daily saving"}</span>
          <span className="font-black text-foreground">{formatMoney(Math.round(monthlySavings / 30))}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground font-bold">{lang === "th" ? "เดือนทั้งหมด" : "Total months"}</span>
          <span className="font-black text-foreground">{Math.ceil(remainingMonths)}</span>
        </div>
      </div>
    </div>
  );
};

const CalendarPage = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { financialSnapshot, calculateSnapshot, awardXP, streak, selectedPlan, planAnswers } = useGame();

  useEffect(() => { calculateSnapshot(); }, []);

  const snap = financialSnapshot;
  const isExample = !snap || snap.monthlyIncome === 30000;

  const monthlySavings = snap?.monthlySavings ?? 10000;
  const monthlyExpenses = snap?.monthlyExpenses ?? 20000;
  const monthlyInvestment = Math.round(monthlySavings * 0.4);
  const dailySaving = Math.round(monthlySavings / 30);

  // Toggle state: "grid" | "timeline"
  const [calMode, setCalMode] = useState<"grid" | "timeline">("grid");

  // Today's actions
  const todayActions = useMemo(() => {
    const actions: { id: string; emoji: string; text: string }[] = [];
    const day = new Date().getDate();
    const dayOfWeek = new Date().getDay();

    if (dailySaving > 0) {
      actions.push({ id: "save", emoji: "💰", text: `${t("cal.game.saveToday")} ${formatMoney(dailySaving)}` });
    }
    if ([5, 15, 25].includes(day)) {
      actions.push({ id: "invest", emoji: "📈", text: `${t("cal.game.investToday")} ${formatMoney(Math.round(monthlyInvestment / 3))}` });
    }
    if (dayOfWeek === 0) {
      actions.push({ id: "review", emoji: "📋", text: t("cal.game.reviewExpenses") });
    }
    if (actions.length === 0) {
      actions.push({ id: "save", emoji: "💰", text: `${t("cal.game.saveToday")} ${formatMoney(dailySaving)}` });
    }
    return actions;
  }, [dailySaving, monthlyInvestment, t]);

  const todayKey = `fingame-today-${new Date().toISOString().slice(0, 10)}`;
  const [completedToday, setCompletedToday] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(todayKey) || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(todayKey, JSON.stringify(completedToday));
  }, [completedToday, todayKey]);

  const handleDone = (actionId: string) => {
    if (!completedToday.includes(actionId)) {
      setCompletedToday(prev => [...prev, actionId]);
      awardXP("complete_quest");
      showTinyWin("✅", lang === "th" ? "+20 XP — ทำได้เยี่ยม!" : "+20 XP — Nice work!");
    }
  };

  // Weekly mini-path
  const today = new Date();
  const currentDayOfWeek = (today.getDay() + 6) % 7;
  const weekStartKey = (() => {
    const d = new Date(today);
    d.setDate(d.getDate() - currentDayOfWeek);
    return d.toISOString().slice(0, 10);
  })();
  const weekCompletedKey = `fingame-week-${weekStartKey}`;
  const [weekCompleted, setWeekCompleted] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem(weekCompletedKey) || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(weekCompletedKey, JSON.stringify(weekCompleted));
  }, [weekCompleted, weekCompletedKey]);

  useEffect(() => {
    if (completedToday.length >= todayActions.length && !weekCompleted.includes(currentDayOfWeek)) {
      setWeekCompleted(prev => [...prev, currentDayOfWeek]);
    }
  }, [completedToday, todayActions.length, currentDayOfWeek, weekCompleted]);

  const weekdayLabels = WEEKDAYS_EN.map((_, i) => t(`weekday.${["mon", "tue", "wed", "thu", "fri", "sat", "sun"][i]}`));

  // Monthly goal
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthProgress = Math.min(100, (now.getDate() / daysInMonth) * 100);
  const monthSaved = Math.round(monthlySavings * monthProgress / 100);

  // Special quest
  const extraSaveAmount = 500;
  const specialQuestKey = `fingame-special-${now.getFullYear()}-${now.getMonth()}`;
  const [specialDismissed, setSpecialDismissed] = useState(() =>
    localStorage.getItem(specialQuestKey) === "dismissed"
  );

  return (
    <div className="bg-background">
      <TinyWin />
      <div className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        {isExample && (
          <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-3 text-center text-sm text-secondary-foreground">
            ✨ {t("home.exampleNote")}
          </div>
        )}

        {/* TODAY CARD */}
        <div className="card-game bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <h2 className="font-black text-foreground text-lg mb-1">🎮 {t("cal.game.today")}</h2>
          <p className="text-xs text-muted-foreground mb-3">{t("cal.game.todaySub")}</p>
          <div className="space-y-2">
            {todayActions.map(action => {
              const isDone = completedToday.includes(action.id);
              return (
                <motion.div
                  key={action.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isDone ? "bg-primary/10" : "bg-background/60"}`}
                  layout
                >
                  <span className="text-xl">{action.emoji}</span>
                  <p className={`flex-1 text-sm font-bold ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {action.text}
                  </p>
                  {isDone ? (
                    <span className="text-primary text-sm font-bold">✅</span>
                  ) : (
                    <motion.button
                      className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDone(action.id)}
                    >
                      {t("quest.markDone")}
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>
          {completedToday.length >= todayActions.length && (
            <motion.p
              className="text-center text-sm font-bold text-primary mt-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              🎉 {t("cal.game.allDone")}
            </motion.p>
          )}
        </div>

        {/* WEEKLY MINI-PATH */}
        <div className="card-game">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-foreground">{t("cal.game.thisWeek")}</h3>
            <span className="text-xs font-bold text-primary">🔥 {streak} {t("cal.game.streak")}</span>
          </div>
          <div className="flex items-center justify-between gap-1">
            {weekdayLabels.map((label, i) => {
              const isDone = weekCompleted.includes(i);
              const isToday = i === currentDayOfWeek;
              const isFuture = i > currentDayOfWeek;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
                  <motion.div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? "bg-primary text-primary-foreground"
                        : isToday
                        ? "bg-primary/20 text-primary border-2 border-primary/40"
                        : isFuture
                        ? "bg-muted text-muted-foreground"
                        : "bg-muted/50 text-muted-foreground/50"
                    }`}
                    whileHover={isToday ? { scale: 1.1 } : undefined}
                  >
                    {isDone ? "✓" : isToday ? "●" : "○"}
                  </motion.div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">{t("cal.game.streakTip")}</p>
        </div>

        {/* MONTHLY GOAL CARD */}
        <div className="card-game">
          <h3 className="font-black text-foreground mb-2">🎯 {t("cal.game.monthlyGoal")}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {t("cal.game.monthlySavingGoal")}: {formatMoney(monthlySavings)}
          </p>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(monthProgress, 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-muted-foreground">{formatMoney(monthSaved)}</span>
            <span className="font-bold text-foreground">{formatMoney(monthlySavings)}</span>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">{Math.round(monthProgress)}% {t("cal.game.ofMonth")}</p>
        </div>

        {/* CALENDAR SECTION with toggle */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-foreground">📅 {lang === "th" ? "ปฏิทิน" : "Calendar"}</h3>
            <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
              <button
                onClick={() => setCalMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  calMode === "grid"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                {lang === "th" ? "รายเดือน" : "Monthly"}
              </button>
              <button
                onClick={() => setCalMode("timeline")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  calMode === "timeline"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                <GitCommitHorizontal className="w-3 h-3" />
                {lang === "th" ? "ไทม์ไลน์" : "Timeline"}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {calMode === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <MonthlyGridCalendar monthlySavings={monthlySavings} monthlyExpenses={monthlyExpenses} />
              </motion.div>
            ) : (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TimelineCalendar
                  selectedPlan={selectedPlan}
                  financialSnapshot={snap}
                  planAnswers={planAnswers}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SPECIAL QUEST */}
        <AnimatePresence>
          {!specialDismissed && (
            <motion.div
              className="card-game border-accent/30 bg-accent/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-black text-foreground text-sm">{t("cal.game.specialQuest")}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    ⭐ {lang === "th"
                      ? `ถ้าออมเพิ่ม ${formatMoney(extraSaveAmount)} ต่อเดือน ติดกัน 3 เดือน คุณจะถึงเป้าเร็วขึ้น ลองดูไหม?`
                      : `If you save +${formatMoney(extraSaveAmount)}/month for 3 months, you could reach your goal earlier. Want to try?`
                    }
                  </p>
                  <div className="flex gap-2 mt-3">
                    <motion.button
                      className="px-3 py-1.5 rounded-xl bg-accent text-accent-foreground text-xs font-bold"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/sandbox")}
                    >
                      {t("cal.game.trySimulation")}
                    </motion.button>
                    <button
                      className="px-3 py-1.5 rounded-xl text-xs text-muted-foreground hover:bg-muted"
                      onClick={() => {
                        setSpecialDismissed(true);
                        localStorage.setItem(specialQuestKey, "dismissed");
                      }}
                    >
                      {t("cal.game.maybeLater")}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CalendarPage;
