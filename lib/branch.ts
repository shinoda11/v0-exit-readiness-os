/**
 * Branch Builder — 人生の分岐を定義し、世界線候補を自動生成する
 *
 * Branch → LifeEvent 変換を通じて、エンジンが実際に処理できる
 * イベントタイプのみを使用する。
 * child_birth / education はエンジンで無視されるため、
 * expense_increase として変換する。
 */

import type { Profile, LifeEvent, SimulationResult, HousingPurchaseDetails } from './types';

// ============================================================
// Types
// ============================================================

export type BranchCertainty = 'confirmed' | 'planned' | 'uncertain';

export interface Branch {
  id: string;
  label: string;
  detail: string;
  certainty: BranchCertainty;
  age?: number;
  auto?: boolean;
  eventType: string;
  eventParams: Record<string, unknown>;
}

export interface WorldlineCandidate {
  id: string;
  label: string;
  desc: string;
  branches: Branch[];
  color: string;
  score?: number;
  result?: SimulationResult;
}

// ============================================================
// Default Branches (profile-driven)
// ============================================================

const CANDIDATE_COLORS = {
  baseline: '#4A7C59',
  variant: '#4A6FA5',
  worst: '#8A7A62',
  extra: '#7B5EA7',
};

export function createDefaultBranches(profile: Profile): Branch[] {
  const totalIncome = profile.grossIncome + profile.partnerGrossIncome;
  const branches: Branch[] = [
    // 確定（auto=true, 常にチェック済み）
    {
      id: 'age',
      label: '年齢を重ねる',
      detail: `${profile.currentAge}歳 → 100歳`,
      certainty: 'confirmed',
      auto: true,
      eventType: '_auto',
      eventParams: {},
    },
    {
      id: 'pension',
      label: '年金受給',
      detail: '65歳から',
      certainty: 'confirmed',
      auto: true,
      eventType: '_auto',
      eventParams: {},
    },

    // 計画
    ...(profile.homeStatus === 'renter'
      ? [
          {
            id: 'housing_purchase',
            label: '住宅購入',
            detail: `${Math.round(totalIncome * 5 / 100) * 100}万円`,
            certainty: 'planned' as const,
            age: profile.currentAge + 2,
            eventType: 'housing_purchase',
            eventParams: {
              propertyPrice: Math.min(10000, Math.max(6000, Math.round(totalIncome * 5 / 100) * 100)),
              downPayment: 1500,
              loanYears: 35,
              interestRate: 0.5,
              ownerAnnualCost: 40,
            },
          },
        ]
      : []),
    ...(profile.mode === 'couple'
      ? [
          {
            id: 'child_1',
            label: '第一子',
            detail: `${profile.currentAge + 2}歳`,
            certainty: 'planned' as const,
            age: profile.currentAge + 2,
            eventType: 'child',
            eventParams: { childNumber: 1 },
          },
          {
            id: 'child_2',
            label: '第二子',
            detail: `${profile.currentAge + 4}歳`,
            certainty: 'planned' as const,
            age: profile.currentAge + 4,
            eventType: 'child',
            eventParams: { childNumber: 2 },
          },
        ]
      : []),

    // 不確定
    {
      id: 'income_down_20',
      label: '年収ダウン -20%',
      detail: `${Math.round(profile.grossIncome * 0.2)}万円減`,
      certainty: 'uncertain',
      age: profile.currentAge + 3,
      eventType: 'income_change',
      eventParams: { changePercent: -20 },
    },
    {
      id: 'pacedown',
      label: 'ペースダウン',
      detail: `年収 -50%（${Math.round(profile.grossIncome * 0.5)}万円減）`,
      certainty: 'uncertain',
      age: profile.targetRetireAge - 5,
      eventType: 'income_change',
      eventParams: { changePercent: -50 },
    },
    {
      id: 'expat',
      label: '海外駐在',
      detail: '年収 +30%、2年間',
      certainty: 'uncertain',
      age: profile.currentAge + 3,
      eventType: 'income_change',
      eventParams: { changePercent: 30, duration: 2 },
    },
    ...(profile.mode === 'couple'
      ? [
          {
            id: 'partner_quit',
            label: 'パートナー退職',
            detail: `${profile.partnerGrossIncome}万円 → 0`,
            certainty: 'uncertain' as const,
            age: profile.currentAge + 2,
            eventType: 'partner_income_change',
            eventParams: { newIncome: 0 },
          },
        ]
      : []),
  ];
  return branches;
}

// ============================================================
// Branch → LifeEvent conversion
// ============================================================

export function branchToLifeEvents(branch: Branch, profile: Profile): LifeEvent[] {
  const ts = Date.now();

  switch (branch.eventType) {
    case '_auto':
      return [];

    case 'housing_purchase': {
      const p = branch.eventParams;
      const details: HousingPurchaseDetails = {
        propertyPrice: (p.propertyPrice as number) ?? 8000,
        downPayment: (p.downPayment as number) ?? 1500,
        purchaseCostRate: 7,
        mortgageYears: (p.loanYears as number) ?? 35,
        interestRate: (p.interestRate as number) ?? 0.5,
        ownerAnnualCost: (p.ownerAnnualCost as number) ?? 40,
      };
      return [
        {
          id: `branch-${branch.id}-${ts}`,
          type: 'housing_purchase',
          name: branch.label,
          age: branch.age ?? profile.currentAge + 2,
          amount: 0,
          isRecurring: false,
          purchaseDetails: details,
        },
      ];
    }

    case 'child': {
      const childNum = (branch.eventParams.childNumber as number) ?? 1;
      const baseAge = branch.age ?? profile.currentAge + 2;
      return [
        {
          id: `branch-${branch.id}-childcare-${ts}`,
          type: 'expense_increase',
          name: `第${childNum}子 育児費`,
          age: baseAge,
          amount: 100,
          duration: 6,
          isRecurring: true,
        },
        {
          id: `branch-${branch.id}-edu-${ts}`,
          type: 'expense_increase',
          name: `第${childNum}子 教育費`,
          age: baseAge + 6,
          amount: 150,
          duration: 16,
          isRecurring: true,
        },
      ];
    }

    case 'income_change': {
      const pct = (branch.eventParams.changePercent as number) ?? 0;
      if (pct === 0) return [];
      const amount = Math.round(profile.grossIncome * Math.abs(pct) / 100);
      const duration = branch.eventParams.duration as number | undefined;
      return [
        {
          id: `branch-${branch.id}-${ts}`,
          type: pct > 0 ? 'income_increase' : 'income_decrease',
          name: branch.label,
          age: branch.age ?? profile.currentAge + 3,
          amount,
          duration,
          isRecurring: false,
          target: 'self',
        },
      ];
    }

    case 'partner_income_change': {
      if (profile.partnerGrossIncome <= 0) return [];
      return [
        {
          id: `branch-${branch.id}-${ts}`,
          type: 'income_decrease',
          name: branch.label,
          age: branch.age ?? profile.currentAge + 2,
          amount: profile.partnerGrossIncome,
          isRecurring: false,
          target: 'partner',
        },
      ];
    }

    default:
      return [];
  }
}

// ============================================================
// Worldline Candidate Generation
// ============================================================

export function generateWorldlineCandidates(
  selectedBranches: Branch[],
  max: number = 5
): WorldlineCandidate[] {
  const confirmed = selectedBranches.filter((b) => b.certainty === 'confirmed');
  const planned = selectedBranches.filter((b) => b.certainty === 'planned');
  const uncertain = selectedBranches.filter((b) => b.certainty === 'uncertain');

  const candidates: WorldlineCandidate[] = [];

  // 1. Baseline = confirmed + planned
  const baselineBranches = [...confirmed, ...planned];
  candidates.push({
    id: 'baseline',
    label: 'ベースライン',
    desc:
      planned.length > 0
        ? `計画通り: ${planned.map((b) => b.label).join(' + ')}`
        : '現在の計画のみ',
    branches: baselineBranches,
    color: CANDIDATE_COLORS.baseline,
  });

  // 2. Each uncertain branch as a separate variant
  const variantColors = [CANDIDATE_COLORS.variant, '#6B8E5A', '#A85C5C', '#5A8A8A'];
  for (let i = 0; i < uncertain.length && candidates.length < max; i++) {
    const u = uncertain[i];
    candidates.push({
      id: `variant-${u.id}`,
      label: u.label,
      desc: `ベースライン + ${u.label}`,
      branches: [...baselineBranches, u],
      color: variantColors[i % variantColors.length],
    });
  }

  // 3. Worst-case: all uncertain combined (if 2+ uncertain)
  if (uncertain.length >= 2 && candidates.length < max) {
    candidates.push({
      id: 'worst-case',
      label: '複合リスク',
      desc: `全不確定: ${uncertain.map((b) => b.label).join(' + ')}`,
      branches: [...baselineBranches, ...uncertain],
      color: CANDIDATE_COLORS.worst,
    });
  }

  return candidates.slice(0, max);
}

// ============================================================
// Profile Builder for Candidate
// ============================================================

export function buildProfileForCandidate(
  profile: Profile,
  candidate: WorldlineCandidate
): Profile {
  const allEvents: LifeEvent[] = [...profile.lifeEvents];

  let homeStatus = profile.homeStatus;

  for (const branch of candidate.branches) {
    const events = branchToLifeEvents(branch, profile);
    allEvents.push(...events);

    if (branch.eventType === 'housing_purchase') {
      homeStatus = 'planning';
    }
  }

  return {
    ...profile,
    homeStatus,
    lifeEvents: allEvents,
  };
}

// ============================================================
// Impact Analysis
// ============================================================

export function findMostImpactfulBranch(
  candidates: WorldlineCandidate[]
): { branch: Branch; scoreDiff: number } | null {
  const baseline = candidates.find((c) => c.id === 'baseline');
  if (!baseline?.score) return null;

  let maxDiff = 0;
  let impactBranch: Branch | null = null;

  for (const c of candidates) {
    if (c.id === 'baseline' || !c.score) continue;
    const diff = Math.abs(baseline.score - c.score);
    if (diff > maxDiff) {
      maxDiff = diff;
      // The unique branch is the one not in baseline
      const baseIds = new Set(baseline.branches.map((b) => b.id));
      const unique = c.branches.find((b) => !baseIds.has(b.id));
      if (unique) {
        impactBranch = unique;
      }
    }
  }

  return impactBranch ? { branch: impactBranch, scoreDiff: maxDiff } : null;
}
