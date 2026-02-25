import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";
import RankBadge from "@/components/RankBadge";
import TinyWin, { showTinyWin } from "@/components/TinyWin";

const formatMoney = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

const getWeekKey = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
};

const INVESTMENT_DATES = [5, 15, 25];

const daysLeftInMonth = () => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return end.getDate() - now.getDate();
};

const QuestsPage = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const {
    xp, streak, financialSnapshot, calculateSnapshot,
    questStatuses, completeQuest, skipQuest,
    plans, activePlanId, switchPlan, resetAll,
  } = useGame();

  useEffect(() => { calculateSnapshot(); }, []);

  const snap = financialSnapshot;
  const isExample = !snap || snap.monthlyIncome === 30000;
  const monthlySavings = snap?.monthlySavings ?? 10000;
  const monthlyExpenses = snap?.monthlyExpenses ?? 20000;
  const savingsRate = snap?.savingsRate ?? 33;

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
      { id: "save_week", icon: "💰", title: t("home.questSave"), amount: Math.round(monthlySavings / 4), type: "save" },
      { id: "track_expenses", icon: "🧾", title: t("home.questTrack"), amount: Math.round(monthlyExpenses / 4), type: "track" },
    ];
    if (isInvestmentWeek) {
      quests.push({ id: "invest_now", icon: "📈", title: t("home.questInvest"), amount: Math.round((monthlySavings * 0.4) / 3), type: "invest" });
    }
    return quests;
  }, [monthlySavings, monthlyExpenses, isInvestmentWeek, t]);

  const getQuestStatus = (questId: string) =>
    questStatuses.find(q => q.questId === questId && q.weekKey === weekKey)?.status || "todo";

  const [confettiQuest, setConfettiQuest] = useState<string | null>(null);
  const questDoneCount = weeklyQuests.filter(q => getQuestStatus(q.id) === "done").length;

  const handleComplete = (questId: string) => {
    const alreadyDone = questDoneCount;
    completeQuest(questId, weekKey);
    setConfettiQuest(questId);
    setTimeout(() => setConfettiQuest(null), 1500);
    if (alreadyDone === 0) showTinyWin("🎉", lang === "th" ? "เยี่ยมมาก! เริ่มต้นได้สมบูรณ์แบบ!" : "Amazing! Perfect start!");
    else if (alreadyDone + 1 >= 3) showTinyWin("🔥", "Hat-trick! 3 เควสติดกัน!");
    else showTinyWin("✅", "+20 XP — สัปดาห์นี้ดีมาก!");
  };

  const borderColor = (type: string) => {
    switch (type) {
      case "save": return "border-l-primary";
      case "invest": return "border-l-accent";
      case "track": return "border-l-secondary";
      default: return "border-l-muted-foreground";
    }
  };

  return (
    <div className="bg-background">
      <TinyWin />
      <div className="container mx-auto px-4 py-6 max-w-lg space-y-5">
        {/* Plan switcher */}
        {plans.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {plans.map(p => (
              <motion.button
                key={p.id}
                onClick={() => switchPlan(p.id)}
                className={`shrink-0 px-4 py-2.5 rounded-2xl text-sm font-extrabold transition-all ${
                  p.id === activePlanId
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {p.emoji} {p.name} {p.id === activePlanId && "✓"}
              </motion.button>
            ))}
            <motion.button
              onClick={() => navigate("/plan")}
              className="shrink-0 px-4 py-2.5 rounded-2xl text-sm font-bold bg-muted text-muted-foreground hover:bg-muted/80 border-2 border-dashed border-border"
              whileHover={{ scale: 1.02 }}
            >
              + {lang === "th" ? "เพิ่มแผน" : "Add Plan"}
            </motion.button>
          </div>
        )}

        {isExample && (
          <motion.div
            className="bg-secondary/10 border border-secondary/30 rounded-2xl p-3 text-center text-sm text-secondary-foreground"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✨ {t("home.exampleNote")}
          </motion.div>
        )}

        {/* Monthly Mission */}
        <motion.div
          className="card-game bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="font-black text-foreground text-lg">🎯 {t("home.monthlyMission")}</h2>
              <div className="mt-3 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-bold">💰 {t("cal.save")}</span>
                  <span className="font-black text-foreground">{formatMoney(monthlySavings)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-bold">🛍️ {t("cal.spendMax")}</span>
                  <span className="font-black text-foreground">{formatMoney(monthlyExpenses)}</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="progress-track h-2.5">
                  <motion.div className="progress-fill h-2.5" initial={{ width: 0 }} animate={{ width: `${Math.min(monthProgress, 100)}%` }} transition={{ duration: 0.8 }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 font-bold">{remaining} {t("home.daysLeft")}</p>
              </div>
            </div>
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
          <button onClick={() => navigate("/snapshot")} className="mt-3 text-xs font-extrabold text-primary hover:underline">
            {t("home.viewSnapshot")}
          </button>
        </motion.div>

        {/* Weekly Quests */}
        <div>
          <h3 className="font-black text-foreground mb-3">📋 {t("home.weeklyQuests")}</h3>
          <div className="space-y-3">
            {weeklyQuests.map((quest, qi) => {
              const status = getQuestStatus(quest.id);
              const isDone = status === "done";
              const isSkipped = status === "skipped";
              return (
                <motion.div
                  key={quest.id}
                  className={`relative card-game py-4 border-l-4 ${borderColor(quest.type)} transition-all ${
                    isDone ? "bg-primary/5" : isSkipped ? "bg-muted/50 opacity-60" : ""
                  }`}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: qi * 0.08 }}
                  whileHover={{ x: isDone ? 0 : 3 }}
                >
                  {confettiQuest === quest.id && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                      {[...Array(10)].map((_, i) => (
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
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{quest.icon}</span>
                    <div className="flex-1">
                      <p className={`font-bold text-foreground text-sm ${isDone ? "line-through opacity-60" : ""}`}>{quest.title}</p>
                      {quest.amount !== null && <p className="text-xs text-muted-foreground font-bold">{formatMoney(quest.amount)}</p>}
                    </div>
                    {isDone ? (
                      <motion.span
                        className="text-primary font-bold text-sm"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                      >✅</motion.span>
                    ) : isSkipped ? (
                      <span className="text-muted-foreground text-xs font-bold">{t("quest.skip")}</span>
                    ) : (
                      <div className="flex gap-2">
                        <motion.button
                          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-extrabold"
                          style={{ boxShadow: "var(--shadow-playful-sm)" }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleComplete(quest.id)}
                        >
                          {t("quest.markDone")}
                        </motion.button>
                        <button
                          className="px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-muted font-bold"
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

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            className="card-game cursor-pointer hover:border-primary/30 transition-all py-5"
            onClick={() => navigate("/plan")}
            whileHover={{ y: -3 }}
          >
            <div className="text-center">
              <span className="text-2xl">🎮</span>
              <p className="text-xs font-extrabold text-foreground mt-1.5">{t("nav.play")}</p>
            </div>
          </motion.div>
          <motion.div
            className="card-game cursor-pointer hover:border-accent/30 transition-all py-5"
            onClick={() => navigate("/sandbox")}
            whileHover={{ y: -3 }}
          >
            <div className="text-center">
              <span className="text-2xl">🧮</span>
              <p className="text-xs font-extrabold text-foreground mt-1.5">{t("sandbox.link")}</p>
            </div>
          </motion.div>
        </div>

        {/* Plan CTA */}
        {plans.length === 0 && (
          <motion.button
            className="w-full btn-playful bg-primary text-primary-foreground py-4 text-lg font-extrabold"
            onClick={() => navigate("/plan")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t("plan.startPlanning")}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default QuestsPage;
