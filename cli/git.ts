//@ts-ignore
import g from "git";
import type GitType from "../../core/internal/bundle/lib/git/index.ts";
import { parseArgs, getDirectory, runDuplex } from "./utils.ts";
import { Command } from "./types";
import type { Shell } from "../shell";
import { green, red, yellow } from "../utils/colors";

export const gitLib: typeof GitType = g;

function formatStatus(status: any): string {
    const lines: string[] = [];
    if (status.head && status.head.branch) {
        lines.push(`On branch ${status.head.branch}`);
    } else {
        lines.push(`HEAD detached at ${red(status.head.hash.substring(0, 7))}`);
    }

    const { staged, unstaged, untracked } = status;
    const hasStaged =
        staged &&
        (staged.modified?.length ||
            staged.deleted?.length ||
            staged.added?.length);
    const hasUnstaged =
        unstaged && (unstaged.modified?.length || unstaged.deleted?.length);
    const hasUntracked = untracked?.length;

    if (hasStaged) {
        lines.push("Changes to be committed:");
        lines.push('  (use "git restore --staged <file>..." to unstage)');
        if (staged.modified) {
            staged.modified.forEach((f: string) =>
                lines.push(green(`\tmodified:   ${f}`))
            );
        }
        if (staged.deleted) {
            staged.deleted.forEach((f: string) =>
                lines.push(green(`\tdeleted:    ${f}`))
            );
        }
        if (staged.added) {
            staged.added.forEach((f: string) =>
                lines.push(green(`\tnew file:   ${f}`))
            );
        }
        lines.push("");
    }

    if (hasUnstaged) {
        lines.push("Changes not staged for commit:");
        lines.push(
            '  (use "git add/rm <file>..." to update what will be committed)'
        );
        lines.push(
            '  (use "git restore <file>..." to discard changes in working directory)'
        );
        if (unstaged.modified) {
            unstaged.modified.forEach((f: string) =>
                lines.push(red(`\tmodified:   ${f}`))
            );
        }
        if (unstaged.deleted) {
            unstaged.deleted.forEach((f: string) =>
                lines.push(red(`\tdeleted:    ${f}`))
            );
        }
        lines.push("");
    }

    if (hasUntracked) {
        lines.push("Untracked files:");
        lines.push(
            '  (use "git add <file>..." to include in what will be committed)'
        );
        untracked.forEach((f: string) => lines.push(red(`\t${f}`)));
        lines.push("");
    }

    if (!hasStaged && !hasUnstaged && !hasUntracked) {
        lines.push("nothing to commit, working tree clean");
    }

    return lines.join("\n");
}

function formatLog(log: any[]): string {
    return log
        .map((commit) => {
            return `${yellow("commit " + commit.hash)}
Author: ${commit.author.name} <${commit.author.email}>
Date:   ${commit.date}

    ${commit.message}`;
        })
        .join("\n\n");
}

function formatBranch(branches: any[]): string {
    return branches
        .map((branch) => {
            if (branch.isHead) {
                return green(`* ${branch.name}`);
            }
            return `  ${branch.name}`;
        })
        .join("\n");
}

function formatTags(tags: any[]): string {
    return tags.map((tag) => yellow(tag.name)).join("\n");
}

export const git: Command = {
    name: "git",
    description: "Run git commands",
    execute: async (
        args: string[],
        shell: Shell,
        onCancel: (handler: () => void) => void
    ) => {
        const command = args[0];
        const { flags, positionals } = parseArgs(args.slice(1));
        const directory = getDirectory(flags);

        try {
            switch (command) {
                case "init":
                    if (positionals.length < 1)
                        throw new Error("Usage: git init <url>");
                    shell.writeln(await gitLib.init(directory, positionals[0]));
                    break;
                case "status":
                    shell.writeln(formatStatus(await gitLib.status(directory)));
                    break;
                case "add":
                    if (positionals?.length < 1)
                        throw new Error("Usage: git add <path>");
                    shell.writeln(await gitLib.add(directory, positionals[0]));
                    break;

                case "log":
                    shell.writeln(formatLog(await gitLib.log(directory)));
                    break;
                case "clone":
                    if (positionals.length < 1)
                        throw new Error("Usage: git clone <url>");
                    await runDuplex(
                        gitLib.clone(positionals[0], directory),
                        shell
                    );
                    break;
                case "commit":
                    const message =
                        (flags["m"] as string) || (flags["message"] as string);
                    const authorName = flags["name"] as string;
                    const authorEmail = flags["email"] as string;
                    if (!message)
                        throw new Error("Usage: git commit -m <message>");

                    const author = {
                        name: authorName || "FullStacked User",
                        email: authorEmail || "user@fullstacked.org"
                    };

                    shell.writeln(
                        await gitLib.commit(directory, message, author)
                    );
                    break;
                case "pull":
                    await runDuplex(gitLib.pull(directory), shell);
                    break;
                case "push":
                    await runDuplex(gitLib.push(directory), shell);
                    break;
                case "reset":
                    shell.writeln(
                        await gitLib.reset(
                            directory,
                            !!flags["hard"],
                            ...positionals
                        )
                    );
                    break;
                case "branch":
                    shell.writeln(formatBranch(await gitLib.branch(directory)));
                    break;
                case "tags":
                    shell.writeln(formatTags(await gitLib.tags(directory)));
                    break;
                case "checkout":
                    if (positionals.length < 1)
                        throw new Error("Usage: git checkout <ref>");
                    const create = !!(
                        flags["b"] ||
                        flags["create"] ||
                        flags["B"]
                    );
                    await runDuplex(
                        gitLib.checkout(directory, positionals[0], create),
                        shell
                    );
                    break;
                case "merge":
                    if (positionals.length < 1)
                        throw new Error("Usage: git merge <branch>");
                    shell.writeln(
                        JSON.stringify(
                            await gitLib.merge(directory, positionals[0]),
                            null,
                            2
                        )
                    );
                    break;
                case "restore":
                    if (positionals?.length < 1)
                        throw new Error("Usage: git restore <paths>");
                    shell.writeln(
                        await gitLib.restore(directory, ...positionals)
                    );
                    break;
                default:
                    shell.writeln(`Unknown git command: ${command}`);
            }
        } catch (e: any) {
            shell.writeln(e.message);
        }
    }
};
