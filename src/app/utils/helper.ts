export const generateId = (): string => {
  return crypto.randomUUID();
};

export function addOrdinalSuffix(number: number): string {
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  const value = number % 100;

  if (value >= 11 && value <= 13) return `${number}th`;

  const lastDigit = number % 10;
  const suffix = suffixes[lastDigit] || "th";
  return `${number}${suffix}`;
}
