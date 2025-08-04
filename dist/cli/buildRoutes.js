"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRoutes = buildRoutes;
function buildRoutes(mappings) {
    const map = {};
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
