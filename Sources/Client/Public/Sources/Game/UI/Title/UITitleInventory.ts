import type { MaybePointerLike } from "../Layout/Components/Component";
import type { AutomaticallySizedLayoutOptions} from "../Layout/Components/WellKnown/Container";
import { StaticSpace, StaticVContainer , StaticHContainer } from "../Layout/Components/WellKnown/Container";
import UIPetalPlaceholder from "../Shared/UIPetalPlaceholder";

export default class UITitleInventory extends StaticHContainer {
    constructor(
        layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>,
    ) {
        super(
            layoutOptions,

            false,

            false,
            null,
            false,
        );

        const makeColumn = () => {
            return new StaticVContainer({ x: 0, y: 0 }, false, true, null, false).addChildren(
                new UIPetalPlaceholder({ x: 0, y: 0 }, 30),
                new StaticSpace(0, 9),
                new UIPetalPlaceholder({ x: 0, y: 0 }, 25),
            );
        };

        this.addChildren(
            makeColumn(),
            new StaticSpace(8, 0),
            makeColumn(),
            new StaticSpace(8, 0),
            makeColumn(),
            new StaticSpace(8, 0),
            makeColumn(),
            new StaticSpace(8, 0),
            makeColumn(),
            new StaticSpace(8, 0),
            makeColumn(),
            new StaticSpace(8, 0),
            makeColumn(),
        );
    }
}