import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Shield, Gamepad2, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xl">💰</span>
          </div>
          <span className="font-black text-xl text-foreground">FinGame</span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-playful bg-primary text-primary-foreground px-6 py-2.5 text-sm"
          >
            {t("landing.startPlaying")}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <section className="py-16 md:py-24 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4" />
              {t("landing.badge")}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground leading-tight mb-6">
              {t("landing.title1")}{" "}
              <span className="text-primary">{t("landing.title2")}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t("landing.subtitle")}
            </p>
            <motion.button
              onClick={() => navigate("/dashboard")}
              className="btn-playful bg-primary text-primary-foreground px-10 py-4 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("landing.cta")}
            </motion.button>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("landing.ctaSub")}
            </p>
          </motion.div>
        </section>

        <section className="py-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: <Gamepad2 className="w-8 h-8" />,
              title: t("landing.feature1Title"),
              desc: t("landing.feature1Desc"),
              color: "bg-primary/10 text-primary",
            },
            {
              icon: <TrendingUp className="w-8 h-8" />,
              title: t("landing.feature2Title"),
              desc: t("landing.feature2Desc"),
              color: "bg-secondary/30 text-secondary-foreground",
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: t("landing.feature3Title"),
              desc: t("landing.feature3Desc"),
              color: "bg-accent/10 text-accent",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="card-game text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            >
              <div className={`w-16 h-16 rounded-2xl ${f.color} flex items-center justify-center mx-auto mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </section>

        <section className="py-16 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-foreground mb-10">{t("landing.howItWorks")}</h2>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((step, i) => {
              const emojis = ["🌱", "💸", "🎯", "🏖️", "📈"];
              return (
                <motion.div
                  key={i}
                  className="flex items-center gap-4 card-game text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                >
                  <div className="level-node level-node-active text-lg shrink-0">
                    {emojis[i]}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-muted-foreground">LEVEL {step}</span>
                    <p className="font-bold text-foreground">{t(`landing.step${step}`)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="py-16 text-center">
          <div className="card-game max-w-lg mx-auto bg-primary/5 border-primary/20">
            <h2 className="text-2xl font-black text-foreground mb-3">
              {t("landing.readyCta")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("landing.readyCtaSub")}
            </p>
            <motion.button
              onClick={() => navigate("/dashboard")}
              className="btn-playful bg-primary text-primary-foreground px-8 py-3 text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("landing.letsGo")}
            </motion.button>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground border-t border-border">
        <p>{t("landing.footer")}</p>
      </footer>
    </div>
  );
};

export default Landing;
