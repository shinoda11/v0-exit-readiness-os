/**
 * Exit Readiness OS v2 - シナリオイベント (ScenarioEvent)
 * 世界線に影響を与えるライフイベント
 */

/**
 * イベントタイプ
 */
export type EventType = 
  | 'CHILDCARE'   // 子育て
  | 'ELDERCARE'   // 介護
  | 'RELOCATION'  // 移住
  | 'JOB_CHANGE'  // 転職
  | 'SABBATICAL'  // サバティカル
  | 'EDUCATION'   // MBA/大学院
  | 'MARRIAGE'    // 結婚
  | 'DIVORCE'     // 離婚
  | 'INHERITANCE' // 相続
  | 'SIDE_BUSINESS' // 副業開始
  | 'HEALTH_ISSUE'  // 健康問題
  | 'HOUSING_PURCHASE' // 住宅購入
  | 'HOUSING_RENT'     // 賃貸継続
  | 'CUSTOM';     // カスタム

/**
 * シナリオイベント：世界線に影響を与えるライフイベント
 */
export type ScenarioEvent = {
  id: string;           // UUID
  type: EventType;
  name: string;         // 例: "第一子の誕生", "都心への移住"
  description?: string; // イベントの詳細説明
  startYear: number;    // イベント開始年（現在からの相対年数）
  durationYears: number; // イベント継続年数（0は一時的なイベント）
  impact: EventImpact;
};

/**
 * イベントの影響
 */
export type EventImpact = {
  money: number;   // 年間の純支出増減額（万円、正は支出増、負は収入増）
  time: number;    // 週あたりの時間増減（時間、正は自由時間減）
  energy: number;  // エネルギーへの影響（-100 to 100、正はストレス増）
  oneTimeExpense?: number; // 一時的な支出（万円）
  oneTimeIncome?: number;  // 一時的な収入（万円）
};

/**
 * イベントテンプレート
 */
export const EVENT_TEMPLATES: Record<EventType, Omit<ScenarioEvent, 'id' | 'startYear'>> = {
  CHILDCARE: {
    type: 'CHILDCARE',
    name: '子育て（1人目）',
    description: '子どもの誕生から大学卒業まで',
    durationYears: 22,
    impact: {
      money: 100,  // 年間100万円増
      time: 15,    // 週15時間減
      energy: 20,  // ストレス20増
    },
  },
  ELDERCARE: {
    type: 'ELDERCARE',
    name: '親の介護',
    description: '親の介護が必要になった場合',
    durationYears: 5,
    impact: {
      money: 50,
      time: 10,
      energy: 30,
    },
  },
  RELOCATION: {
    type: 'RELOCATION',
    name: '地方移住',
    description: '地方への移住による生活費削減',
    durationYears: 0, // 永続
    impact: {
      money: -100, // 年間100万円減（節約）
      time: -5,    // 通勤時間短縮
      energy: -15, // ストレス減
      oneTimeExpense: 200, // 引越し費用
    },
  },
  JOB_CHANGE: {
    type: 'JOB_CHANGE',
    name: '転職',
    description: 'キャリアチェンジによる収入変化',
    durationYears: 0,
    impact: {
      money: -150, // 年収150万円増（負の支出=収入増）
      time: 0,
      energy: 10,  // 一時的なストレス
    },
  },
  SABBATICAL: {
    type: 'SABBATICAL',
    name: 'サバティカル休暇',
    description: '1年間の休暇を取得',
    durationYears: 1,
    impact: {
      money: 500, // 収入なし+生活費
      time: -40,  // 自由時間大幅増
      energy: -30, // ストレス大幅減
    },
  },
  EDUCATION: {
    type: 'EDUCATION',
    name: 'MBA/大学院',
    description: '社会人大学院への進学',
    durationYears: 2,
    impact: {
      money: 200, // 学費+機会費用
      time: 20,
      energy: 25,
    },
  },
  MARRIAGE: {
    type: 'MARRIAGE',
    name: '結婚',
    description: '結婚による世帯収入・支出の変化',
    durationYears: 0,
    impact: {
      money: -100, // 世帯収入増加効果
      time: 5,
      energy: -5,
      oneTimeExpense: 300, // 結婚費用
    },
  },
  DIVORCE: {
    type: 'DIVORCE',
    name: '離婚',
    description: '離婚による財産分割・生活費変化',
    durationYears: 0,
    impact: {
      money: 100,
      time: -5,
      energy: 30,
      oneTimeExpense: 200,
    },
  },
  INHERITANCE: {
    type: 'INHERITANCE',
    name: '相続',
    description: '遺産相続による資産増加',
    durationYears: 0,
    impact: {
      money: 0,
      time: 0,
      energy: 0,
      oneTimeIncome: 2000, // 2000万円の相続
    },
  },
  SIDE_BUSINESS: {
    type: 'SIDE_BUSINESS',
    name: '副業開始',
    description: '副業による追加収入',
    durationYears: 0,
    impact: {
      money: -100, // 年間100万円の収入増
      time: 10,    // 週10時間の作業
      energy: 15,
    },
  },
  HEALTH_ISSUE: {
    type: 'HEALTH_ISSUE',
    name: '健康問題',
    description: '大きな病気や怪我',
    durationYears: 1,
    impact: {
      money: 100,
      time: 10,
      energy: 40,
      oneTimeExpense: 50,
    },
  },
  HOUSING_PURCHASE: {
    type: 'HOUSING_PURCHASE',
    name: '住宅購入',
    description: 'マイホーム購入',
    durationYears: 35, // ローン期間
    impact: {
      money: 0, // 個別計算が必要
      time: 0,
      energy: -5, // 安心感
    },
  },
  HOUSING_RENT: {
    type: 'HOUSING_RENT',
    name: '賃貸継続',
    description: '賃貸住宅に住み続ける',
    durationYears: 0,
    impact: {
      money: 0, // 既存の住居費
      time: 0,
      energy: 0,
    },
  },
  CUSTOM: {
    type: 'CUSTOM',
    name: 'カスタムイベント',
    description: 'ユーザー定義のイベント',
    durationYears: 1,
    impact: {
      money: 0,
      time: 0,
      energy: 0,
    },
  },
};

/**
 * 新しいイベントを作成
 */
export function createEvent(
  type: EventType,
  startYear: number,
  overrides?: Partial<ScenarioEvent>
): ScenarioEvent {
  const template = EVENT_TEMPLATES[type];
  return {
    ...template,
    id: crypto.randomUUID(),
    startYear,
    ...overrides,
  };
}

/**
 * イベントの年間影響を計算
 */
export function calculateEventImpactForYear(
  event: ScenarioEvent,
  year: number
): EventImpact | null {
  const eventEndYear = event.durationYears === 0 
    ? Infinity  // 永続イベント
    : event.startYear + event.durationYears;
  
  if (year < event.startYear || year >= eventEndYear) {
    return null;
  }
  
  // 初年度のみ一時的な支出/収入を含める
  if (year === event.startYear) {
    return {
      ...event.impact,
      money: event.impact.money + (event.impact.oneTimeExpense ?? 0) - (event.impact.oneTimeIncome ?? 0),
    };
  }
  
  return {
    money: event.impact.money,
    time: event.impact.time,
    energy: event.impact.energy,
  };
}
