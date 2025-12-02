import { NodeData, NodeID } from "./node";
import {
    SiteKind,
    CursorLocation,
    MatrixPosition2D,
    SITE_A_NODES,
    SITE_B_NODES,
    SiteLayout,
    get_level_count,
} from "./site";
import { clamp_between, clamp_bottom, to_numeric_or_null } from "./util";

export type PolytanPartProgress = {
    body: boolean;
    head: boolean;
    left_arm: boolean;
    right_arm: boolean;
    left_leg: boolean;
    right_leg: boolean;
};

export type Progress = {
    sskn_level: number;
    gate_level: number;
    final_video_view_count: number;
    polytan_parts: PolytanPartProgress;
    viewed_nodes: Set<NodeID>;
};

export type GameState = {
    progress: Progress;
    site: SiteKind; // acts like a tag
    a_location: CursorLocation;
    b_location: CursorLocation;
    name: string;
};

const LEGACY_SAVE_KEY = "lainSaveState";
const SAVE_KEY = "lainTSX-save-v3";

export function save_state(game_state: GameState, key: string = SAVE_KEY): void {
    const json = {
        ...game_state,
        progress: {
            ...game_state.progress,
            viewed_nodes: Array.from(game_state.progress.viewed_nodes),
        },
    };

    localStorage.setItem(key, JSON.stringify(json));
}

function get_default_state(): GameState {
    return {
        progress: {
            sskn_level: 0,
            gate_level: 0,
            final_video_view_count: 0,
            polytan_parts: {
                body: false,
                head: false,
                left_arm: false,
                right_arm: false,
                left_leg: false,
                right_leg: false,
            },
            viewed_nodes: new Set(),
        },
        site: SiteKind.A,
        a_location: {
            site_kind: SiteKind.A,
            level: 4,
            node_matrix_position: {
                row: 1,
                col: 0,
            },
            site_segment: 6,
        },
        b_location: {
            site_kind: SiteKind.B,
            level: 1,
            node_matrix_position: {
                row: 2,
                col: 0,
            },
            site_segment: 5,
        },
        name: "",
    };
}

export type GetSavedStateResult = {
    saved_state: GameState;
    found_valid_save: boolean;
};

function is_polytan_part_progress(obj: any): obj is PolytanPartProgress {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof obj.body === "boolean" &&
        typeof obj.head === "boolean" &&
        typeof obj.left_arm === "boolean" &&
        typeof obj.right_arm === "boolean" &&
        typeof obj.left_leg === "boolean" &&
        typeof obj.right_leg === "boolean"
    );
}

function is_progress(obj: any): obj is Progress {
    return (
        typeof obj === "object" &&
        obj !== null &&
        typeof obj.sskn_level === "number" &&
        typeof obj.gate_level === "number" &&
        typeof obj.final_video_view_count === "number" &&
        is_polytan_part_progress(obj.polytan_parts) &&
        obj.viewed_nodes instanceof Set
    );
}

function is_site_kind(obj: any): obj is SiteKind {
    return typeof obj === "string" && (obj === SiteKind.A || obj === SiteKind.B);
}

function is_cursor_location(obj: any): obj is CursorLocation {
    return (
        typeof obj === "object" &&
        obj !== null &&
        is_matrix_position_2d(obj.node_matrix_position) &&
        typeof obj.level === "number" &&
        typeof obj.site_segment === "number" &&
        is_site_kind(obj.site_kind)
    );
}

function is_matrix_position_2d(obj: any): obj is MatrixPosition2D {
    return (
        typeof obj === "object" && obj !== null && typeof obj.row === "number" && typeof obj.col === "number"
    );
}

function validate_game_state(obj: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!is_progress(obj.progress)) {
        errors.push("invalid progress object");
    }

    if (!is_site_kind(obj.site)) {
        errors.push("invalid site kind");
    }

    if (!is_cursor_location(obj.a_location)) {
        errors.push("invalid a_location");
    }

    if (!is_cursor_location(obj.b_location)) {
        errors.push("invalid b_location");
    }

    if (typeof obj.name !== "string") {
        errors.push("name must be a string");
    }

    return { valid: errors.length === 0, errors };
}

function correct_location_errors(location: CursorLocation): void {
    location.node_matrix_position.row = clamp_between(location.node_matrix_position.row, 0, 2);
    location.node_matrix_position.col = clamp_between(location.node_matrix_position.col, 0, 3);
    location.level = clamp_between(location.level, 0, get_level_count(location.site_kind));
    location.site_segment = clamp_between(location.site_segment, 0, 7);
}

export function get_saved_state(): GetSavedStateResult {
    const default_save = get_default_state();

    try {
        const save = localStorage.getItem(SAVE_KEY);

        if (save === null || save === "null" || save === undefined || save.trim() === "") {
            return { saved_state: default_save, found_valid_save: false };
        }

        const parsed = JSON.parse(save);
        const state: GameState = {
            ...parsed,
            progress: {
                ...parsed.progress,
                viewed_nodes: new Set<NodeID>(parsed.progress.viewed_nodes),
            },
        };

        const { valid, errors } = validate_game_state(state);
        if (!valid) {
            console.error(`corrupted save file: ${errors}`);
            return { saved_state: default_save, found_valid_save: false };
        }

        // correct potentially erroneous values
        state.progress.gate_level = clamp_between(state.progress.gate_level, 0, 4);
        state.progress.final_video_view_count = clamp_bottom(state.progress.final_video_view_count, 0);
        state.progress.sskn_level = clamp_bottom(state.progress.sskn_level, 0);
        correct_location_errors(state.a_location);
        correct_location_errors(state.b_location);

        return { saved_state: state, found_valid_save: true };
    } catch (err) {
        console.warn("failed to load save:", err);
        return { saved_state: default_save, found_valid_save: false };
    }
}

export function has_valid_save_state(): boolean {
    try {
        const save = localStorage.getItem(SAVE_KEY);

        if (save === null || save === undefined || save.trim() === "") {
            return false;
        }

        JSON.parse(save);

        return true;
    } catch (err) {
        return false;
    }
}

export function get_current_location(game_state: GameState): CursorLocation {
    switch (game_state.site) {
        case SiteKind.A:
            return game_state.a_location;
        case SiteKind.B:
            return game_state.b_location;
    }
}

////////////////////////////////////////////////////////////
// converting legacy saves to new format
////////////////////////////////////////////////////////////
type LegacyGameProgress = {
    sskn_level: number;
    gate_level: number;
    final_video_viewcount: number;
    polytan_unlocked_parts: {
        body: boolean;
        head: boolean;
        left_arm: boolean;
        right_arm: boolean;
        left_leg: boolean;
        right_leg: boolean;
    };
    nodes: Record<string, { is_viewed: boolean }>;
};

type LegacyNodeMatrixIndex = {
    matrixIdx: number;
    rowIdx: number;
    colIdx: number;
};

type LegacyNodeData = {
    id: string;
    image_table_indices: { 1: string; 2: string; 3: string };
    triggers_final_video: number;
    required_final_video_viewcount: number;
    media_file: string;
    node_name: string;
    site: "A" | "B";
    type: number;
    title: string;
    unlocked_by: string;
    upgrade_requirement: number;
    words: { 1: string; 2: string; 3: string };
    protocol_lines: {
        1: string;
        2: string;
        3: string;
    };
    matrixIndices?: LegacyNodeMatrixIndex;
    is_viewed?: number;
};

type LegacySiteSaveState = {
    activeNode: LegacyNodeData;
    siteRot: number[];
    activeLevel: string;
};

type LegacyGameState = {
    siteSaveState: {
        a: LegacySiteSaveState;
        b: LegacySiteSaveState;
    };
    activeNode: LegacyNodeData;
    siteRot: number[];
    activeLevel: string;
    activeSite: SiteKind;
    gameProgress: LegacyGameProgress;
    playerName: string;
};

function flatten_site(site: SiteLayout<NodeData>): NodeData[] {
    return site.flatMap((level) =>
        level.flatMap((row) => row.filter((node): node is NodeData => node !== null))
    );
}

function upgrade_legacy_progress(legacy_progress: LegacyGameProgress): Progress {
    const viewed_node_names = Object.keys(legacy_progress.nodes).filter(
        (key) => legacy_progress.nodes[key].is_viewed
    );
    const all_nodes = [...flatten_site(SITE_A_NODES), ...flatten_site(SITE_B_NODES)];

    const viewed_node_ids = new Set(
        viewed_node_names
            .map((name) => all_nodes.find((node) => node.name === name)?.id)
            .filter((id): id is string => id !== undefined)
    );

    const {
        sskn_level,
        gate_level,
        final_video_viewcount: final_video_view_count,
        polytan_unlocked_parts: polytan_parts,
    } = legacy_progress;

    return {
        sskn_level,
        gate_level,
        final_video_view_count,
        polytan_parts,
        viewed_nodes: viewed_node_ids,
    };
}

function upgrade_location(site_kind: SiteKind, state: LegacyGameState): CursorLocation | null {
    const legacy_location = state.siteSaveState[site_kind];

    const matrix_indices = legacy_location.activeNode.matrixIndices;
    if (!matrix_indices) {
        return null;
    }

    const level = to_numeric_or_null(legacy_location.activeLevel);
    if (level == null) {
        return null;
    }

    const site_segment = matrix_indices.matrixIdx;

    return {
        node_matrix_position: { row: matrix_indices.rowIdx, col: matrix_indices.colIdx },
        site_segment,
        level,
        site_kind,
    };
}

function upgrade_legacy_save(legacy_save_state: LegacyGameState): GameState {
    const default_save = get_default_state();

    return {
        a_location: upgrade_location(SiteKind.A, legacy_save_state) ?? default_save.a_location,
        b_location: upgrade_location(SiteKind.B, legacy_save_state) ?? default_save.b_location,
        progress: upgrade_legacy_progress(legacy_save_state.gameProgress),
        name: legacy_save_state.playerName,
        site: legacy_save_state.activeSite,
    };
}

function is_valid_legacy_game_state(data: unknown): data is LegacyGameState {
    if (!data || typeof data !== "object") return false;
    const state = data as any;

    if (typeof state.activeLevel !== "string") return false;

    if (typeof state.playerName !== "string") return false;

    if (!["a", "b"].includes(state.activeSite)) return false;

    // validate site save states
    if (!state.siteSaveState?.a || !state.siteSaveState?.b) return false;

    for (const site of [state.siteSaveState.a, state.siteSaveState.b]) {
        if (!site.activeNode || typeof site.activeNode !== "object") return false;
        if (!site.activeNode.matrixIndices || typeof site.activeNode.matrixIndices !== "object") return false;
    }

    // validate gameProgress
    const gp = state.gameProgress;
    if (!gp || typeof gp !== "object") return false;
    if (typeof gp.sskn_level !== "number") return false;
    if (typeof gp.gate_level !== "number") return false;
    if (typeof gp.final_video_viewcount !== "number") return false;

    const parts = gp.polytan_unlocked_parts;
    if (!parts || typeof parts !== "object") return false;
    if (typeof parts.body !== "boolean") return false;
    if (typeof parts.head !== "boolean") return false;
    if (typeof parts.left_arm !== "boolean") return false;
    if (typeof parts.right_arm !== "boolean") return false;
    if (typeof parts.left_leg !== "boolean") return false;
    if (typeof parts.right_leg !== "boolean") return false;

    if (!gp.nodes || typeof gp.nodes !== "object") return false;

    return true;
}

export function check_if_legacy_save_and_upgrade(): void {
    const legacy_save = localStorage.getItem(LEGACY_SAVE_KEY);
    if (legacy_save === null) {
        return;
    }

    try {
        const parsed_legacy_save = JSON.parse(legacy_save);
        if (!is_valid_legacy_game_state(parsed_legacy_save)) {
            return;
        }

        const upgraded_save = upgrade_legacy_save(parsed_legacy_save);
        save_state(upgraded_save);
    } catch (e) {
        console.error("failed to upgrade legacy save", e);
    }

    localStorage.setItem(`_${LEGACY_SAVE_KEY}`, legacy_save);
    localStorage.removeItem(LEGACY_SAVE_KEY);
}
