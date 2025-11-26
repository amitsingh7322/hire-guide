export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName}${lastName}`.toUpperCase();
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function calculateDynamicPrice(
  baseRate: number,
  date: Date,
  numberOfPeople: number,
  duration: number
): number {
  let finalPrice = baseRate;
  
  // Season multiplier
  const month = date.getMonth();
  const isHighSeason = [10, 11, 0, 1, 4, 5].includes(month);
  if (isHighSeason) {
    finalPrice *= 1.3;
  }
  
  // Weekend multiplier
  const day = date.getDay();
  if (day === 0 || day === 6) {
    finalPrice *= 1.2;
  }
  
  // Group discount
  if (numberOfPeople >= 5) {
    finalPrice *= 0.85;
  } else if (numberOfPeople >= 3) {
    finalPrice *= 0.9;
  }
  
  // Duration discount
  if (duration >= 8) {
    finalPrice *= 0.8;
  } else if (duration >= 4) {
    finalPrice *= 0.9;
  }
  
  return Math.round(finalPrice * duration);
}
