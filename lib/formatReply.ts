export type Segment = { text: string; bold: boolean };

/** Minimal formatting for chat replies: **bold**, bullet lines, and no headings. */
export function formatReply(text: string): Segment[] {
  const segments: Segment[] = [];
  const lines = text.split('\n');
  lines.forEach((raw, i) => {
    let line = raw.replace(/^#{1,6}\s*/, '');
    const bullet = line.match(/^\s*[-*•]\s+/);
    if (bullet) line = `•  ${line.slice(bullet[0].length)}`;
    line.split('**').forEach((part, j) => {
      if (part) segments.push({ text: part, bold: j % 2 === 1 });
    });
    if (i < lines.length - 1) segments.push({ text: '\n', bold: false });
  });
  return segments;
}
