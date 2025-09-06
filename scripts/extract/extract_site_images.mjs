import { spawnSync } from "child_process";
import { readFileSync, mkdirSync, writeFileSync, copyFile } from "fs";
import { join, resolve } from "path";
import LainCompress from "./lain_compress.js";

export function extract_site_images(tempdir, jpsxdec_jar) {
  for (const [disc, site] of ["A", "B"].entries()) {
    spawnSync(
      "java",
      [
        "-jar",
        jpsxdec_jar,
        "-x",
        join(tempdir, `disc${disc + 1}.idx`),
        "-i",
        `SITE${site}.BIN`,
        "-dir",
        tempdir,
      ],
      { stdio: "inherit" }
    );
    const site_images = JSON.parse(readFileSync(`site_${site}_images.json`));

    let image_data = readFileSync(join(tempdir, `SITE${site}.BIN`));
    let output_folder = join("..", "..", "src", "static", "images", site.toLowerCase());

    mkdirSync(output_folder, { recursive: true });

    for (let [index, image] of site_images.entries()) {
      if (image.skip) continue;
      let compressed_data = image_data.slice(
        image.offset + 4,
        image.offset + image.size
      );
      let tim_file = resolve(join(tempdir, `${index}.tim`));
      let decompressed_data = new LainCompress().decode(compressed_data);
      writeFileSync(tim_file, decompressed_data);
      spawnSync(
        "java",
        ["-jar", jpsxdec_jar, "-f", tim_file, "-static", "tim"],
        { stdio: "inherit", cwd: tempdir }
      );
      copyFile(
        join(tempdir, `${index}_p0.png`),
        join(output_folder, `${index}.png`),
        (err) => {
          if (err) { console.log("Error Found:", err); }
        }
      );
    }
  }
}
