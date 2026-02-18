import { describe, it, expect } from 'vitest'
import {
  calculateEffectiveTaxRate,
  getEstimatedTaxRates,
  calculateAnnualPension,
  calculateIncomeAdjustment,
  calculateRentalIncome,
  calculateNetIncomeForAge,
  calculateExpensesForAge,
  calculateAssetGainForAge,
  MAX_AGE,
} from '../calc-core'
import { createDefaultProfile } from '../engine'
import type { Profile, LifeEvent } from '../types'

// ============================================================
// Helper
// ============================================================

function profileWith(overrides: Partial<Profile>): Profile {
  return { ...createDefaultProfile(), ...overrides }
}

function makeEvent(overrides: Partial<LifeEvent> & { type: LifeEvent['type']; age: number; amount: number }): LifeEvent {
  return {
    id: `test-${Date.now()}-${Math.random()}`,
    name: 'test event',
    isRecurring: false,
    ...overrides,
  }
}

// ============================================================
// 1. calculateNetIncomeForAge
// ============================================================

describe('calculateNetIncomeForAge', () => {
  it('solo基本ケース: 退職前の手取りが正しい (auto tax)', () => {
    const p = profileWith({ grossIncome: 1200, useAutoTaxRate: true })
    const net = calculateNetIncomeForAge(p, 35)

    // grossIncome=1200 のauto税率は約30%前後
    const rate = calculateEffectiveTaxRate(1200)
    const expected = 1200 * (1 - rate / 100)
    expect(net).toBeCloseTo(expected, 1)
  })

  it('solo基本ケース: 手動税率が正しく適用される', () => {
    const p = profileWith({ grossIncome: 1000, useAutoTaxRate: false, effectiveTaxRate: 25 })
    const net = calculateNetIncomeForAge(p, 35)

    expect(net).toBeCloseTo(1000 * 0.75, 1)
  })

  it('couple: パートナー収入が合算される', () => {
    const p = profileWith({
      mode: 'couple',
      grossIncome: 1600,
      partnerGrossIncome: 800,
      useAutoTaxRate: true,
    })
    const net = calculateNetIncomeForAge(p, 35)

    const mainRate = calculateEffectiveTaxRate(1600)
    const partnerRate = calculateEffectiveTaxRate(800)
    const expected = 1600 * (1 - mainRate / 100) + 800 * (1 - partnerRate / 100)
    expect(net).toBeCloseTo(expected, 1)
  })

  it('couple + 手動税率: 同一税率が両者に適用される', () => {
    const p = profileWith({
      mode: 'couple',
      grossIncome: 1600,
      partnerGrossIncome: 800,
      useAutoTaxRate: false,
      effectiveTaxRate: 30,
    })
    const net = calculateNetIncomeForAge(p, 35)

    expect(net).toBeCloseTo((1600 + 800) * 0.70, 1)
  })

  it('RSU + 副業が手取りに含まれる', () => {
    const p = profileWith({
      grossIncome: 1000,
      rsuAnnual: 200,
      sideIncomeNet: 100,
      useAutoTaxRate: false,
      effectiveTaxRate: 30,
    })
    const net = calculateNetIncomeForAge(p, 35)

    // (1000 + 200 + 100) × 0.70 = 910
    expect(net).toBeCloseTo(910, 1)
  })

  it('退職後 65歳未満: 年金ゼロ + 事業収入のみ', () => {
    const p = profileWith({
      targetRetireAge: 50,
      postRetireIncome: 200,
      postRetireIncomeEndAge: 60,
      retirePassiveIncome: 0,
    })
    const net = calculateNetIncomeForAge(p, 55)

    // pension=0 (age<65), postRetireIncome=200×0.8=160, passive=0
    expect(net).toBeCloseTo(160, 1)
  })

  it('退職後 65歳以上: 年金が加算される', () => {
    const p = profileWith({
      targetRetireAge: 55,
      postRetireIncome: 0,
      retirePassiveIncome: 0,
    })
    const net = calculateNetIncomeForAge(p, 65)
    const pension = calculateAnnualPension(p)

    expect(net).toBeCloseTo(pension, 1)
    expect(pension).toBeGreaterThan(0)
  })

  it('退職後: postRetireIncomeEndAge 到達で事業収入停止', () => {
    const p = profileWith({
      targetRetireAge: 50,
      postRetireIncome: 200,
      postRetireIncomeEndAge: 60,
      retirePassiveIncome: 0,
    })
    // age=59: まだ事業収入あり
    expect(calculateNetIncomeForAge(p, 59)).toBeGreaterThan(0)
    // age=60: 事業収入停止、年金もなし(age<65)
    expect(calculateNetIncomeForAge(p, 60)).toBe(0)
  })

  it('rental_income: 退職前後で継続', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'rental_income', age: 35, amount: 120 }),
    ]
    const p = profileWith({
      targetRetireAge: 50,
      lifeEvents: events,
      postRetireIncome: 0,
      retirePassiveIncome: 0,
    })

    // 退職前: 通常手取り + rental 120
    const preTax = calculateNetIncomeForAge(p, 40)
    const baseNet = calculateNetIncomeForAge(profileWith({ targetRetireAge: 50 }), 40)
    expect(preTax - baseNet).toBeCloseTo(120, 1)

    // 退職後(age<65): rental 120 のみ
    expect(calculateNetIncomeForAge(p, 55)).toBeCloseTo(120, 1)
  })

  it('income_decrease イベント: 自己の手取りが減る', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'income_decrease', age: 40, amount: 400, target: 'self' }),
    ]
    const p = profileWith({
      grossIncome: 1200,
      useAutoTaxRate: false,
      effectiveTaxRate: 30,
      lifeEvents: events,
    })

    // age=39: イベント未適用 → 1200×0.7=840
    expect(calculateNetIncomeForAge(p, 39)).toBeCloseTo(840, 1)
    // age=40: (1200-400)×0.7=560
    // Note: auto tax の場合は税率が変わるので manual で検証
    expect(calculateNetIncomeForAge(p, 40)).toBeCloseTo(560, 1)
  })

  it('income_increase イベント (duration付き): 期間終了後にリセット', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'income_increase', age: 40, amount: 300, duration: 5, target: 'self' }),
    ]
    const p = profileWith({
      grossIncome: 1000,
      useAutoTaxRate: false,
      effectiveTaxRate: 25,
      lifeEvents: events,
    })

    // age=39: 未適用 → 1000×0.75=750
    expect(calculateNetIncomeForAge(p, 39)).toBeCloseTo(750, 1)
    // age=42: 期間内 → (1000+300)×0.75=975
    expect(calculateNetIncomeForAge(p, 42)).toBeCloseTo(975, 1)
    // age=45: 期間終了 → 1000×0.75=750
    expect(calculateNetIncomeForAge(p, 45)).toBeCloseTo(750, 1)
  })

  it('partner の income_decrease は couple モードで反映', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'income_decrease', age: 40, amount: 200, target: 'partner' }),
    ]
    const p = profileWith({
      mode: 'couple',
      grossIncome: 1200,
      partnerGrossIncome: 600,
      useAutoTaxRate: false,
      effectiveTaxRate: 25,
      lifeEvents: events,
    })

    // age=39: (1200+600)×0.75 = 1350
    expect(calculateNetIncomeForAge(p, 39)).toBeCloseTo(1350, 1)
    // age=40: 1200×0.75 + (600-200)×0.75 = 900+300 = 1200
    expect(calculateNetIncomeForAge(p, 40)).toBeCloseTo(1200, 1)
  })

  it('auto税率: income_decrease で tax bracket が変わる', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'income_decrease', age: 40, amount: 600, target: 'self' }),
    ]
    const p = profileWith({
      grossIncome: 1200,
      useAutoTaxRate: true,
      lifeEvents: events,
    })

    const netBefore = calculateNetIncomeForAge(p, 39)
    const netAfter = calculateNetIncomeForAge(p, 40)

    // 1200 → 600: 手取りは減るが税率も下がるので差は600未満
    expect(netBefore).toBeGreaterThan(netAfter)
    const grossDiff = 600
    const netDiff = netBefore - netAfter
    expect(netDiff).toBeLessThan(grossDiff) // 累進税率の恩恵
    expect(netDiff).toBeGreaterThan(0)
  })
})

// ============================================================
// 2. calculateExpensesForAge
// ============================================================

describe('calculateExpensesForAge', () => {
  it('基本: 生活費 + 住居費（賃貸、インフレなし）', () => {
    const p = profileWith({
      livingCostAnnual: 360,
      housingCostAnnual: 180,
      homeStatus: 'renter',
    })
    const exp = calculateExpensesForAge(p, 35, 1)
    // 初年度: 360 + 180 = 540 (rentInflationFactorは0年なので1)
    expect(exp).toBeCloseTo(540, 1)
  })

  it('生活費にインフレが正しく適用される', () => {
    const p = profileWith({
      livingCostAnnual: 360,
      housingCostAnnual: 0,
      homeStatus: 'owner',
    })
    // 10年後、2%インフレ
    const inflationFactor = Math.pow(1.02, 10)
    const exp = calculateExpensesForAge(p, 45, inflationFactor)
    expect(exp).toBeCloseTo(360 * inflationFactor, 1)
  })

  it('賃貸の家賃に rentInflationRate が適用される', () => {
    const p = profileWith({
      currentAge: 35,
      livingCostAnnual: 0,
      housingCostAnnual: 180,
      homeStatus: 'renter',
      rentInflationRate: 1.0,
    })
    // 10年後: 180 × (1.01)^10
    const exp = calculateExpensesForAge(p, 45, 1)
    const expected = 180 * Math.pow(1.01, 10)
    expect(exp).toBeCloseTo(expected, 1)
  })

  it('rentInflationRate 未設定 → inflationRate にフォールバック', () => {
    const p = profileWith({
      currentAge: 35,
      livingCostAnnual: 0,
      housingCostAnnual: 180,
      homeStatus: 'renter',
      rentInflationRate: undefined,
      inflationRate: 2,
    })
    const exp = calculateExpensesForAge(p, 45, 1)
    const expected = 180 * Math.pow(1.02, 10)
    expect(exp).toBeCloseTo(expected, 1)
  })

  it('owner: 住居費にインフレが適用されない（ローンは名目固定）', () => {
    const p = profileWith({
      currentAge: 35,
      targetRetireAge: 99, // 退職multiplier の影響を排除
      livingCostAnnual: 0,
      housingCostAnnual: 180,
      homeStatus: 'owner',
    })
    // 10年後でも住居費は変わらない
    expect(calculateExpensesForAge(p, 45, 1)).toBeCloseTo(180, 1)
    expect(calculateExpensesForAge(p, 55, 1)).toBeCloseTo(180, 1)
  })

  it('housingOverrides で住居費を上書きできる', () => {
    const p = profileWith({
      currentAge: 35,
      livingCostAnnual: 0,
      housingCostAnnual: 180, // base value
      homeStatus: 'renter',
    })
    const exp = calculateExpensesForAge(p, 40, 1, {
      homeStatus: 'owner',
      housingCostAnnual: 250,
    })
    // owner → 名目固定なのでインフレなし
    expect(exp).toBeCloseTo(250, 1)
  })

  it('退職後に retireSpendingMultiplier が適用される', () => {
    const p = profileWith({
      currentAge: 35,
      targetRetireAge: 55,
      livingCostAnnual: 360,
      housingCostAnnual: 180,
      homeStatus: 'owner',
      retireSpendingMultiplier: 0.8,
    })
    // 退職前 (age=54): 360+180 = 540
    expect(calculateExpensesForAge(p, 54, 1)).toBeCloseTo(540, 1)
    // 退職後 (age=55): 540 × 0.8 = 432
    expect(calculateExpensesForAge(p, 55, 1)).toBeCloseTo(432, 1)
  })

  it('expense_increase イベント: インフレ調整付きで加算', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'expense_increase', age: 40, amount: 50, duration: 10 }),
    ]
    const p = profileWith({
      currentAge: 35,
      livingCostAnnual: 360,
      housingCostAnnual: 0,
      homeStatus: 'owner',
      lifeEvents: events,
    })
    const inflationFactor = Math.pow(1.02, 5) // 5 years of 2% inflation

    // age=40: 360×inflFactor + 50×inflFactor = (360+50)×inflFactor
    expect(calculateExpensesForAge(p, 40, inflationFactor)).toBeCloseTo(410 * inflationFactor, 1)

    // age=50: 期間終了 → 50は適用されない
    const inflFactor15 = Math.pow(1.02, 15)
    expect(calculateExpensesForAge(p, 50, inflFactor15)).toBeCloseTo(360 * inflFactor15, 1)
  })

  it('expense_decrease イベント: 支出が減る（下限0）', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'expense_decrease', age: 40, amount: 100 }),
    ]
    const p = profileWith({
      currentAge: 35,
      livingCostAnnual: 360,
      housingCostAnnual: 0,
      homeStatus: 'owner',
      lifeEvents: events,
    })
    // age=40: (360-100) = 260
    expect(calculateExpensesForAge(p, 40, 1)).toBeCloseTo(260, 1)
  })

  it('支出が負にならない（下限0）', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'expense_decrease', age: 35, amount: 9999 }),
    ]
    const p = profileWith({
      livingCostAnnual: 100,
      housingCostAnnual: 0,
      homeStatus: 'owner',
      lifeEvents: events,
    })
    expect(calculateExpensesForAge(p, 35, 1)).toBe(0)
  })

  it('relocating ステータス: owner と同じ扱い（インフレなし）', () => {
    const p = profileWith({
      currentAge: 35,
      targetRetireAge: 99, // 退職multiplier の影響を排除
      livingCostAnnual: 0,
      housingCostAnnual: 200,
      homeStatus: 'relocating',
    })
    // 20年後でも固定
    expect(calculateExpensesForAge(p, 55, 1)).toBeCloseTo(200, 1)
  })
})

// ============================================================
// 3. calculateAssetGainForAge
// ============================================================

describe('calculateAssetGainForAge', () => {
  it('asset_gain: 指定年齢でのみ発生する', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'asset_gain', age: 50, amount: 1000 }),
    ]
    expect(calculateAssetGainForAge(events, 49)).toBe(0)
    expect(calculateAssetGainForAge(events, 50)).toBe(1000)
    expect(calculateAssetGainForAge(events, 51)).toBe(0)
  })

  it('複数の asset_gain が合算される', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'asset_gain', age: 50, amount: 1000 }),
      makeEvent({ type: 'asset_gain', age: 50, amount: 500 }),
    ]
    expect(calculateAssetGainForAge(events, 50)).toBe(1500)
  })

  it('他のイベントタイプは無視される', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'income_increase', age: 50, amount: 300 }),
      makeEvent({ type: 'expense_increase', age: 50, amount: 100 }),
      makeEvent({ type: 'asset_gain', age: 50, amount: 1000 }),
    ]
    expect(calculateAssetGainForAge(events, 50)).toBe(1000)
  })

  it('空のイベント配列 → 0', () => {
    expect(calculateAssetGainForAge([], 50)).toBe(0)
  })
})

// ============================================================
// 4. calculateIncomeAdjustment (直接テスト)
// ============================================================

describe('calculateIncomeAdjustment', () => {
  it('income_increase: 対象年齢以降で加算', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'income_increase', age: 40, amount: 300, target: 'self' }),
    ]
    expect(calculateIncomeAdjustment(events, 39, 'self')).toBe(0)
    expect(calculateIncomeAdjustment(events, 40, 'self')).toBe(300)
    expect(calculateIncomeAdjustment(events, 50, 'self')).toBe(300)
  })

  it('income_decrease: 対象年齢以降で減算', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'income_decrease', age: 40, amount: 200, target: 'self' }),
    ]
    expect(calculateIncomeAdjustment(events, 39, 'self')).toBe(0)
    expect(calculateIncomeAdjustment(events, 40, 'self')).toBe(-200)
  })

  it('duration 付き: 期間外で0に戻る', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'income_decrease', age: 40, amount: 200, duration: 5, target: 'self' }),
    ]
    expect(calculateIncomeAdjustment(events, 44, 'self')).toBe(-200) // 40+5-1=44 最後
    expect(calculateIncomeAdjustment(events, 45, 'self')).toBe(0)    // 期間外
  })

  it('duration なし: MAX_AGE まで継続', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'income_increase', age: 40, amount: 100, target: 'self' }),
    ]
    expect(calculateIncomeAdjustment(events, 99, 'self')).toBe(100)
  })

  it('target=partner は self に影響しない', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'income_decrease', age: 40, amount: 200, target: 'partner' }),
    ]
    expect(calculateIncomeAdjustment(events, 40, 'self')).toBe(0)
    expect(calculateIncomeAdjustment(events, 40, 'partner')).toBe(-200)
  })

  it('target 未指定 → self として扱われる', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'income_increase', age: 40, amount: 100 }),
      // target is undefined
    ]
    // target未指定 = 'self' (デフォルト)
    delete (events[0] as Record<string, unknown>).target
    expect(calculateIncomeAdjustment(events, 40, 'self')).toBe(100)
    expect(calculateIncomeAdjustment(events, 40, 'partner')).toBe(0)
  })

  it('複数イベントのスタッキング', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'income_increase', age: 35, amount: 200, target: 'self' }),
      makeEvent({ type: 'income_decrease', age: 40, amount: 100, target: 'self' }),
    ]
    // age=35: +200
    expect(calculateIncomeAdjustment(events, 35, 'self')).toBe(200)
    // age=40: +200 - 100 = +100
    expect(calculateIncomeAdjustment(events, 40, 'self')).toBe(100)
  })
})

// ============================================================
// 5. calculateRentalIncome (直接テスト)
// ============================================================

describe('calculateRentalIncome', () => {
  it('rental_income: 開始年齢から発生', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'rental_income', age: 40, amount: 120 }),
    ]
    expect(calculateRentalIncome(events, 39)).toBe(0)
    expect(calculateRentalIncome(events, 40)).toBe(120)
  })

  it('duration 付き: 期間終了後はゼロ', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'rental_income', age: 40, amount: 120, duration: 10 }),
    ]
    expect(calculateRentalIncome(events, 49)).toBe(120) // 40+10-1=49 最後
    expect(calculateRentalIncome(events, 50)).toBe(0)    // 期間外
  })

  it('duration なし: MAX_AGE まで継続', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'rental_income', age: 40, amount: 120 }),
    ]
    expect(calculateRentalIncome(events, 99)).toBe(120)
  })

  it('他のイベントタイプは無視', () => {
    const events: LifeEvent[] = [
      makeEvent({ type: 'income_increase', age: 40, amount: 300, target: 'self' }),
      makeEvent({ type: 'rental_income', age: 40, amount: 120 }),
    ]
    expect(calculateRentalIncome(events, 40)).toBe(120)
  })
})

// ============================================================
// 6. calculateAnnualPension
// ============================================================

describe('calculateAnnualPension', () => {
  it('solo: 年金額が正の値', () => {
    const p = profileWith({ grossIncome: 1200, targetRetireAge: 60 })
    const pension = calculateAnnualPension(p)
    expect(pension).toBeGreaterThan(0)
  })

  it('couple: solo より年金額が多い', () => {
    const solo = profileWith({ grossIncome: 1200, targetRetireAge: 60 })
    const couple = profileWith({
      mode: 'couple',
      grossIncome: 1200,
      partnerGrossIncome: 600,
      targetRetireAge: 60,
    })
    expect(calculateAnnualPension(couple)).toBeGreaterThan(calculateAnnualPension(solo))
  })

  it('retireAge が低い → 加入年数が短い → 年金が少ない', () => {
    const early = profileWith({ grossIncome: 1200, targetRetireAge: 40 })
    const late = profileWith({ grossIncome: 1200, targetRetireAge: 60 })
    expect(calculateAnnualPension(early)).toBeLessThan(calculateAnnualPension(late))
  })

  it('grossIncome 0 → 年金 0', () => {
    const p = profileWith({ grossIncome: 0, rsuAnnual: 0 })
    expect(calculateAnnualPension(p)).toBe(0)
  })
})

// ============================================================
// 7. calculateEffectiveTaxRate / getEstimatedTaxRates
// ============================================================

describe('calculateEffectiveTaxRate', () => {
  it('grossIncome 0 → 0%', () => {
    expect(calculateEffectiveTaxRate(0)).toBe(0)
  })

  it('年収800万: 税率 20-35% の範囲', () => {
    const rate = calculateEffectiveTaxRate(800)
    expect(rate).toBeGreaterThan(20)
    expect(rate).toBeLessThan(35)
  })

  it('年収1200万: 税率 25-40% の範囲', () => {
    const rate = calculateEffectiveTaxRate(1200)
    expect(rate).toBeGreaterThan(25)
    expect(rate).toBeLessThan(40)
  })

  it('年収が高いほど税率が高い（累進性）', () => {
    const rate800 = calculateEffectiveTaxRate(800)
    const rate1200 = calculateEffectiveTaxRate(1200)
    const rate2000 = calculateEffectiveTaxRate(2000)
    expect(rate800).toBeLessThan(rate1200)
    expect(rate1200).toBeLessThan(rate2000)
  })
})

describe('getEstimatedTaxRates', () => {
  it('useAutoTaxRate=false → 手動値をそのまま返す', () => {
    const p = profileWith({ useAutoTaxRate: false, effectiveTaxRate: 30 })
    const rates = getEstimatedTaxRates(p)
    expect(rates.main).toBe(30)
    expect(rates.partner).toBe(30)
    expect(rates.combined).toBe(30)
  })

  it('useAutoTaxRate=true, solo → main = combined', () => {
    const p = profileWith({
      useAutoTaxRate: true,
      grossIncome: 1200,
      partnerGrossIncome: 0,
    })
    const rates = getEstimatedTaxRates(p)
    expect(rates.main).toBeGreaterThan(0)
    expect(rates.partner).toBe(0)
    expect(rates.combined).toBeCloseTo(rates.main, 5)
  })

  it('couple: combined は main と partner の加重平均', () => {
    const p = profileWith({
      mode: 'couple',
      useAutoTaxRate: true,
      grossIncome: 1600,
      partnerGrossIncome: 800,
    })
    const rates = getEstimatedTaxRates(p)
    const expectedCombined = (1600 * rates.main + 800 * rates.partner) / 2400
    expect(rates.combined).toBeCloseTo(expectedCombined, 5)
  })
})

// ============================================================
// 8. engine / housing-sim 整合性 (Step 2 不整合の再発防止)
// ============================================================

describe('engine / housing-sim 整合性 (calc-core 経由)', () => {
  describe('Step2 解消済み不整合の再発防止', () => {
    it('不整合1: 税率は個人別に適用される (couple)', () => {
      // Step2 以前: housing-sim は合算税率を使っていた
      // Step2 以降: 両者とも calc-core の calculateNetIncomeForAge を使う
      const p = profileWith({
        mode: 'couple',
        grossIncome: 2000,
        partnerGrossIncome: 400,
        useAutoTaxRate: true,
      })
      const net = calculateNetIncomeForAge(p, 35)

      // 個人別税率で計算した期待値
      const mainRate = calculateEffectiveTaxRate(2000)
      const partnerRate = calculateEffectiveTaxRate(400)
      const expected = 2000 * (1 - mainRate / 100) + 400 * (1 - partnerRate / 100)
      expect(net).toBeCloseTo(expected, 1)

      // 合算税率とは異なることを確認
      const combinedRate = calculateEffectiveTaxRate(2400)
      const wrongResult = 2400 * (1 - combinedRate / 100)
      expect(Math.abs(net - wrongResult)).toBeGreaterThan(1) // 累進課税なので差が出る
    })

    it('不整合2: rental_income は calc-core で一元計算', () => {
      // Step2 以前: housing-sim は独自に rental income を計算していた
      const events: LifeEvent[] = [
        makeEvent({ type: 'rental_income', age: 40, amount: 120, duration: 10 }),
      ]
      // calc-core の calculateRentalIncome を直接テスト
      expect(calculateRentalIncome(events, 40)).toBe(120)
      expect(calculateRentalIncome(events, 49)).toBe(120) // 最後の年
      expect(calculateRentalIncome(events, 50)).toBe(0)   // 期間外

      // calculateNetIncomeForAge にも反映される
      const p = profileWith({
        targetRetireAge: 60,
        postRetireIncome: 0,
        retirePassiveIncome: 0,
        grossIncome: 0,
        lifeEvents: events,
      })
      // 退職後(age<65): rental only
      // Note: grossIncome=0 だと退職前でも手取り=rental only
      expect(calculateNetIncomeForAge(p, 40)).toBeCloseTo(120, 1)
    })

    it('不整合3: income_decrease の target=partner が正しく分離', () => {
      // Step2 以前: housing-sim は target 区分なく適用していた
      const events: LifeEvent[] = [
        makeEvent({ type: 'income_decrease', age: 40, amount: 300, target: 'partner' }),
      ]

      // self には影響しない
      expect(calculateIncomeAdjustment(events, 40, 'self')).toBe(0)
      // partner のみに影響
      expect(calculateIncomeAdjustment(events, 40, 'partner')).toBe(-300)
    })

    it('不整合4: expense イベントにインフレ調整が適用される', () => {
      // Step2 以前: housing-sim はインフレ調整なしで expense イベントを適用
      const events: LifeEvent[] = [
        makeEvent({ type: 'expense_increase', age: 35, amount: 100 }),
      ]
      const p = profileWith({
        currentAge: 35,
        livingCostAnnual: 0,
        housingCostAnnual: 0,
        homeStatus: 'owner',
        lifeEvents: events,
      })

      const inflationFactor = Math.pow(1.02, 10) // 10年後
      const exp = calculateExpensesForAge(p, 45, inflationFactor)
      // expense_increase もインフレ補正される
      expect(exp).toBeCloseTo(100 * inflationFactor, 1)

      // インフレなしの場合と比較
      const expNoInflation = calculateExpensesForAge(p, 45, 1)
      expect(expNoInflation).toBeCloseTo(100, 1)
      expect(exp).toBeGreaterThan(expNoInflation)
    })
  })

  describe('複合シナリオ: 同一プロファイルで各関数が整合する', () => {
    const testCases = [
      {
        name: '基本ケース: solo, 35歳, 年収800万',
        profile: profileWith({
          mode: 'solo',
          currentAge: 35,
          grossIncome: 800,
          livingCostAnnual: 300,
          housingCostAnnual: 120,
          homeStatus: 'renter',
          targetRetireAge: 60,
          retireSpendingMultiplier: 0.8,
        }),
        events: [] as LifeEvent[],
        checkAges: [35, 45, 55, 60, 65, 75],
      },
      {
        name: 'couple, 35歳, 世帯年収2400万, ペースダウンあり',
        profile: profileWith({
          mode: 'couple',
          currentAge: 35,
          grossIncome: 1600,
          partnerGrossIncome: 800,
          livingCostAnnual: 480,
          housingCostAnnual: 200,
          homeStatus: 'renter',
          targetRetireAge: 55,
        }),
        events: [
          makeEvent({ type: 'income_decrease', age: 40, amount: 400, target: 'self' }),
        ],
        checkAges: [35, 40, 45, 55, 65],
      },
      {
        name: 'postRetireIncome + rental_income',
        profile: profileWith({
          mode: 'solo',
          currentAge: 35,
          grossIncome: 1000,
          targetRetireAge: 50,
          postRetireIncome: 200,
          postRetireIncomeEndAge: 60,
          retirePassiveIncome: 50,
        }),
        events: [
          makeEvent({ type: 'rental_income', age: 35, amount: 120 }),
        ],
        checkAges: [35, 49, 50, 55, 60, 61, 65],
      },
    ]

    for (const tc of testCases) {
      it(`${tc.name}: 全チェック年齢で値が有限かつ非負`, () => {
        const p = { ...tc.profile, lifeEvents: [...tc.profile.lifeEvents, ...tc.events] }

        for (const age of tc.checkAges) {
          const yearsElapsed = age - p.currentAge
          const inflationFactor = Math.pow(1 + p.inflationRate / 100, yearsElapsed)

          const income = calculateNetIncomeForAge(p, age)
          const expenses = calculateExpensesForAge(p, age, inflationFactor)
          const assetGain = calculateAssetGainForAge(p.lifeEvents, age)

          // 全て有限な数値
          expect(Number.isFinite(income)).toBe(true)
          expect(Number.isFinite(expenses)).toBe(true)
          expect(Number.isFinite(assetGain)).toBe(true)

          // 支出は非負（calc-coreが保証）
          expect(expenses).toBeGreaterThanOrEqual(0)
          // 資産イベントは非負
          expect(assetGain).toBeGreaterThanOrEqual(0)
          // 収入は退職後も非負（年金・事業収入・賃貸収入があるか、ゼロ）
          expect(income).toBeGreaterThanOrEqual(0)
        }
      })
    }

    it('退職境界: retireAge-1 は就労中、retireAge は退職後', () => {
      const p = profileWith({
        grossIncome: 1200,
        targetRetireAge: 55,
        useAutoTaxRate: false,
        effectiveTaxRate: 30,
        postRetireIncome: 0,
        retirePassiveIncome: 0,
      })

      const incomeBeforeRetire = calculateNetIncomeForAge(p, 54)
      const incomeAfterRetire = calculateNetIncomeForAge(p, 55)

      // 退職前: 1200×0.7 = 840
      expect(incomeBeforeRetire).toBeCloseTo(840, 1)
      // 退職後: 年金なし(age<65), 事業収入なし → 0
      expect(incomeAfterRetire).toBe(0)
    })

    it('年金開始境界: 64歳は年金なし、65歳は年金あり', () => {
      const p = profileWith({
        grossIncome: 1200,
        targetRetireAge: 55,
        postRetireIncome: 0,
        retirePassiveIncome: 0,
      })

      const income64 = calculateNetIncomeForAge(p, 64)
      const income65 = calculateNetIncomeForAge(p, 65)

      expect(income64).toBe(0)
      expect(income65).toBeGreaterThan(0)
    })

    it('expense の退職境界: multiplier はちょうど retireAge から適用', () => {
      const p = profileWith({
        currentAge: 35,
        targetRetireAge: 55,
        livingCostAnnual: 400,
        housingCostAnnual: 0,
        homeStatus: 'owner',
        retireSpendingMultiplier: 0.7,
      })

      const exp54 = calculateExpensesForAge(p, 54, 1)
      const exp55 = calculateExpensesForAge(p, 55, 1)

      expect(exp54).toBeCloseTo(400, 1)
      expect(exp55).toBeCloseTo(400 * 0.7, 1)
    })
  })
})

// ============================================================
// 9. MAX_AGE 定数
// ============================================================

describe('MAX_AGE', () => {
  it('MAX_AGE は 100', () => {
    expect(MAX_AGE).toBe(100)
  })
})
