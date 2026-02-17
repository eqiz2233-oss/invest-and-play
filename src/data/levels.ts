export interface Question {
  id: string;
  text: string;
  helpText?: string;
  type: "choice" | "number";
  options?: { label: string; value: string | number }[];
  placeholder?: string;
  suffix?: string;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  emoji: string;
  questions: Question[];
}

export const levels: Level[] = [
  {
    id: 1,
    title: "Financial Basics",
    description: "Let's understand your money mindset",
    emoji: "🌱",
    questions: [
      {
        id: "money_feeling",
        text: "How do you feel about money right now?",
        helpText: "No wrong answers — just be honest!",
        type: "choice",
        options: [
          { label: "😰 Stressed", value: "stressed" },
          { label: "😐 Neutral", value: "neutral" },
          { label: "😊 Pretty good", value: "good" },
          { label: "🚀 Confident", value: "confident" },
        ],
      },
      {
        id: "financial_goal",
        text: "What's your #1 money goal?",
        type: "choice",
        options: [
          { label: "🏠 Buy a home", value: "home" },
          { label: "🏖️ Retire early", value: "retire" },
          { label: "💰 Build savings", value: "savings" },
          { label: "📊 Invest more", value: "invest" },
        ],
      },
      {
        id: "saving_habit",
        text: "Do you save money regularly?",
        type: "choice",
        options: [
          { label: "Every month 💪", value: "monthly" },
          { label: "Sometimes 🤷", value: "sometimes" },
          { label: "Rarely 😅", value: "rarely" },
          { label: "Never yet 🙈", value: "never" },
        ],
      },
      {
        id: "biggest_expense",
        text: "What eats most of your money?",
        type: "choice",
        options: [
          { label: "🏠 Rent/Housing", value: "housing" },
          { label: "🍔 Food & Fun", value: "food" },
          { label: "🚗 Transport", value: "transport" },
          { label: "🛍️ Shopping", value: "shopping" },
        ],
      },
      {
        id: "emergency_fund",
        text: "Could you cover 3 months of expenses if you lost income?",
        helpText: "This is called an 'emergency fund'",
        type: "choice",
        options: [
          { label: "Yes, easily ✅", value: "yes" },
          { label: "Maybe, barely 😬", value: "maybe" },
          { label: "Not yet ❌", value: "no" },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Income & Expenses",
    description: "Let's map your money flow",
    emoji: "💸",
    questions: [
      {
        id: "monthly_income",
        text: "What's your monthly take-home pay?",
        helpText: "After taxes — what hits your bank account",
        type: "number",
        placeholder: "e.g. 5000",
        suffix: "$/month",
      },
      {
        id: "monthly_expenses",
        text: "How much do you spend each month?",
        helpText: "Rent, food, subscriptions, everything",
        type: "number",
        placeholder: "e.g. 3500",
        suffix: "$/month",
      },
      {
        id: "debt_payments",
        text: "Any monthly debt payments?",
        helpText: "Student loans, credit cards, car payments",
        type: "number",
        placeholder: "e.g. 500",
        suffix: "$/month",
      },
      {
        id: "current_savings",
        text: "How much do you have saved right now?",
        type: "number",
        placeholder: "e.g. 10000",
        suffix: "$",
      },
    ],
  },
  {
    id: 3,
    title: "Savings Goals",
    description: "Dream big, plan smart",
    emoji: "🎯",
    questions: [
      {
        id: "savings_target",
        text: "How much would you like to save this year?",
        type: "number",
        placeholder: "e.g. 12000",
        suffix: "$",
      },
      {
        id: "big_purchase",
        text: "Planning any big purchases?",
        type: "choice",
        options: [
          { label: "🏠 Home/Apartment", value: "home" },
          { label: "🚗 Car", value: "car" },
          { label: "✈️ Big trip", value: "travel" },
          { label: "Nope, just saving 😌", value: "none" },
        ],
      },
      {
        id: "big_purchase_timeline",
        text: "When do you want to make that purchase?",
        type: "choice",
        options: [
          { label: "This year ⚡", value: "1" },
          { label: "2-3 years 📅", value: "2" },
          { label: "5+ years 🔮", value: "5" },
          { label: "No rush 🐢", value: "10" },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Retirement Planning",
    description: "Future you will thank present you",
    emoji: "🏖️",
    questions: [
      {
        id: "current_age",
        text: "How old are you?",
        type: "number",
        placeholder: "e.g. 28",
        suffix: "years",
      },
      {
        id: "retirement_age",
        text: "When do you want to retire?",
        helpText: "There's no wrong answer!",
        type: "number",
        placeholder: "e.g. 60",
        suffix: "years old",
      },
      {
        id: "retirement_lifestyle",
        text: "What retirement lifestyle do you imagine?",
        type: "choice",
        options: [
          { label: "🏡 Simple & peaceful", value: "simple" },
          { label: "🌍 Travel the world", value: "travel" },
          { label: "🏢 Start a business", value: "business" },
          { label: "🎨 Pursue passions", value: "passion" },
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Risk & Investment",
    description: "Grow your money wisely",
    emoji: "📈",
    questions: [
      {
        id: "risk_tolerance",
        text: "If your investment dropped 20%, what would you do?",
        helpText: "This helps us understand your risk comfort",
        type: "choice",
        options: [
          { label: "😱 Sell everything!", value: "conservative" },
          { label: "😟 Worry but hold", value: "moderate" },
          { label: "😎 Buy more!", value: "aggressive" },
        ],
      },
      {
        id: "investment_experience",
        text: "Have you invested before?",
        type: "choice",
        options: [
          { label: "Never 🌱", value: "never" },
          { label: "A little bit 🌿", value: "some" },
          { label: "Regularly 🌳", value: "regular" },
          { label: "I'm a pro 🏔️", value: "expert" },
        ],
      },
      {
        id: "investment_interest",
        text: "What interests you most?",
        type: "choice",
        options: [
          { label: "📊 Stocks & ETFs", value: "stocks" },
          { label: "🏠 Real estate", value: "real_estate" },
          { label: "₿ Crypto", value: "crypto" },
          { label: "🏦 Safe savings", value: "savings" },
        ],
      },
    ],
  },
];
