
var nodeWattsPID = process.pid;

nodeWattsFs.writeFileSync(nodeWattsPath+'/PID.txt', nodeWattsPID.toString());

//inititialize profiler socket server
async function nodeWattsRunProfilerHandler() {
  const nodeWattsSock = new nodeWattsZmq.Reply();
  await nodeWattsSock.bind("tcp://127.0.0.1:" + nodeWattsPort);
  for await (const [msg] of nodeWattsSock) {
    if (msg.toString() === "start") {
    nodeWattsV8Profiler.startProfiling(nodeWattsTitle, true);
    await nodeWattsSock.send("start-success")
    } else if (msg.toString() === "stop") {
      const nodeWattsProfile = nodeWattsV8Profiler.stopProfiling(nodeWattsTitle);
      const nodeWattsProfilePath = `${nodeWattsPath}/${nodeWattsTitle}.cpuprofile`;
      profile.export( async function (error, result) {
        if (error) {console.log(error); return;}
        nodeWattsFs.writeFileSync(nodeWattsProfileRelPath, result); 
        nodeWattsProfile.delete();
        await nodeWattsSock.send("stop-success");
        await nodeWattsSaveToDB(nodeWattsProfilePath)
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