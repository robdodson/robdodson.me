const fs = require('fs');
const {join} = require('path');

// A Rollup plugin which locates modules using the Node resolution algorithm,
// for using third party modules in node_modules
const {nodeResolve} = require('@rollup/plugin-node-resolve');

// A Rollup plugin to convert CommonJS modules to ES6, so they can be included
// in a Rollup bundle
const commonjs = require('@rollup/plugin-commonjs');

// A Rollup plugin to minify generated ES bundles. Uses terser under the hood.
const {terser} = require('rollup-plugin-terser');

// Each page type has an entrypoint js file which imports all of the custom
// elements for that page. Most pages use the default.js entrypoint, but some
// pages like /measure, /newsletter, etc. are special and require additional
// elements.
const pagesDir = './src/js/pages/';
const pages = fs.readdirSync(pagesDir, 'utf-8').map((p) => join(pagesDir, p));

// Plugins that are common to every bundle.
const plugins = [
  nodeResolve(),
  commonjs(),
];

const devConfig = {
  input: [...pages],
  output: {
    dir: 'dist/js',
    format: 'esm',
  },
  watch: {
    // By default rollup clears the console on every build. This disables that.
    clearScreen: false,
  },
  plugins,
};

const productionConfig = {
  input: [...pages],
  output: {
    dir: 'dist/js',
    format: 'esm',
  },
  plugins: [
    ...plugins,
    terser({
      format: {
        // Remove all comments, including @license comments,
        // otherwise LHCI complains at us.
        comments: false,
      },
    }),
  ],
};

/**
 * Determine which rollup config to return based on the environment.
 *
 * Note: You can also pass custom command line arguments to rollup if they're
 * prefixed with `config*`.
 *
 * Example: rollup -c --configFoo  # sets commandLineArgs.configFoo to true
 *
 * The commandLineArgs argument gets passed to this function, but we're omitting
 * it here because we don't use it.
 * Learn more @ https://rollupjs.org/guide/en/
 */
 export default () => {
  if (process.env.NODE_ENV === 'production') {
    return productionConfig;
  }

  return devConfig;
};
