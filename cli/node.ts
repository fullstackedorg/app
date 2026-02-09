import { Command } from "./types";
import { Shell } from "../shell";
import path from "path";
import { bundleLib, formatMessage } from "./bundle";

export const node: Command = {
    name: "node",
    execute: async (
        args: string[],
        shell: Shell,
        onCancel: (handler: () => void) => void
    ) => {
        const file = args.at(0);
        const filePath = path.join(process.cwd(), file);

        const result = await bundleLib.bundle(filePath);
        result.Warnings?.forEach((w) => shell.writeln(formatMessage(w)));
        result.Errors?.forEach((e) => shell.writeln(formatMessage(e)));

        const builtFile = "_" + path.basename(filePath) + ".js";
        const builtFilePath = path.join(process.cwd(), builtFile);

        new Worker(builtFilePath, { type: "module" });
    }
};
