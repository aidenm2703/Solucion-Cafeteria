const CURRENCY = {
  symbol: '₡',
  prefix: false,
};

export function formatMoney(value) {
  const num = Number(value) || 0;
  const formatted = num.toLocaleString('es-CR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${CURRENCY.symbol}${formatted}`;
}

export function formatMoneyShort(value) {
  const num = Number(value) || 0;
  const formatted = num.toLocaleString('es-CR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${CURRENCY.symbol}${formatted}`;
}
