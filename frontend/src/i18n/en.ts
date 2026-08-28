/**
 * Английский — язык по умолчанию для незнакомых локалей браузера
 * и эталон структуры для de/es (`satisfies Dictionary`).
 *
 * У русского словаря свои плюральные суффиксы (_few/_many), поэтому
 * структурный тип строится от en, а не от ru.
 */
export const en = {
  layout: {
    timeBadge: "Time: {{tz}}",
    adminLink: "Admin",
    adminCaption: "admin",
    publicHint: "Booking is available for the next 14 days.",
    navBookings: "Bookings",
    navEventTypes: "Event types",
    navToSite: "To site",
    stepBadge: "{{minutes}} min step",
    windowBadge_one: "{{count}}-day window",
    windowBadge_other: "{{count}}-day window",
    ownerScheduleHint:
      "The owner's schedule is in {{ownerTz}}. Meeting times below are shown in your time zone ({{tz}}).",
  },
  footer: {
    eventTypes: "Meeting types",
    admin: "Admin",
    build: "build {{version}}",
  },
  eventTypes: {
    title: "Choose a meeting type",
    subtitle: "A calendar with available times will open after you choose.",
    emptyTitle: "No meetings available yet",
    emptyText: "The calendar owner has not set up any event types yet.",
  },
  booking: {
    breadcrumbHome: "Meeting types",
    fallbackTitle: "Book a meeting",
    emptyTitle: "No free time slots",
    emptyText: "Everything is booked for the next 14 days. Check back later.",
    selectedRange: "Selected: {{range}}",
    fillHint: "Pick a time to fill in your contact details.",
    pickDayHint: "Pick a day in the calendar.",
    timesInYourTz: "Times are shown in your time zone ({{tz}})",
    notifyUnavailableTitle: "Meeting unavailable",
    notifyPickAnotherTitle: "Pick another time",
    notifyFailedTitle: "Booking failed",
  },
  confirmed: {
    title: "You are booked",
    emailSent: "A confirmation was sent to {{email}}",
    timeInYourTz: "Time in your time zone ({{tz}})",
    note: "Note: {{note}}",
    cancelHint:
      "To cancel or reschedule the meeting, contact the calendar owner — in the current version this is done manually.",
    bookAgain: "Book another meeting",
  },
  guestForm: {
    nameLabel: "Name",
    namePlaceholder: "How should we address you",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    noteLabel: "Note",
    noteDescription: "Optional: meeting topic, questions, links",
    submit: "Book",
    nameRequired: "Enter your name",
    emailRequired: "Enter your email",
    emailInvalid: "That address looks misspelled",
    tooLong: "No more than {{max}} characters",
  },
  adminBookings: {
    title: "Upcoming meetings",
    subtitle: "All event types in one list — calendar availability is shared.",
    emptyTitle: "No meetings yet",
    emptyText: "As soon as a guest books a slot, the meeting will appear here.",
    thTime: "Time",
    thEventType: "Event type",
    thGuest: "Guest",
    thNote: "Note",
  },
  adminEventTypes: {
    title: "Event types",
    subtitle: "Define the meeting duration and which slots guests will see.",
    create: "Create",
    emptyTitle: "No event types yet",
    emptyText: "Create the first one — it will appear on the public page right away.",
    thId: "Identifier",
    thTitle: "Title",
    thDuration: "Duration",
    thCreated: "Created",
    modalTitle: "New event type",
    idLabel: "Identifier",
    idDescription: "Becomes part of the public link: /book/intro-call",
    titleLabel: "Title",
    titlePlaceholder: "Intro call",
    descriptionLabel: "Description",
    descriptionHint: "What guests will see on the selection page",
    durationLabel: "Duration, minutes",
    submit: "Create",
    idRequired: "Enter an identifier",
    idPattern: "Lowercase Latin letters, digits and hyphens only: intro-call",
    titleRequired: "Enter a title",
    durationRange: "Between {{min}} and {{max}} minutes",
    createdTitle: "Event type created",
    idTaken: "This identifier is already taken",
    createFailedTitle: "Failed to create",
  },
  queryState: {
    emptyTitle: "Nothing here yet",
    loadFailed: "Failed to load data",
  },
  duration: {
    minutes: "{{count}} min",
    hours: "{{count}} h",
    hoursMinutes: "{{hours}} h {{minutes}} min",
  },
  dateFormats: {
    long: "dddd, MMMM D",
  },
  errors: {
    SLOT_ALREADY_BOOKED: "This time was just taken. Please pick another slot.",
    SLOT_OUT_OF_WINDOW: "Bookings are only available for the next 14 days.",
    SLOT_NOT_ALIGNED: "Invalid meeting start time.",
    SLOT_OUTSIDE_WORKING_HOURS: "The meeting does not fit within working hours.",
    EVENT_TYPE_NOT_FOUND: "This meeting type is no longer available.",
    EVENT_TYPE_ALREADY_EXISTS: "An event type with this identifier already exists.",
    VALIDATION_FAILED: "Please check the entered data.",
    BAD_REQUEST: "Invalid request.",
    INTERNAL_ERROR: "Something went wrong on the server. Please try again later.",
    NOT_FOUND: "The requested resource was not found.",
    network: "Request failed. Check your connection.",
  },
} as const;

/** Все листья словаря — строки; структура фиксируется по en. */
type DeepString<T> = { [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };

export type Dictionary = DeepString<typeof en>;
