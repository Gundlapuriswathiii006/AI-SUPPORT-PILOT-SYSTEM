export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPassword = (password) => password && password.length >= 6;

export const isRequired = (value) => value !== null && value !== undefined && String(value).trim().length > 0;
