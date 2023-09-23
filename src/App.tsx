import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { useCallback, useEffect, useRef } from "react";
import { AttachAddon } from "xterm-addon-attach";
import { FitAddon } from "xterm-addon-fit";
import axios from "axios";
import "./App.css";

const socketURL = "ws://127.0.0.1:65310/socket/";
function WebTerminal() {
  //初始化当前系统环境，返回终端的 pid，标识当前终端的唯一性
  const initSysEnv = async (term: Terminal) =>
    await axios
      .post("http://127.0.0.1:65310/terminal")
      .then((res) => res.data)
      .catch((err) => {
        throw new Error(err);
      });

  const onRun = async (pid: Terminal) =>
    await axios
      .get("http://127.0.0.1:65310/run", { params: { pid } })
      .then((res) => res.data)
      .catch((err) => {
        throw new Error(err);
      });

  useEffect(() => {
    var term = new Terminal({
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      // fontWeight: 400,
      // fontSize: 14,
      // rows: 200,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    //@ts-ignore
    term.open(document.getElementById("terminal"));
    term.focus();
    fitAddon.fit();

    window.onresize = () => {
      fitAddon.fit();
    };

    async function asyncInitSysEnv() {
      const pid = await initSysEnv(term),
        ws = new WebSocket(socketURL + pid),
        attachAddon = new AttachAddon(ws);
      term.loadAddon(attachAddon);
      onRun(pid);
    }
    asyncInitSysEnv();
    return () => {
      //组件卸载，清除 Terminal 实例
      term.dispose();
    };
  }, []);
  return <div id="terminal"></div>;
}

export default WebTerminal;
