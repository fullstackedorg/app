// @ts-ignore
import r from "run";
import type RunType from "../../core/internal/bundle/lib/run";
import path from "path";
import { Shell } from "../shell";
import { Command } from "./types";

const runFn: typeof RunType = r;

export const run: Command = {
    name: "run",
    description: "Run the project",
    execute: async (
        args: string[],
        shell: Shell,
        onCancel: (handler: () => void) => void
    ) => {
        const dest = args[0] || ".";
        const target = path.resolve(process.cwd(), dest);
        try {
            await runFn(target);
        } catch (e) {
            shell.writeln(`run: ${e.message}`);
        }
    }
};
