//Profiler logic
//clean this up!
const nodeWattsTmpPath = path.join(__dirname, 'nodeWattsTmp');
try {
  fs.mkdirSync(nodeWattsTmpPath);
} catch (err) {
  fs.rmSync(nodeWattsTmpPath, { recursive: true, force: true });
  fs.mkdirSync(nodeWattsTmpPath);
}

var nodeWattsPID = process.pid;
fs.writeFileSync('./nodeWattsTmp/PID.txt', nodeWattsPID.toString());

//inititialize profiler socket server
async function nodeWattsRunProfilerHandler() {
  const nodeWattsSock = new zmq.Reply();
  await nodeWattsSock.bind("tcp://127.0.0.1:" + nodeWattsPort);
  for await (const [msg] of nodeWattsSock) {
    if (msg.toString() === "start") {
    nodeWattsV8Profiler.startProfiling(nodeWattsTitle, true);
    await nodeWattsSock.send("start-success")
    } else if (msg.toString() === "stop") {
      const nodeWattsProfile = nodeWattsV8Profiler.stopProfiling(nodeWattsTitle);
      const nodeWattsProfileRelPath = `./nodeWattsTmp/${nodeWattsTitle}.cpuprofile`;
      profile.export( async function (error, result) {
        if (error) {console.log(error); return;}
        fs.writeFileSync(nodeWattsProfileRelPath, result); 
        nodeWattsProfile.delete();
        await sock.send("stop-success");
        await saveProfileToDB(__dirname + nodeWattsProfileRelPath.substring(1))
        .then(() => {
          console.log("Profile Saved to DB. Exiting...")
          process.exit();
        })
        .catch((err) => {
          console.log("DB SAVE ERROR: " + err )
          process.exit();
        });
      }
    )}
  }
}
nodeWattsRunProfilerHandler();