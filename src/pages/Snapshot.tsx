import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Play } from "lucide-react";

const Snapshot = () => {
  const navigate = useNavigate();
  const { financialSnapshot, calculateSnapshot, xp, selectedPlan, planAnswers } = useGame();
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateSnapshot();
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const snap = financialSnapshot;

  const fmt = (n: number) =>
    new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

  const fmtShort = (n: number) => {
    if (n >= 1_000_000) return `฿${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `฿${(n / 1_000).toFixed(0)}K`;
    return fmt(n);
  };

  // Human-readable time duration
  const durationText = (years: number): string => {
    const y = Math.floor(years);
    const months = Math.round((years - y) * 12);
    const parts: string[] = [];
    if (y > 0) parts.push(lang === "th" ? `${y} ปี` : `${y} yr${y !== 1 ? "s" : ""}`);
    if (months > 0) parts.push(lang === "th" ? `${months} เดือน` : `${months} mo`);
    return parts.join(" ") || (lang === "th" ? "น้อยกว่า 1 เดือน" : "< 1 month");
  };

  if (loading || !snap) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 max-w-lg space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </main>
      </div>
    );
  }

  const yearsToRetire = snap.retirementAge - snap.currentAge;
  const retirementProgress = snap.retirementNeeded > 0
    ? Math.min(100, (snap.inflationAdjusted / snap.retirementNeeded) * 100)
    : 0;

  // ----- Saving Plan Cards -----
  const savingCards = () => {
    const totalSavingsGoal = planAnswers.find(a => a.questionId === "saving_goal");
    const savingGoalAmount = totalSavingsGoal ? Number(totalSavingsGoal.value) : snap.annualSavings;
    const monthsToGoal = snap.monthlySavings > 0
      ? savingGoalAmount / snap.monthlySavings
      : 0;
    const yearsToGoal = monthsToGoal / 12;

    return [
      {
        emoji: "⏱️",
        title: lang === "th" ? "แผนนี้ใช้เวลา" : "This plan takes",
        main: durationText(yearsToGoal),
        sub: lang === "th" ? `เพื่อถึงเป้า ${fmt(savingGoalAmount)}` : `to reach ${fmt(savingGoalAmount)}`,
        color: "from-primary/5 to-primary/10 border-primary/20",
      },
      {
        emoji: "💰",
        title: lang === "th" ? "ออมได้ทั้งหมด" : "You will save in total",
        main: fmt(savingGoalAmount),
        sub: lang === "th" ? `ราว ${fmt(snap.monthlySavings)} ต่อเดือน · ${fmt(Math.round(snap.monthlySavings / 30))} ต่อวัน` : `≈ ${fmt(snap.monthlySavings)}/mo · ${fmt(Math.round(snap.monthlySavings / 30))}/day`,
        color: "from-secondary/5 to-secondary/10 border-secondary/20",
      },
      {
        emoji: "🛍️",
        title: lang === "th" ? "ช่วงใช้จ่ายได้อย่างปลอดภัย" : "Safe monthly spending range",
        main: `${fmt(snap.safeSpendingRange[0])} – ${fmt(snap.safeSpendingRange[1])}`,
        sub: lang === "th" ? "ใช้ได้สบาย ๆ โดยไม่กระทบแผน" : "Comfortable range that keeps your plan on track",
        color: "from-accent/5 to-accent/10 border-accent/20",
      },
    ];
  };

  // ----- Goal Plan Cards -----
  const goalCards = () => {
    const goalAmount = planAnswers.find(a => a.questionId === "saving_goal");
    const targetAmount = goalAmount ? Number(goalAmount.value) : snap.annualSavings * 3;
    const monthsToGoal = snap.monthlySavings > 0 ? targetAmount / snap.monthlySavings : 0;

    return [
      {
        emoji: "🎯",
        title: lang === "th" ? "แผนนี้ใช้เวลา" : "This plan takes",
        main: durationText(monthsToGoal / 12),
        sub: lang === "th" ? `เพื่อไปถึงเป้าหมาย ${fmt(targetAmount)}` : `to reach your goal of ${fmt(targetAmount)}`,
        color: "from-primary/5 to-primary/10 border-primary/20",
      },
      {
        emoji: "📈",
        title: lang === "th" ? "ออมทั้งหมด" : "Total savings",
        main: fmt(targetAmount),
        sub: lang === "th" ? `${fmt(snap.monthlySavings)} ต่อเดือน · ${fmt(Math.round(snap.monthlySavings / 30))} ต่อวัน` : `${fmt(snap.monthlySavings)}/mo · ${fmt(Math.round(snap.monthlySavings / 30))}/day`,
        color: "from-secondary/5 to-secondary/10 border-secondary/20",
      },
      {
        emoji: "🚀",
        title: lang === "th" ? "คุณกำลังเดินหน้าไปถึง" : "You're on track toward",
        main: lang === "th" ? "เป้าหมายของคุณ!" : "Your goal!",
        sub: lang === "th" ? "คงแผนนี้ไว้แล้วมันจะเป็นจริง 💪" : "Stay consistent and it will happen 💪",
        color: "from-accent/5 to-accent/10 border-accent/20",
      },
    ];
  };

  // ----- Retirement Plan Cards -----
  const retirementCards = () => [
    {
      emoji: "⏱️",
      title: lang === "th" ? "แผนนี้ใช้เวลา" : "This plan takes",
      main: durationText(yearsToRetire),
      sub: lang === "th" ? `เกษียณอายุ ${snap.retirementAge} ปี (ตอนนี้ ${snap.currentAge} ปี)` : `Retire at ${snap.retirementAge} (currently ${snap.currentAge})`,
      color: "from-primary/5 to-primary/10 border-primary/20",
    },
    {
      emoji: "🏦",
      title: lang === "th" ? "เงินที่จะมีตอนเกษียณ" : "Projected retirement fund",
      main: fmt(snap.retirementFund),
      sub: lang === "th" ? `มูลค่าปัจจุบัน ${fmt(snap.inflationAdjusted)} (ปรับเงินเฟ้อแล้ว)` : `Today's value: ${fmt(snap.inflationAdjusted)} (inflation-adjusted)`,
      color: "from-secondary/5 to-secondary/10 border-secondary/20",
    },
    {
      emoji: "💸",
      title: lang === "th" ? "ใช้จ่ายได้ต่อเดือนหลังเกษียณ" : "Safe monthly spending in retirement",
      main: `${fmt(snap.safeSpendingRange[0])} – ${fmt(snap.safeSpendingRange[1])}`,
      sub: lang === "th" ? `ออมรายเดือนตอนนี้: ${fmt(snap.monthlySavings)} · รายปี: ${fmtShort(snap.annualSavings)}` : `Saving now: ${fmt(snap.monthlySavings)}/mo · ${fmtShort(snap.annualSavings)}/yr`,
      color: "from-accent/5 to-accent/10 border-accent/20",
    },
  ];

  const cards = selectedPlan === "retirement"
    ? retirementCards()
    : selectedPlan === "goal"
    ? goalCards()
    : savingCards();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* Hero */}
        <motion.div
          className="card-game mb-6 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-5xl mb-2 block">
            {selectedPlan === "retirement" ? "🏖️" : selectedPlan === "goal" ? "🎯" : "💰"}
          </span>
          <h2 className="text-xl font-black text-foreground mb-1">
            {lang === "th" ? "แผนการเงินของคุณ" : "Your Financial Summary"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {lang === "th"
              ? `แผน${selectedPlan === "retirement" ? "เกษียณ" : selectedPlan === "goal" ? "เป้าหมาย" : "ออมเงิน"} · ${planAnswers.length} คำตอบ`
              : `${selectedPlan === "retirement" ? "Retirement" : selectedPlan === "goal" ? "Goal" : "Saving"} Plan · ${planAnswers.length} answers`
            }
          </p>
          <div className="xp-badge mt-3 justify-center">⭐ {xp} XP</div>
        </motion.div>

        {/* Human-language cards */}
        <div className="space-y-4">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              className={`card-game bg-gradient-to-br ${card.color}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-xs font-bold text-muted-foreground mb-1">{card.emoji} {card.title}</p>
              <p className="text-2xl font-black text-foreground">{card.main}</p>
              <p className="text-sm text-muted-foreground mt-1">{card.sub}</p>
            </motion.div>
          ))}

          {/* Retirement progress bar */}
          {selectedPlan === "retirement" && snap.retirementNeeded > 0 && (
            <motion.div
              className="card-game"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: cards.length * 0.1 }}
            >
              <p className="text-xs font-bold text-muted-foreground mb-2">
                🎯 {lang === "th" ? "เป้าหมายเกษียณ" : "Retirement Target"}
              </p>
              <p className="text-lg font-black text-foreground">{fmt(snap.retirementNeeded)}</p>
              <div className="mt-3 h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${retirementProgress}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {retirementProgress.toFixed(0)}% {lang === "th" ? "ของเป้าหมาย" : "of goal"} · {snap.yearsInRetirement} {lang === "th" ? "ปีในการเกษียณ" : "yrs in retirement"}
              </p>
            </motion.div>
          )}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-8 flex gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            className="flex-1 btn-playful bg-primary text-primary-foreground px-6 py-3 flex items-center justify-center gap-2"
            onClick={() => navigate("/calendar")}
            whileHover={{ scale: 1.02 }}
          >
            <Calendar className="w-4 h-4" />
            {lang === "th" ? "ไปปฏิทิน" : "Go to Calendar"}
          </motion.button>
          <motion.button
            className="flex-1 btn-playful bg-card border-2 border-border text-foreground px-6 py-3 flex items-center justify-center gap-2"
            onClick={() => navigate("/plan")}
            whileHover={{ scale: 1.02 }}
          >
            <Play className="w-4 h-4" />
            {lang === "th" ? "สร้างแผนใหม่" : "New Plan"}
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
};

export default Snapshot;
