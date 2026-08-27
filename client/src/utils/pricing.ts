import type { PricingTier } from '../types';

interface TierDefinition {
  key: keyof PricingTier;
  days: number;
  label: string;
}

const TIER_DEFINITIONS: TierDefinition[] = [
  { key: 'day1_10to20', days: 1, label: '1 день (10:00-20:00)' },
  { key: 'day1', days: 1, label: '1 сутки' },
  { key: 'days2', days: 2, label: '2 суток' },
  { key: 'days3', days: 3, label: '3 суток' },
  { key: 'days7', days: 7, label: '7 суток' },
  { key: 'days14', days: 14, label: '14 суток' },
  { key: 'days30', days: 30, label: '30 суток' },
];

const isPackagePrice = (pricing: PricingTier, value: number, periodDays: number) =>
  periodDays > 1 && pricing.day1 > 0 && value > pricing.day1;

export const getPricingRows = (pricing?: PricingTier) => {
  if (!pricing) return [];

  return TIER_DEFINITIONS
    .map((tier) => {
      const value = Number(pricing[tier.key]) || 0;
      const isPackage = isPackagePrice(pricing, value, tier.days);
      return {
        ...tier,
        value,
        isPackage,
        suffix: isPackage ? ' за весь срок' : tier.days > 1 ? '/сут' : '',
      };
    })
    .filter((tier) => tier.value > 0);
};

export const getEffectiveDailyPrice = (pricing: PricingTier | undefined, rentalDays: number, fallback: number) => {
  if (!pricing) return fallback;

  const tier = rentalDays >= 30
    ? { value: pricing.days30, days: 30 }
    : rentalDays >= 14
    ? { value: pricing.days14, days: 14 }
    : rentalDays >= 7
    ? { value: pricing.days7, days: 7 }
    : rentalDays >= 3
    ? { value: pricing.days3, days: 3 }
    : rentalDays === 2
    ? { value: pricing.days2, days: 2 }
    : { value: pricing.day1, days: 1 };

  if (!tier.value || tier.value <= 0) return fallback;
  return isPackagePrice(pricing, tier.value, tier.days) ? tier.value / tier.days : tier.value;
};

export const calculateRentalTotal = (pricing: PricingTier | undefined, rentalDays: number, fallback: number) =>
  Math.round(getEffectiveDailyPrice(pricing, rentalDays, fallback) * rentalDays);

export const getMinimumDailyPrice = (pricing: PricingTier | undefined, fallback: number) => {
  if (!pricing) return fallback;
  const prices = getPricingRows(pricing).map((tier) =>
    tier.isPackage ? tier.value / tier.days : tier.value
  );
  return prices.length > 0 ? Math.round(Math.min(...prices)) : fallback;
};

export const getPeriodPrice = (pricing: PricingTier | undefined, periodDays: number, fallback: number) =>
  calculateRentalTotal(pricing, periodDays, fallback);
