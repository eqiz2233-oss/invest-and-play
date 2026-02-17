import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { levels } from "@/data/levels";
import { ArrowLeft, Check, X, Sparkles } from "lucide-react";

const LevelPage = () => {
  const { id } = useParams();
  const levelId = Number(id);
  const navigate = useNavigate();
  const { currentQuestion, completeQuestion, completeLevel } = useGame();
  const level = levels.find((l) => l.id === levelId);
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);
  const [numberInput, setNumberInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  if (!level) {
    navigate("/dashboard");
    return null;
  }

  const question = level.questions[currentQuestion];
  const isLastQuestion = currentQuestion >= level.questions.length;
  const progress = ((currentQuestion) / level.questions.length) * 100;

  if (isLastQuestion || showComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          className="card-game text-center max-w-md w-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span className="text-4xl">{level.emoji}</span>
          </motion.div>
          <h2 className="text-2xl font-black text-foreground mb-2">Level Complete! 🎉</h2>
          <p className="text-muted-foreground mb-4">
            You crushed {level.title}!
          </p>
          <div className="xp-badge text-base mb-6 justify-center">
            <Sparkles className="w-4 h-4" />
            +50 XP earned
          </div>
          <motion.button
            className="btn-playful bg-primary text-primary-foreground px-8 py-3 w-full"
            onClick={() => {
              completeLevel(levelId);
              navigate("/dashboard");
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue Journey →
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (submitted) {
      setSubmitted(false);
      setSelectedOption(null);
      setNumberInput("");
      if (currentQuestion >= level.questions.length - 1) {
        setShowComplete(true);
      }
      return;
    }

    const value = question.type === "number" ? Number(numberInput) : selectedOption;
    const label =
      question.type === "number"
        ? numberInput
        : question.options?.find((o) => o.value === selectedOption)?.label || "";

    if (value === null || value === undefined || (question.type === "number" && !numberInput)) return;

    completeQuestion({
      questionId: question.id,
      value: value,
      label: String(label),
    });
    setSubmitted(true);
  };

  const canSubmit =
    question.type === "choice"
      ? selectedOption !== null
      : numberInput.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 progress-track h-3">
            <motion.div
              className="progress-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="text-sm font-bold text-muted-foreground">
            {currentQuestion + 1}/{level.questions.length}
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question */}
            <div className="mb-8">
              <span className="text-xs font-bold text-primary uppercase mb-2 block">
                {level.emoji} {level.title}
              </span>
              <h2 className="text-2xl font-black text-foreground mb-2">{question.text}</h2>
              {question.helpText && (
                <p className="text-sm text-muted-foreground">{question.helpText}</p>
              )}
            </div>

            {/* Options */}
            {question.type === "choice" && question.options && (
              <div className="space-y-3">
                {question.options.map((opt) => (
                  <motion.div
                    key={String(opt.value)}
                    className={`option-card ${
                      selectedOption === opt.value ? "option-card-selected" : ""
                    } ${
                      submitted && selectedOption === opt.value ? "option-card-correct" : ""
                    }`}
                    onClick={() => !submitted && setSelectedOption(opt.value)}
                    whileTap={!submitted ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{opt.label}</span>
                      {submitted && selectedOption === opt.value && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <Check className="w-5 h-5 text-primary" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Number input */}
            {question.type === "number" && (
              <div className="card-game">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={numberInput}
                    onChange={(e) => setNumberInput(e.target.value)}
                    placeholder={question.placeholder}
                    disabled={submitted}
                    className="flex-1 bg-transparent text-3xl font-black text-foreground outline-none placeholder:text-muted-foreground/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {question.suffix && (
                    <span className="text-sm font-bold text-muted-foreground whitespace-nowrap">
                      {question.suffix}
                    </span>
                  )}
                </div>
                {submitted && (
                  <motion.p
                    className="mt-3 text-sm font-bold text-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    ✅ Got it!
                  </motion.p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Submit button */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            className={`w-full btn-playful py-4 text-base font-bold ${
              canSubmit || submitted
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
            onClick={handleSubmit}
            disabled={!canSubmit && !submitted}
            whileHover={canSubmit || submitted ? { scale: 1.02 } : {}}
            whileTap={canSubmit || submitted ? { scale: 0.98 } : {}}
            style={
              !canSubmit && !submitted
                ? { boxShadow: "0 6px 0 0 hsl(220 10% 66%)" }
                : {}
            }
          >
            {submitted ? "Continue →" : "Check"}
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
};

export default LevelPage;
