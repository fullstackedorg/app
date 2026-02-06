import { Shell } from "../shell";

export interface Command {
    name: string;
    description?: string;
    execute: (args: string[], shell: Shell) => void | Promise<void>;
}
