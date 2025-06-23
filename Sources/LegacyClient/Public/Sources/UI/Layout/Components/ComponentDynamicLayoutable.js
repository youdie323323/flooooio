"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractDynamicLayoutable = exports.DYNAMIC_LAYOUTABLE = void 0;
const Component_1 = require("./Component");
exports.DYNAMIC_LAYOUTABLE = Symbol("dynamicLayoutable");
class AbstractDynamicLayoutable extends Component_1.Component {
    constructor() {
        super(...arguments);
        this[_a] = true;
    }
    static { _a = exports.DYNAMIC_LAYOUTABLE; }
}
exports.AbstractDynamicLayoutable = AbstractDynamicLayoutable;
