// @ts-ignore
import p from "packages";
import type PackagesType from "../../core/internal/bundle/lib/packages/index.ts";
import { parseArgs, getDirectory } from "./utils.ts";
import { Command } from "./types";
import { Shell } from "../shell";

const packagesLib: typeof PackagesType = p;

function formatProgress(progress: any): string {
    if (Array.isArray(progress)) {
        return progress.map(formatProgress).join("\n");
    }
    const parts = [];
    if (progress.stage) parts.push(`[${progress.stage}]`);
    if (progress.name) parts.push(progress.name);
    if (progress.version) parts.push(`@${progress.version}`);
    if (progress.progress !== undefined)
        parts.push(`(${Math.round(progress.progress * 100)}%)`);
    return parts.join(" ");
}

export const packages: Command = {
    name: "npm",
    description: "Manage packages",
    execute: async (args: string[], shell: Shell) => {
        const command = args[0];
        const { flags, positionals } = parseArgs(args.slice(1));
        const directory = getDirectory(flags);

        switch (command) {
            case "install":
                // install [-D/--save-dev] [packages...]
                const saveDev = !!(flags["D"] || flags["save-dev"]);

                // packages.install returns a Promise that resolves to an EventEmitter.
                // We probably want to listen to events or something, but the lib signature says:
                // Promise<EventEmitter<{ "progress": Progress[] }>>

                const emitter = await packagesLib.install(
                    directory,
                    saveDev,
                    ...positionals
                );

                // Listen to progress?
                emitter.on("progress", (progress) => {
                    // Format progress?
                    shell.writeln(formatProgress(progress));
                });

                await emitter.duplex.promise();
                break;
            case "uninstall":
                // uninstall [packages...]
                const uninstallEmitter = await packagesLib.uninstall(
                    directory,
                    ...positionals
                );
                uninstallEmitter.on("progress", (progress) => {
                    shell.writeln(formatProgress(progress));
                });
                await uninstallEmitter.duplex.promise();
                break;
            case "audit":
                // audit
                const securityAudit = await packagesLib.audit(directory);
                shell.writeln(JSON.stringify(securityAudit, null, 2));
                break;
            default:
                shell.writeln(`Unknown packages command: ${command}`);
        }
    }
};
