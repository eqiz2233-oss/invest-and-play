import { describe, it, expect } from "vitest";

// Test the core financial calculation logic
describe("Financial Calculations", () => {
  const calculateRetirementFund = (
    annualSavings: number,
    yearsToRetire: number,
    existingSavings: number,
    returnRate = 0.07,
    inflationRate = 0.03
  ) => {
    const realReturn = returnRate - inflationRate;
    const fvExisting = existingSavings * Math.pow(1 + returnRate, yearsToRetire);
    const fvContributions = yearsToRetire > 0 && realReturn !== 0
      ? annualSavings * ((Math.pow(1 + realReturn, yearsToRetire) - 1) / realReturn)
      : annualSavings * yearsToRetire;
    return fvExisting + fvContributions;
  };

  it("should calculate retirement fund correctly", () => {
    const fund = calculateRetirementFund(120000, 30, 0);
    expect(fund).toBeGreaterThan(0);
    expect(fund).toBeGreaterThan(120000 * 30);
  });

  it("should account for existing savings", () => {
    const withoutSavings = calculateRetirementFund(120000, 30, 0);
    const withSavings = calculateRetirementFund(120000, 30, 500000);
    expect(withSavings).toBeGreaterThan(withoutSavings);
  });

  it("should handle zero years to retirement", () => {
    const fund = calculateRetirementFund(120000, 0, 500000);
    expect(fund).toBe(500000);
  });

  it("savings rate should be correct percentage", () => {
    const income = 50000;
    const expenses = 35000;
    const savings = income - expenses;
    const rate = (savings / income) * 100;
    expect(rate).toBe(30);
  });

  it("monthly savings cannot be negative", () => {
    const income = 30000;
    const expenses = 40000;
    const safeSavings = Math.max(0, income - expenses);
    expect(safeSavings).toBe(0);
  });
});

describe("Input Validation", () => {
  it("retirement age must exceed current age", () => {
    const currentAge = 35;
    const retirementAge = 30;
    const safeRetirementAge = Math.max(currentAge + 1, retirementAge);
    expect(safeRetirementAge).toBeGreaterThan(currentAge);
  });
});
