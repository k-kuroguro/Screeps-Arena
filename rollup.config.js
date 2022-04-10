import fs from 'fs';
import typescript from '@rollup/plugin-typescript';

const dirs = fs
   .readdirSync('./src', { withFileTypes: true })
   .filter(dir => dir.isDirectory());

const options = dirs.map(dir => (
   {
      input: `./src/${dir.name}/main.ts`,
      external: ["game", "game/prototypes", "game/constants", "game/utils", "game/path-finder", "arena"],
      output: {
         dir: `./dist/${dir.name}`,
         format: 'esm',
         entryFileNames: '[name].mjs',
         sourcemap: false,
         paths: path => path.match(/^(game|arena)/) ? `/${path}` : undefined
      },
      plugins: [
         typescript({ tsconfig: './tsconfig.json' })
      ]
   }
));

export default options;
