import { NodeSSH } from "node-ssh";
import { Command } from "./types";
import { Shell } from "../shell";

export const ssh: Command = {
    name: "ssh",
    description: "SSH into a remote server",
    execute: async (
        args: string[],
        shell: Shell,
        onCancel: (handler: () => void) => void
    ) => {
        const target = args.find((arg) => !arg.startsWith("-"));
        if (!target) {
            shell.writeln("usage: ssh [user@]host");
            return 1;
        }

        let [username, host] = target.split("@");
        if (!host) {
            host = username;
            username = ""; // Will be prompted or use default
        }

        const ssh = new NodeSSH();

        try {
            const auth = await shell.requestUsernamePassword(host, username);
            if (!auth || !auth.username) {
                shell.writeln("Username required");
                return 1;
            }

            username = auth.username;
            const { password } = auth;

            shell.writeln(`Connecting to ${username}@${host}...`);

            await ssh.connect({
                host,
                username,
                password
            });

            const shellStream = await ssh.requestShell();

            onCancel(() => {
                shellStream.end();
                ssh.dispose();
            });

            shellStream.on("data", (data: Buffer) => {
                shell.write(data.toString());
            });

            shellStream.on("error", (err: Error) => {
                shell.writeln(`SSH Error: ${err.message}`);
            });

            shell.captureInput((data) => {
                shellStream.write(data);
            });

            return new Promise<number>((resolve) => {
                shellStream.on("close", () => {
                    shell.releaseInput();
                    ssh.dispose();
                    shell.writeln(`\r\nConnection to ${host} closed.`);
                    resolve(0);
                });
            });
        } catch (err: any) {
            shell.writeln(`SSH Connection failed: ${err.message}`);
            ssh.dispose();
            return 1;
        }
    }
};
