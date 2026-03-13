import { Command } from "./types";
import { Shell } from "../shell";
import path from "path";
import fs from "fs";
import { formatMessage } from "./bundle";
import { Worker } from "worker_threads";
import bundleLib from "fullstacked/bundle";

export const exec: Command = {
    name: "exec",
    execute: async (
        args: string[],
        shell: Shell,
        onCancel: (handler: () => void) => void
    ) => {
        // remove flags
        args = args.filter((a) => !a.startsWith("--"));
        const file = args.at(0);
        const filePath = path.join(process.cwd(), file);

        const result = await bundleLib.bundleFile(filePath);
        result.Warnings?.forEach((w) => shell.writeln(formatMessage(w)));
        if (result.Errors?.length > 0) {
            result.Errors.forEach((e) => shell.writeln(formatMessage(e)));
        } else {
            const cleanup = () => fs.promises.rm(result.OutputFiles.at(0));
            const worker = new Worker(result.OutputFiles.at(0));
            onCancel(() => {
                cleanup();
                worker.terminate();
            });
            return new Promise((res) => {
                worker.once("exit", () => cleanup().then(res));
            });
        }
    }
};
