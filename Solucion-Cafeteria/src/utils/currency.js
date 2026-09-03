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

/** Convierte un monto en USD a bolívares usando la tasa recibida o la configurada. */
export function usdToBs(usdAmount, rate) {
  const r = isValidRate(rate) ? rate : getExchangeRate();
  return round2(Number(usdAmount || 0) * r);
}

/** Formatea un monto en USD →  $12,50 */
export function formatUsd(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

/** Formatea un monto en bolívares →  Bs 456,25 */
export function formatBs(value) {
  const amount = Number(value || 0);
  return `Bs ${amount.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Formato combinado: $12,50 (Bs 456,25) */
export function formatDual(usdAmount, rate) {
  const usd = Number(usdAmount || 0);
  return `${formatUsd(usd)} (${formatBs(usdToBs(usd, rate))})`;
}

/** Texto de tasa: 1 USD = Bs 36,50 */
export function formatRateText(rate) {
  const r = isValidRate(rate) ? rate : getExchangeRate();
  return `1 USD = ${formatBs(r)}`;
}