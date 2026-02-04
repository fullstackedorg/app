import "./style.css";
import "@xterm/xterm/css/xterm.css";
import "fullstacked";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from '@xterm/addon-fit';

const main = document.createElement("main");
document.body.append(main);

const terminal = new Terminal({
    cursorBlink: true,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    fontSize: 14,
});

const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);
terminal.open(main);
fitAddon.fit();

window.addEventListener('resize', fitAddon.fit.bind(fitAddon));

let command = '';

function prompt() {
    terminal.write(`\r\n${process.cwd()} $ `);
}

terminal.writeln('Welcome to the Web Shell');
prompt();

terminal.onData(e => {
    switch (e) {
        case '\r': // Enter
            handleCommand(command);
            command = '';
            break;
        case '\u007F': // Backspace (DEL)
            if (command.length > 0) {
                terminal.write('\b \b');
                command = command.substring(0, command.length - 1);
            }
            break;
        default: // Print all other characters for now
            if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
                command += e;
                terminal.write(e);
            }
    }
});

function handleCommand(cmd: string) {
    terminal.writeln(''); // Move to new line
    terminal.writeln(`Command received: ${cmd}`);
    prompt();
}