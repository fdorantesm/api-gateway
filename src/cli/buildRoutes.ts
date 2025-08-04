export function buildRoutes(mappings: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  mappings.forEach((m) => {
    const idx = m.indexOf(':');
    if (idx === -1) {
      console.error('Invalid node mapping: ' + m);
      process.exit(1);
    }
    const node = m.slice(0, idx);
    const dest = m.slice(idx + 1);
    map[node] = dest;
  });
  return map;
}
