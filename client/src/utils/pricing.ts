import type { PricingTier } from '../types';

interface TierDefinition {
  key: keyof PricingTier;
  days: number;
  label: string;
  optional?: boolean;
}

const TIER_DEFINITIONS: TierDefinition[] = [
  { key: 'day1_10to20', days: 1, label: '1 день (10:00-20:00)', optional: true },
  { key: 'day1', days: 1, label: '1 сутки' },
  { key: 'days2', days: 2, label: '2 суток' },
  { key: 'days3', days: 3, label: '3 суток' },
  { key: 'days4', days: 4, label: '4+ суток', optional: true },
  { key: 'days7', days: 7, label: '7 суток' },
  { key: 'days14', days: 14, label: '14 суток' },
  { key: 'days30', days: 30, label: '30 суток' },
];

const isPackagePrice = (pricing: PricingTier, value: number, periodDays: number) =>
  periodDays > 1 && pricing.day1 > 0 && value > pricing.day1;

export const getPricingRows = (pricing?: PricingTier) => {
  if (!pricing) return [];

  const rows = TIER_DEFINITIONS
    .map((tier) => {
      const value = Number(pricing[tier.key]) || 0;
      const isPackage = isPackagePrice(pricing, value, tier.days);
      const effectiveDailyPrice = isPackage ? value / tier.days : value;
      return {
        ...tier,
        value,
        isPackage,
        effectiveDailyPrice,
        suffix: isPackage ? ' за весь срок' : tier.days > 1 ? '/сут' : '',
      };
    })
    .filter((tier) => tier.value > 0)
    .filter((tier, index, tiers) => {
      if (tier.key === 'day1_10to20') return true;
      const previousComparableItems = tiers
        .slice(0, index)
        .filter((item) => item.key !== 'day1_10to20');
      const previousComparable = previousComparableItems[previousComparableItems.length - 1];
      return !previousComparable || previousComparable.effectiveDailyPrice !== tier.effectiveDailyPrice;
    });

  const weekendDay = Number(pricing.weekendDay) || 0;
  if (weekendDay > 0) {
    rows.unshift({
      key: 'weekendDay',
      days: 1,
      label: 'Пт-Сб-Вс',
      optional: true,
      value: weekendDay,
      isPackage: false,
      effectiveDailyPrice: weekendDay,
      suffix: '/сут',
    });
  }

  return rows;
};

export const getEffectiveDailyPrice = (pricing: PricingTier | undefined, rentalDays: number, fallback: number) => {
  if (!pricing) return fallback;

  const tier = rentalDays >= 30
    ? { value: pricing.days30, days: 30 }
    : rentalDays >= 14
    ? { value: pricing.days14, days: 14 }
    : rentalDays >= 7
    ? { value: pricing.days7, days: 7 }
    : rentalDays >= 4 && pricing.days4
    ? { value: pricing.days4, days: 4 }
    : rentalDays >= 3
    ? { value: pricing.days3, days: 3 }
    : rentalDays === 2
    ? { value: pricing.days2, days: 2 }
    : { value: pricing.day1, days: 1 };

  if (!tier.value || tier.value <= 0) return fallback;
  return isPackagePrice(pricing, tier.value, tier.days) ? tier.value / tier.days : tier.value;
};

const isWeekendRentalDay = (date: Date) => [0, 5, 6].includes(date.getDay());

const getRentalPeriodStart = (startDate: string, startTime = '10:00', offsetDays: number) => {
  const [year, month, day] = startDate.split('-').map(Number);
  const [hours, minutes] = startTime.split(':').map(Number);
  return new Date(year, month - 1, day + offsetDays, hours || 0, minutes || 0);
};

export const calculateRentalTotal = (
  pricing: PricingTier | undefined,
  rentalDays: number,
  fallback: number,
  options?: { startDate?: string; startTime?: string },
) => {
  const effectiveDailyPrice = getEffectiveDailyPrice(pricing, rentalDays, fallback);
  const weekendDay = Number(pricing?.weekendDay) || 0;

  if (!weekendDay || !options?.startDate) {
    return Math.round(effectiveDailyPrice * rentalDays);
  }

  return Math.round(Array.from({ length: rentalDays }).reduce((sum, _, index) => {
    const periodStart = getRentalPeriodStart(options.startDate || '', options.startTime, index);
    return sum + (isWeekendRentalDay(periodStart) ? weekendDay : effectiveDailyPrice);
  }, 0));
};

export const getMinimumDailyPrice = (pricing: PricingTier | undefined, fallback: number) => {
  if (!pricing) return fallback;
  const prices = getPricingRows(pricing).map((tier) =>
    tier.isPackage ? tier.value / tier.days : tier.value
  );
  return prices.length > 0 ? Math.round(Math.min(...prices)) : fallback;
};

export const getPeriodPrice = (pricing: PricingTier | undefined, periodDays: number, fallback: number) =>
  calculateRentalTotal(pricing, periodDays, fallback);

const parseDateTimeInput = (date: string, time = '10:00') => {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours || 0, minutes || 0);
};

export const calculateBillableRentalDays = (
  startDate: string,
  endDate: string,
  startTime = '10:00',
  endTime = '10:00',
) => {
  if (!startDate || !endDate) return 0;

  const start = parseDateTimeInput(startDate, startTime);
  const end = parseDateTimeInput(endDate, endTime);
  if (end <= start) return 0;

  const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return Math.max(1, Math.ceil(diffHours / 24));
};
