export default {
  // ── Common ──────────────────────────────────────────────────────────────────
  common: {
    save: 'Save', cancel: 'Cancel', back: 'Back', continue: 'Continue',
    previous: 'Previous', next: 'Next', close: 'Close', delete: 'Delete',
    edit: 'Edit', add: 'Add', done: 'Done', loading: 'Loading...',
    confirm: 'Confirm', yes: 'Yes', no: 'No', or: 'Or',
    search: 'Search', settings: 'Settings', tryAgain: 'Try Again',
    resetReload: 'Reset & Reload', somethingWrong: 'Something went wrong',
    unexpectedError: 'An unexpected error occurred.',
    plan: 'Plan',
    weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    weekdaysShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    categories: { Work: 'Work', Gym: 'Gym', Study: 'Study', Rest: 'Rest', Other: 'Other' },
    priorities: { low: 'Low', medium: 'Medium', high: 'High' },
  },

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  sidebar: {
    dashboard: 'Dashboard', planner: 'Planner', today: 'Today',
    smartCal: 'Smart Cal', flowcircle: 'FlowCircle', notes: 'Notes',
    pomodoro: 'Pomodoro', analytics: 'Analytics', settings: 'Settings',
    desktopApp: 'Desktop App', faq: 'Help & FAQ',
    dailyProgress: 'Daily Progress', tasksDone: 'tasks done',
    resetRecurring: 'Reset recurring tasks',
    lightMode: 'Light Mode', darkMode: 'Dark Mode',
    user: 'User',
  },

  // ── BottomNav ───────────────────────────────────────────────────────────────
  bottomNav: {
    home: 'Home', planner: 'Planner', circles: 'Circles',
    stats: 'Stats', profile: 'Profile', add: 'Add',
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    searchTasks: 'Search tasks…', addTask: 'Add Task',
    enableAlerts: 'Enable alerts', notifications: 'Notifications',
    markAllRead: 'Mark all read', noNotifications: 'No notifications',
    notificationSettings: 'Notification Settings',
  },

  // ── Global Search ───────────────────────────────────────────────────────────
  globalSearch: {
    placeholder: 'Search tasks, categories, days...',
    typeMin: 'Type at least 2 characters to search',
    searchBy: 'Search by task name, category, day, or notes',
    noResults: 'No tasks found for',
    results: 'result', resultsPlural: 'results',
    open: 'open', weekflowSearch: 'WeekFlow Search',
  },

  // ── Add Task Modal ──────────────────────────────────────────────────────────
  addTask: {
    title: 'Create New Task',
    subtitle: 'Schedule your activities for the upcoming week.',
    taskName: 'Task Name',
    taskPlaceholder: 'e.g. Morning Workout, Team Meeting...',
    category: 'Category',
    dayOfWeek: 'Day of Week',
    selectAtLeast: 'Select at least one',
    daysSelected: 'day(s) selected',
    weekdaysBtn: 'Weekdays', allBtn: 'All',
    startTime: 'Start Time',
    hour: 'Hour', minute: 'Minute',
    duration: 'Duration (minutes)',
    priority: 'Priority',
    taskColor: 'Task Color',
    recurring: 'Recurring',
    weeklyRepeat: 'Weekly repeat', oneTime: 'One-time',
    notes: 'Notes', notesOptional: '(optional)',
    notesPlaceholder: 'Any details or reminders...',
    createTask: 'Create Task', createTasks: 'Create {n} Tasks',
    taskAdded: 'Task Added!',
  },

  // ── Dashboard ───────────────────────────────────────────────────────────────
  dashboard: {
    greeting: 'Good morning, {name}.',
    subtitle: 'Ready for your flow?',
    aiAssistant: 'AI Assistant',
    exportCalendar: 'Export to Calendar',
    addTask: 'Add Task',
    emptyTitle: 'Your week is blank',
    emptyDesc: 'Add your first task or let AI build your week for you',
    addTaskBtn: 'Add task',
    askAI: 'Ask AI',
    weeklyCompletion: 'Weekly Completion',
    totalTasks: 'Total Tasks',
    busiestDay: 'Busiest Day',
    focusScore: 'Focus Score',
    weekOverview: 'Current Week Overview',
    viewPlanner: 'View full planner →',
    tasks: 'tasks',
    smartReminders: 'Smart Reminders',
    highPriority: 'High Priority',
    allHighDone: 'All high-priority tasks are completed!',
    focusSession: 'Focus Session',
    focusDesc: 'Maximize productivity with a deep work session.',
    pause: 'Pause', startSession: 'Start Session',
    tasksByCategory: 'Tasks by Category',
  },

  // ── Onboarding ──────────────────────────────────────────────────────────────
  onboarding: {
    steps: ['Goal', 'Activities', 'Work Hours', 'Wake Up', 'Days Off', 'Summary'],
    // Step 0: Goal
    goalTitle: "What's your main goal?",
    goalSubtitle: "We'll adapt your schedule based on your focus.",
    goals: {
      organized:    { title: 'Be Organized',    desc: 'Everything in its right place, always.' },
      stress:       { title: 'Less Stress',      desc: 'A calm, structured week for peace of mind.' },
      routine:      { title: 'Build Routine',    desc: 'Lock in healthy, productive habits.' },
      productivity: { title: 'Productivity',     desc: 'Accomplish more in less time.' },
    },
    chooseGoal: 'Please choose a goal to continue',
    // Step 1: Activities
    activitiesTitle: 'What activities do you track?',
    activitiesSubtitle: 'Select one or more. These will shape your week.',
    activities: {
      work: 'Work', gym: 'Gym', study: 'Study', meditation: 'Meditation',
      cooking: 'Cooking', reading: 'Reading', social: 'Social', rest: 'Rest',
    },
    selectActivity: 'Please select at least one activity',
    // Step 2: Work Hours
    workTitle: 'When do you usually work?',
    workSubtitle: "We'll block these hours automatically in your planner.",
    workStarts: 'Work starts at', workEnds: 'Work ends at',
    focusHours: 'Focus hours:',
    noWork: "I don't work",
    noWorkLabel: 'Does not work',
    // Step 3: Wake Up
    wakeTitle: 'What time do you wake up?',
    wakeSubtitle: "We'll schedule morning routines around your wake-up time.",
    wakeLabel: 'Wake up at',
    morningStarts: 'Your morning routine starts at',
    // Step 4: Days Off
    daysOffTitle: 'Which days are your rest days?',
    daysOffSubtitle: "We'll keep these days lighter or free.",
    // Step 5: Summary
    summaryTitle: 'Your WeekFlow is ready!',
    summarySubtitle: "Here's what we built for you. You can always adjust later.",
    summaryGoal: 'Main Goal', summaryHours: 'Work Hours',
    summaryWake: 'Wake Up', summaryDaysOff: 'Rest Days',
    summaryActivities: 'Activities',
    letsGo: "Let's go!", settingUp: 'Setting up...',
    confirmTime: 'Confirm',
  },

  // ── Login ───────────────────────────────────────────────────────────────────
  login: {
    signIn: 'Sign In', signUp: 'Sign Up',
    fullName: 'Full Name', emailAddress: 'Email address',
    password: 'Password', namePlaceholder: 'Your Name',
    emailPlaceholder: 'you@email.com', passwordPlaceholder: '••••••••',
    createAccount: 'Create Account',
    orContinueWith: 'Or continue with',
    connectedSupabase: 'Connected to Supabase · Data syncs across all devices',
    offlineMode: 'Offline mode · Data saved locally',
    tagline: 'Organize your week. Find your flow.',
    // Forgot password
    forgotPassword: 'Forgot password?',
    forgotTitle: 'Reset your password',
    forgotSubtitle: 'Enter your email and we\'ll send you a reset link.',
    sendResetLink: 'Send reset link',
    backToLogin: 'Back to login',
    resetEmailSent: 'Check your email for the reset link!',
    // Reset password
    resetTitle: 'Set new password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    updatePassword: 'Update Password',
    passwordUpdated: 'Password updated! You can now sign in.',
    passwordsMismatch: 'Passwords do not match.',
    // Email verification modal
    verifyTitle: 'Check your email',
    verifySent: 'We sent a verification link to:',
    resendEmail: "Didn't receive it? Resend",
    resending: 'Sending...',
    resendSuccess: 'Email resent successfully!',
    goToSignIn: 'Go to Sign In',
  },

  // ── Planner ─────────────────────────────────────────────────────────────────
  planner: {
    title: 'Weekly Planner',
    subtitle: 'Plan your week for maximum flow.',
    newTask: 'New Task',
    noTasks: 'No tasks yet',
    addFirst: 'Add your first task to get started.',
    completed: 'completed',
  },

  // ── Daily ───────────────────────────────────────────────────────────────────
  daily: {
    title: 'Today',
    noTasks: 'No tasks for today',
    addSome: 'Your day is wide open. Add some tasks!',
  },

  // ── Pomodoro ────────────────────────────────────────────────────────────────
  pomodoro: {
    title: 'Focus Timer',
    modes: { pomodoro: 'Pomodoro', shortBreak: 'Short Break', longBreak: 'Long Break', timer: 'Timer' },
    start: 'Start', pause: 'Pause', reset: 'Reset',
    sessions: 'Sessions',
  },

  // ── Notes ───────────────────────────────────────────────────────────────────
  notes: {
    title: 'Notes',
    newNote: 'New Note',
    searchNotes: 'Search notes...',
    noNotes: 'No notes yet',
    startWriting: 'Start writing your first note.',
    deleteConfirm: 'Delete this note?',
  },

  // ── Analytics ───────────────────────────────────────────────────────────────
  analytics: {
    title: 'Analytics',
    subtitle: 'Track your progress and consistency.',
    completionRate: 'Completion Rate',
    streak: 'Current Streak',
    bestStreak: 'Best Streak',
    totalCompleted: 'Total Completed',
    exportData: 'Export Data',
  },

  // ── Settings ────────────────────────────────────────────────────────────────
  settings: {
    title: 'Settings',
    tabs: { profile: 'Profile', appearance: 'Appearance', notifications: 'Notifications', export: 'Export', dangerZone: 'Danger Zone' },
    profile: {
      name: 'Display Name', email: 'Email', plan: 'Current Plan',
      upgradePro: 'Upgrade to Pro',
    },
    appearance: {
      darkMode: 'Dark Mode', darkModeDesc: 'Switch between light and dark theme.',
      language: 'Language', languageDesc: 'Choose your preferred language.',
    },
    notif: {
      push: 'Push Notifications', pushDesc: 'Get reminders for upcoming tasks.',
      sound: 'Sound Effects', soundDesc: 'Play sounds on task completion.',
    },
    export: {
      title: 'Export Your Data',
      csv: 'Export CSV', json: 'Export JSON', print: 'Print',
    },
    danger: {
      title: 'Danger Zone',
      clearTasks: 'Clear All Tasks', clearTasksDesc: 'Delete all your tasks permanently.',
      clearNotes: 'Clear All Notes', clearNotesDesc: 'Delete all your notes permanently.',
      deleteAccount: 'Delete Account', deleteAccountDesc: 'Delete your account and all data.',
      confirmClear: 'Are you sure? This cannot be undone.',
    },
  },

  // ── FlowCircle ──────────────────────────────────────────────────────────────
  flowcircle: {
    title: 'FlowCircle',
    subtitle: 'Plan together with friends, family, or your team.',
    createCircle: 'Create Circle',
    joinCircle: 'Join Circle',
    noCircles: 'No circles yet',
    noCirclesDesc: 'Create a circle to start planning with others.',
    members: 'members', events: 'events',
    invite: 'Invite', leave: 'Leave',
  },

  // ── Smart Calendar ──────────────────────────────────────────────────────────
  smartCalendar: {
    title: 'Smart Calendar',
    subtitle: 'Your tasks visualized on a calendar.',
  },

  // ── Checkout ────────────────────────────────────────────────────────────────
  checkout: {
    title: 'Upgrade your plan',
    payWith: 'Pay with',
    card: 'Card', pix: 'PIX',
    subscribe: 'Subscribe',
    payNow: 'Pay now',
    successTitle: 'Payment successful!',
    successMsg: 'Your plan has been upgraded.',
    canceledTitle: 'Payment canceled',
    canceledMsg: 'No charges were made.',
    goToDashboard: 'Go to Dashboard',
  },

  // ── FAQ ─────────────────────────────────────────────────────────────────────
  faq: {
    title: 'Help & FAQ',
    subtitle: 'Find answers to common questions or chat with our AI support.',
    searchPlaceholder: 'Search questions...',
    categories: {
      general: 'General',
      account: 'Account',
      features: 'Features',
      billing: 'Billing',
      technical: 'Technical',
    },
    stillNeedHelp: 'Still need help?',
    chatWithAI: 'Chat with AI Support',
    items: {
      general: [
        { q: 'What is WeekFlow?', a: 'WeekFlow is an intuitive weekly planner designed for modern life. Organize recurring responsibilities like work, gym, and study with visual balance and smart features.' },
        { q: 'Is there a mobile app?', a: 'Yes! WeekFlow is available as a progressive web app (PWA) that works on iOS, Android, and as a desktop app for Windows.' },
        { q: 'What platforms are supported?', a: 'WeekFlow works on any modern browser (Chrome, Safari, Firefox, Edge), plus desktop app for Windows and mobile PWA for iOS/Android.' },
        { q: 'Is WeekFlow available in other languages?', a: 'Yes! WeekFlow supports English, Portuguese, and Spanish. You can change the language in Settings > Appearance.' },
      ],
      account: [
        { q: 'How do I create an account?', a: 'Click "Get Started" on the landing page, then sign up with your email and password, or use Google/Apple login.' },
        { q: 'How do I reset my password?', a: 'On the login page, click "Forgot password?" and enter your email. You\'ll receive a reset link.' },
        { q: 'How do I delete my account?', a: 'Go to Settings > Danger Zone > Delete Account. This will permanently remove all your data.' },
        { q: 'Can I sign in with Google or Apple?', a: 'Yes! Both Google and Apple sign-in are supported for quick access.' },
      ],
      features: [
        { q: 'How does the weekly planner work?', a: 'Create tasks with categories, days, times, and priorities. Tasks appear on your weekly view and can be marked as recurring for automatic weekly repetition.' },
        { q: 'What is FlowCircle?', a: 'FlowCircle lets you create groups to plan events together with friends, family, or team members in real-time.' },
        { q: 'How does AI scheduling work?', a: 'Open the AI assistant and describe your tasks naturally (e.g., "Add gym 3 times a week at 7am"). The AI creates the tasks for you.' },
        { q: 'What is the Pomodoro timer?', a: 'A focus timer based on the Pomodoro Technique: 25 minutes of work followed by 5-minute breaks. Helps maintain concentration.' },
        { q: 'How do Notes work?', a: 'Create quick notes, checklists, or ideas. Pin important notes, color-code them, and search through your collection.' },
        { q: 'What is the Smart Calendar?', a: 'A calendar view of your weekly tasks. See your schedule at a glance and identify free time slots.' },
      ],
      billing: [
        { q: 'Is WeekFlow free?', a: 'Yes! The core features are completely free. Pro unlocks unlimited tasks, cloud sync, and advanced analytics.' },
        { q: 'What does Pro include?', a: 'Pro ($8/mo or $64/yr) includes unlimited tasks, cloud sync across devices, advanced analytics, priority support, and all future features.' },
        { q: 'What does Business include?', a: 'Business ($19/mo or $152/yr) includes everything in Pro plus team features, admin controls, and dedicated support.' },
        { q: 'What payment methods are accepted?', a: 'We accept credit/debit cards and PIX (for Brazilian users). All payments are securely processed via Stripe.' },
        { q: 'How do I cancel my subscription?', a: 'You can cancel anytime. Your Pro features remain active until the end of your billing period.' },
        { q: 'Is there a refund policy?', a: 'Contact support within 7 days of purchase for a full refund if you\'re not satisfied.' },
      ],
      technical: [
        { q: 'Is my data secure?', a: 'Yes. Your data is encrypted and stored securely via Supabase with row-level security. We never share your data.' },
        { q: 'How does cloud sync work?', a: 'With a Supabase connection, your tasks and notes sync automatically across all your devices in real-time.' },
        { q: 'Can I export my data?', a: 'Yes! Go to Settings > Export to download your data as CSV or JSON. You can also print your schedule.' },
        { q: 'Does WeekFlow work offline?', a: 'Yes! All data is saved locally. Cloud sync happens automatically when you\'re back online.' },
        { q: 'What browsers are supported?', a: 'WeekFlow works on all modern browsers: Chrome, Safari, Firefox, and Edge (latest versions).' },
      ],
    },
  },

  // ── Support Chat ────────────────────────────────────────────────────────────
  supportChat: {
    title: 'AI Support',
    subtitle: '24/7 assistant',
    placeholder: 'Ask anything about WeekFlow...',
    greeting: "Hi! I'm WeekFlow's AI support assistant. How can I help you today?",
    errorMsg: 'Sorry, something went wrong. Please try again.',
  },

  // ── Landing Page ────────────────────────────────────────────────────────────
  landing: {
    badge: 'Version 2.5 Now Live',
    heroTitle1: 'Organize your week,',
    heroTitle2: 'find your flow.',
    heroSub: 'Master your recurring responsibilities like work, gym, and study with our intuitive weekly planner designed for modern life.',
    cta1: 'Build my week',
    featuresTitle: 'Designed for your rhythm',
    featuresub: 'Everything you need to stay consistent and balanced.',
    pricingTitle: 'Simple pricing',
    pricingSub: 'Start free. Upgrade when you\'re ready.',
    faqTitle: 'Frequently asked questions',
    footerTagline: 'Organize your week, find your flow.',
    login: 'Log In',
    getStarted: 'Get Started',
    goToDashboard: 'My Dashboard',
    free: 'Free', pro: 'Pro', business: 'Business',
    monthly: '/mo', yearly: '/yr',
    mostPop: 'Most Popular', forTeams: 'For teams',
    freeForever: 'Free forever',
    save33: 'Save 33% yearly',
    noCreditCard: 'No credit card needed',
    startFree: 'Get started free',
    startPro: 'Start Pro', startBusiness: 'Start Business',
    features: [
      { icon: 'sync',     title: 'Recurring Routines',   desc: 'Set your weekly habits once and let them flow automatically.' },
      { icon: 'palette',  title: 'Visual Balance',        desc: 'See how your time is distributed with color-coded categories.' },
      { icon: 'insights', title: 'Progress Insights',     desc: 'Get data-driven feedback on your consistency and habits.' },
      { icon: 'group',    title: 'FlowCircle',            desc: 'Plan together with your partner, friends, family or team.' },
      { icon: 'smart_toy',title: 'AI Scheduling',         desc: 'Add tasks naturally with AI. Just type what you need to do.' },
      { icon: 'notifications', title: 'Smart Reminders',  desc: 'Never miss a task with push notifications and alarms.' },
    ],
    faqs: [
      { q: 'Is there a mobile app?',            a: 'Yes! Available on iOS, Android, and as a desktop app for Windows.' },
      { q: 'Is WeekFlow free?',                 a: 'Yes, the core features are free. Pro unlocks unlimited tasks and cloud sync.' },
      { q: 'How does FlowCircle work?',         a: 'Create a circle, invite friends via link, and plan events together in real time.' },
      { q: 'Is my data secure?',                a: 'Yes. Your data is encrypted and stored securely via Supabase.' },
    ],
  },

  // ── App-level strings ───────────────────────────────────────────────────────
  app: {
    updateBanner: 'New version of WeekFlow ready to install.',
    updateBtn: 'Restart now',
    newTask: 'new task', searchShort: 'search', focus: 'focus',
    pushEnabled: 'Push notifications enabled!',
  },

  // ── Upgrade Modal ───────────────────────────────────────────────────────────
  upgrade: {
    title: 'Upgrade to Pro',
    featureNeeded: 'To use {feature}, upgrade to Pro.',
    benefits: [
      'Unlimited tasks',
      'Cloud sync across devices',
      'Advanced analytics',
      'Priority support',
    ],
    upgradeCta: 'Upgrade Now',
    maybeLater: 'Maybe later',
  },

  // ── Tour Guide ──────────────────────────────────────────────────────────────
  tour: {
    welcome: 'Welcome to WeekFlow!',
    welcomeDesc: "Let's take a quick tour of your new weekly planner.",
    sidebar: 'Navigation',
    sidebarDesc: 'Use the sidebar to navigate between pages.',
    addTaskBtn: 'Add Tasks',
    addTaskDesc: 'Click here to create a new task for your week.',
    searchDesc: 'Search for any task by name, category, or day.',
    aiDesc: 'Your AI assistant can create tasks from natural language.',
    done: 'You\'re all set!',
    doneDesc: 'Start adding tasks and building your perfect week.',
    nextBtn: 'Next', skipBtn: 'Skip Tour', doneBtn: 'Get Started!',
  },

  // ── Splash Screen ──────────────────────────────────────────────────────────
  splash: {
    loading: 'Loading your flow...',
  },

  // ── Download Page ───────────────────────────────────────────────────────────
  download: {
    title: 'Desktop App',
    subtitle: 'Download WeekFlow for Windows for the best experience.',
    downloadBtn: 'Download for Windows',
    version: 'Version',
  },
}
