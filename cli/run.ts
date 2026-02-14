// @ts-ignore
import r from "run";
import type RunType from "../../core/internal/bundle/lib/run";
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
        const target = args[0] || ".";

        try {
            await runFn(target);
            (document.activeElement as HTMLElement)?.blur?.();
        } catch (e) {
            shell.writeln(`run: ${e.message}`);
            return 1;
        }

        return 0;
    }
};
