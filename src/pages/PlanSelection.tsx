import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useGame } from "@/context/GameContext";
import LanguageToggle from "@/components/LanguageToggle";
import { planOptions, PlanType } from "@/data/planFlows";
import { ArrowLeft } from "lucide-react";

const PlanSelection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { selectPlan } = useGame();

  const handleSelect = (planType: PlanType) => {
    selectPlan(planType);
    navigate("/plan/flow");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1" />
          <LanguageToggle />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-lg flex flex-col items-center justify-center">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-5xl mb-4 block">🗺️</span>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2">
            {t("plan.selectTitle")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("plan.selectSub")}
          </p>
        </motion.div>

        <div className="space-y-4 w-full">
          {planOptions.map((plan, i) => (
            <motion.button
              key={plan.id}
              className="w-full option-card flex items-center gap-4 text-left"
              onClick={() => handleSelect(plan.id)}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-3xl">{plan.emoji}</span>
              <div>
                <h3 className="font-bold text-foreground">
                  {t(`plan.${plan.id}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`plan.${plan.id}.desc`)}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PlanSelection;
