import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
import { showTinyWin } from "@/components/TinyWin";

const formatMoney = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

const Sandbox = () => {
  const navigate = useNavigate();
  const { financialSnapshot, awardXP } = useGame();
  const { t } = useLanguage();
  const xpAwarded = useRef(false);

  useEffect(() => {
    if (!xpAwarded.current) {
      awardXP("view_snapshot");
      showTinyWin("🧮", "+5 XP — ลองคำนวณดี!");
      xpAwarded.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [income, setIncome] = useState(financialSnapshot?.monthlyIncome || 30000);
  const [expenses, setExpenses] = useState(financialSnapshot?.monthlyExpenses || 20000);
  const [extraSaving, setExtraSaving] = useState(1000);
  const [currentAge, setCurrentAge] = useState(financialSnapshot?.currentAge || 30);
  const [retirementAge, setRetirementAge] = useState(financialSnapshot?.retirementAge || 60);

  const calc = useMemo(() => {
    const safeExpenses = Math.min(expenses, income);
    const monthlySavings = Math.max(0, income - safeExpenses + extraSaving);
    const annualSavings = monthlySavings * 12;
    const yearsToRetire = Math.max(0, retirementAge - currentAge);
    const realReturn = 0.04;
    const fv = yearsToRetire > 0
      ? annualSavings * ((Math.pow(1 + realReturn, yearsToRetire) - 1) / realReturn)
      : annualSavings * yearsToRetire;
    const inflationAdj = fv / Math.pow(1.03, yearsToRetire);
    const safeMonthly = inflationAdj * 0.04 / 12;
    const savingsRate = income > 0 ? (monthlySavings / income) * 100 : 0;

    const baselineFund = financialSnapshot?.retirementFund || 0;
    const diffMonths = baselineFund > 0 ? Math.round((fv - baselineFund) / (monthlySavings || 1)) : 0;

    return { fv, inflationAdj, safeMonthly, savingsRate, diffMonths, monthlySavings };
  }, [income, expenses, extraSaving, currentAge, retirementAge, financialSnapshot]);

  const rateColor = calc.savingsRate > 20 ? "text-primary" : calc.savingsRate > 10 ? "text-secondary-foreground" : "text-destructive";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-black text-foreground flex-1">🧮 {t("sandbox.title")}</h1>
          <LanguageToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-3 text-center text-sm text-secondary-foreground">
          🧮 {t("sandbox.disclaimer")}
        </div>

        {/* Sliders */}
        <div className="card-game space-y-5">
          <SliderRow label={t("sandbox.income")} value={income} onChange={setIncome} min={5000} max={200000} step={1000} />
          <SliderRow label={t("sandbox.expenses")} value={expenses} onChange={(v) => setExpenses(Math.min(v, income))} min={0} max={income} step={500} />
          <SliderRow label={t("sandbox.extraSaving")} value={extraSaving} onChange={setExtraSaving} min={0} max={50000} step={500} />
          <SliderRow label={t("sandbox.currentAge")} value={currentAge} onChange={setCurrentAge} min={18} max={60} step={1} suffix="" />
          <SliderRow label={t("sandbox.retireAge")} value={retirementAge} onChange={(v) => setRetirementAge(Math.max(currentAge + 1, v))} min={currentAge + 1} max={75} step={1} suffix="" />
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-3">
          <ResultCard emoji="🏦" label={t("sandbox.projectedFund")} value={formatMoney(Math.round(calc.fv))} />
          <ResultCard
            emoji={calc.diffMonths >= 0 ? "⚡" : "⏳"}
            label={t("sandbox.vsPlan")}
            value={calc.diffMonths >= 0 ? `+${calc.diffMonths} เดือนเร็วขึ้น` : `${Math.abs(calc.diffMonths)} เดือนช้าลง`}
            valueClass={calc.diffMonths >= 0 ? "text-primary" : "text-destructive"}
          />
          <ResultCard emoji="💰" label={t("sandbox.savingsRate")} value={`${Math.round(calc.savingsRate)}%`} valueClass={rateColor} />
          <ResultCard emoji="🏖️" label={t("sandbox.retireMonthly")} value={formatMoney(Math.round(calc.safeMonthly))} />
        </div>

        <motion.button
          className="w-full btn-playful bg-primary text-primary-foreground py-4 text-base"
          onClick={() => navigate("/plan/flow")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {t("sandbox.applyToPlan")}
        </motion.button>
      </main>
    </div>
  );
};

const SliderRow = ({ label, value, onChange, min, max, step, suffix = "฿" }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; suffix?: string;
}) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-muted-foreground font-bold">{label}</span>
      <span className="font-black text-foreground">{suffix ? formatMoney(value) : value}</span>
    </div>
    <input type="range" className="slider-game w-full" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
  </div>
);

const ResultCard = ({ emoji, label, value, valueClass }: { emoji: string; label: string; value: string; valueClass?: string }) => (
  <motion.div className="card-game py-4 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <span className="text-2xl">{emoji}</span>
    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">{label}</p>
    <p className={`text-sm font-black mt-1 ${valueClass || "text-foreground"}`}>{value}</p>
  </motion.div>
);

export default Sandbox;
