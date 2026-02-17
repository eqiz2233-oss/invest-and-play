import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { levels } from "@/data/levels";
import { Trophy, Flame, Star, ChevronRight, Lock } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { xp, streak, levels: levelProgress, startLevel } = useGame();
  const completedCount = levelProgress.filter((l) => l.status === "complete").length;
  const totalQuestions = levels.reduce((acc, l) => acc + l.questions.length, 0);
  const answeredQuestions = levelProgress.reduce((acc, l) => acc + l.answers.length, 0);
  const overallProgress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  const handleLevelClick = (levelId: number, status: string) => {
    if (status === "locked") return;
    startLevel(levelId);
    navigate(`/level/${levelId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm">💰</span>
            </div>
            <span className="font-black text-foreground">FinGame</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="xp-badge">
              <Star className="w-3.5 h-3.5" />
              {xp} XP
            </div>
            <div className="streak-badge">
              <Flame className="w-3.5 h-3.5" />
              {streak}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* Progress overview */}
        <motion.div
          className="card-game mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-foreground">Your Journey</h2>
            <span className="text-sm font-bold text-primary">{Math.round(overallProgress)}%</span>
          </div>
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
            <span>{completedCount}/5 levels complete</span>
            <span>{answeredQuestions} answers</span>
          </div>
        </motion.div>

        {/* Level map */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 top-8 bottom-8 w-1 bg-border rounded-full" />

          <div className="space-y-4">
            {levels.map((level, i) => {
              const progress = levelProgress.find((l) => l.levelId === level.id);
              const status = progress?.status || "locked";

              return (
                <motion.div
                  key={level.id}
                  className={`relative flex items-center gap-4 cursor-pointer ${
                    status === "locked" ? "opacity-60" : ""
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: status === "locked" ? 0.6 : 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleLevelClick(level.id, status)}
                >
                  {/* Node */}
                  <div
                    className={`level-node shrink-0 z-10 ${
                      status === "complete"
                        ? "level-node-complete"
                        : status === "active"
                        ? "level-node-active"
                        : "level-node-locked"
                    }`}
                  >
                    {status === "complete" ? (
                      <Trophy className="w-6 h-6" />
                    ) : status === "locked" ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <span>{level.emoji}</span>
                    )}
                  </div>

                  {/* Card */}
                  <div
                    className={`flex-1 card-game py-4 flex items-center justify-between ${
                      status === "active" ? "border-primary/30" : ""
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-muted-foreground uppercase">
                        Level {level.id}
                      </span>
                      <h3 className="font-bold text-foreground">{level.title}</h3>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                      {status === "complete" && (
                        <span className="text-xs font-bold text-accent mt-1 inline-block">
                          ✅ Complete • +50 XP
                        </span>
                      )}
                    </div>
                    {status !== "locked" && (
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTAs */}
        {completedCount >= 2 && (
          <div className="mt-8 space-y-3">
            <motion.button
              className="w-full btn-playful bg-secondary text-secondary-foreground py-4 text-base"
              onClick={() => navigate("/snapshot")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
            >
              📊 View Your Financial Snapshot
            </motion.button>
            <motion.button
              className="w-full btn-playful bg-accent text-accent-foreground py-4 text-base"
              onClick={() => navigate("/calendar")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              📅 Your Action Plan
            </motion.button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
