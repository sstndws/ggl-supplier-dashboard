export function GglLogo({
  size = 44,
  variant = 'brand',
}: {
  size?: number;
  variant?: 'brand' | 'light';
}) {
  if (variant === 'light') {
    return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-hidden>
        <path
          d="M22 2L38 11V33L22 42L6 33V11L22 2Z"
          fill="white"
          fillOpacity="0.95"
        />
        <path d="M22 10L30 15V29L22 34L14 29V15L22 10Z" fill="#8B1A1A" />
        <text
          x="22"
          y="26.5"
          textAnchor="middle"
          fill="white"
          fontSize="9.5"
          fontWeight="700"
          fontFamily="DM Sans, Inter, sans-serif"
        >
          GGL
        </text>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-hidden>
      <path d="M22 2L38 11V33L22 42L6 33V11L22 2Z" fill="#7B1E1E" />
      <path
        d="M22 10L30 15V29L22 34L14 29V15L22 10Z"
        fill="white"
        fillOpacity="0.92"
      />
      <text
        x="22"
        y="26.5"
        textAnchor="middle"
        fill="#7B1E1E"
        fontSize="9.5"
        fontWeight="700"
        fontFamily="DM Sans, Inter, sans-serif"
      >
        GGL
      </text>
    </svg>
  );
}
