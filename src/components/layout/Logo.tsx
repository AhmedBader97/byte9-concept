interface LogoProps {
  /** Hide the wordmark and show only the 3×3 mark */
  markOnly?: boolean;
}

/**
 * Concept mark: nine blocks, one lit, a nod to the "9" and to Blaze's
 * component-based page builder. Drawn in code, not taken from Byte9's assets.
 */
export function Logo({ markOnly = false }: LogoProps) {
  const cells = Array.from({ length: 9 }, (_, i) => i);
  return (
    <span className="logo">
      <svg className="logo__mark" viewBox="0 0 26 26" width="26" height="26" aria-hidden="true" focusable="false">
        {cells.map((i) => {
          const x = (i % 3) * 9;
          const y = Math.floor(i / 3) * 9;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width="8"
              height="8"
              rx="1.5"
              className={i === 8 ? 'logo__cell logo__cell--lit' : 'logo__cell'}
              // Diagonal order for the hover ripple, ending on the lit block
              style={{ '--d': (i % 3) + Math.floor(i / 3) } as React.CSSProperties}
            />
          );
        })}
      </svg>
      {!markOnly && <span className="logo__word">Byte9</span>}
    </span>
  );
}
