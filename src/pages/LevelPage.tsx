import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { levels } from "@/data/levels";
import { ArrowLeft, Check, Sparkles } from "lucide-react";

const formatSliderValue = (value: number, suffix?: string) => {
  const formatted = value >= 1000
    ? `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`
    : suffix?.includes("$")
    ? `$${value}`
    : `${value}`;
  return suffix && !suffix.includes("$") ? `${formatted} ${suffix}` : formatted;
};

const LevelPage = () => {
  const { id } = useParams();
  const levelId = Number(id);
  const navigate = useNavigate();
  const { currentQuestion, completeQuestion, completeLevel } = useGame();
  const level = levels.find((l) => l.id === levelId);
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);
  const [sliderValue, setSliderValue] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  if (!level) {
    navigate("/dashboard");
    return null;
  }

  const question = level.questions[currentQuestion];
  const isLastQuestion = currentQuestion >= level.questions.length;
  const progress = (currentQuestion / level.questions.length) * 100;

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
            className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="text-5xl">{level.emoji}</span>
          </motion.div>
          <h2 className="text-3xl font-black text-foreground mb-2">Level Complete! 🎉</h2>
          <p className="text-muted-foreground mb-2">
            You crushed <span className="font-bold text-foreground">{level.title}</span>!
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Your answers are shaping your financial plan.
          </p>
          <div className="xp-badge text-base mb-8 justify-center">
            <Sparkles className="w-4 h-4" />
            +50 XP earned
          </div>
          <motion.button
            className="btn-playful bg-primary text-primary-foreground px-8 py-4 w-full text-lg"
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
      setSliderValue(null);
      if (currentQuestion >= level.questions.length - 1) {
        setShowComplete(true);
      }
      return;
    }

    let value: string | number | null = null;
    let label = "";

    if (question.type === "slider") {
      const v = sliderValue ?? question.defaultValue ?? 0;
      value = v;
      label = formatSliderValue(v, question.suffix);
    } else if (question.type === "choice") {
      value = selectedOption;
      label = question.options?.find((o) => o.value === selectedOption)?.label || "";
    }

    if (value === null || value === undefined) return;

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
      : question.type === "slider"
      ? true // slider always has a value
      : false;

  const currentSliderVal = sliderValue ?? question.defaultValue ?? question.min ?? 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

      <main className="flex-1 container mx-auto px-4 py-8 max-w-lg flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            {/* Question */}
            <div className="mb-8">
              <motion.span
                className="text-xs font-bold text-primary uppercase mb-2 block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {level.emoji} {level.title}
              </motion.span>
              <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2 leading-tight">
                {question.text}
              </h2>
              {question.helpText && (
                <p className="text-sm text-muted-foreground">{question.helpText}</p>
              )}
            </div>

            {/* Choice options */}
            {question.type === "choice" && question.options && (
              <div className="space-y-3">
                {question.options.map((opt, i) => (
                  <motion.div
                    key={String(opt.value)}
                    className={`option-card ${
                      selectedOption === opt.value ? "option-card-selected" : ""
                    } ${
                      submitted && selectedOption === opt.value ? "option-card-correct" : ""
                    }`}
                    onClick={() => !submitted && setSelectedOption(opt.value)}
                    whileTap={!submitted ? { scale: 0.98 } : {}}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
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

            {/* Slider input */}
            {question.type === "slider" && (
              <motion.div
                className="card-game"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-center mb-6">
                  <motion.span
                    className="text-4xl md:text-5xl font-black text-primary inline-block"
                    key={currentSliderVal}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {formatSliderValue(currentSliderVal, question.suffix)}
                  </motion.span>
                </div>
                <input
                  type="range"
                  min={question.min}
                  max={question.max}
                  step={question.step}
                  value={currentSliderVal}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  disabled={submitted}
                  className="slider-game w-full"
                />
                <div className="flex justify-between mt-2 text-xs font-bold text-muted-foreground">
                  <span>{formatSliderValue(question.min ?? 0, question.suffix)}</span>
                  <span>{formatSliderValue(question.max ?? 100, question.suffix)}</span>
                </div>
                {submitted && (
                  <motion.p
                    className="mt-4 text-sm font-bold text-primary text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    ✅ Got it! Great choice.
                  </motion.p>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Submit button — always at bottom */}
        <motion.div
          className="mt-auto pt-6"
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
