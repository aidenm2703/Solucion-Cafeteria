import { NavLink, useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import logoGaia from '../Img/logoGaia.jpeg';

const NAV_ITEMS = [
  { to: '/', icon: '🏠', label: 'Inicio' },
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/menu', icon: '📋', label: 'Menú' },
  { to: '/sales', icon: '💰', label: 'Punto de Venta' },
  { to: '/orders', icon: '🧾', label: 'Órdenes del Día' },
  { to: '/reservations', icon: '📅', label: 'Reservaciones' },
  { to: '/whatsapp', icon: '💬', label: 'WhatsApp' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const business = storage.getBusiness();

  const handleReset = () => {
    if (confirm('¿Estás seguro? Esto borrará todos los datos del negocio.')) {
      localStorage.clear();
      navigate('/');
      window.location.reload();
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={logoGaia} alt="Gaia Dynamics" className="logo-img" />
          <span className="logo-text">Gaia Dynamics</span>
        </div>
        {business && (
          <div className="sidebar-business">
            <span className="business-icon">{business.icon}</span>
            <span className="business-name">{business.name}</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleReset} className="sidebar-reset">
          🗑️ Reiniciar Sistema
        </button>
        <div className="sidebar-version">v1.0.0</div>
      </div>
    </aside>
  );
}
