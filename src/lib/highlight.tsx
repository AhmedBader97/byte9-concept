/** Colours keys, strings and numbers in one line of JSON, as React nodes (no HTML injection). */
export function highlightJson(line: string, index: number): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const pattern = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(line))) {
    if (match.index > last) parts.push(line.slice(last, match.index));
    if (match[1]) {
      parts.push(
        <span key={`${index}-${match.index}`} className={match[2] ? 'code__key' : 'code__string'}>
          {match[1]}
        </span>,
      );
      if (match[2]) parts.push(match[2]);
    } else if (match[3]) {
      parts.push(
        <span key={`${index}-${match.index}`} className="code__number">
          {match[3]}
        </span>,
      );
    }
    last = pattern.lastIndex;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}
