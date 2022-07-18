//Profiling deps
var zmq = require("zeromq");
const nodeWattsV8Profiler = require('v8-profiler-next');
const fs = require("fs");
var nodeWattsSaveToDB = require(process.env.PATH_TO_DB_SERVICE).ingestFile;
const nodeWattsTitle = String(process.env.PROFILE_TITLE);
const nodeWattsPort = String(process.env.TEST_SOCKET_PORT);
v8Profiler.setGenerateType(1);
