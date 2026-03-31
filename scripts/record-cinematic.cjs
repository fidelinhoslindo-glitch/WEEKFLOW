/**
 * WeekFlow Cinematic Reel Recorder
 * "A semana que quase me destruiu"
 *
 * Scenes (total ~30s):
 *   Scene 1  (4s): Landing page / app loading
 *   Scene 2  (3s): Chaos — dense task list in planner
 *   Scene 3  (2s): Transition — navigate to dashboard
 *   Scene 4  (4s): Dashboard — slow scroll, full week overview
 *   Scene 5  (4s): Planner — week planner with tasks organized
 *   Scene 6  (3s): AI Chat — type "Organize minha semana"
 *   Scene 7  (3s): FlowCircle
 *   Scene 8  (3s): Pomodoro — click start
 *   Scene 9  (4s): Analytics — pause on stats
 *   Scene 10 (2s): Back to dashboard — completion stats
 */

const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE_URL = 'http://localhost:5175'
const OUT_DIR = path.join(__dirname, '..', 'demo-video')

const sleep = ms => new Promise(r => setTimeout(r, ms))

const typeSlowly = async (locator, text, delay = 80) => {
  for (const char of text) {
    await locator.type(char)
    await sleep(delay)
  }
}

const nav = async (page, route) => {
  await page.evaluate(r => window.__navigate && window.__navigate(r), route)
  await sleep(1000)
}

const hideTour = async (page) => {
  await page.addStyleTag({ content: '[class*="z-[150]"],[class*="z-[200]"]{display:none!important}' })
  await page.locator('button:has-text("Skip"), button:has-text("Skip tour")').first().click({ timeout: 600 }).catch(() => {})
}

;(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({
    headless: false,
    args: ['--window-size=1280,720', '--window-position=0,0'],
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 720 } },
  })

  const page = await context.newPage()
  page.on('dialog', d => d.dismiss().catch(() => {}))

  console.log('🎬 Gravando reel cinematográfico...')

  // ── SCENE 1 (4s): Black screen / app loading ────────────────────────────────
  console.log('🎞  Scene 1 — Landing page / carregando')
  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle')
  await sleep(4000)

  // ── LOGIN DEMO (antes das cenas do app) ─────────────────────────────────────
  console.log('🔑 Login demo')
  await page.evaluate(() => localStorage.setItem('wf_tour_done', 'true'))
  await page.waitForFunction(() => typeof window.__loginDemo === 'function', { timeout: 8000 })
  await page.evaluate(() => window.__loginDemo())
  await sleep(1500)
  await hideTour(page)

  // ── SCENE 2 (3s): Chaos — dense task list / planner ─────────────────────────
  console.log('🎞  Scene 2 — Chaos')
  await nav(page, 'planner')
  await hideTour(page)
  // Scroll rápido para transmitir caos / overload
  await page.mouse.wheel(0, 600)
  await sleep(300)
  await page.mouse.wheel(0, 600)
  await sleep(300)
  await page.mouse.wheel(0, -400)
  await sleep(300)
  await page.mouse.wheel(0, 600)
  await sleep(400)
  await page.mouse.wheel(0, -600)
  await sleep(700)

  // ── SCENE 3 (2s): Transition — navigate to dashboard ────────────────────────
  console.log('🎞  Scene 3 — Transição para dashboard')
  await nav(page, 'dashboard')
  await sleep(2000)

  // ── SCENE 4 (4s): Dashboard — slow scroll, full week overview ───────────────
  console.log('🎞  Scene 4 — Dashboard')
  await hideTour(page)
  await page.mouse.wheel(0, 250)
  await sleep(800)
  await page.mouse.wheel(0, 250)
  await sleep(800)
  await page.mouse.wheel(0, 250)
  await sleep(800)
  await page.mouse.wheel(0, -750)
  await sleep(600)

  // ── SCENE 5 (4s): Planner — week with tasks organized ───────────────────────
  console.log('🎞  Scene 5 — Planner organizado')
  await nav(page, 'planner')
  await hideTour(page)
  await page.mouse.wheel(0, 300)
  await sleep(700)
  await page.mouse.wheel(0, 300)
  await sleep(700)
  await page.mouse.wheel(0, -600)
  await sleep(600)
  // Mostra uma tarefa — clica mas não abre modal, só hover
  const taskCard = page.locator('.cursor-pointer, [class*="task"]').first()
  if (await taskCard.isVisible({ timeout: 800 }).catch(() => false)) {
    await taskCard.hover()
    await sleep(700)
  }

  // ── SCENE 6 (3s): AI Chat — type slowly ─────────────────────────────────────
  console.log('🎞  Scene 6 — AI Chat')
  await nav(page, 'ai-chat')
  await hideTour(page)
  await sleep(600)
  // Tenta localizar o input de chat
  const chatInput = page.locator('textarea, input[placeholder*="essage"], input[placeholder*="ype"]').last()
  if (await chatInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await chatInput.click()
    await typeSlowly(chatInput, 'Organize minha semana', 90)
    await sleep(800)
    // Não envia — só mostra o texto sendo digitado (evita esperar resposta IA)
  } else {
    // Fallback: tenta abrir AI via botão no dashboard
    await nav(page, 'dashboard')
    await sleep(500)
    const aiChatBtn = page.locator('[data-tour="ai-btn"]').first()
    if (await aiChatBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await aiChatBtn.click()
      await sleep(600)
      const fallbackInput = page.locator('textarea').last()
      if (await fallbackInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await fallbackInput.click()
        await typeSlowly(fallbackInput, 'Organize minha semana', 90)
        await sleep(600)
      }
      await page.keyboard.press('Escape')
    } else {
      await sleep(2400)
    }
  }

  // ── SCENE 7 (3s): FlowCircle ─────────────────────────────────────────────────
  console.log('🎞  Scene 7 — FlowCircle')
  await nav(page, 'circles')
  await hideTour(page)
  await sleep(800)
  await page.mouse.wheel(0, 300)
  await sleep(800)
  await page.mouse.wheel(0, -300)
  await sleep(600)

  // ── SCENE 8 (3s): Pomodoro — click start ────────────────────────────────────
  console.log('🎞  Scene 8 — Pomodoro')
  await nav(page, 'pomodoro')
  await hideTour(page)
  await sleep(500)
  const startBtn = page.locator('button:has-text("Start"), button:has-text("Iniciar"), button[aria-label*="start"]').first()
  if (await startBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await startBtn.click()
    await sleep(2000)
    // Para o timer para não interferir
    const stopBtn = page.locator('button:has-text("Stop"), button:has-text("Pause"), button:has-text("Pausar"), button:has-text("Parar")').first()
    if (await stopBtn.isVisible({ timeout: 800 }).catch(() => false)) {
      await stopBtn.click()
    }
  } else {
    await sleep(2500)
  }

  // ── SCENE 9 (4s): Analytics — pause on stats ────────────────────────────────
  console.log('🎞  Scene 9 — Analytics')
  await nav(page, 'analytics')
  await hideTour(page)
  await sleep(700)
  await page.mouse.wheel(0, 300)
  await sleep(800)
  await page.mouse.wheel(0, 300)
  await sleep(800)
  await page.mouse.wheel(0, -600)
  await sleep(700)

  // ── SCENE 10 (2s): Back to dashboard — completion stats ─────────────────────
  console.log('🎞  Scene 10 — Dashboard final')
  await nav(page, 'dashboard')
  await sleep(2000)

  // ── Encerrar ──────────────────────────────────────────────────────────────────
  console.log('✅ Encerrando gravação...')
  await context.close()
  await browser.close()

  await sleep(1500)
  const allWebm = fs.readdirSync(OUT_DIR)
    .filter(f => f.endsWith('.webm'))
    .map(f => ({ f, t: fs.statSync(path.join(OUT_DIR, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)

  if (allWebm.length > 0) {
    const latest = allWebm[0].f
    const newName = `weekflow-cinematic-${Date.now()}.webm`
    fs.renameSync(path.join(OUT_DIR, latest), path.join(OUT_DIR, newName))
    console.log(`\n🎥 Vídeo: demo-video/${newName}`)
    console.log(`📝 Converta: ffmpeg -i "demo-video/${newName}" -c:v libx264 -crf 18 "demo-video/weekflow-cinematic.mp4"`)
    console.log(`📁 Copie weekflow-cinematic.mp4 para d:/weekflow-reel-editor/public/`)
  }
})()
