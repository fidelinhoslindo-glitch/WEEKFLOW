// Google Calendar Integration Utilities

// Generate a Google Calendar event URL for a single task
export function taskToGoogleCalendarUrl(task) {
  const now   = new Date()
  const year  = now.getFullYear()
  const dayMap = { Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6, Sunday:0 }

  // Find next occurrence of the task's day
  const targetDow = dayMap[task.day] ?? 1
  const today = now.getDay()
  let daysAhead = targetDow - today
  if (daysAhead <= 0) daysAhead += 7

  const taskDate = new Date(now)
  taskDate.setDate(now.getDate() + daysAhead)

  const [hours, mins] = task.time.split(':').map(Number)
  taskDate.setHours(hours, mins, 0, 0)

  const endDate = new Date(taskDate.getTime() + task.duration * 60000)

  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text:   task.title,
    dates:  `${fmt(taskDate)}/${fmt(endDate)}`,
    details:`Category: ${task.category} | Priority: ${task.priority}${task.notes ? '\n' + task.notes : ''}`,
    location: '',
  })

  return `https://calendar.google.com/calendar/render?${params}`
}

// Generate an .ics file content for all tasks
export function tasksToICS(tasks) {
  const now   = new Date()
  const year  = now.getFullYear()
  const dayMap = { Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6, Sunday:0 }

  const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const uid = () => Math.random().toString(36).slice(2) + '@weekflow'

  const events = tasks.map(task => {
    const targetDow = dayMap[task.day] ?? 1
    const today = now.getDay()
    let daysAhead = targetDow - today
    if (daysAhead <= 0) daysAhead += 7

    const taskDate = new Date(now)
    taskDate.setDate(now.getDate() + daysAhead)
    const [hours, mins] = task.time.split(':').map(Number)
    taskDate.setHours(hours, mins, 0, 0)
    const endDate = new Date(taskDate.getTime() + task.duration * 60000)

    return [
      'BEGIN:VEVENT',
      `UID:${uid()}`,
      `DTSTAMP:${fmt(now)}`,
      `DTSTART:${fmt(taskDate)}`,
      `DTEND:${fmt(endDate)}`,
      `SUMMARY:${task.title}`,
      `DESCRIPTION:Category: ${task.category}\\nPriority: ${task.priority}${task.notes ? '\\n' + task.notes : ''}`,
      `CATEGORIES:${task.category.toUpperCase()}`,
      ...(task.recurring ? ['RRULE:FREQ=WEEKLY'] : []),
      'END:VEVENT',
    ].join('\r\n')
  })

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WeekFlow//WeekFlow App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:WeekFlow Schedule',
    'X-WR-CALDESC:Your WeekFlow weekly schedule',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')
}

// Download .ics file
export function downloadICS(tasks) {
  const content = tasksToICS(tasks)
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'weekflow-schedule.ics'; a.click()
  URL.revokeObjectURL(url)
}
