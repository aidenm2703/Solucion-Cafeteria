/* ============================================
   Gaia Dynamics | Utilidad de Sonido
   Genera efectos de audio (Web Audio API) para
   las notificaciones del sistema.
   ============================================ */

let sharedCtx = null;

function getCtx() {
  try {
    if (!sharedCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      sharedCtx = new AC();
    }
    if (sharedCtx.state === 'suspended') sharedCtx.resume();
    return sharedCtx;
  } catch {
    return null;
  }
}

function tone({ freq = 440, type = 'sine', start = 0, duration = 0.3, volume = 0.2, endFreq = null }) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  if (endFreq) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + start + duration);
  }
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);
}

const PATTERNS = {
  // Ascenso alegre (éxito)
  success() {
    tone({ freq: 523.25, duration: 0.14, volume: 0.24 });
    tone({ freq: 659.25, start: 0.1, duration: 0.16, volume: 0.24 });
    tone({ freq: 783.99, start: 0.2, duration: 0.3, volume: 0.24 });
  },
  // Descenso grave (error)
  error() {
    tone({ freq: 220, type: 'square', duration: 0.16, volume: 0.1 });
    tone({ freq: 174, type: 'square', start: 0.16, duration: 0.32, volume: 0.1 });
  },
  // Doble tono de alerta (advertencia)
  warning() {
    tone({ freq: 440, type: 'triangle', duration: 0.18, volume: 0.2 });
    tone({ freq: 440, type: 'triangle', start: 0.24, duration: 0.18, volume: 0.2 });
  },
  // Pregunta / confirmación
  confirm() {
    tone({ freq: 392, duration: 0.14, volume: 0.16 });
    tone({ freq: 523.25, start: 0.16, duration: 0.24, volume: 0.16 });
  },
  // Aviso suave
  info() {
    tone({ freq: 660, duration: 0.12, volume: 0.14 });
    tone({ freq: 880, start: 0.11, duration: 0.16, volume: 0.14 });
  },
};

export function playSound(type = 'info') {
  try {
    const play = PATTERNS[type] || PATTERNS.info;
    play();
  } catch {
    /* audio no disponible */
  }
}