// @ts-ignore
import p from "packages";
import type PackagesType from "../../core/internal/bundle/lib/packages/index.ts";
import { parseArgs, getDirectory } from "./utils.ts";
import { Command } from "./types";
import { Shell } from "../shell";
import prettyMs from "pretty-ms";

const packagesLib: typeof PackagesType = p;

const BAR_WIDTH = 20;

function renderProgressBar(progress: number): string {
    const filled = Math.round(progress * BAR_WIDTH);
    const empty = BAR_WIDTH - filled;
    return "[" + "#".repeat(filled) + ".".repeat(empty) + "]";
}

function formatProgress(progress: any): string {
    const items = Array.isArray(progress) ? progress : [progress];

    if (items.length === 0) return "";

    const maxNameLen = items.reduce(
        (max, item) => Math.max(max, (item.name || "").length),
        0
    );
    const maxStageLen = items.reduce(
        (max, item) => Math.max(max, (item.stage || "").length),
        0
    );

    return items
        .map((item) => {
            let line = "";

            // Stage
            const stage = item.stage || "";
            line += `[${stage}]`.padEnd(maxStageLen + 3); // +3 for brackets and space

            // Name
            const name = item.name || "";
            line += name.padEnd(maxNameLen + 1); // +1 for space

            // Bar
            if (item.progress !== undefined) {
                line += renderProgressBar(item.progress) + " ";
                line += `${Math.round(item.progress * 100)}%`;
            }

            return line;
        })
        .join("\n");
}

export const packages: Command = {
    name: "npm",
    description: "Manage packages",
    execute: async (args: string[], shell: Shell) => {
        const command = args[0];
        const { flags, positionals } = parseArgs(args.slice(1));
        const directory = getDirectory(flags);

        switch (command) {
            case "i":
            case "install":
                // install [-D/--save-dev] [packages...]
                const saveDev = !!(flags["D"] || flags["save-dev"]);

                const startTime = Date.now();
                const emitter = await packagesLib.install(
                    directory,
                    saveDev,
                    ...positionals
                );

                let lastLineCount = 0;
                const progressMap = new Map<string, any>();

                emitter.on("progress", (progress) => {
                    // Move cursor up if we previously wrote lines
                    if (lastLineCount > 0) {
                        shell.write(`\x1b[${lastLineCount}A`);
                    }

                    const items = Array.isArray(progress)
                        ? progress
                        : [progress];
                    let isResolving = false;
                    let doneEvent = null;

                    items.forEach((item) => {
                        if (item.stage === "Done") {
                            doneEvent = item;
                            return;
                        }

                        if (item.stage === "Resolving") {
                            isResolving = true;
                            return;
                        }

                        if (item.name) {
                            const current = progressMap.get(item.name) || {};
                            const updated = { ...current, ...item };
                            if (updated.progress === 1) {
                                progressMap.delete(item.name);
                            } else {
                                progressMap.set(item.name, updated);
                            }
                        }
                    });

                    // Clear lines from cursor down
                    shell.write("\x1b[J");

                    if (doneEvent) {
                        const duration = Date.now() - startTime;
                        shell.writeln(
                            `Installed ${doneEvent.progress} packages in ${prettyMs(duration)}`
                        );
                        lastLineCount = 0;
                        return;
                    }

                    let output = "";
                    if (progressMap.size === 0 && isResolving) {
                        output = "Resolving...";
                    } else {
                        output = formatProgress(
                            Array.from(progressMap.values())
                        );
                    }

                    if (output) {
                        shell.writeln(output);
                        lastLineCount = output.split("\n").length;
                    } else {
                        lastLineCount = 0;
                    }
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
