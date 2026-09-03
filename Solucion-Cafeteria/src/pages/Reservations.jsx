import { useState, useMemo } from 'react';
import { storage } from '../utils/storage';
import Modal from '../components/Modal';

const HOURS = Array.from({ length: 16 }, (_, i) => `${(i + 6).toString().padStart(2, '0')}:00`);
const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getWeekDates(baseDate) {
  const d = parseLocalDate(baseDate);
  const dayOfWeek = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const nd = new Date(monday);
    nd.setDate(monday.getDate() + i);
    dates.push(nd);
  }
  return dates;
}

function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const EMPTY_RES = { name: '', phone: '', guests: '1', date: '', hour: '12:00', notes: '' };

function CallSimulation({ res, onClose }) {
  const [phase, setPhase] = useState('ringing');
  const [messageIndex, setMessageIndex] = useState(0);

  const lines = [
    { who: 'client', text: '¿Aló? ¡Hola!' },
    { who: 'staff', text: `Hola ${res.name}, hablamos por su reservación de ${res.guests} personas para el ${res.date} a las ${res.hour}.` },
    { who: 'client', text: '¡Sí! Gracias por confirmar, la esperamos.' },
    { who: 'staff', text: 'Perfecto, queda confirmada. ¡Nos vemos pronto!' },
  ];

  const answerCall = () => {
    setPhase('connected');
    setMessageIndex(0);
  };

  const hangUp = () => {
    setPhase('ended');
    setTimeout(onClose, 1200);
  };

  return (
    <div className="call-overlay">
      <div className={`call-card phase-${phase}`}>
        <div className="call-avatar">
          {phase === 'ringing' ? '📞' : '🗣️'}
        </div>
        <div className="call-name">{res.name}</div>
        <div className="call-phone">{res.phone || 'Sin teléfono'}</div>

        {phase === 'ringing' && (
          <>
            <div className="call-status">Llamando...</div>
            <div className="call-actions">
              <button className="call-btn answer" onClick={answerCall}>
                ✅ Contestar
              </button>
              <button className="call-btn hangup" onClick={hangUp}>
                ❌ Colgar
              </button>
            </div>
          </>
        )}

        {phase === 'connected' && (
          <>
            <div className="call-status">En llamada...</div>
            <div className="call-chat">
              {lines.slice(0, messageIndex + 1).map((m, i) => (
                <div key={i} className={`call-msg ${m.who}`}>
                  {m.text}
                </div>
              ))}
            </div>
            {messageIndex < lines.length - 1 ? (
              <button
                className="call-btn next"
                onClick={() => setMessageIndex((i) => i + 1)}
              >
                ▶ Siguiente
              </button>
            ) : (
              <button
                className="call-btn next"
                onClick={() =>
                  setMessageIndex((i) => (i + 1) % (lines.length + 1))
                }
                style={{ opacity: 0.7 }}
              >
                🔁 Repetir conversación
              </button>
            )}
            <div className="call-actions">
              <button className="call-btn hangup" onClick={hangUp}>
                📵 Colgar
              </button>
            </div>
          </>
        )}

        {phase === 'ended' && (
          <div className="call-status">Llamada finalizada</div>
        )}
      </div>
    </div>
  );
}

export default function Reservations() {
  const [reservations, setReservations] = useState(storage.getReservations());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const dow = d.getDay();
    d.setDate(d.getDate() - ((dow + 6) % 7));
    return formatDate(d);
  });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_RES });
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('calendar');
  const [showShareLink, setShowShareLink] = useState(false);
  const [call, setCall] = useState(null);

  const weekDates = useMemo(() => getWeekDates(currentWeekStart), [currentWeekStart]);

  const reservationsBySlot = useMemo(() => {
    const map = {};
    reservations.forEach((r) => {
      if (r.status === 'cancelada') return;
      const key = `${r.date}_${r.hour}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [reservations]);

  const goToPreviousWeek = () => {
    const d = parseLocalDate(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(formatDate(d));
  };

  const goToNextWeek = () => {
    const d = parseLocalDate(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(formatDate(d));
  };

  const goToToday = () => {
    const d = new Date();
    const dow = d.getDay();
    d.setDate(d.getDate() - ((dow + 6) % 7));
    setCurrentWeekStart(formatDate(d));
  };

  const openNewReservation = (date, hour) => {
    setEditingId(null);
    setForm({ ...EMPTY_RES, date: date || '', hour: hour || '12:00' });
    setShowModal(true);
  };

  const openEditReservation = (res) => {
    setEditingId(res.id);
    setForm({
      name: res.name,
      phone: res.phone,
      guests: res.guests?.toString() || '1',
      date: res.date,
      hour: res.hour,
      notes: res.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.date || !form.hour) return;

    if (editingId) {
      const updated = storage.updateReservation(editingId, {
        name: form.name,
        phone: form.phone,
        guests: parseInt(form.guests),
        date: form.date,
        hour: form.hour,
        notes: form.notes,
      });
      setReservations((prev) =>
        prev.map((r) => (r.id === editingId ? updated : r))
      );
    } else {
      const newRes = storage.addReservation({
        name: form.name,
        phone: form.phone,
        guests: parseInt(form.guests),
        date: form.date,
        hour: form.hour,
        notes: form.notes,
        status: 'confirmada',
      });
      setReservations((prev) => [...prev, newRes]);
    }
    setShowModal(false);
  };

  const handleCancel = (id) => {
    if (confirm('¿Cancelar esta reservación?')) {
      storage.cancelReservation(id);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'cancelada' } : r))
      );
    }
  };

  const handleReschedule = (res) => {
    openEditReservation(res);
  };

  const SHARE_URL = `${window.location.origin}${window.location.pathname}#/reservations?share=true`;

  const totalGuestsWeek = reservations
    .filter(
      (r) =>
        r.status !== 'cancelada' &&
        weekDates.some((d) => formatDate(d) === r.date)
    )
    .reduce((sum, r) => sum + (r.guests || 1), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Agenda de Reservaciones</h1>
          <p className="page-subtitle">
            {reservations.filter((r) => r.status !== 'cancelada').length} activas
            · {totalGuestsWeek} comensales esta semana
          </p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-outline"
            onClick={() => setShowShareLink(true)}
          >
            🔗 Link de Reservación
          </button>
          <button
            className="btn btn-primary"
            onClick={() => openNewReservation(formatDate(new Date()), '12:00')}
          >
            ➕ Nueva Reservación
          </button>
        </div>
      </div>

      <div className="view-toggle">
        <button
          className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
          onClick={() => setViewMode('calendar')}
        >
          📅 Vista Calendario
        </button>
        <button
          className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          📋 Lista
        </button>
      </div>

      {viewMode === 'calendar' && (
        <div className="calendar-container">
          <div className="calendar-nav">
            <button className="btn btn-sm btn-outline" onClick={goToPreviousWeek}>
              ← Anterior
            </button>
            <div className="calendar-nav-info">
              <button className="btn btn-sm btn-outline" onClick={goToToday}>
                Hoy
              </button>
              <span>
                {MONTH_NAMES[weekDates[0]?.getMonth()]} {weekDates[0]?.getDate()} –{' '}
                {MONTH_NAMES[weekDates[6]?.getMonth()]} {weekDates[6]?.getDate()},{' '}
                {weekDates[0]?.getFullYear()}
              </span>
            </div>
            <button className="btn btn-sm btn-outline" onClick={goToNextWeek}>
              Siguiente →
            </button>
          </div>

          <div className="calendar-grid">
            <div className="calendar-header-row">
              <div className="calendar-time-col"></div>
              {weekDates.map((d, i) => {
                const isToday = formatDate(d) === formatDate(new Date());
                return (
                  <div
                    key={i}
                    className={`calendar-day-col-header ${isToday ? 'today' : ''}`}
                  >
                    <span className="day-name">{DAYS_OF_WEEK[i]}</span>
                    <span className="day-number">{d.getDate()}</span>
                  </div>
                );
              })}
            </div>

            <div className="calendar-body">
              {HOURS.map((hour) => (
                <div key={hour} className="calendar-row">
                  <div className="calendar-time-label">{hour}</div>
                  {weekDates.map((d, di) => {
                    const dateStr = formatDate(d);
                    const key = `${dateStr}_${hour}`;
                    const resList = reservationsBySlot[key] || [];
                    return (
                      <div
                        key={di}
                        className={`calendar-cell ${resList.length > 0 ? 'has-reservation' : ''}`}
                        onClick={() =>
                          resList.length === 0
                            ? openNewReservation(dateStr, hour)
                            : openEditReservation(resList[0])
                        }
                      >
                        {resList.map((r) => (
                          <div
                            key={r.id}
                            className={`calendar-event ${r.status}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditReservation(r);
                            }}
                          >
                            <span className="event-name">{r.name}</span>
                            <span className="event-guests">{r.guests} 👤</span>
                            {r.status === 'confirmada' && (
                              <button
                                className="event-call-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCall(r);
                                }}
                              >
                                📞 Llamar
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="reservations-list">
          {reservations
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((res) => (
              <div
                key={res.id}
                className={`reservation-card ${res.status}`}
              >
                <div className="reservation-card-header">
                  <div>
                    <h4>{res.name}</h4>
                    <span className="reservation-phone">📱 {res.phone}</span>
                  </div>
                  <span className={`status-badge ${res.status}`}>
                    {res.status === 'confirmada' ? '✅ Confirmada' : '❌ Cancelada'}
                  </span>
                </div>
                <div className="reservation-card-body">
                  <div className="reservation-detail">
                    <span>📅</span> {res.date}
                  </div>
                  <div className="reservation-detail">
                    <span>🕐</span> {res.hour}
                  </div>
                  <div className="reservation-detail">
                    <span>👥</span> {res.guests} personas
                  </div>
                  {res.notes && (
                    <div className="reservation-detail">
                      <span>📝</span> {res.notes}
                    </div>
                  )}
                </div>
                {res.status === 'confirmada' && (
                  <div className="reservation-card-actions">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleReschedule(res)}
                    >
                      📅 Reagendar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleCancel(res.id)}
                    >
                      ❌ Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          {reservations.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>No hay reservaciones</h3>
              <p>Crea una nueva desde el calendario o con el botón de arriba.</p>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Editar Reservación' : 'Nueva Reservación'}
      >
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label>Nombre del cliente *</label>
            <input
              type="text"
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nombre completo"
              required
            />
          </div>
          <div className="form-group">
            <label>Teléfono / WhatsApp</label>
            <input
              type="tel"
              className="form-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+52 123 456 7890"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fecha *</label>
              <input
                type="date"
                className="form-input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Hora *</label>
              <select
                className="form-input"
                value={form.hour}
                onChange={(e) => setForm({ ...form, hour: e.target.value })}
                required
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Número de personas</label>
            <input
              type="number"
              min="1"
              max="50"
              className="form-input"
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Notas especiales</label>
            <textarea
              className="form-input form-textarea"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Alergias, occasion especial, etc."
              rows={2}
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
              {editingId ? 'Actualizar' : 'Crear Reservación'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showShareLink}
        onClose={() => setShowShareLink(false)}
        title="🔗 Compartir Link de Reservación"
      >
        <p style={{ marginBottom: 12 }}>
          Comparte este link para que tus clientes hagan reservaciones en línea:
        </p>
        <div className="share-link-box">
          <input type="text" className="form-input" value={SHARE_URL} readOnly />
          <button
            className="btn btn-primary"
            onClick={() => {
              navigator.clipboard.writeText(SHARE_URL);
              alert('Link copiado al portapapeles');
            }}
          >
            📋 Copiar
          </button>
        </div>
        <p style={{ marginTop: 12, fontSize: 13, color: '#888' }}>
          Los clientes podrán ver disponibilidad y hacer reservaciones desde su navegador.
        </p>
      </Modal>

      {call && <CallSimulation res={call} onClose={() => setCall(null)} />}
    </div>
  );
}
