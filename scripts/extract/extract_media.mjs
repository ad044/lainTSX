import { spawnSync, spawn } from "child_process";
import { mkdirSync, readdirSync, rmSync } from "fs";
import { join } from "path";

export function extract_video(tempdir, jpsxdec_jar, no_delete) {
  // extract all video
  for (const disc_index of ["disc1.idx", "disc2.idx"]) {
    spawnSync(
      "java",
      [
        "-jar",
        jpsxdec_jar,
        "-x",
        join(tempdir, disc_index),
        "-a",
        "video",
        "-dir",
        tempdir,
        "-quality",
        "high",
        "-vf",
        "avi:jyuv",
        "-up",
        "Lanczos3",
      ],
      { stdio: "inherit" }
    );
  }

  const output_movie_folder = join(
    "..",
    "..",
    "src",
    "static",
    "media",
    "movie"
  );

  // create destination folder
  mkdirSync(output_movie_folder, { recursive: true });

  // convert all movies to mp4
  for (const movieDir of ["MOVIE", "MOVIE2"]) {
    for (let file of readdirSync(`${join(tempdir, movieDir)}`)) {
      if (file.endsWith(".wav")) continue;
      spawnSync(
        "ffmpeg",
        [
          "-i",
          join(tempdir, movieDir, file),
          "-pix_fmt",
          "yuv420p",
          "-n",
          "-filter:v",
          "zscale=dither=error_diffusion:filter=lanczos:rin=full:r=limited:tin=601:t=709:min=470bg:m=709:pin=170m:p=709:cin=center:c=left",
          "-crf",
          "15",
          "-preset",
          "veryslow",
          "-level",
          "31",
          "-ar",
          "44100",
          "-b:a",
          "192k",
          join(output_movie_folder, file.replace("avi", "mp4")),
        ],
        { stdio: "inherit" }
      );
    }
  }

  if (!no_delete) {
    // cleanup source folders
    rmSync(join(tempdir, "MOVIE"), { recursive: true });
    rmSync(join(tempdir, "MOVIE2"), { recursive: true });
  }
}

export function extract_audio(tempdir, jpsxdec_jar, no_delete) {
  // extract all audio
  for (const disc_index of ["disc1.idx", "disc2.idx"]) {
    spawnSync(
      "java",
      [
        "-jar",
        jpsxdec_jar,
        "-x",
        join(tempdir, disc_index),
        "-a",
        "audio",
        "-dir",
        tempdir,
      ],
      { stdio: "inherit" }
    );
  }

  const output_audio_folder = join(
    "..",
    "..",
    "src",
    "static",
    "media",
    "audio"
  );

  // create destination folder
  mkdirSync(output_audio_folder, { recursive: true });

  // convert all audio to mp4
  for (let file of readdirSync(`${join(tempdir, "XA")}`)) {
    spawnSync("ffmpeg", [
      "-i",
      join(tempdir, "XA", file),
      "-n",
      "-ar",
      "44100",
      "-b:a",
      "192k",
      join(output_audio_folder, file.replace("wav", "mp4")),
    ], {stdio:'inherit'});
  }

  if (!no_delete) {
    // cleanup source folder
    rmSync(join(tempdir, "XA"), { recursive: true });
  }
}
