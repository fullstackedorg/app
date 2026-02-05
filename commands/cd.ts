
import { Command } from "./types";
import { Shell } from "../shell";
import path from "path";
import fs from "fs";

export const cd: Command = {
    name: "cd",

    execute: async (args: string[], shell: Shell) => {
        const dest = args[0] || "/";
        const target = path.resolve(process.cwd(), dest);
        console.log(dest, target)
        try {
            const stats = await fs.promises.stat(target);
            if (!stats.isDirectory()) {
                shell.writeln(`cd: not a directory: ${dest}`);
                return;
            }
            process.chdir(target);
        } catch (e: any) {
            if (e.code === "ENOENT") {
                shell.writeln(`cd: no such file or directory: ${dest}`);
            } else {
                shell.writeln(e.message);
            }
        }
    }
}
