export type PlanType = "saving" | "goal" | "retirement";

export interface FlowQuestion {
  id: string;
  level: string; // level grouping key for visual pacing
  type: "choice" | "slider-input" | "number-input";
  conditionalOn?: { questionId: string; values: (string | number)[] };
  options?: { label: string; value: string | number }[];
  min?: number;
  max?: number | "dynamic";
  maxRef?: string;
  step?: number;
  defaultValue?: number;
  suffix?: string;
  sliderMax?: number; // cap slider at this value, allow manual input above
}

export interface Flow {
  id: PlanType;
  questions: FlowQuestion[];
}

export const planOptions: { id: PlanType; emoji: string }[] = [
  { id: "saving", emoji: "💰" },
  { id: "goal", emoji: "🎯" },
  { id: "retirement", emoji: "🏖️" },
];

// Shared questions used across saving & goal flows
const sharedQuestions: FlowQuestion[] = [
  {
    id: "monthly_income",
    level: "income",
    type: "slider-input",
    min: 1000,
    max: 100000000,
    sliderMax: 100000,
    step: 1000,
    defaultValue: 30000,
    suffix: "฿",
  },
  {
    id: "income_stability",
    level: "income",
    type: "choice",
    options: [
      { label: "Very stable", value: "stable" },
      { label: "Varies sometimes", value: "mixed" },
      { label: "Very unstable", value: "variable" },
    ],
  },
  {
    id: "avg_income",
    level: "income",
    type: "slider-input",
    conditionalOn: { questionId: "income_stability", values: ["mixed", "variable"] },
    min: 1000,
    max: 100000000,
    sliderMax: 100000,
    step: 1000,
    defaultValue: 25000,
    suffix: "฿",
  },
  {
    id: "monthly_expenses",
    level: "expenses",
    type: "slider-input",
    min: 0,
    max: "dynamic",
    maxRef: "monthly_income",
    sliderMax: 100000,
    step: 500,
    defaultValue: 20000,
    suffix: "฿",
  },
  {
    id: "min_expenses",
    level: "expenses",
    type: "slider-input",
    min: 0,
    max: "dynamic",
    maxRef: "monthly_expenses",
    sliderMax: 100000,
    step: 500,
    defaultValue: 10000,
    suffix: "฿",
  },
  {
    id: "monthly_obligations",
    level: "expenses",
    type: "choice",
    options: [
      { label: "None", value: "none" },
      { label: "A little", value: "some" },
      { label: "Quite a lot", value: "heavy" },
    ],
  },
  {
    id: "current_savings",
    level: "savings",
    type: "choice",
    options: [
      { label: "Under 10,000", value: 5000 },
      { label: "50,000+", value: 50000 },
      { label: "100,000+", value: 100000 },
      { label: "1,000,000+", value: 1000000 },
      { label: "Enter manually", value: "manual" },
    ],
  },
  {
    id: "current_savings_manual",
    level: "savings",
    type: "number-input",
    conditionalOn: { questionId: "current_savings", values: ["manual"] },
    min: 0,
    max: 999999999,
    suffix: "฿",
  },
  {
    id: "saving_goal",
    level: "savings",
    type: "number-input",
    min: 1,
    max: 999999999,
    suffix: "฿",
  },
  {
    id: "big_purchase",
    level: "goals",
    type: "choice",
    options: [
      { label: "Home", value: "home" },
      { label: "Car", value: "car" },
      { label: "Travel", value: "travel" },
      { label: "No, just saving", value: "none" },
    ],
  },
  {
    id: "big_purchase_timeline",
    level: "goals",
    type: "choice",
    conditionalOn: { questionId: "big_purchase", values: ["home", "car", "travel"] },
    options: [
      { label: "This year", value: "1" },
      { label: "2–3 years", value: "2" },
      { label: "5+ years", value: "5" },
      { label: "Not sure yet", value: "unsure" },
    ],
  },
  {
    id: "emergency_readiness",
    level: "behavior",
    type: "choice",
    options: [
      { label: "Less than 1 month", value: "less_1" },
      { label: "1–3 months", value: "1_3" },
      { label: "More than 3 months", value: "more_3" },
    ],
  },
  {
    id: "financial_discipline",
    level: "behavior",
    type: "choice",
    options: [
      { label: "I follow my plan", value: "disciplined" },
      { label: "I try but slip sometimes", value: "trying" },
      { label: "I'm working on it", value: "learning" },
    ],
  },
];

export const flows: Flow[] = [
  {
    id: "saving",
    questions: [...sharedQuestions],
  },
  {
    id: "goal",
    questions: [...sharedQuestions],
  },
  {
    id: "retirement",
    questions: [
      // Income
      sharedQuestions[0], // monthly_income
      sharedQuestions[1], // income_stability
      sharedQuestions[2], // avg_income
      // Expenses
      sharedQuestions[3], // monthly_expenses
      sharedQuestions[4], // min_expenses
      sharedQuestions[5], // monthly_obligations
      // Retirement-specific
      {
        id: "current_age",
        level: "retirement",
        type: "slider-input",
        min: 18,
        max: 70,
        step: 1,
        defaultValue: 30,
        suffix: "",
      },
      {
        id: "retirement_age",
        level: "retirement",
        type: "slider-input",
        min: 40,
        max: 80,
        step: 1,
        defaultValue: 60,
        suffix: "",
      },
      {
        id: "expected_lifespan",
        level: "retirement",
        type: "slider-input",
        min: 60,
        max: 100,
        step: 1,
        defaultValue: 80,
        suffix: "",
      },
      {
        id: "retirement_monthly_expense",
        level: "retirement",
        type: "slider-input",
        min: 5000,
        max: 500000,
        sliderMax: 100000,
        step: 1000,
        defaultValue: 30000,
        suffix: "฿",
      },
      {
        id: "retirement_savings",
        level: "retirement",
        type: "choice",
        options: [
          { label: "Under 100,000", value: 50000 },
          { label: "100,000+", value: 100000 },
          { label: "500,000+", value: 500000 },
          { label: "1,000,000+", value: 1000000 },
          { label: "Enter manually", value: "manual" },
        ],
      },
      {
        id: "retirement_savings_manual",
        level: "retirement",
        type: "number-input",
        conditionalOn: { questionId: "retirement_savings", values: ["manual"] },
        min: 0,
        max: 999999999,
        suffix: "฿",
      },
      // Behavior
      sharedQuestions[sharedQuestions.length - 2], // emergency_readiness
      sharedQuestions[sharedQuestions.length - 1], // financial_discipline
    ],
  },
];
