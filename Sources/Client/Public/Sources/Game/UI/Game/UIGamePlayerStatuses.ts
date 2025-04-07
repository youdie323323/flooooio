import type Player from "../../Entity/Player";
import { type MaybePointerLike } from "../Layout/Components/Component";
import type { AutomaticallySizedLayoutOptions } from "../Layout/Components/WellKnown/Container";
import { StaticSpace, StaticVContainer } from "../Layout/Components/WellKnown/Container";
import UIGameOtherPlayerStatus from "./UIGameOtherPlayerStatus";
import UIGameSelfPlayerStatus from "./UIGameSelfPlayerStatus";

type PlayerStatus = UIGameSelfPlayerStatus | UIGameOtherPlayerStatus;

export default class UIGamePlayerStatuses extends StaticVContainer<UIGameSelfPlayerStatus | StaticSpace | StaticVContainer<UIGameOtherPlayerStatus>> {
    private statuses: Map<Player, PlayerStatus> = new Map();
    private otherPlayerStatuses: StaticVContainer<UIGameOtherPlayerStatus>;

    constructor(
        layoutOptions: MaybePointerLike<AutomaticallySizedLayoutOptions>,
    ) {
        super(layoutOptions);

        this.addChild(this.otherPlayerStatuses = new StaticVContainer<UIGameOtherPlayerStatus>(
            {},

            false,

            45,
        ));
    }

    public addPlayer(player: Player, isSelf: boolean): void {
        if (isSelf) {
            const status = new UIGameSelfPlayerStatus(
                {},

                player,
            );

            this.prependChild(new StaticSpace(0, 45));
            this.prependChild(status);

            this.statuses.set(player, status);
        } else {
            const status = new UIGameOtherPlayerStatus(
                {},

                player,
            );

            this.otherPlayerStatuses.addChild(status);

            this.statuses.set(player, status);
        }
    }

    public removePlayer(player: Player, isSelf: boolean): void {
        const status = this.statuses.get(player);

        if (status) {
            if (isSelf) {
                this.removeChild(status as UIGameSelfPlayerStatus);
            } else {
                this.otherPlayerStatuses.removeChild(status as UIGameOtherPlayerStatus);
            }
        }
    }

    override destroy(): void {
        super.destroy();

        this.statuses.clear();
        this.statuses = null;
    }
}