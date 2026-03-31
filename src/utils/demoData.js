// ── Demo data para gravação de vídeo / Reel ───────────────────────────────────
// Gera tarefas realistas distribuídas na semana atual

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/**
 * Retorna a data ISO (YYYY-MM-DD) para o dia da semana informado na semana atual.
 */
function getDateForDay(dayName) {
  const dayIndex = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 }
  const now = new Date()
  const jsDay = now.getDay() // 0 = domingo
  const targetIdx = dayIndex[dayName]
  const diff = targetIdx - jsDay
  const d = new Date(now)
  d.setDate(d.getDate() + diff)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Gera um array de tasks de demonstração para a semana atual.
 * Formato compatível com o AppContext (persistTasks / addTasks).
 */
export function seedDemoData() {
  let counter = Date.now()
  const uid = () => ++counter

  const tasks = [
    // Segunda-feira
    {
      id: uid(),
      title: 'Planejamento semanal',
      category: 'Work',
      day: 'Monday',
      specificDate: getDateForDay('Monday'),
      time: '08:00',
      duration: 30,
      priority: 'high',
      completed: false,
      notes: 'Revisar metas da semana e definir prioridades',
      recurring: false,
      color: 'indigo',
      aiSuggested: true,
    },
    {
      id: uid(),
      title: 'Reunião com cliente',
      category: 'Work',
      day: 'Monday',
      specificDate: getDateForDay('Monday'),
      time: '10:00',
      duration: 60,
      priority: 'high',
      completed: false,
      notes: 'Apresentar proposta de projeto Q2',
      recurring: false,
      color: 'indigo',
      aiSuggested: false,
    },
    {
      id: uid(),
      title: 'Academia',
      category: 'Gym',
      day: 'Monday',
      specificDate: getDateForDay('Monday'),
      time: '07:00',
      duration: 60,
      priority: 'medium',
      completed: true,
      notes: '',
      recurring: true,
      color: 'emerald',
      aiSuggested: false,
    },

    // Terça-feira
    {
      id: uid(),
      title: 'Revisar proposta comercial',
      category: 'Work',
      day: 'Tuesday',
      specificDate: getDateForDay('Tuesday'),
      time: '09:00',
      duration: 90,
      priority: 'high',
      completed: false,
      notes: 'Ajustar valores e prazo de entrega',
      recurring: false,
      color: 'indigo',
      aiSuggested: true,
    },
    {
      id: uid(),
      title: 'Ligar para fornecedor',
      category: 'Work',
      day: 'Tuesday',
      specificDate: getDateForDay('Tuesday'),
      time: '14:00',
      duration: 20,
      priority: 'medium',
      completed: false,
      notes: 'Confirmar prazo de entrega dos materiais',
      recurring: false,
      color: '',
      aiSuggested: false,
    },

    // Quarta-feira
    {
      id: uid(),
      title: 'Entregar relatório mensal',
      category: 'Work',
      day: 'Wednesday',
      specificDate: getDateForDay('Wednesday'),
      time: '12:00',
      duration: 30,
      priority: 'high',
      completed: false,
      notes: 'Relatório de desempenho para diretoria',
      recurring: false,
      color: 'amber',
      aiSuggested: false,
    },
    {
      id: uid(),
      title: 'Academia',
      category: 'Gym',
      day: 'Wednesday',
      specificDate: getDateForDay('Wednesday'),
      time: '07:00',
      duration: 60,
      priority: 'medium',
      completed: false,
      notes: '',
      recurring: true,
      color: 'emerald',
      aiSuggested: false,
    },

    // Quinta-feira
    {
      id: uid(),
      title: 'Dentista 14h',
      category: 'Other',
      day: 'Thursday',
      specificDate: getDateForDay('Thursday'),
      time: '14:00',
      duration: 60,
      priority: 'high',
      completed: false,
      notes: 'Clínica Sorriso — Av. Paulista, 1200',
      recurring: false,
      color: 'cyan',
      aiSuggested: false,
    },
    {
      id: uid(),
      title: 'Meditação matinal',
      category: 'Rest',
      day: 'Thursday',
      specificDate: getDateForDay('Thursday'),
      time: '06:30',
      duration: 15,
      priority: 'low',
      completed: false,
      notes: '',
      recurring: true,
      color: 'purple',
      aiSuggested: true,
    },

    // Sexta-feira
    {
      id: uid(),
      title: 'Revisão de código — sprint',
      category: 'Work',
      day: 'Friday',
      specificDate: getDateForDay('Friday'),
      time: '10:00',
      duration: 120,
      priority: 'medium',
      completed: false,
      notes: 'Pull requests pendentes do time',
      recurring: false,
      color: 'indigo',
      aiSuggested: false,
    },
    {
      id: uid(),
      title: 'Happy hour com o time',
      category: 'Other',
      day: 'Friday',
      specificDate: getDateForDay('Friday'),
      time: '18:00',
      duration: 120,
      priority: 'low',
      completed: false,
      notes: '',
      recurring: false,
      color: 'pink',
      aiSuggested: false,
    },

    // Sábado
    {
      id: uid(),
      title: 'Aniversário da Maria',
      category: 'Other',
      day: 'Saturday',
      specificDate: getDateForDay('Saturday'),
      time: '15:00',
      duration: 180,
      priority: 'high',
      completed: false,
      notes: 'Levar presente — lista na Amazon',
      recurring: false,
      color: 'pink',
      aiSuggested: false,
    },
    {
      id: uid(),
      title: 'Corrida no parque',
      category: 'Gym',
      day: 'Saturday',
      specificDate: getDateForDay('Saturday'),
      time: '07:30',
      duration: 45,
      priority: 'medium',
      completed: false,
      notes: '',
      recurring: true,
      color: 'emerald',
      aiSuggested: true,
    },

    // Domingo
    {
      id: uid(),
      title: 'Prep de refeições da semana',
      category: 'Rest',
      day: 'Sunday',
      specificDate: getDateForDay('Sunday'),
      time: '16:00',
      duration: 90,
      priority: 'medium',
      completed: false,
      notes: 'Cozinhar para a semana toda',
      recurring: true,
      color: 'purple',
      aiSuggested: true,
    },
  ]

  return tasks
}

/**
 * Usuário fictício para modo demo (sem Firebase).
 */
export const DEMO_USER = {
  id: 'demo-user',
  name: 'Carlos Silva',
  email: 'carlos@weekflow.demo',
  plan: 'Pro',
  avatar: null,
  avatarColor: '#6467f2',
}
