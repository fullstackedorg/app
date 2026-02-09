import { Command } from "./types";
import { ls } from "./ls";
import { cat } from "./cat";
import { cd } from "./cd";
import { clear } from "./clear";
import { mkdir } from "./mkdir";
import { rm } from "./rm";
import { git } from "./git";
import { packages } from "./packages";
import { bundle } from "./bundle";
import { run } from "./run";
import { exec } from "./exec";
import { npm } from "./npm";

export const commands: Record<string, Command> = {
    ls,
    cat,
    cd,
    clear,
    mkdir,
    rm,
    git,
    packages,
    bundle,
    run,
    exec,
    npm
};

export const aliases: Record<string, string> = {
    node: "exec",
    "npx fullstacked": "bundle && run"
};
