const { nodeExternalsPlugin } = require('esbuild-node-externals')
const { dtsPlugin } = require('esbuild-plugin-d.ts')

module.exports = {
  outDir: './dist',
  esbuild: {
    bundle: true,
    sourcemap: true,
    minify: true,
    splitting: true,
    format: 'cjs',
    target: ['node14'],
    tsconfig: 'tsconfig.json',
    plugins: [nodeExternalsPlugin(), dtsPlugin({ tsconfig: 'tsconfig.json' })],
  },
  assets: {
    baseDir: 'src',
    outDir: './dist',
  },
}
