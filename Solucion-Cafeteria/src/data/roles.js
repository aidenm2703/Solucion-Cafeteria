/* ============================================
   Gaia Dynamics | Roles y Privilegios
   Define qué puede ver y hacer cada usuario
   dentro del sistema.
   ============================================ */

export const PRIVILEGES = [
  // ── Páginas visibles ──────────────────────
  { id: 'dashboard', label: 'Ver Dashboard y estadísticas', icon: '📊', section: 'Páginas' },
  { id: 'sales', label: 'Realizar ventas (Punto de Venta)', icon: '💰', section: 'Páginas' },
  { id: 'orders', label: 'Ver Órdenes del Día', icon: '🧾', section: 'Páginas' },
  { id: 'menu', label: 'Ver Menú', icon: '📋', section: 'Páginas' },
  { id: 'reservations', label: 'Ver Reservaciones', icon: '📅', section: 'Páginas' },
  { id: 'whatsapp', label: 'Ver WhatsApp / Chatbot', icon: '💬', section: 'Páginas' },
  // ── Acciones permitidas ───────────────────
  { id: 'editMenu', label: 'Editar menú (crear, modificar o eliminar productos)', icon: '✏️', section: 'Acciones' },
  { id: 'manageTurn', label: 'Abrir y cerrar Turno', icon: '🔐', section: 'Acciones' },
  { id: 'manageUsers', label: 'Gestionar Empleados y Usuarios', icon: '👥', section: 'Acciones' },
  { id: 'manageSettings', label: 'Cambiar tipo de cambio y configuración', icon: '⚙️', section: 'Acciones' },
];

export const ALL_PRIVILEGE_IDS = PRIVILEGES.map((p) => p.id);

export const ROLES = [
  {
    id: 'admin',
    label: 'Administrador',
    icon: '👑',
    color: '#1B4332',
    description: 'Acceso total al sistema y a la gestión de empleados.',
    privileges: [...ALL_PRIVILEGE_IDS],
  },
  {
    id: 'cajero',
    label: 'Cajero',
    icon: '💰',
    color: '#00B4D8',
    description: 'Vende, consulta el dashboard, ve las órdenes y gestiona el turno.',
    privileges: ['dashboard', 'sales', 'orders', 'manageTurn'],
  },
  {
    id: 'mesero',
    label: 'Mesero',
    icon: '🍽️',
    color: '#E07A5F',
    description: 'Gestiona reservaciones, órdenes y el chat de clientes.',
    privileges: ['dashboard', 'orders', 'reservations', 'whatsapp'],
  },
  {
    id: 'cocina',
    label: 'Cocina',
    icon: '👨‍🍳',
    color: '#E9C46A',
    description: 'Ve las órdenes y el menú para preparar los pedidos.',
    privileges: ['orders', 'menu'],
  },
  {
    id: 'soloLectura',
    label: 'Solo Lectura',
    icon: '👀',
    color: '#6C757D',
    description: 'Puede ver las páginas pero no modificar nada.',
    privileges: ['dashboard', 'menu', 'orders', 'reservations', 'whatsapp'],
  },
];

export function getRoleById(id) {
  return ROLES.find((r) => r.id === id) || ROLES[0];
}