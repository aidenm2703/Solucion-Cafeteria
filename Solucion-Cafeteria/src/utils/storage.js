const PREFIX = 'gaiaDynamics_';
const LEGACY_PREFIX = 'businessOS_';

export const DEFAULT_EXCHANGE_RATE = 36.5;

function isValidRate(rate) {
  return typeof rate === 'number' && Number.isFinite(rate) && rate > 0;
}

export const storage = {
  get(key, defaultValue = null) {
    try {
      let value = localStorage.getItem(PREFIX + key);
      // Migración automática de datos guardados con el prefijo legacy (BusinessOS)
      if (value === null) {
        const legacy = localStorage.getItem(LEGACY_PREFIX + key);
        if (legacy !== null) {
          localStorage.setItem(PREFIX + key, legacy);
          localStorage.removeItem(LEGACY_PREFIX + key);
          value = legacy;
        }
      }
      return value != null ? JSON.parse(value) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },

  getBusiness() {
    return this.get('business', null);
  },

  setBusiness(business) {
    return this.set('business', business);
  },

  getMenu() {
    return this.get('menu', []);
  },

  setMenu(menu) {
    return this.set('menu', menu);
  },

  addMenuItem(item) {
    const menu = this.getMenu();
    const newItem = { ...item, id: Date.now().toString() };
    menu.push(newItem);
    this.setMenu(menu);
    return newItem;
  },

  updateMenuItem(id, updates) {
    const menu = this.getMenu();
    const index = menu.findIndex((item) => item.id === id);
    if (index !== -1) {
      menu[index] = { ...menu[index], ...updates };
      this.setMenu(menu);
      return menu[index];
    }
    return null;
  },

  deleteMenuItem(id) {
    const menu = this.getMenu().filter((item) => item.id !== id);
    this.setMenu(menu);
  },

  getOrders() {
    return this.get('orders', []);
  },

  addOrder(order) {
    const orders = this.getOrders();
    const newOrder = {
      ...order,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    orders.push(newOrder);
    this.set('orders', orders);
    return newOrder;
  },

  getReservations() {
    return this.get('reservations', []);
  },

  setReservations(reservations) {
    return this.set('reservations', reservations);
  },

  addReservation(reservation) {
    const reservations = this.getReservations();
    const newRes = {
      ...reservation,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    reservations.push(newRes);
    this.setReservations(reservations);
    return newRes;
  },

  updateReservation(id, updates) {
    const reservations = this.getReservations();
    const index = reservations.findIndex((r) => r.id === id);
    if (index !== -1) {
      reservations[index] = { ...reservations[index], ...updates };
      this.setReservations(reservations);
      return reservations[index];
    }
    return null;
  },

  cancelReservation(id) {
    return this.updateReservation(id, { status: 'cancelada' });
  },

  /** Tipo de cambio configurable: 1 USD → Bs */
  getExchangeRate() {
    const rate = this.get('exchangeRate', DEFAULT_EXCHANGE_RATE);
    return isValidRate(rate) ? rate : DEFAULT_EXCHANGE_RATE;
  },

  setExchangeRate(rate) {
    const parsed = typeof rate === 'string' ? parseFloat(rate) : rate;
    if (!isValidRate(parsed)) return false;
    return this.set('exchangeRate', parsed);
  },

  getAuth() {
    return this.get('auth', null);
  },

  setAuth(auth) {
    return this.set('auth', auth);
  },

  setLoggedIn(loggedIn) {
    return this.set('loggedIn', loggedIn);
  },

  isLoggedIn() {
    return this.get('loggedIn', false);
  },

  getTurn() {
    return this.get('turn', null);
  },

  setTurn(turn) {
    return this.set('turn', turn);
  },

  openTurn() {
    const turn = {
      id: Date.now().toString(),
      openedAt: new Date().toISOString(),
    };
    this.setTurn(turn);
    return turn;
  },

  closeTurn() {
    const turn = this.getTurn();
    if (!turn) return null;
    const closed = { ...turn, closedAt: new Date().toISOString() };
    this.setTurn(closed);
    const history = this.get('turnHistory', []);
    history.push(closed);
    this.set('turnHistory', history);
    this.setTurn(null);
    return closed;
  },

  getTurnHistory() {
    return this.get('turnHistory', []);
  },
};
