/**
 * Compute annualized and scaled impact projections from daily CO2 savings.
 */
export function computeProjections(dailySavingsLbs: number) {
  const annualHousehold = dailySavingsLbs * 365;
  const scaled1k = annualHousehold * 1000;
  const scaled10k = annualHousehold * 10000;

  return {
    annualHouseholdLbs: annualHousehold,
    annualHouseholdTons: annualHousehold / 2000,
    scaled1kTons: scaled1k / 2000,
    scaled10kTons: scaled10k / 2000,
  };
}

/**
 * Approximate miles-equivalent for CO2 savings.
 * Average US car emits ~0.89 lbs CO2 per mile.
 */
export function co2ToMiles(co2Lbs: number): number {
  return Math.round(co2Lbs / 0.89);
}
