/**
 * WeekFlow Demo Recorder — Reel 30s
 * Roteiro:
 *  0-3s   Landing page abrindo
 *  3-8s   Dashboard + scroll semana
 *  8-13s  Planner semanal com tarefas
 * 13-18s  Add Task modal (digitando)
 * 18-23s  FlowCircle com membros
 * 23-28s  AI Chat respondendo
 * 28-30s  Dashboard final / logo
 */

const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE_URL = 'http://localhost:5175'
const OUT_DIR = path.join(__dirname, '..', 'demo-video')

const sleep = ms => new Promise(r => setTimeout(r, ms))

const typeSlowly = async (locator, text, delay = 55) => {
  for (const char of text) {
    await locator.type(char)
    await sleep(delay)
  }
}

// Navigate via window.__navigate exposed by AppContext
const goTo = async (page, route) => {
  await page.evaluate(r => window.__navigate && window.__navigate(r), route)
  await sleep(800)
}

;(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({
    headless: false,
    args: ['--window-size=1280,720', '--window-position=0,0', '--start-maximized'],
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 720 } },
  })

  const page = await context.newPage()

  // Supress dialog popups
  page.on('dialog', d => d.dismiss().catch(() => {}))

  console.log('🎬 Gravando...')

  // ── CENA 1: Landing page (0-3s) ───────────────────────────────────────────
  console.log('📍 1/7 Landing page')
  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle')
  await sleep(2500)

  // ── CENA 2: Login demo → Dashboard (3-5s) ─────────────────────────────────
  console.log('📍 2/7 Demo login')
  await page.evaluate(() => localStorage.setItem('wf_tour_done', 'true'))
  await page.waitForFunction(() => typeof window.__loginDemo === 'function', { timeout: 8000 })
  await page.evaluate(() => window.__loginDemo())
  await sleep(1200)

  // Esconde tour se aparecer (CSS seguro — não quebra React)
  await page.addStyleTag({ content: `
    [class*="z-[150]"], [class*="z-[200]"] { display: none !important; }
  `})

  // Clica em Skip tour se aparecer
  await page.locator('button:has-text("Skip"), button:has-text("Skip tour")').first()
    .click({ timeout: 1500 }).catch(() => {})
  await sleep(600)

  // ── CENA 3: Dashboard — stats cards (5-8s) ────────────────────────────────
  console.log('📍 3/7 Dashboard')
  // Ensure on dashboard
  await page.evaluate(() => window.__navigate && window.__navigate('dashboard'))
  await sleep(1000)
  // Scroll down slowly to show week overview
  await page.mouse.wheel(0, 300)
  await sleep(700)
  await page.mouse.wheel(0, 300)
  await sleep(700)
  await page.mouse.wheel(0, -600)
  await sleep(600)

  // ── CENA 4: Planner semanal (8-13s) ───────────────────────────────────────
  console.log('📍 4/7 Planner')
  await page.evaluate(() => window.__navigate && window.__navigate('planner'))
  await sleep(1200)
  // Scroll to show tasks across days
  await page.mouse.wheel(0, 250)
  await sleep(600)
  await page.mouse.wheel(0, 250)
  await sleep(600)
  await page.mouse.wheel(0, -500)
  await sleep(700)

  // ── CENA 5: Add Task modal (13-18s) ───────────────────────────────────────
  console.log('📍 5/7 Add task')
  // Hide tour overlay again after navigation
  await page.addStyleTag({ content: '[class*="z-[150]"] { display: none !important; }' })
  await sleep(200)

  const addBtn = page.locator('[data-tour="add-task"]').first()
  await addBtn.click({ force: true, timeout: 5000 }).catch(async () => {
    // Fallback: trigger via keyboard shortcut
    await page.keyboard.press('Control+k')
  })
  await sleep(700)

  // Type task name
  const taskInput = page.locator('input[placeholder*="arefa"], input[placeholder*="ask"]').first()
  if (await taskInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await taskInput.click()
    await typeSlowly(taskInput, 'Reunião com cliente')
    await sleep(800)
  }

  // Close modal
  await page.keyboard.press('Escape')
  await sleep(600)

  // ── CENA 6: FlowCircle (18-23s) ───────────────────────────────────────────
  console.log('📍 6/7 FlowCircle')
  await page.evaluate(() => window.__navigate && window.__navigate('flowcircle'))
  await sleep(2500)

  // ── CENA 7: AI Chat (23-28s) ──────────────────────────────────────────────
  console.log('📍 7/7 AI Chat')
  await page.evaluate(() => window.__navigate && window.__navigate('dashboard'))
  await sleep(700)

  const aiBtn = page.locator('[data-tour="ai-btn"]').first()
  if (await aiBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await aiBtn.click()
    await sleep(1000)
    const chatInput = page.locator('textarea').last()
    if (await chatInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await chatInput.click()
      await typeSlowly(chatInput, 'Organize minha semana')
      await sleep(1500)
    }
    // Close chat
    await page.keyboard.press('Escape')
    await sleep(400)
  }

  // ── CENA FINAL: Dashboard + logo (28-30s) ─────────────────────────────────
  console.log('📍 Cena final')
  await page.evaluate(() => window.__navigate && window.__navigate('dashboard'))
  await sleep(2500)

  // ── Finalizar ──────────────────────────────────────────────────────────────
  console.log('✅ Encerrando...')
  await context.close()
  await browser.close()

  await sleep(1200)
  const files = fs.readdirSync(OUT_DIR)
    .filter(f => f.endsWith('.webm') && !f.startsWith('weekflow-reel'))
  const allWebm = fs.readdirSync(OUT_DIR)
    .filter(f => f.endsWith('.webm'))
    .map(f => ({ f, t: fs.statSync(path.join(OUT_DIR, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)

  if (allWebm.length > 0) {
    const latest = allWebm[0].f
    const newName = `weekflow-reel-v3-${Date.now()}.webm`
    if (latest !== newName) {
      fs.renameSync(path.join(OUT_DIR, latest), path.join(OUT_DIR, newName))
    }
    console.log(`\n🎥 Vídeo: demo-video/${newName}`)
    console.log(`📝 MP4: ffmpeg -i "demo-video/${newName}" -c:v libx264 -crf 18 "demo-video/weekflow-reel-v3.mp4"`)
  }
})()
