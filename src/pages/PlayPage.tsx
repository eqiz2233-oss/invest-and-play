import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";
import { flows, FlowQuestion, planOptions, PlanType } from "@/data/planFlows";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Check, Lock, Play, Sparkles, Trophy } from "lucide-react";

const formatNum = (n: number) => new Intl.NumberFormat("en-US").format(n);

type NodeState = "done" | "active" | "locked";

const PlayPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    selectedPlan, planAnswers, submitPlanAnswer, calculateSnapshot,
    plans, selectOrCreatePlan,
  } = useGame();

  const [showModeSelect, setShowModeSelect] = useState(false);
  const [openQuestionIdx, setOpenQuestionIdx] = useState<number | null>(null);

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
  const progress = activeQuestions.length > 0
    ? (activeQuestions.filter(q => answeredIds.has(q.id)).length / activeQuestions.length) * 100
    : 0;

  const handleModeSelect = (type: PlanType) => {
    selectOrCreatePlan(type);
    setShowModeSelect(false);
  };

  const handleNodeClick = (idx: number, state: NodeState) => {
    if (state === "active") setOpenQuestionIdx(idx);
  };

  // Zigzag node position
  const getNodeOffset = (idx: number) => {
    const positions = [0, -40, 0, 40];
    return positions[idx % 4];
  };

  const modeEmoji: Record<string, string> = { saving: "💰", goal: "🎯", retirement: "🏖️" };

  return (
    <div className="flex-1 flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-lg flex flex-col items-center">
        {/* Progress bar */}
        {selectedPlan && activeQuestions.length > 0 && (
          <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-muted-foreground">
                {modeEmoji[selectedPlan]} {t(`plan.${selectedPlan}.title`)}
              </span>
              <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="progress-track h-3">
              <motion.div
                className="progress-fill"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
        )}

        {/* Path */}
        <div className="relative w-full flex flex-col items-center py-4">
          {/* Vertical connector line */}
          {activeQuestions.length > 0 && (
            <div className="absolute top-16 bottom-8 left-1/2 w-0.5 bg-border -translate-x-1/2 z-0" />
          )}

          {/* START node */}
          <motion.button
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black shadow-lg mb-8 transition-all ${
              selectedPlan
                ? "bg-primary/10 border-2 border-primary text-primary"
                : "bg-primary text-primary-foreground hover:scale-105"
            }`}
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

          {!selectedPlan && (
            <motion.p
              className="text-sm font-bold text-muted-foreground mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {t("play.tapToStart")}
            </motion.p>
          )}

          {selectedPlan && (
            <button
              onClick={() => setShowModeSelect(true)}
              className="text-xs font-bold text-primary mb-6 hover:underline"
            >
              {t("play.changeMode")}
            </button>
          )}

          {/* Question nodes */}
          {activeQuestions.map((q, idx) => {
            const state = getNodeState(q, idx);
            const offset = getNodeOffset(idx);
            const levelLabel = t(`level.${q.level}`) !== `level.${q.level}` ? t(`level.${q.level}`) : q.level;

            return (
              <motion.div
                key={q.id}
                className="relative z-10 mb-6 flex flex-col items-center"
                style={{ marginLeft: offset }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: state === "locked" ? 0.5 : 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <motion.button
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-black border-4 shadow-md transition-all ${
                    state === "done"
                      ? "bg-primary/10 border-primary text-primary"
                      : state === "active"
                      ? "bg-primary border-primary text-primary-foreground animate-pulse"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                  onClick={() => handleNodeClick(idx, state)}
                  whileTap={state === "active" ? { scale: 0.9 } : {}}
                  whileHover={state === "active" ? { scale: 1.1 } : {}}
                  disabled={state === "locked"}
                >
                  {state === "done" ? (
                    <Check className="w-6 h-6" />
                  ) : state === "locked" ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </motion.button>
                {state !== "locked" && (
                  <span className="text-[10px] font-bold text-muted-foreground mt-1 max-w-[80px] text-center truncate">
                    {levelLabel}
                  </span>
                )}
              </motion.div>
            );
          })}

          {/* Complete node */}
          {isComplete && (
            <motion.div
              className="relative z-10 mt-2 flex flex-col items-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }}
            >
              <div className="w-20 h-20 rounded-full bg-accent/20 border-4 border-accent flex items-center justify-center">
                <Trophy className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-black text-foreground mt-3">{t("play.pathComplete")}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t("play.pathCompleteSub")}</p>
              <div className="xp-badge mb-4 justify-center">
                <Sparkles className="w-4 h-4" />
                +{activeQuestions.length * 10} XP
              </div>
              <motion.button
                className="btn-playful bg-primary text-primary-foreground px-8 py-3"
                onClick={() => {
                  calculateSnapshot();
                  navigate("/snapshot");
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t("plan.viewResults")}
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mode Selection Dialog */}
      <Dialog open={showModeSelect} onOpenChange={setShowModeSelect}>
        <DialogContent className="max-w-md">
          <DialogTitle className="text-center">
            <span className="text-4xl mb-2 block">🗺️</span>
            <span className="text-xl font-black text-foreground">{t("play.chooseMode")}</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center mb-4">{t("play.chooseSub")}</p>
          <div className="space-y-3">
            {planOptions.map((plan) => {
              const existingPlan = plans.find(p => p.type === plan.id);
              return (
                <motion.button
                  key={plan.id}
                  className={`w-full option-card flex items-center gap-4 text-left ${
                    selectedPlan === plan.id ? "option-card-selected" : ""
                  }`}
                  onClick={() => handleModeSelect(plan.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-3xl">{plan.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{t(`plan.${plan.id}.title`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`plan.${plan.id}.desc`)}</p>
                  </div>
                  {existingPlan && (
                    <span className="text-xs font-bold text-primary">
                      {existingPlan.answers.length > 0 ? "▶ Resume" : ""}
                    </span>
                  )}
                </motion.button>
              );
            })}
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

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">
          {qText}
        </DialogTitle>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-primary uppercase">{levelLabel}</span>
            <span className="text-xs font-bold text-muted-foreground">
              {questionIndex + 1}/{totalQuestions}
            </span>
          </div>
          <h2 className="text-xl font-black text-foreground leading-tight">{qText}</h2>
          {qHelp && <p className="text-sm text-muted-foreground mt-1">{qHelp}</p>}
        </div>

        {/* Choice */}
        {question.type === "choice" && question.options && (
          <div className="space-y-2">
            {question.options.map((opt, i) => (
              <motion.div
                key={String(opt.value)}
                className={`option-card ${selectedOption === opt.value ? "option-card-selected" : ""}`}
                onClick={() => setSelectedOption(opt.value)}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-bold text-foreground">{getOptionLabel(i)}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Slider + Input */}
        {question.type === "slider-input" && (
          <div className="card-game">
            <div className="text-center mb-4">
              <span className="text-3xl font-black text-primary">
                {formatNum(effectiveValue)}{question.suffix ? ` ${question.suffix}` : ""}
              </span>
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
                  className="flex-1 text-center text-xl font-black text-foreground bg-muted rounded-xl px-4 py-3 border-2 border-border focus:border-primary focus:outline-none"
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
                className="w-full text-center text-sm font-bold text-primary py-2 rounded-xl hover:bg-primary/5"
              >
                {useManual ? t("plan.useSlider") : t("plan.enterManual")}
              </button>
            )}
          </div>
        )}

        {/* Number Input */}
        {question.type === "number-input" && (
          <div className="card-game">
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
                className="flex-1 text-center text-xl font-black text-foreground bg-muted rounded-xl px-4 py-3 border-2 border-border focus:border-primary focus:outline-none"
                autoFocus
              />
              {question.suffix && <span className="text-lg font-bold text-muted-foreground">{question.suffix}</span>}
            </div>
          </div>
        )}

        <motion.button
          className={`w-full btn-playful py-3 text-base font-bold mt-4 ${
            canSubmit
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
          onClick={handleSubmit}
          disabled={!canSubmit}
          whileHover={canSubmit ? { scale: 1.02 } : {}}
          whileTap={canSubmit ? { scale: 0.98 } : {}}
        >
          {t("level.check")}
        </motion.button>
      </DialogContent>
    </Dialog>
  );
};

export default PlayPage;
