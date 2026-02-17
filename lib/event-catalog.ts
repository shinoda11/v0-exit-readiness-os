/**
 * Event Catalog — 23 プリセットイベント + 3 バンドル
 *
 * 旧 timeline-content.tsx (1627行) から移植。
 * エンジン非対応型（child_birth, education, asset_purchase）は
 * expense_increase / asset_gain に変換済み。
 */

import type { LifeEventType, Profile, HousingPurchaseDetails } from './types';

// ============================================================
// Types
// ============================================================

export type EventCategory = 'family' | 'career' | 'lifestyle' | 'asset' | 'housing';

export interface PresetEvent {
  id: string;
  name: string;
  category: EventCategory;
  description: string;
  icon: string;
  ageOffset: number;
  defaultAmount: number;
  defaultDuration: number;
  isRecurring: boolean;
  engineType: LifeEventType;
  target?: 'self' | 'partner';
  purchaseDetails?: HousingPurchaseDetails;
  customizable: { age: boolean; amount: boolean; duration: boolean };
  amountLabel?: string;
}

export interface BundlePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: EventCategory;
  defaultAgeOffset: number;
  coupleOnly?: boolean;
  events: {
    name: string;
    engineType: LifeEventType;
    target?: 'self' | 'partner';
    amountFn: (p: Profile) => number;
    duration: number;
    isRecurring: boolean;
    ageOffsetFromBundle: number;
  }[];
}

// ============================================================
// Category Meta
// ============================================================

export const CATEGORIES: Record<EventCategory, { label: string; icon: string }> = {
  family: { label: '家族', icon: '👨‍👩‍👧' },
  career: { label: 'キャリア', icon: '💼' },
  lifestyle: { label: '生活', icon: '🌈' },
  asset: { label: '資産', icon: '💰' },
  housing: { label: '住宅', icon: '🏠' },
};

// ============================================================
// 23 Preset Events
// ============================================================

export const PRESET_EVENTS: PresetEvent[] = [
  // ── family ──
  {
    id: 'wedding',
    name: '結婚式',
    category: 'family',
    description: '挙式・披露宴の一時支出',
    icon: '💒',
    ageOffset: 1,
    defaultAmount: 350,
    defaultDuration: 1,
    isRecurring: false,
    engineType: 'expense_increase',
    customizable: { age: true, amount: true, duration: false },
    amountLabel: '一時支出',
  },
  {
    id: 'child1',
    name: '第一子（育児費）',
    category: 'family',
    description: '出産〜小学校入学までの育児関連費用',
    icon: '👶',
    ageOffset: 2,
    defaultAmount: 100,
    defaultDuration: 6,
    isRecurring: true,
    engineType: 'expense_increase',
    customizable: { age: true, amount: true, duration: true },
    amountLabel: '年間支出',
  },
  {
    id: 'child2',
    name: '第二子（育児費）',
    category: 'family',
    description: '第二子の育児関連費用',
    icon: '👶',
    ageOffset: 4,
    defaultAmount: 100,
    defaultDuration: 6,
    isRecurring: true,
    engineType: 'expense_increase',
    customizable: { age: true, amount: true, duration: true },
    amountLabel: '年間支出',
  },
  {
    id: 'edu_private_elem',
    name: '私立小学校',
    category: 'family',
    description: '私立小学校の学費（年額）',
    icon: '🎒',
    ageOffset: 8,
    defaultAmount: 150,
    defaultDuration: 6,
    isRecurring: true,
    engineType: 'expense_increase',
    customizable: { age: true, amount: true, duration: true },
    amountLabel: '年間支出',
  },
  {
    id: 'edu_private_middle',
    name: '私立中学校',
    category: 'family',
    description: '私立中学校の学費（年額）',
    icon: '📚',
    ageOffset: 14,
    defaultAmount: 130,
    defaultDuration: 3,
    isRecurring: true,
    engineType: 'expense_increase',
    customizable: { age: true, amount: true, duration: true },
    amountLabel: '年間支出',
  },
  {
    id: 'edu_university',
    name: '大学',
    category: 'family',
    description: '大学の学費（年額）',
    icon: '🎓',
    ageOffset: 20,
    defaultAmount: 180,
    defaultDuration: 4,
    isRecurring: true,
    engineType: 'expense_increase',
    customizable: { age: true, amount: true, duration: true },
    amountLabel: '年間支出',
  },
  {
    id: 'nursing_care_parent',
    name: '親の介護',
    category: 'family',
    description: '親の介護にかかる年間費用',
    icon: '🏥',
    ageOffset: 25,
    defaultAmount: 120,
    defaultDuration: 10,
    isRecurring: true,
    engineType: 'expense_increase',
    customizable: { age: true, amount: true, duration: true },
    amountLabel: '年間支出',
  },
  {
    id: 'nursing_care_self',
    name: '自分の介護',
    category: 'family',
    description: '自分自身の介護費用',
    icon: '🩺',
    ageOffset: 45,
    defaultAmount: 180,
    defaultDuration: 5,
    isRecurring: true,
    engineType: 'expense_increase',
    customizable: { age: true, amount: true, duration: true },
    amountLabel: '年間支出',
  },

  // ── career ──
  {
    id: 'promotion',
    name: '昇進・昇給',
    category: 'career',
    description: '昇進に伴う年収増',
    icon: '📈',
    ageOffset: 3,
    defaultAmount: 100,
    defaultDuration: 0,
    isRecurring: false,
    engineType: 'income_increase',
    target: 'self',
    customizable: { age: true, amount: true, duration: false },
    amountLabel: '年収増額',
  },
  {
    id: 'job_change',
    name: '転職',
    category: 'career',
    description: '転職による年収変動',
    icon: '🔄',
    ageOffset: 2,
    defaultAmount: 150,
    defaultDuration: 0,
    isRecurring: false,
    engineType: 'income_increase',
    target: 'self',
    customizable: { age: true, amount: true, duration: false },
    amountLabel: '年収増額',
  },
  {
    id: 'overseas_assignment',
    name: '海外駐在',
    category: 'career',
    description: '駐在手当による年収増（期間限定）',
    icon: '✈️',
    ageOffset: 3,
    defaultAmount: 200,
    defaultDuration: 3,
    isRecurring: true,
    engineType: 'income_increase',
    target: 'self',
    customizable: { age: true, amount: true, duration: true },
    amountLabel: '年収増額',
  },
  {
    id: 'side_business',
    name: '副業開始',
    category: 'career',
    description: '副業による追加収入',
    icon: '💻',
    ageOffset: 1,
    defaultAmount: 50,
    defaultDuration: 10,
    isRecurring: true,
    engineType: 'income_increase',
    target: 'self',
    customizable: { age: true, amount: true, duration: true },
    amountLabel: '年間収入',
  },
  {
    id: 'partner_childcare_leave',
    name: 'パートナー育休',
    category: 'career',
    description: 'パートナーの育休取得による収入減',
    icon: '🍼',
    ageOffset: 2,
    defaultAmount: 0, // calculated from partner income
    defaultDuration: 1,
    isRecurring: true,
    engineType: 'income_decrease',
    target: 'partner',
    customizable: { age: true, amount: true, duration: true },
    amountLabel: '年間減収額',
  },
  {
    id: 'partner_part_time',
    name: 'パートナー時短勤務',
    category: 'career',
    description: 'パートナーの時短勤務による収入減',
    icon: '⏰',
    ageOffset: 3,
    defaultAmount: 0, // calculated from partner income
    defaultDuration: 3,
    isRecurring: true,
    engineType: 'income_decrease',
    target: 'partner',
    customizable: { age: true, amount: true, duration: true },
    amountLabel: '年間減収額',
  },
  {
    id: 'partner_career_change',
    name: 'パートナー転職',
    category: 'career',
    description: 'パートナーの転職による年収変動',
    icon: '🔄',
    ageOffset: 3,
    defaultAmount: 100,
    defaultDuration: 0,
    isRecurring: false,
    engineType: 'income_increase',
    target: 'partner',
    customizable: { age: true, amount: true, duration: false },
    amountLabel: '年収増額',
  },

  // ── lifestyle ──
  {
    id: 'world_trip',
    name: '世界一周旅行',
    category: 'lifestyle',
    description: '長期旅行の一時支出',
    icon: '🌍',
    ageOffset: 5,
    defaultAmount: 200,
    defaultDuration: 1,
    isRecurring: false,
    engineType: 'expense_increase',
    customizable: { age: true, amount: true, duration: false },
    amountLabel: '一時支出',
  },
  {
    id: 'overseas_relocation',
    name: '海外移住',
    category: 'lifestyle',
    description: '海外生活にかかる追加年間費用',
    icon: '🏝️',
    ageOffset: 5,
    defaultAmount: 100,
    defaultDuration: 5,
    isRecurring: true,
    engineType: 'expense_increase',
    customizable: { age: true, amount: true, duration: true },
    amountLabel: '年間追加支出',
  },
  {
    id: 'car_purchase',
    name: '車購入',
    category: 'lifestyle',
    description: '車の購入費用（一時）',
    icon: '🚗',
    ageOffset: 2,
    defaultAmount: 300,
    defaultDuration: 1,
    isRecurring: false,
    engineType: 'expense_increase',
    customizable: { age: true, amount: true, duration: false },
    amountLabel: '一時支出',
  },
  {
    id: 'renovation',
    name: 'リノベーション',
    category: 'lifestyle',
    description: '自宅リノベーション費用（一時）',
    icon: '🔨',
    ageOffset: 10,
    defaultAmount: 500,
    defaultDuration: 1,
    isRecurring: false,
    engineType: 'expense_increase',
    customizable: { age: true, amount: true, duration: false },
    amountLabel: '一時支出',
  },
  {
    id: 'travel',
    name: '旅行（毎年）',
    category: 'lifestyle',
    description: '毎年の旅行費用',
    icon: '🧳',
    ageOffset: 0,
    defaultAmount: 50,
    defaultDuration: 10,
    isRecurring: true,
    engineType: 'expense_increase',
    customizable: { age: true, amount: true, duration: true },
    amountLabel: '年間支出',
  },
  {
    id: 'expense_cut',
    name: '生活費削減',
    category: 'lifestyle',
    description: '固定費見直し等による支出削減',
    icon: '✂️',
    ageOffset: 0,
    defaultAmount: 60,
    defaultDuration: 20,
    isRecurring: true,
    engineType: 'expense_decrease',
    customizable: { age: true, amount: true, duration: true },
    amountLabel: '年間削減額',
  },

  // ── asset ──
  {
    id: 'inheritance',
    name: '相続',
    category: 'asset',
    description: '相続による資産増加',
    icon: '📜',
    ageOffset: 25,
    defaultAmount: 2000,
    defaultDuration: 1,
    isRecurring: false,
    engineType: 'asset_gain',
    customizable: { age: true, amount: true, duration: false },
    amountLabel: '受取額',
  },
  {
    id: 'housing_gift',
    name: '住宅資金贈与',
    category: 'asset',
    description: '親からの住宅資金援助',
    icon: '🏠',
    ageOffset: 2,
    defaultAmount: 1000,
    defaultDuration: 1,
    isRecurring: false,
    engineType: 'asset_gain',
    customizable: { age: true, amount: true, duration: false },
    amountLabel: '受取額',
  },
  {
    id: 'severance',
    name: '退職金',
    category: 'asset',
    description: '退職金受取',
    icon: '💼',
    ageOffset: 30,
    defaultAmount: 3000,
    defaultDuration: 1,
    isRecurring: false,
    engineType: 'asset_gain',
    customizable: { age: true, amount: true, duration: false },
    amountLabel: '受取額',
  },

  // ── housing ──
  {
    id: 'housing_purchase',
    name: '住宅購入',
    category: 'housing',
    description: '住宅購入（ローンシミュレーション付き）',
    icon: '🏡',
    ageOffset: 2,
    defaultAmount: 8000,
    defaultDuration: 1,
    isRecurring: false,
    engineType: 'housing_purchase',
    purchaseDetails: {
      propertyPrice: 8000,
      downPayment: 1500,
      purchaseCostRate: 7,
      mortgageYears: 35,
      interestRate: 0.5,
      ownerAnnualCost: 40,
    },
    customizable: { age: true, amount: true, duration: false },
    amountLabel: '物件価格',
  },
];

// ============================================================
// 3 Bundle Presets
// ============================================================

export const BUNDLE_PRESETS: BundlePreset[] = [
  {
    id: 'overseas_with_home',
    name: '海外駐在（持ち家あり）',
    description: '駐在手当 + 住居費補助 + 自宅賃貸収入 (3年)',
    icon: '🌏',
    category: 'career',
    defaultAgeOffset: 3,
    events: [
      {
        name: '駐在手当',
        engineType: 'income_increase',
        target: 'self',
        amountFn: () => 200,
        duration: 3,
        isRecurring: true,
        ageOffsetFromBundle: 0,
      },
      {
        name: '住居費補助',
        engineType: 'expense_decrease',
        amountFn: (p) => p.housingCostAnnual,
        duration: 3,
        isRecurring: true,
        ageOffsetFromBundle: 0,
      },
      {
        name: '自宅賃貸収入',
        engineType: 'rental_income',
        amountFn: (p) => Math.round(p.housingCostAnnual * 0.8),
        duration: 3,
        isRecurring: true,
        ageOffsetFromBundle: 0,
      },
    ],
  },
  {
    id: 'overseas_renter',
    name: '海外駐在（賃貸）',
    description: '駐在手当 + 住居費補助 (3年)',
    icon: '🌏',
    category: 'career',
    defaultAgeOffset: 3,
    events: [
      {
        name: '駐在手当',
        engineType: 'income_increase',
        target: 'self',
        amountFn: () => 200,
        duration: 3,
        isRecurring: true,
        ageOffsetFromBundle: 0,
      },
      {
        name: '住居費補助',
        engineType: 'expense_decrease',
        amountFn: (p) => p.housingCostAnnual,
        duration: 3,
        isRecurring: true,
        ageOffsetFromBundle: 0,
      },
    ],
  },
  {
    id: 'partner_childcare_package',
    name: 'パートナー育休 + 時短パック',
    description: '育休1年 + 時短2年 + 出産費用',
    icon: '👶',
    category: 'family',
    defaultAgeOffset: 2,
    coupleOnly: true,
    events: [
      {
        name: 'パートナー育休',
        engineType: 'income_decrease',
        target: 'partner',
        amountFn: (p) => Math.round(p.partnerGrossIncome * 0.3),
        duration: 1,
        isRecurring: true,
        ageOffsetFromBundle: 0,
      },
      {
        name: 'パートナー時短',
        engineType: 'income_decrease',
        target: 'partner',
        amountFn: (p) => Math.round(p.partnerGrossIncome * 0.25),
        duration: 2,
        isRecurring: true,
        ageOffsetFromBundle: 1,
      },
      {
        name: '出産費用',
        engineType: 'expense_increase',
        amountFn: () => 100,
        duration: 1,
        isRecurring: false,
        ageOffsetFromBundle: 0,
      },
    ],
  },
];

// ============================================================
// Helpers
// ============================================================

/** partner系プリセットかどうか */
export function isPartnerPreset(preset: PresetEvent): boolean {
  return preset.target === 'partner';
}

/** プリセットのデフォルト金額を profile から計算（partner系の初期値） */
export function getDefaultAmount(preset: PresetEvent, profile: Profile): number {
  if (preset.id === 'partner_childcare_leave') {
    return Math.round(profile.partnerGrossIncome * 0.3);
  }
  if (preset.id === 'partner_part_time') {
    return Math.round(profile.partnerGrossIncome * 0.25);
  }
  return preset.defaultAmount;
}
