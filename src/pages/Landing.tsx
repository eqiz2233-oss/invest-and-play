import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Shield, Gamepad2, Sparkles } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xl">💰</span>
          </div>
          <span className="font-black text-xl text-foreground">FinGame</span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="btn-playful bg-primary text-primary-foreground px-6 py-2.5 text-sm"
        >
          Start Playing
        </button>
      </header>

      <main className="container mx-auto px-4">
        {/* Hero section */}
        <section className="py-16 md:py-24 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4" />
              Financial planning that feels like a game
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-foreground leading-tight mb-6">
              Master Your Money,{" "}
              <span className="text-primary">One Level at a Time</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Stop stressing about finances. Answer fun questions, unlock levels,
              and get a real financial plan — no jargon, no spreadsheets, no boring stuff.
            </p>
            <motion.button
              onClick={() => navigate("/dashboard")}
              className="btn-playful bg-primary text-primary-foreground px-10 py-4 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🎮 Start Your Journey — Free
            </motion.button>
            <p className="mt-4 text-sm text-muted-foreground">
              Takes 5 minutes • No sign-up required
            </p>
          </motion.div>
        </section>

        {/* Features */}
        <section className="py-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: <Gamepad2 className="w-8 h-8" />,
              title: "Learn by Playing",
              desc: "Answer simple questions across 5 levels. Each answer secretly builds your financial plan.",
              color: "bg-primary/10 text-primary",
            },
            {
              icon: <TrendingUp className="w-8 h-8" />,
              title: "Real Calculations",
              desc: "Behind the fun UI, we run the same math a financial advisor uses. Savings, retirement, inflation — all covered.",
              color: "bg-secondary/30 text-secondary-foreground",
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: "No Jargon, No Stress",
              desc: "We speak human. Every question is simple, every answer gives instant feedback. Zero financial jargon.",
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

        {/* How it works */}
        <section className="py-16 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-foreground mb-10">How It Works</h2>
          <div className="space-y-6">
            {[
              { step: "1", emoji: "🌱", text: "Start with the basics — how you feel about money" },
              { step: "2", emoji: "💸", text: "Tell us about your income and expenses" },
              { step: "3", emoji: "🎯", text: "Set your savings goals" },
              { step: "4", emoji: "🏖️", text: "Plan for retirement (yes, even if you're 25)" },
              { step: "5", emoji: "📈", text: "Discover your risk profile and investment style" },
            ].map((s, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-4 card-game text-left"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
              >
                <div className="level-node level-node-active text-lg shrink-0">
                  {s.emoji}
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground">LEVEL {s.step}</span>
                  <p className="font-bold text-foreground">{s.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="card-game max-w-lg mx-auto bg-primary/5 border-primary/20">
            <h2 className="text-2xl font-black text-foreground mb-3">
              Ready to level up your finances? 🚀
            </h2>
            <p className="text-muted-foreground mb-6">
              5 levels. 5 minutes. A real financial plan.
            </p>
            <motion.button
              onClick={() => navigate("/dashboard")}
              className="btn-playful bg-primary text-primary-foreground px-8 py-3 text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Let's Go!
            </motion.button>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground border-t border-border">
        <p>FinGame — Making financial planning fun 💚</p>
      </footer>
    </div>
  );
};

export default Landing;
