import { useState } from 'react';
import { storage } from '../utils/storage';
import Modal from './Modal';
import { useToast } from './useToast';
import { formatMoney } from '../utils/currency';
const METHOD_ICONS = {
  efectivo: '💵 Efectivo',
  tarjeta: '💳 Tarjeta',
  transferencia: '📱 Transferencia',
  qr: '📷 Código QR',
};

export default function TurnManager() {
  const { confirm, showToast } = useToast();
  const [turn, setTurn] = useState(storage.getTurn());
  const [showCorte, setShowCorte] = useState(false);
  const [corte, setCorte] = useState(null);

  const handleOpenTurn = async () => {
    const ok = await confirm({
      title: 'Abrir el turno del día',
      message: '¿Confirmas que deseas abrir el turno para comenzar a vender?',
      confirmText: 'Sí, abrir turno',
      cancelText: 'Cancelar',
    });
    if (!ok) return;
    const newTurn = storage.openTurn();
    setTurn(newTurn);
    showToast({
      type: 'success',
      title: 'Turno abierto',
      message: 'El turno del día está abierto. ¡Buenas ventas!',
    });
  };

  const handleCloseTurn = async () => {
    const ok = await confirm({
      title: 'Cerrar turno',
      message:
        '¿Estás seguro de que deseas cerrar el turno? Se realizará el corte del día y ya no podrás vender hasta abrir uno nuevo.',
      confirmText: 'Sí, cerrar turno',
      cancelText: 'Cancelar',
      danger: true,
    });
    if (!ok) return;
    const closed = storage.closeTurn();
    const report = buildCorte(closed);
    setCorte(report);
    setShowCorte(true);
    setTurn(null);
    showToast({
      type: 'info',
      title: 'Turno cerrado',
      message: 'El turno se cerró y el corte del día quedó listo.',
    });
  };

  function buildCorte(turnObj) {
    const orders = storage.getOrders().filter(
      (o) =>
        o.date &&
        turnObj.openedAt &&
        new Date(o.date) >= new Date(turnObj.openedAt) &&
        new Date(o.date) <= new Date(turnObj.closedAt)
    );

    let total = 0;
    let totalTips = 0;
    const byMethod = {
      efectivo: 0,
      tarjeta: 0,
      transferencia: 0,
      qr: 0,
    };
    const byMethodCount = {
      efectivo: 0,
      tarjeta: 0,
      transferencia: 0,
      qr: 0,
    };

    orders.forEach((o) => {
      total += o.total || 0;
      totalTips += o.tip || 0;
      const m = o.paymentMethod;
      if (byMethod[m] !== undefined) {
        byMethod[m] += o.total || 0;
        byMethodCount[m] += 1;
      }
    });

    return {
      ...turnObj,
      totalOrders: orders.length,
      total,
      totalTips,
      byMethod,
      byMethodCount,
      startLabel: formatTime(turnObj.openedAt),
      endLabel: formatTime(turnObj.closedAt),
    };
  }

  function formatTime(iso) {
    return new Date(iso).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const isOpen = !!turn;

  return (
    <>
      <div className={`turn-manager ${isOpen ? 'open' : 'closed'}`}>
        <div className="turn-manager-status">
          <span className={`turn-dot ${isOpen ? 'active' : ''}`} />
          <span className="turn-status-label">
            {isOpen ? 'Turno abierto' : 'Turno cerrado'}
          </span>
        </div>

        {isOpen && (
          <div className="turn-manager-time">
            Abierto a las {formatTime(turn.openedAt)}
          </div>
        )}

        {!isOpen && (
          <button className="btn btn-primary btn-block" onClick={handleOpenTurn}>
            🔓 Abrir Turno
          </button>
        )}

        {isOpen && (
          <button className="btn btn-danger btn-block" onClick={handleCloseTurn}>
            🔒 Cerrar Turno y Corte
          </button>
        )}
      </div>

      <Modal
        isOpen={showCorte}
        onClose={() => setShowCorte(false)}
        title="Corte del Turno"
      >
        {corte && (
          <div className="corte-dia">
            <div className="corte-dia-header">
              <span className="corte-dia-emojis">🏦</span>
              <h2>Resumen del Turno</h2>
              <p className="corte-dia-meta">
                {formatDate(corte.openedAt)} · {corte.startLabel} — {corte.endLabel}
              </p>
            </div>

            <div className="corte-dia-stats">
              <div className="corte-stat">
                <span className="corte-stat-value">
                  {formatMoney(corte.total)}
                </span>
                <span className="corte-stat-label">Total del Turno</span>
              </div>
              <div className="corte-stat">
                <span className="corte-stat-value">{corte.totalOrders}</span>
                <span className="corte-stat-label">Órdenes</span>
              </div>
              <div className="corte-stat">
                <span className="corte-stat-value">
                  {formatMoney(corte.totalTips)}
                </span>
                <span className="corte-stat-label">Propinas</span>
              </div>
            </div>

            <h3 className="corte-dia-section-title">Desglose por método de pago</h3>
            <div className="corte-dia-methods">
              {Object.entries(corte.byMethod).map(([method, amount]) => (
                <div key={method} className="corte-method-row">
                  <span className="corte-method-name">
                    {METHOD_ICONS[method] || method}
                  </span>
                  <span className="corte-method-count">
                    {corte.byMethodCount[method]} venta(s)
                  </span>
                  <span className="corte-method-amount">{formatMoney(amount)}</span>
                </div>
              ))}
            </div>

            <div className="corte-dia-total">
              <span>Total recaudado</span>
              <strong>{formatMoney(corte.total)}</strong>
            </div>

            <div className="modal-form-actions">
              <button className="btn btn-outline" onClick={() => setShowCorte(false)}>
                Cerrar
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                🖨️ Imprimir Corte
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
