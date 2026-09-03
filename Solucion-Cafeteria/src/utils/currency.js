import { storage, DEFAULT_EXCHANGE_RATE } from './storage';

/* ============================================
   Gaia Dynamics | Utilidades de Moneda
   Conversión USD ⇄ Bs según el tipo de cambio
   configurado (almacenado en localStorage).
   ============================================ */

export { DEFAULT_EXCHANGE_RATE };

export function getExchangeRate() {
  return storage.getExchangeRate();
}

export function isValidRate(rate) {
  return typeof rate === 'number' && Number.isFinite(rate) && rate > 0;
}

export function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function usdToBs(usdAmount, rate) {
  const r = isValidRate(rate) ? rate : getExchangeRate();
  return round2(Number(usdAmount || 0) * r);
}

export function formatUsd(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function formatBs(value) {
  const amount = Number(value || 0);
  return `Bs ${amount.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDual(usdAmount, rate) {
  const usd = Number(usdAmount || 0);
  return `${formatUsd(usd)} (${formatBs(usdToBs(usd, rate))})`;
}

export function formatRateText(rate) {
  const r = isValidRate(rate) ? rate : getExchangeRate();
  return `1 USD = ${formatBs(r)}`;
}

export function formatMoney(value) {
  return formatUsd(value);
}

export function formatMoneyShort(value) {
  return formatUsd(value);
}
