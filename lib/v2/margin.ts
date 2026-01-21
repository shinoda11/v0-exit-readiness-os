/**
 * Exit Readiness OS v2 - 余白トリレンマ (Margin Trilemma)
 * お金、時間、体力の3つの資源でユーザーの「余白」をモデル化
 */

/**
 * 余白トリレンマ：お金、時間、体力の3つの資源
 */
export type Margin = {
  money: MoneyMargin;
  time: TimeMargin;
  energy: EnergyMargin;
};

/**
 * お金の余白
 */
export type MoneyMargin = {
  monthlyDisposableIncome: number; // 月々の手取り収入
  monthlyNetSavings: number;       // 月々の純貯蓄額（収入 - 支出）
  emergencyFundCoverage: number;   // 緊急資金で生活費をカバーできる月数
  annualDisposableIncome: number;  // 年間可処分所得
};

/**
 * 時間の余白
 */
export type TimeMargin = {
  weeklyFreeHours: number;         // 週あたりの自由時間
  annualVacationDays: number;      // 年間休暇日数
  careerFlexibilityScore: number;  // キャリアの柔軟性スコア (0-100)
};

/**
 * 体力の余白（断定しないゲージ）
 */
export type EnergyMargin = {
  stressLevel: number;             // ストレスレベル (0-100, 低いほど良い)
  physicalHealthScore: number;     // 身体的健康スコア (0-100)
  mentalHealthScore: number;       // 精神的健康スコア (0-100)
};

/**
 * デフォルトのMarginを生成
 */
export function createDefaultMargin(): Margin {
  return {
    money: {
      monthlyDisposableIncome: 0,
      monthlyNetSavings: 0,
      emergencyFundCoverage: 0,
      annualDisposableIncome: 0,
    },
    time: {
      weeklyFreeHours: 40,
      annualVacationDays: 20,
      careerFlexibilityScore: 50,
    },
    energy: {
      stressLevel: 50,
      physicalHealthScore: 70,
      mentalHealthScore: 70,
    },
  };
}

/**
 * お金の余白の健全性を評価
 */
export function evaluateMoneyMarginHealth(margin: MoneyMargin): 'excellent' | 'good' | 'fair' | 'poor' {
  // 緊急資金カバー月数で判定
  if (margin.emergencyFundCoverage >= 12 && margin.monthlyNetSavings > 0) {
    return 'excellent';
  }
  if (margin.emergencyFundCoverage >= 6 && margin.monthlyNetSavings >= 0) {
    return 'good';
  }
  if (margin.emergencyFundCoverage >= 3) {
    return 'fair';
  }
  return 'poor';
}

/**
 * 時間の余白の健全性を評価
 */
export function evaluateTimeMarginHealth(margin: TimeMargin): 'excellent' | 'good' | 'fair' | 'poor' {
  const score = (margin.weeklyFreeHours / 50) * 40 + 
                (margin.annualVacationDays / 30) * 30 + 
                (margin.careerFlexibilityScore / 100) * 30;
  
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

/**
 * 体力の余白の健全性を評価
 */
export function evaluateEnergyMarginHealth(margin: EnergyMargin): 'excellent' | 'good' | 'fair' | 'poor' {
  const score = ((100 - margin.stressLevel) / 100) * 30 + 
                (margin.physicalHealthScore / 100) * 35 + 
                (margin.mentalHealthScore / 100) * 35;
  
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}
