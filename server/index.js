const express = require("express");
const expressWs = require("express-ws");
const pty = require("node-pty");
const os = require("os");

const shell = os.platform() === "win32" ? "powershell.exe" : "zsh";
const app = express();
expressWs(app);
const termMap = new Map();
function nodeEnvBind() {
  //绑定当前系统 node 环境
  // console.log('env==>', process.env);
  const term = pty.spawn(shell, ["--login"], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env,
  });
  termMap.set(term.pid, term);
  return term;
}
//解决跨域问题
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});
//服务端初始化
app.post("/terminal", (req, res) => {
  const term = nodeEnvBind(req);
  res.send(term.pid.toString());
  res.end();
});

app.get("/run", (req, res) => {
  const pid = parseInt(req.query.pid);
  const term = termMap.get(pid);
  term.write("cd /cloud-studio/frontend/apps/editor-server-club/cloud-studio/frontend/apps/editor-server-club/terminal/app \n");
  res.send("ok");
  res.end();
});

const initCharacter = "➜"
let initFlag = false;
app.ws("/socket/:pid", (ws, req) => {
  const pid = parseInt(req.params.pid);
  const term = termMap.get(pid);

  term.on("data", function (data) {
    if (data.includes(initCharacter)) {
      initFlag = true
    }
    if (!initFlag) return
    ws.send(data)
  });

  ws.on("message", (data) => {
    console.log(typeof data === "string");
    term.write(data);
  });
  ws.on("close", function () {
    console.log('关闭==》', pid);
    term.kill();
    termMap.delete(pid);
  });
});
app.listen(65310, "127.0.0.1");
