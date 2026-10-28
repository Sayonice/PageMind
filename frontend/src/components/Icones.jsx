function Svg({ tamanho = 20, preenchido = false, children }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill={preenchido ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconeLogo = (props) => (
  <Svg {...props}>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17Z" />
    <path d="M4 19a2.5 2.5 0 0 1 2.5-2.5H20" />
  </Svg>
);

export const IconeBusca = (props) => (
  <Svg {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

export const IconeConfig = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 13.5c.04-.33.06-.66.06-1s-.02-.67-.06-1l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.4 7.4 0 0 0-1.73-1l-.36-2.54A.5.5 0 0 0 14 2h-3.84a.5.5 0 0 0-.5.44l-.36 2.54c-.63.24-1.21.58-1.73 1l-2.39-.96a.5.5 0 0 0-.6.22L2.66 8.56a.5.5 0 0 0 .12.64L4.8 10.78c-.04.33-.06.66-.06 1s.02.67.06 1l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.4.3.6.22l2.39-.96c.52.42 1.1.76 1.73 1l.36 2.54c.04.25.25.44.5.44H14c.25 0 .46-.19.5-.44l.36-2.54c.63-.24 1.21-.58 1.73-1l2.39.96c.2.08.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64L19.4 13.5Z" />
  </Svg>
);

export const IconeMenu = (props) => (
  <Svg {...props}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </Svg>
);

export const IconeFechar = (props) => (
  <Svg {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconeCoracao = (props) => (
  <Svg {...props}>
    <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.9 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.3 3.4 4.2 6.6-1.7 4.8-9.2 9.4-9.2 9.4Z" />
  </Svg>
);

export const IconeComentario = (props) => (
  <Svg {...props}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.5-4.6A8 8 0 1 1 21 12Z" />
  </Svg>
);

export const IconeLixeira = (props) => (
  <Svg {...props}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7M9 7V4.5h6V7" />
  </Svg>
);

export const IconeSeta = (props) => (
  <Svg {...props}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);

export const IconeLivros = (props) => (
  <Svg {...props}>
    <path d="M5 4h4v16H5zM10 4h4v16h-4z" />
    <path d="m15.5 5.5 3.7-.9 3 14.5-3.7.9z" />
  </Svg>
);

export const IconePagina = (props) => (
  <Svg {...props}>
    <path d="M6 3h8l4 4v14H6z" />
    <path d="M14 3v4h4M9 12h6M9 16h6" />
  </Svg>
);

export const IconeCaneta = (props) => (
  <Svg {...props}>
    <path d="m4 20 1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z" />
    <path d="m14 7 3 3" />
  </Svg>
);

export const IconeEtiqueta = (props) => (
  <Svg {...props}>
    <path d="M3 12.2V4h8.2L21 13.8 13.8 21z" />
    <circle cx="7.5" cy="8.5" r="1.2" />
  </Svg>
);

export const IconeEnvelope = (props) => (
  <Svg {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </Svg>
);

export const IconeCadeado = (props) => (
  <Svg {...props}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Svg>
);

export const IconeOlho = (props) => (
  <Svg {...props}>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const IconeOlhoFechado = (props) => (
  <Svg {...props}>
    <path d="M3 3l18 18M10.6 6a10 10 0 0 1 1.4-.1c6.4 0 10 6.1 10 6.1a17 17 0 0 1-3.2 3.9M6.6 7.6C3.9 9.4 2 12 2 12s3.6 6.5 10 6.5c1.4 0 2.7-.3 3.8-.8" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </Svg>
);
