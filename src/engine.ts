import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import sprite_atlas_json from "./static/json/sprite_atlas.json";
import model_crystal from "./static/models/crystal.glb";
import model_triangular_prism from "./static/models/cut_cube.glb";
import model_mirror from "./static/models/gate_mirror.glb";
import model_gold_node from "./static/models/gold_node.glb";
import sprite_atlas from "./static/sprites/game.png";
import lain_frames_0 from "./static/sprites/lain/lain_frames_0.png";
import lain_frames_1 from "./static/sprites/lain/lain_frames_1.png";
import lain_frames_2 from "./static/sprites/lain/lain_frames_2.png";
import lain_frames_3 from "./static/sprites/lain/lain_frames_3.png";
import lain_frames_4 from "./static/sprites/lain/lain_frames_4.png";
import lain_frames_5 from "./static/sprites/lain/lain_frames_5.png";
import lain_frames_6 from "./static/sprites/lain/lain_frames_6.png";
import lain_frames_7 from "./static/sprites/lain/lain_frames_7.png";
import lain_frames_8 from "./static/sprites/lain/lain_frames_8.png";
import lain_frames_9 from "./static/sprites/lain/lain_frames_9.png";
import lain_frames_10 from "./static/sprites/lain/lain_frames_10.png";
import lain_frames_11 from "./static/sprites/lain/lain_frames_11.png";
import lain_frames_12 from "./static/sprites/lain/lain_frames_12.png";
import lain_frames_13 from "./static/sprites/lain/lain_frames_13.png";
import lain_frames_14 from "./static/sprites/lain/lain_frames_14.png";
import lain_frames_15 from "./static/sprites/lain/lain_frames_15.png";
import lain_frames_16 from "./static/sprites/lain/lain_frames_16.png";
import lain_frames_17 from "./static/sprites/lain/lain_frames_17.png";
import lain_frames_18 from "./static/sprites/lain/lain_frames_18.png";
import lain_frames_19 from "./static/sprites/lain/lain_frames_19.png";
import lain_frames_20 from "./static/sprites/lain/lain_frames_20.png";
import lain_frames_21 from "./static/sprites/lain/lain_frames_21.png";
import lain_frames_22 from "./static/sprites/lain/lain_frames_22.png";
import lain_frames_23 from "./static/sprites/lain/lain_frames_23.png";
import lain_frames_24 from "./static/sprites/lain/lain_frames_24.png";
import lain_frames_25 from "./static/sprites/lain/lain_frames_25.png";
import lain_talk_frames_0 from "./static/sprites/lain/lain_talk_frames_0.png";
import lain_talk_frames_1 from "./static/sprites/lain/lain_talk_frames_1.png";
import lain_talk_frames_2 from "./static/sprites/lain/lain_talk_frames_2.png";
import { extract_frame } from "./util";
import { Texture } from "./textures";
import { BootScene, update_boot_scene } from "./boot";
import { SSknScene, update_sskn_scene } from "./sskn";
import { SiteScene, update_site_scene } from "./site";
import { GateScene, update_gate_scene } from "./gate";
import { MediaScene, update_media_scene } from "./media";
import { ChangeSiteScene, update_change_site_scene } from "./change_site";
import { PolytanScene, update_polytan_scene } from "./polytan";
import { EndScene, update_end_scene } from "./end";
import { get_media_element } from "./media_player";
import { DebugScene, handle_additional_debug_keys, update_debug_scene } from "./debug";
import { IdleScene, update_idle_scene } from "./idle";
import { get_saved_state, GameState } from "./save";
import { TaKScene, update_tak_scene } from "./tak";
import { LoadingScene, update_loading_scene } from "./loading";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const W = 800;
const H = 600;
const ASPECT_RATIO = W / H;
const NEAR = 0.0001;
const FAR = 2000;
export const REGULAR_FOV = 55;
export const SITE_SCENE_FOV = 35;

const LANG_KEY = "lainTSX-lang";
const SIZE_MODIFIER_KEY = "lainTSX-game-size";
const KEYBINDINGS_KEY = "lainTSX-keys";

export type Language = {
    name: string;
    code: string;
};

export const SUPPORTED_LANGUAGES: Language[] = [
    { name: "English", code: "en" },
    { name: "German", code: "de" },
    { name: "French", code: "fr" },
    { name: "Japanese", code: "ja" },
    { name: "Korean", code: "ko" },
    { name: "Portuguese", code: "pt-BR" },
    { name: "Russian", code: "ru" },
];

export function get_user_language(): Language {
    const default_value = { name: "English", code: "en" };

    const lang_code = localStorage.getItem(LANG_KEY);

    if (lang_code === null) {
        return default_value;
    }

    for (let i = 0; i < SUPPORTED_LANGUAGES.length; i++) {
        if (SUPPORTED_LANGUAGES[i].code === lang_code) {
            return SUPPORTED_LANGUAGES[i];
        }
    }

    return default_value;
}

export enum Key {
    Left,
    Right,
    Up,
    Down,
    L1,
    L2,
    R1,
    R2,
    Circle,
    Triangle,
    Cross,
    Square,
    Select,
    Start,
}

// resources (textures/models/etc)
export const SPRITE_ATLAS_DIM = 2048;

// audio stuff

// TODO: remove this once audio extraction part of the script is done
// only here to make running the game locally possible without having audio extracted
let DID_AUDIO_SAFE_FAIL = false;

export enum SFX {
    SND_0,
    SND_1,
    SND_2,
    SND_3,
    SND_4,
    SND_5,
    SND_6,
    SND_7,
    SND_8,
    SND_9,
    SND_10,
    SND_11,
    SND_12,
    SND_13,
    SND_14,
    SND_15,
    SND_16,
    SND_17,
    SND_18,
    SND_19,
    SND_20,
    SND_21,
    SND_22,
    SND_23,
    SND_24,
    SND_25,
    SND_26,
    SND_27,
    SND_28,
    SND_29,
    SND_30,
    SND_31,
    SND_32,
    SND_33,
    SND_34,
    About_Theme,
    Site_Theme,
}

type SFXStoreEntry = {
    loaded_audio?: HTMLAudioElement;
    filename: string;
};

const SFX_STORE: SFXStoreEntry[] = [
    { filename: "snd_0" },
    { filename: "snd_1" },
    { filename: "snd_2" },
    { filename: "snd_3" },
    { filename: "snd_4" },
    { filename: "snd_5" },
    { filename: "snd_6" },
    { filename: "snd_7" },
    { filename: "snd_8" },
    { filename: "snd_9" },
    { filename: "snd_10" },
    { filename: "snd_11" },
    { filename: "snd_12" },
    { filename: "snd_13" },
    { filename: "snd_14" },
    { filename: "snd_15" },
    { filename: "snd_16" },
    { filename: "snd_17" },
    { filename: "snd_18" },
    { filename: "snd_19" },
    { filename: "snd_20" },
    { filename: "snd_21" },
    { filename: "snd_22" },
    { filename: "snd_23" },
    { filename: "snd_24" },
    { filename: "snd_25" },
    { filename: "snd_26" },
    { filename: "snd_27" },
    { filename: "snd_28" },
    { filename: "snd_29" },
    { filename: "snd_30" },
    { filename: "snd_31" },
    { filename: "snd_32" },
    { filename: "snd_33" },
    { filename: "snd_34" },
    { filename: "about_theme" },
    { filename: "lain_theme" },
];

export function play_audio(sfx: SFX, loop = false): void {
    if (DID_AUDIO_SAFE_FAIL) {
        return;
    }

    const entry = SFX_STORE[sfx];

    entry.loaded_audio ??= new Audio(`/sfx/${entry.filename}.mp4`);
    entry.loaded_audio.currentTime = 0;
    entry.loaded_audio.volume = 0.5;
    entry.loaded_audio.loop = loop;
    entry.loaded_audio.play().catch((err) => {
        console.error(`failed to play audio "${entry.filename}"\n${err}`);
    });
}

export function pause_audio(sfx: SFX): void {
    if (DID_AUDIO_SAFE_FAIL) {
        return;
    }

    const entry = SFX_STORE[sfx];

    if (entry.loaded_audio) {
        entry.loaded_audio.pause();
    }
}

function all_audio_loaded(): boolean {
    return DID_AUDIO_SAFE_FAIL || SFX_STORE.every((e) => e.loaded_audio);
}

let AUDIO_ANALYSER: THREE.AudioAnalyser | null = null;

export function get_audio_analyser(): THREE.AudioAnalyser {
    if (AUDIO_ANALYSER === null) {
        const media_el = get_media_element();

        const listener = new THREE.AudioListener();
        const audio = new THREE.Audio(listener);

        audio.setMediaElementSource(media_el);

        AUDIO_ANALYSER = new THREE.AudioAnalyser(audio, 2048);
    }

    return AUDIO_ANALYSER;
}

export function get_audio_analyser_rms(): number {
    const analyser = get_audio_analyser();

    const buffer = new Uint8Array(analyser.analyser.fftSize / 2);
    analyser.analyser.getByteTimeDomainData(buffer);

    let rms = 0;
    for (let i = 0; i < buffer.length; i++) {
        rms += buffer[i] * buffer[i];
    }

    return Math.sqrt(rms / buffer.length);
}

// texture globals
export type TextureDimensions = {
    x: number;
    y: number;
    w: number;
    h: number;
};

const TEXTURE_LOADER = new THREE.TextureLoader();
const LOADED_TEXTURES: THREE.Texture[] = [];

export function load_texture(img: string): THREE.Texture {
    return TEXTURE_LOADER.load(img);
}

export function get_texture(texture: Texture): THREE.Texture {
    return LOADED_TEXTURES[texture];
}

export function get_texture_dimensions(texture: Texture): TextureDimensions {
    return sprite_atlas_json[texture];
}

export function get_separate_texture(texture: Texture): THREE.CanvasTexture {
    const source_texture = get_texture(texture);

    const { x, y, w: width, h: height } = get_texture_dimensions(texture);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("failed to get 2D context");
    }

    const image = source_texture.image;

    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

    const new_texture = new THREE.CanvasTexture(canvas);

    new_texture.wrapS = source_texture.wrapS;
    new_texture.wrapT = source_texture.wrapT;
    new_texture.magFilter = source_texture.magFilter;
    new_texture.minFilter = source_texture.minFilter;

    return new_texture;
}

export function get_texture_atlas(): THREE.Texture {
    return LOADED_TEXTURES[LOADED_TEXTURES.length - 1];
}

// GLTF globals
export enum ModelKind {
    Crystal,
    TriangularPrism,
    Mirror,
    GoldNode,
}

const GLTFS_TO_LOAD = [model_crystal, model_triangular_prism, model_mirror, model_gold_node];

const GLTF_LOADER = new GLTFLoader();
const LOADED_GLTFS: GLTF[] = [];

export function get_model(model_kind: ModelKind): GLTF {
    return LOADED_GLTFS[model_kind];
}

export function all_gltfs_loaded(): boolean {
    return LOADED_GLTFS.length === GLTFS_TO_LOAD.length;
}

// LAPKS globals
const LAPK_ATLASES_TO_LOAD = [
    lain_frames_0,
    lain_frames_1,
    lain_frames_2,
    lain_frames_3,
    lain_frames_4,
    lain_frames_5,
    lain_frames_6,
    lain_frames_7,
    lain_frames_8,
    lain_frames_9,
    lain_frames_10,
    lain_frames_11,
    lain_frames_12,
    lain_frames_13,
    lain_frames_14,
    lain_frames_15,
    lain_frames_16,
    lain_frames_17,
    lain_frames_18,
    lain_frames_19,
    lain_frames_20,
    lain_frames_21,
    lain_frames_22,
    lain_frames_23,
    lain_frames_24,
    lain_frames_25,
];
const LAPK_TALK_ATLASES_TO_LOAD = [lain_talk_frames_0, lain_talk_frames_1, lain_talk_frames_2];

const LOADED_LAPK_ATLASES: THREE.Texture[] = [];
const LOADED_LAPK_TALK_ATLASES: THREE.Texture[] = [];

const LOADED_LAPK_FRAMES: THREE.Texture[] = [];
const LOADED_LAPK_TALK_FRAMES: THREE.Texture[] = [];

export function get_lapk(index: number): THREE.Texture {
    if (!all_lapks_loaded()) {
        throw new Error("not all lain animations have been loaded");
    }

    return LOADED_LAPK_FRAMES[index];
}

export function all_lapks_loaded(): boolean {
    return LOADED_LAPK_ATLASES.length === LAPK_ATLASES_TO_LOAD.length;
}

export function all_talk_lapks_loaded(): boolean {
    return LOADED_LAPK_TALK_ATLASES.length === LAPK_TALK_ATLASES_TO_LOAD.length;
}

export function get_talk_lapk(index: number): THREE.Texture {
    if (!all_talk_lapks_loaded()) {
        throw new Error("not all lain talk animations have been loaded");
    }

    return LOADED_LAPK_TALK_FRAMES[index];
}

// ============================ end of resources

export type TimeContext = {
    time: number;
    delta: number;
};

export enum SceneKind {
    Site,
    Media,
    Gate,
    Boot,
    SSkn,
    Polytan,
    ChangeSite,
    End,
    Idle,
    TaK,
    Loading,
    Debug,
}

export type Scene =
    | BootScene
    | SSknScene
    | SiteScene
    | GateScene
    | MediaScene
    | ChangeSiteScene
    | PolytanScene
    | EndScene
    | IdleScene
    | TaKScene
    | LoadingScene
    | DebugScene;

export type SceneUpdateResult = {
    new_scene?: Scene;
};

export type SceneUpdateContext = {
    time_ctx: TimeContext;
    key_states: boolean[];
    game_state: GameState;
    debug: boolean;
    pressed_keys: Set<string>;
    camera: THREE.PerspectiveCamera;
};

export type SceneEvent<T extends Scene> = {
    apply: (scene: T, apply_time: number) => void;
    apply_time: number;
};

export function process_scene_events<T extends Scene>(scene: T, events: SceneEvent<T>[], time: number): void {
    const remaining_events: SceneEvent<T>[] = [];

    events.forEach((event) => {
        const { apply, apply_time } = event;
        if (time >= apply_time) {
            apply(scene, time);
        } else {
            remaining_events.push(event);
        }
    });

    events.length = 0;
    events.push(...remaining_events);
}

export function read_key_mappings(): Record<string, Key> {
    const stored_mappings = localStorage.getItem(KEYBINDINGS_KEY);
    if (stored_mappings) {
        try {
            const key_array = JSON.parse(stored_mappings);
            return Object.fromEntries(key_array.map((key: string, index: Key) => [key, index]));
        } catch (err) {}
    }

    return {
        arrowdown: Key.Down,
        arrowleft: Key.Left,
        arrowup: Key.Up,
        arrowright: Key.Right,
        x: Key.Circle,
        z: Key.Cross,
        d: Key.Triangle,
        s: Key.Square,
        q: Key.R2,
        e: Key.L2,
        w: Key.L1,
        r: Key.R1,
        v: Key.Start,
        c: Key.Select,
    };
}

export class Engine {
    game_state: GameState;
    scene: Scene | null;
    key_states: boolean[];
    pressed_keys: Set<string>;
    key_mappings: Record<string, Key>;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    time_multiplier: number;
    is_debug: boolean;
    size_modifier: number;
    controls: OrbitControls | null;

    set_scene(scene: Scene) {
        this.scene = scene;

        if (scene.scene_kind === SceneKind.Site) {
            this.camera.fov = SITE_SCENE_FOV;
        } else {
            this.camera.fov = REGULAR_FOV;
            pause_audio(SFX.Site_Theme);
        }

        const media_el = document.getElementById("media")!;
        if (scene.scene_kind === SceneKind.Media || scene.scene_kind === SceneKind.Idle) {
            media_el.style.display = "block";
        } else {
            media_el.style.display = "none";
        }

        const canvas_el = document.getElementById("main-canvas")!;
        if (scene.scene_kind === SceneKind.Media && !scene.is_audio_only) {
            canvas_el.style.background = "none";
        } else {
            canvas_el.style.background = "#000";
        }

        this.camera.updateProjectionMatrix();
    }

    constructor(is_debug: boolean) {
        this.is_debug = is_debug;
        this.time_multiplier = 1;

        this.size_modifier = parseFloat(localStorage.getItem(SIZE_MODIFIER_KEY) || "1");
        this.size_modifier = isNaN(this.size_modifier) ? 1 : this.size_modifier;

        this.camera = new THREE.PerspectiveCamera(REGULAR_FOV, ASPECT_RATIO, NEAR, FAR);

        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(W * this.size_modifier, H * this.size_modifier);
        this.renderer.toneMapping = THREE.NoToneMapping;
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.domElement.id = "main-canvas";
        document.getElementById("game-container")!.appendChild(this.renderer.domElement);

        if (this.is_debug) {
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.target.set(0, 0, -1);
        } else {
            this.controls = null;
        }

        this.game_state = get_saved_state().saved_state;

        this.scene = null;

        this.pressed_keys = new Set();

        this.key_states = [];
        for (const _ in Key) {
            this.key_states.push(false);
        }

        this.key_mappings = read_key_mappings();
    }

    handle_debug_keys(): void {
        if (this.pressed_keys.has("[")) {
            this.time_multiplier -= 0.025;
            if (this.time_multiplier < 0) {
                this.time_multiplier = 0;
            }
        }

        if (this.pressed_keys.has("]")) {
            this.time_multiplier += 0.025;
        }

        handle_additional_debug_keys(this);
    }

    handle_engine_keys(): void {
        const modifier = 1.01;
        if (this.pressed_keys.has("k")) {
            this.size_modifier *= modifier;
            this.renderer.setSize(W * this.size_modifier, H * this.size_modifier);

            localStorage.setItem(SIZE_MODIFIER_KEY, `${this.size_modifier}`);
        }

        if (this.pressed_keys.has("j")) {
            this.size_modifier /= modifier;
            this.renderer.setSize(W * this.size_modifier, H * this.size_modifier);

            localStorage.setItem(SIZE_MODIFIER_KEY, `${this.size_modifier}`);
        }
    }

    update(time: number, delta: number) {
        const time_ctx = {
            delta: delta * this.time_multiplier,
            time: time * this.time_multiplier,
        };

        this.handle_engine_keys();

        if (this.scene === null) {
            if (all_gltfs_loaded() && all_lapks_loaded() && all_audio_loaded()) {
                this.set_scene(new BootScene(time_ctx.time));

                document.getElementById("loading")!.style.display = "none";
                document.getElementById("game-container")!.style.border = "1px solid white";
            }
        } else {
            if (this.is_debug) {
                this.handle_debug_keys();
            }

            const ctx: SceneUpdateContext = {
                game_state: this.game_state,
                key_states: this.key_states,
                time_ctx,
                debug: true,
                pressed_keys: this.pressed_keys,
                camera: this.camera,
            };

            let update_result: SceneUpdateResult = {};
            const { scene } = this;
            switch (scene.scene_kind) {
                case SceneKind.Site:
                    update_result = update_site_scene(scene, ctx);
                    break;
                case SceneKind.Media:
                    update_result = update_media_scene(scene, ctx);
                    break;
                case SceneKind.Boot:
                    update_result = update_boot_scene(scene, ctx);
                    break;
                case SceneKind.SSkn:
                    update_result = update_sskn_scene(scene, ctx);
                    break;
                case SceneKind.Gate:
                    update_result = update_gate_scene(scene, ctx);
                    break;
                case SceneKind.Polytan:
                    update_result = update_polytan_scene(scene, ctx);
                    break;
                case SceneKind.End:
                    update_result = update_end_scene(scene, ctx);
                    break;
                case SceneKind.ChangeSite:
                    update_result = update_change_site_scene(scene, ctx);
                    break;
                case SceneKind.Idle:
                    update_result = update_idle_scene(scene, ctx);
                    break;
                case SceneKind.TaK:
                    update_result = update_tak_scene(scene, ctx);
                    break;
                case SceneKind.Loading:
                    update_result = update_loading_scene(scene, ctx);
                    break;
                case SceneKind.Debug:
                    update_result = update_debug_scene(scene, ctx);
                    break;
            }

            const { new_scene } = update_result;

            if (new_scene) {
                this.set_scene(new_scene);
            } else {
                this.renderer.render(this.scene, this.camera);
            }

            if (this.controls) {
                this.controls.update();
            }

            this.key_states.fill(false);
        }
    }
}

export async function engine_create(): Promise<Engine> {
    const is_debug = import.meta.env.DEV;

    const atlas = await TEXTURE_LOADER.loadAsync(sprite_atlas);
    atlas.magFilter = THREE.NearestFilter;
    atlas.minFilter = THREE.NearestFilter;

    sprite_atlas_json.forEach((entry) => {
        const { x, y, w, h } = entry;

        const texture = atlas.clone();
        texture.repeat.set(w / SPRITE_ATLAS_DIM, h / SPRITE_ATLAS_DIM);
        texture.offset.x = x / SPRITE_ATLAS_DIM;
        texture.offset.y = 1 - h / SPRITE_ATLAS_DIM - y / SPRITE_ATLAS_DIM;
        texture.needsUpdate = true;

        LOADED_TEXTURES.push(texture);
    });

    LOADED_TEXTURES.push(atlas);

    // start loading GLTF models
    GLTFS_TO_LOAD.forEach((model, i) => {
        GLTF_LOADER.loadAsync(model).then((gltf) => {
            LOADED_GLTFS[i] = gltf;
        });
    });

    // start loading LAPKS
    const lapks_atlas_dim = 2048;
    const lapk_w = 352;
    const lapk_h = 367;
    const frames_per_row = 5;
    const frames_per_col = 5;
    const frames_per_atlas = frames_per_row * frames_per_col;

    LAPK_ATLASES_TO_LOAD.forEach(async (spritesheet, index) => {
        TEXTURE_LOADER.loadAsync(spritesheet).then((spritesheet_texture) => {
            for (let r = 0; r < frames_per_row; r++) {
                for (let c = 0; c < frames_per_col; c++) {
                    const frame_texture = extract_frame(
                        spritesheet_texture,
                        lapks_atlas_dim,
                        lapks_atlas_dim,
                        c * lapk_w,
                        r * lapk_h,
                        lapk_w,
                        lapk_h
                    );

                    const location = index * frames_per_atlas + r * frames_per_row + c;
                    LOADED_LAPK_FRAMES[location] = frame_texture;
                }
            }

            LOADED_LAPK_ATLASES.push(spritesheet_texture.clone());
        });
    });

    LAPK_TALK_ATLASES_TO_LOAD.forEach(async (spritesheet, index) => {
        TEXTURE_LOADER.loadAsync(spritesheet).then((spritesheet_texture) => {
            for (let r = 0; r < frames_per_row; r++) {
                for (let c = 0; c < frames_per_col; c++) {
                    const frame_texture = extract_frame(
                        spritesheet_texture,
                        lapks_atlas_dim,
                        lapks_atlas_dim,
                        c * lapk_w,
                        r * lapk_h,
                        lapk_w,
                        lapk_h
                    );

                    const location = index * frames_per_atlas + r * frames_per_row + c;
                    LOADED_LAPK_TALK_FRAMES[location] = frame_texture;
                }
            }

            LOADED_LAPK_TALK_ATLASES.push(spritesheet_texture.clone());
        });
    });

    // preload audio
    SFX_STORE.forEach((entry) => {
        const audio = new Audio(`/sfx/${entry.filename}.mp4`);

        audio.preload = "auto";

        audio.addEventListener("canplaythrough", () => {
            entry.loaded_audio = audio;
        });

        audio.addEventListener("error", () => {
            if (is_debug) {
                DID_AUDIO_SAFE_FAIL = true;
            } else {
                console.warn(`failed to preload audio: ${entry.filename}`);
            }
        });

        audio.load();
    });

    return new Engine(is_debug);
}
