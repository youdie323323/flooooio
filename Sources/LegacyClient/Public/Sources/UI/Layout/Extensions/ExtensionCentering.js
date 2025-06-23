"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Centering = Centering;
const Component_1 = require("../Components/Component");
/**
 * Mark component as blacklist, mean not rendered automatically.
 */
function Centering(Base) {
    var _a;
    class MixedBase extends Base {
        static { _a = Component_1.CENTERING; }
        // Make sure its public and readable from outside
        static { this[_a] = Component_1.CENTERING; }
        constructor(...args) {
            super(...args);
            this[Component_1.CENTERING] = true;
        }
    }
    return MixedBase;
}
