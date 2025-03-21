import * as esbuild from 'esbuild';
import { readFileSync, rm, writeFileSync } from 'fs';
import { readFile } from 'fs/promises';
import JsConfuser from 'js-confuser';
import { confirm } from '@inquirer/prompts';
import { optimize } from "svgo";

const prebuildedFileName = './prebuilded-' + Date.now() + '.js';

async function watch() {
    const obfuscateEnabled = await confirm({
        message: "Obfuscate bundled javascript?",
        default: false,
    });

    await esbuild.build({
        entryPoints: ['./Sources/Client/Main.ts'],
        bundle: true,
        minify: true,
        outfile: obfuscateEnabled ? prebuildedFileName : "./build/statics/client.js",
        legalComments: "none",
        tsconfig: "./tsconfig.json",
        loader: { ".svg": "text" },
        plugins: [
            {
                name: "svgo",
                setup({ onLoad }) {
                    onLoad({ filter: /\.svg$/ }, async args => {
                        const raw = await readFile(args.path, "utf-8");
                        const { data: contents } = optimize(raw);

                        return { contents, loader: "default" };
                    });
                },
            },
            {
                name: 'watch-client-only',
                setup(build) {
                    build.onEnd(async result => {
                        if (obfuscateEnabled) {
                            console.log('Builded, starts obfuscate with js-confuser...');

                            JsConfuser.obfuscate(readFileSync(prebuildedFileName, "utf-8"), {
                                target: 'browser',
                                preset: 'low',
                                verbose: true,
                                compact: true,

                                stringEncoding: false,
                                stringCompression: false,
                                stringConcealing: false,

                                shuffle: false,
                                controlFlowFlattening: false,
                                globalConcealing: false,

                                opaquePredicates: true,
                                variableMasking: true,

                                // Disable anti bandwidth transformers
                                identifierGenerator: "mangled",
                                hexadecimalNumbers: false,
                                deadCode: false,
                            }).then(result => {
                                writeFileSync("./build/statics/client.js", result.code);
                                rm(prebuildedFileName, () => { });

                                console.log('Ofsucated');
                            });
                        } else {
                            console.log('Builded');
                        }
                    });
                },
            },
        ],
    });
}

// IMPORTANT: this call MUST NOT have an `await`.
watch();