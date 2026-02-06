//@ts-ignore
import b from "bundle";
import type BundleType from "../../core/internal/bundle/lib/bundle";
import { Command } from "./types";
import { Shell } from "../shell";
import path from "path";

const bundleLib: typeof BundleType = b;

function formatMessage(msg: any): string {
    if (typeof msg === "string") return msg.replace(/\n/g, "\r\n");
    if (msg.text) {
        let out = msg.text;
        if (msg.location) {
            out += `\r\n    at ${msg.location.file}:${msg.location.line}:${msg.location.column}`;
            if (msg.location.lineText) {
                out += `\r\n    ${msg.location.lineText}\r\n    ${" ".repeat(msg.location.column)}^`;
            }
        }
        return out;
    }
    return JSON.stringify(msg, null, 2).replace(/\n/g, "\r\n");
}

export const bundle: Command = {
    name: "bundle",
    description: "Bundle the project",
    execute: async (args: string[], shell: Shell) => {
        const paths = (args || []).map((p) => path.resolve(process.cwd(), p));
        const result = await bundleLib.bundle(...paths);
        result.Warnings?.forEach((w) => shell.writeln(formatMessage(w)));
        result.Errors?.forEach((e) => shell.writeln(formatMessage(e)));
    }
};
