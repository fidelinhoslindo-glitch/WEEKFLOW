// ─── SmartCalendar Engine ──────────────────────────────────────────────────────
// Detects patterns, removes holiday conflicts, suggests habits

// Brazilian + International holidays (fixed + computed)
export const HOLIDAYS_BR = {
  '01-01': { name: "Ano Novo",           emoji: '🎆', type: 'national' },
  '02-14': { name: "Dia dos Namorados",  emoji: '💖', type: 'cultural' },
  '04-21': { name: "Tiradentes",         emoji: '🇧🇷', type: 'national' },
  '05-01': { name: "Dia do Trabalho",    emoji: '👷', type: 'national' },
  '06-12': { name: "Dia dos Namorados",  emoji: '💕', type: 'cultural' },
  '09-07': { name: "Independência",      emoji: '🇧🇷', type: 'national' },
  '10-12': { name: "N.S. Aparecida",     emoji: '🙏', type: 'national' },
  '10-31': { name: "Halloween",          emoji: '🎃', type: 'cultural' },
  '11-02': { name: "Finados",            emoji: '🕯️', type: 'national' },
  '11-15': { name: "Rep. Brasileira",    emoji: '🇧🇷', type: 'national' },
  '11-20': { name: "Consc. Negra",       emoji: '✊', type: 'national' },
  '12-08': { name: "N.S. Conceição",     emoji: '🙏', type: 'national' },
  '12-25': { name: "Natal",              emoji: '🎅', type: 'national' },
  '12-31': { name: "Véspera Ano Novo",   emoji: '🥂', type: 'national' },
  // Year-specific (Easter, Carnaval, etc.)
  '2025-04-18': { name: "Sexta Santa",   emoji: '✝️', type: 'national' },
  '2025-04-20': { name: "Páscoa",        emoji: '🐣', type: 'national' },
  '2025-03-03': { name: "Carnaval",      emoji: '🎭', type: 'national' },
  '2025-03-04': { name: "Carnaval",      emoji: '🎭', type: 'national' },
  '2026-04-03': { name: "Sexta Santa",   emoji: '✝️', type: 'national' },
  '2026-04-05': { name: "Páscoa",        emoji: '🐣', type: 'national' },
  '2026-02-16': { name: "Carnaval",      emoji: '🎭', type: 'national' },
  '2026-02-17': { name: "Carnaval",      emoji: '🎭', type: 'national' },
}

// ── Usage History Engine ──────────────────────────────────────────────────────
// Tracks every time a user marks a task complete, to learn real patterns

const LS_HISTORY = 'wf_usage_history'
export function trackTaskCompletion(task) {
  const history = getUsageHistory()
  const entry = {
    title:   task.title,
    category:task.category,
    weekday: task.day,
    time:    task.time,
    hour:    parseInt(task.time),
    ts:      Date.now(),
    date:    new Date().toLocaleDateString(),
  }
  const updated = [entry, ...history].slice(0, 500) // keep last 500
  try { localStorage.setItem(LS_HISTORY, JSON.stringify(updated)) } catch {}
  return updated
}

export function getUsageHistory() {
  try { const v = localStorage.getItem(LS_HISTORY); return v ? JSON.parse(v) : [] } catch { return [] }
}

// ── Real pattern detection from actual completion history ─────────────────────
export function detectRealPatterns() {
  const history = getUsageHistory()
  if (history.length < 6) return []

  const groups = {}
  history.forEach(e => {
    const key = `${e.title}|${e.weekday}`
    if (!groups[key]) groups[key] = []
    groups[key].push(e)
  })

  return Object.entries(groups)
    .filter(([, evs]) => evs.length >= 3)
    .map(([key, evs]) => {
      const [title, weekday] = key.split('|')
      const hours = evs.map(e => e.hour).filter(h => !isNaN(h))
      const avgHour = hours.length ? Math.round(hours.reduce((a,b)=>a+b,0)/hours.length) : 9
      const confidence = Math.min(98, Math.round((evs.length / 8) * 100))
      return {
        id: key, title, weekday,
        time: String(avgHour).padStart(2,'0') + ':00',
        count: evs.length, confidence,
        category: guessCategory(title),
        icon: getCategoryIcon(guessCategory(title)),
        message: `You complete "${title}" on ${weekday}s ${evs.length}x — add to routine?`,
        lastSeen: new Date(evs[0].ts).toLocaleDateString(),
      }
    })
    .sort((a,b) => b.confidence - a.confidence)
}

// ── Weekly insights from history ──────────────────────────────────────────────
export function getWeeklyInsights() {
  const history = getUsageHistory()
  if (history.length < 5) return []

  const insights = []
  const byCat = {}
  history.forEach(e => { byCat[e.category] = (byCat[e.category]||0)+1 })

  const top = Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0]
  if (top) insights.push({ icon:'🏆', text:`Your most active category is ${top[0]} with ${top[1]} completions` })

  const byHour = {}
  history.forEach(e => { if(!isNaN(e.hour)) byHour[e.hour] = (byHour[e.hour]||0)+1 })
  const peakHour = Object.entries(byHour).sort((a,b)=>b[1]-a[1])[0]
  if (peakHour) {
    const h = parseInt(peakHour[0])
    insights.push({ icon:'⏰', text:`Your peak productivity hour is ${h}:00 ${h>=12?'PM':'AM'}` })
  }

  const byDay = {}
  history.forEach(e => { byDay[e.weekday] = (byDay[e.weekday]||0)+1 })
  const topDay = Object.entries(byDay).sort((a,b)=>b[1]-a[1])[0]
  if (topDay) insights.push({ icon:'📅', text:`${topDay[0]} is your most productive day` })

  return insights
}

export function getHoliday(year, month, date) {
  const mm   = String(month + 1).padStart(2, '0')
  const dd   = String(date).padStart(2, '0')
  return HOLIDAYS_BR[`${year}-${mm}-${dd}`] || HOLIDAYS_BR[`${mm}-${dd}`] || null
}

// ── Pattern Detection Engine ──────────────────────────────────────────────────
// Analyzes event history and returns detected habits
export function detectPatterns(events) {
  if (!events || events.length === 0) return []

  const suggestions = []
  const seen = new Set()

  // Group by title + weekday + approx time
  const groups = {}
  events.forEach(ev => {
    const key = `${ev.title}|${ev.weekday}|${Math.floor(ev.hour / 1)}h`
    if (!groups[key]) groups[key] = []
    groups[key].push(ev)
  })

  Object.entries(groups).forEach(([key, evs]) => {
    if (evs.length >= 3 && !seen.has(key)) {
      seen.add(key)
      const [title, weekday, time] = key.split('|')
      const confidence = Math.min(99, Math.round((evs.length / 8) * 100))
      suggestions.push({
        id:         key,
        title,
        weekday,
        time:       evs[0].time || '15:00',
        count:      evs.length,
        confidence,
        category:   guessCategory(title),
        message:    `You do "${title}" on ${weekday}s ${evs.length}x — add to your routine?`,
        icon:       getCategoryIcon(guessCategory(title)),
      })
    }
  })

  return suggestions.sort((a, b) => b.confidence - a.confidence)
}

// ── Holiday Conflict Resolver ─────────────────────────────────────────────────
// Given a list of tasks for a specific date, returns adjusted tasks
export function resolveHolidayConflicts(tasks, year, month, date) {
  const holiday = getHoliday(year, month, date)
  if (!holiday) return { tasks, holiday: null, conflicts: [] }

  const workTypes = ['Work', 'Study']
  const conflicts = tasks.filter(t => workTypes.includes(t.category))

  const adjusted = tasks.map(t => {
    if (workTypes.includes(t.category)) {
      return { ...t, _holidayConflict: true, _holidayName: holiday.name, _suspended: true }
    }
    return t
  })

  return { tasks: adjusted, holiday, conflicts }
}

// ── Smart Suggestions (based on past behavior) ────────────────────────────────
export function generateSmartSuggestions(tasks) {
  const suggestions = []
  const dayCount = {}

  // Count tasks per day/title combination
  tasks.forEach(t => {
    const k = `${t.title}|${t.day}`
    dayCount[k] = (dayCount[k] || 0) + 1
  })

  // Find recurring patterns from existing tasks
  const titleGroups = {}
  tasks.forEach(t => {
    if (!titleGroups[t.title]) titleGroups[t.title] = new Set()
    titleGroups[t.title].add(t.day)
  })

  Object.entries(titleGroups).forEach(([title, days]) => {
    if (days.size >= 3) {
      suggestions.push({
        type:       'recurring_pattern',
        title,
        days:       [...days],
        message:    `"${title}" happens ${days.size} days/week — make it recurring?`,
        icon:       '🔄',
        confidence: Math.min(95, days.size * 20),
        action:     'make_recurring',
      })
    }
  })

  // Suggest rest if too many work tasks
  const workTasks  = tasks.filter(t => t.category === 'Work')
  const restTasks  = tasks.filter(t => t.category === 'Rest')
  if (workTasks.length > 8 && restTasks.length < 2) {
    suggestions.push({
      type:       'balance_suggestion',
      title:      'Add some rest time',
      message:    `You have ${workTasks.length} work tasks but only ${restTasks.length} rest blocks. Burnout risk!`,
      icon:       '⚠️',
      confidence: 85,
      action:     'suggest_rest',
    })
  }

  return suggestions
}

function guessCategory(title) {
  const t = title.toLowerCase()
  if (t.includes('gym') || t.includes('workout') || t.includes('run') || t.includes('yoga') || t.includes('açaí') || t.includes('acai')) return 'Gym'
  if (t.includes('study') || t.includes('class') || t.includes('school') || t.includes('aula') || t.includes('escola')) return 'Study'
  if (t.includes('meeting') || t.includes('work') || t.includes('reunião') || t.includes('trabalho')) return 'Work'
  if (t.includes('sleep') || t.includes('rest') || t.includes('nap') || t.includes('descanso')) return 'Rest'
  return 'Other'
}

function getCategoryIcon(cat) {
  return { Work:'💼', Gym:'💪', Study:'📚', Rest:'😴', Other:'📌' }[cat] || '📌'
}
