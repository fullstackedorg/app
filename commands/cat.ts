
import { Command } from "./types";
import { Shell } from "../shell";
import fs from "fs";

export const cat: Command = {
    name: "cat",

    execute: async (args: string[], shell: Shell) => {
        const file = args[0];
        if (!file) {
            shell.writeln("Usage: cat <filename>");
            return;
        }
        try {
            const data = await fs.promises.readFile(file, "utf8");
            shell.write(data.replace(/\n/g, '\r\n'));
        } catch (e: any) {
            shell.writeln(e.message);
        }
    }
}
