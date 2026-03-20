// ── Shared app constants ──────────────────────────────────────────────────────
// Centralised here to avoid magic numbers scattered across files.

export const TOAST_TIMEOUT      = 4500   // ms before a toast auto-dismisses
export const FREE_TASK_LIMIT    = 15     // max tasks for free-plan users
export const POMODORO_DURATION  = 25 * 60 // seconds (25 minutes)
export const HISTORY_LIMIT      = 50     // max pomodoro history entries

export const VALID_PAGES = [
  'landing','login','onboarding','dashboard','planner','daily','templates',
  'calendar','analytics','settings','export','empty','pomodoro','notes',
  'smart-calendar','flowcircle','timer','share','checkout','admin','download',
]
