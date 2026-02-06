import type { Duplex } from "../../core/internal/bundle/lib/bridge/duplex";
import { Shell } from "../shell";

export function parseArgs(args: string[]) {
    const flags: Record<string, string | boolean> = {};
    const positionals: string[] = [];

    const consume = (index: number): [string, number] => {
        const value = args[index];
        if (value.startsWith('"') || value.startsWith("'")) {
            const quote = value[0];
            if (value.endsWith(quote) && value.length > 1) {
                return [value.slice(1, -1), index];
            }

            const parts = [value];
            let nextIndex = index + 1;
            while (nextIndex < args.length) {
                const part = args[nextIndex];
                parts.push(part);
                if (part.endsWith(quote)) {
                    break;
                }
                nextIndex++;
            }

            let full = parts.join(" ");
            if (full.endsWith(quote)) {
                full = full.slice(1, -1);
            } else {
                full = full.slice(1);
            }
            return [full, nextIndex];
        }
        return [value, index];
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith("-")) {
            const key = arg.replace(/^-+/, "");
            if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
                const [val, nextIdx] = consume(i + 1);
                flags[key] = val;
                i = nextIdx;
            } else {
                flags[key] = true;
            }
        } else {
            const [val, nextIdx] = consume(i);
            positionals.push(val);
            i = nextIdx;
        }
    }
    return { flags, positionals };
}

export function getDirectory(flags: Record<string, string | boolean>) {
    return (flags["directory"] as string) || process.cwd();
}

export async function runDuplex(
    duplexPromise: Duplex | Promise<Duplex>,
    shell: Shell
) {
    const duplex = await duplexPromise;
    let lastByte: number = null;
    if (duplex && duplex[Symbol.asyncIterator]) {
        for await (const chunk of duplex) {
            shell.write(chunk);
            lastByte = chunk.at(-1);
        }
        return lastByte;
    } else {
        shell.writeln(JSON.stringify(duplex, null, 2));
    }
}
