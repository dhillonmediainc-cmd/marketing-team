// Display formatting helpers.

export const usd = (n: number): string =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export const usd2 = (n: number): string =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const pct = (n: number): string => `${n.toFixed(1)}%`;

export const num = (n: number): string => n.toLocaleString("en-US");
