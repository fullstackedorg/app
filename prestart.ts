import fs from "fs";
import git from "fullstacked/git";
import packageJson from "./package.json";

await Promise.all([
    fs.promises.cp(
        "node_modules/oxide-wasm/pkg/oxide_wasm_bg.wasm",
        "out/oxide_wasm_bg.wasm"
    ),
    fs.promises.cp(
        "node_modules/lightningcss-wasm/lightningcss_node.wasm",
        "out/lightningcss_node.wasm"
    ),
    fs.promises.cp("node_modules/tailwindcss", "out/tailwindcss", {
        recursive: true
    })
]);

const head = await git.head(process.cwd());
fs.writeFileSync(
    "out/.build",
    `${packageJson.version}, branch ${head.branch}, hash ${head.hash.slice(0, 8)}`
);

process.exit(0);
