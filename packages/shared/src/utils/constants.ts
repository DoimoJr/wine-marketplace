export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    GOOGLE: '/auth/google',
    FACEBOOK: '/auth/facebook',
  },
  USERS: {
    BASE: '/users',
    PROFILE: (id: string) => `/users/${id}/profile`,
    WINES: (id: string) => `/users/${id}/wines`,
    ORDERS: (id: string) => `/users/${id}/orders`,
    REVIEWS: (id: string) => `/users/${id}/reviews`,
  },
  WINES: {
    BASE: '/wines',
    SEARCH: '/wines/search',
    FILTERS: '/wines/filters',
    DETAIL: (id: string) => `/wines/${id}`,
    REVIEWS: (id: string) => `/wines/${id}/reviews`,
  },
  ORDERS: {
    BASE: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    PAYMENT: (id: string) => `/orders/${id}/payment`,
    SHIPPING: (id: string) => `/orders/${id}/shipping`,
  },
  MESSAGES: {
    BASE: '/messages',
    CONVERSATIONS: '/messages/conversations',
    CONVERSATION: (id: string) => `/messages/conversations/${id}`,
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    WINES: '/admin/wines',
    ORDERS: '/admin/orders',
    REFUNDS: '/admin/refunds',
    LOGS: '/admin/logs',
  },
  UPLOAD: {
    IMAGE: '/upload/image',
    AVATAR: '/upload/avatar',
  },
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const WINE_LIMITS = {
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 2000,
  MAX_IMAGES: 10,
  MAX_QUANTITY: 999,
  MIN_PRICE: 0.01,
  MAX_PRICE: 10000,
};

export const USER_LIMITS = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  BIO_MAX_LENGTH: 500,
  FIRST_NAME_MAX_LENGTH: 50,
  LAST_NAME_MAX_LENGTH: 50,
};

export const ORDER_LIMITS = {
  MAX_ITEMS_PER_ORDER: 50,
};

export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_AVATAR_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

export const SHIPPING_PROVIDERS = {
  POSTE_ITALIANE: 'poste-italiane',
  BRT: 'brt',
  DHL: 'dhl',
  UPS: 'ups',
  FEDEX: 'fedex',
};

export const CURRENCIES = {
  EUR: '€',
  USD: '$',
  GBP: '£',
};

export const WINE_REGIONS = {
  ITALY: [
    'Piemonte',
    'Toscana',
    'Veneto',
    'Lombardia',
    'Emilia-Romagna',
    'Marche',
    'Abruzzo',
    'Puglia',
    'Sicilia',
    'Sardegna',
    'Lazio',
    'Umbria',
    'Campania',
    'Friuli-Venezia Giulia',
    'Trentino-Alto Adige',
    'Liguria',
    'Molise',
    'Basilicata',
    'Calabria',
    'Valle d\'Aosta',
  ],
  FRANCE: [
    'Bordeaux',
    'Burgundy',
    'Champagne',
    'Rhône Valley',
    'Loire Valley',
    'Alsace',
    'Languedoc',
    'Provence',
  ],
  SPAIN: [
    'Rioja',
    'Ribera del Duero',
    'Priorat',
    'Rias Baixas',
    'Jerez',
    'La Mancha',
  ],
};