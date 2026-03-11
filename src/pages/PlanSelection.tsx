import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useGame } from "@/context/GameContext";
import { planOptions, PlanType } from "@/data/planFlows";
import { Check } from "lucide-react";

const cardMeta: Record<PlanType, { features: string[]; popular?: boolean }> = {
  saving: {
    features: [
      "Track monthly savings",
      "Set saving targets",
      "Emergency fund check",
      "Spending habits review",
    ],
  },
  goal: {
    features: [
      "All Saving features",
      "Big purchase planning",
      "Timeline optimizer",
      "Priority balancing",
      "Goal tracking",
    ],
    popular: true,
  },
  retirement: {
    features: [
      "Retirement projection",
      "Lifestyle planning",
      "Inflation adjusted",
      "Monthly spending calc",
    ],
  },
};

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
      <div className="flex-1 container mx-auto px-4 py-10 max-w-5xl flex flex-col items-center justify-center">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-3">
            {t("plan.selectTitle")}
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            {t("plan.selectSub")}
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch">
          {planOptions.map((plan, i) => {
            const meta = cardMeta[plan.id];
            const isPopular = meta.popular;

            return (
              <motion.div
                key={plan.id}
                className="relative flex"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-primary text-primary-foreground text-xs font-extrabold px-4 py-1.5 rounded-full shadow-md uppercase tracking-wide">
                      Popular
                    </span>
                  </div>
                )}

                <button
                  onClick={() => handleSelect(plan.id)}
                  className={`
                    w-full flex flex-col rounded-2xl border-2 transition-all duration-200 text-left
                    hover:shadow-lg hover:-translate-y-1
                    active:translate-y-0 active:shadow-md
                    ${isPopular
                      ? "border-primary bg-card shadow-lg scale-[1.03] md:scale-105"
                      : "border-border bg-card shadow-sm hover:border-primary/50"
                    }
                  `}
                >
                  {/* Card Header */}
                  <div className={`px-6 pt-8 pb-5 text-center ${isPopular ? "pb-6" : ""}`}>
                    <span className="text-5xl mb-3 block">{plan.emoji}</span>
                    <h3 className="text-xl font-black text-foreground mb-1">
                      {t(`plan.${plan.id}.title`)}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(`plan.${plan.id}.desc`)}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="mx-6 border-t border-border" />

                  {/* Features */}
                  <div className="px-6 py-5 flex-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      What you'll plan:
                    </p>
                    <ul className="space-y-2.5">
                      {meta.features.map((feat, fi) => (
                        <li key={fi} className="flex items-start gap-2.5 text-sm text-foreground">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="px-6 pb-6 pt-2">
                    <div
                      className={`
                        w-full py-3 rounded-xl text-center font-extrabold text-sm transition-colors
                        ${isPopular
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground hover:bg-primary/10"
                        }
                      `}
                    >
                      {t("plan.startPlanning")}
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;
