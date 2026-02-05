import "./style.css";
import "@xterm/xterm/css/xterm.css";
import "fullstacked";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { Shell } from "./shell";

const main = document.createElement("main");
document.body.append(main);

const terminal = new Terminal({ cursorBlink: true });
const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);
terminal.open(main);
fitAddon.fit();

window.addEventListener("resize", fitAddon.fit.bind(fitAddon));

const shell = new Shell(terminal);

terminal.writeln("Welcome to FullStacked");
shell.prompt();

terminal.onData((e) => {
    shell.handleInput(e);
});
