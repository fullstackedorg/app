export function splitShellArgs(line: string): string[] {
    const args: string[] = [];
    let current = "";
    let inQuote: string | null = null;
    let escaped = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (escaped) {
            current += char;
            escaped = false;
            continue;
        }

        if (char === "\\") {
            escaped = true;
            continue;
        }

        if (inQuote) {
            if (char === inQuote) {
                inQuote = null;
            } else {
                current += char;
            }
        } else {
            if (char === '"' || char === "'") {
                inQuote = char;
            } else if (char === " ") {
                if (current) {
                    args.push(current);
                    current = "";
                }
            } else {
                current += char;
            }
        }
    }

    if (current) {
        args.push(current);
    }

    return args;
}
