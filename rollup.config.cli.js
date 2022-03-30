import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";

export default [
  {
    input: "src/cli/index.ts",
    output: {
      file: "bin/app.js",
      format: "cjs",
    },
    plugins: [typescript(), commonjs()],
  },
];
