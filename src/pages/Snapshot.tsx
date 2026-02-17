import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { ArrowLeft, TrendingUp, PiggyBank, Clock, Shield, DollarSign } from "lucide-react";

const Snapshot = () => {
  const navigate = useNavigate();
  const { financialSnapshot, calculateSnapshot, xp, levels } = useGame();

  useEffect(() => {
    calculateSnapshot();
  }, []);

  const snap = financialSnapshot;

  if (!snap) return null;

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const metrics = [
    {
      icon: <DollarSign className="w-5 h-5" />,
      label: "Monthly Savings",
      value: formatMoney(snap.monthlySavings),
      sub: `${snap.savingsRate.toFixed(0)}% savings rate`,
      color: "bg-primary/10 text-primary",
    },
    {
      icon: <PiggyBank className="w-5 h-5" />,
      label: "Annual Savings",
      value: formatMoney(snap.annualSavings),
      sub: `${formatMoney(snap.monthlyIncome)}/mo income`,
      color: "bg-secondary/30 text-secondary-foreground",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "Projected Retirement Fund",
      value: formatMoney(snap.retirementFund),
      sub: `At age ${snap.retirementAge} (${snap.retirementAge - snap.currentAge} years)`,
      color: "bg-accent/10 text-accent",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: "Inflation-Adjusted Value",
      value: formatMoney(snap.inflationAdjusted),
      sub: "In today's dollars",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "Safe Monthly Spending in Retirement",
      value: `${formatMoney(snap.safeSpendingRange[0])} – ${formatMoney(snap.safeSpendingRange[1])}`,
      sub: `Risk profile: ${snap.riskTolerance}`,
      color: "bg-secondary/30 text-secondary-foreground",
    },
  ];

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
          <h1 className="font-black text-foreground">Your Financial Snapshot</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <motion.div
          className="card-game mb-6 text-center bg-primary/5 border-primary/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-4xl mb-2 block">📊</span>
          <h2 className="text-xl font-black text-foreground mb-1">
            Your Money Report
          </h2>
          <p className="text-sm text-muted-foreground">
            Based on your answers across {levels.filter(l => l.answers.length > 0).length} levels
          </p>
          <div className="xp-badge mt-3 justify-center">
            ⭐ {xp} XP earned
          </div>
        </motion.div>

        <div className="space-y-4">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              className="card-game"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center shrink-0`}>
                  {m.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">{m.label}</p>
                  <p className="text-xl font-black text-foreground">{m.value}</p>
                  <p className="text-sm text-muted-foreground">{m.sub}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-8 card-game text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="font-bold text-foreground mb-2">Keep playing to refine your plan!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Complete more levels to get a more accurate snapshot.
          </p>
          <motion.button
            className="btn-playful bg-primary text-primary-foreground px-8 py-3 w-full"
            onClick={() => navigate("/dashboard")}
            whileHover={{ scale: 1.02 }}
          >
            Back to Levels
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
};

export default Snapshot;
