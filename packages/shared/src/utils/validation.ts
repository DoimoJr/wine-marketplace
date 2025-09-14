export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUsername = (username: string): boolean => {
  // Username should be 3-20 characters, alphanumeric and underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
};

export const isValidPrice = (price: number): boolean => {
  return price > 0 && price <= 10000; // Max 10k EUR
};

export const isValidVintage = (annata: number): boolean => {
  const currentYear = new Date().getFullYear();
  return annata >= 1800 && annata <= currentYear;
};

export const isValidPostalCode = (postalCode: string, country: string): boolean => {
  const patterns: { [key: string]: RegExp } = {
    IT: /^\d{5}$/,
    US: /^\d{5}(-\d{4})?$/,
    GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
    FR: /^\d{5}$/,
    DE: /^\d{5}$/,
    ES: /^\d{5}$/,
  };

  const pattern = patterns[country.toUpperCase()];
  return pattern ? pattern.test(postalCode) : true; // Default to valid for unknown countries
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export const isValidFileType = (filename: string, allowedTypes: string[]): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
};

export const isValidImageFile = (filename: string): boolean => {
  return isValidFileType(filename, ['jpg', 'jpeg', 'png', 'webp']);
};