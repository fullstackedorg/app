import { Command } from "./types";
import { ls } from "./ls";
import { cat } from "./cat";
import { cd } from "./cd";
import { clear } from "./clear";
import { mkdir } from "./mkdir";
import { rm } from "./rm";

export const commands: Record<string, Command> = {
    ls,
    cat,
    cd,
    clear,
    mkdir,
    rm
};
