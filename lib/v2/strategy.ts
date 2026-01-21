/**
 * Exit Readiness OS v2 - 戦略ナビ (Strategy Navigation)
 * 「次の一手」を提示するための戦略レバー計算
 */

import type { WorldLine, KeyPerformanceIndicators } from './worldline';

/**
 * 戦略レバーのタイプ
 */
export type StrategyLeverType = 'income' | 'cost' | 'timing';

/**
 * 戦略レバー：具体的なアクション提案
 */
export type StrategyLever = {
  id: string;
  type: StrategyLeverType;
  title: string;              // 短いタイトル
  description: string;        // 詳細説明
  actionRequired: string;     // 必要なアクション
  difficulty: 'easy' | 'medium' | 'hard';  // 実行難易度
  impact: StrategyImpact;
  priority: number;           // 優先度スコア（高いほど推奨）
};

/**
 * 戦略の影響
 */
export type StrategyImpact = {
  fireAgeChange: number;      // FIRE年齢の変化（負は早まる）
  survivalRateChange: number; // 生存率の変化
  assetsAt60Change: number;   // 60歳時資産の変化
  monthlyImpact: number;      // 月次への影響（万円）
};

/**
 * 戦略分析結果
 */
export type StrategyAnalysis = {
  worldLineId: string;
  currentKpis: KeyPerformanceIndicators;
  targetFireAge: number | null;
  gap: number | null;         // 目標との差（年）
  levers: StrategyLever[];
  topRecommendation: StrategyLever | null;
  analysisTimestamp: Date;
};

/**
 * 収入系の戦略テンプレート
 */
export const INCOME_STRATEGIES: Omit<StrategyLever, 'id' | 'impact' | 'priority'>[] = [
  {
    type: 'income',
    title: '年収100万円アップ',
    description: '昇進、昇給交渉、またはスキルアップによる年収増加',
    actionRequired: 'キャリアアップの計画を立て、実行する',
    difficulty: 'medium',
  },
  {
    type: 'income',
    title: '副業で月5万円',
    description: '本業以外で追加収入を得る',
    actionRequired: 'スキルを活かせる副業を探して始める',
    difficulty: 'medium',
  },
  {
    type: 'income',
    title: '転職で年収20%アップ',
    description: '市場価値を活かした転職',
    actionRequired: '転職市場をリサーチし、応募を開始する',
    difficulty: 'hard',
  },
  {
    type: 'income',
    title: '配偶者の就労',
    description: '世帯収入の増加',
    actionRequired: '配偶者と相談し、就労計画を立てる',
    difficulty: 'medium',
  },
];

/**
 * 支出系の戦略テンプレート
 */
export const COST_STRATEGIES: Omit<StrategyLever, 'id' | 'impact' | 'priority'>[] = [
  {
    type: 'cost',
    title: '固定費月2万円削減',
    description: '保険、通信費、サブスクリプションの見直し',
    actionRequired: '固定費を洗い出し、不要なものを解約する',
    difficulty: 'easy',
  },
  {
    type: 'cost',
    title: '住居費月3万円削減',
    description: 'より安い住居への引越し、または住宅ローン借り換え',
    actionRequired: '住居オプションを検討する',
    difficulty: 'medium',
  },
  {
    type: 'cost',
    title: '生活費10%カット',
    description: '日常支出の見直しと節約',
    actionRequired: '家計簿をつけ、無駄を特定する',
    difficulty: 'easy',
  },
  {
    type: 'cost',
    title: '車を手放す',
    description: '車の維持費削減（年間30-50万円）',
    actionRequired: 'カーシェアやレンタカーへの切り替えを検討',
    difficulty: 'medium',
  },
];

/**
 * タイミング系の戦略テンプレート
 */
export const TIMING_STRATEGIES: Omit<StrategyLever, 'id' | 'impact' | 'priority'>[] = [
  {
    type: 'timing',
    title: 'FIRE目標を3年遅らせる',
    description: '働く期間を延長して資産を積み増す',
    actionRequired: 'ライフプランを再検討する',
    difficulty: 'easy',
  },
  {
    type: 'timing',
    title: '住宅購入を5年遅らせる',
    description: '賃貸期間を延長して頭金を増やす',
    actionRequired: '住宅購入計画を見直す',
    difficulty: 'easy',
  },
  {
    type: 'timing',
    title: '子どもの教育費を分散',
    description: '教育資金の計画的な準備',
    actionRequired: '教育資金の積立を開始する',
    difficulty: 'medium',
  },
  {
    type: 'timing',
    title: '部分的リタイア（セミリタイア）',
    description: '完全リタイアではなく、労働時間を減らす',
    actionRequired: 'セミリタイア後の収入プランを立てる',
    difficulty: 'medium',
  },
];

/**
 * 戦略レバーを生成
 */
export function generateStrategyLevers(
  worldLine: WorldLine,
  targetFireAge?: number
): StrategyLever[] {
  const kpis = worldLine.result.kpis;
  if (!kpis) return [];
  
  const levers: StrategyLever[] = [];
  
  // 収入戦略
  INCOME_STRATEGIES.forEach((template, index) => {
    const impact = estimateIncomeImpact(template.title, kpis);
    levers.push({
      ...template,
      id: `income-${index}`,
      impact,
      priority: calculatePriority(impact, template.difficulty),
    });
  });
  
  // 支出戦略
  COST_STRATEGIES.forEach((template, index) => {
    const impact = estimateCostImpact(template.title, kpis);
    levers.push({
      ...template,
      id: `cost-${index}`,
      impact,
      priority: calculatePriority(impact, template.difficulty),
    });
  });
  
  // タイミング戦略
  TIMING_STRATEGIES.forEach((template, index) => {
    const impact = estimateTimingImpact(template.title, kpis);
    levers.push({
      ...template,
      id: `timing-${index}`,
      impact,
      priority: calculatePriority(impact, template.difficulty),
    });
  });
  
  // 優先度でソート
  return levers.sort((a, b) => b.priority - a.priority);
}

/**
 * 収入戦略の影響を推定
 */
function estimateIncomeImpact(title: string, kpis: KeyPerformanceIndicators): StrategyImpact {
  // 簡易的な推定ロジック
  let monthlyImpact = 0;
  
  if (title.includes('100万円')) monthlyImpact = 8.3;
  else if (title.includes('月5万')) monthlyImpact = 5;
  else if (title.includes('20%')) monthlyImpact = 10;
  else if (title.includes('配偶者')) monthlyImpact = 15;
  
  const yearlyImpact = monthlyImpact * 12;
  const fireAgeChange = Math.round(-yearlyImpact / 50); // 年50万円で1年早まると仮定
  
  return {
    fireAgeChange,
    survivalRateChange: Math.min(yearlyImpact / 10, 15),
    assetsAt60Change: yearlyImpact * 10,
    monthlyImpact,
  };
}

/**
 * 支出戦略の影響を推定
 */
function estimateCostImpact(title: string, kpis: KeyPerformanceIndicators): StrategyImpact {
  let monthlyImpact = 0;
  
  if (title.includes('月2万')) monthlyImpact = 2;
  else if (title.includes('月3万')) monthlyImpact = 3;
  else if (title.includes('10%')) monthlyImpact = 3;
  else if (title.includes('車')) monthlyImpact = 4;
  
  const yearlyImpact = monthlyImpact * 12;
  const fireAgeChange = Math.round(-yearlyImpact / 40);
  
  return {
    fireAgeChange,
    survivalRateChange: Math.min(yearlyImpact / 8, 10),
    assetsAt60Change: yearlyImpact * 12,
    monthlyImpact,
  };
}

/**
 * タイミング戦略の影響を推定
 */
function estimateTimingImpact(title: string, kpis: KeyPerformanceIndicators): StrategyImpact {
  if (title.includes('3年遅らせる')) {
    return {
      fireAgeChange: 3,
      survivalRateChange: 15,
      assetsAt60Change: 1000,
      monthlyImpact: 0,
    };
  }
  if (title.includes('5年遅らせる')) {
    return {
      fireAgeChange: -1,
      survivalRateChange: 5,
      assetsAt60Change: 500,
      monthlyImpact: 0,
    };
  }
  if (title.includes('教育費')) {
    return {
      fireAgeChange: -1,
      survivalRateChange: 5,
      assetsAt60Change: 300,
      monthlyImpact: 0,
    };
  }
  return {
    fireAgeChange: -2,
    survivalRateChange: 10,
    assetsAt60Change: 500,
    monthlyImpact: 5,
  };
}

/**
 * 優先度を計算
 */
function calculatePriority(
  impact: StrategyImpact,
  difficulty: 'easy' | 'medium' | 'hard'
): number {
  const difficultyMultiplier = {
    easy: 1.5,
    medium: 1.0,
    hard: 0.7,
  };
  
  const impactScore = 
    Math.abs(impact.fireAgeChange) * 20 +
    impact.survivalRateChange * 2 +
    impact.assetsAt60Change / 100;
  
  return impactScore * difficultyMultiplier[difficulty];
}

/**
 * 戦略分析を実行
 */
export function analyzeStrategy(
  worldLine: WorldLine,
  targetFireAge?: number
): StrategyAnalysis {
  const kpis = worldLine.result.kpis;
  const levers = generateStrategyLevers(worldLine, targetFireAge);
  
  let gap: number | null = null;
  if (targetFireAge && kpis?.safeFireAge) {
    gap = kpis.safeFireAge - targetFireAge;
  }
  
  return {
    worldLineId: worldLine.id,
    currentKpis: kpis ?? {
      safeFireAge: null,
      assetsAt60: 0,
      assetsAt100: 0,
      midlifeSurplus: 0,
      survivalRate: 0,
      fireAge: null,
    },
    targetFireAge: targetFireAge ?? null,
    gap,
    levers,
    topRecommendation: levers[0] ?? null,
    analysisTimestamp: new Date(),
  };
}
