const PREFIX = 'businessOS_';

export const storage = {
  get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(PREFIX + key);
      return value ? JSON.parse(value) : defaultValue;
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
};
