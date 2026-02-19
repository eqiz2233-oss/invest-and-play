import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useGame } from "@/context/GameContext";
import { planOptions, PlanType } from "@/data/planFlows";

const PlanSelection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { selectPlan } = useGame();

  const handleSelect = (planType: PlanType) => {
    selectPlan(planType);
    navigate("/levels");
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-8 max-w-lg flex flex-col items-center justify-center">
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
      </div>
    </div>
  );
};

export default PlanSelection;
