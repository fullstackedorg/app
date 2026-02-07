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
    run
};

export const aliases: Record<string, string> = {
    npm: "packages"
};
