const LANG_KEY = "lainTSX-lang";
const KEYBINDINGS_KEY = "lainTSX-keys"
const SAVE_KEY = "lainTSX-save-v3"
const LEGACY_SAVE_KEY = "lainSaveState";

const LAND_AND_BINDINGS_HTML = `
        <div class="modal-inner-row" id="lang-bindings-modal">
                <div class="modal-entry">
                        <div class="modal-entry-title language">Language</div>
                        <div class="language-entry" data-lang="en" id="lang-en">English</div>
                        <div class="language-entry" data-lang="de" id="lang-de">German</div>
                        <div class="language-entry" data-lang="fr" id="lang-fr">French</div>
                        <div class="language-entry" data-lang="ja" id="lang-ja">Japanese</div>
                        <div class="language-entry" data-lang="ko" id="lang-ko">Korean</div>
                        <div class="language-entry" data-lang="pt-BR" id="lang-pt-BR">Portuguese</div>
                        <div class="language-entry" data-lang="ru" id="lang-ru">Russian</div>
                        </div>
                        <div class="modal-entry">
                        <button class="reset-keybindings-button" id="reset-keybinds-btn">
                                Reset keybindings
                        </button>
                        <div class="keybindings" id="keybinds-list"></div>
                </div>
        </div>
`

const SAVE_FILE_HTML = `
        <div class="modal-entry" id="save-file-modal">
                <div>You can download your current save as a JSON file and re-import it later.</div>
                <button class="save-file-button" id="export-btn">
                <span class="lime">Export </span> save file
                </button>
                <div class="modal-error-msg" id="export-error"></div>
                <hr />
                <div>
                You can import an exported save file from here (will refresh the page once once
                uploaded).
                </div>
                <div class="red">
                WARNING: Doing so will override your current save. Export it prior to doing this.
                </div>
                <input type="file" id="save-import" />
                <div class="modal-error-msg" id="import-error"></div>
                <hr />
                <div>Reset your current progress (will refresh the page).</div>
                <div class="red">WARNING: Resets your current progress.</div>
                <button class="save-file-button" id="reset-btn" data-triggered>
                <span class="red">Reset</span> save file
                </button>
                <hr />
                <div>In case you are somehow stuck in the game, pressing this button will set Lain to the starting position (will refresh the page.)</div>
                <button class="save-file-button" id="unstuck-btn">
                <span class="orange">Unstuck</span> save file
                </button>
                <div class="modal-error-msg" id="unstuck-error"></div>
        </div>
`

const SAVE_EDITOR_HTML = `
        <div class="modal-entry editor" id="save-editor-modal">
                <div>You can modify your existing save file here.<br/><br/> This is mostly a feature meant for playtesting but I'm leaving it here in case you find it useful. 
                Some of these states are supposed to be intertwined - i.e. viewing a GaTE node always leads to a GaTE level increase. Manually changing these things (e.g. setting all nodes as viewed but keeping GaTE level to 0, etc.) may lead to unexpected bugs. 
                <span class="red">
                Use at your own risk!
                </span>
                <br/>
                <span class="red">It is strongly advised that you back up <span class="lime">(Export)</span> your save file before making any changes from here.</span></div>
                <div>Make the changes necessary, and then click "Apply Changes" to actually modify your save file.</div>
                <button class="editor-button" id="apply-editor-changes" data-triggered>Apply Changes</button>
                <div class="editor-table">
                <div class="editor-col left">
                        <div class="editor-key">SSkn Level</div>
                        <div class="editor-buttons">
                                <button class="editor-button" id="sskn-dec">-</button>
                                <div id="sskn-lvl">0</div>
                                <button class="editor-button" id="sskn-inc">+</button>
                        </div>
                        <hr class="editor-hr" />
                        <div class="editor-key">GaTE Level</div>
                        <div class="editor-buttons">
                                <button class="editor-button" id="gate-dec">-</button>
                                <div id="gate-lvl">0</div>
                                <button class="editor-button" id="gate-inc">+</button>
                        </div>
                        <hr class="editor-hr" />
                        <div class="editor-key">Final Video Viewcount</div>
                        <div class="editor-buttons">
                                <button class="editor-button" id="vc-dec">-</button>
                                <div id="vc">0</div>
                                <button class="editor-button" id="vc-inc">+</button>
                        </div>
                </div>
                <div class="editor-col">
                        <div class="editor-key">Polytan</div>
                        <div class="editor-buttons">
                                <div class="editor-polytan">
                                        <div class="editor-polytan-row">
                                                <button class="editor-button" id="poly-body-toggle"></button>
                                        </div>
                                        <div class="editor-polytan-row">
                                                <button class="editor-button" id="poly-head-toggle"></button>
                                        </div>
                                        <div class="editor-polytan-row">
                                                <button class="editor-button" id="poly-left-arm-toggle"></button>
                                        </div>
                                        <div class="editor-polytan-row">
                                                <button class="editor-button" id="poly-right-arm-toggle"></button>
                                        </div>
                                        <div class="editor-polytan-row">
                                                <button class="editor-button" id="poly-left-leg-toggle"></button>
                                        </div>
                                        <div class="editor-polytan-row">
                                                <button class="editor-button" id="poly-right-leg-toggle"></button>
                                        </div>
                                </div>
                        </div>
                        <hr class="editor-hr" />
                        <div class="editor-key">Nodes</div>
                        <div class="editor-buttons">
                                <button class="editor-button" id="view-all-nodes"><span class="lime">Mark</span> all as viewed</button>
                                <button class="editor-button" id="unview-all-nodes"><span class="red">Unmark</span> all as viewed</button>
                        </div>
                </div>
                </div>
        </div>
`

const MODAL_HTML = `
        <div id="global-modal" class="modal">
            <div class="modal-inner">
                <div class="modal-tabs">
                        <div class="modal-tab active" id="lang-bindings-tab">Language & Keybindings</div>
                        <div class="modal-tab" id="save-file-tab">Save file utilities</div>
                        <div class="modal-tab" id="save-editor-tab">Save editor</div>
                </div>
                ${LAND_AND_BINDINGS_HTML}
                ${SAVE_FILE_HTML}
                ${SAVE_EDITOR_HTML}
            </div>
        </div>
`;

const Key = {
        Left: 0,
        Right: 1,
        Up: 2,
        Down: 3,
        L1: 4,
        L2: 5,
        R1: 6,
        R2: 7,
        Circle: 8,
        Triangle: 9,
        Cross: 10,
        Square: 11,
        Select: 12,
        Start: 13,
}

const KEY_DATA = [
        { icon: "←", description: "Go left" },
        { icon: "→", description: "Go right" },
        { icon: "↑", description: "Go up" },
        { icon: "↓", description: "Go down" },
        { icon: "L1", description: "Rotate left" },
        { icon: "L2", description: "Open level selector" },
        { icon: "R1", description: "Rotate right" },
        { icon: "R2", description: "Look up/down" },
        { icon: "◯", description: "Confirm" },
        { icon: "▲", description: "Menu" },
        { icon: "✖", description: "Back" },
        { icon: "◼", description: "Display node information" },
        { icon: "SELECT", description: "Menu" },
        { icon: "START", description: "Start/Proceed" },
]

const DEFAULT_KEYBINDINGS = [
        "arrowleft", "arrowright", "arrowup", "arrowdown", "w", "e", "r", "q", "x", "d", "z", "s", "c", "v"
]

class Modal {
        constructor() {
                this.modal = null;
                this.is_open = false;
                this.create_modal();
                this.bind_events();

                const save_file = this.get_parsed_save_file()
                if (!save_file) {
                        this.editor_progress = {
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
                                viewed_nodes: [],
                        }
                } else {
                        this.editor_progress = save_file.progress
                }

                this.update_save_editor()
        }

        update_polytan_part(is_unlocked, id, name) {
                const el = document.getElementById(id)

                if (is_unlocked) {
                        el.innerHTML = `<span class="red">Lock</span> ${name}</span>`
                } else {
                        el.innerHTML = `<span class="lime">Unlock</span> ${name}</span>`
                }
        }

        update_save_editor() {
                const sskn_display = document.getElementById("sskn-lvl")
                const gate_display = document.getElementById("gate-lvl")
                const vc_display = document.getElementById("vc")

                sskn_display.innerHTML = this.editor_progress.sskn_level
                gate_display.innerHTML = this.editor_progress.gate_level
                vc_display.innerHTML = this.editor_progress.final_video_view_count

                const { body, head, left_arm, right_arm, left_leg, right_leg } = this.editor_progress.polytan_parts

                this.update_polytan_part(body, "poly-body-toggle", "Body")
                this.update_polytan_part(head, "poly-head-toggle", "Head")
                this.update_polytan_part(left_arm, "poly-left-arm-toggle", "Left Arm")
                this.update_polytan_part(right_arm, "poly-right-arm-toggle", "Right Arm")
                this.update_polytan_part(left_leg, "poly-left-leg-toggle", "Left Leg")
                this.update_polytan_part(right_leg, "poly-right-leg-toggle", "Right Leg")
        }

        create_modal() {
                document.body.insertAdjacentHTML("beforeend", MODAL_HTML);
                this.modal = document.getElementById("global-modal");

                this.keybinds_list = document.getElementById("keybinds-list")
                this.refresh_keybindings()
                this.refresh_languages()
        }

        refresh_keybindings() {
                this.keybinds_list.innerHTML = ''

                const stored_keybindings = localStorage.getItem(KEYBINDINGS_KEY);
                if (stored_keybindings) {
                        try {
                                this.keybindings = JSON.parse(stored_keybindings)
                        } catch (err) { }
                }

                if (!this.keybindings) {
                        this.keybindings = DEFAULT_KEYBINDINGS
                }

                localStorage.setItem(KEYBINDINGS_KEY, JSON.stringify(this.keybindings))

                this.keybindings.forEach((k, v) => {
                        const data = KEY_DATA[v]

                        const html = `
                        <div class="keybind">
                            <div class="keybind-button" data-key="${v}">${k}</div>
                            <div>${data.icon}</div>
                            <div>${data.description}</div>
                        </div>`

                        this.keybinds_list.insertAdjacentHTML("beforeend", html)
                })

                this.keybinds_list.insertAdjacentHTML("beforeend",
                        `
                        <div class="keybind">
                            <div>k</div>
                            <div></div>
                            <div>Upscale game window</div>
                        </div>
                        <div class="keybind">
                            <div>j</div>
                            <div></div>
                            <div>Downscale game window</div>
                        </div>
                        <div class="keybind">
                            <div>t</div>
                            <div></div>
                            <div>Show emote wheel</div>
                        </div>
                        `
                )
        }

        bind_events() {
                document.addEventListener("click", (e) => {
                        if (e.target.closest("#settings-button")) {
                                this.open();
                        }

                        if (e.target === this.modal) {
                                this.close();
                        }

                        if (e.target.closest(".language-entry")) {
                                this.handle_lang_entry_click(e)
                        }

                        if (e.target.closest(".keybind-button")) {
                                this.handle_bind_button_click(e)
                        }

                        if (e.target.closest("#export-btn")) {
                                this.handle_export_btn_click()
                        }

                        if (e.target.closest("#reset-btn")) {
                                this.handle_reset_btn_click(e)
                        }

                        if (e.target.closest("#reset-keybinds-btn")) {
                                this.handle_reset_keybinds_click(e)
                        }

                        if (e.target.closest("#unstuck-btn")) {
                                this.unstuck()
                        }

                        if (e.target.closest("#sskn-dec")) {
                                this.editor_progress.sskn_level = Math.max(this.editor_progress.sskn_level - 1, 0)
                                this.update_save_editor()
                        }

                        if (e.target.closest("#sskn-inc")) {
                                this.editor_progress.sskn_level = Math.min(this.editor_progress.sskn_level + 1, 6)
                                this.update_save_editor()
                        }

                        if (e.target.closest("#gate-dec")) {
                                this.editor_progress.gate_level = Math.max(this.editor_progress.gate_level - 1, 0)
                                this.update_save_editor()
                        }

                        if (e.target.closest("#gate-inc")) {
                                this.editor_progress.gate_level = Math.min(this.editor_progress.gate_level + 1, 4)
                                this.update_save_editor()
                        }

                        if (e.target.closest("#vc-dec")) {
                                this.editor_progress.final_video_view_count = Math.max(this.editor_progress.final_video_view_count - 1, 0)
                                this.update_save_editor()
                        }

                        if (e.target.closest("#vc-inc")) {
                                this.editor_progress.final_video_view_count = Math.min(this.editor_progress.final_video_view_count + 1, 5)
                                this.update_save_editor()
                        }

                        if (e.target.closest("#poly-body-toggle")) {
                                this.editor_progress.polytan_parts.body = !this.editor_progress.polytan_parts.body
                                this.update_save_editor()
                        }

                        if (e.target.closest("#poly-head-toggle")) {
                                this.editor_progress.polytan_parts.head = !this.editor_progress.polytan_parts.head
                                this.update_save_editor()
                        }

                        if (e.target.closest("#poly-left-arm-toggle")) {
                                this.editor_progress.polytan_parts.left_arm = !this.editor_progress.polytan_parts.left_arm
                                this.update_save_editor()
                        }

                        if (e.target.closest("#poly-right-arm-toggle")) {
                                this.editor_progress.polytan_parts.right_arm = !this.editor_progress.polytan_parts.right_arm
                                this.update_save_editor()
                        }

                        if (e.target.closest("#poly-left-leg-toggle")) {
                                this.editor_progress.polytan_parts.left_leg = !this.editor_progress.polytan_parts.left_leg
                                this.update_save_editor()
                        }

                        if (e.target.closest("#poly-right-leg-toggle")) {
                                this.editor_progress.polytan_parts.right_leg = !this.editor_progress.polytan_parts.right_leg
                                this.update_save_editor()
                        }

                        if (e.target.closest("#view-all-nodes")) {
                                this.get_all_node_ids().then(nodes => {
                                        this.editor_progress.viewed_nodes = nodes
                                })
                        }

                        if (e.target.closest("#unview-all-nodes")) {
                                this.editor_progress.viewed_nodes = []
                        }

                        if (e.target.closest("#apply-editor-changes")) {
                                this.apply_editor_changes(e)
                        }

                        const lang_bindings_modal = document.getElementById("lang-bindings-modal")
                        const save_file_modal = document.getElementById("save-file-modal")
                        const save_editor_modal = document.getElementById("save-editor-modal")

                        const lang_bindings_tab = document.getElementById("lang-bindings-tab")
                        const save_file_tab = document.getElementById("save-file-tab")
                        const save_editor_tab = document.getElementById("save-editor-tab")

                        if (e.target.closest("#lang-bindings-tab")) {
                                lang_bindings_modal.style.display = 'flex'
                                save_editor_modal.style.display = 'none'
                                save_file_modal.style.display = 'none'

                                document.querySelectorAll(".modal-tab").forEach(entry => {
                                        entry.classList.remove("active");
                                });

                                lang_bindings_tab.classList.add('active')
                        }

                        if (e.target.closest("#save-file-tab")) {
                                lang_bindings_modal.style.display = 'none'
                                save_file_modal.style.display = 'flex'
                                save_editor_modal.style.display = 'none'

                                document.querySelectorAll(".modal-tab").forEach(entry => {
                                        entry.classList.remove("active");
                                });

                                save_file_tab.classList.add('active')
                        }

                        if (e.target.closest("#save-editor-tab")) {
                                lang_bindings_modal.style.display = 'none'
                                save_file_modal.style.display = 'none'
                                save_editor_modal.style.display = 'flex'

                                document.querySelectorAll(".modal-tab").forEach(entry => {
                                        entry.classList.remove("active");
                                });

                                save_editor_tab.classList.add('active')
                        }
                });

                document.addEventListener("keydown", (e) => {
                        if (this.is_open) {
                                this.handle_keydown(e.key)
                        }
                });

                document.getElementById("save-import").addEventListener("change", (e) => {
                        const file = e.target.files[0];
                        if (file) {
                                this.import_save(file)
                        }
                });
        }

        apply_editor_changes(e) {
                const btn = e.target.closest("#apply-editor-changes");

                const is_triggered = btn.dataset.triggered === "true"
                if (is_triggered) {
                        const parsed = this.get_parsed_save_file()
                        if (!parsed) {
                                localStorage.setItem(SAVE_KEY, JSON.stringify(
                                        {
                                                site: "a",
                                                a_location: {
                                                        site_kind: "a",
                                                        level: 4,
                                                        node_matrix_position: {
                                                                row: 1,
                                                                col: 0,
                                                        },
                                                        site_segment: 6,
                                                },
                                                b_location: {
                                                        site_kind: "b",
                                                        level: 1,
                                                        node_matrix_position: {
                                                                row: 2,
                                                                col: 0,
                                                        },
                                                        site_segment: 5,
                                                },
                                                name: "",
                                                progress: this.editor_progress,
                                        }
                                ));
                        } else {
                                localStorage.setItem(SAVE_KEY, JSON.stringify(
                                        {
                                                ...parsed,
                                                progress: this.editor_progress
                                        }
                                ));
                        }

                        location.reload();
                } else {
                        btn.dataset.triggered = true
                        btn.innerText = "Are you sure? (Click again if yes)"
                }
        }

        async get_all_node_ids() {
                try {
                        const [a_req, b_req] = await Promise.all([
                                fetch('/json/site_a.json'),
                                fetch('/json/site_b.json')
                        ]);

                        const [a, b] = await Promise.all([
                                a_req.json(),
                                b_req.json()
                        ]);

                        const all_ids = []
                        for (const layout of [a, b]) {
                                for (const level of layout) {
                                        for (const row of level) {
                                                for (const node of row) {
                                                        if (node && node.id) {
                                                                all_ids.push(node.id)
                                                        }
                                                }
                                        }
                                }
                        }

                        return all_ids;
                } catch (err) {
                        console.error(err);
                }
        }

        get_save_file() {
                const save = localStorage.getItem(SAVE_KEY)
                if (save === null || save === "null" || save === undefined || save.trim() === "") {
                        return null;
                }

                return save
        }

        get_parsed_save_file() {
                const save_file = this.get_save_file()
                if (!save_file) {
                        return null;
                }

                try {
                        return JSON.parse(save_file);
                } catch (err) {
                        console.error(err)
                }

                return null
        }

        unstuck() {
                const save = this.get_save_file()
                if (save === null) {
                        return;
                }

                const parsed = this.get_parsed_save_file()
                if (!parsed) {
                        const elem = document.getElementById("unstuck-error")
                        elem.style.display = "block"
                        elem.innerText = "ERROR: failed to unstuck save file."
                } else {
                        const json = {
                                ...parsed,
                                progress: parsed.progress,
                                a_location: {
                                        site_kind: "a",
                                        level: 4,
                                        node_matrix_position: {
                                                row: 1,
                                                col: 0,
                                        },
                                        site_segment: 6,

                                },
                                b_location: {
                                        site_kind: "b",
                                        level: 1,
                                        node_matrix_position: {
                                                row: 2,
                                                col: 0,
                                        },
                                        site_segment: 5,
                                }
                        };

                        localStorage.setItem(SAVE_KEY, JSON.stringify(json));

                        location.reload()
                }
        }

        set_keybindings(keybindings) {
                this.keybindings = keybindings
                localStorage.setItem(KEYBINDINGS_KEY, keybindings)
                this.refresh_keybindings()

                window.dispatchEvent(new CustomEvent('updatekeybindings'));
        }

        handle_reset_keybinds_click() {
                this.set_keybindings(DEFAULT_KEYBINDINGS.slice())
        }

        refresh_languages() {
                document.querySelectorAll(".language-entry").forEach(entry => {
                        entry.classList.remove("active");
                });

                const language = localStorage.getItem(LANG_KEY)

                let found = false
                if (language) {
                        const el = document.getElementById(`lang-${language}`)
                        if (el) {
                                found = true
                                el.classList.add('active')
                        }
                }

                if (!found) {
                        localStorage.setItem(LANG_KEY, "en")
                        document.getElementById('lang-en').classList.add('active')
                }
        }

        handle_lang_entry_click(e) {
                const clicked_entry = e.target.closest(".language-entry");
                const lang_code = clicked_entry.dataset.lang;
                localStorage.setItem(LANG_KEY, lang_code)
                this.refresh_languages()
                window.dispatchEvent(new CustomEvent('updatelanguage'));
        }

        handle_bind_button_click(e) {
                const clicked_entry = e.target.closest(".keybind-button");

                document.querySelectorAll(".keybind-button").forEach(entry => {
                        entry.classList.remove("active");
                        entry.innerText = this.keybindings[parseInt(entry.dataset.key)]
                });

                clicked_entry.classList.add("active");
                clicked_entry.innerText = "> press a button <"
                this.selected_key = clicked_entry.dataset.key
        }

        handle_export_btn_click() {
                const save = this.get_save_file()
                if (save === null) {
                        const elem = document.getElementById("export-error")
                        elem.style.display = "block"
                        elem.innerText = "ERROR: no save found."
                        return;
                }

                const blob = new Blob([save], { type: "application/json" });

                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;

                const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
                link.download = `lainTSX-save-${timestamp}.json`;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(url);
        }

        handle_reset_btn_click(e) {
                const btn = e.target.closest("#reset-btn");
                const is_triggered = btn.dataset.triggered === "true"

                if (is_triggered) {
                        localStorage.removeItem(SAVE_KEY)
                        location.reload();
                } else {
                        btn.dataset.triggered = true
                        btn.innerText = "Are you sure? (Click again if yes)"
                }
        }

        handle_keydown(key) {
                if (this.selected_key !== undefined) {
                        if (key !== "Escape") {
                                for (const [i, value] of this.keybindings.entries()) {
                                        if (value === key.toLowerCase()) {
                                                this.keybindings[i] = ''
                                        }
                                }

                                this.keybindings[this.selected_key] = key.toLowerCase()
                        }

                        this.set_keybindings(this.keybindings)

                        this.selected_key = undefined;
                }
                else if (key === "Escape") { this.close() }
        }

        import_save(file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                        try {
                                const parsed = JSON.parse(e.target.result);

                                // heuristic to check whether it's a legacy save file
                                if (parsed.siteSaveState) {
                                        localStorage.setItem(LEGACY_SAVE_KEY, JSON.stringify(parsed))
                                } else {
                                        localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
                                }

                                location.reload();
                        } catch (err) {
                                const elem = document.getElementById("import-error")
                                elem.style.display = "block"
                                elem.innerText = "ERROR: invalid save."
                        }
                };
                reader.readAsText(file);
        }

        open() {
                this.modal.style.display = "flex";
                this.modal.classList.add("show");
                document.body.style.overflow = "hidden";
                this.is_open = true;

                window.dispatchEvent(new CustomEvent('opensettings'));
        }

        close() {
                this.modal.style.display = "none";
                this.modal.classList.remove("show");
                document.body.style.overflow = "auto";
                this.is_open = false;

                window.dispatchEvent(new CustomEvent('closesettings'));
        }
}

if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => new Modal());
} else {
        new Modal();
}
