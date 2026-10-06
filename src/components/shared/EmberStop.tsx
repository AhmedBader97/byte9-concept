/**
 * A full stop drawn as the ember square from the Byte9 mark. Screen readers
 * and copy-paste still get an ordinary full stop.
 */
export function EmberStop({ className }: { className?: string }) {
  return (
    <>
      <span className={`ember-stop${className ? ` ${className}` : ''}`} aria-hidden="true" />
      <span className="u-visually-hidden">.</span>
    </>
  );
}
