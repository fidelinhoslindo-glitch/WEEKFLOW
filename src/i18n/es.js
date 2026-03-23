export default {
  // ── Common ──────────────────────────────────────────────────────────────────
  common: {
    save: 'Guardar', cancel: 'Cancelar', back: 'Volver', continue: 'Continuar',
    previous: 'Anterior', next: 'Siguiente', close: 'Cerrar', delete: 'Eliminar',
    edit: 'Editar', add: 'Agregar', done: 'Listo', loading: 'Cargando...',
    confirm: 'Confirmar', yes: 'Sí', no: 'No', or: 'O',
    search: 'Buscar', settings: 'Configuración', tryAgain: 'Intentar de nuevo',
    resetReload: 'Reiniciar & Recargar', somethingWrong: 'Algo salió mal',
    unexpectedError: 'Ocurrió un error inesperado.',
    plan: 'Plan',
    weekdays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    weekdaysShort: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    categories: { Work: 'Trabajo', Gym: 'Gimnasio', Study: 'Estudio', Rest: 'Descanso', Other: 'Otro' },
    priorities: { low: 'Baja', medium: 'Media', high: 'Alta' },
  },

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  sidebar: {
    dashboard: 'Inicio', planner: 'Planner', today: 'Hoy',
    smartCal: 'Smart Cal', flowcircle: 'FlowCircle', notes: 'Notas',
    pomodoro: 'Pomodoro', analytics: 'Analíticas', settings: 'Configuración',
    desktopApp: 'App de Escritorio', faq: 'Ayuda & FAQ',
    dailyProgress: 'Progreso Diario', tasksDone: 'tareas completadas',
    resetRecurring: 'Reiniciar tareas recurrentes',
    lightMode: 'Modo Claro', darkMode: 'Modo Oscuro',
    user: 'Usuario',
  },

  // ── BottomNav ───────────────────────────────────────────────────────────────
  bottomNav: {
    home: 'Inicio', planner: 'Planner', circles: 'Círculos',
    stats: 'Stats', profile: 'Perfil', add: 'Agregar',
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    searchTasks: 'Buscar tareas…', addTask: 'Nueva Tarea',
    enableAlerts: 'Activar alertas', notifications: 'Notificaciones',
    markAllRead: 'Marcar todo como leído', noNotifications: 'Sin notificaciones',
    notificationSettings: 'Configuración de Notificaciones',
  },

  // ── Global Search ───────────────────────────────────────────────────────────
  globalSearch: {
    placeholder: 'Buscar tareas, categorías, días...',
    typeMin: 'Escribe al menos 2 caracteres para buscar',
    searchBy: 'Busca por nombre, categoría, día o notas',
    noResults: 'No se encontraron tareas para',
    results: 'resultado', resultsPlural: 'resultados',
    open: 'abrir', weekflowSearch: 'Búsqueda WeekFlow',
  },

  // ── Add Task Modal ──────────────────────────────────────────────────────────
  addTask: {
    title: 'Crear Nueva Tarea',
    subtitle: 'Programa tus actividades para la semana.',
    taskName: 'Nombre de la Tarea',
    taskPlaceholder: 'ej: Entrenamiento Matutino, Reunión de Equipo...',
    category: 'Categoría',
    dayOfWeek: 'Día de la Semana',
    selectAtLeast: 'Selecciona al menos uno',
    daysSelected: 'día(s) seleccionado(s)',
    weekdaysBtn: 'Días hábiles', allBtn: 'Todos',
    startTime: 'Hora de Inicio',
    hour: 'Hora', minute: 'Minuto',
    duration: 'Duración (minutos)',
    priority: 'Prioridad',
    taskColor: 'Color de Tarea',
    recurring: 'Recurrente',
    weeklyRepeat: 'Repetición semanal', oneTime: 'Una vez',
    notes: 'Notas', notesOptional: '(opcional)',
    notesPlaceholder: 'Detalles o recordatorios...',
    createTask: 'Crear Tarea', createTasks: 'Crear {n} Tareas',
    taskAdded: '¡Tarea Creada!',
  },

  // ── Dashboard ───────────────────────────────────────────────────────────────
  dashboard: {
    greeting: 'Buenos días, {name}.',
    subtitle: '¿Listo para tu flow?',
    aiAssistant: 'Asistente IA',
    exportCalendar: 'Exportar al Calendario',
    addTask: 'Nueva Tarea',
    emptyTitle: 'Tu semana está en blanco',
    emptyDesc: 'Agrega tu primera tarea o deja que la IA construya tu semana',
    addTaskBtn: 'Agregar tarea',
    askAI: 'Preguntar a la IA',
    weeklyCompletion: 'Completado Semanal',
    totalTasks: 'Total de Tareas',
    busiestDay: 'Día Más Ocupado',
    focusScore: 'Puntuación de Enfoque',
    weekOverview: 'Vista de la Semana Actual',
    viewPlanner: 'Ver planner completo →',
    tasks: 'tareas',
    smartReminders: 'Recordatorios Inteligentes',
    highPriority: 'Alta Prioridad',
    allHighDone: '¡Todas las tareas de alta prioridad completadas!',
    focusSession: 'Sesión de Enfoque',
    focusDesc: 'Maximiza tu productividad con una sesión de trabajo profundo.',
    pause: 'Pausar', startSession: 'Iniciar Sesión',
    tasksByCategory: 'Tareas por Categoría',
  },

  // ── Onboarding ──────────────────────────────────────────────────────────────
  onboarding: {
    steps: ['Objetivo', 'Actividades', 'Horario', 'Despertar', 'Días libres', 'Resumen'],
    // Step 0: Goal
    goalTitle: '¿Cuál es tu objetivo principal?',
    goalSubtitle: 'Adaptaremos tu agenda según tu enfoque.',
    goals: {
      organized:    { title: 'Estar Organizado',   desc: 'Todo en su lugar correcto, siempre.' },
      stress:       { title: 'Menos Estrés',        desc: 'Una semana tranquila y estructurada.' },
      routine:      { title: 'Crear Rutina',        desc: 'Consolida hábitos saludables y productivos.' },
      productivity: { title: 'Productividad',       desc: 'Logra más en menos tiempo.' },
    },
    chooseGoal: 'Por favor elige un objetivo para continuar',
    // Step 1: Activities
    activitiesTitle: '¿Qué actividades llevas a cabo?',
    activitiesSubtitle: 'Selecciona una o más. Estas darán forma a tu semana.',
    activities: {
      work: 'Trabajo', gym: 'Gimnasio', study: 'Estudio', meditation: 'Meditación',
      cooking: 'Cocina', reading: 'Lectura', social: 'Social', rest: 'Descanso',
    },
    selectActivity: 'Por favor selecciona al menos una actividad',
    // Step 2: Work Hours
    workTitle: '¿Cuándo trabajas normalmente?',
    workSubtitle: 'Bloquearemos estas horas automáticamente en tu planner.',
    workStarts: 'Trabajo empieza a las', workEnds: 'Trabajo termina a las',
    focusHours: 'Horas de enfoque:',
    noWork: 'No trabajo',
    noWorkLabel: 'No trabaja',
    // Step 3: Wake Up
    wakeTitle: '¿A qué hora te despiertas?',
    wakeSubtitle: 'Programaremos rutinas matutinas alrededor de tu hora de despertar.',
    wakeLabel: 'Despertarme a las',
    morningStarts: 'Tu mañana comienza a las',
    // Step 4: Days Off
    daysOffTitle: '¿Cuáles son tus días de descanso?',
    daysOffSubtitle: 'Dejaremos esos días más ligeros o libres.',
    // Step 5: Summary
    summaryTitle: '¡Tu WeekFlow está listo!',
    summarySubtitle: 'Esto es lo que construimos para ti. Siempre puedes ajustarlo.',
    summaryGoal: 'Objetivo Principal', summaryHours: 'Horario de Trabajo',
    summaryWake: 'Despertar', summaryDaysOff: 'Días Libres',
    summaryActivities: 'Actividades',
    letsGo: '¡Vamos!', settingUp: 'Configurando...',
    confirmTime: 'Confirmar',
  },

  // ── Login ───────────────────────────────────────────────────────────────────
  login: {
    signIn: 'Iniciar sesión', signUp: 'Registrarse',
    fullName: 'Nombre Completo', emailAddress: 'Correo electrónico',
    password: 'Contraseña', namePlaceholder: 'Tu Nombre',
    emailPlaceholder: 'tu@correo.com', passwordPlaceholder: '••••••••',
    createAccount: 'Crear Cuenta',
    orContinueWith: 'O continúa con',
    connectedSupabase: 'Conectado a Supabase · Datos sincronizados en todos los dispositivos',
    offlineMode: 'Modo sin conexión · Datos guardados localmente',
    tagline: 'Organiza tu semana. Encuentra tu flow.',
    // Forgot password
    forgotPassword: '¿Olvidé mi contraseña?',
    forgotTitle: 'Restablecer contraseña',
    forgotSubtitle: 'Ingresa tu correo y te enviaremos un enlace de restablecimiento.',
    sendResetLink: 'Enviar enlace de restablecimiento',
    backToLogin: 'Volver al inicio de sesión',
    resetEmailSent: '¡Revisa tu correo para el enlace de restablecimiento!',
    // Reset password
    resetTitle: 'Establecer nueva contraseña',
    newPassword: 'Nueva Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    updatePassword: 'Actualizar Contraseña',
    passwordUpdated: '¡Contraseña actualizada! Ya puedes iniciar sesión.',
    passwordsMismatch: 'Las contraseñas no coinciden.',
    // Email verification modal
    verifyTitle: 'Revisa tu correo',
    verifySent: 'Enviamos un enlace de verificación a:',
    resendEmail: '¿No lo recibiste? Reenviar',
    resending: 'Enviando...',
    resendSuccess: '¡Correo reenviado exitosamente!',
    goToSignIn: 'Ir a Iniciar Sesión',
  },

  // ── Planner ─────────────────────────────────────────────────────────────────
  planner: {
    title: 'Planner Semanal',
    subtitle: 'Planifica tu semana para máximo flow.',
    newTask: 'Nueva Tarea',
    noTasks: 'Sin tareas aún',
    addFirst: 'Agrega tu primera tarea para comenzar.',
    completed: 'completada(s)',
  },

  // ── Daily ───────────────────────────────────────────────────────────────────
  daily: {
    title: 'Hoy',
    noTasks: 'Sin tareas para hoy',
    addSome: 'Tu día está libre. ¡Agrega algunas tareas!',
  },

  // ── Pomodoro ────────────────────────────────────────────────────────────────
  pomodoro: {
    title: 'Temporizador de Enfoque',
    modes: { pomodoro: 'Pomodoro', shortBreak: 'Descanso Corto', longBreak: 'Descanso Largo', timer: 'Temporizador' },
    start: 'Iniciar', pause: 'Pausar', reset: 'Reiniciar',
    sessions: 'Sesiones',
  },

  // ── Notes ───────────────────────────────────────────────────────────────────
  notes: {
    title: 'Notas',
    newNote: 'Nueva Nota',
    searchNotes: 'Buscar notas...',
    noNotes: 'Sin notas aún',
    startWriting: 'Comienza a escribir tu primera nota.',
    deleteConfirm: '¿Eliminar esta nota?',
  },

  // ── Analytics ───────────────────────────────────────────────────────────────
  analytics: {
    title: 'Analíticas',
    subtitle: 'Sigue tu progreso y consistencia.',
    completionRate: 'Tasa de Completado',
    streak: 'Racha Actual',
    bestStreak: 'Mejor Racha',
    totalCompleted: 'Total Completado',
    exportData: 'Exportar Datos',
  },

  // ── Settings ────────────────────────────────────────────────────────────────
  settings: {
    title: 'Configuración',
    tabs: { profile: 'Perfil', appearance: 'Apariencia', notifications: 'Notificaciones', export: 'Exportar', dangerZone: 'Zona de Peligro' },
    profile: {
      name: 'Nombre de Pantalla', email: 'Correo', plan: 'Plan Actual',
      upgradePro: 'Suscribirse a Pro',
    },
    appearance: {
      darkMode: 'Modo Oscuro', darkModeDesc: 'Cambiar entre tema claro y oscuro.',
      language: 'Idioma', languageDesc: 'Elige tu idioma preferido.',
    },
    notif: {
      push: 'Notificaciones Push', pushDesc: 'Recibe recordatorios de tareas.',
      sound: 'Efectos de Sonido', soundDesc: 'Reproducir sonidos al completar tareas.',
    },
    export: {
      title: 'Exportar Tus Datos',
      csv: 'Exportar CSV', json: 'Exportar JSON', print: 'Imprimir',
    },
    danger: {
      title: 'Zona de Peligro',
      clearTasks: 'Limpiar Todas las Tareas', clearTasksDesc: 'Elimina todas tus tareas permanentemente.',
      clearNotes: 'Limpiar Todas las Notas', clearNotesDesc: 'Elimina todas tus notas permanentemente.',
      deleteAccount: 'Eliminar Cuenta', deleteAccountDesc: 'Elimina tu cuenta y todos los datos.',
      confirmClear: '¿Estás seguro? Esto no se puede deshacer.',
    },
  },

  // ── FlowCircle ──────────────────────────────────────────────────────────────
  flowcircle: {
    title: 'FlowCircle',
    subtitle: 'Planifica junto con amigos, familia o tu equipo.',
    createCircle: 'Crear Círculo',
    joinCircle: 'Unirse a un Círculo',
    noCircles: 'Sin círculos aún',
    noCirclesDesc: 'Crea un círculo para empezar a planificar con otros.',
    members: 'miembros', events: 'eventos',
    invite: 'Invitar', leave: 'Salir',
  },

  // ── Smart Calendar ──────────────────────────────────────────────────────────
  smartCalendar: {
    title: 'Smart Calendar',
    subtitle: 'Tus tareas visualizadas en un calendario.',
  },

  // ── Checkout ────────────────────────────────────────────────────────────────
  checkout: {
    title: 'Actualiza tu plan',
    payWith: 'Pagar con',
    card: 'Tarjeta', pix: 'PIX',
    subscribe: 'Suscribirse',
    payNow: 'Pagar ahora',
    successTitle: '¡Pago exitoso!',
    successMsg: 'Tu plan ha sido actualizado.',
    canceledTitle: 'Pago cancelado',
    canceledMsg: 'No se realizaron cargos.',
    goToDashboard: 'Ir al Inicio',
  },

  // ── FAQ ─────────────────────────────────────────────────────────────────────
  faq: {
    title: 'Ayuda & FAQ',
    subtitle: 'Encuentra respuestas o chatea con nuestro soporte de IA.',
    searchPlaceholder: 'Buscar preguntas...',
    categories: {
      general: 'General',
      account: 'Cuenta',
      features: 'Funcionalidades',
      billing: 'Pagos',
      technical: 'Técnico',
    },
    stillNeedHelp: '¿Aún necesitas ayuda?',
    chatWithAI: 'Chatear con Soporte IA',
    items: {
      general: [
        { q: '¿Qué es WeekFlow?', a: 'WeekFlow es un planificador semanal intuitivo para la vida moderna. Organiza responsabilidades recurrentes como trabajo, gimnasio y estudio con equilibrio visual y funciones inteligentes.' },
        { q: '¿Hay una aplicación móvil?', a: '¡Sí! WeekFlow está disponible como PWA (Aplicación Web Progresiva) para iOS, Android y como aplicación de escritorio para Windows.' },
        { q: '¿Qué plataformas son compatibles?', a: 'WeekFlow funciona en cualquier navegador moderno (Chrome, Safari, Firefox, Edge), además de la app de escritorio para Windows y PWA para iOS/Android.' },
        { q: '¿Está WeekFlow disponible en otros idiomas?', a: '¡Sí! WeekFlow admite Español, Inglés y Portugués. Puedes cambiar el idioma en Configuración > Apariencia.' },
      ],
      account: [
        { q: '¿Cómo creo una cuenta?', a: 'Haz clic en "Comenzar" en la página de inicio, luego regístrate con tu correo y contraseña, o usa el inicio de sesión con Google/Apple.' },
        { q: '¿Cómo restablezco mi contraseña?', a: 'En la página de inicio de sesión, haz clic en "¿Olvidé mi contraseña?" e ingresa tu correo. Recibirás un enlace de restablecimiento.' },
        { q: '¿Cómo elimino mi cuenta?', a: 'Ve a Configuración > Zona de Peligro > Eliminar Cuenta. Esto eliminará permanentemente todos tus datos.' },
        { q: '¿Puedo iniciar sesión con Google o Apple?', a: '¡Sí! Tanto el inicio de sesión con Google como con Apple están disponibles para acceso rápido.' },
      ],
      features: [
        { q: '¿Cómo funciona el planificador semanal?', a: 'Crea tareas con categorías, días, horarios y prioridades. Las tareas aparecen en tu vista semanal y pueden marcarse como recurrentes para repetición automática.' },
        { q: '¿Qué es FlowCircle?', a: 'FlowCircle te permite crear grupos para planificar eventos junto con amigos, familia o compañeros de equipo en tiempo real.' },
        { q: '¿Cómo funciona el agendamiento con IA?', a: 'Abre el asistente de IA y describe tus tareas naturalmente (ej: "Agregar gimnasio 3 veces a la semana a las 7am"). La IA crea las tareas por ti.' },
        { q: '¿Qué es el temporizador Pomodoro?', a: 'Un temporizador de enfoque basado en la Técnica Pomodoro: 25 minutos de trabajo seguidos de descansos de 5 minutos. Ayuda a mantener la concentración.' },
        { q: '¿Cómo funcionan las Notas?', a: 'Crea notas rápidas, listas de verificación o ideas. Fija notas importantes, usa colores y busca en tu colección.' },
        { q: '¿Qué es el Smart Calendar?', a: 'Una vista de calendario de tus tareas semanales. Ve tu agenda de un vistazo e identifica franjas de tiempo libre.' },
      ],
      billing: [
        { q: '¿WeekFlow es gratuito?', a: '¡Sí! Las funciones principales son completamente gratuitas. Pro desbloquea tareas ilimitadas, sincronización en la nube y analíticas avanzadas.' },
        { q: '¿Qué incluye Pro?', a: 'Pro ($8/mes o $64/año) incluye tareas ilimitadas, sincronización en la nube entre dispositivos, analíticas avanzadas, soporte prioritario y todas las funciones futuras.' },
        { q: '¿Qué incluye Business?', a: 'Business ($19/mes o $152/año) incluye todo de Pro más funciones de equipo, controles de administrador y soporte dedicado.' },
        { q: '¿Qué métodos de pago se aceptan?', a: 'Aceptamos tarjetas de crédito/débito y PIX (para usuarios de Brasil). Todos los pagos se procesan de forma segura a través de Stripe.' },
        { q: '¿Cómo cancelo mi suscripción?', a: 'Puedes cancelar en cualquier momento. Las funciones Pro permanecen activas hasta el final de tu período de facturación.' },
        { q: '¿Hay política de reembolso?', a: 'Contacta al soporte dentro de los 7 días posteriores a la compra para un reembolso completo si no estás satisfecho.' },
      ],
      technical: [
        { q: '¿Mis datos están seguros?', a: 'Sí. Tus datos están cifrados y almacenados de forma segura a través de Supabase con seguridad a nivel de fila. Nunca compartimos tus datos.' },
        { q: '¿Cómo funciona la sincronización en la nube?', a: 'Con una conexión a Supabase, tus tareas y notas se sincronizan automáticamente en todos tus dispositivos en tiempo real.' },
        { q: '¿Puedo exportar mis datos?', a: '¡Sí! Ve a Configuración > Exportar para descargar tus datos en CSV o JSON. También puedes imprimir tu horario.' },
        { q: '¿WeekFlow funciona sin conexión?', a: '¡Sí! Todos los datos se guardan localmente. La sincronización en la nube ocurre automáticamente cuando vuelves a estar en línea.' },
        { q: '¿Qué navegadores son compatibles?', a: 'WeekFlow funciona en todos los navegadores modernos: Chrome, Safari, Firefox y Edge (versiones más recientes).' },
      ],
    },
  },

  // ── Support Chat ────────────────────────────────────────────────────────────
  supportChat: {
    title: 'Soporte IA',
    subtitle: 'Asistente 24/7',
    placeholder: 'Pregunta cualquier cosa sobre WeekFlow...',
    greeting: '¡Hola! Soy el asistente de soporte IA de WeekFlow. ¿Cómo puedo ayudarte hoy?',
    errorMsg: 'Lo siento, algo salió mal. Por favor inténtalo de nuevo.',
  },

  // ── Landing Page ────────────────────────────────────────────────────────────
  landing: {
    badge: 'Versión 2.5 Disponible',
    heroTitle1: 'Organiza tu semana,',
    heroTitle2: 'encuentra tu flow.',
    heroSub: 'Domina tus responsabilidades recurrentes como trabajo, gimnasio y estudio con nuestro planificador semanal intuitivo diseñado para la vida moderna.',
    cta1: 'Construir mi semana',
    featuresTitle: 'Diseñado para tu ritmo',
    featuresub: 'Todo lo que necesitas para mantenerte consistente y equilibrado.',
    pricingTitle: 'Precios simples',
    pricingSub: 'Comienza gratis. Actualiza cuando estés listo.',
    faqTitle: 'Preguntas frecuentes',
    footerTagline: 'Organiza tu semana, encuentra tu flow.',
    login: 'Iniciar sesión',
    getStarted: 'Comenzar',
    goToDashboard: 'Mi Dashboard',
    free: 'Gratis', pro: 'Pro', business: 'Business',
    monthly: '/mes', yearly: '/año',
    mostPop: 'Más Popular', forTeams: 'Para equipos',
    freeForever: 'Gratis para siempre',
    save33: 'Ahorra 33% anual',
    noCreditCard: 'Sin tarjeta de crédito',
    startFree: 'Comenzar gratis',
    startPro: 'Suscribirse a Pro', startBusiness: 'Suscribirse a Business',
    features: [
      { icon: 'sync',     title: 'Rutinas Recurrentes',  desc: 'Configura tus hábitos semanales una vez y déjalos fluir automáticamente.' },
      { icon: 'palette',  title: 'Equilibrio Visual',    desc: 'Ve cómo se distribuye tu tiempo con categorías codificadas por color.' },
      { icon: 'insights', title: 'Perspectivas de Progreso', desc: 'Obtén retroalimentación basada en datos sobre tu consistencia.' },
      { icon: 'group',    title: 'FlowCircle',            desc: 'Planifica junto con tu pareja, amigos, familia o equipo.' },
      { icon: 'smart_toy',title: 'Agendamiento con IA',  desc: 'Agrega tareas naturalmente con IA. Solo escribe lo que necesitas hacer.' },
      { icon: 'notifications', title: 'Recordatorios Inteligentes', desc: 'Nunca pierdas una tarea con notificaciones push y alarmas.' },
    ],
    faqs: [
      { q: '¿Hay una aplicación móvil?',    a: '¡Sí! Disponible en iOS, Android y como aplicación de escritorio para Windows.' },
      { q: '¿WeekFlow es gratuito?',        a: 'Sí, las funciones principales son gratuitas. Pro desbloquea tareas ilimitadas y sincronización en la nube.' },
      { q: '¿Cómo funciona FlowCircle?',   a: 'Crea un círculo, invita amigos mediante enlace y planifica eventos juntos en tiempo real.' },
      { q: '¿Mis datos están seguros?',    a: 'Sí. Tus datos están cifrados y almacenados de forma segura a través de Supabase.' },
    ],
  },

  // ── App-level strings ───────────────────────────────────────────────────────
  app: {
    updateBanner: 'Nueva versión de WeekFlow lista para instalar.',
    updateBtn: 'Reiniciar ahora',
    newTask: 'nueva tarea', searchShort: 'buscar', focus: 'enfoque',
    pushEnabled: '¡Notificaciones push activadas!',
  },

  // ── Upgrade Modal ───────────────────────────────────────────────────────────
  upgrade: {
    title: 'Actualizar a Pro',
    featureNeeded: 'Para usar {feature}, actualiza a Pro.',
    benefits: [
      'Tareas ilimitadas',
      'Sincronización en la nube entre dispositivos',
      'Analíticas avanzadas',
      'Soporte prioritario',
    ],
    upgradeCta: 'Actualizar Ahora',
    maybeLater: 'Quizás después',
  },

  // ── Tour Guide ──────────────────────────────────────────────────────────────
  tour: {
    welcome: '¡Bienvenido a WeekFlow!',
    welcomeDesc: 'Hagamos un recorrido rápido por tu nuevo planificador semanal.',
    sidebar: 'Navegación',
    sidebarDesc: 'Usa la barra lateral para navegar entre páginas.',
    addTaskBtn: 'Agregar Tareas',
    addTaskDesc: 'Haz clic aquí para crear una nueva tarea para tu semana.',
    searchDesc: 'Busca cualquier tarea por nombre, categoría o día.',
    aiDesc: 'Tu asistente de IA puede crear tareas a partir de lenguaje natural.',
    done: '¡Todo listo!',
    doneDesc: 'Comienza a agregar tareas y construyendo tu semana perfecta.',
    nextBtn: 'Siguiente', skipBtn: 'Saltar Tour', doneBtn: '¡Comenzar!',
  },

  // ── Splash Screen ──────────────────────────────────────────────────────────
  splash: {
    loading: 'Cargando tu flow...',
  },

  // ── Download Page ───────────────────────────────────────────────────────────
  download: {
    title: 'Aplicación de Escritorio',
    subtitle: 'Descarga WeekFlow para Windows para la mejor experiencia.',
    downloadBtn: 'Descargar para Windows',
    version: 'Versión',
  },
}
