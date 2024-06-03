import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
{
  input: 'src/webpeerjs.js',
  output: [
    {
      file: 'dist/esm/webpeerjs.js',
      format: 'es',
    }
  ],
  //plugins: [nodeResolve({browser: true}), commonjs()]
},
/*{
  input: 'src/webpeerjs.js',
  output: [
    {
      file: 'dist/cjs/webpeerjs.js',
      format: 'cjs',
    }
  ],
  //plugins: [nodeResolve({browser: true}), commonjs()]
},*/
{
  input: 'src/umd.js',
  output: [
    {
      file: 'dist/umd/webpeerjs.js',
      format: 'umd',
      name: 'webpeerjs',
    }
  ],
  plugins: [nodeResolve({browser: true}), commonjs()]
}
]