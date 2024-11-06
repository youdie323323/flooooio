import * as esbuild from 'esbuild';

async function watch() {
  let ctx = await esbuild.context({
    entryPoints: ['./client/main.ts'],
    bundle: true,
    minify: true,
    outfile: './server/public/client.js',
  })
  
  await ctx.watch();
}

// IMPORTANT: this call MUST NOT have an `await`.
watch();