import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { useToast } from '../Components/useToast';

function playWelcomeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.55);
    });
  } catch {
    /* audio no disponible */
  }
}

const AFFIRMATIONS = [
  '¡Bienvenido de nuevo! Que tengas un gran día. 🎉',
  '¡Qué gusto verte! Listo para trabajar. 💪',
  '¡Hola! Todos los sistemas funcionando. 🚀',
  '¡Bienvenido! A dar lo mejor hoy. ✨',
  '¡Buen día! Tu equipo te espera. ☀️',
];

let affirmationIndex = -1;

function pickAffirmation() {
  affirmationIndex = (affirmationIndex + 1) % AFFIRMATIONS.length;
  return AFFIRMATIONS[affirmationIndex];
}

export default function Login() {
  const navigate = useNavigate();
  const { showToast, confirm } = useToast();
  const business = storage.getBusiness();
  const users = storage.getUsers();
  const legacyAuth = storage.getAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [welcome, setWelcome] = useState(null);
  const welcomedRef = useRef(false);

  const findMatchingUser = () => {
    const lower = username.trim().toLowerCase();
    const user = users.find(
      (u) => u.username.toLowerCase() === lower && u.password === password
    );
    if (user) return user;
    // Compatibilidad con credenciales antiguas
    if (
      legacyAuth &&
      legacyAuth.username.toLowerCase() === lower &&
      legacyAuth.password === password
    ) {
      return users[0] || null;
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const user = findMatchingUser();

    if (user) {
      storage.setLoggedIn(true);
      storage.setCurrentUser(user.username);
      setWelcome(pickAffirmation());
      if (!welcomedRef.current) {
        playWelcomeSound();
        welcomedRef.current = true;
      }
      showToast({
        type: 'success',
        title: 'Bienvenido',
        message: `Sesión iniciada como ${user.name || user.username}.`,
      });
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 1500);
    } else {
      playErrorSound();
      setError('Usuario o contraseña incorrectos. Intenta de nuevo.');
      showToast({
        type: 'error',
        title: 'Acceso denegado',
        message: 'El usuario o la contraseña no son válidos.',
      });
    }
  };

  const handleFactoryReset = async () => {
    const ok = await confirm({
      title: 'Restaurar configuración de fábrica',
      message: 'Se borrarán el negocio, todos los usuarios, contraseñas y datos guardados.',
      confirmText: 'Sí, restaurar',
      cancelText: 'Cancelar',
      danger: true,
    });
    if (!ok) return;
    storage.resetToFactory();
    navigate('/');
    window.location.reload();
  };

  function playErrorSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 180;
      gain.gain.value = 0.15;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      /* audio no disponible */
    }
  }

  return (
    <div className="setup-container">
      <div className="setup-bg">
        <div className="setup-bg-circle c1" />
        <div className="setup-bg-circle c2" />
        <div className="setup-bg-circle c3" />
      </div>

      <div className={`setup-card ${welcome ? 'login-welcome-card' : ''}`}>
        {!welcome ? (
          <div className="setup-step">
            <div className="setup-icon-large">
              {business?.icon || '☕'}
            </div>
            <h1 className="setup-title">
              {business?.name || 'Gaia Dynamics'}
            </h1>
            <p className="setup-subtitle">
              Inicia sesión para continuar
            </p>
            <form onSubmit={handleSubmit} className="setup-form">
              <label className="setup-label">👤 Usuario</label>
              <input
                type="text"
                className="setup-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu usuario"
                autoFocus
              />
              <label className="setup-label" style={{ marginTop: 14 }}>
                🔒 Contraseña
              </label>
              <input
                type="password"
                className="setup-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
              />
              {error && <div className="setup-error">{error}</div>}
              <button
                type="submit"
                className="setup-btn primary"
                disabled={!username.trim() || !password}
              >
                🔓 Entrar
              </button>
              <button
                type="button"
                className="setup-btn secondary"
                onClick={handleFactoryReset}
              >
                Restaurar configuración de fábrica
              </button>
            </form>
          </div>
        ) : (
          <div className="login-welcome">
            <div className="login-welcome-icon">🎊</div>
            <h1>¡Hola, {username.trim()}!</h1>
            <p>{welcome}</p>
            <div className="login-welcome-loader">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
