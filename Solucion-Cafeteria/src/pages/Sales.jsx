import { useState } from 'react';
import { storage } from '../utils/storage';
import Modal from '../components/Modal';

export default function Sales() {
  const [menu] = useState(storage.getMenu());
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const categories = [...new Set(menu.map((i) => i.category))];

  const filteredMenu = menu.filter((item) => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || item.category === filterCat;
    return matchSearch && matchCat;
  });

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map((c) =>
          c.id === id ? { ...c, quantity: c.quantity - 1 } : c
        );
      }
      return prev.filter((c) => c.id !== id);
    });
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tip = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + tip;

  const getCartQuantity = (id) => {
    const item = cart.find((c) => c.id === id);
    return item ? item.quantity : 0;
  };

  const handlePayment = () => {
    const order = {
      items: cart.map((c) => ({
        id: c.id,
        name: c.name,
        price: c.price,
        category: c.category,
        quantity: c.quantity,
      })),
      subtotal,
      tip,
      total,
      paymentMethod,
      status: 'completada',
    };
    const saved = storage.addOrder(order);
    setLastOrder(saved);
    setCart([]);
    setShowPayment(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Punto de Venta</h1>
          <p className="page-subtitle">Selecciona productos para crear una orden</p>
        </div>
      </div>

      <div className="pos-layout">
        <div className="pos-products">
          <div className="pos-search">
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-bar">
            <button
              className={`filter-chip ${filterCat === '' ? 'active' : ''}`}
              onClick={() => setFilterCat('')}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-chip ${filterCat === cat ? 'active' : ''}`}
                onClick={() => setFilterCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="pos-products-grid">
            {filteredMenu.map((item) => {
              const qty = getCartQuantity(item.id);
              return (
                <div
                  key={item.id}
                  className={`pos-product-card ${qty > 0 ? 'in-cart' : ''}`}
                  onClick={() => addToCart(item)}
                >
                  {qty > 0 && <span className="pos-product-qty">{qty}</span>}
                  <span className="pos-product-name">{item.name}</span>
                  <span className="pos-product-price">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pos-cart">
          <div className="pos-cart-header">
            <h3>🛒 Orden Actual</h3>
            {cart.length > 0 && (
              <button className="btn btn-sm btn-outline" onClick={clearCart}>
                Limpiar
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="pos-cart-empty">
              <span>🛒</span>
              <p>Agrega productos tocando las tarjetas</p>
            </div>
          ) : (
            <>
              <div className="pos-cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="pos-cart-item">
                    <div className="pos-cart-item-info">
                      <span className="pos-cart-item-name">{item.name}</span>
                      <span className="pos-cart-item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="pos-cart-item-controls">
                      <button
                        className="qty-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCart(item.id);
                        }}
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pos-cart-summary">
                <div className="pos-cart-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="pos-cart-row tip">
                  <span>Propina (10%)</span>
                  <span>${tip.toFixed(2)}</span>
                </div>
                <div className="pos-cart-row total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-block"
                onClick={() => setShowPayment(true)}
              >
                💳 Proceder al Pago
              </button>
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        title="Seleccionar Método de Pago"
      >
        <div className="payment-methods">
          {[
            { id: 'efectivo', icon: '💵', label: 'Efectivo' },
            { id: 'tarjeta', icon: '💳', label: 'Tarjeta' },
            { id: 'transferencia', icon: '📱', label: 'Transferencia' },
            { id: 'qr', icon: '📷', label: 'Código QR' },
          ].map((m) => (
            <button
              key={m.id}
              className={`payment-method ${paymentMethod === m.id ? 'active' : ''}`}
              onClick={() => setPaymentMethod(m.id)}
            >
              <span className="payment-method-icon">{m.icon}</span>
              <span className="payment-method-label">{m.label}</span>
            </button>
          ))}
        </div>
        <div className="pos-cart-summary" style={{ marginTop: 16 }}>
          <div className="pos-cart-row total">
            <span>Total a pagar</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <div className="modal-form-actions" style={{ marginTop: 16 }}>
          <button
            className="btn btn-outline"
            onClick={() => setShowPayment(false)}
          >
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handlePayment}>
            ✅ Confirmar Pago
          </button>
        </div>
      </Modal>

      {showSuccess && (
        <div className="toast success">
          <span>✅</span> Venta registrada exitosamente — ${lastOrder?.total?.toFixed(2)}
        </div>
      )}
    </div>
  );
}
