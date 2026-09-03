import { useRef } from 'react';
import { animated, useSpring } from '@react-spring/web';
import './PremiumCard.css';

const idleShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
const activeShadow =
  '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';

export default function PremiumCard({ icon, label, value, sub, href = '#', accent = '#1B4332' }) {
  const isFocused = useRef(false);
  const [styles, api] = useSpring(() => ({
    y: 0,
    scale: 1,
    x: 0,
    boxShadow: idleShadow,
    // Esta configuración aporta una respuesta snappy sin usar duration.
    config: { tension: 280, friction: 24 },
  }));

  const animateTo = (active) => {
    // api.start actualiza el spring sin provocar un re-render del componente.
    api.start({
      y: active ? -8 : 0,
      scale: active ? 1.02 : 1,
      x: active ? 5 : 0,
      boxShadow: active ? activeShadow : idleShadow,
    });
  };

  return (
    <animated.div
      className="premium-card rounded-xl bg-white p-6"
      style={styles}
      tabIndex={0}
      role="link"
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          window.location.href = href;
        }
      }}
      onClick={() => { window.location.href = href; }}
      onMouseEnter={() => animateTo(true)}
      onMouseLeave={() => !isFocused.current && animateTo(false)}
      onFocus={() => {
        isFocused.current = true;
        animateTo(true);
      }}
      onBlur={() => {
        isFocused.current = false;
        animateTo(false);
      }}
    >
      <div className="premium-card-topline">
        <span className="premium-card-icon" style={{ backgroundColor: `${accent}18`, color: accent }}>
          {icon}
        </span>
        <animated.span className="premium-card-arrow" style={{ x: styles.x }} aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
            <path d="M4 10h11m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </animated.span>
      </div>
      <span className="premium-card-label">{label}</span>
      <strong className="premium-card-value">{value}</strong>
      {sub && <span className="premium-card-sub">{sub}</span>}
    </animated.div>
  );
}