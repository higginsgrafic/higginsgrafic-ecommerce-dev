/**
 * Utilitats per validar formularis
 */

/**
 * Validar email
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validar telèfon espanyol
 */
export const validatePhone = (phone) => {
  // Format: 612345678 o +34612345678
  const cleaned = phone.replace(/\s/g, '');
  const regex = /^(\+34)?[6-9]\d{8}$/;
  return regex.test(cleaned);
};

/**
 * Validar codi postal espanyol
 */
export const validatePostalCode = (postalCode) => {
  // Format: 08001 (5 dígits)
  const regex = /^[0-5]\d{4}$/;
  return regex.test(postalCode);
};

/**
 * Validar NIF/NIE espanyol
 */
export const validateNIF = (nif) => {
  const cleaned = nif.toUpperCase().replace(/\s/g, '');

  // NIE
  if (/^[XYZ]\d{7}[A-Z]$/.test(cleaned)) {
    const nieMap = { X: 0, Y: 1, Z: 2 };
    const number = nieMap[cleaned[0]] + cleaned.substring(1, 8);
    const letter = 'TRWAGMYFPDXBNJZSQVHLCKE'[parseInt(number) % 23];
    return letter === cleaned[8];
  }

  // NIF
  if (/^\d{8}[A-Z]$/.test(cleaned)) {
    const number = cleaned.substring(0, 8);
    const letter = 'TRWAGMYFPDXBNJZSQVHLCKE'[parseInt(number) % 23];
    return letter === cleaned[8];
  }

  return false;
};

/**
 * Validar camp obligatori
 */
export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value != null && value !== '';
};

/**
 * Validar longitud mínima
 */
export const validateMinLength = (value, minLength) => {
  if (typeof value === 'string') {
    return value.trim().length >= minLength;
  }
  return String(value).length >= minLength;
};

/**
 * Validar longitud màxima
 */
export const validateMaxLength = (value, maxLength) => {
  if (typeof value === 'string') {
    return value.trim().length <= maxLength;
  }
  return String(value).length <= maxLength;
};

/**
 * Validar rang numèric
 */
export const validateRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validar URL
 */
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validar contrasenya forta
 * Mínim 8 caràcters, 1 majúscula, 1 minúscula, 1 número
 */
export const validatePassword = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  return true;
};

/**
 * Validar que dues contrasenyes coincideixen
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Validar format de data (DD/MM/YYYY)
 */
export const validateDate = (date) => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = date.match(regex);

  if (!match) return false;

  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  const year = parseInt(match[3]);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const dateObj = new Date(year, month - 1, day);
  return dateObj.getDate() === day && dateObj.getMonth() === month - 1 && dateObj.getFullYear() === year;
};

/**
 * Validar edat mínima
 */
export const validateMinAge = (birthDate, minAge = 18) => {
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= minAge;
  }

  return age >= minAge;
};

/**
 * Validar IBAN espanyol
 */
export const validateIBAN = (iban) => {
  const cleaned = iban.toUpperCase().replace(/\s/g, '');

  // IBAN espanyol: ES + 2 dígits + 20 dígits
  if (!/^ES\d{22}$/.test(cleaned)) {
    return false;
  }

  // Algorisme de validació IBAN
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const numericIBAN = rearranged.replace(/[A-Z]/g, char => char.charCodeAt(0) - 55);

  // Mòdul 97
  let remainder = '';
  for (let i = 0; i < numericIBAN.length; i++) {
    remainder += numericIBAN[i];
    if (remainder.length >= 9) {
      remainder = String(parseInt(remainder) % 97);
    }
  }

  return parseInt(remainder) % 97 === 1;
};

/**
 * Formatar telèfon espanyol
 */
export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  if (cleaned.length === 11 && cleaned.startsWith('34')) {
    return '+34 ' + cleaned.slice(2).replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  return phone;
};

/**
 * Formatar codi postal
 */
export const formatPostalCode = (postalCode) => {
  return postalCode.replace(/\D/g, '').slice(0, 5);
};

/**
 * Formatar IBAN
 */
export const formatIBAN = (iban) => {
  const cleaned = iban.toUpperCase().replace(/\s/g, '');
  return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
};

/**
 * Validar formulari complet
 * Retorna objecte amb errors per cada camp
 */
export const validateForm = (data, rules) => {
  const errors = {};

  for (const [field, validators] of Object.entries(rules)) {
    const value = data[field];

    for (const validator of validators) {
      const { validate, message } = validator;
      if (!validate(value)) {
        errors[field] = message;
        break; // Només mostrar primer error per camp
      }
    }
  }

  return errors;
};

/**
 * Exemple d'ús de validateForm:
 *
 * const rules = {
 *   email: [
 *     { validate: validateRequired, message: 'El correu és obligatori' },
 *     { validate: validateEmail, message: 'Format de correu invàlid' }
 *   ],
 *   phone: [
 *     { validate: validateRequired, message: 'El telèfon és obligatori' },
 *     { validate: validatePhone, message: 'Format de telèfon invàlid' }
 *   ]
 * };
 *
 * const errors = validateForm(formData, rules);
 */

export default {
  validateEmail,
  validatePhone,
  validatePostalCode,
  validateNIF,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateRange,
  validateURL,
  validatePassword,
  validatePasswordMatch,
  validateDate,
  validateMinAge,
  validateIBAN,
  formatPhone,
  formatPostalCode,
  formatIBAN,
  validateForm
};
