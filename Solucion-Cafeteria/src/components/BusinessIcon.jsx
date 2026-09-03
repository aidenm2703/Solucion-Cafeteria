function IconFrame({ children, title }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

export default function BusinessIcon({ type = 'otro' }) {
  if (type === 'cafeteria' || type === 'coffee') {
    return (
      <IconFrame title="Cafetería">
        <path d="M17 27h30v14c0 8-6 14-15 14S17 49 17 41V27Z" fill="#B58A78" stroke="#F4D7C8" strokeWidth="2.5" />
        <path d="M47 31h4c5 0 8 3 8 8s-3 8-8 8h-5" stroke="#F4D7C8" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 22c0-4 3-7 3-10M32 22c0-4 3-7 3-10M42 22c0-4 3-7 3-10" stroke="#8ED6CF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M14 55h36" stroke="#8ED6CF" strokeWidth="3" strokeLinecap="round" />
      </IconFrame>
    );
  }

  if (type === 'barberia' || type === 'barber') {
    return (
      <IconFrame title="Barbería">
        <path d="m18 17 29 29M47 17 18 46" stroke="#F2B5A7" strokeWidth="6" strokeLinecap="round" />
        <circle cx="17" cy="16" r="8" fill="#E85D75" stroke="#FFE0D7" strokeWidth="2.5" />
        <circle cx="47" cy="16" r="8" fill="#E85D75" stroke="#FFE0D7" strokeWidth="2.5" />
        <circle cx="17" cy="16" r="3" fill="#1B4332" />
        <circle cx="47" cy="16" r="3" fill="#1B4332" />
        <path d="M22 52h20" stroke="#8ED6CF" strokeWidth="3" strokeLinecap="round" />
      </IconFrame>
    );
  }

  if (type === 'comida-rapida' || type === 'food') {
    return (
      <IconFrame title="Restaurante de comida rápida">
        <path d="M14 27h36l-3 7H17l-3-7Z" fill="#E5A855" stroke="#FFE0B2" strokeWidth="2" />
        <path d="M17 35h30v6H17z" fill="#E85D75" stroke="#FFE0D7" strokeWidth="2" />
        <path d="M15 43h34l-3 7H18l-3-7Z" fill="#E5A855" stroke="#FFE0B2" strokeWidth="2" />
        <path d="M22 23c3-4 17-4 20 0" stroke="#8ED6CF" strokeWidth="3" strokeLinecap="round" />
        <circle cx="25" cy="20" r="1.5" fill="#FFE0B2" /><circle cx="34" cy="19" r="1.5" fill="#FFE0B2" /><circle cx="41" cy="22" r="1.5" fill="#FFE0B2" />
      </IconFrame>
    );
  }

  if (type === 'bar' || type === 'cocktail') {
    return (
      <IconFrame title="Bar">
        <path d="M14 17h36L36 35v14" fill="#8ED6CF" stroke="#D8FFF7" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M28 49h16M32 35h8" stroke="#D8FFF7" strokeWidth="3" strokeLinecap="round" />
        <path d="m36 17 6-8" stroke="#E5A855" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="34" cy="25" r="3" fill="#E85D75" />
      </IconFrame>
    );
  }

  return (
    <IconFrame title="Otro negocio">
      <path d="M14 25h36v27H14z" fill="#8ED6CF" stroke="#D8FFF7" strokeWidth="2.5" />
      <path d="M11 25h42l-5-10H16l-5 10Z" fill="#E5A855" stroke="#FFE0B2" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M21 52V37h11v15M38 34h7v7h-7z" stroke="#1B4332" strokeWidth="2.5" />
      <path d="M18 20h28" stroke="#FFE0B2" strokeWidth="2.5" strokeLinecap="round" />
    </IconFrame>
  );
}