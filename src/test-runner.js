const port = process.env.TEST_SOCKET_PORT; // Nodewatts processs will inject these vars
const testCmdArgs = process.env.TESTCMD.split(' ')
var zmq = require("nw-zeromq");
const { spawn } = require('child_process');
const events = require('events');
const { exit } = require("process");
const emitter = new events.EventEmitter();

async function testRunner() {
  const sock = new zmq.Request();
  sock.connect("tcp://127.0.0.1:" + String(port));
  await sock.send("start");
  const [res] = await sock.receive();
  if (res.toString() === "start-success") {
    testProc = spawn('npm', testCmdArgs);
    testProc.on('exit', (exitCode) => {
      if (parseInt(exitCode) !== 0) {
          console.log(exitCode)
      }
      emitter.emit('testExit');
    });
    emitter.on('testExit', async function() {
      await sock.send("stop")
      const [res] = await sock.receive();
      if (res.toString() === "stop-success") exit();
    })
  }
}

testRunner();