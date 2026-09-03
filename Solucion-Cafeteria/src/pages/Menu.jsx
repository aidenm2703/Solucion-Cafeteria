import { useState } from 'react';
import { storage } from '../utils/storage';
import { SUGGESTED_PRODUCTS } from '../data/businessData';
import Modal from '../components/Modal';
import { formatBs, formatUsd, usdToBs } from '../utils/currency';

const EMPTY_ITEM = {
  name: '',
  category: '',
  price: '',
  description: '',
};

export default function Menu() {
  const [menu, setMenu] = useState(storage.getMenu());
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_ITEM });
  const [filter, setFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newCategory, setNewCategory] = useState('');

  const business = storage.getBusiness();
  const categories = [...new Set(menu.map((i) => i.category))];

  const filteredMenu = menu.filter((item) => {
    if (!filter) return true;
    return item.category === filter;
  });

  const openCreate = () => {
    setEditingItem(null);
    setForm({ ...EMPTY_ITEM });
    setNewCategory('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description,
    });
    setNewCategory('');
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    const category =
      form.category === '__new__' ? (newCategory.trim() || 'General') : form.category;

    if (editingItem) {
      const updated = storage.updateMenuItem(editingItem.id, {
        name: form.name,
        category,
        price: parseFloat(form.price),
        description: form.description,
      });
      setMenu((prev) => prev.map((i) => (i.id === editingItem.id ? updated : i)));
    } else {
      const newItem = storage.addMenuItem({
        name: form.name,
        category,
        price: parseFloat(form.price),
        description: form.description,
      });
      setMenu((prev) => [...prev, newItem]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    storage.deleteMenuItem(id);
    setMenu((prev) => prev.filter((i) => i.id !== id));
    setDeleteConfirm(null);
  };

  const handleLoadSuggested = () => {
    if (!business?.type) return;
    const suggested = SUGGESTED_PRODUCTS[business.type] || [];
    const existingNames = new Set(menu.map((i) => i.name.toLowerCase()));
    const newItems = suggested
      .filter((p) => !existingNames.has(p.name.toLowerCase()))
      .map((p, i) => ({
        ...p,
        id: `suggested_${i}_${Date.now()}`,
      }));
    if (newItems.length > 0) {
      const updated = [...menu, ...newItems];
      storage.setMenu(updated);
      setMenu(updated);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Gestión de Menú</h1>
          <p className="page-subtitle">
            {menu.length} productos · {categories.length} categorías
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline" onClick={handleLoadSuggested}>
            ✨ Cargar Sugeridos
          </button>
          <button className="btn btn-primary" onClick={openCreate}>
            ➕ Nuevo Producto
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-chip ${filter === '' ? 'active' : ''}`}
          onClick={() => setFilter('')}
        >
          Todos ({menu.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-chip ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {filteredMenu.map((item) => (
          <div key={item.id} className="menu-card">
            <div className="menu-card-header">
              <span className="menu-card-category">{item.category}</span>
              <div className="menu-card-price">
                {formatUsd(item.price)}
                <span className="menu-price-bs">{formatBs(usdToBs(item.price))}</span>
              </div>
            </div>
            <h3 className="menu-card-name">{item.name}</h3>
            <p className="menu-card-desc">{item.description}</p>
            <div className="menu-card-actions">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => openEdit(item)}
              >
                ✏️ Editar
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => setDeleteConfirm(item.id)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMenu.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No hay productos</h3>
          <p>Agrega productos manualmente o carga los sugeridos para tu tipo de negocio.</p>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label>Nombre del producto *</label>
            <input
              type="text"
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Cappuccino"
              required
            />
          </div>
          <div className="form-group">
            <label>Categoría</label>
            <select
              className="form-input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Seleccionar categoría...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="__new__">➕ Nueva categoría...</option>
            </select>
            {form.category === '__new__' && (
              <input
                type="text"
                className="form-input"
                style={{ marginTop: 8 }}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nombre de la nueva categoría"
                autoFocus
              />
            )}
          </div>
          <div className="form-group">
            <label>Precio (USD $) *</label>
            <input
              type="number"
              step="50"
              min="0"
              className="form-input"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0"
              required
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              className="form-input form-textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe el producto..."
              rows={3}
            />
          </div>
          <div className="modal-form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingItem ? 'Guardar Cambios' : 'Agregar Producto'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirmar Eliminación"
      >
        <p>¿Estás seguro de eliminar este producto?</p>
        <div className="modal-form-actions" style={{ marginTop: 16 }}>
          <button
            className="btn btn-outline"
            onClick={() => setDeleteConfirm(null)}
          >
            Cancelar
          </button>
          <button
            className="btn btn-danger"
            onClick={() => handleDelete(deleteConfirm)}
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}
