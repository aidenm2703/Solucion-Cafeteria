import { useCallback, useRef, useState } from 'react';
import { ToastContext } from './toastContext';
import { playSound } from '../utils/sound';

/* ============================================
   Gaia Dynamics | Sistema de Notificaciones
   Toasts animados con sonido + diálogo de
   confirmación (reemplaza alert / confirm).
   ============================================ */

const TYPE_DEFS = {
  success: { icon: '✅', label: 'Éxito' },
  error: { icon: '❌', label: 'Error' },
  warning: { icon: '⚠️', label: 'Atención' },
  info: { icon: 'ℹ️', label: 'Aviso' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = 'info', title = '', message = '', duration = 4000 } = {}) => {
      const id = ++idRef.current;
      playSound(type);
      setToasts((prev) => [...prev, { id, type, title, message }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  const confirm = useCallback(
    ({
      title = '¿Estás seguro?',
      message = '',
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      danger = false,
    } = {}) => {
      playSound('confirm');
      return new Promise((resolve) => {
        resolveRef.current = resolve;
        setDialog({ title, message, confirmText, cancelText, danger });
      });
    },
    []
  );

  const closeDialog = (result) => {
    setDialog(null);
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, confirm }}>
      {children}

      {/* Toasts */}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => {
          const def = TYPE_DEFS[t.type] || TYPE_DEFS.info;
          return (
            <div key={t.id} className={`toast-card ${t.type}`}>
              <div className="toast-card-icon">{def.icon}</div>
              <div className="toast-card-body">
                <span className="toast-card-label">{def.label}</span>
                {t.title && <strong className="toast-card-title">{t.title}</strong>}
                {t.message && <span className="toast-card-message">{t.message}</span>}
              </div>
              <button className="toast-card-close" onClick={() => dismiss(t.id)}>
                ✕
              </button>
              <span className="toast-card-progress" />
            </div>
          );
        })}
      </div>

      {/* Diálogo de confirmación */}
      {dialog && (
        <div className="confirm-overlay" onClick={() => closeDialog(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className={`confirm-dialog-icon ${dialog.danger ? 'danger' : ''}`}>
              {dialog.danger ? '⚠️' : '❓'}
            </div>
            <h3>{dialog.title}</h3>
            {dialog.message && <p>{dialog.message}</p>}
            <div className="confirm-dialog-actions">
              <button className="btn btn-outline" onClick={() => closeDialog(false)}>
                {dialog.cancelText}
              </button>
              <button
                className={`btn ${dialog.danger ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => closeDialog(true)}
                autoFocus
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}