import { Command } from "./types";
import { Shell } from "../shell";

export const clear: Command = {
    name: "clear",
    execute: (args: string[], shell: Shell) => {
        shell.clear();
    }
};
