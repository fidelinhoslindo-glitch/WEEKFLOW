export default {
  // ── Common ──────────────────────────────────────────────────────────────────
  common: {
    save: 'Salvar', cancel: 'Cancelar', back: 'Voltar', continue: 'Continuar',
    previous: 'Anterior', next: 'Próximo', close: 'Fechar', delete: 'Excluir',
    edit: 'Editar', add: 'Adicionar', done: 'Concluído', loading: 'Carregando...',
    confirm: 'Confirmar', yes: 'Sim', no: 'Não', or: 'Ou',
    search: 'Buscar', settings: 'Configurações', tryAgain: 'Tentar novamente',
    resetReload: 'Resetar & Recarregar', somethingWrong: 'Algo deu errado',
    unexpectedError: 'Ocorreu um erro inesperado.',
    plan: 'Plano',
    weekdays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
    weekdaysShort: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    categories: { Work: 'Trabalho', Gym: 'Academia', Study: 'Estudo', Rest: 'Descanso', Other: 'Outro' },
    priorities: { low: 'Baixa', medium: 'Média', high: 'Alta' },
  },

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  sidebar: {
    dashboard: 'Início', planner: 'Planner', today: 'Hoje',
    smartCal: 'Smart Cal', flowcircle: 'FlowCircle', notes: 'Notas',
    pomodoro: 'Pomodoro', analytics: 'Analytics', settings: 'Configurações',
    desktopApp: 'App Desktop', faq: 'Ajuda & FAQ',
    dailyProgress: 'Progresso Diário', tasksDone: 'tarefas concluídas',
    resetRecurring: 'Resetar tarefas recorrentes',
    lightMode: 'Modo Claro', darkMode: 'Modo Escuro',
    user: 'Usuário',
  },

  // ── BottomNav ───────────────────────────────────────────────────────────────
  bottomNav: {
    home: 'Início', planner: 'Planner', circles: 'Círculos',
    stats: 'Stats', profile: 'Perfil', add: 'Adicionar',
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    searchTasks: 'Buscar tarefas…', addTask: 'Nova Tarefa',
    enableAlerts: 'Ativar alertas', notifications: 'Notificações',
    markAllRead: 'Marcar todas como lidas', noNotifications: 'Sem notificações',
    notificationSettings: 'Configurações de Notificação',
  },

  // ── Global Search ───────────────────────────────────────────────────────────
  globalSearch: {
    placeholder: 'Buscar tarefas, categorias, dias...',
    typeMin: 'Digite ao menos 2 caracteres para buscar',
    searchBy: 'Busque por nome, categoria, dia ou anotações',
    noResults: 'Nenhuma tarefa encontrada para',
    results: 'resultado', resultsPlural: 'resultados',
    open: 'abrir', weekflowSearch: 'Busca WeekFlow',
  },

  // ── Add Task Modal ──────────────────────────────────────────────────────────
  addTask: {
    title: 'Criar Nova Tarefa',
    subtitle: 'Agende suas atividades para a semana.',
    taskName: 'Nome da Tarefa',
    taskPlaceholder: 'ex: Treino Matinal, Reunião de Equipe...',
    category: 'Categoria',
    dayOfWeek: 'Dia da Semana',
    selectAtLeast: 'Selecione ao menos um',
    daysSelected: 'dia(s) selecionado(s)',
    weekdaysBtn: 'Dias úteis', allBtn: 'Todos',
    startTime: 'Horário de Início',
    hour: 'Hora', minute: 'Minuto',
    duration: 'Duração (minutos)',
    priority: 'Prioridade',
    taskColor: 'Cor da Tarefa',
    recurring: 'Recorrente',
    weeklyRepeat: 'Repetição semanal', oneTime: 'Única vez',
    notes: 'Notas', notesOptional: '(opcional)',
    notesPlaceholder: 'Detalhes ou lembretes...',
    createTask: 'Criar Tarefa', createTasks: 'Criar {n} Tarefas',
    taskAdded: 'Tarefa Criada!',
  },

  // ── Dashboard ───────────────────────────────────────────────────────────────
  dashboard: {
    greeting: 'Bom dia, {name}.',
    subtitle: 'Pronto para entrar no flow?',
    aiAssistant: 'Assistente IA',
    exportCalendar: 'Exportar para Calendário',
    addTask: 'Nova Tarefa',
    emptyTitle: 'Sua semana está em branco',
    emptyDesc: 'Adicione sua primeira tarefa ou deixe a IA montar sua semana',
    addTaskBtn: 'Adicionar tarefa',
    askAI: 'Perguntar à IA',
    weeklyCompletion: 'Conclusão Semanal',
    totalTasks: 'Total de Tarefas',
    busiestDay: 'Dia Mais Cheio',
    focusScore: 'Pontuação de Foco',
    weekOverview: 'Visão da Semana Atual',
    viewPlanner: 'Ver planner completo →',
    tasks: 'tarefas',
    smartReminders: 'Lembretes Inteligentes',
    highPriority: 'Alta Prioridade',
    allHighDone: 'Todas as tarefas de alta prioridade concluídas!',
    focusSession: 'Sessão de Foco',
    focusDesc: 'Maximize sua produtividade com uma sessão de trabalho profundo.',
    pause: 'Pausar', startSession: 'Iniciar Sessão',
    tasksByCategory: 'Tarefas por Categoria',
  },

  // ── Onboarding ──────────────────────────────────────────────────────────────
  onboarding: {
    steps: ['Objetivo', 'Atividades', 'Horário', 'Acordar', 'Folgas', 'Resumo'],
    // Step 0: Goal
    goalTitle: 'Qual é o seu principal objetivo?',
    goalSubtitle: 'Vamos adaptar sua agenda com base no seu foco.',
    goals: {
      organized:    { title: 'Ser Organizado',    desc: 'Tudo no lugar certo, sempre.' },
      stress:       { title: 'Menos Estresse',     desc: 'Uma semana calma e estruturada.' },
      routine:      { title: 'Criar Rotina',       desc: 'Desenvolva hábitos saudáveis e produtivos.' },
      productivity: { title: 'Produtividade',      desc: 'Realize mais em menos tempo.' },
    },
    chooseGoal: 'Por favor, escolha um objetivo para continuar',
    // Step 1: Activities
    activitiesTitle: 'Quais atividades você acompanha?',
    activitiesSubtitle: 'Selecione uma ou mais. Elas vão moldar sua semana.',
    activities: {
      work: 'Trabalho', gym: 'Academia', study: 'Estudo', meditation: 'Meditação',
      cooking: 'Culinária', reading: 'Leitura', social: 'Social', rest: 'Descanso',
    },
    selectActivity: 'Por favor, selecione ao menos uma atividade',
    // Step 2: Work Hours
    workTitle: 'Qual é o seu horário de trabalho?',
    workSubtitle: 'Vamos bloquear esses horários automaticamente no seu planner.',
    workStarts: 'Trabalho começa às', workEnds: 'Trabalho termina às',
    focusHours: 'Horas de foco:',
    noWork: 'Eu não trabalho',
    noWorkLabel: 'Não trabalha',
    // Step 3: Wake Up
    wakeTitle: 'Que horas você acorda?',
    wakeSubtitle: 'Vamos programar sua rotina matinal a partir do seu horário de acordar.',
    wakeLabel: 'Acordar às',
    morningStarts: 'Sua manhã começa às',
    // Step 4: Days Off
    daysOffTitle: 'Quais são seus dias de descanso?',
    daysOffSubtitle: 'Vamos deixar esses dias mais leves ou livres.',
    // Step 5: Summary
    summaryTitle: 'Seu WeekFlow está pronto!',
    summarySubtitle: 'Veja o que montamos para você. Você pode ajustar a qualquer momento.',
    summaryGoal: 'Objetivo Principal', summaryHours: 'Horário de Trabalho',
    summaryWake: 'Acordar', summaryDaysOff: 'Dias de Folga',
    summaryActivities: 'Atividades',
    letsGo: 'Vamos lá!', settingUp: 'Configurando...',
    confirmTime: 'Confirmar',
  },

  // ── Login ───────────────────────────────────────────────────────────────────
  login: {
    signIn: 'Entrar', signUp: 'Cadastrar',
    fullName: 'Nome Completo', emailAddress: 'Endereço de email',
    password: 'Senha', namePlaceholder: 'Seu Nome',
    emailPlaceholder: 'voce@email.com', passwordPlaceholder: '••••••••',
    createAccount: 'Criar Conta',
    orContinueWith: 'Ou continue com',
    connectedSupabase: 'Conectado ao Supabase · Dados sincronizados em todos os dispositivos',
    offlineMode: 'Modo offline · Dados salvos localmente',
    tagline: 'Organize sua semana. Encontre seu flow.',
    // Forgot password
    forgotPassword: 'Esqueci minha senha',
    forgotTitle: 'Redefinir sua senha',
    forgotSubtitle: 'Digite seu email e enviaremos um link de redefinição.',
    sendResetLink: 'Enviar link de redefinição',
    backToLogin: 'Voltar para o login',
    resetEmailSent: 'Verifique seu email para o link de redefinição!',
    // Reset password
    resetTitle: 'Definir nova senha',
    newPassword: 'Nova Senha',
    confirmPassword: 'Confirmar Senha',
    updatePassword: 'Atualizar Senha',
    passwordUpdated: 'Senha atualizada! Você já pode entrar.',
    passwordsMismatch: 'As senhas não coincidem.',
    // Email verification modal
    verifyTitle: 'Verifique seu email',
    verifySent: 'Enviamos um link de verificação para:',
    resendEmail: 'Não recebeu? Reenviar',
    resending: 'Enviando...',
    resendSuccess: 'Email reenviado com sucesso!',
    goToSignIn: 'Ir para Login',
  },

  // ── Planner ─────────────────────────────────────────────────────────────────
  planner: {
    title: 'Planner Semanal',
    subtitle: 'Planeje sua semana para máximo flow.',
    newTask: 'Nova Tarefa',
    noTasks: 'Nenhuma tarefa ainda',
    addFirst: 'Adicione sua primeira tarefa para começar.',
    completed: 'concluída(s)',
  },

  // ── Daily ───────────────────────────────────────────────────────────────────
  daily: {
    title: 'Hoje',
    noTasks: 'Nenhuma tarefa para hoje',
    addSome: 'Seu dia está livre. Adicione algumas tarefas!',
  },

  // ── Pomodoro ────────────────────────────────────────────────────────────────
  pomodoro: {
    title: 'Timer de Foco',
    modes: { pomodoro: 'Pomodoro', shortBreak: 'Pausa Curta', longBreak: 'Pausa Longa', timer: 'Timer' },
    start: 'Iniciar', pause: 'Pausar', reset: 'Reiniciar',
    sessions: 'Sessões',
  },

  // ── Notes ───────────────────────────────────────────────────────────────────
  notes: {
    title: 'Notas',
    newNote: 'Nova Nota',
    searchNotes: 'Buscar notas...',
    noNotes: 'Nenhuma nota ainda',
    startWriting: 'Comece a escrever sua primeira nota.',
    deleteConfirm: 'Excluir esta nota?',
  },

  // ── Analytics ───────────────────────────────────────────────────────────────
  analytics: {
    title: 'Analytics',
    subtitle: 'Acompanhe seu progresso e consistência.',
    completionRate: 'Taxa de Conclusão',
    streak: 'Sequência Atual',
    bestStreak: 'Melhor Sequência',
    totalCompleted: 'Total Concluído',
    exportData: 'Exportar Dados',
  },

  // ── Settings ────────────────────────────────────────────────────────────────
  settings: {
    title: 'Configurações',
    tabs: { profile: 'Perfil', appearance: 'Aparência', notifications: 'Notificações', export: 'Exportar', dangerZone: 'Zona de Perigo' },
    profile: {
      name: 'Nome de Exibição', email: 'Email', plan: 'Plano Atual',
      upgradePro: 'Assinar Pro',
    },
    appearance: {
      darkMode: 'Modo Escuro', darkModeDesc: 'Alternar entre tema claro e escuro.',
      language: 'Idioma', languageDesc: 'Escolha seu idioma preferido.',
    },
    notif: {
      push: 'Notificações Push', pushDesc: 'Receba lembretes de tarefas.',
      sound: 'Efeitos Sonoros', soundDesc: 'Reproduzir sons ao concluir tarefas.',
    },
    export: {
      title: 'Exportar Seus Dados',
      csv: 'Exportar CSV', json: 'Exportar JSON', print: 'Imprimir',
    },
    danger: {
      title: 'Zona de Perigo',
      clearTasks: 'Limpar Todas as Tarefas', clearTasksDesc: 'Exclui todas as suas tarefas permanentemente.',
      clearNotes: 'Limpar Todas as Notas', clearNotesDesc: 'Exclui todas as suas notas permanentemente.',
      deleteAccount: 'Excluir Conta', deleteAccountDesc: 'Exclui sua conta e todos os dados.',
      confirmClear: 'Tem certeza? Isso não pode ser desfeito.',
    },
  },

  // ── FlowCircle ──────────────────────────────────────────────────────────────
  flowcircle: {
    title: 'FlowCircle',
    subtitle: 'Planeje junto com amigos, família ou sua equipe.',
    createCircle: 'Criar Círculo',
    joinCircle: 'Entrar em Círculo',
    noCircles: 'Nenhum círculo ainda',
    noCirclesDesc: 'Crie um círculo para começar a planejar com outras pessoas.',
    members: 'membros', events: 'eventos',
    invite: 'Convidar', leave: 'Sair',
  },

  // ── Smart Calendar ──────────────────────────────────────────────────────────
  smartCalendar: {
    title: 'Smart Calendar',
    subtitle: 'Suas tarefas visualizadas em um calendário.',
  },

  // ── Checkout ────────────────────────────────────────────────────────────────
  checkout: {
    title: 'Faça upgrade do seu plano',
    payWith: 'Pagar com',
    card: 'Cartão', pix: 'PIX',
    subscribe: 'Assinar',
    payNow: 'Pagar agora',
    successTitle: 'Pagamento realizado!',
    successMsg: 'Seu plano foi atualizado.',
    canceledTitle: 'Pagamento cancelado',
    canceledMsg: 'Nenhuma cobrança foi realizada.',
    goToDashboard: 'Ir para o Início',
  },

  // ── FAQ ─────────────────────────────────────────────────────────────────────
  faq: {
    title: 'Ajuda & FAQ',
    subtitle: 'Encontre respostas ou converse com nosso suporte por IA.',
    searchPlaceholder: 'Buscar perguntas...',
    categories: {
      general: 'Geral',
      account: 'Conta',
      features: 'Funcionalidades',
      billing: 'Pagamento',
      technical: 'Técnico',
    },
    stillNeedHelp: 'Ainda precisa de ajuda?',
    chatWithAI: 'Conversar com Suporte IA',
    items: {
      general: [
        { q: 'O que é o WeekFlow?', a: 'WeekFlow é um planner semanal intuitivo para a vida moderna. Organize responsabilidades recorrentes como trabalho, academia e estudo com equilíbrio visual e recursos inteligentes.' },
        { q: 'Tem aplicativo mobile?', a: 'Sim! WeekFlow está disponível como PWA (Progressive Web App) para iOS, Android e como app desktop para Windows.' },
        { q: 'Quais plataformas são suportadas?', a: 'WeekFlow funciona em qualquer navegador moderno (Chrome, Safari, Firefox, Edge), além do app desktop para Windows e PWA mobile para iOS/Android.' },
        { q: 'O WeekFlow está disponível em outros idiomas?', a: 'Sim! WeekFlow suporta Português, Inglês e Espanhol. Altere o idioma em Configurações > Aparência.' },
      ],
      account: [
        { q: 'Como crio uma conta?', a: 'Clique em "Começar" na página inicial, depois cadastre-se com email e senha ou use o login com Google/Apple.' },
        { q: 'Como redefino minha senha?', a: 'Na página de login, clique em "Esqueci minha senha" e informe seu email. Você receberá um link de redefinição.' },
        { q: 'Como excluo minha conta?', a: 'Vá em Configurações > Zona de Perigo > Excluir Conta. Isso removerá todos os seus dados permanentemente.' },
        { q: 'Posso entrar com Google ou Apple?', a: 'Sim! Login com Google e Apple são suportados para acesso rápido.' },
      ],
      features: [
        { q: 'Como funciona o planner semanal?', a: 'Crie tarefas com categorias, dias, horários e prioridades. As tarefas aparecem na visualização semanal e podem ser marcadas como recorrentes para repetição automática.' },
        { q: 'O que é o FlowCircle?', a: 'FlowCircle permite criar grupos para planejar eventos junto com amigos, família ou colegas de equipe em tempo real.' },
        { q: 'Como funciona o agendamento por IA?', a: 'Abra o assistente de IA e descreva suas tarefas naturalmente (ex: "Adicionar academia 3x na semana às 7h"). A IA cria as tarefas para você.' },
        { q: 'O que é o timer Pomodoro?', a: 'Um timer de foco baseado na Técnica Pomodoro: 25 minutos de trabalho seguidos de pausas de 5 minutos. Ajuda a manter a concentração.' },
        { q: 'Como as Notas funcionam?', a: 'Crie notas rápidas, checklists ou ideias. Fixe notas importantes, use cores e pesquise na sua coleção.' },
        { q: 'O que é o Smart Calendar?', a: 'Uma visualização de calendário das suas tarefas semanais. Veja sua agenda de relance e identifique horários livres.' },
      ],
      billing: [
        { q: 'O WeekFlow é gratuito?', a: 'Sim! Os recursos principais são completamente gratuitos. O Pro libera tarefas ilimitadas, sincronização na nuvem e analytics avançado.' },
        { q: 'O que o Pro inclui?', a: 'Pro (R$X/mês ou R$Y/ano) inclui tarefas ilimitadas, sync na nuvem entre dispositivos, analytics avançado, suporte prioritário e todos os recursos futuros.' },
        { q: 'O que o Business inclui?', a: 'Business inclui tudo do Pro mais recursos de equipe, controles de admin e suporte dedicado.' },
        { q: 'Quais métodos de pagamento são aceitos?', a: 'Aceitamos cartão de crédito/débito e PIX. Todos os pagamentos são processados com segurança via Stripe.' },
        { q: 'Como cancelo minha assinatura?', a: 'Você pode cancelar a qualquer momento. Os recursos Pro permanecem ativos até o fim do período de cobrança.' },
        { q: 'Tem política de reembolso?', a: 'Entre em contato com o suporte em até 7 dias após a compra para reembolso total caso não esteja satisfeito.' },
      ],
      technical: [
        { q: 'Meus dados estão seguros?', a: 'Sim. Seus dados são criptografados e armazenados com segurança via Supabase com segurança em nível de linha. Nunca compartilhamos seus dados.' },
        { q: 'Como funciona a sincronização na nuvem?', a: 'Com conexão ao Supabase, suas tarefas e notas sincronizam automaticamente em todos os seus dispositivos em tempo real.' },
        { q: 'Posso exportar meus dados?', a: 'Sim! Vá em Configurações > Exportar para baixar seus dados em CSV ou JSON. Você também pode imprimir sua agenda.' },
        { q: 'O WeekFlow funciona offline?', a: 'Sim! Todos os dados são salvos localmente. A sincronização na nuvem acontece automaticamente quando você voltar online.' },
        { q: 'Quais navegadores são suportados?', a: 'WeekFlow funciona em todos os navegadores modernos: Chrome, Safari, Firefox e Edge (versões mais recentes).' },
      ],
    },
  },

  // ── Support Chat ────────────────────────────────────────────────────────────
  supportChat: {
    title: 'Suporte IA',
    subtitle: 'Assistente 24/7',
    placeholder: 'Pergunte qualquer coisa sobre o WeekFlow...',
    greeting: 'Olá! Sou o assistente de suporte IA do WeekFlow. Como posso ajudar você hoje?',
    errorMsg: 'Desculpe, algo deu errado. Por favor, tente novamente.',
  },

  // ── Landing Page ────────────────────────────────────────────────────────────
  landing: {
    badge: 'Versão 2.5 Disponível',
    heroTitle1: 'Organize sua semana,',
    heroTitle2: 'encontre seu flow.',
    heroSub: 'Domine suas responsabilidades recorrentes como trabalho, academia e estudo com nosso planner semanal intuitivo feito para a vida moderna.',
    cta1: 'Montar minha semana',
    featuresTitle: 'Feito para o seu ritmo',
    featuresub: 'Tudo que você precisa para se manter consistente e equilibrado.',
    pricingTitle: 'Preços simples',
    pricingSub: 'Comece grátis. Faça upgrade quando estiver pronto.',
    faqTitle: 'Perguntas frequentes',
    footerTagline: 'Organize sua semana, encontre seu flow.',
    login: 'Entrar',
    getStarted: 'Começar',
    goToDashboard: 'Meu Dashboard',
    free: 'Grátis', pro: 'Pro', business: 'Business',
    monthly: '/mês', yearly: '/ano',
    mostPop: 'Mais Popular', forTeams: 'Para equipes',
    freeForever: 'Grátis para sempre',
    save33: 'Economize 33% no anual',
    noCreditCard: 'Sem cartão de crédito',
    startFree: 'Começar grátis',
    startPro: 'Assinar Pro', startBusiness: 'Assinar Business',
    features: [
      { icon: 'sync',     title: 'Rotinas Recorrentes',  desc: 'Configure seus hábitos semanais uma vez e deixe fluir automaticamente.' },
      { icon: 'palette',  title: 'Equilíbrio Visual',    desc: 'Veja como seu tempo está distribuído com categorias coloridas.' },
      { icon: 'insights', title: 'Insights de Progresso',desc: 'Receba feedback baseado em dados sobre sua consistência.' },
      { icon: 'group',    title: 'FlowCircle',            desc: 'Planeje junto com seu parceiro, amigos, família ou equipe.' },
      { icon: 'smart_toy',title: 'Agendamento por IA',   desc: 'Adicione tarefas naturalmente com IA. Só descreva o que precisa fazer.' },
      { icon: 'notifications', title: 'Lembretes Inteligentes', desc: 'Nunca perca uma tarefa com notificações push e alarmes.' },
    ],
    faqs: [
      { q: 'Tem aplicativo mobile?',         a: 'Sim! Disponível para iOS, Android e como app desktop para Windows.' },
      { q: 'O WeekFlow é gratuito?',         a: 'Sim, os recursos principais são gratuitos. Pro libera tarefas ilimitadas e sync na nuvem.' },
      { q: 'Como o FlowCircle funciona?',    a: 'Crie um círculo, convide amigos via link e planeje eventos juntos em tempo real.' },
      { q: 'Meus dados estão seguros?',      a: 'Sim. Seus dados são criptografados e armazenados com segurança via Supabase.' },
    ],
  },

  // ── App-level strings ───────────────────────────────────────────────────────
  app: {
    updateBanner: 'Nova versão do WeekFlow pronta para instalar.',
    updateBtn: 'Reiniciar agora',
    newTask: 'nova tarefa', searchShort: 'buscar', focus: 'foco',
    pushEnabled: 'Notificações push ativadas!',
  },

  // ── Upgrade Modal ───────────────────────────────────────────────────────────
  upgrade: {
    title: 'Faça upgrade para o Pro',
    featureNeeded: 'Para usar {feature}, faça upgrade para o Pro.',
    benefits: [
      'Tarefas ilimitadas',
      'Sync na nuvem entre dispositivos',
      'Analytics avançado',
      'Suporte prioritário',
    ],
    upgradeCta: 'Fazer Upgrade Agora',
    maybeLater: 'Talvez depois',
  },

  // ── Tour Guide ──────────────────────────────────────────────────────────────
  tour: {
    welcome: 'Bem-vindo ao WeekFlow!',
    welcomeDesc: 'Vamos fazer um tour rápido pelo seu novo planner semanal.',
    sidebar: 'Navegação',
    sidebarDesc: 'Use a barra lateral para navegar entre as páginas.',
    addTaskBtn: 'Adicionar Tarefas',
    addTaskDesc: 'Clique aqui para criar uma nova tarefa para a sua semana.',
    searchDesc: 'Busque qualquer tarefa por nome, categoria ou dia.',
    aiDesc: 'Seu assistente IA pode criar tarefas a partir de linguagem natural.',
    done: 'Tudo pronto!',
    doneDesc: 'Comece a adicionar tarefas e construindo sua semana perfeita.',
    nextBtn: 'Próximo', skipBtn: 'Pular Tour', doneBtn: 'Começar!',
  },

  // ── Splash Screen ──────────────────────────────────────────────────────────
  splash: {
    loading: 'Carregando seu flow...',
  },

  // ── Download Page ───────────────────────────────────────────────────────────
  download: {
    title: 'App Desktop',
    subtitle: 'Baixe o WeekFlow para Windows para a melhor experiência.',
    downloadBtn: 'Baixar para Windows',
    version: 'Versão',
  },
}
