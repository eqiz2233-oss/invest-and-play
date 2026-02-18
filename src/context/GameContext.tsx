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

export interface QuestStatus {
  questId: string;
  weekKey: string;
  status: "todo" | "done" | "skipped";
  completedAt?: string;
}

export interface MonthlyLog {
  monthKey: string;
  actualSavings: number;
  actualInvestment: number;
  actualExpenses: number;
  targetSavings: number;
  targetInvestment: number;
  spendingLimit: number;
  rolloverAmount: number;
  status: "success" | "adjusted" | "trying" | "rollover";
  xpEarned: number;
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
  questStatuses: QuestStatus[];
  monthlyLogs: MonthlyLog[];
  selectPlan: (plan: PlanType) => void;
  submitPlanAnswer: (answer: Answer) => void;
  advancePlanQuestion: () => void;
  resetPlan: () => void;
  resetAll: () => void;
  completeQuestion: (answer: Answer) => void;
  completeLevel: (levelId: number) => void;
  startLevel: (levelId: number) => void;
  calculateSnapshot: () => void;
  completeQuest: (questId: string, weekKey: string) => void;
  skipQuest: (questId: string, weekKey: string, rolloverAmount: number) => void;
  addMonthlyLog: (log: MonthlyLog) => void;
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
  const [questStatuses, setQuestStatuses] = useState<QuestStatus[]>(() => saved?.questStatuses ?? []);
  const [monthlyLogs, setMonthlyLogs] = useState<MonthlyLog[]>(() => saved?.monthlyLogs ?? []);

  useEffect(() => {
    const state = {
      xp, streak, levels, currentLevel, currentQuestion,
      financialSnapshot, selectedPlan, planAnswers, planQuestionIndex,
      questStatuses, monthlyLogs,
      lastActiveDate: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [xp, streak, levels, currentLevel, currentQuestion, financialSnapshot, selectedPlan, planAnswers, planQuestionIndex, questStatuses, monthlyLogs]);

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    // Also clear quest data
    const keys = Object.keys(localStorage).filter(k => k.startsWith("fingame-quests-"));
    keys.forEach(k => localStorage.removeItem(k));
    setXp(0);
    setStreak(1);
    setLevels(defaultLevels);
    setCurrentLevel(null);
    setCurrentQuestion(0);
    setFinancialSnapshot(null);
    setSelectedPlan(null);
    setPlanAnswers([]);
    setPlanQuestionIndex(0);
    setQuestStatuses([]);
    setMonthlyLogs([]);
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

  const completeQuest = (questId: string, weekKey: string) => {
    setQuestStatuses(prev => {
      const filtered = prev.filter(q => !(q.questId === questId && q.weekKey === weekKey));
      return [...filtered, { questId, weekKey, status: "done" as const, completedAt: new Date().toISOString() }];
    });
    setXp(prev => prev + 10);
  };

  const skipQuest = (questId: string, weekKey: string, rolloverAmount: number) => {
    setQuestStatuses(prev => {
      const filtered = prev.filter(q => !(q.questId === questId && q.weekKey === weekKey));
      return [...filtered, { questId, weekKey, status: "skipped" as const }];
    });
    // Store rollover in localStorage for next month
    if (rolloverAmount > 0) {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const key = `fingame-rollover-${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;
      const existing = Number(localStorage.getItem(key) || 0);
      localStorage.setItem(key, String(existing + rolloverAmount));
    }
  };

  const addMonthlyLog = (log: MonthlyLog) => {
    setMonthlyLogs(prev => {
      const filtered = prev.filter(l => l.monthKey !== log.monthKey);
      return [...filtered, log].sort((a, b) => b.monthKey.localeCompare(a.monthKey));
    });
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
    const monthlyExpenses = Math.min(rawExpenses, monthlyIncome);
    const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);
    const annualSavings = monthlySavings * 12;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
    const currentAge = getVal("current_age") || 30;
    const rawRetirementAge = getVal("retirement_age") || 60;
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

    const fvExisting = existingSavings * Math.pow(1 + returnRate, yearsToRetire);
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
        questStatuses, monthlyLogs, completeQuest, skipQuest, addMonthlyLog,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
