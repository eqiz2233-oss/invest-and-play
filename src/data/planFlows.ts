export type PlanType = "saving" | "goal" | "retirement";

export interface FlowQuestion {
  id: string;
  type: "choice" | "slider" | "slider-input" | "number-input";
  conditionalOn?: { questionId: string; values: (string | number)[] };
  options?: { label: string; value: string | number }[];
  min?: number;
  max?: number | "dynamic"; // "dynamic" = depends on another answer
  maxRef?: string; // questionId to reference for dynamic max
  step?: number;
  defaultValue?: number;
  suffix?: string;
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

export const flows: Flow[] = [
  {
    id: "saving",
    questions: [
      {
        id: "monthly_income",
        type: "slider-input",
        min: 1000,
        max: 100000000,
        step: 1000,
        defaultValue: 30000,
        suffix: "฿",
      },
      {
        id: "income_stability",
        type: "choice",
        options: [
          { label: "Very stable", value: "stable" },
          { label: "Varies sometimes", value: "mixed" },
          { label: "Very unstable", value: "variable" },
        ],
      },
      {
        id: "avg_income",
        type: "slider-input",
        conditionalOn: { questionId: "income_stability", values: ["mixed", "variable"] },
        min: 1000,
        max: 100000000,
        step: 1000,
        defaultValue: 25000,
        suffix: "฿",
      },
      {
        id: "monthly_expenses",
        type: "slider-input",
        min: 0,
        max: "dynamic",
        maxRef: "monthly_income",
        step: 500,
        defaultValue: 20000,
        suffix: "฿",
      },
      {
        id: "min_expenses",
        type: "slider-input",
        min: 0,
        max: "dynamic",
        maxRef: "monthly_expenses",
        step: 500,
        defaultValue: 10000,
        suffix: "฿",
      },
      {
        id: "current_savings",
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
        type: "number-input",
        conditionalOn: { questionId: "current_savings", values: ["manual"] },
        min: 0,
        max: 999999999,
        suffix: "฿",
      },
      {
        id: "saving_goal",
        type: "number-input",
        min: 1,
        max: 999999999,
        suffix: "฿",
      },
      {
        id: "big_purchase",
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
        type: "choice",
        conditionalOn: { questionId: "big_purchase", values: ["home", "car", "travel"] },
        options: [
          { label: "This year", value: "1" },
          { label: "2–3 years", value: "2" },
          { label: "5+ years", value: "5" },
          { label: "Not sure yet", value: "unsure" },
        ],
      },
    ],
  },
  {
    id: "goal",
    questions: [
      // Same as saving flow — goal-based is the same questions
      {
        id: "monthly_income",
        type: "slider-input",
        min: 1000,
        max: 100000000,
        step: 1000,
        defaultValue: 30000,
        suffix: "฿",
      },
      {
        id: "income_stability",
        type: "choice",
        options: [
          { label: "Very stable", value: "stable" },
          { label: "Varies sometimes", value: "mixed" },
          { label: "Very unstable", value: "variable" },
        ],
      },
      {
        id: "avg_income",
        type: "slider-input",
        conditionalOn: { questionId: "income_stability", values: ["mixed", "variable"] },
        min: 1000,
        max: 100000000,
        step: 1000,
        defaultValue: 25000,
        suffix: "฿",
      },
      {
        id: "monthly_expenses",
        type: "slider-input",
        min: 0,
        max: "dynamic",
        maxRef: "monthly_income",
        step: 500,
        defaultValue: 20000,
        suffix: "฿",
      },
      {
        id: "min_expenses",
        type: "slider-input",
        min: 0,
        max: "dynamic",
        maxRef: "monthly_expenses",
        step: 500,
        defaultValue: 10000,
        suffix: "฿",
      },
      {
        id: "current_savings",
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
        type: "number-input",
        conditionalOn: { questionId: "current_savings", values: ["manual"] },
        min: 0,
        max: 999999999,
        suffix: "฿",
      },
      {
        id: "saving_goal",
        type: "number-input",
        min: 1,
        max: 999999999,
        suffix: "฿",
      },
      {
        id: "big_purchase",
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
        type: "choice",
        conditionalOn: { questionId: "big_purchase", values: ["home", "car", "travel"] },
        options: [
          { label: "This year", value: "1" },
          { label: "2–3 years", value: "2" },
          { label: "5+ years", value: "5" },
          { label: "Not sure yet", value: "unsure" },
        ],
      },
    ],
  },
  {
    id: "retirement",
    questions: [
      {
        id: "monthly_income",
        type: "slider-input",
        min: 1000,
        max: 100000000,
        step: 1000,
        defaultValue: 30000,
        suffix: "฿",
      },
      {
        id: "income_stability",
        type: "choice",
        options: [
          { label: "Very stable", value: "stable" },
          { label: "Varies sometimes", value: "mixed" },
          { label: "Very unstable", value: "variable" },
        ],
      },
      {
        id: "avg_income",
        type: "slider-input",
        conditionalOn: { questionId: "income_stability", values: ["mixed", "variable"] },
        min: 1000,
        max: 100000000,
        step: 1000,
        defaultValue: 25000,
        suffix: "฿",
      },
      {
        id: "monthly_expenses",
        type: "slider-input",
        min: 0,
        max: "dynamic",
        maxRef: "monthly_income",
        step: 500,
        defaultValue: 20000,
        suffix: "฿",
      },
      {
        id: "min_expenses",
        type: "slider-input",
        min: 0,
        max: "dynamic",
        maxRef: "monthly_expenses",
        step: 500,
        defaultValue: 10000,
        suffix: "฿",
      },
      {
        id: "current_age",
        type: "slider-input",
        min: 18,
        max: 70,
        step: 1,
        defaultValue: 30,
        suffix: "",
      },
      {
        id: "retirement_age",
        type: "slider-input",
        min: 40,
        max: 80,
        step: 1,
        defaultValue: 60,
        suffix: "",
      },
      {
        id: "retirement_monthly_expense",
        type: "slider-input",
        min: 5000,
        max: 500000,
        step: 1000,
        defaultValue: 30000,
        suffix: "฿",
      },
      {
        id: "retirement_savings",
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
        type: "number-input",
        conditionalOn: { questionId: "retirement_savings", values: ["manual"] },
        min: 0,
        max: 999999999,
        suffix: "฿",
      },
    ],
  },
];
