import { chromium, Page } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const BASE = 'https://yohack.jp';
const DIR = './screenshots-a04';

async function shot(p: Page, name: string) {
  await p.screenshot({ path: join(DIR, name) });
  console.log(`📸 ${name}`);
}

async function run() {
  mkdirSync(DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    locale: 'ja-JP',
    httpCredentials: { username: 'user', password: 'yohack2025' },
  });
  const page = await ctx.newPage();

  // Skip onboarding: set localStorage before navigating
  await page.goto(BASE + '/app', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('yohack-onboarding-complete', 'complete');
    localStorage.setItem('yohack-profile-edited', '1');
    localStorage.setItem('yohack-brand-story-seen', '1');
  });

  // Navigate to dashboard
  await page.goto(BASE + '/app', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // Ensure mobile input tab is active
  const inputTab = page.locator('button:has-text("入力")');
  if (await inputTab.isVisible()) {
    await inputTab.click();
    await page.waitForTimeout(500);
  }

  // === 1. Mobile scroll screenshots ===
  console.log('\n=== 1. Mobile input tab screenshots ===\n');

  // 01: Top — ProfileSummaryCard + IncomeCard
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await shot(page, '01-mobile-top.png');

  // 02: Mid — RetirementCard + ExpenseCard
  // Find retirement card heading and scroll to it
  const retirementCard = page.locator('text=リタイア設計').first();
  if (await retirementCard.isVisible()) {
    await retirementCard.scrollIntoViewIfNeeded();
  } else {
    await page.evaluate(() => window.scrollBy(0, 600));
  }
  await page.waitForTimeout(300);
  await shot(page, '02-mobile-mid.png');

  // 03: Bottom — InvestmentCard + HousingPlanCard
  const housingCard = page.locator('text=住宅プラン').first();
  if (await housingCard.isVisible()) {
    await housingCard.scrollIntoViewIfNeeded();
  } else {
    await page.evaluate(() => window.scrollBy(0, 600));
  }
  await page.waitForTimeout(300);
  await shot(page, '03-mobile-bottom.png');

  // === 2. Rent inline edit ===
  console.log('\n=== 2. Rent inline edit ===\n');

  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  // 04: Before edit — find rent button
  const rentButton = page.locator('button:has-text("月")').filter({ hasText: '万' }).first();
  console.log('Rent button found:', await rentButton.isVisible());
  await shot(page, '04-rent-before.png');

  // Click to enter editing
  await rentButton.click();
  await page.waitForTimeout(300);
  await shot(page, '05-rent-editing.png');

  // Change value
  const rentInput = page.locator('input[type="number"]').first();
  await rentInput.fill('20');
  await rentInput.press('Enter');
  await page.waitForTimeout(500);
  await shot(page, '06-rent-after.png');

  // === 3. Couple mode ===
  console.log('\n=== 3. Couple mode ===\n');

  // Switch to couple mode via localStorage store update
  await page.evaluate(() => {
    const raw = localStorage.getItem('exit-readiness-profile');
    if (raw) {
      const data = JSON.parse(raw);
      if (data.state?.profile) {
        data.state.profile.mode = 'couple';
        data.state.profile.partnerGrossIncome = 400;
        localStorage.setItem('exit-readiness-profile', JSON.stringify(data));
      }
    }
  });

  // Reload dashboard to pick up the change
  await page.goto(BASE + '/app', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500);

  // Ensure input tab
  const inputTab2 = page.locator('button:has-text("入力")');
  if (await inputTab2.isVisible()) {
    await inputTab2.click();
    await page.waitForTimeout(500);
  }

  // 08: ProfileSummaryCard — should show partner income
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const summaryHasPartner = await page.locator('dt:has-text("パートナー年収")').count();
  console.log(`ProfileSummaryCard "パートナー年収" count: ${summaryHasPartner}`);
  await shot(page, '08-couple-summary.png');

  // 07: IncomeCard — expand it and check no partner income inside
  // Click on the 収入 collapsible header to expand
  const incomeToggle = page.locator('button:has-text("収入")').first();
  await incomeToggle.click();
  await page.waitForTimeout(500);

  // Check for partner income label INSIDE IncomeCard content (not in ProfileSummaryCard)
  // IncomeCard should only have "年収" and "副業収入" labels
  const allLabels = await page.locator('[class*="CardContent"] label, [class*="CardContent"] [class*="label"]').allTextContents();
  console.log('IncomeCard visible labels:', allLabels.filter(l => l.trim()));
  const hasPartnerInIncome = allLabels.some(l => l.includes('パートナー'));
  console.log(`Partner field in IncomeCard: ${hasPartnerInIncome ? '❌ STILL SHOWN' : '✅ REMOVED'}`);

  await incomeToggle.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shot(page, '07-couple-income.png');

  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Screenshots: 8 → ${DIR}/`);
  console.log(`Partner income in IncomeCard: ${hasPartnerInIncome ? '❌ STILL SHOWN' : '✅ REMOVED'}`);
  console.log(`Partner income in ProfileSummary: ${summaryHasPartner > 0 ? '✅ SHOWN' : '❌ MISSING'}`);

  await browser.close();
}

run().catch(console.error);
