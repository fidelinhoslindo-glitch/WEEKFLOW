import { supabase } from './supabase'

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const TasksService = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data.map(dbToTask)
  },

  async create(userId, task) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskToDb(userId, task)])
      .select()
      .single()
    if (error) throw error
    return dbToTask(data)
  },

  async createMany(userId, tasks) {
    const rows = tasks.map(t => taskToDb(userId, t))
    const { data, error } = await supabase
      .from('tasks')
      .insert(rows)
      .select()
    if (error) throw error
    return data.map(dbToTask)
  },

  async update(taskId, changes) {
    const { data, error } = await supabase
      .from('tasks')
      .update(taskChangesToDb(changes))
      .eq('id', taskId)
      .select()
      .single()
    if (error) throw error
    return dbToTask(data)
  },

  async delete(taskId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
    if (error) throw error
  },

  async deleteAll(userId) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', userId)
    if (error) throw error
  },

  async resetRecurring(userId) {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: false })
      .eq('user_id', userId)
      .eq('recurring', true)
    if (error) throw error
  },
}

// ── Notes ─────────────────────────────────────────────────────────────────────
export const NotesService = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data.map(dbToNote)
  },

  async upsert(userId, note) {
    const row = noteToDb(userId, note)
    const { data, error } = await supabase
      .from('notes')
      .upsert([row])
      .select()
      .single()
    if (error) throw error
    return dbToNote(data)
  },

  async delete(noteId) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
    if (error) throw error
  },
}

// ── Profile ───────────────────────────────────────────────────────────────────
export const ProfileService = {
  async get(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  async update(userId, changes) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name:         changes.name,
        avatar_color: changes.avatarColor,
        dark_mode:    changes.darkMode,
        onboarding:   changes.onboarding,
        updated_at:   new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },
}

// ── Pomodoro ──────────────────────────────────────────────────────────────────
export const PomodoroService = {
  async addSession(userId, taskTitle, mins) {
    const { error } = await supabase
      .from('pomodoro_sessions')
      .insert([{ user_id: userId, task_title: taskTitle, duration: mins }])
    if (error) throw error
  },

  async getToday(userId) {
    const start = new Date(); start.setHours(0,0,0,0)
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('completed_at', start.toISOString())
      .order('completed_at', { ascending: false })
    if (error) throw error
    return data
  },
}

// ── Mappers ───────────────────────────────────────────────────────────────────
function taskToDb(userId, t) {
  return {
    user_id:   userId,
    title:     t.title,
    category:  t.category || 'Work',
    day:       t.day,
    time:      t.time || '09:00',
    duration:  t.duration || 60,
    priority:  t.priority || 'medium',
    completed: t.completed || false,
    recurring: t.recurring || false,
    notes:     t.notes || '',
    color:     t.color || null,
  }
}

function taskChangesToDb(ch) {
  const out = {}
  if (ch.title     !== undefined) out.title     = ch.title
  if (ch.category  !== undefined) out.category  = ch.category
  if (ch.day       !== undefined) out.day       = ch.day
  if (ch.time      !== undefined) out.time      = ch.time
  if (ch.duration  !== undefined) out.duration  = ch.duration
  if (ch.priority  !== undefined) out.priority  = ch.priority
  if (ch.completed !== undefined) out.completed = ch.completed
  if (ch.recurring !== undefined) out.recurring = ch.recurring
  if (ch.notes     !== undefined) out.notes     = ch.notes
  if (ch.color     !== undefined) out.color     = ch.color
  return out
}

function dbToTask(row) {
  return {
    id:        row.id,
    title:     row.title,
    category:  row.category,
    day:       row.day,
    time:      row.time,
    duration:  row.duration,
    priority:  row.priority,
    completed: row.completed,
    recurring: row.recurring,
    notes:     row.notes || '',
    color:     row.color || null,
  }
}

function noteToDb(userId, n) {
  return {
    id:        n.id,
    user_id:   userId,
    title:     n.title || '',
    content:   n.content || '',
    type:      n.type || 'note',
    color:     n.color || 'default',
    pinned:    n.pinned || false,
    todos:     n.todos || [],
  }
}

function dbToNote(row) {
  return {
    id:        row.id,
    title:     row.title,
    content:   row.content,
    type:      row.type,
    color:     row.color,
    pinned:    row.pinned,
    todos:     row.todos || [],
    createdAt: row.created_at,
  }
}
