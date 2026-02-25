import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Shield, Gamepad2, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-game-hero">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg"
            whileHover={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-primary-foreground text-xl">💰</span>
          </motion.div>
          <span className="font-black text-xl text-foreground">FinGame</span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <motion.button
            onClick={() => navigate("/plan")}
            className="btn-playful bg-primary text-primary-foreground px-6 py-2.5 text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {t("landing.startPlaying")}
          </motion.button>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <section className="py-16 md:py-28 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-bold mb-8"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Sparkles className="w-4 h-4" />
              {t("landing.badge")}
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground leading-[1.1] mb-6">
              {t("landing.title1")}{" "}
              <span className="text-primary relative">
                {t("landing.title2")}
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-1.5 bg-primary/30 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("landing.subtitle")}
            </p>
            <motion.button
              onClick={() => navigate("/plan")}
              className="btn-playful bg-primary text-primary-foreground px-12 py-5 text-lg"
              whileHover={{ scale: 1.06 }}
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
              gradient: "from-primary/10 to-primary/5",
              iconBg: "bg-primary/10 text-primary",
            },
            {
              icon: <TrendingUp className="w-8 h-8" />,
              title: t("landing.feature2Title"),
              desc: t("landing.feature2Desc"),
              gradient: "from-secondary/10 to-secondary/5",
              iconBg: "bg-secondary/20 text-secondary-foreground",
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: t("landing.feature3Title"),
              desc: t("landing.feature3Desc"),
              gradient: "from-accent/10 to-accent/5",
              iconBg: "bg-accent/10 text-accent",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              className={`card-game text-center bg-gradient-to-br ${f.gradient}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
              whileHover={{ y: -4 }}
            >
              <div className={`w-16 h-16 rounded-2xl ${f.iconBg} flex items-center justify-center mx-auto mb-4`}>
                {f.icon}
              </div>
              <h3 className="font-extrabold text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </section>

        <section className="py-16 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-foreground mb-10">{t("landing.howItWorks")}</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((step, i) => {
              const emojis = ["🌱", "💸", "🎯", "🏖️", "📈"];
              const gradients = [
                "from-primary/5 to-transparent",
                "from-secondary/5 to-transparent",
                "from-accent/5 to-transparent",
                "from-primary/5 to-transparent",
                "from-secondary/5 to-transparent",
              ];
              return (
                <motion.div
                  key={i}
                  className={`flex items-center gap-4 card-game text-left bg-gradient-to-r ${gradients[i]}`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                  whileHover={{ x: 4 }}
                >
                  <motion.div
                    className="level-node level-node-active text-lg shrink-0"
                    whileHover={{ scale: 1.1 }}
                  >
                    {emojis[i]}
                  </motion.div>
                  <div>
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">LEVEL {step}</span>
                    <p className="font-bold text-foreground">{t(`landing.step${step}`)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="py-16 text-center">
          <motion.div
            className="card-game max-w-lg mx-auto bg-gradient-to-br from-primary/8 to-primary/3 border-primary/20"
            whileHover={{ scale: 1.01 }}
          >
            <span className="text-4xl block mb-3">🚀</span>
            <h2 className="text-2xl font-black text-foreground mb-3">
              {t("landing.readyCta")}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t("landing.readyCtaSub")}
            </p>
            <motion.button
              onClick={() => navigate("/plan")}
              className="btn-playful bg-primary text-primary-foreground px-10 py-3.5 text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("landing.letsGo")}
            </motion.button>
          </motion.div>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        <p>{t("landing.footer")}</p>
      </footer>
    </div>
  );
};

export default Landing;
