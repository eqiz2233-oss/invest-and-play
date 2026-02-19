import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";
import { showTinyWin } from "@/components/TinyWin";
import TinyWin from "@/components/TinyWin";

const formatMoney = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

const Sandbox = () => {
  const navigate = useNavigate();
  const { financialSnapshot, awardXP } = useGame();
  const { t, lang } = useLanguage();
  const xpAwarded = useRef(false);

  useEffect(() => {
    if (!xpAwarded.current) {
      awardXP("view_snapshot");
      showTinyWin("🧮", lang === "th" ? "+5 XP — ลองคำนวณดี!" : "+5 XP — Nice exploring!");
      xpAwarded.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const snap = financialSnapshot;
  const baseIncome = snap?.monthlyIncome || 30000;
  const baseExpenses = snap?.monthlyExpenses || 20000;
  const baseSavings = Math.max(0, baseIncome - baseExpenses);

  const [extraSaving, setExtraSaving] = useState(1000);
  const [investPct, setInvestPct] = useState(40);

  const sim = useMemo(() => {
    const newSavings = baseSavings + extraSaving;
    const investAmount = Math.round(newSavings * investPct / 100);
    const yearsToRetire = Math.max(1, (snap?.retirementAge || 60) - (snap?.currentAge || 30));
    const annualSavings = newSavings * 12;
    const realReturn = 0.04;
    const fv = annualSavings * ((Math.pow(1 + realReturn, yearsToRetire) - 1) / realReturn);

    const baseAnnual = baseSavings * 12;
    const baseFv = baseAnnual * ((Math.pow(1 + realReturn, yearsToRetire) - 1) / realReturn);

    // How many months faster
    const monthsFaster = baseSavings > 0
      ? Math.round((fv - baseFv) / (newSavings || 1))
      : 0;

    return {
      currentSavings: baseSavings,
      simSavings: newSavings,
      currentFund: Math.round(baseFv),
      simFund: Math.round(fv),
      monthsFaster: Math.max(0, monthsFaster),
      investAmount,
    };
  }, [baseSavings, extraSaving, investPct, snap]);

  const [showApplied, setShowApplied] = useState(false);

  const handleApply = () => {
    setShowApplied(true);
    awardXP("plan_adjusted");
    showTinyWin("🎉", lang === "th" ? "บันทึกแผนใหม่แล้ว!" : "New plan saved!");
    setTimeout(() => navigate("/plan"), 1500);
  };

  return (
    <div className="bg-background">
      <TinyWin />
      <div className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="font-black text-foreground text-xl">🧮 {t("sim.title")}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t("sim.subtitle")}</p>
        </div>

        <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-3 text-center text-sm text-secondary-foreground">
          🧮 {t("sim.disclaimer")}
        </div>

        {/* Friendly Sliders */}
        <div className="card-game space-y-5">
          <SliderRow
            label={t("sim.extraSave")}
            emoji="💰"
            value={extraSaving}
            onChange={setExtraSaving}
            min={0}
            max={Math.min(50000, baseIncome)}
            step={500}
          />
          <SliderRow
            label={t("sim.investPct")}
            emoji="📈"
            value={investPct}
            onChange={setInvestPct}
            min={0}
            max={80}
            step={5}
            suffix="%"
          />
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Current Plan */}
          <div className="card-game text-center py-4 border-muted-foreground/20">
            <span className="text-2xl">😐</span>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">{t("sim.currentPlan")}</p>
            <p className="text-sm font-black text-foreground mt-1">{formatMoney(sim.currentSavings)}<span className="text-xs font-normal text-muted-foreground">/{t("sim.perMonth")}</span></p>
            <p className="text-[10px] text-muted-foreground mt-1">{t("sim.totalFund")}: {formatMoney(sim.currentFund)}</p>
          </div>
          {/* Simulated Plan */}
          <motion.div
            className="card-game text-center py-4 border-primary/30 bg-primary/5"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <span className="text-2xl">😄</span>
            <p className="text-[10px] font-bold text-primary uppercase mt-1">{t("sim.newPlan")}</p>
            <p className="text-sm font-black text-primary mt-1">{formatMoney(sim.simSavings)}<span className="text-xs font-normal text-muted-foreground">/{t("sim.perMonth")}</span></p>
            <p className="text-[10px] text-muted-foreground mt-1">{t("sim.totalFund")}: {formatMoney(sim.simFund)}</p>
          </motion.div>
        </div>

        {/* Soft Feedback */}
        {sim.monthsFaster > 0 && (
          <motion.div
            className="card-game bg-primary/5 border-primary/20 text-center py-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm font-bold text-primary">
              🚀 {lang === "th"
                ? `ถึงเป้าหมายเร็วขึ้นประมาณ ${sim.monthsFaster} เดือน`
                : `Reach your goal ~${sim.monthsFaster} months faster`
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">{t("sim.softNote")}</p>
          </motion.div>
        )}

        {/* Apply or Discard */}
        <div className="space-y-3">
          <motion.button
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleApply}
            disabled={showApplied}
          >
            {showApplied ? "✅ " + t("sim.applied") : "✨ " + t("sim.usePlan")}
          </motion.button>
          <button
            className="w-full py-3 rounded-2xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
            onClick={() => navigate(-1)}
          >
            {t("sim.keepCurrent")}
          </button>
        </div>
      </div>
    </div>
  );
};

const SliderRow = ({ label, emoji, value, onChange, min, max, step, suffix }: {
  label: string; emoji: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; suffix?: string;
}) => (
  <div>
    <div className="flex items-center justify-between text-sm mb-2">
      <span className="text-muted-foreground font-bold">{emoji} {label}</span>
      <span className="font-black text-foreground">
        {suffix === "%" ? `${value}%` : formatMoney(value)}
      </span>
    </div>
    <input
      type="range"
      className="slider-game w-full"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  </div>
);

export default Sandbox;
