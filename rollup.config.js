import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
// import { nodeResolve } from "@rollup/plugin-node-resolve";

export default [
  {
    input: "src/cli/index.ts",
    output: {
      dir: "dist",
      format: "cjs",
    },
    plugins: [typescript(), commonjs()],
  },
];
