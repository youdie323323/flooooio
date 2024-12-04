import * as esbuild from 'esbuild';
import { readFileSync, rm, writeFileSync } from 'fs';
import JsConfuser from 'js-confuser';
import { confirm } from '@inquirer/prompts';

const prebuildedFileName = './prebuilded-' + Date.now() + '.js';

async function watch() {
  const answers = await confirm({
    message: "Obfuscate bundled javascript?",
  });

  const obfuscateEnabled = !!answers;

  await esbuild.build({
    entryPoints: ['./client/main.ts'],
    bundle: true,
    minify: true,
    outfile: obfuscateEnabled ? prebuildedFileName : "./server/public/client.js",
    legalComments: "none",
    plugins: [
      {
        name: 'watch-client-only',
        setup(build) {
          build.onEnd(async (result) => {
            console.clear();

            if (obfuscateEnabled) {
              console.log('Builded, start obfuscate with js-confuser');

              JsConfuser.obfuscate(readFileSync(prebuildedFileName, "utf-8"), {
                target: 'browser',
                preset: 'low',
                verbose: true,
                compact: true,

                stringCompression: false,
                stringConcealing: false,

                shuffle: false,
                globalConcealing: false,
                controlFlowFlattening: false,

                opaquePredicates: true,

                variableMasking: true,

                // Disable anti bandwidth transformers
                identifierGenerator: "mangled",
                hexadecimalNumbers: false,
                deadCode: false,
                stringEncoding: false,
              }).then(result => {
                writeFileSync("./server/public/client.js", result.code);
                rm(prebuildedFileName, () => { });

                console.log('Ofsucated');
              });
            } else {
              console.log('Builded');
            }
          })
        }
      },
    ],
  })
}

// IMPORTANT: this call MUST NOT have an `await`.
watch();