import { useState, useMemo } from 'react';
import { storage } from '../utils/storage';

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

const METHOD_LABELS = {
  efectivo: '💵 Efectivo',
  tarjeta: '💳 Tarjeta',
  transferencia: '📱 Transferencia',
  qr: '📷 QR',
};

export default function Orders() {
  const orders = storage.getOrders();
  const today = getTodayString();

  const [selectedDate, setSelectedDate] = useState(today);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => o.date && o.date.startsWith(selectedDate))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [orders, selectedDate]);

  const dayTotal = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const dayTips = filteredOrders.reduce((sum, o) => sum + (o.tip || 0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Órdenes del Día</h1>
          <p className="page-subtitle">Historial de ventas y propinas</p>
        </div>
        <div className="page-actions">
          <input
            type="date"
            className="form-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ borderLeftColor: '#6C63FF' }}>
          <div className="stat-card-icon">🧾</div>
          <div className="stat-card-info">
            <span className="stat-card-value">{filteredOrders.length}</span>
            <span className="stat-card-label">Órdenes Totales</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#00C9A7' }}>
          <div className="stat-card-icon">💵</div>
          <div className="stat-card-info">
            <span className="stat-card-value">${dayTotal.toFixed(2)}</span>
            <span className="stat-card-label">Total del Día</span>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#FFB800' }}>
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-info">
            <span className="stat-card-value">${dayTips.toFixed(2)}</span>
            <span className="stat-card-label">Propinas (10%)</span>
            <span className="stat-card-sub">Para el personal</span>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧾</div>
          <h3>No hay órdenes este día</h3>
          <p>Las ventas realizadas aparecerán aquí.</p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-id">#{order.id.slice(-6)}</span>
                  <span className="order-time">
                    {new Date(order.date).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <span className={`order-status ${order.status}`}>
                  {order.status === 'completada' ? '✅ Completada' : order.status}
                </span>
              </div>
              <div className="order-items">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="order-item-row">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="order-card-footer">
                <span className="order-payment">
                  {METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                </span>
                <div className="order-totals">
                  <span>
                    Sub: ${order.subtotal?.toFixed(2)} · Propina: $
                    {order.tip?.toFixed(2)}
                  </span>
                  <strong>Total: ${order.total?.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
