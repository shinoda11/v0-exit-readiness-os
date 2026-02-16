import type { Profile, LifeEvent } from './types';

export interface WorldlineTemplate {
  id: string;
  label: string;
  description: string;
  icon: string;
  baselineName: string;
  variantName: string;
  createVariant: (profile: Profile) => Partial<Profile>;
  isRelevant: (profile: Profile) => boolean;
}

export const worldlineTemplates: WorldlineTemplate[] = [
  {
    id: 'buy-vs-rent',
    label: '購入する vs 賃貸を続ける',
    description: '同じ条件で、家を買った場合と賃貸を続けた場合を比較',
    icon: '🏠',
    baselineName: '賃貸を続ける',
    variantName: '購入した場合',
    createVariant: (p) => ({
      homeStatus: 'planning' as const,
      homeMarketValue: Math.min(10000, Math.max(6000,
        Math.round((p.grossIncome + p.partnerGrossIncome) * 5 / 100) * 100)),
    }),
    isRelevant: (p) => p.homeStatus === 'renter',
  },
  {
    id: 'job-change',
    label: '転職する vs 現職を続ける',
    description: '年収が変わった場合の余白への影響を比較',
    icon: '💼',
    baselineName: '現職を続ける',
    variantName: '転職した場合',
    createVariant: (p) => ({
      lifeEvents: [
        ...p.lifeEvents,
        {
          id: `template-job-change-${Date.now()}`,
          type: 'income_increase' as const,
          name: '転職（年収+150万）',
          age: p.currentAge + 1,
          amount: 150,
          duration: 0,
          isRecurring: false,
        },
      ],
    }),
    isRelevant: () => true,
  },
  {
    id: 'pace-down',
    label: 'ペースダウンする vs フルで働く',
    description: '年収を下げてゆとりを持った場合の影響を比較',
    icon: '🌿',
    baselineName: 'フルで働く',
    variantName: 'ペースダウン',
    createVariant: (p) => ({
      lifeEvents: [
        ...p.lifeEvents,
        {
          id: `template-pace-down-${Date.now()}`,
          type: 'income_decrease' as const,
          name: 'ペースダウン（年収-200万）',
          age: p.currentAge + 3,
          amount: 200,
          duration: 0,
          isRecurring: false,
        },
      ],
    }),
    isRelevant: (p) => p.grossIncome >= 800,
  },
  {
    id: 'child-plan',
    label: '子どもあり vs DINKs継続',
    description: '子どもが生まれた場合の余白への影響を比較',
    icon: '👶',
    baselineName: 'DINKs継続',
    variantName: '子ども1人',
    createVariant: (p) => ({
      lifeEvents: [
        ...p.lifeEvents,
        {
          id: `template-child-${Date.now()}`,
          type: 'child_birth' as const,
          name: '第一子誕生',
          age: p.currentAge + 2,
          amount: 100,
          duration: 6,
          isRecurring: true,
        },
        {
          id: `template-edu-${Date.now()}`,
          type: 'education' as const,
          name: '教育費',
          age: p.currentAge + 8,
          amount: 150,
          duration: 16,
          isRecurring: true,
        },
      ],
    }),
    isRelevant: (p) => p.mode === 'couple',
  },
  {
    id: 'early-retire',
    label: '早期退職 vs 定年まで働く',
    description: '退職年齢を5年早めた場合の影響を比較',
    icon: '🏖️',
    baselineName: '定年まで働く',
    variantName: '5年早く退職',
    createVariant: (p) => ({
      targetRetireAge: Math.max(p.currentAge + 5, p.targetRetireAge - 5),
    }),
    isRelevant: (p) => p.targetRetireAge >= p.currentAge + 10,
  },
];
