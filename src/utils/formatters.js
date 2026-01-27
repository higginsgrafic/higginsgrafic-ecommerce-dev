/**
 * Utilitats per formatar dades
 */

/**
 * Formatar preu en euros
 */
export const formatPrice = (price, options = {}) => {
  const {
    decimals = 2,
    currency = '€',
    showCurrency = true,
    useComma = true
  } = options;

  const parsed = (() => {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
      const cleaned = price.replace(',', '.').replace(/[^0-9.\-]/g, '');
      const asNumber = Number.parseFloat(cleaned);
      return asNumber;
    }
    return Number.NaN;
  })();

  if (!Number.isFinite(parsed)) return '—';

  const currencyCode = currency === '€' ? 'EUR' : currency;

  if (showCurrency && currencyCode === 'EUR') {
    const formatter = new Intl.NumberFormat('ca-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return formatter.format(parsed);
  }

  const formatted = parsed.toFixed(decimals);
  const withComma = useComma ? formatted.replace('.', ',') : formatted;

  return showCurrency ? `${withComma} ${currency}` : withComma;
};

/**
 * Formatar data en català
 */
export const formatDate = (date, format = 'long') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const formats = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' }, // 27/11/2024
    medium: { day: '2-digit', month: 'short', year: 'numeric' }, // 27 nov. 2024
    long: { day: '2-digit', month: 'long', year: 'numeric' }, // 27 de novembre de 2024
    full: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' } // dimarts, 27 de novembre de 2024
  };

  return dateObj.toLocaleDateString('ca-ES', formats[format] || formats.long);
};

/**
 * Formatar data relativa (fa 2 dies, fa 1 hora, etc.)
 */
export const formatRelativeDate = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now - dateObj;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'Ara mateix';
  if (minutes < 60) return `Fa ${minutes} ${minutes === 1 ? 'minut' : 'minuts'}`;
  if (hours < 24) return `Fa ${hours} ${hours === 1 ? 'hora' : 'hores'}`;
  if (days < 30) return `Fa ${days} ${days === 1 ? 'dia' : 'dies'}`;
  if (months < 12) return `Fa ${months} ${months === 1 ? 'mes' : 'mesos'}`;
  return `Fa ${years} ${years === 1 ? 'any' : 'anys'}`;
};

/**
 * Formatar número amb milers
 */
export const formatNumber = (number, useComma = true) => {
  const separator = useComma ? '.' : ',';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

/**
 * Formatar percentatge
 */
export const formatPercentage = (value, decimals = 0) => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formatar mida d'arxiu
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Formatar durada en temps
 */
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

/**
 * Truncar text amb punts suspensius
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalitzar primera lletra
 */
export const capitalize = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Convertir a slug (URL amigable)
 */
export const slugify = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD') // Eliminar accents
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '') // Eliminar caràcters especials
    .replace(/\s+/g, '-') // Espais a guions
    .replace(/--+/g, '-') // Múltiples guions a un
    .trim();
};

/**
 * Formatar número de telèfon
 */
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  return phone;
};

/**
 * Formatar número de targeta de crèdit
 */
export const formatCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(' ');
};

/**
 * Ocultar dígits de targeta (mostrar només últims 4)
 */
export const maskCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  const lastFour = cleaned.slice(-4);
  return `•••• •••• •••• ${lastFour}`;
};

/**
 * Formatar distància
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Formatar pes
 */
export const formatWeight = (grams) => {
  if (grams < 1000) {
    return `${Math.round(grams)} g`;
  }
  return `${(grams / 1000).toFixed(2)} kg`;
};

/**
 * Pluralitzar paraula en català
 */
export const pluralize = (count, singular, plural) => {
  return count === 1 ? singular : plural;
};

/**
 * Exemple d'ús:
 * pluralize(1, 'producte', 'productes') → 'producte'
 * pluralize(5, 'producte', 'productes') → 'productes'
 */

/**
 * Formatar interval de temps
 */
export const formatTimeRange = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  const sameDay = start.toDateString() === end.toDateString();

  if (sameDay) {
    return `${formatDate(start, 'short')} ${start.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}`;
  }

  return `${formatDate(start, 'short')} - ${formatDate(end, 'short')}`;
};

/**
 * Eliminar accents d'un text
 */
export const removeAccents = (text) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export default {
  formatPrice,
  formatDate,
  formatRelativeDate,
  formatNumber,
  formatPercentage,
  formatFileSize,
  formatDuration,
  truncateText,
  capitalize,
  slugify,
  formatPhoneNumber,
  formatCardNumber,
  maskCardNumber,
  formatDistance,
  formatWeight,
  pluralize,
  formatTimeRange,
  removeAccents
};
