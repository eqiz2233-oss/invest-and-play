import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";
import TinyWin, { showTinyWin } from "@/components/TinyWin";
import { Sparkles } from "lucide-react";

const formatMoney = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

const WEEKDAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CalendarPage = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { financialSnapshot, calculateSnapshot, awardXP, streak } = useGame();

  useEffect(() => { calculateSnapshot(); }, []);

  const snap = financialSnapshot;
  const isExample = !snap || snap.monthlyIncome === 30000;

  const monthlySavings = snap?.monthlySavings ?? 10000;
  const monthlyExpenses = snap?.monthlyExpenses ?? 20000;
  const monthlyInvestment = Math.round(monthlySavings * 0.4);
  const dailySaving = Math.round(monthlySavings / 30);

  // Today's actions derived from plan
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

  // Completed today actions (localStorage for daily reset)
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

  // Weekly mini-path (Mon–Sun)
  const today = new Date();
  const currentDayOfWeek = (today.getDay() + 6) % 7; // Mon=0, Sun=6
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

  // Auto-mark today if all today actions done
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
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isDone ? "bg-primary/10" : "bg-background/60"
                  }`}
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
