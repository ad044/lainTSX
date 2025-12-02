import { get_user_language } from "./engine";

export function get_media_element(): HTMLMediaElement {
    return document.getElementById("media") as HTMLMediaElement;
}

export function get_audio_media_file_path(media_file: string): string {
    return `/media/audio/${media_file}.mp4`;
}

export function get_video_media_file_path(media_file: string): string {
    return `/media/movie/${media_file}.mp4`;
}

export function get_track_path(node_name: string): string {
    return `/webvtt/${get_user_language().code}/${node_name}.vtt`;
}

export function get_voice_syllable_path(syllable: string): string {
    return `/voice/${syllable}.mp4`;
}

export class MediaPlayer {
    media_el: HTMLMediaElement;
    track_el: HTMLTrackElement;
    subtitle_el: HTMLParagraphElement;
    current_text_track: TextTrack | null = null;
    bound_cue_change: (e: any) => void;

    constructor(media_src?: string, track_src?: string) {
        this.media_el = get_media_element();
        this.track_el = document.getElementById("track") as HTMLTrackElement;
        this.subtitle_el = document.getElementById("subtitle") as HTMLParagraphElement;
        this.bound_cue_change = this.handle_cue_change.bind(this);

        this.media_el.textTracks.addEventListener("addtrack", (e) => {
            const track = e.track;
            if (track) {
                track.mode = "hidden";
                track.addEventListener("cuechange", this.bound_cue_change);
                this.current_text_track = track;
            }
        });

        if (media_src) {
            this.load(media_src, track_src);
        }
    }

    is_paused(): boolean {
        return this.media_el.paused;
    }

    reset_and_pause(): void {
        this.media_el.pause();
        this.media_el.currentTime = 0;
        this.subtitle_el.style.visibility = "hidden";
    }

    handle_cue_change(event: any): void {
        const track = event.target;
        const { activeCues } = track;

        if (activeCues && activeCues.length > 0) {
            this.subtitle_el.textContent = (activeCues[0] as VTTCue).text;
        } else {
            this.subtitle_el.textContent = "";
        }
    }

    load(media_src: string, track_src?: string): void {
        if (this.current_text_track) {
            this.current_text_track.removeEventListener("cuechange", this.bound_cue_change);
            this.current_text_track = null;
        }

        if (this.track_el.parentNode) {
            this.track_el.parentNode.removeChild(this.track_el);
            this.subtitle_el.textContent = "";
        }

        this.media_el.src = media_src;
        this.media_el.load();
        this.reset_and_pause();

        this.track_el = document.createElement("track");
        this.track_el.id = "track";
        this.track_el.kind = "subtitles";
        this.track_el.default = true;

        if (track_src) {
            this.track_el.src = track_src;
        }

        this.media_el.appendChild(this.track_el);
    }

    play(): Promise<void> {
        this.subtitle_el.style.visibility = "visible";
        return this.media_el.play();
    }

    get_elapsed_percentage(): number {
        if (this.media_el.readyState >= 1 && this.media_el.duration > 0) {
            const pct = (this.media_el.currentTime / this.media_el.duration) * 100;
            return Math.min(100, Math.round(pct));
        }

        return 0;
    }

    log_error(err: any): void {
        console.error(
            `failed to play media ${this.media_el.src} ${
                this.track_el.src ? `(track: ${this.track_el.src})` : ""
            }\n${err}`
        );
    }
}
