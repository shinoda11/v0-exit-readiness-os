import { chromium, Page } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE = 'https://yohack.jp';
const DIR = './screenshots-onboarding';
const LOG: string[] = [];
let n = 0;

function log(s: string) { console.log(s); LOG.push(s); }

async function shot(p: Page, name: string, full = false) {
  n++;
  await p.screenshot({ path: join(DIR, `${String(n).padStart(2,'0')}-${name}.png`), fullPage: full });
  log(`📸 ${n}: ${name}${full ? ' (full)' : ''}`);
}

async function run() {
  mkdirSync(DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  // ========== モバイル (375×812) ==========
  log('\n=== モバイル初回ユーザー (375×812) ===\n');
  const mCtx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
    locale: 'ja-JP',
    httpCredentials: { username: 'user', password: 'yohack2025' },
  });
  const m = await mCtx.newPage();
  const errors: string[] = [];
  m.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  // LP
  log('--- LP ---');
  await m.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await shot(m, 'lp-hero');
  await shot(m, 'lp-full', true);

  // FitGate
  log('--- FitGate ---');
  await m.goto(`${BASE}/fit`, { waitUntil: 'networkidle', timeout: 30000 });
  await m.waitForTimeout(1000);
  await shot(m, 'fitgate');
  await shot(m, 'fitgate-full', true);

  // ダッシュボード初回
  log('--- ダッシュボード初回 ---');
  await m.goto(`${BASE}/app`, { waitUntil: 'networkidle', timeout: 30000 });
  await m.evaluate(() => localStorage.clear());
  await m.reload({ waitUntil: 'networkidle' });
  await m.waitForTimeout(2000);
  await shot(m, 'dash-firstvisit');

  // WelcomeDialog - use specific dialog content selector
  const dlg = await m.$('[role="dialog"]');
  if (dlg) {
    log('✅ WelcomeDialog あり');
    await shot(m, 'welcome-dialog');

    // Step 0 → click 「はじめる」
    const startBtn = await m.$('[role="dialog"] button:has-text("はじめる")');
    if (startBtn) {
      log('  ボタン: "はじめる"');
      await startBtn.click();
      await m.waitForTimeout(800);
      await shot(m, 'welcome-step1');
    }

    // Step 1 → click 「次へ」
    const next1 = await m.$('[role="dialog"] button:has-text("次へ")');
    if (next1) {
      log('  ボタン: "次へ" (Step 1→2)');
      await next1.click();
      await m.waitForTimeout(800);
      await shot(m, 'welcome-step2');
    }

    // Step 2 → click 「次へ」
    const next2 = await m.$('[role="dialog"] button:has-text("次へ")');
    if (next2) {
      log('  ボタン: "次へ" (Step 2→3)');
      await next2.click();
      await m.waitForTimeout(800);
      await shot(m, 'welcome-step3');
    }

    // Step 3 → click 「結果を見る」
    const completeBtn = await m.$('[role="dialog"] button:has-text("結果を見る")');
    if (completeBtn) {
      log('  ボタン: "結果を見る"');
      await completeBtn.click();
      await m.waitForTimeout(2000); // Wait for simulation
      await shot(m, 'welcome-complete');
    }
  } else {
    log('❌ WelcomeDialog なし');
  }

  // BrandStoryDialog が出る場合は閉じる
  const brandDlg = await m.$('[role="dialog"]');
  if (brandDlg) {
    log('✅ BrandStoryDialog あり — 閉じる');
    await shot(m, 'brand-story-dialog');
    // Close via overlay click or close button
    const closeBtn = await m.$('[role="dialog"] button:has-text("閉じる"), [role="dialog"] [data-slot="dialog-close"]');
    if (closeBtn) {
      await closeBtn.click({ force: true });
      await m.waitForTimeout(500);
    } else {
      // Press Escape to close
      await m.keyboard.press('Escape');
      await m.waitForTimeout(500);
    }
  }

  await shot(m, 'dash-afterwelcome');
  await shot(m, 'dash-afterwelcome-full', true);

  // ページ状態を取得
  const state = await m.evaluate(() => {
    const keys = Object.keys(localStorage);
    const pk = keys.find(k => k.includes('profile') || k.includes('store'));
    const pd = pk ? localStorage.getItem(pk) : null;
    const headings = Array.from(document.querySelectorAll('h1,h2,h3')).map(h => h.textContent?.trim());
    const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
      type: i.type, value: i.value, placeholder: i.placeholder,
      label: i.closest('label')?.textContent?.trim() || i.getAttribute('aria-label') || '',
    }));
    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean);
    return {
      keys, profile: pd ? JSON.parse(pd) : null, headings, inputs: inputs.slice(0, 20), buttons: buttons.slice(0, 25),
      hasScore: !!document.querySelector('[class*="score"],[class*="Score"]'),
      hasChart: !!document.querySelector('svg.recharts-surface, canvas'),
      hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      pageW: document.documentElement.scrollWidth, vpW: document.documentElement.clientWidth,
    };
  });
  log(`\n📊 状態:`);
  log(`  localStorage: ${JSON.stringify(state.keys)}`);
  log(`  見出し: ${JSON.stringify(state.headings)}`);
  log(`  入力数: ${state.inputs.length}`);
  log(`  入力値: ${JSON.stringify(state.inputs, null, 2)}`);
  log(`  ボタン: ${JSON.stringify(state.buttons)}`);
  log(`  スコア: ${state.hasScore}, チャート: ${state.hasChart}`);
  log(`  横スクロール: ${state.hScroll} (${state.pageW}/${state.vpW})`);
  if (state.profile) log(`  プロファイル: ${JSON.stringify(state.profile).slice(0, 500)}`);

  // モバイルタブ
  for (const label of ['入力', '結果']) {
    const tab = await m.$(`button:has-text("${label}")`);
    if (tab) {
      log(`✅ タブ「${label}」あり`);
      await tab.click({ force: true });
      await m.waitForTimeout(1000);
      await shot(m, `dash-tab-${label === '入力' ? 'input' : 'result'}`);
      await shot(m, `dash-tab-${label === '入力' ? 'input' : 'result'}-full`, true);
    } else {
      log(`❌ タブ「${label}」なし`);
    }
  }

  // 分岐ビルダー
  log('--- 分岐ビルダー ---');
  await m.goto(`${BASE}/app/branch`, { waitUntil: 'networkidle', timeout: 30000 });
  await m.waitForTimeout(1000);
  await shot(m, 'branch');
  await shot(m, 'branch-full', true);

  // 世界線比較
  log('--- 世界線比較 ---');
  await m.goto(`${BASE}/app/worldline`, { waitUntil: 'networkidle', timeout: 30000 });
  await m.waitForTimeout(1000);
  await shot(m, 'worldline');
  await shot(m, 'worldline-full', true);

  // ナビ
  const nav = await m.evaluate(() => {
    const els = document.querySelectorAll('nav a, [role="navigation"] a');
    return Array.from(els).map(a => ({
      text: (a as HTMLAnchorElement).textContent?.trim(),
      href: (a as HTMLAnchorElement).getAttribute('href'),
    }));
  });
  log(`ナビ: ${JSON.stringify(nav)}`);

  await mCtx.close();

  // ========== デスクトップ (1280×800) ==========
  log('\n=== デスクトップ (1280×800) ===\n');
  const dCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'ja-JP',
    httpCredentials: { username: 'user', password: 'yohack2025' },
  });
  const d = await dCtx.newPage();

  await d.goto(`${BASE}/app`, { waitUntil: 'networkidle', timeout: 30000 });
  await d.evaluate(() => localStorage.clear());
  await d.reload({ waitUntil: 'networkidle' });
  await d.waitForTimeout(2000);

  // WelcomeDialog dismiss (click through all steps)
  const dDlg = await d.$('[role="dialog"]');
  if (dDlg) {
    log('✅ デスクトップ WelcomeDialog あり');
    await shot(d, 'desktop-welcome');

    for (const btnText of ['はじめる', '次へ', '次へ', '結果を見る']) {
      const btn = await d.$(`[role="dialog"] button:has-text("${btnText}")`);
      if (btn) {
        await btn.click();
        await d.waitForTimeout(800);
      }
    }
    await d.waitForTimeout(1500); // Wait for simulation
  }

  await shot(d, 'desktop-dash');
  await shot(d, 'desktop-dash-full', true);

  await d.goto(`${BASE}/app/branch`, { waitUntil: 'networkidle', timeout: 30000 });
  await d.waitForTimeout(1000);
  await shot(d, 'desktop-branch');
  await shot(d, 'desktop-branch-full', true);

  await d.goto(`${BASE}/app/worldline`, { waitUntil: 'networkidle', timeout: 30000 });
  await d.waitForTimeout(1000);
  await shot(d, 'desktop-worldline');
  await shot(d, 'desktop-worldline-full', true);

  // プロファイル
  await d.goto(`${BASE}/app/profile`, { waitUntil: 'networkidle', timeout: 30000 });
  await d.waitForTimeout(1000);
  await shot(d, 'desktop-profile');
  await shot(d, 'desktop-profile-full', true);

  // サイドバー
  let sidebar: any[] = [];
  try {
    sidebar = await d.$$eval('aside a, [class*="sidebar"] a, [class*="Sidebar"] a', ls =>
      ls.map(l => ({ text: l.textContent?.trim(), href: l.getAttribute('href') }))
    );
  } catch { /* no sidebar links */ }
  log(`サイドバー: ${JSON.stringify(sidebar)}`);

  await dCtx.close();

  // ========== レポート ==========
  log('\n=== SUMMARY ===');
  log(`コンソールエラー: ${errors.length}件`);
  errors.forEach(e => log(`  ❌ ${e}`));
  log(`スクリーンショット: ${n}枚 → ${DIR}/`);

  writeFileSync(join(DIR, 'REPORT.txt'), LOG.join('\n'));
  log(`レポート: ${DIR}/REPORT.txt`);

  await browser.close();
}

run().catch(e => { console.error('Fatal:', e); process.exit(1); });
