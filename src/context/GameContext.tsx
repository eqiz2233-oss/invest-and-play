import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PlanType } from "@/data/planFlows";

export interface Answer {
  questionId: string;
  value: string | number;
  label: string;
}

export interface LevelProgress {
  levelId: number;
  status: "locked" | "active" | "complete";
  answers: Answer[];
  xpEarned: number;
}

export interface FinancialSnapshot {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  annualSavings: number;
  savingsRate: number;
  retirementAge: number;
  currentAge: number;
  retirementFund: number;
  inflationAdjusted: number;
  riskTolerance: string;
  safeSpendingRange: [number, number];
  retirementNeeded: number;
  retirementMonthlyExpense: number;
  yearsInRetirement: number;
  existingSavings: number;
}

interface GameState {
  xp: number;
  streak: number;
  levels: LevelProgress[];
  currentLevel: number | null;
  currentQuestion: number;
  financialSnapshot: FinancialSnapshot | null;
  selectedPlan: PlanType | null;
  planAnswers: Answer[];
  planQuestionIndex: number;
  selectPlan: (plan: PlanType) => void;
  submitPlanAnswer: (answer: Answer) => void;
  advancePlanQuestion: () => void;
  resetPlan: () => void;
  resetAll: () => void;
  completeQuestion: (answer: Answer) => void;
  completeLevel: (levelId: number) => void;
  startLevel: (levelId: number) => void;
  calculateSnapshot: () => void;
}

const STORAGE_KEY = "fingame-state";

const defaultLevels: LevelProgress[] = [
  { levelId: 1, status: "active", answers: [], xpEarned: 0 },
  { levelId: 2, status: "locked", answers: [], xpEarned: 0 },
  { levelId: 3, status: "locked", answers: [], xpEarned: 0 },
  { levelId: 4, status: "locked", answers: [], xpEarned: 0 },
  { levelId: 5, status: "locked", answers: [], xpEarned: 0 },
];

const getSaved = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
};

const calculateStreak = (): number => {
  try {
    const state = getSaved();
    if (!state?.lastActiveDate) return 1;
    const last = new Date(state.lastActiveDate);
    const today = new Date();
    last.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return state.streak ?? 1;
    if (diffDays === 1) return (state.streak ?? 1) + 1;
    return 1;
  } catch { return 1; }
};

const GameContext = createContext<GameState | undefined>(undefined);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const saved = getSaved();

  const [xp, setXp] = useState(() => saved?.xp ?? 0);
  const [streak, setStreak] = useState(() => calculateStreak());
  const [levels, setLevels] = useState<LevelProgress[]>(() => saved?.levels ?? defaultLevels);
  const [currentLevel, setCurrentLevel] = useState<number | null>(() => saved?.currentLevel ?? null);
  const [currentQuestion, setCurrentQuestion] = useState(() => saved?.currentQuestion ?? 0);
  const [financialSnapshot, setFinancialSnapshot] = useState<FinancialSnapshot | null>(() => saved?.financialSnapshot ?? null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(() => saved?.selectedPlan ?? null);
  const [planAnswers, setPlanAnswers] = useState<Answer[]>(() => saved?.planAnswers ?? []);
  const [planQuestionIndex, setPlanQuestionIndex] = useState(() => saved?.planQuestionIndex ?? 0);

  // Save to localStorage on every state change
  useEffect(() => {
    const state = {
      xp, streak, levels, currentLevel, currentQuestion,
      financialSnapshot, selectedPlan, planAnswers, planQuestionIndex,
      lastActiveDate: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [xp, streak, levels, currentLevel, currentQuestion, financialSnapshot, selectedPlan, planAnswers, planQuestionIndex]);

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setXp(0);
    setStreak(1);
    setLevels(defaultLevels);
    setCurrentLevel(null);
    setCurrentQuestion(0);
    setFinancialSnapshot(null);
    setSelectedPlan(null);
    setPlanAnswers([]);
    setPlanQuestionIndex(0);
  };

  const selectPlan = (plan: PlanType) => {
    setSelectedPlan(plan);
    setPlanAnswers([]);
    setPlanQuestionIndex(0);
  };

  const submitPlanAnswer = (answer: Answer) => {
    setPlanAnswers(prev => [...prev.filter(a => a.questionId !== answer.questionId), answer]);
    setXp(prev => prev + 10);
  };

  const advancePlanQuestion = () => {
    setPlanQuestionIndex(prev => prev + 1);
  };

  const resetPlan = () => {
    setSelectedPlan(null);
    setPlanAnswers([]);
    setPlanQuestionIndex(0);
  };

  const completeQuestion = (answer: Answer) => {
    setLevels((prev) =>
      prev.map((l) =>
        l.levelId === currentLevel
          ? { ...l, answers: [...l.answers.filter(a => a.questionId !== answer.questionId), answer] }
          : l
      )
    );
    setXp((prev) => prev + 10);
    setCurrentQuestion((prev) => prev + 1);
  };

  const completeLevel = (levelId: number) => {
    setLevels((prev) =>
      prev.map((l) => {
        if (l.levelId === levelId) return { ...l, status: "complete" as const, xpEarned: 50 };
        if (l.levelId === levelId + 1) return { ...l, status: "active" as const };
        return l;
      })
    );
    setXp((prev) => prev + 50);
    setCurrentLevel(null);
    setCurrentQuestion(0);
  };

  const startLevel = (levelId: number) => {
    setCurrentLevel(levelId);
    setCurrentQuestion(0);
  };

  const calculateSnapshot = () => {
    const allAnswers = planAnswers.length > 0
      ? planAnswers
      : levels.flatMap((l) => l.answers);

    const getVal = (id: string) => {
      const a = allAnswers.find((a) => a.questionId === id);
      return a ? Number(a.value) : 0;
    };
    const getStr = (id: string) => {
      const a = allAnswers.find((a) => a.questionId === id);
      return a ? String(a.value) : "";
    };

    const monthlyIncome = getVal("monthly_income") || 30000;
    const rawExpenses = getVal("monthly_expenses") || 20000;
    // Guard: expenses cannot exceed income
    const monthlyExpenses = Math.min(rawExpenses, monthlyIncome);
    const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);
    const annualSavings = monthlySavings * 12;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    const currentAge = getVal("current_age") || 30;
    const rawRetirementAge = getVal("retirement_age") || 60;
    // Guard: retirement age must exceed current age
    const retirementAge = Math.max(currentAge + 1, rawRetirementAge);
    const expectedLifespan = getVal("expected_lifespan") || 80;
    const yearsToRetire = retirementAge - currentAge;
    const yearsInRetirement = Math.max(1, expectedLifespan - retirementAge);

    const inflationRate = 0.03;
    const returnRate = 0.07;
    const realReturn = returnRate - inflationRate;

    const isRetirementPlan = selectedPlan === "retirement";

    const retirementMonthlyExpense = isRetirementPlan
      ? (getVal("retirement_monthly_expense") || monthlyExpenses)
      : monthlyExpenses;

    const existingSavings = isRetirementPlan
      ? (getVal("retirement_savings_manual") || getVal("retirement_savings") || 0)
      : (getVal("current_savings_manual") || getVal("current_savings") || 0);

    // Future value of existing savings
    const fvExisting = existingSavings * Math.pow(1 + returnRate, yearsToRetire);

    // Future value of annual contributions
    const fvContributions = yearsToRetire > 0 && realReturn !== 0
      ? annualSavings * ((Math.pow(1 + realReturn, yearsToRetire) - 1) / realReturn)
      : annualSavings * yearsToRetire;

    const retirementFund = fvExisting + fvContributions;
    const inflationAdjusted = retirementFund / Math.pow(1 + inflationRate, yearsToRetire);

    const retirementNeeded = retirementMonthlyExpense * 12 * yearsInRetirement;

    const riskTolerance = getStr("risk_tolerance") || getStr("investment_experience") || "moderate";
    const safeWithdrawal = inflationAdjusted * 0.04;
    const safeSpendingRange: [number, number] = [
      Math.round(safeWithdrawal * 0.8 / 12),
      Math.round(safeWithdrawal * 1.2 / 12),
    ];

    setFinancialSnapshot({
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      annualSavings,
      savingsRate,
      retirementAge,
      currentAge,
      retirementFund: Math.round(retirementFund),
      inflationAdjusted: Math.round(inflationAdjusted),
      riskTolerance,
      safeSpendingRange,
      retirementNeeded: Math.round(retirementNeeded),
      retirementMonthlyExpense,
      yearsInRetirement,
      existingSavings,
    });
  };

  return (
    <GameContext.Provider
      value={{
        xp, streak, levels, currentLevel, currentQuestion,
        financialSnapshot, completeQuestion, completeLevel,
        startLevel, calculateSnapshot, resetAll,
        selectedPlan, planAnswers, planQuestionIndex,
        selectPlan, submitPlanAnswer, advancePlanQuestion, resetPlan,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
