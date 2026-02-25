import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";
import { flows, FlowQuestion, planOptions, PlanType } from "@/data/planFlows";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Check, Lock, Play, Sparkles, Trophy, Plus, Calendar, BarChart2 } from "lucide-react";

const formatNum = (n: number) => new Intl.NumberFormat("en-US").format(n);

type NodeState = "done" | "active" | "locked";

// ─── Victory Screen ───
const VictoryScreen = ({ onGoCalendar, onGoSummary, xpEarned }: {
  onGoCalendar: () => void;
  onGoSummary: () => void;
  xpEarned: number;
}) => {
  const [phase, setPhase] = useState<"celebrate" | "buttons">("celebrate");

  useEffect(() => {
    const timer = setTimeout(() => setPhase("buttons"), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm overflow-hidden">
      {/* Confetti particles */}
      {phase === "celebrate" && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-5%`,
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                backgroundColor: [
                  "hsl(var(--primary))",
                  "hsl(var(--secondary))",
                  "hsl(var(--accent))",
                  "hsl(var(--xp))",
                  "hsl(4 68% 58%)",
                ][i % 5],
              }}
              initial={{ y: 0, rotate: 0, opacity: 1 }}
              animate={{
                y: window.innerHeight + 100,
                rotate: Math.random() * 720 - 360,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 1,
                ease: "easeIn",
              }}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === "celebrate" && (
          <motion.div
            key="celebrate"
            className="flex flex-col items-center text-center px-8"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <motion.div
              className="text-8xl mb-4"
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 0.5 }}
            >
              🏆
            </motion.div>
            <h1 className="text-4xl font-black text-foreground mb-2">Path Complete!</h1>
            <p className="text-muted-foreground text-lg mb-4">เยี่ยมมาก! You did it! 🎉</p>
            <motion.div
              className="xp-badge text-lg px-7 py-2.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Sparkles className="w-5 h-5" />
              +{xpEarned} XP
            </motion.div>
          </motion.div>
        )}

        {phase === "buttons" && (
          <motion.div
            key="buttons"
            className="flex flex-col items-center text-center px-8 max-w-sm w-full"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              className="text-6xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.6, delay: 0.1 }}
            >
              🏆
            </motion.div>
            <h2 className="text-2xl font-black text-foreground mb-2">Congratulations!</h2>
            <motion.div
              className="xp-badge mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Sparkles className="w-4 h-4" />
              +{xpEarned} XP earned
            </motion.div>
            <div className="space-y-3 w-full">
              <motion.button
                className="w-full btn-playful bg-primary text-primary-foreground px-8 py-4 text-base flex items-center justify-center gap-2"
                onClick={onGoCalendar}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Calendar className="w-5 h-5" />
                Go to Calendar
              </motion.button>
              <motion.button
                className="w-full btn-playful bg-card border-2 border-border text-foreground px-8 py-4 text-base flex items-center justify-center gap-2"
                onClick={onGoSummary}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <BarChart2 className="w-5 h-5" />
                View Summary
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PlayPage = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const {
    selectedPlan, planAnswers, submitPlanAnswer, calculateSnapshot,
    plans, createPlan, activePlanId, switchPlan,
  } = useGame();

  const [showModeSelect, setShowModeSelect] = useState(false);
  const [openQuestionIdx, setOpenQuestionIdx] = useState<number | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [victoryShown, setVictoryShown] = useState(false);

  const flow = flows.find(f => f.id === selectedPlan);

  const activeQuestions: FlowQuestion[] = useMemo(() => {
    if (!flow) return [];
    return flow.questions.filter(q => {
      if (!q.conditionalOn) return true;
      const answer = planAnswers.find(a => a.questionId === q.conditionalOn!.questionId);
      if (!answer) return false;
      return q.conditionalOn!.values.includes(answer.value);
    });
  }, [flow, planAnswers]);

  const answeredIds = useMemo(() => new Set(planAnswers.map(a => a.questionId)), [planAnswers]);

  const getNodeState = (q: FlowQuestion, idx: number): NodeState => {
    if (answeredIds.has(q.id)) return "done";
    const firstUnanswered = activeQuestions.findIndex(aq => !answeredIds.has(aq.id));
    if (idx === firstUnanswered) return "active";
    return "locked";
  };

  const isComplete = activeQuestions.length > 0 && activeQuestions.every(q => answeredIds.has(q.id));

  useEffect(() => {
    if (isComplete && !victoryShown) {
      calculateSnapshot();
      setShowVictory(true);
      setVictoryShown(true);
    }
  }, [isComplete, victoryShown, calculateSnapshot]);

  const progress = activeQuestions.length > 0
    ? (activeQuestions.filter(q => answeredIds.has(q.id)).length / activeQuestions.length) * 100
    : 0;

  const handleModeSelect = (type: PlanType) => {
    const modeNames: Record<PlanType, string> = {
      saving: lang === "th" ? "ออมเงิน" : "Saving",
      goal: lang === "th" ? "เป้าหมาย" : "Financial Goal",
      retirement: lang === "th" ? "เกษียณ" : "Retirement",
    };
    const emojis: Record<PlanType, string> = { saving: "💰", goal: "🎯", retirement: "🏖️" };
    createPlan(type, modeNames[type], emojis[type]);
    setShowModeSelect(false);
    setVictoryShown(false);
  };

  const handleNodeClick = (idx: number, state: NodeState) => {
    if (state === "active") setOpenQuestionIdx(idx);
  };

  const getNodeOffset = (idx: number) => {
    const positions = [0, -48, 0, 48];
    return positions[idx % 4];
  };

  const modeEmoji: Record<string, string> = { saving: "💰", goal: "🎯", retirement: "🏖️" };

  const activePlan = plans.find(p => p.id === activePlanId);

  return (
    <>
      {showVictory && (
        <VictoryScreen
          xpEarned={activeQuestions.length * 10}
          onGoCalendar={() => { setShowVictory(false); navigate("/calendar"); }}
          onGoSummary={() => { setShowVictory(false); navigate("/snapshot"); }}
        />
      )}

      <div className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-8 max-w-lg flex flex-col items-center">

          {/* Active plan label */}
          {activePlan && (
            <motion.div
              className="w-full mb-3 flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-sm font-extrabold text-muted-foreground">
                {activePlan.emoji} {activePlan.name}
              </span>
              {plans.length > 1 && (
                <div className="flex gap-1.5">
                  {plans.map(p => (
                    <motion.button
                      key={p.id}
                      onClick={() => switchPlan(p.id)}
                      className={`text-sm w-8 h-8 rounded-full font-bold transition-all flex items-center justify-center ${
                        p.id === activePlanId
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {p.emoji}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Progress bar */}
          {selectedPlan && activeQuestions.length > 0 && (
            <div className="w-full mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">
                  {modeEmoji[selectedPlan]} {t(`plan.${selectedPlan}.title`)}
                </span>
                <span className="text-sm font-black text-primary">{Math.round(progress)}%</span>
              </div>
              <div className="progress-track h-3.5 rounded-full">
                <motion.div
                  className="progress-fill rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          )}

          {/* Path */}
          <div className="relative w-full flex flex-col items-center py-4">
            {/* Curved path connector */}
            {activeQuestions.length > 0 && (
              <div className="absolute top-20 bottom-8 left-1/2 w-1 bg-gradient-to-b from-border via-border to-transparent -translate-x-1/2 z-0 rounded-full" />
            )}

            {/* START node */}
            <motion.button
              className={`relative z-10 w-22 h-22 rounded-full flex items-center justify-center text-2xl font-black mb-3 transition-all ${
                selectedPlan
                  ? "bg-gradient-to-br from-primary/10 to-primary/20 border-3 border-primary text-primary w-20 h-20"
                  : "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground w-20 h-20 hover:scale-105"
              }`}
              style={{
                boxShadow: selectedPlan
                  ? "0 4px 16px hsl(152 58% 46% / 0.15)"
                  : "0 6px 0 0 hsl(152 58% 34%), 0 8px 24px hsl(152 58% 46% / 0.3)",
              }}
              onClick={() => setShowModeSelect(true)}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {selectedPlan ? (
                <span className="text-3xl">{modeEmoji[selectedPlan]}</span>
              ) : (
                <Play className="w-8 h-8" />
              )}
            </motion.button>

            {!selectedPlan ? (
              <motion.p
                className="text-sm font-extrabold text-muted-foreground mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t("play.tapToStart")}
              </motion.p>
            ) : (
              <motion.button
                onClick={() => setShowModeSelect(true)}
                className="text-xs font-extrabold text-primary mb-8 hover:underline flex items-center gap-1 bg-primary/5 px-4 py-1.5 rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                <Plus className="w-3 h-3" />
                {lang === "th" ? "สร้างแผนใหม่" : "New Plan"}
              </motion.button>
            )}

            {/* Question nodes — Duolingo zigzag path */}
            {activeQuestions.map((q, idx) => {
              const state = getNodeState(q, idx);
              const offset = getNodeOffset(idx);
              const levelLabel = t(`level.${q.level}`) !== `level.${q.level}` ? t(`level.${q.level}`) : q.level;

              return (
                <motion.div
                  key={q.id}
                  className="relative z-10 mb-5 flex flex-col items-center"
                  style={{ marginLeft: offset }}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: state === "locked" ? 0.4 : 1, y: 0 }}
                  transition={{ delay: idx * 0.06, type: "spring", stiffness: 300 }}
                >
                  <motion.button
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-black border-4 transition-all ${
                      state === "done"
                        ? "bg-accent/10 border-accent text-accent"
                        : state === "active"
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-muted/70 border-border text-muted-foreground"
                    }`}
                    style={{
                      boxShadow:
                        state === "done"
                          ? "0 4px 0 0 hsl(215 76% 42%), 0 4px 12px hsl(215 76% 56% / 0.2)"
                          : state === "active"
                          ? "0 5px 0 0 hsl(152 58% 34%), 0 8px 24px hsl(152 58% 46% / 0.3)"
                          : "none",
                    }}
                    onClick={() => handleNodeClick(idx, state)}
                    whileTap={state === "active" ? { scale: 0.9 } : {}}
                    whileHover={state === "active" ? { scale: 1.12, y: -3 } : {}}
                    disabled={state === "locked"}
                  >
                    {state === "done" ? (
                      <Check className="w-6 h-6" strokeWidth={3} />
                    ) : state === "locked" ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </motion.button>
                  {state !== "locked" && (
                    <span className="text-[10px] font-extrabold text-muted-foreground mt-1.5 max-w-[90px] text-center truncate">
                      {levelLabel}
                    </span>
                  )}
                  {/* Active node pulse ring */}
                  {state === "active" && (
                    <motion.div
                      className="absolute inset-0 w-16 h-16 rounded-full border-2 border-primary/40"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              );
            })}

            {/* Complete (non-victory fallback) */}
            {isComplete && !showVictory && (
              <motion.div
                className="relative z-10 mt-4 flex flex-col items-center"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring" }}
              >
                <motion.div
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 border-4 border-accent flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Trophy className="w-8 h-8 text-accent" />
                </motion.div>
                <h3 className="font-black text-foreground mt-3 text-lg">{t("play.pathComplete")}</h3>
                <div className="flex gap-3 mt-5">
                  <motion.button
                    className="btn-playful bg-primary text-primary-foreground px-6 py-3 flex items-center gap-2 text-sm"
                    onClick={() => navigate("/calendar")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Calendar className="w-4 h-4" />
                    {lang === "th" ? "ไปปฏิทิน" : "Go to Calendar"}
                  </motion.button>
                  <motion.button
                    className="btn-playful bg-card border-2 border-border text-foreground px-6 py-3 flex items-center gap-2 text-sm"
                    onClick={() => { calculateSnapshot(); navigate("/snapshot"); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <BarChart2 className="w-4 h-4" />
                    {lang === "th" ? "ดูสรุป" : "View Summary"}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Mode Selection Dialog */}
        <Dialog open={showModeSelect} onOpenChange={setShowModeSelect}>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogTitle className="text-center">
              <motion.span
                className="text-5xl mb-3 block"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🗺️
              </motion.span>
              <span className="text-xl font-black text-foreground">
                {lang === "th" ? "วันนี้อยากวางแผนอะไร?" : "What do you want to plan today?"}
              </span>
            </DialogTitle>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {lang === "th" ? "เลือกหนึ่งอย่าง — สร้างแผนใหม่ได้เสมอ!" : "Pick one — you can always create more plans!"}
            </p>
            {plans.length > 0 && (
              <p className="text-xs text-center text-primary font-extrabold mb-3 bg-primary/5 rounded-2xl py-2.5 px-4">
                ℹ️ {lang === "th"
                  ? `คุณมี ${plans.length} แผนอยู่แล้ว — นี่จะสร้างแผนใหม่`
                  : `You have ${plans.length} plan(s) — this creates a brand new one`
                }
              </p>
            )}
            <div className="space-y-3">
              {planOptions.map((plan, i) => (
                <motion.button
                  key={plan.id}
                  className="w-full option-card flex items-center gap-4 text-left"
                  onClick={() => handleModeSelect(plan.id)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-3xl">{plan.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-extrabold text-foreground">{t(`plan.${plan.id}.title`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`plan.${plan.id}.desc`)}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Question Dialog */}
        {openQuestionIdx !== null && activeQuestions[openQuestionIdx] && (
          <QuestionDialog
            question={activeQuestions[openQuestionIdx]}
            questionIndex={openQuestionIdx}
            totalQuestions={activeQuestions.length}
            planAnswers={planAnswers}
            onSubmit={(answer) => {
              submitPlanAnswer(answer);
              setOpenQuestionIdx(null);
            }}
            onClose={() => setOpenQuestionIdx(null)}
          />
        )}
      </div>
    </>
  );
};

// ─── Question Dialog ───
interface QuestionDialogProps {
  question: FlowQuestion;
  questionIndex: number;
  totalQuestions: number;
  planAnswers: Array<{ questionId: string; value: string | number; label: string }>;
  onSubmit: (answer: { questionId: string; value: string | number; label: string }) => void;
  onClose: () => void;
}

const QuestionDialog = ({ question, questionIndex, totalQuestions, planAnswers, onSubmit, onClose }: QuestionDialogProps) => {
  const { t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);
  const [sliderValue, setSliderValue] = useState<number | null>(null);
  const [manualValue, setManualValue] = useState("");
  const [useManual, setUseManual] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const qText = t(`q.${question.id}`) !== `q.${question.id}` ? t(`q.${question.id}`) : question.id;
  const qHelp = t(`q.${question.id}.help`) !== `q.${question.id}.help` ? t(`q.${question.id}.help`) : undefined;
  const levelLabel = t(`level.${question.level}`) !== `level.${question.level}` ? t(`level.${question.level}`) : question.level;

  const getOptionLabel = (idx: number) => {
    const key = `q.${question.id}.o${idx + 1}`;
    const translated = t(key);
    return translated !== key ? translated : question.options?.[idx]?.label || "";
  };

  const getResolvedMax = (): number => {
    if (question.max === "dynamic" && question.maxRef) {
      const ref = planAnswers.find(a => a.questionId === question.maxRef);
      return ref ? Number(ref.value) : 100000;
    }
    return (question.max as number) ?? 100000000;
  };

  const resolvedMax = getResolvedMax();
  const effectiveSliderMax = question.sliderMax
    ? Math.min(question.sliderMax, resolvedMax)
    : resolvedMax;
  const currentSliderVal = sliderValue ?? question.defaultValue ?? question.min ?? 0;
  const effectiveValue = useManual
    ? parseInt(manualValue.replace(/,/g, ""), 10) || 0
    : currentSliderVal;

  const canSubmit =
    question.type === "choice" ? selectedOption !== null :
    question.type === "slider-input" ? true :
    question.type === "number-input" ? inputValue.replace(/,/g, "").length > 0 :
    false;

  const handleSubmit = () => {
    let value: string | number | null = null;
    let label = "";

    if (question.type === "choice") {
      value = selectedOption;
      label = question.options?.find(o => o.value === selectedOption)?.label || "";
    } else if (question.type === "slider-input") {
      value = effectiveValue;
      label = `${formatNum(value)}${question.suffix ? ` ${question.suffix}` : ""}`;
    } else if (question.type === "number-input") {
      const parsed = parseInt(inputValue.replace(/,/g, ""), 10);
      if (isNaN(parsed)) return;
      value = parsed;
      label = `${formatNum(parsed)}${question.suffix ? ` ${question.suffix}` : ""}`;
    }

    if (value === null || value === undefined) return;
    onSubmit({ questionId: question.id, value, label: String(label) });
  };

  // Progress dots
  const progressPct = ((questionIndex + 1) / totalQuestions) * 100;

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogTitle className="sr-only">{qText}</DialogTitle>

        <div className="mb-5">
          {/* Mini progress bar */}
          <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">{levelLabel}</span>
            <span className="text-xs font-extrabold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {questionIndex + 1}/{totalQuestions}
            </span>
          </div>
          <h2 className="text-xl font-black text-foreground leading-tight">{qText}</h2>
          {qHelp && (
            <p className="text-sm text-muted-foreground mt-2 bg-muted/50 rounded-xl px-3 py-2">
              💡 {qHelp}
            </p>
          )}
        </div>

        {/* Choice */}
        {question.type === "choice" && question.options && (
          <div className="space-y-2.5">
            {question.options.map((opt, i) => (
              <motion.div
                key={String(opt.value)}
                className={`option-card ${selectedOption === opt.value ? "option-card-selected" : ""}`}
                onClick={() => setSelectedOption(opt.value)}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    selectedOption === opt.value ? "border-primary bg-primary" : "border-border"
                  }`}>
                    {selectedOption === opt.value && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                  </div>
                  <span className="font-bold text-foreground">{getOptionLabel(i)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Slider + Input */}
        {question.type === "slider-input" && (
          <div className="card-game bg-gradient-to-br from-primary/3 to-transparent border-primary/10">
            <div className="text-center mb-5">
              <motion.span
                className="text-4xl font-black text-primary block"
                key={effectiveValue}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                {formatNum(effectiveValue)}{question.suffix ? ` ${question.suffix}` : ""}
              </motion.span>
            </div>
            {!useManual && (
              <>
                <input
                  type="range"
                  min={question.min}
                  max={effectiveSliderMax}
                  step={question.step}
                  value={Math.min(currentSliderVal, effectiveSliderMax)}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="slider-game w-full mb-3"
                />
                <div className="flex justify-between text-xs font-bold text-muted-foreground mb-3">
                  <span>{formatNum(question.min ?? 0)}</span>
                  <span>{formatNum(effectiveSliderMax)}</span>
                </div>
              </>
            )}
            {useManual && (
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={manualValue}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/,/g, "").replace(/\D/g, "");
                    if (raw === "") { setManualValue(""); return; }
                    const num = parseInt(raw, 10);
                    setManualValue(formatNum(Math.min(num, resolvedMax)));
                  }}
                  placeholder={t("plan.enterAmount")}
                  className="flex-1 text-center text-xl font-black text-foreground bg-muted rounded-2xl px-4 py-3 border-2 border-border focus:border-primary focus:outline-none transition-colors"
                  autoFocus
                />
                {question.suffix && <span className="text-lg font-bold text-muted-foreground">{question.suffix}</span>}
              </div>
            )}
            {question.sliderMax && (
              <button
                onClick={() => {
                  if (!useManual) setManualValue(formatNum(currentSliderVal));
                  else {
                    const parsed = parseInt(manualValue.replace(/,/g, ""), 10) || question.defaultValue || question.min || 0;
                    setSliderValue(Math.min(parsed, effectiveSliderMax));
                  }
                  setUseManual(!useManual);
                }}
                className="w-full text-center text-xs font-extrabold text-primary hover:underline mb-2"
              >
                {useManual ? t("plan.useSlider") : t("plan.enterManual")}
              </button>
            )}
          </div>
        )}

        {/* Number Input */}
        {question.type === "number-input" && (
          <div className="card-game bg-gradient-to-br from-primary/3 to-transparent border-primary/10">
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={inputValue}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, "").replace(/\D/g, "");
                  if (raw === "") { setInputValue(""); return; }
                  setInputValue(formatNum(parseInt(raw, 10)));
                }}
                placeholder={t("plan.enterAmount")}
                className="flex-1 text-center text-2xl font-black text-foreground bg-muted rounded-2xl px-4 py-4 border-2 border-border focus:border-primary focus:outline-none transition-colors"
                autoFocus
              />
              {question.suffix && (
                <span className="text-xl font-bold text-muted-foreground">{question.suffix}</span>
              )}
            </div>
          </div>
        )}

        <motion.button
          className={`w-full btn-playful mt-5 px-8 py-3.5 font-extrabold text-base ${
            canSubmit
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
          onClick={handleSubmit}
          disabled={!canSubmit}
          whileHover={canSubmit ? { scale: 1.02 } : {}}
          whileTap={canSubmit ? { scale: 0.98 } : {}}
          style={{ boxShadow: canSubmit ? "var(--shadow-playful)" : "none" }}
        >
          {t("level.continue")}
        </motion.button>
      </DialogContent>
    </Dialog>
  );
};

export default PlayPage;
