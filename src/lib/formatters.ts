import { format as formatTz, formatInTimeZone } from 'date-fns-tz';
import { formatDistance, parseISO } from 'date-fns';
import { hi } from 'date-fns/locale';

const TIMEZONE = 'Asia/Kolkata';

// Format date to Indian format (DD/MM/YYYY)
export const formatDate = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(parsedDate, TIMEZONE, 'dd/MM/yyyy', { locale: hi });
};

// Format date with time in Indian format (DD/MM/YYYY, HH:mm)
export const formatDateTime = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(parsedDate, TIMEZONE, 'dd/MM/yyyy, HH:mm', { locale: hi });
};

// Format relative time (e.g., "2 days ago") in Hindi locale
export const formatRelativeTime = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  return formatDistance(parsedDate, now, {
    addSuffix: true,
    locale: hi
  });
};

// Format currency in Indian Rupees
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};