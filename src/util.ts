import * as THREE from "three";
import { Euler, Vec3 } from "./objects";

export function vec3(x?: number, y?: number, z?: number): Vec3 {
    return new THREE.Vector3(x, y, z);
}

export function euler(x?: number, y?: number, z?: number): Euler {
    return new THREE.Euler(x, y, z);
}

export function random_from<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function random_between(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function random_rotation(
    min_x = 0,
    max_x = Math.PI * 2,
    min_y = 0,
    max_y = Math.PI * 2,
    min_z = 0,
    max_z = Math.PI * 2
) {
    const x = min_x + Math.random() * (max_x - min_x);
    const y = min_y + Math.random() * (max_y - min_y);
    const z = min_z + Math.random() * (max_z - min_z);

    return new THREE.Euler(x, y, z);
}

export function last_from<T>(arr: T[]): T {
    return arr[arr.length - 1];
}

export function secs_to_ms(s: number): number {
    return s * 1000;
}

export function split_digits(n: number): [number, number] {
    return [Math.floor(n / 10), n % 10];
}

export function clamp_between(n: number, a: number, b: number): number {
    if (n < a) {
        return a;
    }

    if (n > b) {
        return b;
    }

    return n;
}

export function clamp_bottom(n: number, min: number): number {
    return Math.max(n, min);
}

export function to_numeric_or_null(str: string): number | null {
    if (str.trim() === "" || isNaN(Number(str))) {
        return null;
    }

    return Number(str);
}

export function are_colors_equal(c1: THREE.Color, c2: THREE.Color): boolean {
    const threshold = 0.01;

    return (
        Math.abs(c1.r - c2.r) < threshold &&
        Math.abs(c1.g - c2.g) < threshold &&
        Math.abs(c1.b - c2.b) < threshold
    );
}

export function any_key_pressed(key_states: boolean[]): boolean {
    return key_states.some((k) => k);
}

export function extract_frame(
    atlas: THREE.Texture,
    atlas_w: number,
    atlas_h: number,
    x: number,
    y: number,
    frame_w: number,
    frame_h: number
): THREE.Texture {
    const frame_texture = atlas.clone();
    frame_texture.repeat.set(frame_w / atlas_w, frame_h / atlas_h);
    frame_texture.offset.x = x / atlas_w;
    frame_texture.offset.y = 1 - frame_h / atlas_h - y / atlas_h;
    frame_texture.needsUpdate = true;

    return frame_texture;
}

export function get_bounding_box(object: THREE.Object3D): THREE.Box3 {
    return new THREE.Box3().setFromObject(object);
}

export function get_height(object: THREE.Object3D): number {
    const bbox = get_bounding_box(object);
    return bbox.max.y - bbox.min.y;
}

export function deep_clone(obj: any): any {
    if (obj === null || typeof obj !== "object") {
        return obj;
    }

    if (obj.clone && typeof obj.clone === "function") {
        return obj.clone();
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => deep_clone(item));
    }

    if (typeof obj === "function") {
        return obj;
    }

    const cloned: any = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deep_clone(obj[key]);
        }
    }

    return cloned;
}

export function create_LCG(
    seed: number = Date.now(),
    a: number = 1664525,
    c: number = 1013904223,
    m: number = 2 ** 32
) {
    let s = seed;
    return () => (s = (s * a + c) % m);
}
