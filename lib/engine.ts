// Exit Readiness OS - Simulation Engine
// Monte Carlo simulation for financial planning

import type { 
  Profile, 
  SimulationResult, 
  AssetPoint, 
  SimulationPath,
  KeyMetrics,
  CashFlowBreakdown,
  ExitScoreDetail
} from './types';
import { getScoreLevel } from './types';

const SIMULATION_RUNS = 1000;
const MAX_AGE = 100;

// Generate random return using normal distribution (Box-Muller transform)
function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

// Calculate net income after tax
function calculateNetIncome(profile: Profile, age: number): number {
  const isRetired = age >= profile.targetRetireAge;
  
  if (isRetired) {
    // Post-retirement: pension + passive income
    const pensionAge = 65;
    const basePension = age >= pensionAge ? 200 : 0; // 基礎年金 approx
    return basePension + profile.retirePassiveIncome;
  }
  
  // Pre-retirement income
  let totalGross = profile.grossIncome + profile.rsuAnnual + profile.sideIncomeNet;
  
  if (profile.mode === 'couple') {
    totalGross += profile.partnerGrossIncome + profile.partnerRsuAnnual;
  }
  
  // Apply effective tax rate
  const netIncome = totalGross * (1 - profile.effectiveTaxRate / 100);
  return netIncome;
}

// Calculate annual expenses
function calculateExpenses(profile: Profile, age: number): number {
  const isRetired = age >= profile.targetRetireAge;
  
  let baseExpenses = profile.livingCostAnnual + profile.housingCostAnnual;
  
  // Apply life events
  for (const event of profile.lifeEvents) {
    if (age >= event.age) {
      const endAge = event.duration ? event.age + event.duration : MAX_AGE;
      if (age < endAge) {
        if (event.type === 'expense_increase') {
          baseExpenses += event.amount;
        } else if (event.type === 'expense_decrease') {
          baseExpenses -= event.amount;
        }
      }
    }
  }
  
  // Retired lifestyle adjustment
  if (isRetired) {
    baseExpenses *= profile.retireSpendingMultiplier;
  }
  
  return Math.max(0, baseExpenses);
}

// Run a single simulation path
function runSingleSimulation(profile: Profile): AssetPoint[] {
  const path: AssetPoint[] = [];
  
  // Initial assets
  let totalAssets = profile.assetCash + profile.assetInvest + profile.assetDefinedContributionJP;
  
  const realReturn = (profile.expectedReturn - profile.inflationRate) / 100;
  
  for (let age = profile.currentAge; age <= MAX_AGE; age++) {
    // Record current state
    path.push({ age, assets: Math.round(totalAssets) });
    
    // Calculate cash flow for this year
    const income = calculateNetIncome(profile, age);
    const expenses = calculateExpenses(profile, age);
    const netCashFlow = income - expenses;
    
    // Add DC contribution if working
    const dcContrib = age < profile.targetRetireAge ? profile.dcContributionAnnual : 0;
    
    // Apply investment return with volatility
    const yearReturn = randomNormal(realReturn, profile.volatility);
    const investmentGain = totalAssets * yearReturn;
    
    // Update total assets
    totalAssets = totalAssets + netCashFlow + dcContrib + investmentGain;
    
    // Assets can go negative (debt), but we track it
    if (totalAssets < -10000) {
      // Cap negative at -1億 for practical purposes
      totalAssets = -10000;
    }
  }
  
  return path;
}

// Calculate percentile from simulation results
function getPercentilePath(allPaths: AssetPoint[][], percentile: number): AssetPoint[] {
  const result: AssetPoint[] = [];
  const numAges = allPaths[0].length;
  
  for (let i = 0; i < numAges; i++) {
    const valuesAtAge = allPaths.map(path => path[i].assets).sort((a, b) => a - b);
    const index = Math.floor(valuesAtAge.length * percentile / 100);
    result.push({
      age: allPaths[0][i].age,
      assets: valuesAtAge[Math.min(index, valuesAtAge.length - 1)]
    });
  }
  
  return result;
}

// Calculate key metrics from simulation results
function calculateMetrics(allPaths: AssetPoint[][], profile: Profile): KeyMetrics {
  // Survival rate: % of paths that never go negative
  const survivingPaths = allPaths.filter(path => 
    path.every(point => point.assets >= 0)
  );
  const survivalRate = (survivingPaths.length / allPaths.length) * 100;
  
  // Asset at 100 (median)
  const medianPath = getPercentilePath(allPaths, 50);
  const assetAt100 = medianPath[medianPath.length - 1]?.assets ?? 0;
  
  // FIRE age calculation (when passive income can cover expenses)
  let fireAge: number | null = null;
  const targetExpenses = calculateExpenses(profile, profile.targetRetireAge);
  const safeWithdrawalRate = 0.04; // 4% rule
  
  for (const point of medianPath) {
    if (point.assets * safeWithdrawalRate >= targetExpenses) {
      fireAge = point.age;
      break;
    }
  }
  
  return {
    fireAge,
    assetAt100,
    survivalRate,
    yearsToFire: fireAge ? fireAge - profile.currentAge : null
  };
}

// Calculate post-retirement cash flow breakdown
function calculateCashFlow(profile: Profile): CashFlowBreakdown {
  const retireAge = profile.targetRetireAge;
  const pensionAge = 65;
  
  // Simplified cash flow at retirement
  const income = profile.retirePassiveIncome;
  const pension = retireAge >= pensionAge ? 200 : 0;
  const dividends = (profile.assetInvest * 0.03); // Assume 3% dividend yield
  const expenses = calculateExpenses(profile, retireAge);
  
  return {
    income,
    pension,
    dividends,
    expenses,
    netCashFlow: income + pension + dividends - expenses
  };
}

// Calculate Exit Readiness Score
export function computeExitScore(metrics: KeyMetrics, profile: Profile, paths: SimulationPath): ExitScoreDetail {
  // Survival score (0-100)
  const survival = Math.min(100, metrics.survivalRate);
  
  // Lifestyle score: based on asset cushion
  const targetExpenses = calculateExpenses(profile, profile.targetRetireAge);
  const yearsOfExpenses = paths.yearlyData[0]?.assets 
    ? paths.yearlyData[0].assets / targetExpenses 
    : 0;
  const lifestyle = Math.min(100, yearsOfExpenses * 5); // 20 years = 100%
  
  // Risk score: inverse of volatility exposure
  const riskExposure = profile.assetInvest / (profile.assetCash + profile.assetInvest + 1);
  const risk = Math.max(0, 100 - riskExposure * profile.volatility * 500);
  
  // Liquidity score: cash ratio
  const totalAssets = profile.assetCash + profile.assetInvest + profile.assetDefinedContributionJP;
  const liquidityRatio = totalAssets > 0 ? profile.assetCash / totalAssets : 0;
  const liquidity = Math.min(100, liquidityRatio * 200); // 50% cash = 100%
  
  // Overall score (weighted average)
  const overall = Math.round(
    survival * 0.4 + 
    lifestyle * 0.3 + 
    risk * 0.15 + 
    liquidity * 0.15
  );
  
  return {
    overall,
    level: getScoreLevel(overall),
    survival: Math.round(survival),
    lifestyle: Math.round(lifestyle),
    risk: Math.round(risk),
    liquidity: Math.round(liquidity)
  };
}

// Main simulation function
export async function runSimulation(profile: Profile): Promise<SimulationResult> {
  // Run Monte Carlo simulations
  const allPaths: AssetPoint[][] = [];
  
  for (let i = 0; i < SIMULATION_RUNS; i++) {
    allPaths.push(runSingleSimulation(profile));
  }
  
  // Calculate percentile paths
  const medianPath = getPercentilePath(allPaths, 50);
  const optimisticPath = getPercentilePath(allPaths, 90);
  const pessimisticPath = getPercentilePath(allPaths, 10);
  
  const paths: SimulationPath = {
    yearlyData: medianPath,
    upperPath: optimisticPath,
    lowerPath: pessimisticPath,
    // Number arrays for chart components
    median: medianPath.map(p => p.assets),
    optimistic: optimisticPath.map(p => p.assets),
    pessimistic: pessimisticPath.map(p => p.assets),
  };
  
  // Calculate metrics
  const metrics = calculateMetrics(allPaths, profile);
  
  // Calculate cash flow
  const cashFlow = calculateCashFlow(profile);
  
  // Calculate score
  const score = computeExitScore(metrics, profile, paths);
  
  return {
    paths,
    metrics,
    cashFlow,
    score
  };
}

// Create default profile
export function createDefaultProfile(): Profile {
  return {
    currentAge: 35,
    targetRetireAge: 55,
    mode: 'solo',
    
    grossIncome: 1200,
    rsuAnnual: 200,
    sideIncomeNet: 50,
    partnerGrossIncome: 0,
    partnerRsuAnnual: 0,
    
    livingCostAnnual: 360,
    housingCostAnnual: 180,
    
    homeStatus: 'renter',
    homeMarketValue: 0,
    mortgagePrincipal: 0,
    mortgageInterestRate: 1.0,
    mortgageYearsRemaining: 0,
    mortgageMonthlyPayment: 0,
    
    assetCash: 500,
    assetInvest: 2000,
    assetDefinedContributionJP: 300,
    dcContributionAnnual: 66,
    
    expectedReturn: 5,
    inflationRate: 2,
    volatility: 0.15,
    
    effectiveTaxRate: 25,
    retireSpendingMultiplier: 0.8,
    retirePassiveIncome: 0,
    
    lifeEvents: []
  };
}
