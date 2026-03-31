/**
 * WeekFlow Demo Recorder
 * Grava automaticamente o reel de 30s do app usando Playwright
 * Uso: node scripts/record-demo.cjs
 */

const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE_URL = 'http://localhost:5175'
const OUT_DIR = path.join(__dirname, '..', 'demo-video')

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function typeSlowly(locator, text, delay = 55) {
  for (const char of text) {
    await locator.type(char)
    await sleep(delay)
  }
}

;(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  const browser = await chromium.launch({
    headless: false,
    args: ['--window-size=1280,720', '--window-position=0,0'],
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1280, height: 720 },
    },
  })

  const page = await context.newPage()

  console.log('🎬 Iniciando gravação...')

  // ── Cena 1: Landing page com logo (0-3s) ──────────────────────────────────
  console.log('📍 Cena 1: Landing page')
  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle')
  await sleep(2000)

  // ── Cena 2: Navegar para Login e disparar demo (3-5s) ─────────────────────
  console.log('📍 Cena 2: Ativando modo demo')
  // Click Log In button on landing
  await page.locator('button:has-text("Log In"), a:has-text("Log In")').first().click().catch(() => {})
  await sleep(1000)

  // Marca tour como concluído antes de logar (evita overlay bloqueante)
  await page.evaluate(() => localStorage.setItem('wf_tour_done', 'true'))

  // Agora chama loginDemo via window (exposto pelo AppContext)
  await page.waitForFunction(() => typeof window.__loginDemo === 'function', { timeout: 5000 })
  await page.evaluate(() => window.__loginDemo())
  await sleep(1500)

  // Se o tour overlay ainda apareceu, clica no backdrop para fechar
  const tourOverlay = page.locator('.fixed.inset-0.z-\\[150\\] .absolute.inset-0').first()
  if (await tourOverlay.isVisible().catch(() => false)) {
    await tourOverlay.click({ force: true })
    await sleep(500)
  }

  // ── Cena 3: Week View — scroll suave (5-10s) ──────────────────────────────
  console.log('📍 Cena 3: Week view')
  await page.waitForFunction(() => window.__weekflowDemoReady === true, { timeout: 5000 }).catch(() => {})
  await sleep(500)

  // Scroll suave para mostrar as tarefas
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, 180)
    await sleep(500)
  }
  await sleep(400)
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, -180)
    await sleep(400)
  }
  await sleep(600)

  // ── Cena 4: Abrir Add Task modal (10-16s) ─────────────────────────────────
  console.log('📍 Cena 4: Add task')
  // Remove any tour/overlay that blocks interaction
  await page.evaluate(() => {
    document.querySelectorAll('.fixed.inset-0').forEach(el => {
      if (el.style.zIndex > 100 || el.className.includes('z-[150]') || el.className.includes('z-\\[150\\]')) {
        el.remove()
      }
    })
    // Also try to find and remove the tour overlay by its specific class pattern
    document.querySelectorAll('[class*="z-[150]"]').forEach(el => el.remove())
  })
  await sleep(300)
  const addBtn = page.locator('[data-tour="add-task"]').first()
  await addBtn.click({ force: true })
  await sleep(700)

  // Digitar tarefa
  const taskInput = page.locator('input[placeholder*="tarefa"], input[placeholder*="task"], input[placeholder*="Tarefa"]').first()
  const taskInputVisible = await taskInput.isVisible().catch(() => false)
  if (taskInputVisible) {
    await taskInput.click()
    await typeSlowly(taskInput, 'Reunião com cliente às 14h')
    await sleep(1200)
  }

  // Fechar modal
  await page.keyboard.press('Escape')
  await sleep(700)

  // ── Cena 5: Navegar para FlowCircle (16-21s) ──────────────────────────────
  console.log('📍 Cena 5: FlowCircle')
  // Tenta nav sidebar/bottom bar
  await page.locator('button[aria-label*="FlowCircle"], button[aria-label*="circle"]').first().click().catch(() => {})
  await page.locator('[data-nav="flowcircle"]').first().click().catch(() => {})
  await page.locator('text=FlowCircle').first().click().catch(() => {})
  await sleep(2500)

  // ── Cena 6: Abrir AI Chat (21-26s) ────────────────────────────────────────
  console.log('📍 Cena 6: AI Chat')
  const aiBtn = page.locator('[data-tour="ai-btn"]').first()
  const aiBtnVisible = await aiBtn.isVisible().catch(() => false)
  if (aiBtnVisible) {
    await aiBtn.click()
    await sleep(1500)

    const chatInput = page.locator('textarea').last()
    const chatVisible = await chatInput.isVisible().catch(() => false)
    if (chatVisible) {
      await chatInput.click()
      await typeSlowly(chatInput, 'Organize minha semana')
      await sleep(1200)
    }
    await page.keyboard.press('Escape')
    await sleep(500)
  }

  // ── Cena 7: Voltar para tela inicial (26-30s) ─────────────────────────────
  console.log('📍 Cena 7: Tela final')
  await page.evaluate(() => window.__loginDemo && window.__loginDemo())
  await sleep(500)
  // Navegar para dashboard limpamente
  await page.evaluate(() => { try { window.__loginDemo() } catch(e) {} })
  await sleep(3000)

  // ── Finalizar ──────────────────────────────────────────────────────────────
  console.log('✅ Encerrando gravação...')
  await context.close()
  await browser.close()

  // Renomear o arquivo gerado
  await sleep(1000) // aguarda flush do vídeo
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.webm'))
  if (files.length > 0) {
    const latest = files.map(f => ({ f, t: fs.statSync(path.join(OUT_DIR, f)).mtimeMs })).sort((a,b) => b.t - a.t)[0].f
    const newName = `weekflow-reel-${Date.now()}.webm`
    fs.renameSync(path.join(OUT_DIR, latest), path.join(OUT_DIR, newName))
    console.log(`\n🎥 Vídeo salvo em: demo-video/${newName}`)
    console.log('📝 Converta para MP4 com:')
    console.log(`   ffmpeg -i "demo-video/${newName}" -c:v libx264 -crf 18 -preset slow "demo-video/weekflow-reel.mp4"`)
  } else {
    console.log('⚠️  Nenhum arquivo .webm encontrado em', OUT_DIR)
  }
})()
