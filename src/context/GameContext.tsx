import React, { createContext, useContext, useState, ReactNode } from "react";
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
}

interface GameState {
  xp: number;
  streak: number;
  levels: LevelProgress[];
  currentLevel: number | null;
  currentQuestion: number;
  financialSnapshot: FinancialSnapshot | null;
  // Plan flow state
  selectedPlan: PlanType | null;
  planAnswers: Answer[];
  planQuestionIndex: number;
  selectPlan: (plan: PlanType) => void;
  submitPlanAnswer: (answer: Answer) => void;
  advancePlanQuestion: () => void;
  resetPlan: () => void;
  // Legacy
  completeQuestion: (answer: Answer) => void;
  completeLevel: (levelId: number) => void;
  startLevel: (levelId: number) => void;
  calculateSnapshot: () => void;
}

const defaultLevels: LevelProgress[] = [
  { levelId: 1, status: "active", answers: [], xpEarned: 0 },
  { levelId: 2, status: "locked", answers: [], xpEarned: 0 },
  { levelId: 3, status: "locked", answers: [], xpEarned: 0 },
  { levelId: 4, status: "locked", answers: [], xpEarned: 0 },
  { levelId: 5, status: "locked", answers: [], xpEarned: 0 },
];

const GameContext = createContext<GameState | undefined>(undefined);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [xp, setXp] = useState(0);
  const [streak] = useState(1);
  const [levels, setLevels] = useState<LevelProgress[]>(defaultLevels);
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [financialSnapshot, setFinancialSnapshot] = useState<FinancialSnapshot | null>(null);

  // Plan flow state
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [planAnswers, setPlanAnswers] = useState<Answer[]>([]);
  const [planQuestionIndex, setPlanQuestionIndex] = useState(0);

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
    // Use plan answers if available, otherwise fall back to level answers
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

    const monthlyIncome = getVal("monthly_income") || 5000;
    const monthlyExpenses = getVal("monthly_expenses") || 3000;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const annualSavings = monthlySavings * 12;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    const currentAge = getVal("current_age") || 30;
    const retirementAge = getVal("retirement_age") || 65;
    const yearsToRetire = retirementAge - currentAge;
    const inflationRate = 0.03;
    const returnRate = 0.07;
    const realReturn = returnRate - inflationRate;
    const retirementFund = annualSavings * ((Math.pow(1 + realReturn, yearsToRetire) - 1) / realReturn);
    const inflationAdjusted = retirementFund / Math.pow(1 + inflationRate, yearsToRetire);
    const riskTolerance = getStr("risk_tolerance") || "moderate";
    const safeWithdrawal = inflationAdjusted * 0.04;
    const safeSpendingRange: [number, number] = [safeWithdrawal * 0.8 / 12, safeWithdrawal * 1.2 / 12];

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
      safeSpendingRange: [Math.round(safeSpendingRange[0]), Math.round(safeSpendingRange[1])],
    });
  };

  return (
    <GameContext.Provider
      value={{
        xp, streak, levels, currentLevel, currentQuestion,
        financialSnapshot, completeQuestion, completeLevel,
        startLevel, calculateSnapshot,
        selectedPlan, planAnswers, planQuestionIndex,
        selectPlan, submitPlanAnswer, advancePlanQuestion, resetPlan,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
