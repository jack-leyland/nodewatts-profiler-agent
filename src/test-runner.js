const port = process.env.TEST_SOCKET_PORT; // Nodewatts processs will inject these vars
const testCmd = process.env.TESTCMD.split(' ')
const zmqModule = process.env.ZMQ_INSTALLED_PATH
var zmq = require(zmqModule);
const { spawn } = require('child_process');
const events = require('events');
const { exit } = require("process");
const emitter = new events.EventEmitter();

var cmd = testCmd[0]
testCmd.splice(0,1)
var args = testCmd

async function testRunner() {
  const sock = new zmq.Request();
  sock.connect("tcp://127.0.0.1:" + String(port));
  console.log("Test runner started.")
  await sock.send("start");
  const [res] = await sock.receive();
  if (res.toString() === "start-success") {
    console.log("Test Runner received successful start msg from server. Running test suite")
    testProc = spawn(cmd, args);
    testProc.on('exit', (exitCode) => {
      if (parseInt(exitCode) !== 0) {
          console.error("Nodewatts Test Runner: Exited with return code " + String(exitCode))
      }
      emitter.emit('testExit');
    });
    emitter.on('testExit', async function() {
      console.log("Tests completed. Sending stop message to server")
      await sock.send("stop")
      const [res] = await sock.receive();
      if (res.toString() === "stop-success") {
        console.log("Received stop success message from server. Exiting")
        exit(0)
      };
    })
  }
}

testRunner();