import gltf from "vite-plugin-gltf";
import glsl from "vite-plugin-glsl";
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default {
        plugins: [
                gltf(),
                glsl(),
                viteStaticCopy({
                        targets: [
                                {
                                        src: 'src/static/json/site_a.json',
                                        dest: 'json'
                                },
                                {
                                        src: 'src/static/json/site_b.json',
                                        dest: 'json'
                                }
                        ]
                })
        ],
        build: {
                rollupOptions: {
                        input: {
                                main: resolve(__dirname, 'index.html'),
                                game: resolve(__dirname, 'game.html'),
                                guide: resolve(__dirname, 'guide.html'),
                                notes: resolve(__dirname, 'notes.html'),
                        }
                }
        }
};