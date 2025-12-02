import * as THREE from "three";
import {
    Key,
    ModelKind,
    SFX,
    SceneKind,
    SceneUpdateContext,
    SceneUpdateResult,
    TimeContext,
    get_audio_analyser,
    get_texture,
    load_texture,
    play_audio,
} from "./engine";
import { last_from, secs_to_ms, vec3 } from "./util";
import { BigFontText, MediumFontText } from "./text";
import {
    create_line,
    create_point_light,
    GLBModel,
    Group,
    Mesh,
    Sprite2D,
    Sprite3D,
    Spritesheet3D,
    Vec3,
} from "./objects";
import { SiteKind, CursorLocation, SiteScene } from "./site";
import {
    find_next_node_via_word,
    is_node_media_file_audio_only,
    is_node_visible,
    NodeData,
    set_node_as_viewed,
} from "./node";
import { Texture } from "./textures";
import {
    get_audio_media_file_path,
    get_track_path,
    get_video_media_file_path,
    MediaPlayer,
} from "./media_player";
import { Progress, save_state } from "./save";
import { EndScene } from "./end";

enum MediaSide {
    Left,
    Right,
}

enum LeftItem {
    Play,
    Exit,
}

const PRISM_SCALE = 0.4;
const CUBE_SCALE = PRISM_SCALE * 2;

const PLAY_TEXT_POSITION = vec3(-1.3, -0.75, 0);
const EXIT_TEXT_POSITION = vec3(-1.3, -1.3, 0);

class TriangularPrism extends GLBModel {
    constructor(position: Vec3) {
        const prism_material = new THREE.MeshStandardMaterial({
            side: THREE.DoubleSide,
            map: get_texture(Texture.Dark_Gray_Box),
        });

        super(ModelKind.TriangularPrism, prism_material, {
            scale: vec3(PRISM_SCALE, PRISM_SCALE, PRISM_SCALE),
            position,
        });
    }

    activate(): void {
        this.set_texture(Texture.Light_Gray_Box);
    }

    deactivate(): void {
        this.set_texture(Texture.Dark_Gray_Box);
    }
}

class Cube extends Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> {
    constructor(position: Vec3) {
        const cube_material = new THREE.MeshStandardMaterial({
            side: THREE.DoubleSide,
            map: get_texture(Texture.Dark_Gray_Box),
        });

        super(new THREE.BoxGeometry(), cube_material, {
            position,
            scale: vec3(CUBE_SCALE, CUBE_SCALE, CUBE_SCALE),
        });
    }

    activate(): void {
        this.material.map = get_texture(Texture.Light_Gray_Box);
    }

    deactivate(): void {
        this.material.map = get_texture(Texture.Dark_Gray_Box);
    }
}

const WORD_LAYOUTS: [Vec3, Vec3, Vec3][] = [
    [vec3(-0.7, 0.7, 0), vec3(0.5, -0.55, 0), vec3(0.85, -1.08, 0)],
    [vec3(0.03, -0.35, 0), vec3(-0.08, 0.15, 0), vec3(0.68, -0.8, 0)],
    [vec3(0.84, -1.08, 0), vec3(-0.7, 0.7, 0), vec3(0.5, -0.58, 0)],
    [vec3(0.66, -0.82, 0), vec3(0.015, -0.35, 0), vec3(-0.08, 0.12, 0)],
    [vec3(0.5, -0.55, 0), vec3(0.85, -1.08, 0), vec3(-0.7, 0.7, 0)],
    [vec3(-0.08, 0.15, 0), vec3(0.68, -0.8, 0), vec3(0.03, -0.35, 0)],
];

class Word extends Group {
    bg_sprite: Sprite3D;
    value: string;
    text: MediumFontText;

    constructor(value: string, position: Vec3) {
        super({});

        const scale = 12.5;

        this.bg_sprite = new Sprite3D(Texture.Word_Background_Inactive, {
            scale_factor: scale,
        });

        this.value = value;
        this.text = new MediumFontText(value, 11.5, vec3(-0.75, 0, 0), 0x0);
        this.position.copy(position);

        this.add(this.bg_sprite, this.text);
    }

    activate(): void {
        this.bg_sprite.set_texture(Texture.Word_Background_Active);
        this.text.set_color(0xffffff);
    }

    deactivate(): void {
        this.bg_sprite.set_texture(Texture.Word_Background_Inactive);
        this.text.set_color(0x0);
    }
}

function get_cross_target_position(word_layout_index: number): Vec3 {
    const word_index = word_layout_index % 3;
    const word_layout = WORD_LAYOUTS[word_layout_index];

    return word_layout[word_index];
}

class Words extends Group {
    entries: Word[];
    layout_index: number;
    cross_group: Group;

    constructor(node: NodeData) {
        super({});

        this.layout_index = 0;
        this.entries = node.words.map((word, i) => {
            if (word === null) {
                throw new Error(`word can not be null - node name: ${node.name}`);
            }

            return new Word(word, WORD_LAYOUTS[this.layout_index][i]);
        });

        const line_attrs = { render_order: -1, opacity: 0.8 };
        this.cross_group = new Group({
            position: get_cross_target_position(this.layout_index),
            children: [
                create_line({
                    ...line_attrs,
                    points: [vec3(0, 10, 0), vec3(0, -10, 0)],
                }),
                create_line({
                    ...line_attrs,
                    points: [vec3(-10, 0, 0), vec3(10, 0, 0)],
                }),
            ],
        });

        this.add(this.cross_group, ...this.entries);
    }

    is_animating(): boolean {
        return !this.entries.every((word) => word.animation_controller.queue_empty());
    }

    get_current_word(): Word {
        return this.entries[this.layout_index % 3];
    }

    deactivate_all_words(): void {
        this.entries.forEach((word) => word.deactivate());
    }

    update(time_ctx: TimeContext): void {
        const was_animating = this.is_animating();

        this.entries.forEach((word) => {
            word.process_animation_queue(time_ctx);
        });

        if (was_animating && !this.is_animating()) {
            this.get_current_word().activate();
        }

        this.cross_group.process_animation_queue(time_ctx);
    }

    move_down(): void {
        this.get_current_word().deactivate();

        let layout_index = this.layout_index;
        layout_index++;
        if (layout_index > 5) {
            layout_index = 0;
        }

        this.set_layout_index(layout_index);
    }

    move_up(): void {
        this.get_current_word().deactivate();

        let layout_index = this.layout_index;
        layout_index--;
        if (layout_index < 0) {
            layout_index = 5;
        }

        this.set_layout_index(layout_index);
    }

    set_layout_index(index: number): void {
        this.layout_index = index;

        const target_word_positions = WORD_LAYOUTS[this.layout_index];

        this.entries.forEach((word, i) => {
            word.add_position_animation(target_word_positions[i], 5);
        });

        this.cross_group.add_position_animation(vec3(...get_cross_target_position(this.layout_index)), 5);
    }
}

class AudioVisualizerColumn extends Group {
    orbs: Sprite3D[];

    constructor(position: Vec3) {
        super({ position });

        const ORB_SCALE = 13;
        const ORB_DISTANCE = 0.3;

        this.orbs = [
            new Sprite3D(Texture.Audio_Orb_Orange, {
                scale_factor: ORB_SCALE,
                position: vec3(ORB_DISTANCE, 0, 0),
                visible: false,
                opacity: 0.5,
            }),
            new Sprite3D(Texture.Audio_Orb_Yellow, {
                scale_factor: ORB_SCALE,
                position: vec3(ORB_DISTANCE * 2, 0, 0),
                visible: false,
                opacity: 0.5,
            }),
            new Sprite3D(Texture.Audio_Orb_Yellow, {
                scale_factor: ORB_SCALE,
                position: vec3(ORB_DISTANCE * 3, 0, 0),
                visible: false,
                opacity: 0.5,
            }),
            new Sprite3D(Texture.Audio_Orb_Yellow, {
                scale_factor: ORB_SCALE,
                position: vec3(ORB_DISTANCE * 4, 0, 0),
                visible: false,
                opacity: 0.5,
            }),
        ];

        this.add(...this.orbs);
    }

    update(frequency: number): void {
        if (frequency >= 255) {
            this.orbs[0].visible = true;
            this.orbs[1].visible = true;
            this.orbs[2].visible = true;
            this.orbs[3].visible = true;
        } else if (frequency >= 192) {
            this.orbs[0].visible = true;
            this.orbs[1].visible = true;
            this.orbs[2].visible = true;
            this.orbs[3].visible = false;
        } else if (frequency >= 128) {
            this.orbs[0].visible = true;
            this.orbs[1].visible = true;
            this.orbs[2].visible = false;
            this.orbs[3].visible = false;
        } else if (frequency >= 64) {
            this.orbs[0].visible = true;
            this.orbs[1].visible = false;
            this.orbs[2].visible = false;
            this.orbs[3].visible = false;
        } else {
            this.orbs[0].visible = false;
            this.orbs[1].visible = false;
            this.orbs[2].visible = false;
            this.orbs[3].visible = false;
        }
    }
}

const PROGRESS_ORB_TEXTURES = [
    Texture.Media_Progress_Bar_Indicator_1,
    Texture.Media_Progress_Bar_Indicator_2,
    Texture.Media_Progress_Bar_Indicator_3,
    Texture.Media_Progress_Bar_Indicator_4,
    Texture.Media_Progress_Bar_Indicator_5,
    Texture.Media_Progress_Bar_Indicator_6,
];

const PROGRESS_BAR_START_X = 0.01;
const PROGRESS_BAR_END_X = 1.9;

class MediaProgressBar extends Group {
    orbs: Sprite3D[];
    previous_update_percentage: number;

    constructor() {
        super({ position: vec3(PROGRESS_BAR_START_X, 1.32, 0) });

        this.previous_update_percentage = -1;

        this.orbs = [];
    }

    update(elapsed_percentage: number): void {
        elapsed_percentage = Math.floor(elapsed_percentage / 5) * 5;

        if (elapsed_percentage === this.previous_update_percentage) {
            return;
        }

        this.previous_update_percentage = elapsed_percentage;

        const target_orb_count = Math.min(Math.round(elapsed_percentage / 5), 6);

        if (this.orbs.length > target_orb_count) {
            // To support rewinding
            // (should never happen in a real playthrough but useful for testing this thing)
            for (let i = this.orbs.length - 1; i >= target_orb_count; i--) {
                this.orbs[i].parent?.remove(this.orbs[i]);
            }

            this.orbs.splice(target_orb_count);
        } else if (this.orbs.length < target_orb_count) {
            while (this.orbs.length < target_orb_count) {
                const new_orb_texture = PROGRESS_ORB_TEXTURES[this.orbs.length];

                const new_orb = new Sprite3D(new_orb_texture, {
                    scale_factor: 12,
                    render_order: 999,
                });

                if (this.orbs.length > 0) {
                    new_orb.position.x = last_from(this.orbs).position.x - 0.1;
                }

                this.orbs.push(new_orb);
                this.add(new_orb);
            }
        }

        const new_x =
            PROGRESS_BAR_START_X + (elapsed_percentage / 100) * (PROGRESS_BAR_END_X - PROGRESS_BAR_START_X);

        this.position.x = new_x;
    }
}

function set_left_item_to_exit(media: MediaScene, time: number): void {
    media.active_left_item = LeftItem.Exit;
    media.prisms[3].rotation.y = 0;
    media.prisms.forEach((prism) => prism.deactivate());
    media.descriptor.set("Exit", EXIT_TEXT_POSITION, time, {
        on_complete: () => {
            media.cubes.forEach((cube) => cube.activate());
        },
    });
}

function handle_keys(
    media: MediaScene,
    progress: Progress,
    key_states: boolean[],
    camera: THREE.Camera,
    time_ctx: TimeContext
): SceneUpdateResult {
    const { time } = time_ctx;

    if (media.is_viewing_endroll) {
        return {};
    }

    if (key_states[Key.Left]) {
        if (media.selected_side === MediaSide.Left) {
            return {};
        }

        media.selected_side = MediaSide.Left;
        if (media.words !== null) {
            media.words.deactivate_all_words();
        }

        switch (media.active_left_item) {
            case LeftItem.Play:
                media.prisms.forEach((prism) => prism.activate());
                break;
            case LeftItem.Exit:
                media.cubes.forEach((cube) => cube.activate());
                break;
        }
    } else if (key_states[Key.Right]) {
        if (media.selected_side === MediaSide.Right || !media.is_audio_only || !media.words) {
            return {};
        }

        media.cubes.forEach((cube) => cube.deactivate());
        media.prisms.forEach((prism) => prism.deactivate());
        media.cubes[3].rotation.y = 0;
        media.prisms[3].rotation.y = 0;

        media.selected_side = MediaSide.Right;
        if (media.words !== null) {
            media.words.get_current_word().activate();
        }
    } else if (key_states[Key.Up]) {
        if (!media.is_audio_only && !media.player.is_paused()) {
            return {};
        }

        switch (media.selected_side) {
            case MediaSide.Left:
                if (media.descriptor.is_animating()) {
                    return {};
                }

                if (media.active_left_item !== LeftItem.Play) {
                    play_audio(SFX.SND_1);

                    media.active_left_item = LeftItem.Play;
                    media.cubes[3].rotation.y = 0;
                    media.cubes.forEach((cube) => cube.deactivate());
                    media.descriptor.set("Play", PLAY_TEXT_POSITION, time, {
                        on_complete: () => {
                            media.prisms.forEach((prism) => prism.activate());
                        },
                    });
                }

                break;
            case MediaSide.Right:
                if (media.words === null) {
                    throw new Error("invalid state: words can't be null while in right side of the player");
                }

                const { words } = media;

                if (words.is_animating()) {
                    return {};
                }

                words.move_up();

                play_audio(SFX.SND_1);

                break;
        }
    } else if (key_states[Key.Down]) {
        if (!media.is_audio_only && !media.player.is_paused()) {
            return {};
        }

        switch (media.selected_side) {
            case MediaSide.Left:
                if (media.descriptor.is_animating()) {
                    return {};
                }

                if (media.active_left_item !== LeftItem.Exit) {
                    play_audio(SFX.SND_1);
                    set_left_item_to_exit(media, time);
                }

                break;
            case MediaSide.Right:
                if (media.words === null) {
                    throw new Error("invalid state: words can't be null while in right side of the player");
                }

                const { words } = media;

                if (words.is_animating()) {
                    return {};
                }

                words.move_down();

                play_audio(SFX.SND_1);

                break;
        }
    } else if (key_states[Key.Circle]) {
        switch (media.selected_side) {
            case MediaSide.Left:
                if (media.descriptor.is_animating()) {
                    return {};
                }

                switch (media.active_left_item) {
                    case LeftItem.Exit:
                        media.player.reset_and_pause();

                        return {
                            new_scene: new SiteScene(progress, media.enter_location, time, camera),
                        };
                    case LeftItem.Play:
                        if (media.player.is_paused()) {
                            if (!media.is_audio_only) {
                                set_left_item_to_exit(media, time);
                            }

                            media.player.play().catch((err) => {
                                media.player.log_error(err);
                            });

                            play_audio(SFX.SND_28);
                        }

                        break;
                }

                break;
            case MediaSide.Right:
                if (!media.words) {
                    console.error("tried to goto word while words were empty, node id:" + media.node.id);
                    return {};
                }

                const word = media.words.get_current_word();

                const word_search_result = find_next_node_via_word(media.node, word.value);

                media.player.reset_and_pause();

                if (!is_node_visible(word_search_result.node, progress)) {
                    return {
                        new_scene: new SiteScene(progress, media.enter_location, time, camera, {
                            word_not_found: true,
                        }),
                    };
                }

                return {
                    new_scene: new SiteScene(progress, media.enter_location, time, camera, {
                        word_search_result,
                    }),
                };
        }
    }

    return {};
}

export function update_media_scene(media: MediaScene, ctx: SceneUpdateContext): SceneUpdateResult {
    const { game_state, key_states, time_ctx, camera } = ctx;
    const { progress } = game_state;

    const handle_keys_result = handle_keys(media, progress, key_states, camera, time_ctx);
    if (handle_keys_result.new_scene) {
        return handle_keys_result;
    }

    if (media.words !== null) {
        media.words.update(time_ctx);
    }

    media.descriptor.update(time_ctx);

    if (media.selected_side === MediaSide.Left && !media.descriptor.is_animating()) {
        switch (media.active_left_item) {
            case LeftItem.Play:
                media.prisms[3].rotation.y -= 0.5 * time_ctx.delta;
                break;
            case LeftItem.Exit:
                media.cubes[3].rotation.y -= 0.5 * time_ctx.delta;
                break;
        }
    }

    media.lof_icon.update(time_ctx.time);

    if (!media.player.is_paused()) {
        const audio_analyser = get_audio_analyser();
        const frequency_data = audio_analyser.getFrequencyData();
        media.audio_visualizer_columns.forEach((col, idx) => {
            const frequency = frequency_data[16 * idx];
            col.update(frequency);
        });
    } else {
        media.audio_visualizer_columns.forEach((col) => {
            col.update(0);
        });
    }

    const elapsed_percentage = media.player.get_elapsed_percentage();

    if (elapsed_percentage === 100) {
        set_node_as_viewed(media.node.id, game_state);

        media.player.reset_and_pause();

        if (media.is_viewing_endroll) {
            game_state.progress.final_video_view_count++;

            save_state(game_state);

            return { new_scene: new EndScene(media.player_name, time_ctx.time) };
        } else if (media.node.triggers_final_video) {
            const prev_src = media.player.media_el.src;
            const prev_track_src = media.player.track_el.src;

            media.player.load(get_video_media_file_path("ENDROLL1.STR[0]"), get_track_path("Endroll"));
            media.player
                .play()
                .then(() => {
                    media.is_viewing_endroll = true;
                    media.scene_group.visible = false;
                })
                .catch((err) => {
                    media.player.load(prev_src, prev_track_src);
                    media.player.log_error(err);
                });
        }
    }

    if (media.images !== null) {
        media.images.update(elapsed_percentage, time_ctx);
    }

    media.progress_bar.update(elapsed_percentage);

    return {};
}

export class MediaBackgroundImages extends Sprite2D {
    current_index: number;
    textures: THREE.Texture[];
    max_scale: Vec3;

    constructor(table_indices: (number | null)[], site: SiteKind, position_z: number) {
        const textures: THREE.Texture[] = [];
        table_indices.forEach((image_index) => {
            if (image_index !== null) {
                textures.push(load_texture(`/media-background-images/${site}/${image_index}.png`));
            }
        });

        const props = { render_order: -2, proportional_scale: 1.6, position: vec3(0, 0, position_z) };
        if (textures.length > 0) {
            super(textures[0], props);
            this.max_scale = this.scale.clone();
        } else {
            super(new THREE.Texture(), props);
            this.max_scale = vec3(0, 0, 0);
        }

        this.current_index = 0;
        this.textures = textures;
    }

    update(elapsed_media_percentage: number, time_ctx: TimeContext): void {
        if (
            (this.current_index === 0 && elapsed_media_percentage > 35) ||
            (this.current_index === 1 && elapsed_media_percentage > 70)
        ) {
            this.current_index++;
            const new_texture = this.textures[this.current_index];
            if (new_texture) {
                const scale_anim_speed = 3;
                this.add_scale_animation(vec3(this.max_scale.x, 0, 0), scale_anim_speed, {
                    delay: 500,
                    end_cb: () => {
                        if (new_texture) {
                            this.material.map = new_texture;
                        }
                    },
                });
                this.add_scale_animation(this.max_scale, scale_anim_speed);
            }
        }

        this.process_animation_queue(time_ctx);
    }
}

function create_audio_visualizer_columns(): AudioVisualizerColumn[] {
    const columns = [];

    let y = 1.465;
    for (let i = 0; i < 15; i++) {
        const position = vec3(-2.25, y, 0);
        columns.push(new AudioVisualizerColumn(position));
        y -= 0.21;
    }

    return columns;
}

export class MediaScene extends THREE.Scene {
    scene_kind: SceneKind.Media;
    prisms: TriangularPrism[];
    cubes: Cube[];
    words: Words | null;
    descriptor: BigFontText;
    selected_side: MediaSide;
    active_left_item: LeftItem;
    enter_location: CursorLocation;
    images: MediaBackgroundImages | null;
    lof_icon: Spritesheet3D;
    player: MediaPlayer;
    audio_visualizer_columns: AudioVisualizerColumn[];
    progress_bar: MediaProgressBar;
    is_audio_only: boolean;
    node: NodeData;
    scene_group: Group;
    player_name: string;
    is_viewing_endroll: boolean;

    constructor(enter_location: CursorLocation, player_name: string, node: NodeData) {
        super();

        this.node = node;
        this.player_name = player_name;

        this.scene_kind = SceneKind.Media;
        this.is_audio_only = is_node_media_file_audio_only(node.media_file);

        this.enter_location = enter_location;
        this.selected_side = MediaSide.Left;

        this.active_left_item = LeftItem.Play;

        this.prisms = [
            new TriangularPrism(vec3(-4.7, -3, -5)),
            new TriangularPrism(vec3(-4.7, -3, -6)),
            new TriangularPrism(vec3(-3.7, -1.7, -6)),
            new TriangularPrism(vec3(-3.7, -1.7, -5)),
        ];

        this.prisms.forEach((prism) => prism.activate());

        this.cubes = [
            new Cube(vec3(-4.7, -1.7, -5)),
            new Cube(vec3(-4.7, -1.7, -6)),
            new Cube(vec3(-3.5, -3, -6)),
            new Cube(vec3(-3.5, -3, -5)),
        ];

        this.descriptor = new BigFontText("Play", {
            scale_factor: 14,
            position: PLAY_TEXT_POSITION,
            speed: 2,
        });

        this.lof_icon = new Spritesheet3D(Texture.Lof_Animation, {
            scale_factor: 15,
            position: vec3(-0.7, 0.6, 0),
            render_order: -1,
            frame_count: 8,
            rows: 1,
            columns: 8,
            frame_update_rate: secs_to_ms(1 / 14),
            loop: true,
        });

        this.progress_bar = new MediaProgressBar();

        const group = new Group({
            position: vec3(0, 0, -3),
            children: [
                new THREE.AmbientLight(0xffffff, 0.8),
                new Sprite3D(Texture.Media_Node_Name_Container, {
                    scale_factor: 14,
                    position: vec3(1.56, 1.145, 0),
                }),
                new Sprite3D(Texture.Media_Progress_Bar_Container, {
                    scale_factor: 13.5,
                    position: vec3(1.05, 1.35, 0),
                }),
                new MediumFontText(node.name, 11.5, vec3(1.2, 1.11, 0)),
                create_point_light({ intensity: 100, position: vec3(-5, -1, 0) }),
                this.descriptor,
                ...this.prisms,
                ...this.cubes,
                this.progress_bar,
            ],
        });

        const track_path = get_track_path(node.name);
        if (this.is_audio_only) {
            this.player = new MediaPlayer(get_audio_media_file_path(node.media_file), track_path);

            if (node.words.some((word) => !word)) {
                this.words = null;
            } else {
                this.words = new Words(node);
                group.add(this.words);
            }

            this.images = new MediaBackgroundImages(node.image_table_indices, enter_location.site_kind, -3);
            this.audio_visualizer_columns = create_audio_visualizer_columns();

            group.add(this.lof_icon, ...this.audio_visualizer_columns, this.images);
        } else {
            this.player = new MediaPlayer(get_video_media_file_path(node.media_file), track_path);

            this.words = null;
            this.images = null;
            this.audio_visualizer_columns = [];
        }

        this.scene_group = group;

        this.is_viewing_endroll = false;

        this.add(this.scene_group);
    }
}

// TODO: background squares while playing audio-only files
