import { NavLink, useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { useToast } from './useToast';
import { getRoleById } from '../data/roles';
import logoGaia from '../Img/logoGaia.jpeg';
import BusinessIcon from './BusinessIcon';
import TurnManager from './TurnManager';

const NAV_ITEMS = [
  { to: '/', icon: '🏠', label: 'Inicio', privilege: 'dashboard' },
  { to: '/dashboard', icon: '📊', label: 'Dashboard', privilege: 'dashboard' },
  { to: '/sales', icon: '💰', label: 'Punto de Venta', privilege: 'sales' },
  { to: '/orders', icon: '🧾', label: 'Órdenes del Día', privilege: 'orders' },
  { to: '/menu', icon: '📋', label: 'Menú', privilege: 'menu' },
  { to: '/reservations', icon: '📅', label: 'Reservaciones', privilege: 'reservations' },
  { to: '/whatsapp', icon: '💬', label: 'WhatsApp', privilege: 'whatsapp' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { confirm } = useToast();
  const business = storage.getBusiness();
  const currentUser = storage.getCurrentUser();
  const canManageUsers = storage.hasPrivilege('manageUsers');
  const canManageTurn = storage.hasPrivilege('manageTurn');

  const allowedNav = NAV_ITEMS.filter(
    (item) => storage.hasPrivilege(item.privilege)
  );

  const visibleNav = canManageUsers
    ? [
        ...allowedNav,
        { to: '/users', icon: '👥', label: 'Empleados', privilege: 'manageUsers' },
      ]
    : allowedNav;

  const handleReset = async () => {
    const ok = await confirm({
      title: 'Reiniciar sistema',
      message: '¿Estás seguro? Esto borrará TODOS los datos del negocio.',
      confirmText: 'Sí, borrar todo',
      cancelText: 'Cancelar',
      danger: true,
    });
    if (!ok) return;
    storage.resetToFactory();
    navigate('/');
    window.location.reload();
  };

  const handleLogout = () => {
    storage.setLoggedIn(false);
    storage.setCurrentUser(null);
    navigate('/login');
  };

  const role = currentUser ? getRoleById(currentUser.role) : null;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={logoGaia} alt="Gaia Dynamics" className="logo-img" />
          <span className="logo-text">Gaia Dynamics</span>
        </div>
        {business && (
          <div className="sidebar-business">
            <span className="business-icon">
              <BusinessIcon type={business.type || business.icon} />
            </span>
            <span className="business-name">{business.name}</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {visibleNav.map((item) => (
          <NavLink
            key={`${item.to}-${item.label}`}
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

      {canManageTurn && (
        <div className="sidebar-turn">
          <TurnManager />
        </div>
      )}

      <div className="sidebar-footer">
        {currentUser && (
          <div className="sidebar-user">
            <span className="sidebar-user-avatar">
              {role ? role.icon : '👤'}
            </span>
            <div className="sidebar-user-info">
              <strong>{currentUser.name || currentUser.username}</strong>
              <span>{role ? role.label : 'Usuario'}</span>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="sidebar-logout">
          🚪 Cerrar Sesión
        </button>
        {canManageUsers && (
          <button onClick={handleReset} className="sidebar-reset">
            🗑️ Reiniciar Sistema
          </button>
        )}
        <div className="sidebar-version">v1.0.0</div>
      </div>
    </aside>
  );
}
