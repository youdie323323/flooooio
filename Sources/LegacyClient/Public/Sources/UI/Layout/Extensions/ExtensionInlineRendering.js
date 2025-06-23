"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLACKLISTED = void 0;
exports.InlineRendering = InlineRendering;
exports.BLACKLISTED = Symbol("blacklisted");
/**
 * Mark component as blacklist, mean not rendered automatically.
 */
function InlineRendering(Base) {
    var _a;
    class MixedBase extends Base {
        static { _a = exports.BLACKLISTED; }
        // Make sure its public and readable from outside
        static { this[_a] = exports.BLACKLISTED; }
        constructor(...args) {
            super(...args);
            this[exports.BLACKLISTED] = true;
        }
    }
    return MixedBase;
}
