export type Language = "es" | "en" | "fr" | "pt" | "it";

export const languageFlags: Record<Language, string> = {
  es: "https://flagsapi.com/ES/flat/64.png",
  en: "https://flagsapi.com/US/flat/64.png",
  fr: "https://flagsapi.com/FR/flat/64.png",
  pt: "https://flagsapi.com/PT/flat/64.png",
  it: "https://flagsapi.com/IT/flat/64.png",
};

export const languageNames: Record<Language, string> = {
  es: "Español",
  en: "English",
  fr: "Français",
  pt: "Português",
  it: "Italiano",
};

type TranslationKeys = {
  // Index / Home
  heroTitle: string;
  heroSubtitle: string;
  createTrip: string;
  joinTrip: string;
  myTrips: string;
  noTripsTitle: string;
  noTripsDesc: string;
  user: string;

  // Auth
  letsGo: string;
  createAccount: string;
  name: string;
  yourName: string;
  email: string;
  password: string;
  loading: string;
  login: string;
  register: string;
  noAccount: string;
  registerLink: string;
  hasAccount: string;
  loginLink: string;
  forgotPassword: string;
  loginError: string;
  nameRequired: string;
  nameRequiredDesc: string;
  registerSuccess: string;
  registerSuccessDesc: string;
  registerError: string;

  // Reset password
  resetPassword: string;
  newPassword: string;
  saving: string;
  savePassword: string;
  sending: string;
  sendRecoveryLink: string;
  emailSent: string;
  emailSentDesc: string;
  backToLogin: string;
  passwordUpdated: string;
  passwordUpdatedDesc: string;

  // Create trip dialog
  createTripTitle: string;
  createTripDesc: string;
  title: string;
  titlePlaceholder: string;
  destination: string;
  destinationPlaceholder: string;
  start: string;
  end: string;
  creating: string;
  tripCreated: string;
  inviteCode: string;
  errorCreatingTrip: string;

  // Join trip dialog
  joinTripTitle: string;
  joinTripDesc: string;
  inviteCodeLabel: string;
  inviteCodePlaceholder: string;
  searching: string;
  joinMe: string;
  invalidCode: string;
  invalidCodeDesc: string;
  alreadyMember: string;
  alreadyMemberDesc: string;
  joined: string;
  joinedDesc: string;

  // Trip card statuses
  upcoming: string;
  active: string;
  finished: string;

  // Trip dashboard
  inviteFriends: string;
  code: string;
  sections: string;
  member: string;
  members: string;

  // Section names
  transport: string;
  accommodation: string;
  expenses: string;
  photos: string;
  chat: string;
  weather: string;
  activities: string;

  // Transport
  howWeTravel: string;
  add: string;
  editTransport: string;
  addTransport: string;
  type: string;
  origin: string;
  arrivalLocation: string;
  departureAddress: string;
  departureAddressPlaceholder: string;
  departure: string;
  arrival: string;
  bookingReference: string;
  notes: string;
  update: string;
  save: string;
  noTransportTitle: string;
  noTransportDescCreator: string;
  noTransportDescMember: string;
  transportUpdated: string;
  transportAdded: string;
  howToGet: string;
  flight: string;
  train: string;
  bus: string;
  car: string;
  other: string;

  // Accommodation
  whereWeSleep: string;
  editAccommodation: string;
  addAccommodation: string;
  accommodationName: string;
  accommodationNamePlaceholder: string;
  address: string;
  checkIn: string;
  checkOut: string;
  website: string;
  websitePlaceholder: string;
  noAccommodationTitle: string;
  noAccommodationDescCreator: string;
  noAccommodationDescMember: string;
  accommodationUpdated: string;
  accommodationAdded: string;
  web: string;

  // Expenses
  sharedExpenses: string;
  addExpense: string;
  editExpense: string;
  expenseTitle: string;
  expensePlaceholder: string;
  amount: string;
  paidBy: string;
  selectPayer: string;
  sharedAmong: string;
  ticketPhoto: string;
  takePhoto: string;
  noExpensesTitle: string;
  noExpensesDesc: string;
  balances: string;
  expensesList: string;
  totalSpent: string;
  whoOwesWhom: string;
  paidByLabel: string;
  sharedBetween: string;
  perPerson: string;
  expenseUpdated: string;
  expenseAdded: string;
  edit: string;
  delete: string;
  error: string;
  invalidAmount: string;
  errorUploading: string;

  // Photos
  photosTitle: string;
  uploadFromGallery: string;
  takePhotoBtn: string;
  noPhotosTitle: string;
  noPhotosDesc: string;
  photoDeleted: string;
  photoUploaded: string;
  errorDeletingPhoto: string;
  errorUploadingPhoto: string;
  tripPhoto: string;

  // Chat
  you: string;
  usuario: string;
  writeMessage: string;
  recordingAudio: string;
  today: string;
  yesterday: string;
  errorSending: string;
  errorUploadingImage: string;
  errorUploadingAudio: string;
  errorMicrophone: string;
  image: string;

  // Weather
  theWeather: string;
  now: string;
  feelsLike: string;
  next10Days: string;
  dataBy: string;
  noDestination: string;
  locationNotFound: string;
  weatherError: string;
  clear: string;
  mostlyClear: string;
  partlyCloudy: string;
  cloudy: string;
  fog: string;
  frozenFog: string;
  lightDrizzle: string;
  moderateDrizzle: string;
  heavyDrizzle: string;
  lightRain: string;
  moderateRain: string;
  heavyRain: string;
  lightSnow: string;
  moderateSnow: string;
  heavySnow: string;
  lightShowers: string;
  moderateShowers: string;
  heavyShowers: string;
  thunderstorm: string;
  thunderstormHail: string;
  thunderstormHeavyHail: string;
  unknown: string;
  tomorrow: string;

  // Schedule / Activities
  activitiesTitle: string;
  addActivity: string;
  editActivity: string;
  activityTitle: string;
  activityPlaceholder: string;
  date: string;
  time: string;
  place: string;
  placePlaceholder: string;
  addressLabel: string;
  addressPlaceholder: string;
  description: string;
  webPage: string;
  noActivitiesTitle: string;
  noActivitiesDescCreator: string;
  noActivitiesDescMember: string;
  activityUpdated: string;
  activityAdded: string;

  // Join trip page
  joinErrorInvalid: string;
  goHome: string;

  // Not found
  pageNotFound: string;
  returnHome: string;

  // Language
  selectLanguage: string;

  // Help Chat
  helpChatTitle: string;
  helpChatWelcome: string;
  helpChatPlaceholder: string;
  helpChatError: string;
};

const translations: Record<Language, TranslationKeys> = {
  es: {
    heroTitle: "Organiza viajes\nen grupo, sin caos.",
    heroSubtitle: "Transporte, alojamiento, gastos, fotos y chat — todo en un solo lugar.",
    createTrip: "Crear viaje",
    joinTrip: "Unirse",
    myTrips: "Mis Viajes",
    noTripsTitle: "Sin viajes aún",
    noTripsDesc: "Crea tu primer viaje o únete a uno con un código de invitación.",
    user: "Usuario",
    letsGo: "Vamos a disfrutar",
    createAccount: "Crea tu cuenta",
    name: "Nombre",
    yourName: "Tu nombre",
    email: "Email",
    password: "Contraseña",
    loading: "Cargando...",
    login: "Iniciar sesión",
    register: "Registrarse",
    noAccount: "¿No tienes cuenta?",
    registerLink: "Regístrate",
    hasAccount: "¿Ya tienes cuenta?",
    loginLink: "Inicia sesión",
    forgotPassword: "¿Olvidaste tu contraseña?",
    loginError: "Error al iniciar sesión",
    nameRequired: "Nombre requerido",
    nameRequiredDesc: "Por favor ingresa tu nombre.",
    registerSuccess: "Registro exitoso",
    registerSuccessDesc: "Revisa tu email para confirmar tu cuenta.",
    registerError: "Error al registrarse",
    resetPassword: "Restablecer contraseña",
    newPassword: "Nueva contraseña",
    saving: "Guardando...",
    savePassword: "Guardar contraseña",
    sending: "Enviando...",
    sendRecoveryLink: "Enviar enlace de recuperación",
    emailSent: "Email enviado",
    emailSentDesc: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
    backToLogin: "Volver al login",
    passwordUpdated: "Contraseña actualizada",
    passwordUpdatedDesc: "Ya puedes iniciar sesión con tu nueva contraseña.",
    createTripTitle: "Crear viaje",
    createTripDesc: "Completa los datos de tu nuevo viaje en grupo.",
    title: "Título",
    titlePlaceholder: "Ej: Barcelona con amigos",
    destination: "Destino",
    destinationPlaceholder: "Ej: Barcelona, España",
    start: "Inicio",
    end: "Fin",
    creating: "Creando...",
    tripCreated: "¡Viaje creado!",
    inviteCode: "Código de invitación",
    errorCreatingTrip: "Error al crear viaje",
    joinTripTitle: "Unirse a un viaje",
    joinTripDesc: "Pega el código de invitación que te compartieron.",
    inviteCodeLabel: "Código de invitación",
    inviteCodePlaceholder: "Ej: A1B2C3D4",
    searching: "Buscando...",
    joinMe: "Unirme",
    invalidCode: "Código inválido",
    invalidCodeDesc: "No se encontró ningún viaje con ese código.",
    alreadyMember: "Ya eres miembro",
    alreadyMemberDesc: "Ya formas parte de este viaje.",
    joined: "¡Te has unido!",
    joinedDesc: "Ahora eres parte del viaje.",
    upcoming: "Próximo",
    active: "En curso",
    finished: "Finalizado",
    inviteFriends: "Invitar amigos",
    code: "Código",
    sections: "Secciones",
    member: "miembro",
    members: "miembros",
    transport: "Transporte",
    accommodation: "Alojamiento",
    expenses: "Gastos",
    photos: "Fotos",
    chat: "Chat",
    weather: "El Tiempo",
    activities: "Actividades",
    howWeTravel: "Cómo Viajamos",
    add: "Añadir",
    editTransport: "Editar transporte",
    addTransport: "Añadir transporte",
    type: "Tipo",
    origin: "Origen",
    arrivalLocation: "Destino",
    departureAddress: "Dirección de salida",
    departureAddressPlaceholder: "Calle, número, terminal...",
    departure: "Salida",
    arrival: "Llegada",
    bookingReference: "Referencia reserva",
    notes: "Notas",
    update: "Actualizar",
    save: "Guardar",
    noTransportTitle: "Sin transporte registrado",
    noTransportDescCreator: "Añade los detalles de vuelos, trenes o cualquier medio de transporte.",
    noTransportDescMember: "El administrador del viaje aún no ha añadido transporte.",
    transportUpdated: "Transporte actualizado",
    transportAdded: "Transporte añadido",
    howToGet: "Cómo llegar",
    flight: "Vuelo",
    train: "Tren",
    bus: "Autobús",
    car: "Coche",
    other: "Otro",
    whereWeSleep: "Dónde Dormimos",
    editAccommodation: "Editar alojamiento",
    addAccommodation: "Añadir alojamiento",
    accommodationName: "Nombre",
    accommodationNamePlaceholder: "Hotel, apartamento...",
    address: "Dirección",
    checkIn: "Check-in",
    checkOut: "Check-out",
    website: "Página web",
    websitePlaceholder: "https://www.hotel.com",
    noAccommodationTitle: "Sin alojamiento registrado",
    noAccommodationDescCreator: "Añade hoteles, apartamentos o cualquier alojamiento del viaje.",
    noAccommodationDescMember: "El administrador del viaje aún no ha añadido alojamiento.",
    accommodationUpdated: "Alojamiento actualizado",
    accommodationAdded: "Alojamiento añadido",
    web: "Web",
    sharedExpenses: "Gastos Compartidos",
    addExpense: "Añadir gasto",
    editExpense: "Editar gasto",
    expenseTitle: "Título",
    expensePlaceholder: "Cena, taxi, entradas...",
    amount: "Cantidad (€)",
    paidBy: "Pagado por",
    selectPayer: "Selecciona quién paga",
    sharedAmong: "Compartido entre",
    ticketPhoto: "Foto del ticket",
    takePhoto: "Hacer foto",
    noExpensesTitle: "Sin gastos registrados",
    noExpensesDesc: "Registra gastos y divide cuentas fácilmente entre los miembros del viaje.",
    balances: "Saldos",
    expensesList: "Gastos",
    totalSpent: "Total gastado",
    whoOwesWhom: "Quién debe a quién",
    paidByLabel: "Pagado por",
    sharedBetween: "Compartido entre",
    perPerson: "/ persona",
    expenseUpdated: "Gasto actualizado",
    expenseAdded: "Gasto añadido",
    edit: "Editar",
    delete: "Eliminar",
    error: "Error",
    invalidAmount: "Introduce una cantidad válida",
    errorUploading: "Error subiendo foto",
    photosTitle: "Fotos",
    uploadFromGallery: "Subir desde galería",
    takePhotoBtn: "Tomar foto",
    noPhotosTitle: "Sin fotos aún",
    noPhotosDesc: "Toma fotos del viaje o súbelas desde tu galería.",
    photoDeleted: "Foto eliminada",
    photoUploaded: "Foto subida correctamente",
    errorDeletingPhoto: "Error al eliminar la foto",
    errorUploadingPhoto: "Error al subir la foto",
    tripPhoto: "Foto del viaje",
    you: "Tú",
    usuario: "Usuario",
    writeMessage: "Escribe un mensaje...",
    recordingAudio: "Grabando audio...",
    today: "Hoy",
    yesterday: "Ayer",
    errorSending: "Error al enviar",
    errorUploadingImage: "Error al subir imagen",
    errorUploadingAudio: "Error al subir audio",
    errorMicrophone: "No se pudo acceder al micrófono",
    image: "Imagen",
    theWeather: "El Tiempo",
    now: "Ahora",
    feelsLike: "Sensación",
    next10Days: "Próximos 10 días",
    dataBy: "Datos proporcionados por Open-Meteo",
    noDestination: "No se encontró el destino del viaje.",
    locationNotFound: "No se encontró la ubicación",
    weatherError: "Error al obtener el pronóstico del tiempo.",
    clear: "Despejado",
    mostlyClear: "Mayormente despejado",
    partlyCloudy: "Parcialmente nublado",
    cloudy: "Nublado",
    fog: "Niebla",
    frozenFog: "Niebla helada",
    lightDrizzle: "Llovizna ligera",
    moderateDrizzle: "Llovizna moderada",
    heavyDrizzle: "Llovizna intensa",
    lightRain: "Lluvia ligera",
    moderateRain: "Lluvia moderada",
    heavyRain: "Lluvia intensa",
    lightSnow: "Nieve ligera",
    moderateSnow: "Nieve moderada",
    heavySnow: "Nieve intensa",
    lightShowers: "Chubascos ligeros",
    moderateShowers: "Chubascos moderados",
    heavyShowers: "Chubascos intensos",
    thunderstorm: "Tormenta",
    thunderstormHail: "Tormenta con granizo",
    thunderstormHeavyHail: "Tormenta con granizo fuerte",
    unknown: "Desconocido",
    tomorrow: "Mañana",
    activitiesTitle: "Actividades",
    addActivity: "Añadir actividad",
    editActivity: "Editar actividad",
    activityTitle: "Título",
    activityPlaceholder: "Visita al museo, cena...",
    date: "Fecha",
    time: "Hora",
    place: "Lugar",
    placePlaceholder: "Nombre del lugar",
    addressLabel: "Dirección",
    addressPlaceholder: "Calle, número, ciudad...",
    description: "Descripción",
    webPage: "Página web",
    noActivitiesTitle: "Sin actividades planificadas",
    noActivitiesDescCreator: "Organiza el itinerario día a día con actividades y horarios.",
    noActivitiesDescMember: "El administrador del viaje aún no ha planificado actividades.",
    activityUpdated: "Actividad actualizada",
    activityAdded: "Actividad añadida",
    joinErrorInvalid: "Código de invitación inválido o viaje no encontrado.",
    goHome: "Ir al inicio",
    pageNotFound: "Oops! Página no encontrada",
    returnHome: "Volver al inicio",
    selectLanguage: "Idioma",
    helpChatTitle: "Diego",
    helpChatWelcome: "¡Hola! 👋 Soy Diego, tu asistente de LORMIT. Pregúntame cómo crear viajes, añadir transportes, gestionar gastos o cualquier duda sobre la app.",
    helpChatPlaceholder: "Escribe tu pregunta...",
    helpChatError: "Lo siento, ha ocurrido un error. Inténtalo de nuevo.",
  },

  en: {
    heroTitle: "Organize group\ntrips, chaos-free.",
    heroSubtitle: "Transport, accommodation, expenses, photos and chat — all in one place.",
    createTrip: "Create trip",
    joinTrip: "Join",
    myTrips: "My Trips",
    noTripsTitle: "No trips yet",
    noTripsDesc: "Create your first trip or join one with an invite code.",
    user: "User",
    letsGo: "Let's enjoy",
    createAccount: "Create your account",
    name: "Name",
    yourName: "Your name",
    email: "Email",
    password: "Password",
    loading: "Loading...",
    login: "Log in",
    register: "Sign up",
    noAccount: "Don't have an account?",
    registerLink: "Sign up",
    hasAccount: "Already have an account?",
    loginLink: "Log in",
    forgotPassword: "Forgot your password?",
    loginError: "Login error",
    nameRequired: "Name required",
    nameRequiredDesc: "Please enter your name.",
    registerSuccess: "Registration successful",
    registerSuccessDesc: "Check your email to confirm your account.",
    registerError: "Registration error",
    resetPassword: "Reset password",
    newPassword: "New password",
    saving: "Saving...",
    savePassword: "Save password",
    sending: "Sending...",
    sendRecoveryLink: "Send recovery link",
    emailSent: "Email sent",
    emailSentDesc: "Check your inbox to reset your password.",
    backToLogin: "Back to login",
    passwordUpdated: "Password updated",
    passwordUpdatedDesc: "You can now log in with your new password.",
    createTripTitle: "Create trip",
    createTripDesc: "Fill in the details of your new group trip.",
    title: "Title",
    titlePlaceholder: "E.g.: Barcelona with friends",
    destination: "Destination",
    destinationPlaceholder: "E.g.: Barcelona, Spain",
    start: "Start",
    end: "End",
    creating: "Creating...",
    tripCreated: "Trip created!",
    inviteCode: "Invite code",
    errorCreatingTrip: "Error creating trip",
    joinTripTitle: "Join a trip",
    joinTripDesc: "Paste the invite code that was shared with you.",
    inviteCodeLabel: "Invite code",
    inviteCodePlaceholder: "E.g.: A1B2C3D4",
    searching: "Searching...",
    joinMe: "Join",
    invalidCode: "Invalid code",
    invalidCodeDesc: "No trip found with that code.",
    alreadyMember: "Already a member",
    alreadyMemberDesc: "You are already part of this trip.",
    joined: "You joined!",
    joinedDesc: "You are now part of the trip.",
    upcoming: "Upcoming",
    active: "Active",
    finished: "Finished",
    inviteFriends: "Invite friends",
    code: "Code",
    sections: "Sections",
    member: "member",
    members: "members",
    transport: "Transport",
    accommodation: "Accommodation",
    expenses: "Expenses",
    photos: "Photos",
    chat: "Chat",
    weather: "Weather",
    activities: "Activities",
    howWeTravel: "How We Travel",
    add: "Add",
    editTransport: "Edit transport",
    addTransport: "Add transport",
    type: "Type",
    origin: "Origin",
    arrivalLocation: "Destination",
    departureAddress: "Departure address",
    departureAddressPlaceholder: "Street, number, terminal...",
    departure: "Departure",
    arrival: "Arrival",
    bookingReference: "Booking reference",
    notes: "Notes",
    update: "Update",
    save: "Save",
    noTransportTitle: "No transport registered",
    noTransportDescCreator: "Add details of flights, trains or any transport.",
    noTransportDescMember: "The trip admin hasn't added transport yet.",
    transportUpdated: "Transport updated",
    transportAdded: "Transport added",
    howToGet: "Get directions",
    flight: "Flight",
    train: "Train",
    bus: "Bus",
    car: "Car",
    other: "Other",
    whereWeSleep: "Where We Sleep",
    editAccommodation: "Edit accommodation",
    addAccommodation: "Add accommodation",
    accommodationName: "Name",
    accommodationNamePlaceholder: "Hotel, apartment...",
    address: "Address",
    checkIn: "Check-in",
    checkOut: "Check-out",
    website: "Website",
    websitePlaceholder: "https://www.hotel.com",
    noAccommodationTitle: "No accommodation registered",
    noAccommodationDescCreator: "Add hotels, apartments or any trip accommodation.",
    noAccommodationDescMember: "The trip admin hasn't added accommodation yet.",
    accommodationUpdated: "Accommodation updated",
    accommodationAdded: "Accommodation added",
    web: "Web",
    sharedExpenses: "Shared Expenses",
    addExpense: "Add expense",
    editExpense: "Edit expense",
    expenseTitle: "Title",
    expensePlaceholder: "Dinner, taxi, tickets...",
    amount: "Amount (€)",
    paidBy: "Paid by",
    selectPayer: "Select who paid",
    sharedAmong: "Shared among",
    ticketPhoto: "Receipt photo",
    takePhoto: "Take photo",
    noExpensesTitle: "No expenses recorded",
    noExpensesDesc: "Record expenses and easily split bills among trip members.",
    balances: "Balances",
    expensesList: "Expenses",
    totalSpent: "Total spent",
    whoOwesWhom: "Who owes whom",
    paidByLabel: "Paid by",
    sharedBetween: "Shared between",
    perPerson: "/ person",
    expenseUpdated: "Expense updated",
    expenseAdded: "Expense added",
    edit: "Edit",
    delete: "Delete",
    error: "Error",
    invalidAmount: "Enter a valid amount",
    errorUploading: "Error uploading photo",
    photosTitle: "Photos",
    uploadFromGallery: "Upload from gallery",
    takePhotoBtn: "Take photo",
    noPhotosTitle: "No photos yet",
    noPhotosDesc: "Take trip photos or upload from your gallery.",
    photoDeleted: "Photo deleted",
    photoUploaded: "Photo uploaded successfully",
    errorDeletingPhoto: "Error deleting photo",
    errorUploadingPhoto: "Error uploading photo",
    tripPhoto: "Trip photo",
    you: "You",
    usuario: "User",
    writeMessage: "Write a message...",
    recordingAudio: "Recording audio...",
    today: "Today",
    yesterday: "Yesterday",
    errorSending: "Error sending",
    errorUploadingImage: "Error uploading image",
    errorUploadingAudio: "Error uploading audio",
    errorMicrophone: "Could not access microphone",
    image: "Image",
    theWeather: "Weather",
    now: "Now",
    feelsLike: "Feels like",
    next10Days: "Next 10 days",
    dataBy: "Data provided by Open-Meteo",
    noDestination: "Trip destination not found.",
    locationNotFound: "Location not found",
    weatherError: "Error getting weather forecast.",
    clear: "Clear",
    mostlyClear: "Mostly clear",
    partlyCloudy: "Partly cloudy",
    cloudy: "Cloudy",
    fog: "Fog",
    frozenFog: "Freezing fog",
    lightDrizzle: "Light drizzle",
    moderateDrizzle: "Moderate drizzle",
    heavyDrizzle: "Heavy drizzle",
    lightRain: "Light rain",
    moderateRain: "Moderate rain",
    heavyRain: "Heavy rain",
    lightSnow: "Light snow",
    moderateSnow: "Moderate snow",
    heavySnow: "Heavy snow",
    lightShowers: "Light showers",
    moderateShowers: "Moderate showers",
    heavyShowers: "Heavy showers",
    thunderstorm: "Thunderstorm",
    thunderstormHail: "Thunderstorm with hail",
    thunderstormHeavyHail: "Thunderstorm with heavy hail",
    unknown: "Unknown",
    tomorrow: "Tomorrow",
    activitiesTitle: "Activities",
    addActivity: "Add activity",
    editActivity: "Edit activity",
    activityTitle: "Title",
    activityPlaceholder: "Museum visit, dinner...",
    date: "Date",
    time: "Time",
    place: "Place",
    placePlaceholder: "Place name",
    addressLabel: "Address",
    addressPlaceholder: "Street, number, city...",
    description: "Description",
    webPage: "Website",
    noActivitiesTitle: "No planned activities",
    noActivitiesDescCreator: "Plan the day-by-day itinerary with activities and schedules.",
    noActivitiesDescMember: "The trip admin hasn't planned activities yet.",
    activityUpdated: "Activity updated",
    activityAdded: "Activity added",
    joinErrorInvalid: "Invalid invite code or trip not found.",
    goHome: "Go home",
    pageNotFound: "Oops! Page not found",
    returnHome: "Return to Home",
    selectLanguage: "Language",
    helpChatTitle: "Diego",
    helpChatWelcome: "Hi! 👋 I'm Diego, your LORMIT assistant. Ask me how to create trips, add transport, manage expenses, or anything about the app.",
    helpChatPlaceholder: "Type your question...",
    helpChatError: "Sorry, an error occurred. Please try again.",
  },

  fr: {
    heroTitle: "Organisez vos voyages\nen groupe, sans chaos.",
    heroSubtitle: "Transport, hébergement, dépenses, photos et chat — tout au même endroit.",
    createTrip: "Créer un voyage",
    joinTrip: "Rejoindre",
    myTrips: "Mes Voyages",
    noTripsTitle: "Pas encore de voyages",
    noTripsDesc: "Créez votre premier voyage ou rejoignez-en un avec un code d'invitation.",
    user: "Utilisateur",
    letsGo: "Allons profiter",
    createAccount: "Créez votre compte",
    name: "Nom",
    yourName: "Votre nom",
    email: "Email",
    password: "Mot de passe",
    loading: "Chargement...",
    login: "Se connecter",
    register: "S'inscrire",
    noAccount: "Pas de compte ?",
    registerLink: "Inscrivez-vous",
    hasAccount: "Déjà un compte ?",
    loginLink: "Connectez-vous",
    forgotPassword: "Mot de passe oublié ?",
    loginError: "Erreur de connexion",
    nameRequired: "Nom requis",
    nameRequiredDesc: "Veuillez entrer votre nom.",
    registerSuccess: "Inscription réussie",
    registerSuccessDesc: "Vérifiez votre email pour confirmer votre compte.",
    registerError: "Erreur d'inscription",
    resetPassword: "Réinitialiser le mot de passe",
    newPassword: "Nouveau mot de passe",
    saving: "Enregistrement...",
    savePassword: "Enregistrer le mot de passe",
    sending: "Envoi...",
    sendRecoveryLink: "Envoyer le lien de récupération",
    emailSent: "Email envoyé",
    emailSentDesc: "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe.",
    backToLogin: "Retour à la connexion",
    passwordUpdated: "Mot de passe mis à jour",
    passwordUpdatedDesc: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
    createTripTitle: "Créer un voyage",
    createTripDesc: "Remplissez les détails de votre nouveau voyage en groupe.",
    title: "Titre",
    titlePlaceholder: "Ex: Barcelone entre amis",
    destination: "Destination",
    destinationPlaceholder: "Ex: Barcelone, Espagne",
    start: "Début",
    end: "Fin",
    creating: "Création...",
    tripCreated: "Voyage créé !",
    inviteCode: "Code d'invitation",
    errorCreatingTrip: "Erreur lors de la création du voyage",
    joinTripTitle: "Rejoindre un voyage",
    joinTripDesc: "Collez le code d'invitation qui vous a été partagé.",
    inviteCodeLabel: "Code d'invitation",
    inviteCodePlaceholder: "Ex: A1B2C3D4",
    searching: "Recherche...",
    joinMe: "Rejoindre",
    invalidCode: "Code invalide",
    invalidCodeDesc: "Aucun voyage trouvé avec ce code.",
    alreadyMember: "Déjà membre",
    alreadyMemberDesc: "Vous faites déjà partie de ce voyage.",
    joined: "Vous avez rejoint !",
    joinedDesc: "Vous faites maintenant partie du voyage.",
    upcoming: "À venir",
    active: "En cours",
    finished: "Terminé",
    inviteFriends: "Inviter des amis",
    code: "Code",
    sections: "Sections",
    member: "membre",
    members: "membres",
    transport: "Transport",
    accommodation: "Hébergement",
    expenses: "Dépenses",
    photos: "Photos",
    chat: "Chat",
    weather: "Météo",
    activities: "Activités",
    howWeTravel: "Comment on voyage",
    add: "Ajouter",
    editTransport: "Modifier le transport",
    addTransport: "Ajouter un transport",
    type: "Type",
    origin: "Origine",
    arrivalLocation: "Destination",
    departureAddress: "Adresse de départ",
    departureAddressPlaceholder: "Rue, numéro, terminal...",
    departure: "Départ",
    arrival: "Arrivée",
    bookingReference: "Référence de réservation",
    notes: "Notes",
    update: "Mettre à jour",
    save: "Enregistrer",
    noTransportTitle: "Aucun transport enregistré",
    noTransportDescCreator: "Ajoutez les détails des vols, trains ou tout moyen de transport.",
    noTransportDescMember: "L'administrateur du voyage n'a pas encore ajouté de transport.",
    transportUpdated: "Transport mis à jour",
    transportAdded: "Transport ajouté",
    howToGet: "Comment y aller",
    flight: "Vol",
    train: "Train",
    bus: "Bus",
    car: "Voiture",
    other: "Autre",
    whereWeSleep: "Où on dort",
    editAccommodation: "Modifier l'hébergement",
    addAccommodation: "Ajouter un hébergement",
    accommodationName: "Nom",
    accommodationNamePlaceholder: "Hôtel, appartement...",
    address: "Adresse",
    checkIn: "Arrivée",
    checkOut: "Départ",
    website: "Site web",
    websitePlaceholder: "https://www.hotel.com",
    noAccommodationTitle: "Aucun hébergement enregistré",
    noAccommodationDescCreator: "Ajoutez des hôtels, appartements ou tout hébergement du voyage.",
    noAccommodationDescMember: "L'administrateur du voyage n'a pas encore ajouté d'hébergement.",
    accommodationUpdated: "Hébergement mis à jour",
    accommodationAdded: "Hébergement ajouté",
    web: "Web",
    sharedExpenses: "Dépenses Partagées",
    addExpense: "Ajouter une dépense",
    editExpense: "Modifier la dépense",
    expenseTitle: "Titre",
    expensePlaceholder: "Dîner, taxi, billets...",
    amount: "Montant (€)",
    paidBy: "Payé par",
    selectPayer: "Sélectionnez qui a payé",
    sharedAmong: "Partagé entre",
    ticketPhoto: "Photo du reçu",
    takePhoto: "Prendre une photo",
    noExpensesTitle: "Aucune dépense enregistrée",
    noExpensesDesc: "Enregistrez les dépenses et partagez facilement les comptes entre les membres du voyage.",
    balances: "Soldes",
    expensesList: "Dépenses",
    totalSpent: "Total dépensé",
    whoOwesWhom: "Qui doit à qui",
    paidByLabel: "Payé par",
    sharedBetween: "Partagé entre",
    perPerson: "/ personne",
    expenseUpdated: "Dépense mise à jour",
    expenseAdded: "Dépense ajoutée",
    edit: "Modifier",
    delete: "Supprimer",
    error: "Erreur",
    invalidAmount: "Entrez un montant valide",
    errorUploading: "Erreur lors du téléchargement de la photo",
    photosTitle: "Photos",
    uploadFromGallery: "Depuis la galerie",
    takePhotoBtn: "Prendre une photo",
    noPhotosTitle: "Pas encore de photos",
    noPhotosDesc: "Prenez des photos du voyage ou téléchargez-en depuis votre galerie.",
    photoDeleted: "Photo supprimée",
    photoUploaded: "Photo téléchargée avec succès",
    errorDeletingPhoto: "Erreur lors de la suppression de la photo",
    errorUploadingPhoto: "Erreur lors du téléchargement de la photo",
    tripPhoto: "Photo du voyage",
    you: "Vous",
    usuario: "Utilisateur",
    writeMessage: "Écrivez un message...",
    recordingAudio: "Enregistrement audio...",
    today: "Aujourd'hui",
    yesterday: "Hier",
    errorSending: "Erreur d'envoi",
    errorUploadingImage: "Erreur lors du téléchargement de l'image",
    errorUploadingAudio: "Erreur lors du téléchargement de l'audio",
    errorMicrophone: "Impossible d'accéder au microphone",
    image: "Image",
    theWeather: "Météo",
    now: "Maintenant",
    feelsLike: "Ressenti",
    next10Days: "10 prochains jours",
    dataBy: "Données fournies par Open-Meteo",
    noDestination: "Destination du voyage non trouvée.",
    locationNotFound: "Localisation non trouvée",
    weatherError: "Erreur lors de l'obtention des prévisions météo.",
    clear: "Dégagé",
    mostlyClear: "Principalement dégagé",
    partlyCloudy: "Partiellement nuageux",
    cloudy: "Nuageux",
    fog: "Brouillard",
    frozenFog: "Brouillard givrant",
    lightDrizzle: "Bruine légère",
    moderateDrizzle: "Bruine modérée",
    heavyDrizzle: "Bruine forte",
    lightRain: "Pluie légère",
    moderateRain: "Pluie modérée",
    heavyRain: "Pluie forte",
    lightSnow: "Neige légère",
    moderateSnow: "Neige modérée",
    heavySnow: "Neige forte",
    lightShowers: "Averses légères",
    moderateShowers: "Averses modérées",
    heavyShowers: "Averses fortes",
    thunderstorm: "Orage",
    thunderstormHail: "Orage avec grêle",
    thunderstormHeavyHail: "Orage avec forte grêle",
    unknown: "Inconnu",
    tomorrow: "Demain",
    activitiesTitle: "Activités",
    addActivity: "Ajouter une activité",
    editActivity: "Modifier l'activité",
    activityTitle: "Titre",
    activityPlaceholder: "Visite du musée, dîner...",
    date: "Date",
    time: "Heure",
    place: "Lieu",
    placePlaceholder: "Nom du lieu",
    addressLabel: "Adresse",
    addressPlaceholder: "Rue, numéro, ville...",
    description: "Description",
    webPage: "Site web",
    noActivitiesTitle: "Aucune activité planifiée",
    noActivitiesDescCreator: "Organisez l'itinéraire jour par jour avec des activités et des horaires.",
    noActivitiesDescMember: "L'administrateur du voyage n'a pas encore planifié d'activités.",
    activityUpdated: "Activité mise à jour",
    activityAdded: "Activité ajoutée",
    joinErrorInvalid: "Code d'invitation invalide ou voyage non trouvé.",
    goHome: "Retour à l'accueil",
    pageNotFound: "Oops ! Page non trouvée",
    returnHome: "Retour à l'accueil",
    selectLanguage: "Langue",
    helpChatTitle: "Diego",
    helpChatWelcome: "Bonjour ! 👋 Je suis Diego, votre assistant LORMIT. Demandez-moi comment créer des voyages, ajouter des transports, gérer les dépenses ou toute question sur l'app.",
    helpChatPlaceholder: "Écrivez votre question...",
    helpChatError: "Désolé, une erreur est survenue. Veuillez réessayer.",
  },

  pt: {
    heroTitle: "Organize viagens\nem grupo, sem caos.",
    heroSubtitle: "Transporte, alojamento, despesas, fotos e chat — tudo num só lugar.",
    createTrip: "Criar viagem",
    joinTrip: "Juntar-se",
    myTrips: "Minhas Viagens",
    noTripsTitle: "Sem viagens ainda",
    noTripsDesc: "Crie a sua primeira viagem ou junte-se a uma com um código de convite.",
    user: "Utilizador",
    letsGo: "Vamos aproveitar",
    createAccount: "Crie a sua conta",
    name: "Nome",
    yourName: "O seu nome",
    email: "Email",
    password: "Palavra-passe",
    loading: "A carregar...",
    login: "Iniciar sessão",
    register: "Registar-se",
    noAccount: "Não tem conta?",
    registerLink: "Registe-se",
    hasAccount: "Já tem conta?",
    loginLink: "Inicie sessão",
    forgotPassword: "Esqueceu a palavra-passe?",
    loginError: "Erro ao iniciar sessão",
    nameRequired: "Nome obrigatório",
    nameRequiredDesc: "Por favor insira o seu nome.",
    registerSuccess: "Registo bem-sucedido",
    registerSuccessDesc: "Verifique o seu email para confirmar a sua conta.",
    registerError: "Erro ao registar",
    resetPassword: "Redefinir palavra-passe",
    newPassword: "Nova palavra-passe",
    saving: "A guardar...",
    savePassword: "Guardar palavra-passe",
    sending: "A enviar...",
    sendRecoveryLink: "Enviar link de recuperação",
    emailSent: "Email enviado",
    emailSentDesc: "Verifique a sua caixa de entrada para redefinir a sua palavra-passe.",
    backToLogin: "Voltar ao login",
    passwordUpdated: "Palavra-passe atualizada",
    passwordUpdatedDesc: "Já pode iniciar sessão com a sua nova palavra-passe.",
    createTripTitle: "Criar viagem",
    createTripDesc: "Preencha os dados da sua nova viagem em grupo.",
    title: "Título",
    titlePlaceholder: "Ex: Barcelona com amigos",
    destination: "Destino",
    destinationPlaceholder: "Ex: Barcelona, Espanha",
    start: "Início",
    end: "Fim",
    creating: "A criar...",
    tripCreated: "Viagem criada!",
    inviteCode: "Código de convite",
    errorCreatingTrip: "Erro ao criar viagem",
    joinTripTitle: "Juntar-se a uma viagem",
    joinTripDesc: "Cole o código de convite que partilharam consigo.",
    inviteCodeLabel: "Código de convite",
    inviteCodePlaceholder: "Ex: A1B2C3D4",
    searching: "A procurar...",
    joinMe: "Juntar-me",
    invalidCode: "Código inválido",
    invalidCodeDesc: "Nenhuma viagem encontrada com esse código.",
    alreadyMember: "Já é membro",
    alreadyMemberDesc: "Já faz parte desta viagem.",
    joined: "Juntou-se!",
    joinedDesc: "Agora faz parte da viagem.",
    upcoming: "Próxima",
    active: "Em curso",
    finished: "Terminada",
    inviteFriends: "Convidar amigos",
    code: "Código",
    sections: "Secções",
    member: "membro",
    members: "membros",
    transport: "Transporte",
    accommodation: "Alojamento",
    expenses: "Despesas",
    photos: "Fotos",
    chat: "Chat",
    weather: "Tempo",
    activities: "Atividades",
    howWeTravel: "Como Viajamos",
    add: "Adicionar",
    editTransport: "Editar transporte",
    addTransport: "Adicionar transporte",
    type: "Tipo",
    origin: "Origem",
    arrivalLocation: "Destino",
    departureAddress: "Morada de partida",
    departureAddressPlaceholder: "Rua, número, terminal...",
    departure: "Partida",
    arrival: "Chegada",
    bookingReference: "Referência da reserva",
    notes: "Notas",
    update: "Atualizar",
    save: "Guardar",
    noTransportTitle: "Sem transporte registado",
    noTransportDescCreator: "Adicione os detalhes de voos, comboios ou qualquer meio de transporte.",
    noTransportDescMember: "O administrador da viagem ainda não adicionou transporte.",
    transportUpdated: "Transporte atualizado",
    transportAdded: "Transporte adicionado",
    howToGet: "Como chegar",
    flight: "Voo",
    train: "Comboio",
    bus: "Autocarro",
    car: "Carro",
    other: "Outro",
    whereWeSleep: "Onde Dormimos",
    editAccommodation: "Editar alojamento",
    addAccommodation: "Adicionar alojamento",
    accommodationName: "Nome",
    accommodationNamePlaceholder: "Hotel, apartamento...",
    address: "Morada",
    checkIn: "Check-in",
    checkOut: "Check-out",
    website: "Website",
    websitePlaceholder: "https://www.hotel.com",
    noAccommodationTitle: "Sem alojamento registado",
    noAccommodationDescCreator: "Adicione hotéis, apartamentos ou qualquer alojamento da viagem.",
    noAccommodationDescMember: "O administrador da viagem ainda não adicionou alojamento.",
    accommodationUpdated: "Alojamento atualizado",
    accommodationAdded: "Alojamento adicionado",
    web: "Web",
    sharedExpenses: "Despesas Partilhadas",
    addExpense: "Adicionar despesa",
    editExpense: "Editar despesa",
    expenseTitle: "Título",
    expensePlaceholder: "Jantar, táxi, bilhetes...",
    amount: "Valor (€)",
    paidBy: "Pago por",
    selectPayer: "Selecione quem pagou",
    sharedAmong: "Partilhado entre",
    ticketPhoto: "Foto do recibo",
    takePhoto: "Tirar foto",
    noExpensesTitle: "Sem despesas registadas",
    noExpensesDesc: "Registe despesas e divida contas facilmente entre os membros da viagem.",
    balances: "Saldos",
    expensesList: "Despesas",
    totalSpent: "Total gasto",
    whoOwesWhom: "Quem deve a quem",
    paidByLabel: "Pago por",
    sharedBetween: "Partilhado entre",
    perPerson: "/ pessoa",
    expenseUpdated: "Despesa atualizada",
    expenseAdded: "Despesa adicionada",
    edit: "Editar",
    delete: "Eliminar",
    error: "Erro",
    invalidAmount: "Insira um valor válido",
    errorUploading: "Erro ao carregar foto",
    photosTitle: "Fotos",
    uploadFromGallery: "Da galeria",
    takePhotoBtn: "Tirar foto",
    noPhotosTitle: "Sem fotos ainda",
    noPhotosDesc: "Tire fotos da viagem ou carregue da sua galeria.",
    photoDeleted: "Foto eliminada",
    photoUploaded: "Foto carregada com sucesso",
    errorDeletingPhoto: "Erro ao eliminar a foto",
    errorUploadingPhoto: "Erro ao carregar a foto",
    tripPhoto: "Foto da viagem",
    you: "Você",
    usuario: "Utilizador",
    writeMessage: "Escreva uma mensagem...",
    recordingAudio: "A gravar áudio...",
    today: "Hoje",
    yesterday: "Ontem",
    errorSending: "Erro ao enviar",
    errorUploadingImage: "Erro ao carregar imagem",
    errorUploadingAudio: "Erro ao carregar áudio",
    errorMicrophone: "Não foi possível aceder ao microfone",
    image: "Imagem",
    theWeather: "Tempo",
    now: "Agora",
    feelsLike: "Sensação",
    next10Days: "Próximos 10 dias",
    dataBy: "Dados fornecidos por Open-Meteo",
    noDestination: "Destino da viagem não encontrado.",
    locationNotFound: "Localização não encontrada",
    weatherError: "Erro ao obter a previsão do tempo.",
    clear: "Limpo",
    mostlyClear: "Maioritariamente limpo",
    partlyCloudy: "Parcialmente nublado",
    cloudy: "Nublado",
    fog: "Nevoeiro",
    frozenFog: "Nevoeiro gelado",
    lightDrizzle: "Chuvisco ligeiro",
    moderateDrizzle: "Chuvisco moderado",
    heavyDrizzle: "Chuvisco forte",
    lightRain: "Chuva ligeira",
    moderateRain: "Chuva moderada",
    heavyRain: "Chuva forte",
    lightSnow: "Neve ligeira",
    moderateSnow: "Neve moderada",
    heavySnow: "Neve forte",
    lightShowers: "Aguaceiros ligeiros",
    moderateShowers: "Aguaceiros moderados",
    heavyShowers: "Aguaceiros fortes",
    thunderstorm: "Trovoada",
    thunderstormHail: "Trovoada com granizo",
    thunderstormHeavyHail: "Trovoada com granizo forte",
    unknown: "Desconhecido",
    tomorrow: "Amanhã",
    activitiesTitle: "Atividades",
    addActivity: "Adicionar atividade",
    editActivity: "Editar atividade",
    activityTitle: "Título",
    activityPlaceholder: "Visita ao museu, jantar...",
    date: "Data",
    time: "Hora",
    place: "Local",
    placePlaceholder: "Nome do local",
    addressLabel: "Morada",
    addressPlaceholder: "Rua, número, cidade...",
    description: "Descrição",
    webPage: "Website",
    noActivitiesTitle: "Sem atividades planeadas",
    noActivitiesDescCreator: "Organize o itinerário dia a dia com atividades e horários.",
    noActivitiesDescMember: "O administrador da viagem ainda não planeou atividades.",
    activityUpdated: "Atividade atualizada",
    activityAdded: "Atividade adicionada",
    joinErrorInvalid: "Código de convite inválido ou viagem não encontrada.",
    goHome: "Ir para o início",
    pageNotFound: "Oops! Página não encontrada",
    returnHome: "Voltar ao início",
    selectLanguage: "Idioma",
    helpChatTitle: "Diego",
    helpChatWelcome: "Olá! 👋 Sou o Diego, o seu assistente LORMIT. Pergunte-me como criar viagens, adicionar transportes, gerir despesas ou qualquer dúvida sobre a app.",
    helpChatPlaceholder: "Escreva a sua pergunta...",
    helpChatError: "Desculpe, ocorreu um erro. Tente novamente.",
  },

  it: {
    heroTitle: "Organizza viaggi\ndi gruppo, senza caos.",
    heroSubtitle: "Trasporti, alloggio, spese, foto e chat — tutto in un unico posto.",
    createTrip: "Crea viaggio",
    joinTrip: "Unisciti",
    myTrips: "I Miei Viaggi",
    noTripsTitle: "Nessun viaggio ancora",
    noTripsDesc: "Crea il tuo primo viaggio o unisciti a uno con un codice d'invito.",
    user: "Utente",
    letsGo: "Andiamo a divertirci",
    createAccount: "Crea il tuo account",
    name: "Nome",
    yourName: "Il tuo nome",
    email: "Email",
    password: "Password",
    loading: "Caricamento...",
    login: "Accedi",
    register: "Registrati",
    noAccount: "Non hai un account?",
    registerLink: "Registrati",
    hasAccount: "Hai già un account?",
    loginLink: "Accedi",
    forgotPassword: "Password dimenticata?",
    loginError: "Errore di accesso",
    nameRequired: "Nome richiesto",
    nameRequiredDesc: "Per favore inserisci il tuo nome.",
    registerSuccess: "Registrazione riuscita",
    registerSuccessDesc: "Controlla la tua email per confermare il tuo account.",
    registerError: "Errore di registrazione",
    resetPassword: "Reimposta password",
    newPassword: "Nuova password",
    saving: "Salvataggio...",
    savePassword: "Salva password",
    sending: "Invio...",
    sendRecoveryLink: "Invia link di recupero",
    emailSent: "Email inviata",
    emailSentDesc: "Controlla la tua casella di posta per reimpostare la password.",
    backToLogin: "Torna al login",
    passwordUpdated: "Password aggiornata",
    passwordUpdatedDesc: "Ora puoi accedere con la tua nuova password.",
    createTripTitle: "Crea viaggio",
    createTripDesc: "Compila i dettagli del tuo nuovo viaggio di gruppo.",
    title: "Titolo",
    titlePlaceholder: "Es: Barcellona con amici",
    destination: "Destinazione",
    destinationPlaceholder: "Es: Barcellona, Spagna",
    start: "Inizio",
    end: "Fine",
    creating: "Creazione...",
    tripCreated: "Viaggio creato!",
    inviteCode: "Codice d'invito",
    errorCreatingTrip: "Errore nella creazione del viaggio",
    joinTripTitle: "Unisciti a un viaggio",
    joinTripDesc: "Incolla il codice d'invito che ti è stato condiviso.",
    inviteCodeLabel: "Codice d'invito",
    inviteCodePlaceholder: "Es: A1B2C3D4",
    searching: "Ricerca...",
    joinMe: "Unisciti",
    invalidCode: "Codice non valido",
    invalidCodeDesc: "Nessun viaggio trovato con questo codice.",
    alreadyMember: "Sei già membro",
    alreadyMemberDesc: "Fai già parte di questo viaggio.",
    joined: "Ti sei unito!",
    joinedDesc: "Ora fai parte del viaggio.",
    upcoming: "Prossimo",
    active: "In corso",
    finished: "Terminato",
    inviteFriends: "Invita amici",
    code: "Codice",
    sections: "Sezioni",
    member: "membro",
    members: "membri",
    transport: "Trasporti",
    accommodation: "Alloggio",
    expenses: "Spese",
    photos: "Foto",
    chat: "Chat",
    weather: "Meteo",
    activities: "Attività",
    howWeTravel: "Come Viaggiamo",
    add: "Aggiungi",
    editTransport: "Modifica trasporto",
    addTransport: "Aggiungi trasporto",
    type: "Tipo",
    origin: "Origine",
    arrivalLocation: "Destinazione",
    departureAddress: "Indirizzo di partenza",
    departureAddressPlaceholder: "Via, numero, terminal...",
    departure: "Partenza",
    arrival: "Arrivo",
    bookingReference: "Riferimento prenotazione",
    notes: "Note",
    update: "Aggiorna",
    save: "Salva",
    noTransportTitle: "Nessun trasporto registrato",
    noTransportDescCreator: "Aggiungi i dettagli di voli, treni o qualsiasi mezzo di trasporto.",
    noTransportDescMember: "L'amministratore del viaggio non ha ancora aggiunto trasporti.",
    transportUpdated: "Trasporto aggiornato",
    transportAdded: "Trasporto aggiunto",
    howToGet: "Come arrivare",
    flight: "Volo",
    train: "Treno",
    bus: "Autobus",
    car: "Auto",
    other: "Altro",
    whereWeSleep: "Dove Dormiamo",
    editAccommodation: "Modifica alloggio",
    addAccommodation: "Aggiungi alloggio",
    accommodationName: "Nome",
    accommodationNamePlaceholder: "Hotel, appartamento...",
    address: "Indirizzo",
    checkIn: "Check-in",
    checkOut: "Check-out",
    website: "Sito web",
    websitePlaceholder: "https://www.hotel.com",
    noAccommodationTitle: "Nessun alloggio registrato",
    noAccommodationDescCreator: "Aggiungi hotel, appartamenti o qualsiasi alloggio del viaggio.",
    noAccommodationDescMember: "L'amministratore del viaggio non ha ancora aggiunto alloggi.",
    accommodationUpdated: "Alloggio aggiornato",
    accommodationAdded: "Alloggio aggiunto",
    web: "Web",
    sharedExpenses: "Spese Condivise",
    addExpense: "Aggiungi spesa",
    editExpense: "Modifica spesa",
    expenseTitle: "Titolo",
    expensePlaceholder: "Cena, taxi, biglietti...",
    amount: "Importo (€)",
    paidBy: "Pagato da",
    selectPayer: "Seleziona chi ha pagato",
    sharedAmong: "Condiviso tra",
    ticketPhoto: "Foto dello scontrino",
    takePhoto: "Scatta foto",
    noExpensesTitle: "Nessuna spesa registrata",
    noExpensesDesc: "Registra le spese e dividi facilmente i conti tra i membri del viaggio.",
    balances: "Saldi",
    expensesList: "Spese",
    totalSpent: "Totale speso",
    whoOwesWhom: "Chi deve a chi",
    paidByLabel: "Pagato da",
    sharedBetween: "Condiviso tra",
    perPerson: "/ persona",
    expenseUpdated: "Spesa aggiornata",
    expenseAdded: "Spesa aggiunta",
    edit: "Modifica",
    delete: "Elimina",
    error: "Errore",
    invalidAmount: "Inserisci un importo valido",
    errorUploading: "Errore nel caricamento della foto",
    photosTitle: "Foto",
    uploadFromGallery: "Dalla galleria",
    takePhotoBtn: "Scatta foto",
    noPhotosTitle: "Nessuna foto ancora",
    noPhotosDesc: "Scatta foto del viaggio o caricale dalla tua galleria.",
    photoDeleted: "Foto eliminata",
    photoUploaded: "Foto caricata con successo",
    errorDeletingPhoto: "Errore nell'eliminazione della foto",
    errorUploadingPhoto: "Errore nel caricamento della foto",
    tripPhoto: "Foto del viaggio",
    you: "Tu",
    usuario: "Utente",
    writeMessage: "Scrivi un messaggio...",
    recordingAudio: "Registrazione audio...",
    today: "Oggi",
    yesterday: "Ieri",
    errorSending: "Errore nell'invio",
    errorUploadingImage: "Errore nel caricamento dell'immagine",
    errorUploadingAudio: "Errore nel caricamento dell'audio",
    errorMicrophone: "Impossibile accedere al microfono",
    image: "Immagine",
    theWeather: "Meteo",
    now: "Ora",
    feelsLike: "Percepita",
    next10Days: "Prossimi 10 giorni",
    dataBy: "Dati forniti da Open-Meteo",
    noDestination: "Destinazione del viaggio non trovata.",
    locationNotFound: "Posizione non trovata",
    weatherError: "Errore nell'ottenere le previsioni meteo.",
    clear: "Sereno",
    mostlyClear: "Per lo più sereno",
    partlyCloudy: "Parzialmente nuvoloso",
    cloudy: "Nuvoloso",
    fog: "Nebbia",
    frozenFog: "Nebbia gelata",
    lightDrizzle: "Pioggerellina leggera",
    moderateDrizzle: "Pioggerellina moderata",
    heavyDrizzle: "Pioggerellina forte",
    lightRain: "Pioggia leggera",
    moderateRain: "Pioggia moderata",
    heavyRain: "Pioggia forte",
    lightSnow: "Neve leggera",
    moderateSnow: "Neve moderata",
    heavySnow: "Neve forte",
    lightShowers: "Rovesci leggeri",
    moderateShowers: "Rovesci moderati",
    heavyShowers: "Rovesci forti",
    thunderstorm: "Temporale",
    thunderstormHail: "Temporale con grandine",
    thunderstormHeavyHail: "Temporale con grandine forte",
    unknown: "Sconosciuto",
    tomorrow: "Domani",
    activitiesTitle: "Attività",
    addActivity: "Aggiungi attività",
    editActivity: "Modifica attività",
    activityTitle: "Titolo",
    activityPlaceholder: "Visita al museo, cena...",
    date: "Data",
    time: "Ora",
    place: "Luogo",
    placePlaceholder: "Nome del luogo",
    addressLabel: "Indirizzo",
    addressPlaceholder: "Via, numero, città...",
    description: "Descrizione",
    webPage: "Sito web",
    noActivitiesTitle: "Nessuna attività pianificata",
    noActivitiesDescCreator: "Organizza l'itinerario giorno per giorno con attività e orari.",
    noActivitiesDescMember: "L'amministratore del viaggio non ha ancora pianificato attività.",
    activityUpdated: "Attività aggiornata",
    activityAdded: "Attività aggiunta",
    joinErrorInvalid: "Codice d'invito non valido o viaggio non trovato.",
    goHome: "Vai alla home",
    pageNotFound: "Oops! Pagina non trovata",
    returnHome: "Torna alla home",
    selectLanguage: "Lingua",
    helpChatTitle: "Diego",
    helpChatWelcome: "Ciao! 👋 Sono Diego, il tuo assistente LORMIT. Chiedimi come creare viaggi, aggiungere trasporti, gestire le spese o qualsiasi domanda sull'app.",
    helpChatPlaceholder: "Scrivi la tua domanda...",
    helpChatError: "Mi dispiace, si è verificato un errore. Riprova.",
  },
};

export const getLocale = (lang: Language): string => {
  const locales: Record<Language, string> = {
    es: "es-ES",
    en: "en-GB",
    fr: "fr-FR",
    pt: "pt-PT",
    it: "it-IT",
  };
  return locales[lang];
};

export const getWeatherDescription = (code: number, t: TranslationKeys): string => {
  const map: Record<number, keyof TranslationKeys> = {
    0: "clear",
    1: "mostlyClear",
    2: "partlyCloudy",
    3: "cloudy",
    45: "fog",
    48: "frozenFog",
    51: "lightDrizzle",
    53: "moderateDrizzle",
    55: "heavyDrizzle",
    61: "lightRain",
    63: "moderateRain",
    65: "heavyRain",
    71: "lightSnow",
    73: "moderateSnow",
    75: "heavySnow",
    80: "lightShowers",
    81: "moderateShowers",
    82: "heavyShowers",
    95: "thunderstorm",
    96: "thunderstormHail",
    99: "thunderstormHeavyHail",
  };
  const key = map[code];
  return key ? (t[key] as string) : t.unknown;
};

export default translations;
