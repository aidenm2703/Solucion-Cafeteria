import { useState } from 'react';
import { storage } from '../utils/storage';
import Modal from '../Components/Modal';
import { useToast } from '../Components/useToast';
import { PRIVILEGES, ROLES, getRoleById } from '../data/roles';

const EMPTY_FORM = {
  name: '',
  username: '',
  password: '',
  role: 'cajero',
  privileges: [],
};

export default function Users() {
  const { showToast, confirm } = useToast();
  const currentUser = storage.getCurrentUser();
  const [users, setUsers] = useState(storage.getUsers());
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState('');

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, privileges: [...getRoleById('cajero').privileges] });
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      name: user.name || '',
      username: user.username,
      password: '',
      role: user.role,
      privileges: [...(user.privileges || [])],
    });
    setFormError('');
    setShowModal(true);
  };

  const handleRoleChange = (roleId) => {
    const role = getRoleById(roleId);
    setForm((prev) => ({
      ...prev,
      role: roleId,
      privileges: [...role.privileges],
    }));
  };

  const togglePrivilege = (id) => {
    setForm((prev) => {
      const has = prev.privileges.includes(id);
      return {
        ...prev,
        privileges: has
          ? prev.privileges.filter((p) => p !== id)
          : [...prev.privileges, id],
      };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim() || !form.username.trim()) {
      setFormError('El nombre y el usuario son obligatorios.');
      return;
    }
    if (form.password && form.password.length < 4) {
      setFormError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (!editing && form.password.length < 4) {
      setFormError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    const usernameTaken = users.some(
      (u) =>
        u.username.toLowerCase() === form.username.trim().toLowerCase() &&
        u.id !== editing?.id
    );
    if (usernameTaken) {
      setFormError('Ese nombre de usuario ya está en uso.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      username: form.username.trim(),
      role: form.role,
      privileges:
        form.role === 'admin' ? getRoleById('admin').privileges : form.privileges,
    };
    if (form.password) payload.password = form.password;

    if (editing) {
      const updated = storage.updateUser(editing.id, payload);
      setUsers((prev) => prev.map((u) => (u.id === editing.id ? updated : u)));
      showToast({
        type: 'success',
        title: 'Empleado actualizado',
        message: `Los datos de ${payload.name} fueron guardados.`,
      });
    } else {
      const created = storage.addUser(payload);
      setUsers((prev) => [...prev, created]);
      showToast({
        type: 'success',
        title: 'Empleado creado',
        message: `Se creó el usuario de ${payload.name}. Ya puede iniciar sesión.`,
      });
    }
    setShowModal(false);
  };

  const handleDelete = async (user) => {
    if (user.id === 'admin') {
      showToast({
        type: 'error',
        title: 'No se puede eliminar',
        message: 'La cuenta principal del administrador no puede eliminarse.',
      });
      return;
    }
    if (currentUser && user.id === currentUser.id) {
      showToast({
        type: 'error',
        title: 'No se puede eliminar',
        message: 'No puedes eliminar tu propia cuenta.',
      });
      return;
    }
    const ok = await confirm({
      title: 'Eliminar empleado',
      message: `¿Seguro que deseas eliminar a ${user.name} (${user.username})? Ya no podrá iniciar sesión.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      danger: true,
    });
    if (!ok) return;
    storage.deleteUser(user.id);
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    showToast({
      type: 'success',
      title: 'Empleado eliminado',
      message: `${user.name} fue eliminado del sistema.`,
    });
  };

  const sections = PRIVILEGES.map((p) => p.section).filter(
    (v, i, a) => a.indexOf(v) === i
  );
  const bySection = (s) => PRIVILEGES.filter((p) => p.section === s);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Empleados y Usuarios</h1>
          <p className="page-subtitle">
            Crea usuarios con usuario y contraseña, y define qué puede ver y hacer cada uno
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            ➕ Nuevo Empleado
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>Aún no hay empleados</h3>
          <p>Agrega tu primer empleado para comenzar.</p>
        </div>
      ) : (
        <div className="users-grid">
          {users.map((user) => {
            const role = getRoleById(user.role);
            const isSelf = currentUser && user.id === currentUser.id;
            return (
              <div key={user.id} className={`user-card ${isSelf ? 'self' : ''}`}>
                <div className="user-card-top">
                  <div className="user-avatar" style={{ backgroundColor: role.color || '#1B4332' }}>
                    {role.icon}
                  </div>
                  <div className="user-card-info">
                    <h3>
                      {user.name || user.username}{' '}
                      {isSelf && <span className="user-badge-self">Tú</span>}
                    </h3>
                    <span className="user-card-username">👤 {user.username}</span>
                  </div>
                </div>
                <span
                  className="user-role-badge"
                  style={{ backgroundColor: `${role.color}22`, color: role.color }}
                >
                  {role.icon} {role.label}
                </span>
                <div className="user-card-privileges">
                  {user.role === 'admin' ? (
                    <span className="user-priv-all">Acceso total del sistema</span>
                  ) : (
                    (user.privileges || [])
                      .map((id) => PRIVILEGES.find((p) => p.id === id))
                      .filter(Boolean)
                      .map((p) => (
                        <span key={p.id} className="user-priv-chip">
                          {p.icon} {p.label}
                        </span>
                      ))
                  )}
                </div>
                <div className="user-card-actions">
                  <button className="btn btn-sm btn-outline" onClick={() => openEdit(user)}>
                    ✏️ Editar
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user)}>
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? '✏️ Editar Empleado' : '➕ Nuevo Empleado'}
      >
        <form onSubmit={handleSave} className="modal-form users-modal-form">
          <div className="form-group">
            <label>Nombre del empleado *</label>
            <input
              type="text"
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: María González"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Usuario *</label>
              <input
                type="text"
                className="form-input"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Ej: maria.g"
                required
              />
            </div>
            <div className="form-group">
              <label>{editing ? 'Nueva contraseña (opcional)' : 'Contraseña *'}</label>
              <input
                type="password"
                className="form-input"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editing ? 'Dejar vacío = no cambiar' : 'Mínimo 4 caracteres'}
                required={!editing}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Categoría del empleado</label>
            <select
              className="form-input"
              value={form.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              disabled={editing?.id === 'admin'}
            >
              {ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.icon} {role.label} — {role.description}
                </option>
              ))}
            </select>
          </div>

          {form.role !== 'admin' && (
            <div className="form-group">
              <label className="users-priv-label">
                Privilegios — qué puede ver y hacer
              </label>
              {sections.map((section) => (
                <div key={section} className="users-priv-section">
                  <span className="users-priv-section-title">{section}</span>
                  {bySection(section).map((p) => (
                    <label key={p.id} className="users-priv-option">
                      <input
                        type="checkbox"
                        checked={form.privileges.includes(p.id)}
                        onChange={() => togglePrivilege(p.id)}
                      />
                      <span>
                        {p.icon} {p.label}
                      </span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          )}

          {formError && <div className="setup-error">{formError}</div>}

          <div className="modal-form-actions">
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editing ? 'Guardar Cambios' : 'Crear Empleado'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}