import * as esbuild from 'esbuild';
import { readFileSync, rm, writeFileSync } from 'fs';
import JsConfuser from 'js-confuser';

// They didnt add "do" and "with" to reserved keywords
const reservedKeywords = [
  "if",
  "in",
  "for",
  "let",
  "new",
  "try",
  "var",
  "case",
  "else",
  "null",
  "break",
  "catch",
  "class",
  "const",
  "super",
  "throw",
  "while",
  "yield",
  "delete",
  "export",
  "import",
  "public",
  "return",
  "switch",
  "default",
  "finally",
  "private",
  "continue",
  "debugger",
  "function",
  "arguments",
  "protected",
  "instanceof",
  "await",
  "async",

  // new key words and other fun stuff :P
  "NaN",
  "undefined",
  "true",
  "false",
  "typeof",
  "this",
  "static",
  "void",
  "of",

  "do",
  "with",
];

function alphabeticalGenerator(index) {
  let name = "";
  while (index > 0) {
    var t = (index - 1) % 52;
    var thisChar =
      t >= 26 ? String.fromCharCode(65 + t - 26) : String.fromCharCode(97 + t);
    name = thisChar + name;
    index = ((index - t) / 52) | 0;
  }
  if (!name) {
    name = "_";
  }
  return name;
}

let counter = 1;

const prebuildedFileName = './prebuilded-' + Date.now() + '.js';

async function watch() {
  let ctx = await esbuild.context({
    entryPoints: ['./client/main.ts'],
    bundle: true,
    minify: true,
    outfile: prebuildedFileName,
    plugins: [
      {
        name: 'watch-client-only',
        setup(build) {
          build.onEnd(async (result) => {
            console.clear();

            console.log('Builded, start obfuscate with js-confuser');

            JsConfuser.obfuscate(readFileSync(prebuildedFileName, "utf-8"), {
              target: 'browser',
              preset: 'low',
              verbose: true,
              compact: true,

              // Disable shits
              stringCompression: false,
              stringConcealing: false,
              shuffle: false,
              controlFlowFlattening: false,

              globalConcealing: true,
              opaquePredicates: true,

              // Disable anti bandwidth transformers
              identifierGenerator: () => {
                let mangledName = "";
                do {
                  mangledName = alphabeticalGenerator(counter++);
                } while (reservedKeywords.includes(mangledName));
                return mangledName;
              },
              hexadecimalNumbers: false,
              deadCode: false,
              stringEncoding: false,
            }).then(result => {
              writeFileSync("./server/public/client.js", result.code);
              rm(prebuildedFileName, () => { });

              console.log('Ofsucated');
            });
          })
        }
      },
    ],
  })

  await ctx.watch();
}

// IMPORTANT: this call MUST NOT have an `await`.
watch();