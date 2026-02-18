// Benchmark cases from docs/case-catalog-results.md
// 賃貸ベースラインのスコアをハードコード（静的データ）

export interface BenchmarkCase {
  id: string;
  label: string;
  mode: 'solo' | 'couple';
  grossIncome: number;  // 世帯年収（万円）
  score: number;        // 賃貸ベースラインスコア
}

export const BENCHMARK_CASES: BenchmarkCase[] = [
  { id: 'C01', label: '王道DINK 2,400万', mode: 'couple', grossIncome: 2400, score: 72 },
  { id: 'C02', label: 'ペースダウン不安 2,400万', mode: 'couple', grossIncome: 2400, score: 62 },
  { id: 'C03', label: '子どもあり検討 2,200万', mode: 'couple', grossIncome: 2200, score: 72 },
  { id: 'C04', label: '海外転職DINK 2,300万', mode: 'couple', grossIncome: 2300, score: 66 },
  { id: 'C05', label: '審査MAX 2,400万', mode: 'couple', grossIncome: 2400, score: 80 },
  { id: 'C06', label: '高家賃DINK 2,400万', mode: 'couple', grossIncome: 2400, score: 67 },
  { id: 'C07', label: '片働き夫婦 2,000万', mode: 'couple', grossIncome: 2000, score: 79 },
  { id: 'C08', label: 'メンタルリスク 2,200万', mode: 'couple', grossIncome: 2200, score: 60 },
  { id: 'C09', label: 'リモート崩壊 2,200万', mode: 'couple', grossIncome: 2200, score: 75 },
  { id: 'C10', label: '高額帯検討 2,400万', mode: 'couple', grossIncome: 2400, score: 79 },
  { id: 'C11', label: '堅実1馬力 1,500万', mode: 'couple', grossIncome: 1500, score: 79 },
  { id: 'C12', label: '共働き中堅 1,800万', mode: 'couple', grossIncome: 1800, score: 76 },
  { id: 'C13', label: 'ソロ堅実 900万', mode: 'solo', grossIncome: 900, score: 78 },
  { id: 'C14', label: '若手高年収DINK 3,200万', mode: 'couple', grossIncome: 3200, score: 73 },
  { id: 'C15', label: '子2人・郊外 1,200万', mode: 'couple', grossIncome: 1200, score: 83 },
  { id: 'C16', label: 'ソロ高貯蓄 1,800万', mode: 'solo', grossIncome: 1800, score: 82 },
  { id: 'C17', label: 'フリーランス夫婦 2,000万', mode: 'couple', grossIncome: 2000, score: 80 },
  { id: 'C18', label: '持ち家売却検討 2,100万', mode: 'couple', grossIncome: 2100, score: 83 },
];

/**
 * ユーザーの条件に近い3件を返す。
 * 優先順: mode一致 > スコア近接 > 年収近接
 */
export function findSimilarCases(
  userScore: number,
  userMode: 'solo' | 'couple',
  userGrossIncome: number,
  count: number = 3,
): BenchmarkCase[] {
  return [...BENCHMARK_CASES]
    .sort((a, b) => {
      const aModeMatch = a.mode === userMode ? 1 : 0;
      const bModeMatch = b.mode === userMode ? 1 : 0;
      if (aModeMatch !== bModeMatch) return bModeMatch - aModeMatch;

      const aScoreDiff = Math.abs(a.score - userScore);
      const bScoreDiff = Math.abs(b.score - userScore);
      if (aScoreDiff !== bScoreDiff) return aScoreDiff - bScoreDiff;

      const aIncomeDiff = Math.abs(a.grossIncome - userGrossIncome);
      const bIncomeDiff = Math.abs(b.grossIncome - userGrossIncome);
      return aIncomeDiff - bIncomeDiff;
    })
    .slice(0, count);
}
