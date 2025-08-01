"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collect = collect;
function collect(value, previous) {
    return previous ? previous.concat([value]) : [value];
}
