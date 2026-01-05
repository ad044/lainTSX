import {
    get_audio_media_file_path,
    get_track_path,
    get_video_media_file_path,
    MediaPlayer,
} from "./media_player";
import * as THREE from "three";
import { CursorLocation, SiteKind, SiteScene } from "./site";
import { any_key_pressed, random_from, secs_to_ms } from "./util";
import { SceneKind, SceneUpdateContext, SceneUpdateResult } from "./engine";
import { get_node_data, NodeID, set_node_as_viewed } from "./node";
import { MediaBackgroundImages } from "./media";
import { PolytanPartProgress } from "./save";
import { are_all_polytan_parts_unlocked } from "./polytan";

type VideoIdleMedia = {
    media_file: string;
};

type AudioIdleMedia = {
    id: NodeID;
    name: string;
    media_file: string;
    image_table_indices: (number | null)[];
};

function get_random_idle_audio_media(site: SiteKind): AudioIdleMedia {
    let random_id;
    switch (site) {
        case SiteKind.A:
            random_id = random_from([
                "0000a",
                "0001a",
                "0002a",
                "0003a",
                "0004a",
                "0005a",
                "0006a",
                "0007a",
                "0008a",
                "0009a",
            ]);
            break;
        case SiteKind.B:
            random_id = random_from(["1015b", "1219b", "0419b", "0500b", "0501b", "0508b", "0510b", "0513b"]);
            break;
    }

    const node_data = get_node_data(random_id);
    if (!node_data) {
        throw new Error("unable to find node data for ID " + random_id);
    }

    return { ...node_data };
}

function get_random_idle_video_media(
    site: SiteKind,
    polytan_part_progress: PolytanPartProgress
): VideoIdleMedia {
    switch (site) {
        case SiteKind.A:
            return random_from([
                { media_file: "INS01.STR[0]" },
                { media_file: "INS02.STR[0]" },
                { media_file: "INS03.STR[0]" },
                { media_file: "INS04.STR[0]" },
                { media_file: "INS05.STR[0]" },
                { media_file: "INS06.STR[0]" },
                { media_file: "INS07.STR[0]" },
                { media_file: "INS08.STR[0]" },
                { media_file: "INS09.STR[0]" },
                { media_file: "INS10.STR[0]" },
                { media_file: "INS11.STR[0]" },
                { media_file: "INS12.STR[0]" },
                { media_file: "INS13.STR[0]" },
                { media_file: "INS14.STR[0]" },
                { media_file: "INS15.STR[0]" },
                { media_file: "INS16.STR[0]" },
                { media_file: "INS17.STR[0]" },
                { media_file: "INS18.STR[0]" },
                { media_file: "INS19.STR[0]" },
                { media_file: "INS20.STR[0]" },
                { media_file: "INS21.STR[0]" },
                { media_file: "INS22.STR[0]" },
            ]);
        case SiteKind.B:
            if (are_all_polytan_parts_unlocked(polytan_part_progress) && Math.random() < 0.3) {
                return random_from([{ media_file: "PO1.STR[0]" }, { media_file: "PO2.STR[0]" }]);
            } else {
                return random_from([
                    { media_file: "INS16.STR[0]" },
                    { media_file: "INS17.STR[0]" },
                    { media_file: "INS18.STR[0]" },
                    { media_file: "INS19.STR[0]" },
                    { media_file: "INS20.STR[0]" },
                    { media_file: "INS21.STR[0]" },
                    { media_file: "INS22.STR[0]" },
                ]);
            }
    }
}

export function update_idle_scene(idle: IdleScene, ctx: SceneUpdateContext): SceneUpdateResult {
    const { time_ctx, game_state, key_states, camera } = ctx;
    const { progress } = game_state;

    const elapsed_percentage = idle.media_player.get_elapsed_percentage();

    if (idle.images !== null) {
        idle.images.update(elapsed_percentage, time_ctx);
    }

    if (
        idle.failed_to_load ||
        elapsed_percentage === 100 ||
        (any_key_pressed(key_states) && time_ctx.time >= idle.enter_time + secs_to_ms(1))
    ) {
        idle.media_player.reset_and_pause();

        if (idle.node_id) {
            set_node_as_viewed(idle.node_id, game_state);
        }

        return {
            new_scene: new SiteScene(progress, idle.enter_location, time_ctx.time, camera),
        };
    }

    return {};
}

export class IdleScene extends THREE.Scene {
    scene_kind: SceneKind.Idle;
    images: MediaBackgroundImages | null;
    media_player: MediaPlayer;
    enter_location: CursorLocation;
    enter_time: number;
    node_id: NodeID | null;
    failed_to_load: boolean;

    constructor(
        enter_location: CursorLocation,
        polytan_part_progress: PolytanPartProgress,
        enter_time: number
    ) {
        super();

        this.scene_kind = SceneKind.Idle;

        this.enter_location = enter_location;
        this.enter_time = enter_time;

        const { site_kind } = enter_location;

        if (Math.random() < 0.5) {
            const { media_file, name, image_table_indices, id } = get_random_idle_audio_media(site_kind);

            this.media_player = new MediaPlayer(get_audio_media_file_path(media_file), get_track_path(name));
            this.images = new MediaBackgroundImages(image_table_indices, site_kind, -6);
            this.add(this.images);

            this.node_id = id;
        } else {
            const { media_file } = get_random_idle_video_media(site_kind, polytan_part_progress);

            this.media_player = new MediaPlayer(get_video_media_file_path(media_file));
            this.images = null;
            this.node_id = null;
        }

        this.failed_to_load = false;

        this.media_player.play().catch((err) => {
            this.failed_to_load = true;
            this.media_player.log_error(err);
        });
    }

    is_video(): boolean {
        return this.node_id === null;
    }
}
