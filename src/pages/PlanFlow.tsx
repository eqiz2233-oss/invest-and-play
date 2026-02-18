import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { flows, FlowQuestion } from "@/data/planFlows";
import { ArrowLeft, Check, Sparkles } from "lucide-react";

const formatNum = (n: number) =>
  new Intl.NumberFormat("en-US").format(n);

const PlanFlow = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    selectedPlan, planAnswers, planQuestionIndex,
    submitPlanAnswer, advancePlanQuestion, calculateSnapshot,
    xp,
  } = useGame();

  const [selectedOption, setSelectedOption] = useState<string | number | null>(null);
  const [sliderValue, setSliderValue] = useState<number | null>(null);
  const [manualValue, setManualValue] = useState<string>("");
  const [useManual, setUseManual] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

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

  const question = activeQuestions[planQuestionIndex];
  const isComplete = planQuestionIndex >= activeQuestions.length;
  const progress = activeQuestions.length > 0 ? (planQuestionIndex / activeQuestions.length) * 100 : 0;

  // Detect level transitions for visual pacing
  const currentLevel = question?.level;
  const prevQuestion = planQuestionIndex > 0 ? activeQuestions[planQuestionIndex - 1] : null;
  const isNewLevel = prevQuestion ? prevQuestion.level !== currentLevel : true;

  useEffect(() => {
    setSelectedOption(null);
    setSliderValue(null);
    setManualValue("");
    setUseManual(false);
    setInputValue("");
    setSubmitted(false);
  }, [planQuestionIndex]);

  if (!flow || !selectedPlan) {
    navigate("/plan");
    return null;
  }

  const getResolvedMax = (q: FlowQuestion): number => {
    if (q.max === "dynamic" && q.maxRef) {
      const ref = planAnswers.find(a => a.questionId === q.maxRef);
      return ref ? Number(ref.value) : 100000;
    }
    return (q.max as number) ?? 100000000;
  };

  if (isComplete) {
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
            <span className="text-5xl">
              {selectedPlan === "saving" ? "💰" : selectedPlan === "goal" ? "🎯" : "🏖️"}
            </span>
          </motion.div>
          <h2 className="text-3xl font-black text-foreground mb-2">{t("plan.complete")}</h2>
          <p className="text-muted-foreground mb-2">{t("plan.completeSub")}</p>
          <div className="xp-badge text-base mb-8 justify-center">
            <Sparkles className="w-4 h-4" />
            +{activeQuestions.length * 10} XP
          </div>
          <div className="space-y-3">
            <motion.button
              className="btn-playful bg-primary text-primary-foreground px-8 py-4 w-full text-lg"
              onClick={() => {
                calculateSnapshot();
                navigate("/snapshot");
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t("plan.viewResults")}
            </motion.button>
            <motion.button
              className="btn-playful bg-secondary text-secondary-foreground px-8 py-3 w-full"
              onClick={() => navigate("/dashboard")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t("plan.backToDash")}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  const resolvedMax = getResolvedMax(question);
  const effectiveSliderMax = question.sliderMax
    ? Math.min(question.sliderMax, resolvedMax)
    : resolvedMax;
  const currentSliderVal = sliderValue ?? question.defaultValue ?? question.min ?? 0;
  // The actual value used: manual if toggled, otherwise slider
  const effectiveValue = useManual
    ? parseInt(manualValue.replace(/,/g, ""), 10) || 0
    : currentSliderVal;

  const qText = t(`q.${question.id}`) !== `q.${question.id}` ? t(`q.${question.id}`) : question.id;
  const qHelp = t(`q.${question.id}.help`) !== `q.${question.id}.help` ? t(`q.${question.id}.help`) : undefined;
  const levelLabel = t(`level.${currentLevel}`) !== `level.${currentLevel}` ? t(`level.${currentLevel}`) : currentLevel;

  const getOptionLabel = (idx: number) => {
    const key = `q.${question.id}.o${idx + 1}`;
    const translated = t(key);
    return translated !== key ? translated : question.options?.[idx]?.label || "";
  };

  const handleSubmit = () => {
    if (submitted) {
      advancePlanQuestion();
      return;
    }

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
      if (isNaN(parsed) || parsed < (question.min ?? 0)) return;
      value = parsed;
      label = `${formatNum(parsed)}${question.suffix ? ` ${question.suffix}` : ""}`;
    }

    if (value === null || value === undefined) return;

    submitPlanAnswer({ questionId: question.id, value, label });
    setSubmitted(true);
  };

  const canSubmit =
    question.type === "choice" ? selectedOption !== null :
    question.type === "slider-input" ? true :
    question.type === "number-input" ? inputValue.replace(/,/g, "").length > 0 :
    false;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => navigate("/plan")}
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
            {planQuestionIndex + 1}/{activeQuestions.length}
          </span>
          <LanguageToggle />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-lg flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id + planQuestionIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            {/* Level badge */}
            <div className="mb-8">
              <motion.span
                className="text-xs font-bold text-primary uppercase mb-2 block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {selectedPlan === "saving" ? "💰" : selectedPlan === "goal" ? "🎯" : "🏖️"}{" "}
                {levelLabel}
              </motion.span>
              <h2 className="text-2xl md:text-3xl font-black text-foreground mb-2 leading-tight">
                {qText}
              </h2>
              {qHelp && (
                <p className="text-sm text-muted-foreground">{qHelp}</p>
              )}
            </div>

            {/* Choice */}
            {question.type === "choice" && question.options && (
              <div className="space-y-3">
                {question.options.map((opt, i) => (
                  <motion.div
                    key={String(opt.value)}
                    className={`option-card ${
                      selectedOption === opt.value ? "option-card-selected" : ""
                    } ${submitted && selectedOption === opt.value ? "option-card-correct" : ""}`}
                    onClick={() => !submitted && setSelectedOption(opt.value)}
                    whileTap={!submitted ? { scale: 0.98 } : {}}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{getOptionLabel(i)}</span>
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

            {/* Slider + Input (capped at sliderMax, manual input for higher) */}
            {question.type === "slider-input" && (
              <motion.div
                className="card-game"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-center mb-4">
                  <motion.span
                    className="text-4xl md:text-5xl font-black text-primary inline-block"
                    key={effectiveValue}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {formatNum(effectiveValue)}{question.suffix ? ` ${question.suffix}` : ""}
                  </motion.span>
                </div>

                {/* Slider - always visible */}
                {!useManual && (
                  <>
                    <input
                      type="range"
                      min={question.min}
                      max={effectiveSliderMax}
                      step={question.step}
                      value={Math.min(currentSliderVal, effectiveSliderMax)}
                      onChange={(e) => setSliderValue(Number(e.target.value))}
                      disabled={submitted}
                      className="slider-game w-full mb-3"
                    />
                    <div className="flex justify-between text-xs font-bold text-muted-foreground mb-4">
                      <span>{formatNum(question.min ?? 0)}</span>
                      <span>{formatNum(effectiveSliderMax)}</span>
                    </div>
                  </>
                )}

                {/* Manual number input (inline below slider) */}
                {useManual && (
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={manualValue}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/,/g, "").replace(/\D/g, "");
                        if (raw === "") {
                          setManualValue("");
                          return;
                        }
                        const num = parseInt(raw, 10);
                        const clamped = Math.min(num, resolvedMax);
                        setManualValue(formatNum(clamped));
                      }}
                      placeholder={t("plan.enterAmount")}
                      disabled={submitted}
                      className="flex-1 text-center text-2xl font-black text-foreground bg-muted rounded-xl px-4 py-3 border-2 border-border focus:border-primary focus:outline-none transition-colors"
                      autoFocus
                    />
                    {question.suffix && (
                      <span className="text-lg font-bold text-muted-foreground">{question.suffix}</span>
                    )}
                  </div>
                )}

                {/* Toggle between slider and manual */}
                {question.sliderMax && !submitted && (
                  <button
                    onClick={() => {
                      if (!useManual) {
                        setManualValue(formatNum(currentSliderVal));
                      } else {
                        const parsed = parseInt(manualValue.replace(/,/g, ""), 10) || question.defaultValue || question.min || 0;
                        setSliderValue(Math.min(parsed, effectiveSliderMax));
                      }
                      setUseManual(!useManual);
                    }}
                    className="w-full text-center text-sm font-bold text-primary py-2 rounded-xl hover:bg-primary/5 transition-colors"
                  >
                    {useManual ? t("plan.useSlider") : t("plan.enterManual")}
                  </button>
                )}

                {/* Synced number input for non-capped sliders */}
                {!question.sliderMax && !useManual && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNum(currentSliderVal)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/,/g, "").replace(/\D/g, "");
                        const num = parseInt(raw, 10);
                        if (!isNaN(num)) {
                          const clamped = Math.min(Math.max(num, question.min ?? 0), resolvedMax);
                          setSliderValue(clamped);
                        } else if (raw === "") {
                          setSliderValue(question.min ?? 0);
                        }
                      }}
                      disabled={submitted}
                      className="flex-1 text-center font-bold text-foreground bg-muted rounded-xl px-4 py-2.5 border-2 border-border focus:border-primary focus:outline-none transition-colors"
                    />
                    {question.suffix && (
                      <span className="text-sm font-bold text-muted-foreground">{question.suffix}</span>
                    )}
                  </div>
                )}

                {submitted && (
                  <motion.p
                    className="mt-4 text-sm font-bold text-primary text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {t("level.gotIt")}
                  </motion.p>
                )}

                {question.max === "dynamic" && currentSliderVal >= resolvedMax * 0.95 && !submitted && !useManual && (
                  <motion.p
                    className="mt-3 text-xs text-muted-foreground text-center italic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {t("plan.nearMax")}
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Number Input only */}
            {question.type === "number-input" && (
              <motion.div
                className="card-game"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={inputValue}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/,/g, "").replace(/\D/g, "");
                      if (raw === "") {
                        setInputValue("");
                        return;
                      }
                      const num = parseInt(raw, 10);
                      setInputValue(formatNum(num));
                    }}
                    placeholder={t("plan.enterAmount")}
                    disabled={submitted}
                    className="flex-1 text-center text-2xl font-black text-foreground bg-muted rounded-xl px-4 py-4 border-2 border-border focus:border-primary focus:outline-none transition-colors"
                    autoFocus
                  />
                  {question.suffix && (
                    <span className="text-lg font-bold text-muted-foreground">{question.suffix}</span>
                  )}
                </div>
                {submitted && (
                  <motion.p
                    className="mt-4 text-sm font-bold text-primary text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {t("level.gotIt")}
                  </motion.p>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

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
            {submitted ? t("level.continue") : t("level.check")}
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
};

export default PlanFlow;
