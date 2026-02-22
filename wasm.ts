import fs from "fs";

await Promise.all([
    fs.promises.cp(
        "node_modules/@esm.sh/oxide-wasm/pkg/oxide_wasm_bg.wasm",
        "oxide_wasm_bg.wasm"
    ),
    fs.promises.cp(
        "node_modules/lightningcss-wasm/lightningcss_node.wasm",
        "lightningcss_node.wasm"
    ),
    fs.promises.cp("node_modules/tailwindcss", "tailwindcss", {
        recursive: true
    })
]);

process.exit(0);
