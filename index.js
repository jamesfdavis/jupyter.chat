// import log from "log";
// import yargs from "yargs";
// import { hideBin } from "yargs/helpers";
import Robot from "./src/robot.js";
import path from "path";

let robot = new Robot();

function loadScripts() {


  let script = path.resolve(".", "scripts");

  robot.load(script);
  // robot.load(pathResolve('.', 'scripts'))
  // robot.load(pathResolve('.', 'src', 'scripts'))

  // loadHubotScripts()
  // loadExternalScripts()

  // options.scripts.forEach((scriptPath) => {
  //   if (scriptPath[0] === '/') {
  //     return robot.load(scriptPath)
  //   }

  //   robot.load(pathResolve('.', scriptPath))
  // })
}

robot.adapter.once("connected", loadScripts);
robot.run();
