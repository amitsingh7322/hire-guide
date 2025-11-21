// ============================================
// Dynamic Pricing Utility
// src/utils/pricing.js
// ============================================

/**
 * Calculate dynamic price for guide bookings
 * Based on date, group size, and duration
 */
function calculateDynamicPrice(baseRate, date, numberOfPeople, durationHours) {
  let finalPrice = baseRate;
  
  // Convert to Date object if string
  const bookingDate = typeof date === 'string' ? new Date(date) : date;
  
  // 1. Season Multiplier
  const month = bookingDate.getMonth();
  const isHighSeason = [10, 11, 0, 1, 4, 5].includes(month); // Nov-Feb, May-Jun
  if (isHighSeason) {
    finalPrice *= 1.3; // 30% increase
  }
  
  // 2. Weekend Multiplier
  const day = bookingDate.getDay();
  if (day === 0 || day === 6) { // Sunday or Saturday
    finalPrice *= 1.2; // 20% increase
  }
  
  // 3. Group Size Discount
  if (numberOfPeople >= 5) {
    finalPrice *= 0.85; // 15% discount
  } else if (numberOfPeople >= 3) {
    finalPrice *= 0.9; // 10% discount
  }
  
  // 4. Duration Discount
  if (durationHours >= 8) {
    finalPrice *= 0.8; // 20% discount for full day
  } else if (durationHours >= 4) {
    finalPrice *= 0.9; // 10% discount for half day
  }
  
  // Calculate total based on duration
  const total = finalPrice * durationHours;
  
  return Math.round(total);
}

/**
 * Calculate platform fee (10% of total amount)
 */
function calculatePlatformFee(amount) {
  return Math.round(amount * 0.1);
}

/**
 * Get pricing breakdown for display
 */
function getPricingBreakdown(baseRate, date, numberOfPeople, durationHours, vehicleRate = 0) {
  const bookingDate = typeof date === 'string' ? new Date(date) : date;
  
  // Base calculations
  let hourlyRate = baseRate;
  const multipliers = [];
  
  // Season
  const month = bookingDate.getMonth();
  const isHighSeason = [10, 11, 0, 1, 4, 5].includes(month);
  if (isHighSeason) {
    multipliers.push({ name: 'High Season', value: '+30%' });
    hourlyRate *= 1.3;
  }
  
  // Weekend
  const day = bookingDate.getDay();
  if (day === 0 || day === 6) {
    multipliers.push({ name: 'Weekend', value: '+20%' });
    hourlyRate *= 1.2;
  }
  
  // Group discount
  if (numberOfPeople >= 5) {
    multipliers.push({ name: 'Group Discount (5+)', value: '-15%' });
    hourlyRate *= 0.85;
  } else if (numberOfPeople >= 3) {
    multipliers.push({ name: 'Group Discount (3-4)', value: '-10%' });
    hourlyRate *= 0.9;
  }
  
  // Duration discount
  if (durationHours >= 8) {
    multipliers.push({ name: 'Full Day Discount', value: '-20%' });
    hourlyRate *= 0.8;
  } else if (durationHours >= 4) {
    multipliers.push({ name: 'Half Day Discount', value: '-10%' });
    hourlyRate *= 0.9;
  }
  
  const guideAmount = Math.round(hourlyRate * durationHours);
  const vehicleAmount = vehicleRate;
  const subtotal = guideAmount + vehicleAmount;
  const platformFee = calculatePlatformFee(subtotal);
  const total = subtotal + platformFee;
  
  return {
    baseRate,
    adjustedHourlyRate: Math.round(hourlyRate),
    multipliers,
    guideAmount,
    vehicleAmount,
    subtotal,
    platformFee,
    total,
    breakdown: {
      'Guide Service': `₹${Math.round(hourlyRate)}/hr × ${durationHours} hrs = ₹${guideAmount}`,
      ...(vehicleAmount > 0 && { 'Vehicle Rental': `₹${vehicleAmount}` }),
      'Platform Fee (10%)': `₹${platformFee}`,
      'Total Amount': `₹${total}`,
    },
  };
}

/**
 * Format currency in Indian Rupees
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

module.exports = {
  calculateDynamicPrice,
  calculatePlatformFee,
  getPricingBreakdown,
  formatCurrency,
};