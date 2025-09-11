export const formatDate = (
  date: Date | string,
  locale: string = 'it-IT',
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return dateObj.toLocaleDateString(locale, options || defaultOptions);
};

export const formatDateTime = (
  date: Date | string,
  locale: string = 'it-IT'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeAgo = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'proprio ora';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minuti fa`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ore fa`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} giorni fa`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} mesi fa`;
  return `${Math.floor(diffInSeconds / 31536000)} anni fa`;
};

export const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};