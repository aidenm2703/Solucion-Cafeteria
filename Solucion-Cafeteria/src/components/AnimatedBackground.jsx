import { animated, useSpring } from '@react-spring/web';
import './AnimatedBackground.css';

export default function AnimatedBackground() {
  const primary = useSpring({
    from: { x: -6, y: -4, opacity: 0.28 },
    to: { x: 6, y: 4, opacity: 0.4 },
    loop: { reverse: true },
    config: { tension: 45, friction: 30 },
  });
  const secondary = useSpring({
    from: { x: 5, y: 8, opacity: 0.16 },
    to: { x: -8, y: -5, opacity: 0.28 },
    loop: { reverse: true },
    config: { tension: 35, friction: 26 },
  });

  return (
    <div className="animated-background" aria-hidden="true">
      <animated.div
        className="animated-background-orb animated-background-orb-primary"
        style={{
          opacity: primary.opacity,
          transform: primary.x.to([primary.y], (x, y) => `translate3d(${x}%, ${y}%, 0)`),
        }}
      />
      <animated.div
        className="animated-background-orb animated-background-orb-secondary"
        style={{
          opacity: secondary.opacity,
          transform: secondary.x.to([secondary.y], (x, y) => `translate3d(${x}%, ${y}%, 0)`),
        }}
      />
    </div>
  );
}