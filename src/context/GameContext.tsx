import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { PlanType } from "@/data/planFlows";
import { getRank } from "@/data/ranks";

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

export interface FinancialPlan {
  id: string;
  name: string;
  type: PlanType;
  emoji: string;
  answers: Answer[];
  snapshot: FinancialSnapshot | null;
  monthlyLogs: MonthlyLog[];
  createdAt: string;
  isActive: boolean;
}

export const XP_EVENTS = {
  open_app: 5,
  complete_quest: 20,
  monthly_success: 50,
  monthly_adjusted: 30,
  plan_adjusted: 5,
  view_snapshot: 5,
  complete_level: 50,
  complete_question: 10,
  comeback_bonus: 40,
} as const;

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
  plans: FinancialPlan[];
  activePlanId: string | null;
  activePlan: FinancialPlan | null;
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
  awardXP: (event: keyof typeof XP_EVENTS) => void;
  createPlan: (type: PlanType, name: string, emoji: string) => void;
  switchPlan: (planId: string) => void;
  deletePlan: (planId: string) => void;
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
  } catch {
    return null;
  }
};

const calculateStreakFromLogs = (logs: MonthlyLog[]): number => {
  if (logs.length === 0) return 1;
  const sorted = [...logs].sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  let count = 0;
  for (const log of sorted) {
    if (log.status === "success" || log.status === "adjusted") {
      count++;
    } else {
      break;
    }
  }
  return Math.max(count, 1);
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
  const [levels, setLevels] = useState<LevelProgress[]>(() => saved?.levels ?? defaultLevels);
  const [currentLevel, setCurrentLevel] = useState<number | null>(() => saved?.currentLevel ?? null);
  const [currentQuestion, setCurrentQuestion] = useState(() => saved?.currentQuestion ?? 0);
  const [financialSnapshot, setFinancialSnapshot] = useState<FinancialSnapshot | null>(() => saved?.financialSnapshot ?? null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(() => saved?.selectedPlan ?? null);
  const [planAnswers, setPlanAnswers] = useState<Answer[]>(() => saved?.planAnswers ?? []);
  const [planQuestionIndex, setPlanQuestionIndex] = useState(() => saved?.planQuestionIndex ?? 0);
  const [questStatuses, setQuestStatuses] = useState<QuestStatus[]>(() => saved?.questStatuses ?? []);
  const [monthlyLogs, setMonthlyLogs] = useState<MonthlyLog[]>(() => saved?.monthlyLogs ?? []);
  const [plans, setPlans] = useState<FinancialPlan[]>(() => saved?.plans ?? []);
  const [activePlanId, setActivePlanId] = useState<string | null>(() => saved?.activePlanId ?? null);

  const streak = calculateStreakFromLogs(monthlyLogs);
  const activePlan = plans.find((p) => p.id === activePlanId) || null;

  const prevRankRef = useRef(getRank(saved?.xp ?? 0).id);

  // Daily XP + comeback bonus
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastXpDate = localStorage.getItem("fingame-last-xp-date");
    if (lastXpDate !== today) {
      setXp((prev) => prev + XP_EVENTS.open_app);
      localStorage.setItem("fingame-last-xp-date", today);
    }

    const lastActive = localStorage.getItem("fingame-last-active");
    if (lastActive) {
      const diffDays = Math.floor((Date.now() - new Date(lastActive).getTime()) / 86400000);
      if (diffDays >= 14) {
        setXp((prev) => prev + XP_EVENTS.comeback_bonus);
      }
    }
    localStorage.setItem("fingame-last-active", new Date().toISOString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Migrate existing data into plans if none exist
  useEffect(() => {
    if (plans.length === 0 && selectedPlan && planAnswers.length > 0) {
      const plan: FinancialPlan = {
        id: crypto.randomUUID?.() || `plan-${Date.now()}`,
        name: selectedPlan === "retirement" ? "เกษียณ" : selectedPlan === "goal" ? "เป้าหมาย" : "ออมเงิน",
        type: selectedPlan,
        emoji: selectedPlan === "retirement" ? "🏖️" : selectedPlan === "goal" ? "🎯" : "💰",
        answers: planAnswers,
        snapshot: financialSnapshot,
        monthlyLogs: monthlyLogs,
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      setPlans([plan]);
      setActivePlanId(plan.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist state
  useEffect(() => {
    const state = {
      xp, levels, currentLevel, currentQuestion,
      financialSnapshot, selectedPlan, planAnswers, planQuestionIndex,
      questStatuses, monthlyLogs, plans, activePlanId,
      lastActiveDate: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [xp, levels, currentLevel, currentQuestion, financialSnapshot, selectedPlan, planAnswers, planQuestionIndex, questStatuses, monthlyLogs, plans, activePlanId]);

  const awardXP = (event: keyof typeof XP_EVENTS) => {
    setXp((prev) => prev + XP_EVENTS[event]);
  };

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    Object.keys(localStorage)
      .filter((k) => k.startsWith("fingame-"))
      .forEach((k) => localStorage.removeItem(k));
    setXp(0);
    setLevels(defaultLevels);
    setCurrentLevel(null);
    setCurrentQuestion(0);
    setFinancialSnapshot(null);
    setSelectedPlan(null);
    setPlanAnswers([]);
    setPlanQuestionIndex(0);
    setQuestStatuses([]);
    setMonthlyLogs([]);
    setPlans([]);
    setActivePlanId(null);
  };

  const selectPlan = (plan: PlanType) => {
    setSelectedPlan(plan);
    setPlanAnswers([]);
    setPlanQuestionIndex(0);
  };

  const submitPlanAnswer = (answer: Answer) => {
    setPlanAnswers((prev) => [...prev.filter((a) => a.questionId !== answer.questionId), answer]);
    awardXP("complete_question");
  };

  const advancePlanQuestion = () => setPlanQuestionIndex((prev) => prev + 1);

  const resetPlan = () => {
    setSelectedPlan(null);
    setPlanAnswers([]);
    setPlanQuestionIndex(0);
  };

  const completeQuestion = (answer: Answer) => {
    setLevels((prev) =>
      prev.map((l) =>
        l.levelId === currentLevel
          ? { ...l, answers: [...l.answers.filter((a) => a.questionId !== answer.questionId), answer] }
          : l
      )
    );
    awardXP("complete_question");
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
    awardXP("complete_level");
    setCurrentLevel(null);
    setCurrentQuestion(0);
  };

  const startLevel = (levelId: number) => {
    setCurrentLevel(levelId);
    setCurrentQuestion(0);
  };

  const completeQuest = (questId: string, weekKey: string) => {
    setQuestStatuses((prev) => {
      const filtered = prev.filter((q) => !(q.questId === questId && q.weekKey === weekKey));
      return [...filtered, { questId, weekKey, status: "done" as const, completedAt: new Date().toISOString() }];
    });
    awardXP("complete_quest");
  };

  const skipQuest = (questId: string, weekKey: string, rolloverAmount: number) => {
    setQuestStatuses((prev) => {
      const filtered = prev.filter((q) => !(q.questId === questId && q.weekKey === weekKey));
      return [...filtered, { questId, weekKey, status: "skipped" as const }];
    });
    if (rolloverAmount > 0) {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const key = `fingame-rollover-${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;
      const existing = Number(localStorage.getItem(key) || 0);
      localStorage.setItem(key, String(existing + rolloverAmount));
    }
  };

  const addMonthlyLog = (log: MonthlyLog) => {
    setMonthlyLogs((prev) => {
      const filtered = prev.filter((l) => l.monthKey !== log.monthKey);
      return [...filtered, log].sort((a, b) => b.monthKey.localeCompare(a.monthKey));
    });
  };

  const createPlan = (type: PlanType, name: string, emoji: string) => {
    const plan: FinancialPlan = {
      id: crypto.randomUUID?.() || `plan-${Date.now()}`,
      name, type, emoji,
      answers: [],
      snapshot: null,
      monthlyLogs: [],
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    setPlans((prev) => [...prev.map((p) => ({ ...p, isActive: false })), plan]);
    setActivePlanId(plan.id);
    setSelectedPlan(type);
    setPlanAnswers([]);
    setPlanQuestionIndex(0);
  };

  const switchPlan = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    setPlans((prev) => prev.map((p) => ({ ...p, isActive: p.id === planId })));
    setActivePlanId(planId);
    setSelectedPlan(plan.type);
    setPlanAnswers(plan.answers);
  };

  const deletePlan = (planId: string) => {
    setPlans((prev) => {
      const remaining = prev.filter((p) => p.id !== planId);
      if (activePlanId === planId && remaining.length > 0) {
        remaining[0].isActive = true;
        setActivePlanId(remaining[0].id);
        setSelectedPlan(remaining[0].type);
        setPlanAnswers(remaining[0].answers);
      }
      return remaining;
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
      Math.round((safeWithdrawal * 0.8) / 12),
      Math.round((safeWithdrawal * 1.2) / 12),
    ];

    setFinancialSnapshot({
      monthlyIncome, monthlyExpenses, monthlySavings, annualSavings, savingsRate,
      retirementAge, currentAge,
      retirementFund: Math.round(retirementFund),
      inflationAdjusted: Math.round(inflationAdjusted),
      riskTolerance, safeSpendingRange,
      retirementNeeded: Math.round(retirementNeeded),
      retirementMonthlyExpense, yearsInRetirement, existingSavings,
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
        awardXP,
        plans, activePlanId, activePlan, createPlan, switchPlan, deletePlan,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
