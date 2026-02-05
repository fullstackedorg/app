import { Terminal } from "@xterm/xterm";

export function printInColumns(terminal: Terminal, items: string[]) {
    if (items.length === 0) return;
    const maxLen = Math.max(...items.map((i) => i.length));
    const colWidth = maxLen + 2; // padding
    const cols = Math.floor(terminal.cols / colWidth) || 1;

    let output = "";
    for (let i = 0; i < items.length; i++) {
        output += items[i].padEnd(colWidth);
        if ((i + 1) % cols === 0 && i !== items.length - 1) {
            output += "\r\n";
        }
    }
    terminal.write(output);
    if (items.length > 0 && output.length > 0) {
        // Check if we need a newline.
        // If we just wrote output, the cursor is at the end of the last item.
        // We definitely want a newline after the listing.
        // But wait, if we write \r\n, cursorX becomes 0.
        // Then prompt() will NOT add another newline. Correct.
        // Only issue is if prompt() sees cursorX=0, it prints prompt on that new line.
        // So:
        // ls -> files... -> cursor at end of last file -> prompt()
        // If prompt adds \r\n only if cursorX > 0:
        // Case 1: ls output ends middle of line. prompt adds \r\n. OK.
        // Case 2: ls output ends at exactly end of line (wrap). prompt sees cursorX=0? No normally xterm wraps.

        // The user says "ls command is missing a new line".
        // This likely means `ls` output comes, then prompt appears IMMEDIATELY after it on the same line?
        // Yes, because `printInColumns` writes string. Cursor stays at end of last file.
        // `shell.prompt` checks `cursorX`. If `cursorX > 0`, it adds `\r\n`.
        // So prompt should be on next line.

        // Maybe `cursorX` is not updating synchronously or `terminal.write` is async/buffered?
        // xterm `write` is generally sync in JS execution but rendering is async. `buffer` state should be updated?
        // Actually `terminal.write` might be async in terms of processing parser.

        // Safer bet: explicit newline in `ls` command or `printInColumns`?
        // If I add `\r\n` in `printInColumns`, then `cursorX` becomes 0. `prompt` sees 0, prints prompt.
        // Result: Files... \n Prompt. This is desired.

        terminal.write("\r\n");
    }
}
